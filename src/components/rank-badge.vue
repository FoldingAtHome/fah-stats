<script>
// "Top 100 / 1K / 10K Ranked {kind}" ribbon, matching the original site's tiers.
// Positioned by the containing .profile-card.
const TIERS = [
  {max: 100,   pos: '100', color: '#ad8b00'},
  {max: 1000,  pos: '1K',  color: '#fe6215'},
  {max: 10000, pos: '10K', color: '#1890ff'}
]

export default {
  name: 'RankBadge',
  props: {rank: Number, kind: {type: String, default: 'Donor'}},
  computed: {
    tier() {
      if (typeof this.rank !== 'number' || this.rank < 1) return null
      return TIERS.find(t => this.rank <= t.max) || null
    }
  }
}
</script>

<template lang="pug">
span.ribbon(v-if="tier" :style="{background: tier.color}") Top {{tier.pos}} Ranked {{kind}}
</template>
