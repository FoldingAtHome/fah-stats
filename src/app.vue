<script>
import AppHeader from './components/app-header.vue'
import AppFooter from './components/app-footer.vue'

export default {
  name: 'App',
  components: {AppHeader, AppFooter}
}
</script>

<template lang="pug">
#app
  app-header
  main.page
    router-view
  app-footer
</template>

<style lang="stylus">
.page
  max-width $maxWidth
  margin 0 auto
  padding $padLoose $gap
  width 100%
</style>
