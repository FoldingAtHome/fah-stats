<script>
import Spinner from './spinner.vue'

export default {
  name: 'LoadState',
  components: {Spinner},
  props: {
    loading:   Boolean,
    error:     {type: [Object, String], default: null},
    empty:     Boolean,
    emptyText: {type: String, default: 'Nothing here yet.'}
  },
  emits: ['retry'],
  computed: {
    errorText() {
      const e = this.error
      return e ? (typeof e === 'string' ? e : e.message || String(e)) : ''
    }
  }
}
</script>

<template lang="pug">
.load-state
  .center(v-if="loading")
    spinner(:size="28")
  .center.error(v-else-if="error")
    p {{errorText}}
    button(@click="$emit('retry')") Retry
  .center.empty(v-else-if="empty")
    p {{emptyText}}
  slot(v-else)
</template>

<style lang="stylus">
.load-state .center
  display flex
  flex-direction column
  align-items center
  gap $pad
  padding $padLoose
  color $fgMuted
.load-state .error p
  color $danger
</style>
