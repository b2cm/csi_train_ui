<template>
	<div>
		<section class="footer is-primary py-4 has-text-light">
		  <div class="content has-text-centered">
		    <p class="">
		      <strong>TRAIN DELAY</strong> by
		      <a class="mr-2" href="https://csi.hs-mittweida.de/">Community Supported Insurance</a> | 
		      <a class="mx-2" @click="app.openPrivacy">Datenschutz</a> | 
		      <a class="mx-2" @click="app.openTerms">AGBs</a> | 
		      <a class="mx-2" @click="openImpressum">Impressum</a> |
		      <a class="mx-2" @click="openHelp">Hilfe</a>
		    </p>
		  </div>
		</section>
		<b-modal :active.sync="app.isPrivacyActive" :width="600" scroll="keep">
      <div class="box">
        <h1 class="title">Datenschutzbestimmungen</h1>
        <div v-for="(entry, index) in privacyData" :key="index" class="mb-4">
          <h4 class="has-text-weight-bold">{{ entry.title }}</h4>
          <p v-html="entry.text"></p>
        </div>
      </div>
    </b-modal>
    <b-modal :active.sync="app.isTermsActive" :width="600" scroll="keep">
      <div class="box">
        <h1 class="title">Allgmeine Geschäftsbedingungen</h1>
        <div v-for="(entry, index) in termsData" :key="index" class="mb-4">
          <h4 class="has-text-weight-bold">{{ entry.title }}</h4>
          <p v-html="entry.text"></p>
        </div>
      </div>
    </b-modal>
    <b-modal :active.sync="isImpressumActive" :width="600" scroll="keep">
      <div class="box">
        <h1 class="title">Impressum</h1>
      	<h4 class="has-text-weight-bold">Angaben gemäß § 5 TMG</h4>
      	<p>Etherisc GmbH<br>
					Ruth-Drexel-Str. 154<br>
					81927 München<br>
					Germany</p><br>
				<h4 class="has-text-weight-bold">Mail</h4>
				<p>contact@etherisc.com</p>
				<b-image :src="wirLogo"></b-image>
      </div>
    </b-modal>
    <b-modal :active.sync="isHelpActive" :width="600" scroll="keep">
    	<div class="box">
        <h1 class="title">Hilfe</h1>
      	<p>Es gibt ein Problem oder du benötigst Hilfe? Dann schreib uns eine Nachricht in unserer <a class="has-text-dark" href="https://t.me/+5JKl_wWyTPxlMDRi">Telegramgruppe.</a></p><br>
      	<div class="columns">
      		<div class="column">
      			<h4 class="has-text-weight-bold">Telegram</h4>
				<a href="https://t.me/+5JKl_wWyTPxlMDRi" target="_blank"><b-image class="is-128x128" :src="telegramQR"></b-image></a><br>
      		</div>
      		<div class="column">
      			<h4 class="has-text-weight-bold">Mail</h4>
				<p><a class="has-text-dark has-text-weight-normal" href="mailto:traindelay.io@gmail.com">traindelay.io@gmail.com</a></p>
      		</div>
      	</div>
				
				
      </div>
    </b-modal>
	</div>
</template>

<script>
	// stores
	import { useAppStore } from '@/stores/App'

	import wirLogoUrl from '@/assets/wir.png'
	import telegramQRUrl from '@/assets/telegramQR.png'
	import dePrivacyUrl from '@/assets/privacy-de.json'
	import deTermsUrl from '@/assets/terms-de.json'

	export default {
		setup () {
	    const app = useAppStore()
	    return {
	      app
	    }
	  },
		data () {
	    return {
	    	wirLogo: wirLogoUrl,
	    	telegramQR: telegramQRUrl,

	      isImpressumActive: false,
	      isHelpActive: false,
	      privacyData: dePrivacyUrl,
	      termsData: deTermsUrl
	    }
	  },
	  name: 'FooterBar',
	  methods: {
	  	openImpressum() {
	  		this.isImpressumActive = true
	  	},
	  	openHelp() {
	  		this.isHelpActive = true
	  	}
	  }
	}
</script>

<style scoped>
	.footer {
		/*position: absolute;
		bottom: 0px;*/
		width: 100%;
    background-color: transparent !important;
  }
  a, strong {
  	font-weight: bold;
    /*background-color: transparent !important;*/
    color: rgb(255, 255, 255, 1.0);
  }
  a:hover {
  	color: rgb(200, 200, 200, 1.0);
  }
</style>