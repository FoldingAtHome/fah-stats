<script>
import {api, matrixToRows} from '../api'
import {num, compact}     from '../format'
import StatTable          from '../components/stat-table.vue'
import LoadState          from '../components/load-state.vue'
import RankBadge          from '../components/rank-badge.vue'
import TeamLogo           from '../components/team-logo.vue'

const setupUrl = url => url && !url.includes('http') ? 'https://' + url : url

export default {
  name: 'TeamProfile',
  components: {StatTable, LoadState, RankBadge, TeamLogo},
  props: {id: {type: String, required: true}},
  data() {return {loading: true, error: null, team: null, members: []}},
  computed: {
    columns() {
      return [
        {label: 'Rank (team)', width: '7em', align: 'right', format: (v, row, i) => i + 1},
        {field: 'rank', label: 'Rank (project)', width: '9em', align: 'right', format: num},
        {field: 'name', label: 'Donor', link: row => '/donor/id/' + row.id},
        {field: 'score', label: 'Score', width: '9em', align: 'right', format: compact, title: num},
        {field: 'wus', label: 'WUs', width: '8em', align: 'right', format: compact, title: num, hideMobile: true}
      ]
    },
    notFound() {return this.error && this.error.status === 404},
    url()      {return setupUrl(this.team && this.team.url)}
  },
  watch: {id() {this.load()}},
  created() {this.load()},
  methods: {
    num,
    award(type) {
      return 'https://apps.foldingathome.org/awards?team=' + this.team.id +
        (type ? '&type=' + type : '')
    },
    async load() {
      this.loading = true
      this.error   = null
      this.team    = null
      this.members = []
      try {
        const [team, members] = await Promise.all([
          api('/team/' + encodeURIComponent(this.id)),
          api('/team/' + encodeURIComponent(this.id) + '/members').catch(() => [])
        ])
        this.team      = team
        this.members   = matrixToRows(members)
        document.title = (team.name || 'Team') + ' — Folding@home'
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
      h2 Team not found
      router-link(to="/team") Back to teams
    template(v-else-if="team")
      .profile-card
        rank-badge(:rank="team.rank" kind="Team")
        .head
          span.avatar
            team-logo(:logo="team.logo")
          div
            h2.title {{team.name}}
            .rank Rank #[b {{num(team.rank)}}]
        .body
          p Team was founded by #[b {{team.founder}}] and has earned #[b {{num(team.score)}}] points by contributing #[b {{num(team.wus)}}] work units.
        .foot
          a(:href="award('wus')" target="_blank" rel="noopener") Team WUs Award
          a(:href="award()" target="_blank" rel="noopener") Team Points Award
          a(v-if="team.url" :href="url" target="_blank" rel="noopener") Team Website
          span.id ID: {{team.id}}
      h2 Members
      stat-table(:columns="columns" :rows="members")
</template>
