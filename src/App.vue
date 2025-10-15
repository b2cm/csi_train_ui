<template>
  <div>
  <div class="bg"></div>

  <cookie-banner/>

  <div class="app" style="min-height: 100%;">
    <NavBar></NavBar>
    <section class="section main-section">
      <div class="container is-max-desktop">
        <transition name="slide-fade" mode="out-in">
          <LandingPage v-if="app.stageLanding"/>
          <div v-else class="box" style="position: relative;"> 
            <b-button v-if="!app.stageJourneyInput" style="position: absolute; z-index: 10;" type="is-ghost" icon-right="arrow-left" @click="app.goBack()">
            

              <!--<b-icon icon="arrow-left" size="is-small"></b-icon>-->
            </b-button>
            <b-tabs v-model="app.stagedTab" position="is-right" data-cy="data-app" @input="refresh">
              <b-tab-item label="Absicherung beantragen">
                <transition name="slide-fade" mode="out-in">
                  <LoadingStatus v-if="app.stageLoadingStatus"/>
                  <JourneyInput v-if="app.stageJourneyInput" @journey-input-completed="selectJourney"/>
                  <JourneySelection v-if="app.stageJourneySelection" @journey-selected="requestPolicy"/>
                  <PolicyOffer v-if="app.stagePolicy" @policy-accepted="buyPolicy"/>
                  <WrapUp v-if="app.stageWrapUp"/>
                </transition>
              </b-tab-item>
              <!--<b-tab-item label="Meine Absicherungen">
                <AccountStatus ref="accountStatus"/>
              </b-tab-item>
              <b-tab-item label="Einstellungen">
                <AccountSetup ref="accountSetup"/>
              </b-tab-item>-->
            </b-tabs>
          </div>
        </transition>
      </div>
    </section>
    <FooterBar/>
    </div>
  </div>
</template>

<script>
// stores
import { useUserStore } from '@/stores/User'
import { useAppStore } from '@/stores/App'
import { usePolicyStore } from '@/stores/Policy'

// components
import JourneyInput from './components/JourneyInput.vue'
import JourneySelection from './components/JourneySelection.vue'
import NavBar from './components/NavBar.vue'
import PolicyOffer from './components/PolicyOffer.vue'
import LoadingStatus from './components/LoadingStatus.vue'
import WrapUp from './components/WrapUp.vue'
import LandingPage from './components/LandingPage.vue'
import FooterBar from './components/FooterBar.vue'
import CookieBanner from './components/CookieBanner.vue'


//import AccountStatus from './components/AccountStatus.vue'
//import PolicyPayment from './components/PolicyPayment.vue'
//import AccountSetup from '@/components/AccountSetup.vue'


// make env available
const env = import.meta.env

