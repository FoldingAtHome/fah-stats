<script>
// Tools: WU-status, recent-CPUs, bonus-status and passkey lookups stacked under
// one page. /tools?q=<name> looks up a donor's CPUs (WU results link here).
import Wu         from './wu.vue'
import Cpu        from './cpu.vue'
import Bonus      from './bonus.vue'
import Getpasskey from './getpasskey.vue'

export default {
  name: 'Tools',
  components: {Wu, Cpu, Bonus, Getpasskey},
  created() {document.title = 'Tools — Folding@home'}
}
</script>

<template lang="pug">
section.tools
  h1 Tools
  .tool
    h2 WU Status
    wu
  .tool
    h2 Recent CPUs
    cpu
  .tool
    h2 Bonus Status
    bonus
  .tool
    h2 Get Passkey
    getpasskey
</template>

<style lang="stylus">
.tools .tool
  background $bgSurface
  border 1px solid $border
  border-radius $radiusLg
  padding $pad $padLoose $padLoose
  margin-bottom $gap
  h2
    margin-top 0
</style>
