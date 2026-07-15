<script>
import {num, ago}      from '../format'
import RankBadge       from './rank-badge.vue'
import {Trophy, Pencil} from 'lucide-vue-next'

export default {
  name: 'DonorCard',
  components: {RankBadge, Trophy, Pencil},
  props: {
    donor:      {type: Object, required: true},
    hasLinks:   Boolean,
    editAction: {type: Function, default: null}
  },
  computed: {hasError() {return this.donor.status === 'error'}},
  methods: {
    num, ago,
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
      p I have earned #[b {{num(donor.score)}}] points by contributing #[b {{num(donor.wus)}}] work units.
      p(v-if="donor.last") My work unit was last recorded #[b {{ago(donor.last)}}].
      h3 Active clients
      p #[b {{num(donor.active_50)}}] within 50 days
      p #[b {{num(donor.active_7)}}] within 7 days
      h3 My Teams
      ul.teams
        li(v-for="t in donor.teams" :key="t.team")
          h4: router-link(:to="'/team/' + t.team") {{t.name}} ({{t.team}})
          p Earned #[b {{num(t.score)}}] points by contributing #[b {{num(t.wus)}}] work units.
    .foot
      a(:href="award('wus')" target="_blank" rel="noopener")
        trophy(:size="15")
        span WUs Award
      a(:href="award()" target="_blank" rel="noopener")
        trophy(:size="15")
        span Points Award
</template>
