<template>
    <div class="tile is-ancestor">
      <div class="tile is-parent is-vertical">
        <div class="tile is-child"></div>
        <div class="tile is-child">
          <progress class="progress is-medium is-success" max="100">45%</progress>
          <!--<b-loading :is-full-page="false" v-model="isLoading" :can-cancel="true"></b-loading>-->
        </div>
        <div class="tile is-child has-text-centered">
          <p> {{ app.status }} </p>
        </div>
      </div>
    </div>
</template>

<script>
// stores
import { useAppStore } from '@/stores/App'

export default {
  setup () {
    const app = useAppStore()
    return {
      app
    }
  },
  name: 'LoadingStatus',
  data () {
    return {
      isLoading: true
    }
  },
  methods: {
    openLoading () {
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
      }, 10 * 1000)
    }
  }
}
</script>

<style scoped>
  .container {
    height: 55px;
  }
</style>
