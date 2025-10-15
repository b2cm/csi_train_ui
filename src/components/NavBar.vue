<template>
  <section class="hero is-primary main-header">
    <b-navbar>
      <template #brand>
          <b-navbar-item href="/">
              <b-icon pack="fas" icon="train" size=is-medium></b-icon>
          </b-navbar-item>
      </template>
      <template #end>
          <b-navbar-item>
            <a class="is-primary" href="https://csi.hs-mittweida.de/" target="_blank" rel="noopener noreferrer">
              <b>Community Supported Insurance</b>
              <b-icon pack="fas" type="is-light" icon="external-link-alt"></b-icon>
            </a>
          </b-navbar-item>
          <!--<b-navbar-item>
            <LNLoginButton/>
          </b-navbar-item>-->
          <!--<b-navbar-item tag="div">
            <div class="buttons">
              <a class="button is-light" data-cy="btn-connect-wallet" v-on:click="onConnectWallet">
                <b-image :src="metamaskIcon"></b-image>
                <span class="ml-2" v-if="!user.hasMetaMask">MetaMask installieren</span>
                <span class="ml-2" data-cy="wallet-connected" v-else-if="
                  user.hasMetaMask &&
                  user.hasMetaMaskConnected &&
                  user.network != null &&
                  user.address != null">
                {{ user.address.slice(0,6) }}...{{ user.address.slice(-5) }}</span>
                <span class="ml-2" data-cy="wallet-disconnected" v-else>Wallet verbinden</span>
                <b-icon v-if="user.network != null && user.network.chainId == 80001 && user.hasMetaMaskConnected" icon="check-circle" type="is-success"></b-icon>
                <b-icon v-else icon="exclamation-circle" type="is-danger"></b-icon>
              </a>
            </div>
          </b-navbar-item>-->
      </template>
    </b-navbar>
    <div class="hero-body">
      <div class="container has-text-centered">
        <p class="title">
          TRAIN DELAY
        </p>
        <p class="subtitle">
          Eine Absicherung bei Zugverspätungen.
        </p>
      </div>
    </div>
  </section>
</template>

<script>
// stores
import { useUserStore } from '@/stores/User'

export default {
  name: 'NavBar',
  components: {
  },
  setup () {
    const user = useUserStore()
    return {
      user
    }
  },
  data () {
    return {
      // metamaskIcon: metamaskIconUrl
    }
  },
  emits: ['connect-wallet'],
  methods: {
    onConnectWallet () {
      if (!this.user.hasMetaMask) {
        window.location.href = 'https://metamask.io/'
      } else {
        this.$emit('connect-wallet')
      }
    },
    async login() {
      // change data
      let url = "http://localhost:4000/login"
      window.location.replace(url)

    },
    async logout() {
      // change data
      let url = "http://localhost:4000/logout"
      window.location.replace(url)
    }
  }
}
</script>

<style scoped>
  .main-header {
    background-color: transparent !important;
  }
  a.navbar-item:hover {
    background-color: transparent !important;
  }
</style>
