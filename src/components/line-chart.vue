<script>
// Hand-rolled, dependency-free SVG timeseries chart. Caller supplies points as
// [{x, y}] (x/y numeric) plus optional axis formatters. Responsive width is
// measured from the container; height is fixed via prop. Upgrade path is µPlot
// behind this same contract if richer interactivity is ever needed.
export default {
  name: 'LineChart',
  props: {
    series:  {type: Array, default: () => []},      // [{x, y}]
    height:  {type: Number, default: 240},
    color:   {type: String, default: null},         // defaults to $accent via CSS
    xFormat: {type: Function, default: x => String(x)},
    yFormat: {type: Function, default: y => String(y)}
  },
  data() {return {width: 600, hover: -1}},
  computed: {
    pad()   {return {t: 12, r: 12, b: 22, l: 64}},
    plotW() {return Math.max(0, this.width - this.pad.l - this.pad.r)},
    plotH() {return Math.max(0, this.height - this.pad.t - this.pad.b)},
    bounds() {
      const xs = this.series.map(p => p.x), ys = this.series.map(p => p.y)
      let xmin = Math.min(...xs), xmax = Math.max(...xs)
      let ymin = Math.min(...ys), ymax = Math.max(...ys)
      if (xmax === xmin) xmax = xmin + 1
      if (ymax === ymin) {ymax += 1; ymin -= 1}        // flat line -> center it
      return {xmin, xmax, ymin, ymax}
    },
    pts() {
      if (this.series.length < 2) return []
      const {xmin, xmax, ymin, ymax} = this.bounds
      const {t, l} = this.pad
      return this.series.map(p => ({
        x: p.x, y: p.y,
        sx: l + (p.x - xmin) / (xmax - xmin) * this.plotW,
        sy: t + (1 - (p.y - ymin) / (ymax - ymin)) * this.plotH
      }))
    },
    polyline() {return this.pts.map(p => p.sx.toFixed(1) + ',' + p.sy.toFixed(1)).join(' ')},
    xticks() {
      const n = Math.min(5, this.series.length)
      if (n < 2) return []
      const out = []
      for (let i = 0; i < n; i++) {
        const p = this.pts[Math.round(i * (this.series.length - 1) / (n - 1))]
        if (p) out.push({x: p.sx, label: this.xFormat(p.x)})
      }
      return out
    },
    hoverPt() {return this.hover >= 0 ? this.pts[this.hover] : null}
  },
  mounted() {this.measure(); window.addEventListener('resize', this.measure)},
  beforeUnmount() {window.removeEventListener('resize', this.measure)},
  methods: {
    measure() {if (this.$refs.wrap) this.width = this.$refs.wrap.clientWidth},
    onMove(e) {
      if (!this.pts.length) return
      const mx = e.clientX - this.$refs.wrap.getBoundingClientRect().left
      let best = 0, bd = Infinity
      this.pts.forEach((p, i) => {const d = Math.abs(p.sx - mx); if (d < bd) {bd = d; best = i}})
      this.hover = best
    },
    onLeave() {this.hover = -1},
    lineStyle() {return this.color ? {stroke: this.color} : null},
    dotStyle()  {return this.color ? {fill: this.color} : null}
  }
}
</script>

<template lang="pug">
.line-chart(ref="wrap")
  svg(v-if="pts.length" :width="width" :height="height" @mousemove="onMove" @mouseleave="onLeave")
    text.axis(:x="pad.l - 8" :y="pad.t + 4" text-anchor="end") {{yFormat(bounds.ymax)}}
    text.axis(:x="pad.l - 8" :y="height - pad.b" text-anchor="end") {{yFormat(bounds.ymin)}}
    line.grid(:x1="pad.l" :y1="pad.t" :x2="pad.l" :y2="height - pad.b")
    line.grid(:x1="pad.l" :y1="height - pad.b" :x2="width - pad.r" :y2="height - pad.b")
    text.axis(v-for="(t, i) in xticks" :key="i" :x="t.x" :y="height - pad.b + 14" text-anchor="middle") {{t.label}}
    polyline.line(:points="polyline" :style="lineStyle()")
    template(v-if="hoverPt")
      line.cross(:x1="hoverPt.sx" :y1="pad.t" :x2="hoverPt.sx" :y2="height - pad.b")
      circle.dot(:cx="hoverPt.sx" :cy="hoverPt.sy" r="3" :style="dotStyle()")
      text.read(:x="hoverPt.sx" :y="pad.t + 2" :text-anchor="hoverPt.sx > width / 2 ? 'end' : 'start'") {{xFormat(hoverPt.x)}} · {{yFormat(hoverPt.y)}}
  .empty(v-else) No data
</template>

<style lang="stylus">
.line-chart
  width 100%
  svg
    display block
    width 100%
  .empty
    padding $padLoose
    text-align center
    color $fgDim
  .line
    fill none
    stroke $accent
    stroke-width 2
  .grid
    stroke $border
    stroke-width 1
  .axis
    fill $fgMuted
    font-size 11px
  .cross
    stroke $borderHover
    stroke-width 1
    stroke-dasharray 3 3
  .dot
    fill $accent
  .read
    fill $fg
    font-size 11px
</style>
