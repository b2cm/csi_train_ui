<template>
  <div>
    <p class="title is-3">Vielen Dank!</p>
    <p class="subtitle">Sobald du bezahlt hast, wird deine Absicherung aktiviert.</p>
    <!--<p class="subtitle" v-if="(app.lastTransaction != null) && app.lastTransaction.blockNumber != null">Die Transaktion wurde in Block <a target="_blank" rel="noopener noreferrer" :href="'https://mumbai.polygonscan.com/tx/' + app.lastTransaction.transactionHash"> #{{app.lastTransaction.blockNumber }} </a>aufgenommen.</p>-->
    <b-message type="is-success" has-icon>
      Du erhältst außerdem eine E-Mail mit allen Details. Im Falle einer Verspätung, wird die Entschädigung automatisch auf dein Konto überwiesen. <br> Gute Fahrt! 🙂
    </b-message>

    <b-collapse :open="false" animation="slide">
      <template #trigger="props">
        <a
          aria-controls="details-content"
          :aria-expanded="props.open">
          <b-icon :icon="!props.open ? 'angle-down' : 'angle-up'"></b-icon>
          {{ !props.open ? 'Details einblenden' : 'Details ausblenden' }}
        </a>
      </template><br>
      <div class="tile notification is-child px-4" :expanded="true">
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
      </div><br>
      <!--<p>Abgesicherte Verbindung:<br>-->
        <b-tag type="is-info" size="is-small" class="mb-3">{{ getDateString(policy.legs[0].departure) }}</b-tag><br>
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
        <!--{{ getDateString(this.policy.legs[0].departure) }}, {{ this.policy.confirmedJourney }}<br>
      </p>-->
      <br>
    </b-collapse>
    <div class="block"></div>
    <div class="columns is-variable is-6 is-centered">
      <div class="column qr-column">
        <div class="box columns m-0 is-vcentered ">
          <div class="column p-0 is-narrow">
            <b-image class="is-128x128" :src="qrCode"></b-image>
          </div>
          <div class="column">
            <p>
              Scanne den QR-Code mit deiner Banking-App oder kopiere die Daten manuell.
              <b-tooltip label="Die Zahlung muss min. 48 Stunden vor Fahrtantritt bei uns eingegangen sein. Wir empfehlen eine Echtzeitübertweisung.">
                <b-icon icon="question-circle" size="is-primary"></b-icon>
              </b-tooltip>
            </p>
          </div>
        </div>
      </div>
      <!--<div class="column is-narrow">
        oder
      </div>-->
      <div class="column">
        <section class="">
          <div class="">
            <b-field grouped>
              <b-field expanded label="Empfänger">
                {{ policy.receiver }}
              </b-field>
              <b-field expanded label="Betrag">
                {{ policy.price}} €
              </b-field>
            </b-field>
            <b-field label="IBAN">
              <b-input
                  @focus="$event.target.select()" 
                  ref="ibanInput"
                  :value="this.policy.serviceIBAN"
                  readonly
                  expanded
                  icon="fas fa-receipt">
              </b-input>
              <p class="control">
                <b-button type="is-primary" icon-right="copy" @click="copyFromRef('ibanInput')"/>
              </p>
            </b-field>
            <b-field label="Verwendungszweck">
              <b-input
                  @focus="$event.target.select()" 
                  ref="memoInput"
                  :value="this.policy.memo"
                  readonly
                  expanded
                  icon="fas fa-receipt">
              </b-input>
              <p class="control">
                <b-button type="is-primary" icon-right="copy" @click="copyFromRef('memoInput')"/>
              </p>
            </b-field>
          </div>
        </section>
      </div>
      <!--<div class="column is-one-quarter has-text-centered">
        <div class="box">
          <b-image class="qr" :src="qrCode"></b-image>
          <div class="column">
            <p>Scanne den QR-Code oder kopiere die Daten manuell in deine Banking-App.</p>
          </div>
        </div>
      </div>-->
    </div>
    
  </div>
</template>

<script>
// stores
import { useAppStore } from '@/stores/App'
import { usePolicyStore } from '@/stores/Policy'

import generateQrCode from 'sepa-payment-qr-code'
import QRCode from 'qrcode'

export default {
  setup () {
    const app = useAppStore()
    const policy = usePolicyStore()
    return {
      app,
      policy
    }
  },
  name: 'WrapUp',
  data () {
    return {
      qrCode: null
    }
  },
  mounted() {
    const qrCode = generateQrCode({
      name: this.policy.receiver,
      iban: this.policy.serviceIBAN,
      amount: this.policy.price,
      currency: 'EUR',
      unstructuredReference: this.policy.memo
    })
    QRCode.toDataURL(qrCode, { errorCorrectionLevel: 'M' }, (err, url) => {
      if (err) console.error(err)
      this.qrCode = url
    })
  },
  methods: {
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
      return new Date(_date).toLocaleDateString()
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
    },
    copyFromRef(_refName) {
      this.$refs[_refName].focus()
      setTimeout(() => {
        document.execCommand('copy', false, null)
      }, 100)
      this.$buefy.toast.open({
        message: 'Kopiert',
        type: 'is-success'
      })
    },
  }
}
</script>

<style scoped>
.qr-column {
  display: flex;
}
</style>