export default {
  name: 'App',
  //emits: ['tabs-switched'],
  setup () {
    const user = useUserStore()
    const app = useAppStore()
    const policy = usePolicyStore()
    return {
      user,
      app,
      policy
    }
  },
  components: {
    NavBar,
    PolicyOffer,
    JourneyInput,
    JourneySelection,
    LoadingStatus,
    WrapUp,
    LandingPage,
    FooterBar,
    CookieBanner
  },
  async beforeMount () {
    // wallet connect
  },
  mounted () {
  },
  methods: {
    refresh () {
      this.$refs.accountSetup.refresh()
      this.$refs.accountStatus.refresh()
    },
    /**
      * handle completion of journey input
      */
    selectJourney (_journeys, _departureStopId, _arrivalStopId) {
      // safe data from journey input
      this.policy.journeys = _journeys
      this.policy.departureStopId = _departureStopId
      this.policy.arrivalStopId = _arrivalStopId
      // stage Journeys component
      this.app.stageJourneyInput = false
      this.app.stageJourneySelection = true
    },

    /**
      * fires a request to the train data proxy specified in env.VITE_TRAIN_PROXY_URL
      * to get the delay probability
      */
    requestPolicy (_legs) {
      // staging loading component
      this.app.stageJourneySelection = false
      this.app.status = 'Die Verbindung wird geprüft...'
      this.app.stageLoadingStatus = true
      this.policy.legs = _legs

      // build request body
      const reqBody = { type: 'all', journey: {} } // small, medium and large payouts
      for (let i = 0; i < this.policy.legs.length; i++) {
        reqBody.journey['leg_' + (i + 1)] = {
          train: this.policy.legs[i].line.fahrtNr,
          start_stop: this.policy.legs[i].origin.name,
          start_time: this.getTimeString(this.policy.legs[i].departure),
          start_date: this.policy.legs[i].departure.split('T')[0],
          arrival_stop: this.policy.legs[i].destination.name,
          arrival_time: this.getTimeString(this.policy.legs[i].arrival),
          arrival_date: this.policy.legs[i].arrival.split('T')[0]
        }
      }
      // console.log(reqBody)

      // request probability
      const request = env.VITE_TRAIN_PROXY_URL + '/payouts'
      // console.log('[log] request: ' + request)
      // console.log('[log] request body: ' + JSON.stringify(reqBody))
      fetch(request, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            console.error('[log] Server returned ' + response.status + ' : ' + response.statusText)
          }
        })
        .then(response => {
          this.app.stageLoadingStatus = false
          if (response.status === 0) {
            // success
            // console.log('[log] Server returned ' + JSON.stringify(response))
            this.policy.payoutSmall = parseInt(response.payout.small)
            this.policy.payoutMedium = parseInt(response.payout.medium)
            this.policy.payoutLarge = parseInt(response.payout.large)
            this.policy.zugfinderRequest = reqBody.journey

            this.app.stagePolicy = true
          } else if (response.status === 30) {
            // risk too high
            /*this.alertCustomInfo('Entschuldigung', 'Für diese Verbindung wurde ein außergewöhnlich hohes Verspätungsrisiko ermittelt. Es ist davon auszugehen, dass du nicht pünktlich am Ziel sein wirst. Wir können deshalb keine faire Absicherung anbieten. 🙁')*/
            this.alertCustomInfo('Entschuldigung', 'Für diese Verbindung kann leider keine Absicherung angeboten werden. 🙁')

            this.app.stageJourneySelection = true
          } else if (response.status === 100) {
            this.alertCustomInfo('Entschuldigung', 'Für diese Verbindung kann leider keine Absicherung angeboten werden. Möglicherweise ist unerwarterer Schienenersatzverkehr aufgetreten. 🙁')
            this.app.stageJourneySelection = true
          } else {
            console.error('[log] Server returned error code: ' + response.status)
            this.app.stageJourneyInput = true
          }
        })
        .catch(err => {
          console.error(err)
          this.app.stageLoadingStatus = false
          this.app.stageJourneyInput = true
          this.$buefy.toast.open({
            message: 'An error occurred.',
            type: 'is-danger',
          })
        })
        .finally(() => {
          this.app.status = ''
        })
    },

    /**
       * sends a transaction to buy the policy
       */
    buyPolicy () {

      // GA
      this.$gtag.event('progress_mail_prompt', {
        event_category: 'policy_selection',
        event_label: 'mail_prompt_continue'
      })

      // applyForPolicy
      const reqBody = {
        "mail": this.user.mail,
        "type": this.policy.plan,
        "journey": this.policy.zugfinderRequest
      }
      //console.log(JSON.stringify(reqBody))
      const request = env.VITE_PAYMENT_GATEWAY_URL + '/requestPolicy'
      //console.log('[log] request: ' + request)
      //console.log('[log] request body: ' + JSON.stringify(reqBody))
      // show loading
      this.app.stagePolicy = false
      this.app.status = 'Die Verbindung wird geprüft...'
      this.app.stageLoadingStatus = true
      fetch(request, {
        method: 'POST',
        mode: 'cors',
        //credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody)
      })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            console.error('[log] Server returned ' + response.status + ' : ' + response.statusText)
            this.app.stageLoadingStatus = false
            this.app.stagePolicy = true
            this.$buefy.toast.open({
              message: 'An error occurred.',
              type: 'is-danger',
            })
          }
        })
        .then(response => {
          if (response.iban && response.memo && response.price && response.receiver) {
            // success
            this.policy.receiver = response.receiver
            this.policy.serviceIBAN = response.iban
            this.policy.memo = response.memo
            this.policy.price = response.price
            this.app.stageLoadingStatus = false
            this.app.stageWrapUp = true
          } else {
            // error
            console.error('[log] Server returned ' + JSON.stringify(response))
            this.app.stageLoadingStatus = false
            this.app.stagePolicy = true
            this.$buefy.toast.open({
              message: 'An error occurred.',
              type: 'is-danger',
            })
          }
        })
        .catch(err => {
          console.error(err)
          this.app.stageLoadingStatus = false
          this.app.stagePolicy = true
          this.$buefy.toast.open({
            message: 'An error occurred.',
            type: 'is-danger',
          })
        })
    },

    /**
      * helper functions
      */
    addZeroDigit (_number) {
      if (_number < 10) {
        _number = '0' + _number
      }
      return _number
    },
    getTimeString (_date) {
      const d = new Date(_date)
      return this.addZeroDigit(d.getHours()) + ':' + this.addZeroDigit(d.getMinutes())
    },

    // converts the legs (zugfinder format) into a single string
    encodeJourney (_legs) {
      const length = Object.keys(this.policy.zugfinderRequest).length
      const a = []
      let p = ''

      for (let i = 1; i <= length; i++) {
        const leg = _legs['leg_' + i]
        a.push(leg.train)
        a.push(leg.start_stop)
        a.push(leg.start_time)
        a.push(leg.start_date)
        a.push(leg.arrival_stop)
        a.push(leg.arrival_time)
        a.push(leg.arrival_date)
      }

      a.forEach(item => {
        p = p + item + ';'
      })

      p = p.replace(/;$/, '') // remove last
      return p
    },

    alertCustomInfo (_title, _message) {
      this.$buefy.dialog.alert({
        title: _title,
        message: _message,
        hasIcon: true,
        icon: 'exclamation-circle',
        iconPack: 'fa',
        ariaRole: 'alertdialog',
        ariaModal: true
      })
    },
    alertCustomError (_title, _message) {
      this.$buefy.dialog.alert({
        title: _title,
        message: _message,
        type: 'is-danger',
        hasIcon: true,
        icon: 'times-circle',
        iconPack: 'fa',
        ariaRole: 'alertdialog',
        ariaModal: true
      })
    }
  }
}
</script>

