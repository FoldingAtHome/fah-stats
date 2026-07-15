<script>
// Passkey creation/retrieval: submits a donor name + email; the API emails the
// existing passkey or creates one and emails it. The site's sole write action.
import {apiSend} from '../api'

export default {
  name: 'Getpasskey',
  data() {return {name: '', email: '', sending: false, message: '', error: ''}},
  methods: {
    async submit() {
      this.message = ''
      this.error   = ''
      this.sending = true
      try {
        await apiSend('/passkey', 'PUT', {user: this.name.trim(), email: this.email.trim()})
        this.message = 'Passkey sent. Please check your email.'
      } catch (e) {this.error = e.message || 'Request failed'}
      finally {this.sending = false}
    }
  }
}
</script>

<template lang="pug">
section
  p.note.
    Enter a valid email and donor name to receive your passkey. If we already
    have a record, we email it to you; otherwise we create one, store it, and
    email it.
  p.note
    | For more information, see the&nbsp;
    a(href="https://foldingathome.org/faq/stats/" target="_blank" rel="noopener") Passkey FAQ
    | .
  form.search(@submit.prevent="submit")
    input(v-model="name" placeholder="Donor name")
    input(v-model="email" type="email" placeholder="Email" @keyup.enter="submit")
    button(type="submit" :disabled="sending") Get Passkey
  p.message(v-if="message") {{message}}
  p.error(v-if="error") ERROR: {{error}}
</template>

<style lang="stylus">
p.message
  color $success
  margin $pad 0
p.error
  color $danger
  margin $pad 0
</style>
