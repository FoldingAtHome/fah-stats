<script>
// Team logo with the React fallback rules: default icon when no logo or a
// foldingathome.org placeholder; upgrade http->https; fall back on load error.
const isDefault = logo => !logo || logo.includes('foldingathome.org')

export default {
  name: 'TeamLogo',
  props: {logo: String},
  data() {return {broken: false}},
  computed: {
    src()     {return (this.logo || '').replace('http:', 'https:')},
    showImg() {return !isDefault(this.logo) && !this.broken}
  },
  methods: {fail() {this.broken = true}}
}
</script>

<template lang="pug">
span.team-logo
  img(v-if="showImg" :src="src" alt="" @error="fail")
  svg(v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round")
    path(d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2")
    circle(cx="9" cy="7" r="4")
    path(d="M22 21v-2a4 4 0 0 0-3-3.87")
    path(d="M16 3.13a4 4 0 0 1 0 7.75")
</template>
