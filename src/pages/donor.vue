<script>
import {api}       from '../api'
import Leaderboard from '../components/leaderboard.vue'

export default {
  name: 'Donor',
  components: {Leaderboard},
  created() {document.title = 'Donors — Folding@home'},
  methods: {
    search(pattern) {return api('/search/user', {query: pattern})},
    link(row) {return '/donor/id/' + row.id}
  }
}
</script>

<template lang="pug">
leaderboard(
  title="Donors"
  name-label="Donor"
  all-endpoint="/user"
  monthly-endpoint="/user/monthly"
  search-label="Lookup Donor Name"
  row-key="id"
  :search="search"
  :link="link")
</template>
