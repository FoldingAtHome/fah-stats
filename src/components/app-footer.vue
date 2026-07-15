<script>
const links = [
  {href: 'https://foldingathome.org',                  label: 'Folding@home'},
  {href: 'https://github.com/foldingathome/fah-stats', label: 'GitHub'},
  {href: 'https://api.foldingathome.org',              label: 'API'},
  {href: 'https://foldingathome.org/download',         label: 'Download'}
]

export default {name: 'AppFooter', data: () => ({links})}
</script>

<template lang="pug">
footer.app-footer
  .bar
    nav.links
      a(v-for="l in links" :key="l.href" :href="l.href" target="_blank" rel="noopener") {{l.label}}
    span.copy Copyright © Folding@home, 2026
</template>

<style lang="stylus">
.app-footer
  border-top 1px solid $border
  color $fgMuted
  .bar
    max-width $maxWidth
    margin 0 auto
    padding $padLoose $gap
    display flex
    flex-wrap wrap
    align-items center
    justify-content space-between
    gap $pad
  .links
    display flex
    flex-wrap wrap
    gap $gap
    a
      color $fgMuted
      &:hover
        color $fg
        text-decoration none
  .copy
    color $fgDim
</style>
