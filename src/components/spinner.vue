<script>
export default {
  name: 'Spinner',
  props: {size: {type: [Number, String], default: 20}}
}
</script>

<template lang="pug">
span.spinner(:style="{width: size + 'px', height: size + 'px'}")
</template>

<style lang="stylus">
@keyframes spin
  to
    transform rotate(360deg)
.spinner
  display inline-block
  border 2px solid $borderInput
  border-top-color $accent
  border-radius 50%
  animation spin 0.7s linear infinite
</style>
