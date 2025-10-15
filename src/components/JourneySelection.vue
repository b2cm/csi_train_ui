<template>
  <div>
    <p class="title">Wähle deine Verbindung:</p>
    <div class="tile is-ancestor">
      <div class="tile is-parent is-vertical">
        <div class="tile notification is-child px-4"
          v-for="(journey, index) in policy.journeys"
          :native-value="index"
          :expanded="true"
          :disabled="journey.hasReplacement"
          :key="index">
          <div class="columns">
            <div class="column is-narrow">
              <b-tag type="is-dark" size="is-large">{{ getTimeString(journey.legs[0].departure) }} - {{ getTimeString(journey.legs[journey.legs.length - 1].arrival) }}
              </b-tag>
            </div>
            <div class="column auto">
              <b-field grouped>
                <b-field expanded>
                  <b-progress v-for="(leg, index) in journey.legs" :key="index" type="is-dark" class="progress mb-0 is-large train-blocks" :style="{width: getLegWidth(journey, leg)}" :value="100" :max="100" show-value>{{leg.line.name}}</b-progress>
                </b-field>
              </b-field>
              <b-field grouped>
                <b-field>{{ journey.legs[0].origin.name }}</b-field>
                <b-field expanded></b-field>
                <b-field>{{ journey.legs[journey.legs.length - 1].destination.name }}</b-field>
              </b-field>
            </div>
            <div class="column is-2">
              <div class="buttons is-right bottom">
                <b-tooltip v-if="journey.hasReplacement" label="Schienenersatzverkehr kann leider nicht versichert werden." position="is-bottom">
                  <b-button disabled type="is-success" icon-right="arrow-right"></b-button>
                </b-tooltip>
                <b-button v-else type="is-success" v-on:click="selectJourney(journey)" data-cy="btn-buy-policy" icon-right="arrow-right" :disabled="journey.hasReplacement"/>
              </div>
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
            <div class="control" v-for="(leg, index) in journey.legs" :key="index">
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
  </div>
</template>

<script>
// stores
import { usePolicyStore } from '@/stores/Policy'

/**
 * This component displays 3 possible journeys based on
 * the user input, including all legs.
 *
 * TODO: only offer buyable journeys???
 */
export default {
  setup () {
    const policy = usePolicyStore()
    return {
      policy
    }
  },
  name: 'JourneySelection',
  emits: ['journey-selected'],
  data () {
    return {
      selectedJourney: null
    }
  },
  methods: {
    selectJourney (_journey) {
      this.$gtag.event('progress_journey_selection', {
        event_category: 'journey_selection',
        event_label: 'continue'
      })
      // console.log(_journey.legs)
      this.$emit('journey-selected', _journey.legs)
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

<style>
  .progress-wrapper {
    position: relative !important;
    max-width: 100%;
  }
  .progress-wrapper .progress {
    height: 4rem;
  }
  .progress-wrapper .progress-value {
    top: 4px !important;
  }
  .field.is-grouped .field {
    flex-shrink: unset !important;
  }
  .train-blocks progress::-webkit-progress-bar, .train-blocks progress::-moz-progress-bar {
    background-color: rgb(53,53,53) !important;
  }
</style>
