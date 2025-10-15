<template>
  <div>
    <div v-if="
      user.hasMetaMask &&
      user.hasMetaMaskConnected &&
      user.network != null &&
      user.address != null">
    <p class="subtitle is-6"></p>
    <b-message type="is-info" has-icon>
      Danke für deine Teilnahme am Alphatest! Zum Testen brauchst du keine echte Kryptowährung, sondern kannst unseren Test-Token verwenden. 🙂
    </b-message>
    <b-field label="1. Token in MetaMask hinzufügen">
      <a class="button is-light" v-on:click="onAddToken">
        <span>
          <b-image class="is-24x24" :src="metamaskIcon"></b-image>
        </span>
        <span class="ml-2">
          {{ tokenAddress }}
        </span>
        <span class="ml-3">
          <b-icon pack="far" icon="clone" type="is-dark"></b-icon>
        </span>
      </a>
    </b-field>
    <b-field label="2. Token erhalten">
      <a class="button is-light" :class="{'is-loading': faucetLoading}" @click="onRequestToken" :disabled="!canRequestToken">
        <span> 
          <b-icon v-if="!canRequestToken && !faucetLoading" pack="fas" icon="check" type="is-success"></b-icon>
          <b-image v-else class="is-24x24" :src="metamaskIcon"></b-image>
        </span>
        <span class="ml-2">100 Test-EUR anfordern</span>
        <b-icon pack="far" icon="clone" type="is-dark"></b-icon>
      </a>
    </b-field>
    <b-field label="3. Zugfahrt absichern">
      <a class="button is-light" @click="() => {app.stagedTab = 1}">
        <span>Los gehts!</span>
        <b-icon pack="fas" icon="arrow-right" type="is-dark"></b-icon>
      </a>
    </b-field>
  </div>
  <div v-else>
    <b-message type="is-info" has-icon>
      Verbinde deine Wallet mit dem Button oben rechts, um fortzufahren. 🙂
    </b-message>
  </div>
  </div>
</template>

<script>
// assets
import metamaskIconUrl from '@/assets/metamask.png'

// stores
import { useUserStore } from '@/stores/User'
import { useAppStore } from '@/stores/App'

// env
const env = import.meta.env

export default {
  name: 'TokenFaucet',
  setup () {
    const user = useUserStore()
    const app = useAppStore()
    return {
      user,
      app
    }
  },
  data () {
    return {
      tokenAddress: env.VITE_ERC20EURO_CONTRACT_ADDRESS,
      canRequestToken: true,
      faucetLoading: false,
      metamaskIcon: metamaskIconUrl
    }
  },
  methods: {
    async onAddToken () {
      if (!this.user.hasMetaMask) {
        window.location.href = 'https://metamask.io/'
      } else {
        try {
          // wasAdded is a boolean. Like any RPC method, an error may be thrown.
          const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: this.tokenAddress,
                symbol: 'EUR',
                decimals: 0,
                image: this.tokenImage
              }
            }
          })
          if (wasAdded) {
            // console.log('[log] token at ' + this.tokenAddress + ' was added succesfully')
          } else {
            console.error('[log] an error occured while adding the token')
          }
        } catch (error) {
          console.error(error)
        }
      }
    },
    onRequestToken () {
      if (this.canRequestToken) {
        this.faucetLoading = true
        this.canRequestToken = false

        const request = env.VITE_TRAIN_PROXY_URL + '/faucet'
        // console.log('[log] request: ' + request)
        fetch(request, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ receiver: this.user.address })
        })
          .then(response => {
            if (response.ok) {
              return response.json()
            } else {
              console.error('server returned ' + response.status + ' : ' + response.statusText)
            }
          })
          .then(response => {
            if (response.hash) {
              // console.log('[log] faucet tx: ' + JSON.stringify(response.hash))
            }
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.faucetLoading = false
            
          })
      }
    }
  }
}
</script>

<style>
</style>
