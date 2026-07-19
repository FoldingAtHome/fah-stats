<script>
// Active project list. Like the React site: resolve an assignment server via
// /as, then read its public/beta project summary directly (CORS-open AS host).
import {api}     from '../api'
import {num}     from '../format'
import StatTable from '../components/stat-table.vue'
import LoadState from '../components/load-state.vue'

const days = v => v == null ? '' : (v / 86400).toLocaleString(undefined, {maximumFractionDigits: 2})

export default {
  name: 'Project',
  components: {StatTable, LoadState},
  data() {return {loading: true, error: null, rows: []}},
  computed: {
    columns() {
      return [
        {field: 'id', label: 'Project ID', width: '8em', link: row => '/project/' + row.id},
        {field: 'ws', label: 'Server IP', width: '12em'},
        {field: 'atoms', label: 'Atoms', width: '8em', align: 'right', format: num},
        {field: 'timeout', label: 'Timeout (days)', width: '10em', align: 'right', format: days, hideMobile: true},
        {field: 'deadline', label: 'Deadline (days)', width: '10em', align: 'right', format: days, hideMobile: true},
        {field: 'credit', label: 'Base Credit', width: '10em', align: 'right', format: num},
        {field: 'type', label: 'Core', width: '7em'},
        {field: 'contact', label: 'Contact', hideMobile: true}
      ]
    }
  },
  created() {
    document.title = 'Project Statistics — Folding@home'
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.error   = null
      try {
        const as  = await api('/as')
        const all = as && as[0] ? await api('https://' + as[0] + '/api/project/summary') : []
        this.rows = (all || []).filter(p => p.beta || p.public)
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  h1 Project Statistics
  load-state(:loading="loading" :error="error" :empty="!rows.length" @retry="load")
    stat-table(:columns="columns" :rows="rows")
</template>
