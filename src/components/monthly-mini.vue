<script>
// Compact monthly leaderboard for the home panel: rank, change, name, points.
// Shows the full month (scrollable) rather than a fixed top-N.
import {monthlyRanked} from '../api'
import {num, compact}  from '../format'
import StatTable        from './stat-table.vue'
import LoadState        from './load-state.vue'

export default {
  name: 'MonthlyMini',
  components: {StatTable, LoadState},
  props: {
    endpoint:  {type: String, required: true},
    rowKey:    {type: String, required: true},
    link:      {type: Function, required: true},
    maxHeight: {type: String, default: '60vh'}
  },
  data() {return {loading: true, error: null, rows: []}},
  computed: {
    columns() {
      return [
        {label: 'Rank', width: '4em', align: 'right', format: (v, r) => r._rank},
        {label: 'Change', width: '5em', align: 'center', slot: 'change'},
        {field: 'name', label: 'Name', slot: 'name'},
        {field: 'credit', label: 'Points', width: '6em', align: 'right', format: compact, title: num}
      ]
    }
  },
  created() {this.load()},
  methods: {
    async load() {
      this.loading = true
      this.error   = null
      const now = new Date()
      try {
        this.rows = await monthlyRanked(this.endpoint,
          {month: now.getMonth() + 1, year: now.getFullYear()}, this.rowKey)
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
load-state(:loading="loading" :error="error" :empty="!rows.length" @retry="load")
  stat-table(:columns="columns" :rows="rows" :max-height="maxHeight")
    template(v-slot:name="{row}")
      router-link(:to="link(row)") {{row.name}}
    template(v-slot:change="{row}")
      span.change.new(v-if="row._prev == null") NEW
      span.change.up(v-else-if="row._change > 0" :title="'Prev: #' + row._prev") ▲ {{row._change}}
      span.change.down(v-else-if="row._change < 0" :title="'Prev: #' + row._prev") ▼ {{-row._change}}
      span.change.same(v-else) –
</template>
