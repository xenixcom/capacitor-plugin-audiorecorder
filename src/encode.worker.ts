/// <reference lib="webworker" />

import { Mp3Encoder } from '@breezystack/lamejs'

// Float32 PCM → Int16 PCM
function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  return output
}

// Stereo interleave
function interleave(left: Int16Array, right: Int16Array): Int16Array {
  const out = new Int16Array(left.length + right.length)
  let idx = 0
  for (let i = 0; i < left.length; i++) {
    out[idx++] = left[i]
    out[idx++] = right[i]
  }
  return out
}

// Build WAV
function buildWav(buffers: Int16Array[], sampleRate: number, channels: number): Blob {
  const totalSamples = buffers.reduce((sum, b) => sum + b.length, 0)
  const dataSize = totalSamples * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  buffers.forEach(b => {
    const bytes = new Uint8Array(b.buffer)
    new Uint8Array(buffer, offset, bytes.length).set(bytes)
    offset += bytes.length
  })

  return new Blob([view], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

// Internal worker state
let config: {
  channels: number
  sampleRate: number
  format: 'wav' | 'mp3'
  bitrate?: number
}
let encoder: any
let mp3Chunks: Uint8Array[] = []
let wavBuffers: Int16Array[] = []
let initialized = false

self.onmessage = (e: MessageEvent) => {
  const data = e.data

  switch (data.cmd) {
    case 'init': {
      console.log(`[Worker] init config: ${JSON.stringify(data.config)}`)
      config = data.config
      initialized = true

      if (config.format === 'mp3') {
        encoder = new Mp3Encoder(
          config.channels,
          config.sampleRate,
          config.bitrate || 128
        )
        mp3Chunks = []
      } else {
        wavBuffers = []
      }
      break
    }

    case 'encode': {
      console.log(`[Worker] encode data length: ${data.bufferL?.length}, ${data.bufferR?.length}`)
      if (!initialized) return

      const bufferL = data.bufferL as Float32Array
      const bufferR = data.bufferR as Float32Array | undefined
      const leftPCM = floatTo16BitPCM(bufferL)

      if (config.format === 'mp3') {
        let mp3buf
        if (config.channels === 2 && bufferR) {
          const rightPCM = floatTo16BitPCM(bufferR)
          mp3buf = encoder.encodeBuffer(leftPCM, rightPCM)
        } else {
          mp3buf = encoder.encodeBuffer(leftPCM)
        }
        if (mp3buf.length > 0) {
          mp3Chunks.push(mp3buf)
        }
      } else {
        if (config.channels === 2 && bufferR) {
          const rightPCM = floatTo16BitPCM(bufferR)
          wavBuffers.push(interleave(leftPCM, rightPCM))
        } else {
          wavBuffers.push(leftPCM)
        }
      }
      break
    }

    case 'finish': {
      console.log(`[Worker] finish`)
      if (!initialized) return

      if (config.format === 'mp3') {
        const flush = encoder.flush()
        if (flush.length > 0) {
          mp3Chunks.push(flush)
        }
        const blob = new Blob(mp3Chunks as any, { type: 'audio/mpeg' })
        self.postMessage({
          cmd: 'end',
          blob,
          format: 'mp3',
          sampleRate: config.sampleRate,
          channels: config.channels
        })
      } else {
        const blob = buildWav(wavBuffers, config.sampleRate, config.channels)
        self.postMessage({
          cmd: 'end',
          blob,
          format: 'wav',
          sampleRate: config.sampleRate,
          channels: config.channels
        })
      }

      break
    }
  }
}