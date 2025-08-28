<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Audio Plugin Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <p><ion-label>Engine Version: {{ engineVersion }}</ion-label></p>
      <p><ion-label>Engine State: {{ engineState }}</ion-label></p>
      <div>
        <ion-button @click="start()">Start</ion-button>
        <ion-button @click="stop()">Stop</ion-button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonLabel } from '@ionic/vue';
import { AudioRecorder, RecorderState } from '@xinexcom/capacitor-plugin-audiorecorder'

const engineState = ref(<RecorderState>'idle')
const engineVersion = ref(<string>'')

function start() {
  console.log(`[App] start`)
  AudioRecorder.start()
}

function stop() {
  console.log(`[App] stop`)
  AudioRecorder.stop()
}

onMounted(async () => {
  const result = await AudioRecorder.getVersion()
  engineVersion.value = result.value

  AudioRecorder.addListener('stateChanged', (data: any) => {
    console.log(`[App] engine event: ${data.state}`)
    engineState.value = data.state;
  })
})

onUnmounted(async () => {
  await AudioRecorder.removeAllListeners()
})
</script>

<style scoped></style>
