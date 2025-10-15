import { defineStore } from 'pinia'

export const usePolicyStore = defineStore('Policy', {

  state: () => {
    return {

      // user input
      departureStopId: null,
      arrivalStopId: null,

      // possible scheduled journeys
      journeys: null,

      // request body used for zugfinder.net
      zugfinderRequest: null,

      priceSmall: 3.00,
      priceMedium: 5.00,
      priceLarge: 7.00,

      // policy data
      legs: null,
      //probability: null,

      plan: 'medium',
      payoutSmall: null,
      payoutMedium: null,
      payoutLarge: null,

      confirmedJourney: null, // oracle callback
      
      // payment data
      serviceIBAN: null,
      memo: null,
      price: null,
      receiver: null,
    }
  },

  actions: {
  },

  getters: {
  }
})
