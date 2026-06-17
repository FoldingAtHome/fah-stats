<script>
// Month + year selector for the monthly leaderboards. v-model is {month, year}
// with month 1-12. Future months are disabled; START_YEAR is a generous floor
// (the API returns [] for months with no data, so over-range is harmless).
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']
const START_YEAR = 2007

export default {
  name: 'MonthPicker',
  props: {modelValue: {type: Object, required: true}},   // {month, year}
  emits: ['update:modelValue'],
  data() {
    const now = new Date()
    return {MONTHS, curYear: now.getFullYear(), curMonth: now.getMonth() + 1}
  },
  computed: {
    years() {
      const out = []
      for (let y = this.curYear; y >= START_YEAR; y--) out.push(y)
      return out
    },
    month: {
      get() {return this.modelValue.month},
      set(m) {this.change(Number(m), this.modelValue.year)}
    },
    year: {
      get() {return this.modelValue.year},
      set(y) {this.change(this.modelValue.month, Number(y))}
    }
  },
  methods: {
    change(month, year) {
      if (year === this.curYear && month > this.curMonth) month = this.curMonth
      this.$emit('update:modelValue', {month, year})
    },
    isFuture(i) {return this.year === this.curYear && i + 1 > this.curMonth}
  }
}
</script>

<template lang="pug">
.month-picker
  select(v-model="month")
    option(v-for="(name, i) in MONTHS" :key="i" :value="i + 1" :disabled="isFuture(i)") {{name}}
  select(v-model="year")
    option(v-for="y in years" :key="y" :value="y") {{y}}
</template>

<style lang="stylus">
.month-picker
  display inline-flex
  gap $padTight
</style>
