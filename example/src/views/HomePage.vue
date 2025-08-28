<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Audio Recorder Plugin Example</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">

      <div>
        <ion-input label="Input:" v-model="inputValue" placeholder="Enter text"></ion-input>
        <ion-button @click="testPlugin">Test Plugin</ion-button>
        <p><ion-label>Result: {{ result }}</ion-label></p>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLabel, IonButton, IonInput } from '@ionic/vue';
import { ref } from 'vue';
import { AudioRecorder } from '@xinexcom/capacitor-plugin-audiorecorder';

const inputValue = ref('Hello World')
const result = ref('')

const testPlugin = async () => {
  const res = await AudioRecorder.echo({ value: inputValue.value })
  result.value = res.value
}
</script>

<style scoped>
</style>
