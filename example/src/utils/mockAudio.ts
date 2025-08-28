/**
 * utils/mockAudio.ts
 * -------------------------------------
 * 用來產生測試音訊：
 * - mode = 'osc' 用 Oscillator 產生音頻
 * - mode = 'audio' 播放外部 audio file
 * - 可控制 start / stop / pause / resume
 * - 獨立 AudioContext
 */

export type MockAudioMode = 'osc' | 'audio'
export type MockAudioState = 'idle' | 'playing' | 'paused' | 'stopped'

export class MockAudio {
  private ctx: AudioContext
  private gainNode: GainNode
  private oscNode: OscillatorNode | null = null
  private audioBufferSource: AudioBufferSourceNode | null = null
  private buffer: AudioBuffer | null = null
  private state: MockAudioState = 'idle'
  private mode: MockAudioMode = 'audio'
  private volume: number = 1.0
  private readonly fileUrl = '/test/test-audio.mp3'

  constructor() {
    this.ctx = new AudioContext()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = this.volume
    this.gainNode.connect(this.ctx.destination)
  }

  setMode(mode: MockAudioMode) {
    this.mode = mode
    console.log(`[MockAudio] Mode set to: ${mode}`)
  }

  getState(): MockAudioState {
    return this.state
  }

  setVolume(vol: number) {
    this.volume = vol
    this.gainNode.gain.value = this.volume
    console.log(`[MockAudio] Volume set to: ${vol}`)
  }

  async start() {
    console.log(`[MockAudio] start() called in mode ${this.mode}`)

    await this.ctx.resume()

    if (this.mode === 'osc') {
      this.oscNode = this.ctx.createOscillator()
      this.oscNode.type = 'sine'
      this.oscNode.frequency.value = 440
      this.oscNode.connect(this.gainNode)
      this.oscNode.start()
      this.state = 'playing'
      console.log(`[MockAudio] Oscillator started.`)

    } else if (this.mode === 'audio') {
      if (!this.buffer) {
        console.log(`[MockAudio] Loading audio file...`)
        const response = await fetch(this.fileUrl)
        const arrayBuffer = await response.arrayBuffer()
        this.buffer = await this.ctx.decodeAudioData(arrayBuffer)
        console.log(`[MockAudio] Audio file loaded.`)
      }

      this.audioBufferSource = this.ctx.createBufferSource()
      this.audioBufferSource.buffer = this.buffer
      this.audioBufferSource.connect(this.gainNode)
      this.audioBufferSource.loop = true
      this.audioBufferSource.start()
      this.state = 'playing'
      console.log(`[MockAudio] Audio buffer playback started.`)
    }
  }

  pause() {
    if (this.state !== 'playing') return

    this.ctx.suspend()
    this.state = 'paused'
    console.log(`[MockAudio] Paused.`)
  }

  resume() {
    if (this.state !== 'paused') return

    this.ctx.resume()
    this.state = 'playing'
    console.log(`[MockAudio] Resumed.`)
  }

  stop() {
    if (this.mode === 'osc' && this.oscNode) {
      this.oscNode.stop()
      this.oscNode.disconnect()
      this.oscNode = null
    }

    if (this.mode === 'audio' && this.audioBufferSource) {
      this.audioBufferSource.stop()
      this.audioBufferSource.disconnect()
      this.audioBufferSource = null
    }

    this.state = 'stopped'
    console.log(`[MockAudio] Stopped.`)
  }
}