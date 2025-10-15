<template>
  <div>
    <div class="mb-4">
      <b-message type="is-info is-light" has-icon icon="info-circle">Suche einfach nach der Verbindung, die du absichern möchstest.</b-message>
    </div>
    <div class="columns" style="position: relative;">
      <div class="column">
        <b-field label="Abfahrt">
          <b-autocomplete
            :disabled="isDisabled"
            keep-first
            icon-pack="fas" icon="hotel"
            :data="departureStationNames"
            placeholder="Bahnhof"
            field="name"
            :loading="isDepartureFetching"
            @typing="getAsyncStops($event, isArrival=false)"
            @select="selectDepartureStop">
          </b-autocomplete>
        </b-field>
        <b-field grouped>
          <b-datepicker
            :disabled="isDisabled"
            group-multiline
            expanded
            v-model="departureDate"
            :first-day-of-week="1"
            placeholder="Datum"
            icon="calendar"
            locale="de-DE"
            :min-date="minDate"
            :max-date="maxDate">
            <!--<div class="buttons">
              <b-button
                label="Heute"
                type="is-primary"
                icon-left="calendar"
                @click="departureDate = new Date()" />
              <b-button
                label="Löschen"
                type="is-danger"
                icon-left="times-circle"
                outlined
                @click="departureDate = null" />
            </div>-->
          </b-datepicker>
          <b-timepicker
            :disabled="isDisabled"
            group-multiline
            expanded
            v-model="departureTime"
            icon="clock"
            :enable-seconds="false"
            hour-format="24">
            <div class="buttons">
              <!--<b-button
                label="Jetzt"
                type="is-primary"

                @click="departureTime = new Date()" />-->
              <b-button
                label="Löschen"
                type="is-danger"

                outlined
                @click="departureTime = null" />
              </div>
          </b-timepicker>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Ankunft">
          <b-autocomplete
            :disabled="isDisabled"
            icon-pack="fas" icon="hotel"
            :data="arrivalStationNames"
            placeholder="Bahnhof"
            field="name"
            :loading="isArrivalFetching"
            @typing="getAsyncStops($event, true)"
            @select="selectArrivalStop">
          </b-autocomplete>
        </b-field>
      </div>
    </div>
    <div class="buttons is-centered">
      <b-button type="is-primary" :loading="isLoading" :disabled="isDisabled" v-on:click="onContinue" data-cy="btn-input-journey">Weiter</b-button>
    </div>
  </div>
</template>

<script>
// libraries
import debounce from 'debounce'

// env
const env = import.meta.env

