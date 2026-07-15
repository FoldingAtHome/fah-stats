// Thin public GET wrapper for the F@h stats API. No auth: every endpoint here
// is unauthenticated. Runtime base URL from window.fahConfig (/config.js), with
// a build-time env fallback for dev.
const cfg = (typeof window !== 'undefined' && window.fahConfig) || {}

export const apiBase =
  cfg.apiUrl || import.meta.env.VITE_API_URL || 'https://api.foldingathome.org'


async function fetchOne(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const err = new Error('HTTP ' + res.status)
    err.status = res.status
    throw err
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

// In-memory GET cache so navigating between pages doesn't refetch. Keyed by full
// URL; entries live for CACHE_TTL (also dedupes concurrent in-flight requests).
// Errors are not cached. Treat results as read-only (shared references).
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

export function clearCache() {cache.clear()}

export async function api(path, params) {
  let url = path.startsWith('http') ? path : apiBase + path   // absolute = AS hosts
  if (params) {
    const q = new URLSearchParams(Object.entries(params)
      .filter(([, v]) => v != null && v !== '')).toString()
    if (q) url += (path.includes('?') ? '&' : '?') + q
  }

  const hit = cache.get(url)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.promise

  const promise = fetchOne(url)
  cache.set(url, {ts: Date.now(), promise})
  try {return await promise}
  catch (e) {cache.delete(url); throw e}   // don't cache failures
}


// Non-GET request (the passkey tool's write). Not cached; surfaces the API's
// {error} body message when present, else falls back to the HTTP status.
export async function apiSend(path, method, body) {
  const url = path.startsWith('http') ? path : apiBase + path
  const res = await fetch(url, {
    method,
    headers: body ? {'Content-Type': 'application/json'} : undefined,
    body:    body ? JSON.stringify(body) : undefined
  })
  const ct   = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const err = new Error((data && data.error) || 'HTTP ' + res.status)
    err.status = res.status
    throw err
  }
  return data
}


// Some endpoints (/os, /team/{id}/members) return a [header, ...rows] matrix.
// Convert to an array of objects keyed by the header row.
export function matrixToRows(m) {
  if (!Array.isArray(m) || m.length < 2) return []
  const head = m[0]
  return m.slice(1).map(r => Object.fromEntries(head.map((k, i) => [k, r[i]])))
}


const prevPeriod = (month, year) =>
  month === 1 ? {month: 12, year: year - 1} : {month: month - 1, year}

// Monthly leaderboard with computed rank-change: fetches the month and the
// previous month, assigns _rank (1-based position), _prev (previous rank) and
// _change (improvement, positive = moved up; _prev null = new this month).
export async function monthlyRanked(endpoint, {month, year}, rowKey) {
  const [cur, prv] = await Promise.all([
    api(endpoint, {month, year}),
    api(endpoint, prevPeriod(month, year)).catch(() => [])
  ])
  const prevMap = {}
  ;(prv || []).forEach((r, i) => {prevMap[r[rowKey]] = i + 1})
  return (cur || []).map((r, i) => {
    const rank = i + 1, prev = prevMap[r[rowKey]]
    return {...r, credit: r.credit ?? r.score, _rank: rank,
      _prev: prev || null, _change: prev ? prev - rank : null}
  })
}
