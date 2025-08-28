<template>
  <div ref="containerRef" class="visualizer-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, Ref } from 'vue'

const props = defineProps<{
  analyser: AnalyserNode | null | undefined //Ref<AnalyserNode | null>
  type?: 'bars' | 'waveform'
  gain?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

let animationId = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (canvas && container) {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }
}

function clearCanvas() {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

function drawWaveform(ctx: CanvasRenderingContext2D, analyser: AnalyserNode, canvas: HTMLCanvasElement, gain: number) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#3dc2ff'

  const sliceWidth = canvas.width / bufferLength
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    const v = (dataArray[i] - 128) / 128.0
    const y = (v * canvas.height * gain) / 2 + canvas.height / 2
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    x += sliceWidth
  }
  ctx.lineTo(canvas.width, canvas.height / 2)
  ctx.stroke()
}

function drawBars(ctx: CanvasRenderingContext2D, analyser: AnalyserNode, canvas: HTMLCanvasElement, gain: number) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  const barWidth = canvas.width / bufferLength
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i]
    const barHeight = (value / 255) * canvas.height * gain
    ctx.fillStyle = '#3dc2ff'
    ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight)
  }
}

function drawFrame() {
  const canvas = canvasRef.value
  const analyser = props.analyser //.value
  const gain = props.gain ?? 1

  if (!canvas || !analyser) {
    clearCanvas()
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas()
  ctx.fillStyle = 'rgba(241, 241, 241, 0.3)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (props.type === 'waveform') {
    drawWaveform(ctx, analyser, canvas, gain)
  } else {
    drawBars(ctx, analyser, canvas, gain)
  }

  animationId = requestAnimationFrame(drawFrame)
}

function stopDrawing() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = 0
  }
  clearCanvas()
}

function startDrawing() {
  stopDrawing()
  if (props.analyser) {
    animationId = requestAnimationFrame(drawFrame)
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(containerRef.value)
  }
  if (props.analyser) startDrawing()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  stopDrawing()
})

watch(() => props.analyser, (val) => {
  val ? startDrawing() : stopDrawing()
}, { immediate: true })
</script>

<style scoped>
.visualizer-container {
  width: 100%;
  height: 100px;
  background-color: #f1f1f1;
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>