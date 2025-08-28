import { WebPlugin } from '@capacitor/core';
import type { AudioRecorderPlugin, RecorderOptions, RecorderState } from './definitions';

const _VERSION_ = '0.1.0';

export const DefaultRecorderOptions: Required<RecorderOptions> = {
  channels: 2,
  sampleRate: 44100,
  sampleSize: 16,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  format: 'mp3',
  monitorPlayback: false,
};

export class AudioRecorderWeb extends WebPlugin implements AudioRecorderPlugin {
  private engineState: RecorderState = 'idle';
  private worker?: Worker;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private stream?: MediaStream;
  private blob: Blob | null = null;
  private audioUrl: string | null = null;
  private options: Required<RecorderOptions> = DefaultRecorderOptions;
  private recordingStartTime = 0;
  private recordingTimerId: any = null;
  private workletNode?: AudioWorkletNode;

  private setState(state: RecorderState): void {
    this.engineState = state;
    this.notifyListeners('stateChanged', { state });
  }

  private notifyRecordingTime(): void {
    const time = Math.floor((Date.now() - this.recordingStartTime) / 1000);
    this.notifyListeners('recordingTimeChanged', { time });
  }

  private startTimer(): void {
    this.recordingStartTime = Date.now();
    this.recordingTimerId = setInterval(() => this.notifyRecordingTime(), 1000);
  }

  private stopTimer(): void {
    if (this.recordingTimerId !== null) {
      clearInterval(this.recordingTimerId);
      this.recordingTimerId = null;
    }
  }

  get state(): RecorderState {
    return this.engineState;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser || null;
  }

  getAudioUrl(): string | null {
    return this.audioUrl;
  }

  async getVersion(): Promise<{ value: string }> {
    return { value: _VERSION_ };
  }

  async start(partialOptions: Partial<RecorderOptions> = {}): Promise<void> {
    this.options = { ...DefaultRecorderOptions, ...partialOptions };

    const {
      channels,
      sampleRate,
      echoCancellation,
      noiseSuppression,
      autoGainControl,
      format,
      monitorPlayback,
    } = this.options;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: channels,
        sampleRate,
        echoCancellation,
        noiseSuppression,
        autoGainControl,
      },
      video: false,
    });

    this.audioContext = new AudioContext({ sampleRate });

    await this.audioContext.audioWorklet.addModule(
      new URL('./recorder-processor.js', import.meta.url).href
    );

    const source = this.audioContext.createMediaStreamSource(this.stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;

    this.workletNode = new AudioWorkletNode(this.audioContext, 'recorder-processor', {
      numberOfInputs: 1,
      numberOfOutputs: monitorPlayback ? 1 : 0,
      channelCount: channels,
      channelCountMode: 'explicit',
    });

    this.worker = new Worker(new URL('./encode.worker.js', import.meta.url).href, { type: 'module' });

    this.worker.postMessage({
      cmd: 'init',
      config: { sampleRate, channels, format },
    });

    this.workletNode.port.onmessage = (e: MessageEvent) => {
      const { bufferL, bufferR, volume } = e.data;

      this.worker?.postMessage({ cmd: 'encode', bufferL, bufferR }, [
        bufferL.buffer,
        bufferR.buffer,
      ]);

      if (volume) {
        this.notifyListeners('volume', volume); // 送出 rms / peak 給前端
      }
    };

    source.connect(this.analyser).connect(this.workletNode);

    if (monitorPlayback) {
      this.workletNode.connect(this.audioContext.destination); // 錄音監聽
    }

    this.notifyListeners('analyserChanged', { analyser: this.analyser });

    this.setState('recording');
    this.startTimer();
  }

  async stop(): Promise<void> {
    if (!this.worker) return;

    const waitForEnd = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.worker?.removeEventListener('message', onEnd);
        reject(new Error("Worker did not respond with 'end' in time."));
      }, 5000);

      const onEnd = (e: MessageEvent) => {
        if (e.data?.cmd === 'end') {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', onEnd);
          this.blob = e.data.blob;
          this.audioUrl = this.blob ? URL.createObjectURL(this.blob) : null;
          this.notifyListeners('audioUrlReady', { url: this.audioUrl });
          resolve();
        }
      };

      this.worker?.addEventListener('message', onEnd);
      this.worker?.postMessage({ cmd: 'finish' });
    });

    this.stopTimer();

    this.analyser?.disconnect();
    this.workletNode?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());

    await this.audioContext?.close();

    try {
      await waitForEnd;
    } catch (e) {
      console.warn('[AudioRecorderWeb] Worker finish timeout:', e);
    }

    this.worker.terminate();
    this.worker = undefined;
    this.workletNode = undefined;
    this.audioContext = undefined;
    this.analyser = undefined;
    this.stream = undefined;

    this.notifyListeners('analyserChanged', { analyser: null });
    this.setState('idle');
  }

  downloadAudio(filename: string = 'recording.mp3'): void {
    if (!this.blob) {
      console.warn('[AudioRecorderWeb] No recording to download.');
      return;
    }

    const url = this.audioUrl || URL.createObjectURL(this.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
