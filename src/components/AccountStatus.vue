<template>
  <div><div v-if="user.id != null">
    <!--<span v-if="user.policies.length == 1">
      {{ user.policies.length  }} abgeschlossene Absicherung
    </span>
    <span v-else>
      {{ user.policies.length }} abgeschlossene Absicherungen
    </span><br><br>-->
    <div v-if="user.policies.length > 0" >
        <div class="box"
          v-for="(policy, index) in user.policies"
          :native-value="index"
          :expanded="true"
          :key="index">
          Zugfahrt am {{ getDateString(policy.journey["leg_1"].start_date) }}
          <br><br>
          <b-table
            :data="parseData(policy)"
            ref="table"
            :opened-detailed="defaultOpenedDetails"
            detailed
            detail-key="id"
            detail-transition="fade"
            :show-detail-icon="showDetailIcon">

            <b-table-column field="plan" width="120" label="Paket" v-slot="props">
              <b-tag class="is-success">{{ props.row.plan }}</b-tag>
            </b-table-column>
            <b-table-column field="premium" label="Preis" v-slot="props">
              {{ props.row.premium.toFixed(2) }}€
            </b-table-column>
            <b-table-column field="payout" label="Auszahlung bei Verspätung" v-slot="props">
              {{ props.row.payout.toFixed(2) }}€
            </b-table-column>
            <b-table-column field="scheduledArrival" label="Geplante Ankunft" v-slot="props">
              {{ props.row.scheduledArrival }}
            </b-table-column>
            <b-table-column field="isActive" width="150" label="Status" v-slot="props">
              <b-tag v-if="props.row.status == 'awaiting payment'" class="is-grey" icon="ban"> nicht bezahlt</b-tag>
              <div v-else-if="props.row.status == 'delayed' && 
                policy.withdrawn == false">
                <b-button
                  class="is-success"
                  icon-left="coins"
                  @click="isComponentModalActive = true">
                  Auszahlen
                </b-button >
                <b-modal
                  v-model="isComponentModalActive"
                  has-modal-card
                  :destroy-on-hide="false"
                  trapFocus
                  :on-cancel="refresh"
                  aria-role="dialog"
                  aria-label="Payout Modal"
                  close-button-aria-label="Close"
                  aria-modal>
                  <template>
                      <PolicyPayout v-bind:lnURL="policy.lnurl" @close="refresh"></PolicyPayout>
                  </template>
                </b-modal>
              </div>
              <b-tag v-else-if="props.row.status == 'delayed' && 
                props.row.withdrawn == true"
                class="is-grey"
                icon="check-circle">
                ausgezahlt
              </b-tag>
              <b-tag v-else-if="props.row.status == 'live'"
                class="is-info"
                icon="cog">
                Aktiv
              </b-tag>
              <b-tag v-else
                class="is-grey"
                icon="check-circle">
                pünktlich
              </b-tag>
            </b-table-column>
            <template #detail="props">
                <article class="media">
                    <figure class="media-left">
                        <b-icon pack="fas" type="is-dark" icon="train" size=is-medium></b-icon>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                          <div class="control" v-for="(leg, index) in policy.journey" :key="index">
                            <b-taglist attached class="mb-1">
                              <b-tag type="is-info" icon="train"></b-tag>
                              <b-tag icon="train" type="is-primary">
                                {{ leg.train }}
                              </b-tag>
                              <b-tag type="is-primary">
                                {{ leg.start_stop }} <b-icon pack="fas" icon="angle-right"></b-icon> {{ leg.arrival_stop }}
                              </b-tag>
                              <b-tag type="is-info">
                                {{ leg.start_time }}
                                <b-icon pack="fas" icon="angle-right"></b-icon>
                                {{ leg.arrival_time }}
                              </b-tag>
                            </b-taglist>
                          </div>
                            <p>
                              <strong>ID:</strong> {{ props.row.id }}
                            </p>
                        </div>
                    </div>
                </article>
            </template>
          </b-table>
      </div>
    </div>
  </div>
  <b-message v-else has-icon type="is-info">Logge dich mit deiner Lightning Wallet ein, um deine Absicherungen zu sehen.
  </b-message>
  </div>
</template>

<script> // TODO: arrival times correct?
// stores
import { useUserStore } from '@/stores/User'
import { useAppStore } from '@/stores/App'

// components
import PolicyPayout from '@/components/PolicyPayout.vue'

export default {
  setup () {
    const user = useUserStore()
    return {
      user,
      app
    }
  },
  components: {
    PolicyPayout
  },
  data () {
    return {
      defaultOpenedDetails: [1],
      showDetailIcon: true,
      isComponentModalActive: false
    }
  },
  mounted () {
    if (this.user.id != null) {
      this.getPolicies()
    }
  },
  methods: {
    refresh () {
      if (this.user.id != null) {
        // console.log("retrieving policies")
        this.getPolicies()
      }
    },
    async getPolicies() {
      const response = await fetch("http://localhost:4000/getPolicies", {
        credentials: 'include',
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      response.json().then(data => {
        if (data.length > 0) {
          this.user.policies = data
          //console.log(data)
        }
        else {
          this.user.policies = []
        }
        
      })
    },
    parseData (_policy) {
      const row = []
      /*
      let status = ''
      switch (_policy.status) {
        case 'live':
          status = 'aktiv'
          break
        case 'delayed':
          status = 'verspätet'
          break
        case 'awaiting payment':
          status = 'nicht bezahlt'
          break
        case 'punctual':
          status = 'pünktlich'
          break
      }
      */

      let premium = 0
      switch (_policy.type) {
        case 'small':
          premium = 3
          break
        case 'medium':
          premium = 5
          break
        case 'large':
          premium = 7
          break
      }

      row[0] = {
        plan: _policy.type,
        id: _policy.id,
        journey: _policy.journey,
        premium: premium,
        payout: _policy.payout,
        scheduledArrival: _policy.journey['leg_' + this.getLegNumber(_policy.journey)].arrival_time,
        status: _policy.status,
        withdrawn: _policy.withdrawn
      }
      return row
    },
    /*addZero (_number) {
      if (_number < 10) {
        _number = '0' + _number
      }
      return _number
    },
    getTimeString (_date) {
      const d = new Date(_date)
      return this.addZero(d.getHours()) + ':' + this.addZero(d.getMinutes())
    },*/

    getDateString (_date) {
      return new Date(_date).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getLegNumber (_legs) {
      return Object.keys(_legs).length
    }
  },
  name: 'AccountStatus'
}
</script>

<style scoped>
</style>
