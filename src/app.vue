<script>
import AppHeader from './components/app-header.vue'
import AppFooter from './components/app-footer.vue'

export default {
  name: 'App',
  components: {AppHeader, AppFooter},
  watch: {
    // The inner region scrolls, not the window, so reset it on navigation
    // (router scrollBehavior only moves the window).
    $route() {const el = this.$refs.scroll; if (el) el.scrollTop = 0}
  }
}
</script>

<template lang="pug">
#app
  app-header
  .scroll-area(ref="scroll")
    main.page
      router-view
    app-footer
</template>

<style lang="stylus">
#app
  display flex
  flex-direction column
  height 100vh
  height 100dvh
  overflow hidden
.app-header
  flex none
.scroll-area
  flex 1 1 auto
  overflow-y auto
  scrollbar-gutter stable
.page
  max-width $maxWidth
  margin 0 auto
  padding $padLoose $gap
  width 100%
</style>
