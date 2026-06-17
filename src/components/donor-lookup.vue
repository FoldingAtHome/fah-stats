<script>
// Home "My Donor Profile": remembers the donor in localStorage, shows the full
// donor card when known, else a lookup form. Mirrors the React MeAndTeams.
import {api}     from '../api'
import DonorCard from './donor-card.vue'

export default {
  name: 'DonorLookup',
  components: {DonorCard},
  data() {return {name: '', donor: null, searched: false, notFound: false}},
  created() {
    const stored = localStorage.getItem('donorName')
    const id     = localStorage.getItem('donorId')
    if (stored) this.fetch('/user/' + encodeURIComponent(stored))
    else if (id) this.fetch('/uid/' + encodeURIComponent(id))
  },
  methods: {
    async fetch(path) {
      this.notFound = false
      try {
        const d = await api(path)
        if (d && d.status !== 'error' && d.name != null) {
          this.donor = d
          localStorage.setItem('donorName', d.name)
          localStorage.setItem('donorId', d.id)
        } else {this.donor = null; this.notFound = this.searched}
      } catch (e) {this.donor = null; this.notFound = this.searched}
    },
    lookup() {
      const n = this.name.trim()
      if (!n) return
      this.searched = true
      this.fetch('/user/' + encodeURIComponent(n))
    },
    clear() {
      localStorage.removeItem('donorName')
      localStorage.removeItem('donorId')
      this.donor    = null
      this.name     = ''
      this.searched = false
      this.notFound = false
    }
  }
}
</script>

<template lang="pug">
.donor-lookup
  donor-card(v-if="donor" :donor="donor" :edit-action="clear" has-links)
  form.search(v-else @submit.prevent="lookup")
    input(v-model="name" placeholder="Look up my Donor Name")
    button(type="submit") Lookup
    span.miss(v-if="notFound") No donor by that name.
</template>

<style lang="stylus">
.donor-lookup .miss
  color $danger
  align-self center
</style>
