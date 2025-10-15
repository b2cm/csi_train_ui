import { defineStore } from 'pinia'

export const useAppStore = defineStore('App', {

  state: () => {
    return {
      // current tab in tabview
      stagedTab: 0,

      // component visibility
      stageLanding: true,
      stagePolicy: false,
      stageJourneyInput: true,
      stageJourneySelection: false,
      stageLoadingStatus: false,
      stageWrapUp: false,
      //stagePayoutModal: false,

      // status message
      status: '',

      // modals
      isTermsActive: false,
      isPrivacyActive: false,
    }
  },

  actions: {
    openTerms() {
      this.isTermsActive = true
    },
    openPrivacy() {
      this.isPrivacyActive = true
    },
    goBack() {
      this.stageJourneyInput = true,
      this.stageJourneySelection = false,
      this.stageLoadingStatus = false,
      this.stagePolicy = false,
      this.stageWrapUp = false
    }
  },

  getters: {
  }
})
