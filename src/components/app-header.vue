<script>
const nav = [
  {to: '/',           label: 'Home'},
  {to: '/team',       label: 'Team'},
  {to: '/donor',      label: 'Donor'},
  {to: '/project',    label: 'Project'},
  {to: '/os',         label: 'OS'},
  {to: '/server',     label: 'Servers'},
  {to: '/wu',         label: 'WU'},
  {to: '/cpu',        label: 'CPUs'},
  {to: '/credit-log', label: 'Credit Log'}
]

export default {name: 'AppHeader', data: () => ({nav})}
</script>

<template lang="pug">
header.app-header
  .bar
    router-link.brand(to="/") Folding@home
    nav.nav
      router-link(v-for="n in nav" :key="n.to" :to="n.to") {{n.label}}
</template>

<style lang="stylus">
.app-header
  background $bgChrome
  border-bottom 1px solid $border
  .bar
    max-width $maxWidth
    margin 0 auto
    padding $pad $gap
    display flex
    align-items center
    gap $padLoose
  .brand
    color $fg
    font-weight 700
    font-size 1.15em
    &:hover
      color $accent
      text-decoration none
  .nav
    display flex
    flex-wrap wrap
    gap $gap
    a
      color $fgMuted
      padding 0.15em 0
      border-bottom 2px solid transparent
      &:hover
        color $fg
        text-decoration none
      &.router-link-exact-active
        color $accent
        border-bottom-color $accent

  @media (max-width: $bpMobile)
    .bar
      flex-direction column
      align-items flex-start
      gap $pad
</style>