<style lang="scss">
  @import "style.scss";
  html, body {
    height: 100%;
  }
  .app {
    // background: rgb(238,174,202);
    // background: radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);
    // background: #90e4a0;
    // background: radial-gradient(circle, #90e4a0 10%, rgba(148,187,233,1) 100%);
    // background: rgb(72,199,142);
    // background: radial-gradient(circle, rgba(72,199,142,1) 0%, rgba(161,210,255,1) 100%);
    // background-color: #FA8BFF;
    // background-image: radial-gradient(circle, #2BD2FF 30%, #2BFF88 100%);
    //background: rgb(223,255,206);
    //background: radial-gradient(circle, rgba(223,255,206,1) 10%, rgba(134,211,255,1) 100%);
    
  }
  .bg {
    background-image: url("assets/background.jpg");
    filter: blur(8px);
    -webkit-filter: blur(8px);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -100;
    transform: scale(1.1);
    //background: rgb(223,255,206);
    //background-image: radial-gradient(circle, rgba(223,255,226,0.9) 10%, rgba(134,211,255,0.9) 100%), url("assets/background.png");
    background-image: radial-gradient(circle, rgba(20,89,240,0.4) 0%, rgba(0,0,0,0) 100%), url("assets/background.jpg");
  }
  .main-section {
    //background: transparent;
  }
  .navbar-item:not(:last-child):hover, .navbar-item:focus-within:not(:last-child) {
    background-color: rgba(255,255,255,0.2) !important;
  }

  /* Enter and leave animations can use different */
  /* durations and timing functions.              */
  .slide-fade-enter-active {
    transition: all .5s ease;
  }
  .slide-fade-leave-active {
    transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter
  /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
  }
  .slide-fade-leave-to {
    transform: translateX(-10px);
    opacity: 0;
  }
</style>
