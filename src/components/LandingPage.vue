<template>
  <div>
    <b-modal :active.sync="isFAQActive" :width="600" scroll="keep">
      <div class="box">
        <h1 class="title">FAQ 🤔</h1>
        <div v-for="(question, index) in faqData" :key="index" class="mb-4">
          <h4 class="has-text-weight-bold">{{ question.title }}</h4>
          <p>{{ question.answer }}</p>
        </div>
        <!--<div class="pb-6">
        <b-button class="is-pulled-right" type="is-outlined"
          label="Schließen"
          @click="$emit('close')" /></div>-->
      </div>
    </b-modal>
    <div class="columns is-2">
      <div class="column has-text-light">
        <ul class="is-size-5 mb-6">
          <li>
            <span class="has-text-success">✓</span>
            Auszahlung ab 60 Minuten Verspätung</li>
          <li>
            <span class="has-text-success">✓</span>
            Entspannt per SEPA-Überweisung bezahlen
          </li>
        </ul>
        <div class="has-text-centered">
          <b-button size="is-medium" icon-right="arrow-right" type="is-light" class="is-outlined is-rounded my-5" @click="handleButtonClick" disabled>Absicherung kaufen</b-button>
          <p class="mt-6">Weitere Informationen sind in unserem <!--<a class="has-text-light is-underlined">Erklärvideo</a>zu finden--> 
          <a class="has-text-light is-underlined" @click="openFAQ">FAQ</a> zu finden.</p>
        </div>
      </div>
      <div class="column">
        <b-image class="m-2" :src="railsImage" alt="Image"/>
      </div>
    </div>
  </div>
</template>

<script>

// stores
import { useAppStore } from '@/stores/App'

import railsURL from '@/assets/rails.png'

export default {
  setup () {
    const app = useAppStore()
    return {
      app
    }
  },
  data () {
    return {
      railsImage: railsURL,
      isFAQActive: false,
      faqData: [
        {
          title: 'An wen richtet sich die Absicherung?',
          answer: 'Train Delay möchte allen Bahnfahrenden eine Absicherung anbieten, um schnell und unkompliziert auszuhelfen, wenn eine Verspätung negative Konsequenzen zur Folge hat.',
        },
        {
          title: 'Bleiben die Fahrgastrechte der Deutschen Bahn weiterhin erhalten, wenn ich eine Absicherung kaufe?',
          answer: 'Ja, die Fahrgastrechte der Deutschen Bahn bleiben unberührt und gelten parallel zur Absicherung von Train Delay.',
        },
        {
          title: 'Wie erfolgen die Ein- und Auszahlungen?',
          answer: 'Die Ein- und Auszahlungen erfolgen per SEPA-Echtzeitüberweisung. Bei den meisten Banken ist das komplett kostenfrei.',
        },
        {
          title: 'Wie schnell erfolgt die Auszahlung nach einer Zugverspätung?',
          answer: 'Sobald der Zug der ausgewählten Zugverbindung mit einer Verspätung von mindestens 60 Minuten am Zielbahnhof angekommen ist, wird dir der Auszahlungsbetrag innerhalb weniger Stunden überwiesen.',
        },
        {
          title: 'Welche Zugverbindungen kann ich auswählen?',
          answer: 'Du kannst alle Zugverbindungen des Regional- und Fernverkehrs in Deutschland auswählen. Ausgenommen sind lediglich Busse und insbesondere Schienenersatzverkehr.',
        },
        {
          answer: 'Vielen Dank für dein Interesse und gute Fahrt! 🙂',
        },
      ],
    }
  },
  name: 'LandingPage',
  mounted () {
    this.$buefy.dialog.alert({
      title: 'Vielen Dank! 🚂',
      message: 'Drei Monate lang wurde hier die erste Absicherung gegen Zugverspätungen in Deutschland angeboten. Die Pilotphase ist vorerst abgeschlossen und derzeit können leider keine neuen Absicherungen erworben werden. Vielen Dank für dein Verständnis und gute Fahrt!',
      confirmText: 'Schließen'
    })
  },
  methods: {
    openFAQ() {
      this.isFAQActive = true
    },
    handleButtonClick () {
      this.$gtag.event('progress_landing', {
        event_category: 'landing_page',
        event_label: 'start_process'
      })
      this.app.stageLanding = false
    }
  }
}
</script>

<style scoped>
</style>
