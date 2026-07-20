<script>
import {num, ago, compact} from '../format'
import RankBadge       from './rank-badge.vue'
import StatTable       from './stat-table.vue'
import {Trophy, Pencil} from 'lucide-vue-next'

export default {
  name: 'DonorCard',
  components: {RankBadge, StatTable, Trophy, Pencil},
  props: {
    donor:      {type: Object, required: true},
    hasLinks:   Boolean,
    editAction: {type: Function, default: null}
  },
  computed: {
    hasError() {return this.donor.status === 'error'},
    teamColumns() {
      return [
        {field: 'name', label: 'Team', link: row => '/team/' + row.team,
          format: (v, row) => v + ' (' + row.team + ')'},
        {field: 'score', label: 'Points', width: '5.5em', align: 'right', format: compact, title: num},
        {field: 'wus', label: 'WUs', width: '5.5em', align: 'right', format: compact, title: num}
      ]
    }
  },
  methods: {
    num, ago, compact,
    award(type) {
      return 'https://apps.foldingathome.org/awards?user=' + this.donor.id +
        (type ? '&type=' + type : '')
    }
  }
}
</script>

<template lang="pug">
.profile-card.donor-card
  template(v-if="hasError")
    .body
      p.error There is no user with the searched username.
    .foot(v-if="editAction")
      button.ghost(@click="editAction") Edit name
  template(v-else)
    .head
      rank-badge(:rank="donor.rank" kind="Donor")
      span.avatar
        svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round")
          circle(cx="12" cy="12" r="10")
          path(d="M8 14s1.5 2 4 2 4-2 4-2")
          line(x1="9" y1="9" x2="9.01" y2="9")
          line(x1="15" y1="9" x2="15.01" y2="9")
      div
        h2.title
          router-link(v-if="hasLinks" :to="'/donor/name/' + donor.name") {{donor.name}}
          span(v-else) {{donor.name}}
          button.edit-name(v-if="editAction" @click="editAction" title="Change donor" aria-label="Change donor")
            pencil(:size="16")
        .rank Rank #[b {{num(donor.rank)}}] of {{num(donor.users)}}
    .body
      .awards
        a(:href="award('wus')" target="_blank" rel="noopener")
          trophy(:size="15")
          span WUs Award
        a(:href="award()" target="_blank" rel="noopener")
          trophy(:size="15")
          span Points Award
      p #[b(:title="num(donor.score)") {{compact(donor.score)}}] points earned by contributing #[b(:title="num(donor.wus)") {{compact(donor.wus)}}] work units.
      p(v-if="donor.last") Last work unit recorded #[b {{ago(donor.last)}}].
      h3 Active clients
      .active
        p #[b {{num(donor.active_7)}}] within 7 days
        p #[b {{num(donor.active_50)}}] within 50 days
      h3 My Teams
      stat-table(:columns="teamColumns" :rows="donor.teams || []")
</template>

<style lang="stylus">
.donor-card .active
  display grid
  grid-template-columns 1fr 1fr
  max-width 20em
  p
    margin 0
  p:last-child
    text-align right
</style>