export default {
  name: 'JourneyInput',
  emits: ['journey-input-completed'],
  data () {
    const today = new Date()
    return {
      // calculate range for datepicker
      date: new Date(),
      minDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      maxDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),

      departureStop: '',
      departureStopId: '',
      arrivalStop: '',
      arrivalStopId: '',
      departureDate: null,
      departureTime: null,
      departureStationNames: [],
      arrivalStationNames: [],
      isDepartureFetching: false,
      isArrivalFetching: false,
      isLoading: false,
      isDisabled: false
    }
  },
  mounted () {
    this.departureTime = new Date()
    this.departureDate = new Date(Date.now() + (172800000))
  },
  methods: {
    onContinue () {
      if (this.departureStop !== '' && this.arrivalStop !== '' && this.departureDate !== '' && this.departureTime !== '' && this.departureStopId !== '' && this.arrivalStopId !== '') {
        this.isLoading = true
        this.isDisabled = true

        // merge departureDate and departureTime
        const mergedDepartureDate = this.departureDate
        mergedDepartureDate.setHours(this.departureTime.getHours())
        mergedDepartureDate.setMinutes(this.departureTime.getMinutes())

        // GA
        this.$gtag.event('progress_journey_input', {
          event_category: 'journey_input',
          event_label: 'continue',
          value: this.departureStop + ' - ' + this.arrivalStop + ' (' + mergedDepartureDate + ')'
        })

        // look up journeys
        const request = env.VITE_DB_TRANSPORT_URL + '/journeys?from=' + this.departureStopId + '&to=' + this.arrivalStopId + '&departure=' + mergedDepartureDate.toISOString() + '&results=3&bus=false&subway=false&tram=false&taxi=false&ferry=false'
        // console.log('[log] request: ' + request)
        fetch(request, { method: 'GET' })
          .then(response => {
            if (response.ok) {
              response.json().then(response => {
                if (response.journeys[0]) {
                  // success

                  // cut down to max. 3 journeys
                  response.journeys.splice(3, 100)

                  const filteredJourneys = this.filterWalkingLegs(response.journeys)

                  // search for replacement bus legs
                  for (const i in filteredJourneys) {
                    for (const j in filteredJourneys[i].legs) {
                      if (filteredJourneys[i].legs[j].line.productName === 'Bus') {
                        filteredJourneys[i].hasReplacement = true
                        break
                      }
                    }
                  }

                  this.$emit('journey-input-completed', filteredJourneys, this.departureStopId, this.arrivalStopId)
                } else {
                  console.error('no journey found')
                }
              })
            } else {
              response.json().then(json => {
                if (json.hafasCode === "H890") {
                  this.$buefy.toast.open({
                    message: 'Keine Zugverbindung gefunden',
                    type: 'is-danger',
                    duration: 3000
                  })
                } else if (json.hafasCode ==="LOCATION") {
                  this.$buefy.toast.open({
                    message: 'Ungültiger Bahnhof',
                    type: 'is-danger',
                    duration: 3000
                  })
                } else {
                  this.$buefy.toast.open({
                    message: 'Ein unbekannter Fehler ist aufgetreten.',
                    type: 'is-danger',
                    duration: 3000
                  })
                  throw new Error('Server returned ' + response.status + ' : ' + response.statusText)
                }
              })
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.isLoading = false
            this.isDisabled = false
          })
      } else {
        this.$buefy.toast.open({
          message: 'Bitte alle Felder ausfüllen',
          type: 'is-danger'
        })
      }
    },

    /**
       * fetches suggestions for both stop inputs (departure and arrival)
       * @param name contains typed field
       * @param isArrival tells which autocompletion field is used
       */
    getAsyncStops: debounce(function (name, isArrival) {
      if (!name.length) {
        this.departureStationNames = []
        this.arrivalStationNames = []
        return
      }
      if (isArrival) {
        this.isArrivalFetching = true
      } else {
        this.isDepartureFetching = true
      }
      const request = env.VITE_DB_TRANSPORT_URL + '/locations?query=' + name
      // console.log('[log] request: ' + request)
      fetch(request, { method: 'GET' })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            console.error('[log] Server returned ' + response.status + ' : ' + response.statusText)
          }
        })
        .then(response => {
          if (isArrival) {
            this.arrivalStationNames = []
            Object.entries(response).forEach((item) => this.arrivalStationNames.push(item[1]))
          } else {
            this.departureStationNames = []
            Object.entries(response).forEach((item) => this.departureStationNames.push(item[1]))
          }
        })
        .catch(err => {
          this.departureStationNames = []
          this.arrivalStationNames = []
            console.error(err)
        })
        .finally(() => {
          this.isArrivalFetching = false
          this.isDepartureFetching = false
        })
    }, 400),

    selectDepartureStop (option) {
      if (option) {
        this.departureStop = option.name
        this.departureStopId = option.id
        // console.log('[log] selected departure stop: ' + this.departureStop + '(' + this.departureStopId + ')')
      }
    },

    selectArrivalStop (option) {
      this.arrivalStop = option.name
      this.arrivalStopId = option.id
      // console.log('[log] selected arrival stop: ' + this.arrivalStop + '(' + this.arrivalStopId + ')')
    },

    // filter unwanted walking legs
    filterWalkingLegs (_journeys) {
      const filteredJourneys = _journeys

      for (let i = 0; i < _journeys.length; i++) {
        filteredJourneys[i].legs = _journeys[i].legs.filter(leg => leg.walking == null)
      }
      return filteredJourneys
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

<style scoped>
</style>
