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
      <p><ion-label>Recording Time: {{ formattedTime }}s</ion-label></p>
      <p><ion-label>RMS: {{ rms.toFixed(3) }} / Peak: {{ peak.toFixed(3) }}</ion-label></p>
      <div>
        <ion-button @click="start()">Start</ion-button>
        <ion-button @click="stop()">Stop</ion-button>
        <ion-button @click="download">Download</ion-button>
      </div>

      <p>
        <MockAudio></MockAudio>
      </p>

      <AudioVisualizer :analyser="analyser"></AudioVisualizer>

      <p><audio controls style="width: 100%;"></audio></p>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonLabel
} from '@ionic/vue';
import { AudioRecorder, RecorderState } from '@xinexcom/capacitor-plugin-audiorecorder'
import AudioVisualizer from '@/components/AudioVisualizer.vue';
import MockAudio from '@/components/MockAudio.vue';

const engineVersion = ref<string>('');
const engineState = ref<RecorderState>('idle');
const analyser = ref<AnalyserNode | null>(null);
const recordingTime = ref<number>(0);
const rms = ref<number>(0);
const peak = ref<number>(0);

const formattedTime = computed(() => {
  const minutes = Math.floor(recordingTime.value / 60);
  const seconds = recordingTime.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

function start() {
  console.log(`[App] start`);
  AudioRecorder.start()
}

function stop() {
  console.log(`[App] stop`);
  AudioRecorder.stop();
}

function download() {
  console.log(`[App] download`);
  AudioRecorder.downloadAudio?.();
}

onMounted(async () => {
  const result = await AudioRecorder.getVersion();
  engineVersion.value = result.value;

  AudioRecorder.addListener('stateChanged', (data: any) => {
    engineState.value = data.state;
  });

  AudioRecorder.addListener('analyserChanged', (data: any) => {
    analyser.value = data.analyser;
  });

  AudioRecorder.addListener('recordingTimeChanged', (data: any) => {
    recordingTime.value = data.time;
  });

  AudioRecorder.addListener('volume', (data: any) => {
    rms.value = data.rms ?? 0;
    peak.value = data.peak ?? 0;
  });

  AudioRecorder.addListener('audioUrlReady', (data) => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.src = data.url || '';
      audioElement.load();
    }
  });
});

onUnmounted(async () => {
  await AudioRecorder.removeAllListeners();
});
</script>

<style scoped></style>
