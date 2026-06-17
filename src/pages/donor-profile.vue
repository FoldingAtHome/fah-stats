<script>
import {api}     from '../api'
import LoadState from '../components/load-state.vue'
import DonorCard from '../components/donor-card.vue'

export default {
  name: 'DonorProfile',
  components: {LoadState, DonorCard},
  props: {id: String, name: String},
  data() {return {loading: true, error: null, donor: null}},
  computed: {notFound() {return this.error && this.error.status === 404}},
  watch: {id() {this.load()}, name() {this.load()}},
  created() {this.load()},
  methods: {
    async load() {
      this.loading = true
      this.error   = null
      this.donor   = null
      try {
        const path = this.id != null
          ? '/uid/' + encodeURIComponent(this.id)
          : '/user/' + encodeURIComponent(this.name)
        this.donor     = await api(path)
        document.title = (this.donor.name || 'Donor') + ' — Folding@home'
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  load-state(:loading="loading" :error="notFound ? null : error" @retry="load")
    .message-page(v-if="notFound")
      h2 Donor not found
      router-link(to="/donor") Back to donors
    donor-card(v-else-if="donor" :donor="donor")
</template>
