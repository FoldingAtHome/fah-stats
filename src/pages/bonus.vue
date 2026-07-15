<script>
// Bonus (passkey) status for a donor: WUs finished/expired and whether the
// current completion ratio qualifies for the return-speed bonus. Matches by
// donor name and/or passkey.
import {api}     from '../api'
import {num}     from '../format'
import StatTable from '../components/stat-table.vue'
import LoadState from '../components/load-state.vue'

export default {
  name: 'Bonus',
  components: {StatTable, LoadState},
  data() {return {user: '', passkey: '', loading: false, searched: false, error: null, records: []}},
  computed: {
    columns() {
      return [
        {field: 'finished', label: 'WUs Finished', align: 'right', format: num},
        {field: 'expired',  label: 'WUs Expired',  align: 'right', format: num},
        {label: '% Finished', align: 'right', format: (v, r) => this.percent(r)},
        {field: 'active', label: 'Bonus Active', align: 'center', format: v => v ? 'Yes' : 'No'}
      ]
    }
  },
  methods: {
    percent(r) {
      const total = r.finished + r.expired
      return total ? (100 * r.finished / total).toFixed(2) + '%' : ''
    },
    async search() {
      const user = this.user.trim(), passkey = this.passkey.trim()
      if (!user && !passkey) return
      this.searched = true
      this.loading  = true
      this.error    = null
      this.records  = []
      try {this.records = await api('/bonus', {user, passkey})}
      catch (e) {this.error = e.message || 'Lookup failed'}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  form.search(@submit.prevent="search")
    input(v-model="user" placeholder="Donor name")
    input(v-model="passkey" placeholder="Passkey")
    button(type="submit") Search
  p.note One row per matching donor/passkey pair.
  load-state(:loading="loading" :error="error" :empty="searched && !records.length"
             empty-text="No records found." @retry="search")
    stat-table(v-if="records.length" :columns="columns" :rows="records" layout="auto")
</template>
