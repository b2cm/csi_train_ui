<template>
  <div>
    <div class="is-size-4 mb-2">Reiseübersicht</div>
    <div class="tile is-ancestor is-vertical">
      <div class="tile is-parent">
        <div class="tile notification is-child px-4"
          :expanded="true">
          <div class="mb-3">{{ getDateString(policy.legs[0].departure) }}</div>
          <div class="columns">
            <div class="column is-narrow">
              <b-tag type="is-dark" size="is-medium">{{ getTimeString(policy.legs[0].departure) }} - {{ getTimeString(policy.legs[policy.legs.length - 1].arrival) }}
              </b-tag>
            </div>
            <div class="column auto">
              <b-field grouped>
                <b-field expanded>
                  <b-progress v-for="(leg, index) in policy.legs" :key="index" type="is-primary" class="progress mb-0 is-large train-blocks" :style="{width: getLegWidth(policy, leg)}" :value="100" :max="100" show-value>{{leg.line.name}}</b-progress>
                </b-field>
              </b-field>
              <b-field grouped>
                <b-field>{{ policy.legs[0].origin.name }}</b-field>
                <b-field expanded></b-field>
                <b-field>{{ policy.legs[policy.legs.length - 1].destination.name }}</b-field>
              </b-field>
            </div>
          </div>
          <b-collapse :open="false" animation="slide">
            <template #trigger="props">
              <a
                aria-controls="details-content"
                :aria-expanded="props.open">
                <b-icon :icon="!props.open ? 'angle-down' : 'angle-up'"></b-icon>
                Details
              </a>
            </template><br>

              <p>
                <b-field grouped group-multiline>
                  <div class="control" v-for="(leg, index) in policy.legs" :key="index">
                    <b-taglist attached>
                      <b-tag type="is-info">{{ index+1 }}</b-tag>
                      <b-tag icon="train" type="is-primary">
                        {{ leg.line.name }}
                      </b-tag>
                      <b-tag type="is-primary">
                        {{ leg.origin.name }} <b-icon pack="fas" icon="angle-right"></b-icon> {{ leg.destination.name }}
                      </b-tag>
                      <b-tag type="is-info">
                        {{ getTimeString(leg.departure) }}
                        <b-icon pack="fas" icon="angle-right"></b-icon>
                        {{ getTimeString(leg.arrival) }}
                      </b-tag>
                    </b-taglist>
                  </div>
                </b-field>
            </p><br>
          </b-collapse>
        </div>
      </div>

    </div>
    <div class="is-size-4 mt-5 mb-2 ml-1">Absicherung kaufen</div>


        <div class="block mb-3">
          <b-icon pack="far" icon="check-circle" type="is-success"></b-icon>
          Verspätungen aller Art ab 60 Minuten
        </div>
        <div class="block">
          <b-icon pack="far" icon="check-circle" type="is-success"></b-icon>
          Auszahlung erfolgt automatisch
        </div>


    <div class="columns has-text-centered is-flex-wrap-wrap">
      <div class="column">
        <div class="box">
          <div class="columns">
            <div class="column">
              <p class="heading">Small</p>
            </div>
          </div>
          <div class="columns is-vcentered">
            <div class="column is-narrow">
              <p class="has-text-left">
                <b class="is-size-3 has-text-success">+{{ Math.floor(this.policy.payoutSmall) }} €</b><br>Auszahlung
              </p>
            </div>
            <div class="column is-right pb-2 mt-auto">
              <div class="buttons is-right">
                <b-button
                  type="is-success"
                  v-on:click="offerAccepted('small')">
                  <span>{{ this.policy.priceSmall }} €</span>
                  <b-icon pack="fas" icon="shopping-cart"></b-icon>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <div class="columns">
            <div class="column is-three-fifths">
              <span class="pb-1 heading has-text-right mobile-has-text-centered">Medium</span>
            </div>
            <div class="column has-text-right mobile-has-text-centered">
              <b-tag type="is-success is-light" rounded>Empfohlen</b-tag>
            </div>
          </div>
          <div class="columns is-vcentered">
            <div class="column is-narrow">
              <p class="has-text-left">
                <b class="is-size-3 has-text-success">+{{ Math.floor(this.policy.payoutMedium) }} €</b><br>Auszahlung
              </p>
            </div>
            <div class="column is-right pb-2 mt-auto">
              <div class="buttons is-right">
                <b-button
                  type="is-success"
                  v-on:click="offerAccepted('medium')">
                  <span>{{ this.policy.priceMedium }} €</span>
                  <b-icon pack="fas" icon="shopping-cart"></b-icon>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <div class="columns">
            <div class="column">
              <p class="heading">Large</p>
            </div>
          </div>
          <div class="columns is-vcentered">
            <div class="column is-narrow">
              <p class="has-text-left">
                <b class="is-size-3 has-text-success">+{{ Math.floor(this.policy.payoutLarge) }} €</b><br>Auszahlung
              </p>
            </div>
            <div class="column is-right pb-2 mt-auto">
              <div class="buttons is-right">
                <b-button
                  type="is-success"
                  v-on:click="offerAccepted('large')">
                  <span>{{ this.policy.priceLarge }} €</span>
                  <b-icon pack="fas" icon="shopping-cart"></b-icon>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="isMailPromptActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="mail prompt"
      close-button-aria-label="Close"
      aria-modal>
      <template #default="props">
          <mail-prompt @close="props.close" @confirm="$emit('policy-accepted')"></mail-prompt>
      </template>
    </b-modal>
  </div>
