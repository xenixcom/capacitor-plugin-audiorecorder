<!-- components/LogViewer.vue -->
<template>
  <div id="container">
    <ion-segment v-model="store.filterLevel" mode="ios">
      <ion-segment-button value="all">
        <ion-label>All</ion-label>
      </ion-segment-button>
      <ion-segment-button value="log">
        <ion-label>Log</ion-label>
      </ion-segment-button>
      <ion-segment-button value="warn">
        <ion-label>Warn</ion-label>
      </ion-segment-button>
      <ion-segment-button value="error">
        <ion-label>Error</ion-label>
      </ion-segment-button>
    </ion-segment>
    <div class="log-list" ref="listRef">
      <details v-for="(log, i) in filteredLogs" :key="i" :class="['log-entry', log.level]" open>
        <summary>{{ log.timestamp }} [{{ log.level }}]</summary>
        <pre>{{ log.message }}</pre>
      </details>
    </div>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button size="small" @click="store.autoscroll = !store.autoscroll">
          <ion-icon :icon="store.autoscroll ? eyeOutline : eyeOffOutline"></ion-icon>
        </ion-button>
        <ion-button size="small" @click="download()">
          <ion-icon :icon="downloadOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button size="small" @click="Logger.clear()">
          <ion-icon :icon="trashOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </div>
</template>

<script setup lang="ts">
import { eyeOutline, eyeOffOutline, downloadOutline, trashOutline } from 'ionicons/icons';
import { onUpdated, ref, computed } from 'vue'
import { useLoggerStore } from '@/stores/loggerStore'
import { Logger } from '@/utils/Logger'

const store = useLoggerStore()
const listRef = ref<HTMLDivElement | null>(null)

const filteredLogs = computed(() => {
  if (store.filterLevel === 'all') return store.logs
  return store.logs.filter((l) => l.level === store.filterLevel)
})

function download() {
  const blob = new Blob([Logger.export()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'logs.json'
  a.click()
  URL.revokeObjectURL(url)
}

onUpdated(() => {
  if (store.autoscroll && listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
})
</script>

<style scoped>
#container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;
  height: 250px;
  background: #e8e8e8;
}

ion-toolbar {
  border-top: 1px solid #dad9d9;
  --min-height: 0;
  --background: transparent;
}

ion-segment {
  border-bottom: 1px solid #dad9d9;
  border-radius: 0;
  --background: transparent;
  padding: 2px;
}

.log-list {
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.75rem;
  background: #fffcef;
  padding: 10px 6px;
}

.log-entry {
  margin-bottom: 0.25rem;
  border-left: 2px solid transparent;
  padding-left: 0.5rem;
}

.log-entry.log {
  border-color: #888;
}

.log-entry.warn {
  border-color: orange;
  background-color: #fffbe6;
}

.log-entry.error {
  border-color: red;
  background-color: #ffe6e6;
}

summary {
  cursor: pointer;
  font-size: 90%;
  color: #8a8a8a;
  margin-bottom: 0.2rem;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
