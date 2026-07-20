<script>
// Generic sortable, virtual-scrolling table — the workhorse for every
// leaderboard and member list. Columns:
//   {field, label, width?, align?, format?(v,row,i), link?(row),
//    image?: 'base64'|'url', sortable?: false, hideMobile?: true}
import {thumb} from '../format'

const ROW_H       = 38   // px; MUST equal the tbody td height in <style>
const OVERSCAN    = 8
const VIRTUAL_MIN = 200  // auto-enable virtual scroll past this many rows

// Natural, case-insensitive comparator ("Project 9" before "Project 10").
function compare(a, b) {
  if (a == null) a = ''
  if (b == null) b = ''
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined,
    {numeric: true, sensitivity: 'base'})
}

export default {
  name: 'StatTable',
  props: {
    columns:     {type: Array, required: true},
    rows:        {type: Array, default: () => []},
    rowKey:      {type: [String, Function], default: null},
    defaultSort: {type: Object, default: null},   // {field, dir}
    virtual:     {type: Boolean, default: true},
    pageScroll:  {type: Boolean, default: false}, // virtualize against the page instead of an inner scroll box
    maxHeight:   {type: String, default: null},   // scrollable area height
    rowClass:    {type: Function, default: null},  // row => class
    layout:      {type: String, default: 'fixed'}  // 'fixed' | 'auto' (size to content)
  },
  data() {
    return {
      sortField:      this.defaultSort?.field ?? null,
      sortDir:        this.defaultSort?.dir ?? 1,
      scrollTop:      0,
      viewportHeight: 0,
      isMobile:       false
    }
  },
  computed: {
    // Drop hideMobile columns entirely on mobile — not just display:none them,
    // which would leave table-layout:fixed reserving a phantom column width.
    cols() {return this.isMobile ? this.columns.filter(c => !c.hideMobile) : this.columns},
    sortedRows() {
      if (!this.sortField) return this.rows
      const f = this.sortField, dir = this.sortDir
      return this.rows.slice().sort((a, b) => dir * compare(a[f], b[f]))
    },
    total() {return this.sortedRows.length},
    useVirtual() {return this.virtual && this.total > VIRTUAL_MIN},
    startIndex() {
      if (!this.useVirtual) return 0
      return Math.max(0, Math.floor(this.scrollTop / ROW_H) - OVERSCAN)
    },
    endIndex() {
      if (!this.useVirtual) return this.total
      const visible = Math.ceil((this.viewportHeight || 600) / ROW_H) + OVERSCAN * 2
      return Math.min(this.total, this.startIndex + visible)
    },
    visibleRows() {
      const out = []
      for (let i = this.startIndex; i < this.endIndex; i++)
        out.push({row: this.sortedRows[i], index: i})
      return out
    },
    topPad()    {return this.startIndex * ROW_H},
    bottomPad() {return (this.total - this.endIndex) * ROW_H},
    scrollerStyle() {return this.maxHeight ? {maxHeight: this.maxHeight} : null}
  },
  watch: {
    rows() {                       // dataset changed: reset scroll, re-measure
      this.scrollTop = 0
      if (this.$refs.scroller) this.$refs.scroller.scrollTop = 0
      this.$nextTick(this.measure)
    }
  },
  mounted() {
    // In page-scroll mode the enclosing scroll region drives virtualization;
    // otherwise the inner .scroller does.
    this.scrollEl = this.pageScroll ? this.findScrollParent() : this.$refs.scroller
    this.scrollEl.addEventListener('scroll', this.onScroll, {passive: true})
    window.addEventListener('resize', this.measure)
    this.mq = window.matchMedia('(max-width: 700px)')   // == $bpMobile
    this.isMobile = this.mq.matches
    this.onMq = e => {this.isMobile = e.matches}
    this.mq.addEventListener('change', this.onMq)
    this.measure()
  },
  beforeUnmount() {
    if (this.scrollEl) this.scrollEl.removeEventListener('scroll', this.onScroll)
    if (this.mq) this.mq.removeEventListener('change', this.onMq)
    window.removeEventListener('resize', this.measure)
  },
  methods: {
    findScrollParent() {
      let el = this.$el && this.$el.parentElement
      while (el && el !== document.body) {
        const oy = getComputedStyle(el).overflowY
        if (oy === 'auto' || oy === 'scroll') return el
        el = el.parentElement
      }
      return document.scrollingElement || document.documentElement
    },
    measure() {
      if (!this.scrollEl) return
      this.viewportHeight = this.scrollEl.clientHeight
      this.updateScroll()
    },
    updateScroll() {
      if (this.pageScroll) {
        const top = this.scrollEl.getBoundingClientRect().top
        this.scrollTop = Math.max(0, top - this.$refs.scroller.getBoundingClientRect().top)
      } else this.scrollTop = this.scrollEl.scrollTop
    },
    onScroll() {this.updateScroll()},
    isSortable(col) {return col.field != null && col.sortable !== false},
    onSort(col) {
      if (!this.isSortable(col)) return
      if (this.sortField === col.field) this.sortDir = -this.sortDir
      else {this.sortField = col.field; this.sortDir = 1}
    },
    keyOf(r) {
      const k = this.rowKey
      if (!k) return r.index
      return typeof k === 'function' ? k(r.row) : r.row[k]
    },
    raw(col, row)  {return col.field != null ? row[col.field] : undefined},
    cell(col, r) {
      const v = this.raw(col, r.row)
      return col.format ? col.format(v, r.row, r.index) : (v ?? '')
    },
    imgSrc(col, row) {
      const v = this.raw(col, row)
      return col.image === 'base64' ? thumb(v) : v
    },
    colStyle(col) {return {width: col.width, textAlign: col.align}},
    colClass(col) {return {'hide-mobile': col.hideMobile}}
  }
}
</script>

