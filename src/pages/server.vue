<script>
// Server statistics, ported from fah-web/serverstats: a project-type summary
// plus a detailed per-server table. Fetches /as, then each AS's /api/ws/summary,
// merges work servers by IP, and synthesizes an aggregate row per AS.
import {api}                       from '../api'
import {num, compact, shortAgo, size, duration} from '../format'
import StatTable                   from '../components/stat-table.vue'
import LoadState                   from '../components/load-state.vue'

const rate = v => ((Number(v) || 0) * 3600)
  .toLocaleString(undefined, {maximumFractionDigits: 2}) + '/hr'

function csStatus(s) {return (s.cs || []).some(c => c.accepted) ? 'Yes' : 'No'}
function csTooltip(s) {
  if (!s.cs) return 'No CS.'
  const acc  = s.cs.filter(c => c.accepted).map(c => c.address).join(' ')
  const fail = s.cs.filter(c => !c.accepted).map(c => c.address).join(' ')
  return 'Accepted: ' + acc + '\nFailed: ' + fail
}

function fillServer(s) {
  s.uptime     = s.uptime || 0
  s.type       = s.is_cs && !s.jobs.total ? 'CS' : 'WS'
  s.statusText = s.active ? 'Assign' : (s.offline ? 'Down' : 'Accept')
  s.state      = s.active ? 'active' : (s.offline ? 'offline' : 'accept')
  s.cs_status  = csStatus(s)
  s.cs_tooltip = csTooltip(s)
  s.error_msgs = ''
  s.warning_msgs = ''
  for (const id in s.messages || {}) {
    if (id & 1024) s.error_msgs   += s.messages[id] + '\n'
    if (id & 512)  s.warning_msgs += s.messages[id] + '\n'
  }
  return s
}

function addServers(wsList, map) {
  for (const w of wsList || []) {
    fillServer(w)
    const ip = w.address
    if (!map[ip]) {
      if (w.version !== '0.0') map[ip] = w
    } else {
      map[ip].assign_rate += w.assign_rate
      for (const t in w.types)
        if (!map[ip].types[t]) map[ip].types[t] = w.types[t]
        else map[ip].types[t].rate += w.types[t].rate
    }
  }
}

function asInfo(host, data) {
  const info = {
    host, address: host, type: 'AS', state: 'as', active: true,
    version: data.version, contact: 'N/A', space: null, uptime: data.uptime,
    assign_rate: data.assign_rate, cs_status: 'No', wsCount: (data.ws || []).length,
    has_errors: 0, has_warnings: 0, has_cs: 0, assign: 0, accept: 0, down: 0,
    jobs: {total: 0, public: 0, beta: 0}, types: {}, last_contact: new Date().toISOString()
  }
  for (const w of data.ws || []) {
    if (w.errors)   info.has_errors++
    if (w.warnings) info.has_warnings++
    if (w.cs_status === 'Yes') info.has_cs++
    if (w.statusText === 'Assign') info.assign++
    else if (w.statusText === 'Accept') info.accept++
    else if (w.statusText === 'Down') info.down++
    info.jobs.total  += w.jobs.total
    info.jobs.public += w.jobs.public
    info.jobs.beta   += w.jobs.beta
  }
  return info
}

// Original serverstats default ordering: assign_rate desc, then status
// (active, accept, offline), then type, then assign_rate.
const cmpNum = (a, b) => {
  a = Number(a); b = Number(b)
  if (isNaN(a) && isNaN(b)) return 0
  if (isNaN(a)) return -1
  if (isNaN(b)) return 1
  return a - b
}
const statusRank = s => (s.active ? 0 : 1) + (s.offline ? 10 : 0)
function orderServers(a, b) {
  return cmpNum(b.assign_rate, a.assign_rate)
    || statusRank(a) - statusRank(b)
    || (a.type || '').localeCompare(b.type || '')
    || cmpNum(b.assign_rate, a.assign_rate)
}

function aggregateTypes(servers) {
  const totals = {}
  for (const s of servers)
    for (const t in s.types) {
      const p = s.types[t]
      const o = totals[t] || (totals[t] = {name: t, public: 0, beta: 0, total: 0, assign_rate: 0})
      o.public += p.public
      o.beta   += p.beta
      o.total  += p.total
      o.assign_rate += p.rate
    }
  return Object.values(totals)
}

