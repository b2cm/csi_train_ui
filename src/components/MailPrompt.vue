<template>
	<form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Wie lautet deine <b>E-Mail</b>?</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <p class="is-size-6 mb-4"> So können wir dich über den Status deiner Absicherung informieren. 🙂</p>
        <b-field>
          <b-input
            type="email"
            v-model="user.mail"
            placeholder="max@mustermann.de"
            required>
          </b-input>
        </b-field>
        <b-checkbox v-model="checked"><span>Ich habe die <a class="has-text-link" @click="app.openTerms">AGBs</a> gelesen und akzeptiert.</span></b-checkbox>
      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Abbrechen"
            @click="$emit('close')" />
        <b-button
            label="OK"
            type="is-primary"
            :disabled="!checked"
            @click="confirm()" />
      </footer>
    </div>
  </form>
</template>

<script>
  // stores
  import { useAppStore } from '@/stores/App'
  import { useUserStore } from '@/stores/User'

  export default {
    setup () {
      const app = useAppStore()
      const user = useUserStore()
      return {
        app,
        user
      }
    },
    name: 'MailPrompt',
    data() {
      return {
        checked: false
      }
    },
    methods: {
      confirm() {
        this.$emit('confirm')
      }
    }
  }
</script>
