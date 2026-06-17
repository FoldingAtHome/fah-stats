<script>
import MonthlyMini from '../components/monthly-mini.vue'
import DonorLookup from '../components/donor-lookup.vue'

export default {
  name: 'Home',
  components: {MonthlyMini, DonorLookup},
  created() {document.title = 'Folding@home Statistics'},
  methods: {
    donorLink(row) {return '/donor/id/' + row.id},
    teamLink(row)  {return '/team/' + row.team}
  }
}
</script>

<template lang="pug">
section.home
  .intro
    h2.maximize
      span.big MAXIMIZE
      span.ye
        span.your your
        span.effort EFFORT
    .lede
      h2 Set up your team
      p.
        Help Folding@home study proteins at the smallest scales by recruiting your
        friends and family. Tell them about the Folding@home project, and then join
        or start your own team. The more points your team earns, the more we can
        progress research on diseases like COVID-19, Alzheimer's disease, and cancers!
  .panel
    .col
      h2 My Donor Profile
      donor-lookup
    .col
      h2 Top Donors
      monthly-mini(endpoint="/user/monthly" row-key="id" :link="donorLink")
    .col
      h2 Top Teams
      monthly-mini(endpoint="/team/monthly" row-key="team" :link="teamLink")
</template>

<style lang="stylus">
.home
  .intro
    display flex
    flex-wrap wrap
    gap $padLoose
    align-items center
    .lede
      flex 1 1 320px
  .maximize
    line-height 1.1
    margin 0
    .big
      display block
      font-size 3rem
      font-weight 700
    .your
      color $accent
      font-weight 700
      font-size 2.4rem
      margin-right 0.4rem
    .effort
      font-weight 700
      font-size 1.8rem
  .panel
    margin-top $padLoose
    padding $padLoose
    background $bgSurface
    border 1px solid $border
    border-radius $radiusLg
    display grid
    grid-template-columns 1fr 1fr 1fr
    gap $padLoose
    align-items start
    .col
      min-width 0
      h2
        margin-top 0
  @media (max-width: $bpMobile)
    .panel
      grid-template-columns 1fr
    .maximize .big
      font-size 2.2rem
    .maximize .your
      font-size 1.8rem
    .maximize .effort
      font-size 1.4rem
</style>
