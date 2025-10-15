import Vue from 'vue'
import VueCompositionAPI, { createApp, h } from '@vue/composition-api'
import { createPinia, PiniaVuePlugin } from 'pinia'
import Buefy from 'buefy'
import App from './App.vue'
import VueGtag from 'vue-gtag'

Vue.use(VueGtag, {
  config: { id: "G-E2B28QYL98" },
  enabled: false
})

Vue.use(VueCompositionAPI)

// buefy
Vue.use(Buefy, {
  defaultIconPack: 'fas'
})

// pinia
Vue.use(PiniaVuePlugin)
const pinia = createPinia()

const app = createApp({
  pinia,
  render: () => h(App)
})

app.mount('#app')
