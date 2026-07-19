<script>
// Shared donor/team leaderboard: Monthly (default) + All-Time tabs, server-side
// search on All-Time, and a monthly rank-change column computed by diffing the
// previous month. donor.vue / team.vue supply the entity-specific config.
import {api, monthlyRanked} from '../api'
import {num, compact}       from '../format'
import StatTable            from './stat-table.vue'
import LoadState            from './load-state.vue'
import MonthPicker          from './month-picker.vue'
import TeamLogo             from './team-logo.vue'

export default {
  name: 'Leaderboard',
  components: {StatTable, LoadState, MonthPicker, TeamLogo},
  props: {
    title:           {type: String, required: true},   // page h1
    nameLabel:       {type: String, required: true},   // name column header
    allEndpoint:     {type: String, required: true},
    monthlyEndpoint: {type: String, required: true},
    searchLabel:     {type: String, default: 'Search'},
    search:          {type: Function, required: true}, // q => Promise<rows>
    link:            {type: Function, required: true}, // row => path
    logo:            {type: Function, default: null},  // row => logo URL (teams)
    rowKey:          {type: String, required: true},   // key for rank-change match
    extraColumns:    {type: Array, default: () => []}  // extra all-time columns
  },
  data() {
    const now = new Date()
    return {
      tab:    'monthly',                                // 'monthly' | 'alltime'
      period: {month: now.getMonth() + 1, year: now.getFullYear()},
      query: '', mode: 'like', searched: false,         // mode: exact|prefix|suffix|like
      loading: true, error: null, rows: []
    }
  },
  computed: {
    columns() {
      const name = {field: 'name', label: this.nameLabel, slot: 'name'}
      const credit = {field: 'credit', label: 'Credit', width: '9em', align: 'right', format: compact, title: num}
      const wus = {field: 'wus', label: 'WUs', width: '8em', align: 'right', format: compact, title: num, hideMobile: true}
      if (this.tab === 'monthly')
        return [
          {label: 'Rank', width: '5em', align: 'right', format: (v, row) => row._rank},
          {label: 'Change', width: '6em', align: 'left', slot: 'change'},
          name, credit, wus
        ]
      return [
        {label: 'Rank', width: '5em', align: 'right', format: (v, row, i) => row.rank ?? i + 1},
        name, credit, wus, ...this.extraColumns
      ]
    }
  },
  watch: {
    tab() {this.load()},
    period: {deep: true, handler() {if (this.tab === 'monthly') this.load()}}
  },
  created() {this.load()},
  methods: {
    setTab(t) {if (t !== this.tab) this.tab = t},
    doSearch()    {this.searched = !!this.query.trim(); this.load()},
    clearSearch() {this.query = ''; this.searched = false; this.load()},
    async load() {
      this.loading = true
      this.error   = null
      try {
        this.rows = this.tab === 'monthly' ? await this.loadMonthly() : await this.loadAllTime()
      } catch (e) {this.error = e}
      finally {this.loading = false}
    },
    pattern(q) {
      if (this.mode === 'prefix') return q + '%'
      if (this.mode === 'suffix') return '%' + q
      if (this.mode === 'like')   return '%' + q + '%'
      return q                                  // exact
    },
    async loadAllTime() {
      const q = this.query.trim()
      const data = this.searched && q
        ? await this.search(this.pattern(q))
        : await api(this.allEndpoint)
      return (data || []).map(r => ({...r, credit: r.credit ?? r.score}))
    },
    loadMonthly() {return monthlyRanked(this.monthlyEndpoint, this.period, this.rowKey)}
  }
}
</script>

<template lang="pug">
section
  h1 {{title}}
  .tabs.modes
    button(:class="{active: tab === 'monthly'}" @click="setTab('monthly')") Monthly
    button(:class="{active: tab === 'alltime'}" @click="setTab('alltime')") All-Time
  .toolbar
    month-picker(v-if="tab === 'monthly'" v-model="period")
    form.search(v-else @submit.prevent="doSearch")
      select(v-model="mode")
        option(value="exact") is exactly
        option(value="prefix") starts with
        option(value="suffix") ends with
        option(value="like") is like
      input(v-model="query" :placeholder="searchLabel")
      button(type="submit") Search
      button.ghost(v-if="searched" type="button" @click="clearSearch") Clear
    span.count {{rows.length}}
  load-state(:loading="loading" :error="error" :empty="!rows.length" @retry="load")
    stat-table(:columns="columns" :rows="rows")
      template(v-slot:name="{row}")
        team-logo(v-if="logo" :logo="logo(row)" :fallback="false")
        router-link(:to="link(row)") {{row.name}}
      template(v-slot:change="{row}")
        span.change.new(v-if="row._prev == null") NEW
        span.change.up(v-else-if="row._change > 0" :title="'Previous: #' + row._prev") ▲ {{row._change}}
        span.change.down(v-else-if="row._change < 0" :title="'Previous: #' + row._prev") ▼ {{-row._change}}
        span.change.same(v-else title="No change") –
</template>

<style lang="stylus">
.tabs
  margin-bottom $pad
</style>
