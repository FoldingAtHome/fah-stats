<script>
// Work-unit status lookup by Project/Run/Clone/Gen. The PRCG field accepts a
// pasted log string (e.g. "Project:10433 (Run 1, Clone 1, Gen 1)").
import {api}         from '../api'
import {num, toDate} from '../format'
import StatTable     from '../components/stat-table.vue'
import LoadState     from '../components/load-state.vue'

const PRCG = /project\D*(\d+)\D*run\D*(\d+)\D*clone\D*(\d+)\D*gen\D*(\d+)/i

export default {
  name: 'Wu',
  components: {StatTable, LoadState},
  data() {
    return {prcg: '', p: '', r: '', c: '', g: '', loading: false, searched: false, error: null, wus: []}
  },
  computed: {
    columns() {
      return [
        {field: 'user', label: 'User', link: row => '/tools?q=' + encodeURIComponent(row.user)},
        {field: 'team', label: 'Team', width: '7em', align: 'right', link: row => '/team/' + row.team},
        {field: 'cpuid', label: 'CPUID', width: '14em', hideMobile: true},
        {field: 'credit', label: 'Credit', width: '8em', align: 'right', format: num},
        {field: 'assign_time', label: 'Assigned', width: '12em', format: this.dt, hideMobile: true},
        {field: 'log_time', label: 'Returned', width: '12em', format: this.dt, hideMobile: true},
        {field: 'credit_time', label: 'Credited', width: '12em', format: this.dt, hideMobile: true},
        {field: 'days', label: 'Days', width: '6em', align: 'right'},
        {field: 'code', label: 'Code', width: '6em'}
      ]
    }
  },
  methods: {
    dt(v) {const d = toDate(v); return d ? d.toLocaleString() : ''},
    parsePRCG() {
      const m = PRCG.exec(this.prcg)
      if (m) {[, this.p, this.r, this.c, this.g] = m; this.prcg = ''}
    },
    async search() {
      this.parsePRCG()
      if (!(this.p !== '' && this.r !== '' && this.c !== '' && this.g !== '')) return
      this.searched = true
      this.loading  = true
      this.error    = null
      this.wus      = []
      try {
        this.wus = await api(`/project/${this.p}/run/${this.r}/clone/${this.c}/gen/${this.g}`)
      } catch (e) {this.error = e.message || 'Lookup failed'}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  form.wu-search(@submit.prevent="search")
    label PRCG
      input(v-model="prcg" placeholder="Project:10433 (Run 1, Clone 1, Gen 1)")
    label Project
      input.sm(v-model="p")
    label Run
      input.sm(v-model="r")
    label Clone
      input.sm(v-model="c")
    label Gen
      input.sm(v-model="g")
    button(type="submit") Search
  load-state(:loading="loading" :error="error" :empty="searched && !wus.length"
             empty-text="Not found." @retry="search")
    stat-table(v-if="wus.length" :columns="columns" :rows="wus")
</template>

<style lang="stylus">
.wu-search
  display flex
  flex-wrap wrap
  align-items flex-end
  gap $pad
  margin-bottom $pad
  label
    display flex
    flex-direction column
    gap 0.2em
    color $fgMuted
    font-size 0.9em
  input.sm
    width 5em
</style>
