<script>
// Recent CPUs/GPUs for a donor (work returned in the last 90 days). Reachable
// as /cpu?q=<name> (the WU page links here).
import {api}         from '../api'
import {num, toDate} from '../format'
import StatTable     from '../components/stat-table.vue'
import LoadState     from '../components/load-state.vue'

export default {
  name: 'Cpu',
  components: {StatTable, LoadState},
  data() {return {query: '', loading: false, searched: false, error: null, cpus: []}},
  computed: {
    columns() {
      return [
        {field: 'cpuid', label: 'CPUID'},
        {field: 'ip', label: 'IP', hideMobile: true},
        {field: 'team', label: 'Team', align: 'right', link: row => '/team/' + row.team},
        {field: 'slot', label: 'Slot'},
        {field: 'os', label: 'OS'},
        {field: 'credit', label: 'Last Credit', align: 'right', format: num},
        {field: 'got_bonus', label: 'Bonus', align: 'center', format: v => v ? 'Yes' : 'No'},
        {field: 'last', label: 'Last Returned', format: this.dt, hideMobile: true},
        {field: 'project', label: 'Project', align: 'right', link: row => '/project/' + row.project},
        {field: 'run', label: 'Run', align: 'right', hideMobile: true},
        {field: 'clone', label: 'Clone', align: 'right', hideMobile: true},
        {field: 'gen', label: 'Gen', align: 'right', hideMobile: true}
      ]
    }
  },
  created() {
    if (this.$route.query.q) {this.query = this.$route.query.q; this.search()}
  },
  watch: {
    '$route.query.q'(q) {
      if (!q) return
      this.query = q
      this.search()
      this.$el.scrollIntoView({behavior: 'smooth'})
    }
  },
  methods: {
    dt(v) {const d = toDate(v); return d ? d.toLocaleString() : ''},
    async search() {
      const q = this.query.trim()
      if (!q) return
      this.searched = true
      this.loading  = true
      this.error    = null
      this.cpus     = []
      try {this.cpus = await api('/cpus', {query: q})}
      catch (e) {this.error = e.message || 'Lookup failed'}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  form.search(@submit.prevent="search")
    input(v-model="query" placeholder="Donor name")
    button(type="submit") Search
  p.note CPUs and GPUs that have returned work in the last 90 days.
  load-state(:loading="loading" :error="error" :empty="searched && !cpus.length"
             empty-text="No CPUs found." @retry="search")
    stat-table(v-if="cpus.length" :columns="columns" :rows="cpus" layout="auto")

</template>

<style lang="stylus">
.note
  color $fgMuted
  margin $padTight 0 $pad
</style>
