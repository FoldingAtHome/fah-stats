<script>
import {api}     from '../api'
import LoadState from '../components/load-state.vue'

const ext = html => (html || '').replace(/<a /g,
  '<a target="_blank" rel="noopener noreferrer" ')
const setupUrl = url => url && !url.includes('http') ? 'https://' + url : url

export default {
  name: 'ProjectProfile',
  components: {LoadState},
  props: {id: {type: String, required: true}},
  data() {return {loading: true, error: null, project: null}},
  computed: {
    notFound()     {return this.error && [400, 404].includes(this.error.status)},
    isError()      {return this.project && this.project.status === 'error'},
    mdescription() {return ext(this.project && this.project.mdescription)},
    description()  {return ext(this.project && this.project.description)},
    url()          {return setupUrl(this.project && this.project.url)}
  },
  watch: {id() {this.load()}},
  created() {this.load()},
  methods: {
    async load() {
      this.loading = true
      this.error   = null
      this.project = null
      try {
        const res = await api('/project/' + encodeURIComponent(this.id))
        this.project   = Array.isArray(res) ? res[0] : res
        document.title = 'Project ' + this.id + ' — Folding@home'
      } catch (e) {this.error = e}
      finally {this.loading = false}
    }
  }
}
</script>

<template lang="pug">
section
  .panel
    h1 Project {{id}}
    load-state(:loading="loading" :error="notFound ? null : error" @retry="load")
      .message-page(v-if="notFound")
        h2 Project not found
        router-link(to="/project") Back to projects
      .project-card(v-else-if="project")
        p.empty(v-if="isError") The owner has not added a description for this project.
        template(v-else)
          .ribbon cause: {{project.cause}}
          h2 {{project.manager}}
          p.institution {{project.institution}}
          h3 Summary
          .summary
            .desc(v-if="project.mdescription" v-html="mdescription")
            img.mthumb(v-if="project.mthumb" :src="'data:image/png;base64,' + project.mthumb" alt="")
          h3 Details
          .desc(v-html="description")
          p(v-if="project.url")
            a(:href="url" target="_blank" rel="noopener") Project Website
</template>

<style lang="stylus">
.project-card
  .ribbon                        // protrudes past the panel's left edge
    position relative
    left -2rem
    background $accentDim
  .institution
    color $fgMuted
  h3
    border-bottom 1px solid $border
    padding-bottom 0.3em
  .summary
    display flex
    flex-wrap wrap
    gap $padLoose
    align-items flex-start
    .desc
      flex 1 1 320px
    .mthumb
      max-width 100%
      width 12rem
      height auto
  .desc
    img
      max-width 100%
      height auto
</style>
