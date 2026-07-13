<script>
// Utilities: hosts the WU-status and recent-CPUs lookups under one tab.
// ?tab=cpu (and ?q=) deep-links the CPU tool (WU results link here).
import Wu  from './wu.vue'
import Cpu from './cpu.vue'

export default {
  name: 'Utils',
  components: {Wu, Cpu},
  data() {return {tab: this.$route.query.tab === 'cpu' ? 'cpu' : 'wu'}},
  watch: {'$route.query.tab'(t) {this.tab = t === 'cpu' ? 'cpu' : 'wu'}},
  created() {document.title = 'Utilities — Folding@home'}
}
</script>

<template lang="pug">
section
  h1 Utilities
  .tabs.modes
    button(:class="{active: tab === 'wu'}" @click="tab = 'wu'") WU Status
    button(:class="{active: tab === 'cpu'}" @click="tab = 'cpu'") Recent CPUs
  wu(v-if="tab === 'wu'")
  cpu(v-else)
</template>
