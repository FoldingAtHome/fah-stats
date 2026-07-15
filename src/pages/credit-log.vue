<script>
import {api}         from '../api'
import {num, toDate} from '../format'
import LineChart     from '../components/line-chart.vue'
import LoadState     from '../components/load-state.vue'

export default {
  name: 'CreditLog',
  components: {LineChart, LoadState},
  data() {return {loading: true, error: null, credits: [], hours: []}},
  computed: {
    xFmt() {
      return x => new Date(x).toLocaleDateString(undefined,
        {month: 'short', day: 'numeric', hour: 'numeric'})
    },
    yFmt() {return num}
  },
  created() {
    document.title = 'Credit Log — Folding@home'
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.error   = null
      try {
        const log = await api('/credit-log')
        this.credits = []
        this.hours   = []
        for (const r of log || []) {
          const d = toDate(r.ts)
          if (!d) continue
          this.credits.push({x: d.getTime(), y: r.credits})
          if (r.time != null) this.hours.push({x: d.getTime(), y: Math.round(r.time / 3600)})
        }
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section.credit-log
  h1 Credit Log
  load-state(:loading="loading" :error="error" :empty="!credits.length" @retry="load")
    .panel
      h2 Credits logged per hour
      line-chart(:series="credits" :x-format="xFmt" :y-format="yFmt")
      p.note The number of credits entered into the database per hour.
    .panel
      h2 Compute hours logged per hour
      line-chart(:series="hours" :x-format="xFmt" :y-format="yFmt")
      p.note The number of compute hours logged per hour.
</template>

<style lang="stylus">
.note
  color $fgMuted
  margin 0.4em 0 $padLoose
.credit-log .panel + .panel
  margin-top $gap
.credit-log .panel .note:last-child
  margin-bottom 0
</style>
