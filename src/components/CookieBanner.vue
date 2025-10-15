<template>
  <div v-if="!consentGiven && showCookieBanner" class="cookie-banner">
    <b-notification type="is-light" :closable="false" class="cookie-notification">
      <div class="cookie-text">
        <p>
          Diese Website verwendet Cookies, um richtig zu funktionieren. Bitte
          akzeptiere unsere
          <a @click="app.openPrivacy" target="_blank">Datenschutzerklärung</a>.
        </p>
      </div>
      <div class="mt-4 cookie-actions">
        <b-button @click="showCookieBanner = false" type="is-light">Ablehnen</b-button>
        <b-button @click="acceptCookies" type="is-primary" class="ml-2">Zustimmen</b-button>
      </div>
    </b-notification>
  </div>
</template>

<script>
// stores
import { useAppStore } from '@/stores/App'
// GA bootstrap
import { bootstrap } from 'vue-gtag'

export default {
  name: 'CookieBanner',
  setup () {
    const app = useAppStore()
    return {
      app
    }
  },
  data () {
    return {
      consentGiven: false,
      showCookieBanner: true,
    }
  },
  mounted () {
    // Check if the user has previously accepted the banner
    const accepted = localStorage.getItem('cookieConsent')
    if (accepted === 'true') {
      this.consentGiven = true
      this.$gtag.optIn()
    }
  },
  methods: {
    acceptCookies() {
      localStorage.setItem('cookieConsent', 'true')
      this.consentGiven = true
      this.$gtag.optIn()
    },
  },
};
</script>

<style>
.cookie-banner {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
}

.cookie-notification {
  justify-content: space-between;
  padding: 10px 20px;
}

.cookie-text {
  max-width: 80%;
  text-align: left;
}

</style>