export default {
  name: 'Server',
  components: {StatTable, LoadState},
  data() {return {loading: true, error: null, servers: [], projectTypes: [], ts: ''}},
  computed: {
    projectColumns() {
      return [
        {field: 'name', label: 'Project Type'},
        {field: 'public', label: 'Public Jobs', width: '9em', align: 'right', format: compact, title: num},
        {field: 'beta', label: 'Beta Jobs', width: '9em', align: 'right', format: compact, title: num},
        {field: 'total', label: 'Total Jobs', width: '9em', align: 'right', format: compact, title: num},
        {field: 'assign_rate', label: 'Assign Rate', width: '9em', align: 'right', format: rate}
      ]
    },
    projectTotals() {
      const t = {public: 0, beta: 0, total: 0, rate: 0}
      for (const p of this.projectTypes) {
        t.public += p.public; t.beta += p.beta; t.total += p.total; t.rate += p.assign_rate
      }
      return t
    },
    serverColumns() {
      return [
        {field: 'host', label: 'Host', slot: 'host'},
        {field: 'type', label: 'Type'},
        {field: 'version', label: 'Version'},
        {field: 'contact', label: 'Contact', hideMobile: true},
        {field: 'assign_rate', label: 'Assign Rate', align: 'right', format: rate},
        {label: 'Errors', align: 'right', slot: 'errors'},
        {label: 'Warnings', align: 'right', slot: 'warnings'},
        {label: 'Has CS', align: 'center', slot: 'cs'},
        {label: 'Status', align: 'center', slot: 'status'},
        {field: '_public', label: 'Public', align: 'right', format: compact, title: num},
        {field: '_beta', label: 'Beta', align: 'right', format: compact, title: num},
        {label: 'Project Types', slot: 'types', hideMobile: true},
        {field: 'space', label: 'Space', align: 'right', format: size, hideMobile: true},
        {field: 'uptime', label: 'Uptime', align: 'right', format: duration, hideMobile: true},
        {field: 'last_contact', label: 'Last Contact', align: 'right', format: shortAgo, hideMobile: true}
      ]
    }
  },
  created() {
    document.title = 'Server Statistics — Folding@home'
    this.load()
  },
  methods: {
    num,
    typeTip(types) {
      return Object.entries(types || {}).map(([t, j]) =>
        t + ' — public: ' + num(j.public) + ', beta: ' + num(j.beta)).join('\n')
    },
    rowClass(row) {return 'srv-' + row.state},
    async load() {
      this.loading = true
      this.error   = null
      try {
        const domains = await api('/as')
        const map = {}, asRows = []
        await Promise.all((domains || []).map(async d => {
          const raw = await api('https://' + d + '/api/ws/summary').catch(() => null)
          if (!raw) return
          const data = structuredClone(raw)   // don't mutate the cached response
          addServers(data.ws, map)
          asRows.push(asInfo(d, data))
        }))
        const ws = Object.values(map)
        this.projectTypes = aggregateTypes(ws).sort((a, b) => b.assign_rate - a.assign_rate)
        this.servers = ws.concat(asRows)
          .map(s => ({...s, _public: s.jobs.public, _beta: s.jobs.beta,
            typeList: Object.keys(s.types || {}).join(', ')}))
          .sort(orderServers)
        this.ts = new Date().toLocaleString()
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section.servers
  h1 Server Statistics
  load-state(:loading="loading" :error="error" :empty="!servers.length" @retry="load")
    p.timestamp Updated {{ts}}
    h2 Server Stats
    .fullbleed
      stat-table(:columns="serverColumns" :rows="servers" :row-class="rowClass" layout="auto")
        template(v-slot:host="{row}")
          a(:href="'http://' + row.host" :title="row.address" target="_blank" rel="noopener") {{row.host}}
        template(v-slot:errors="{row}")
          span(v-if="row.type === 'AS'") #[span.success {{row.has_errors}}]/{{row.wsCount - row.has_errors}}
          span(v-else :class="{danger: row.errors > 0}" :title="row.error_msgs") {{row.errors}}
        template(v-slot:warnings="{row}")
          span(v-if="row.type === 'AS'") #[span.warn {{row.has_warnings}}]/{{row.wsCount - row.has_warnings}}
          span(v-else :class="{warn: row.warnings > 0}" :title="row.warning_msgs") {{row.warnings}}
        template(v-slot:cs="{row}")
          span(v-if="row.type === 'AS'") {{row.has_cs}}/{{row.wsCount - row.has_cs}}
          span(v-else :class="row.cs_status === 'Yes' ? 'success' : 'danger'" :title="row.cs_tooltip") {{row.cs_status}}
        template(v-slot:status="{row}")
          span(v-if="row.type === 'AS'" title="Assign / Accept / Down") #[span.success {{row.assign}}]/#[span.warn {{row.accept}}]/#[span.danger {{row.down}}]
          span(v-else) {{row.statusText}}
        template(v-slot:types="{row}")
          span(:title="typeTip(row.types)") {{row.typeList}}
    h2 Project Type Stats
    stat-table(:columns="projectColumns" :rows="projectTypes")
      template(#summary)
        tr.summary
          td Totals
          td(style="text-align:right") {{num(projectTotals.public)}}
          td(style="text-align:right") {{num(projectTotals.beta)}}
          td(style="text-align:right") {{num(projectTotals.total)}}
          td(style="text-align:right") {{((projectTotals.rate) * 3600).toLocaleString(undefined, {maximumFractionDigits: 2})}}/hr
  p.note Hover Errors/Warnings/Has CS/Project Types for details. Jobs can be both beta and public; available jobs and assign rates are estimates.
</template>

<style lang="stylus">
.servers
  .fullbleed
    margin-left calc(50% - 50vw)
    margin-right calc(50% - 50vw)
    padding 0 $gap
  .timestamp
    color $fgMuted
  .success
    color $success
  .warn
    color $warning
  .danger
    color $danger

  .stat-table
    thead tr > *
      background #ccc
      color #222

    tbody tr
      &.srv-as td
        background #fff
        font-weight 600
      &.srv-active td
        background #eee
      &.srv-accept td
        background #aaa
      &.srv-offline td
        background #666

    tr
      > td, > th
        border 1px solid #000

  .note
    color $fgMuted
    margin-top $padLoose


// Dark-mode equivalents of the status shades (same active→offline progression).
[data-theme="dark"] .servers .stat-table
  thead tr > *
    background #444
    color #ccc

  tbody tr
    &.srv-as td
      background $bgSurface
    &.srv-active td
      background #333
    &.srv-accept td
      background #454545
    &.srv-offline td
      background #555
</style>