</template>

<script>
// stores
import { usePolicyStore } from '@/stores/Policy'
import { useUserStore } from '@/stores/User'

// components
import MailPrompt from './MailPrompt.vue'


export default {
  setup () {
    const policy = usePolicyStore()
    const user = useUserStore()
    return {
      policy,
      user
    }
  },
  name: 'PolicyOffer',
  emits: ['policy-accepted'],
  data () {
    return {
      isMailPromptActive: false,
    }
  },
  components: {
    MailPrompt
  },
  methods: {
    launchMailPrompt() {
      this.isMailPromptActive = true
    },
    offerAccepted(_plan) {
      this.policy.plan = _plan

      // GA
      this.$gtag.event('progress_policy_selection', {
        event_category: 'policy_selection',
        event_label: 'select_plan',
        value: _plan
      })

      this.launchMailPrompt()
    },
    back () {
      window.location.href = '/'
    },
    addZero (_number) {
      if (_number < 10) {
        _number = '0' + _number
      }
      return _number
    },
    getTimeString (_date) {
      const d = new Date(_date)
      return this.addZero(d.getHours()) + ':' + this.addZero(d.getMinutes())
    },
    getDateString (_date) {
      return new Date(_date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    },
    showNotInsurableAlert () {
      this.$buefy.dialog.alert('Es gibt leider Zugverbindungen, die nahezu immer zu spät sind. Auch untyptische Verbindungen (z.B. mit sehr langen Umstiegszeiten über Nacht) sind schwierig zu ermitteln. Wir empfehlen, wenn möglich gar nicht mit solchen Verbindungen zu reisen. 🙂')
    },
    getLegWidth (_journey, _leg) {
      let d, a
      // calculate journey duration in minutes
      d = new Date(_journey.legs[0].departure)
      a = new Date(_journey.legs[_journey.legs.length - 1].arrival)
      const journeyDuration = (a - d) / 1000 / 60

      // calculate leg duration in minutes
      d = new Date(_leg.departure)
      a = new Date(_leg.arrival)
      const legDuration = (a - d) / 1000 / 60

      // calculate leg width
      const legWidth = (legDuration / journeyDuration) * 100
      return legWidth + 20 + '%'
    }
  }
}
</script>

<style scoped>
  @media only screen and (max-width: 768px) {
    .mobile-has-text-centered {
      text-align: center !important;
    }
  }
</style>