<template lang="pug">
.stat-table(:class="{virtual: useVirtual, 'layout-auto': layout === 'auto', 'page-scroll': pageScroll}")
  .scroller(ref="scroller" :style="scrollerStyle")
    table
      thead
        tr
          th(v-for="col in cols" :key="col.field || col.label"
             :class="[colClass(col), {sortable: isSortable(col), active: sortField === col.field}]"
             :style="colStyle(col)" @click="onSort(col)")
            span {{col.label}}
            span.sort(v-if="isSortable(col) && sortField === col.field") {{sortDir > 0 ? '▲' : '▼'}}
      tbody
        tr.spacer(v-if="useVirtual && topPad")
          td(:colspan="cols.length" :style="{height: topPad + 'px'}")
        tr(v-for="r in visibleRows" :key="keyOf(r)" :class="[{alt: r.index % 2}, rowClass ? rowClass(r.row) : null]")
          td(v-for="col in cols" :key="col.field || col.label"
             :class="colClass(col)" :style="colStyle(col)")
            slot(v-if="col.slot" :name="col.slot" :row="r.row" :value="raw(col, r.row)" :index="r.index")
            router-link(v-else-if="col.link" :to="col.link(r.row)") {{cell(col, r)}}
            img.thumb(v-else-if="col.image" :src="imgSrc(col, r.row)" alt="")
            span(v-else-if="col.title" :title="col.title(raw(col, r.row), r.row)") {{cell(col, r)}}
            template(v-else) {{cell(col, r)}}
        tr.spacer(v-if="useVirtual && bottomPad")
          td(:colspan="cols.length" :style="{height: bottomPad + 'px'}")
      tfoot(v-if="$slots.summary")
        slot(name="summary")
</template>

<style lang="stylus">
.stat-table
  border 1px solid $border
  overflow hidden
  .scroller
    overflow-x auto
    overflow-y auto
  &.virtual .scroller
    max-height 70vh
  &.page-scroll .scroller
    max-height none
    overflow visible
  table
    table-layout fixed
  &.layout-auto table
    table-layout auto
    width auto
    min-width 100%
  &.layout-auto td
    overflow visible
    text-overflow clip
  thead th
    position sticky
    top 0
    z-index 1
    user-select none
    white-space nowrap
    box-shadow 0 1px 0 $border
    &.sortable
      cursor pointer
      &:hover
        color $fg
    &.active
      color $fg
    .sort
      margin-left 0.3em
      color $accent
  td
    height 38px           // MUST equal ROW_H in <script>
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
  tbody tr.alt td
    background $bgSurface
  tbody tr:hover td
    background $bgHover
  tr.spacer td
    padding 0
    border none
  tfoot td
    font-weight 600
    border-top 2px solid $borderInput

@media (max-width: $bpMobile)
  .stat-table th, .stat-table td
    padding $padTight $padTight
  img.thumb
    height 24px
    width auto
    vertical-align middle

@media (max-width: $bpMobile)
  .stat-table .hide-mobile
    display none
</style>
