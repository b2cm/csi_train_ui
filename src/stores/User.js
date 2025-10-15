import { defineStore } from 'pinia'

export const useUserStore = defineStore('User', {

  state: () => {
    return {
      // user mail address
      mail: null,

      // user id
      id: null,

      // existing policies
      policies: new Array
    }
  },

  actions: {
  },

  getters: {
  }
})
