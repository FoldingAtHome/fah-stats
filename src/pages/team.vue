<script>
import {api}       from '../api'
import Leaderboard from '../components/leaderboard.vue'

export default {
  name: 'Team',
  components: {Leaderboard},
  created() {document.title = 'Teams — Folding@home'},
  methods: {
    search(pattern) {return api('/team', {q: pattern})},
    link(row) {return '/team/' + (row.team ?? row.id)},
    logo(row) {return row.logo}
  }
}
</script>

<template lang="pug">
leaderboard(
  title="Top Teams"
  name-label="Team"
  all-endpoint="/team"
  monthly-endpoint="/team/monthly"
  search-label="Lookup Team Name"
  row-key="team"
  :search="search"
  :link="link"
  :logo="logo")
</template>
