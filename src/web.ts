import { WebPlugin } from '@capacitor/core';

import type { AudioRecorderPlugin, RecorderState } from './definitions';

const _VERSION_ = '0.0.1';

export class AudioRecorderWeb extends WebPlugin implements AudioRecorderPlugin {
  private engineState: RecorderState = 'idle';
  private worker?: Worker;

  private setState(state: RecorderState) {
    this.engineState = state;
    this.notifyListeners('stateChanged', { state: this.engineState })
  }

  async getVersion(): Promise<{ value: string }> {
    console.log(`[AudioRecorderWeb] getVersion: ${_VERSION_}`);
    return { value: _VERSION_ };
  }

  async start(): Promise<void> {
    console.log(`[AudioRecorderWeb] start`);
    if (!this.worker) {
      this.worker = new Worker(new URL ('./audio.worker.js', import.meta.url).href, { type: 'module' });
      console.log("[AudioRecorderWeb] worker:", this.worker)
      // /*
      this.worker.onmessage = (e: any) => {
        console.log(`[AudioRecorderWeb] worker onmessage: ${JSON.stringify(e.data)}`);
      }
      this.worker.postMessage({
        cmd: 'init',
        config: { sampleRate: 44100, channels: 2, format: 'mp3' }
      })
      // */
    }
    this.setState('recording');
  }

  async stop(): Promise<void> {
    console.log(`[AudioRecorderWeb] stop`);
    this.worker?.postMessage({ cmd: 'finish' })
    this.setState('idle');
  }

  get state(): RecorderState {
    return this.engineState;
  }
}
