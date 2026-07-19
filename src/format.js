// Display formatting shared across tables/cards. The API returns timestamps as
// UTC datetime strings ("2026-06-17 09:00:00") and uses 0 for "never"; we also
// tolerate unix epochs (s or ms) defensively.

// Grouped integer: 1234567 -> "1,234,567"
export function num(v) {
  return v == null || v === '' ? '' : Number(v).toLocaleString()
}

// Compact big number for cards: suffixed values get one decimal (1234567 ->
// "1.2M"), un-suffixed values (< 1000) get none (42 -> "42").
export function compact(v) {
  if (v == null || v === '') return ''
  const n  = Number(v)
  const dp = Math.abs(n) < 1000 ? 0 : 1
  return new Intl.NumberFormat(undefined,
    {notation: 'compact', minimumFractionDigits: dp, maximumFractionDigits: dp}).format(n)
}

// Normalize the API's timestamp shapes to a Date (or null for "never").
export function toDate(v) {
  if (v == null || v === 0 || v === '') return null
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v)
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(v)
  if (m) return new Date(m[1] + 'T' + m[2] + 'Z')   // server time is UTC
  const d = new Date(v)
  return isNaN(d) ? null : d
}

// Localized date, e.g. "Jun 17, 2026"
export function date(v) {
  const d = toDate(v)
  return d ? d.toLocaleDateString(undefined,
    {year: 'numeric', month: 'short', day: 'numeric'}) : ''
}

// Relative time for `last` fields, e.g. "3 days ago"
const UNITS = [
  ['year', 31536000], ['month', 2592000], ['day', 86400],
  ['hour', 3600], ['minute', 60]
]
export function ago(v) {
  const d = toDate(v)
  if (!d) return ''
  const rtf = new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'})
  const s = (Date.now() - d.getTime()) / 1000
  for (const [unit, secs] of UNITS)
    if (Math.abs(s) >= secs) return rtf.format(Math.round(-s / secs), unit)
  return rtf.format(Math.round(-s), 'second')
}

// base64 thumb (no mime prefix) -> data URL
export function thumb(b64) {return b64 ? 'data:;base64,' + b64 : ''}

// Bytes -> "1.2 GB"
export function size(b) {
  b = Number(b)
  if (!b) return ''
  const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let i = 0
  while (b >= 1024 && i < u.length - 1) {b /= 1024; i++}
  return b.toLocaleString(undefined, {maximumFractionDigits: i ? 1 : 0}) + ' ' + u[i]
}

// Seconds -> short largest-unit label: "2y", "1mo", "55d", "3h", "5min", "30s"
const DUR = [['y', 31536000], ['mo', 2592000], ['d', 86400],
  ['h', 3600], ['min', 60], ['s', 1]]
function abbrevDur(s) {
  for (const [name, secs] of DUR) {
    const n = Math.floor(s / secs)
    if (n >= 1) return n + name
  }
  return '0s'
}

// Uptime: short duration; 0/falsy -> "down"
export function duration(s) {
  s = Number(s) || 0
  return s ? abbrevDur(s) : 'down'
}

// Short relative time for "last seen": "now", "5min", "3h", "2d"
export function shortAgo(v) {
  const d = toDate(v)
  if (!d) return ''
  const s = (Date.now() - d.getTime()) / 1000
  return s < 60 ? 'now' : abbrevDur(s)
}
