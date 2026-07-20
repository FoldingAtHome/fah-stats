<script>
import {Sun, Moon}        from 'lucide-vue-next'
import theme, {toggleTheme} from '../store/theme'

const nav = [
  {to: '/',           label: 'Home'},
  {to: '/team',       label: 'Team'},
  {to: '/donor',      label: 'Donor'},
  {to: '/project',    label: 'Project'},
  {to: '/os',         label: 'OS'},
  {to: '/server',     label: 'Servers'},
  {to: '/tools',      label: 'Tools'},
  {to: '/credit-log', label: 'Credits'}
]

export default {
  name: 'AppHeader',
  data: () => ({nav}),
  computed: {
    icon()  {return theme.name === 'dark' ? Sun : Moon},
    label() {return theme.name === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  },
  methods: {toggleTheme}
}
</script>

<template lang="pug">
header.app-header
  .bar
    router-link.brand(to="/")
      img.logo(src="/logo-2.png" alt="Folding@home")
      span.stats Statistics
    nav.nav
      router-link(v-for="n in nav" :key="n.to" :to="n.to") {{n.label}}
    button.theme-toggle(@click="toggleTheme" :aria-label="label" :title="label")
      component(:is="icon" :size="18")
</template>

<style lang="stylus">
.app-header
  background $bgChrome
  border-bottom 1px solid $accentDim
  .bar
    position relative
    max-width $maxWidth
    margin 0 auto
    padding $pad $gap
    display flex
    align-items center
    gap $padLoose
  .brand
    display inline-flex
    align-items center
    &:hover
      text-decoration none
    .logo
      height 50px
      margin-right $gap
      padding-right $gap
      border-right 1px solid $accent
    .stats
      font-family $fontDisplay
      font-size 2rem
      color $chromeFg
      text-transform uppercase
      line-height 1
  .nav
    display flex
    flex-wrap wrap
    gap $gap
    a
      color $chromeFgMuted
      padding 0.15em 0
      border-bottom 2px solid transparent
      &:hover
        color $chromeFg
        text-decoration none
      &.router-link-exact-active
        color $accent
        border-bottom-color $accent
  .theme-toggle
    margin-left auto
    background transparent
    border none
    padding $padTight
    color $chromeFgMuted
    cursor pointer
    display inline-flex
    align-items center
    &:hover
      color $chromeFg
      background rgba(255, 255, 255, 0.1)

  @media (max-width: $bpMobile)
    .bar
      flex-direction column
      align-items flex-start
      gap $pad
    .nav                         // full width so items wrap instead of overflowing
      width 100%
      gap $pad
      font-size 0.85rem
    .theme-toggle
      position absolute
      top $pad
      right $gap
      margin-left 0
</style>
