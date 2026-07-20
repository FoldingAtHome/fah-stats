<script>
import {api, matrixToRows} from '../api'
import {num}              from '../format'
import StatTable          from '../components/stat-table.vue'
import LoadState          from '../components/load-state.vue'

const COLS = ['AMD GPUs', 'NVidia GPUs', 'CPUs', 'TFLOPS', 'x86 TFLOPS']

export default {
  name: 'Os',
  components: {StatTable, LoadState},
  data() {return {loading: true, error: null, rows: [], cols: COLS}},
  computed: {
    columns() {
      return [
        {field: 'OS', label: 'OS', width: '6em'},
        ...COLS.map(c => ({field: c, label: c, align: 'right', format: num}))
      ]
    },
    totals() {
      const t = {}
      for (const c of COLS) t[c] = this.rows.reduce((s, r) => s + (Number(r[c]) || 0), 0)
      return t
    }
  },
  created() {
    document.title = 'OS Statistics — Folding@home'
    this.load()
  },
  methods: {
    num,
    async load() {
      this.loading = true
      this.error   = null
      try {this.rows = matrixToRows(await api('/os'))}
      catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section.os-stats
  h1 OS Statistics
  load-state(:loading="loading" :error="error" :empty="!rows.length" @retry="load")
    stat-table(:columns="columns" :rows="rows")
      template(#summary)
        tr.summary
          td Total
          td(v-for="c in cols" :key="c" style="text-align:right") {{num(totals[c])}}
  p.note CPUs and GPUs which have returned Work Units within the last 3 days are listed by OS. FLOPS per core is estimated.
</template>

<style lang="stylus">
.note
  color $fgMuted
  margin-top $padLoose

// Many narrow numeric columns: let their headers wrap so nothing overflows.
@media (max-width: $bpMobile)
  .os-stats .stat-table thead th
    white-space normal
</style>
