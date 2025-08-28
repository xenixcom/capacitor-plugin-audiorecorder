<template>
  <div class="mock-audio">
    <div class="row">
      <span class="state">{{ state }}</span>
      <select v-model="mode" @change="changeMode">
        <option value="audio">AUDIO</option>
        <option value="osc">OSC</option>
      </select>
      <input type="range" min="0" max="1" step="0.01" v-model.number="volume" @input="changeVolume" />
    </div>
    <div class="row">
      <ion-button @click="togglePlay">{{ isPlaying ? 'STOP' : 'PLAY' }}</ion-button>
      <ion-button @click="togglePause" :disabled="!isPlaying">{{ isPaused ? 'RESUME' : 'PAUSE' }}</ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonButton } from '@ionic/vue'
import { MockAudio, MockAudioMode } from '@/utils/mockAudio'

const audio = new MockAudio()

const mode = ref<MockAudioMode>('audio')
const state = ref<string>('idle')
const isPlaying = ref(false)
const isPaused = ref(false)
const volume = ref(1.0)

function changeMode() {
  audio.setMode(mode.value)
  state.value = audio.getState()
}

function changeVolume() {
  audio.setVolume(volume.value)
}

async function togglePlay() {
  if (!isPlaying.value) {
    await audio.start()
    isPlaying.value = true
    isPaused.value = false
  } else {
    audio.stop()
    isPlaying.value = false
    isPaused.value = false
  }
  state.value = audio.getState()
}

function togglePause() {
  if (isPaused.value) {
    audio.resume()
    isPaused.value = false
  } else {
    audio.pause()
    isPaused.value = true
  }
  state.value = audio.getState()
}
</script>

<style scoped>
.mock-audio {
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 6px;
}

.row {
  /* margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  */
  padding: 8px 0;
  display: flex;
  justify-content: space-between;
}

.state {
  font-weight: bold;
  color: #007acc;
}
</style>