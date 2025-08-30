import { WebPlugin } from '@capacitor/core';
import type { AudioRecorderPlugin, } from './definitions';
import { RecorderOptions, RecorderState, DefaultRecorderOptions as DefaultOptions } from './options';

const _VERSION_ = '0.2.0';

export class AudioRecorderWeb extends WebPlugin implements AudioRecorderPlugin {

  private options?: RecorderOptions;
  private state: RecorderState = 'idle';

  async start(auto: boolean = false, partialOptions: Partial<RecorderOptions> = {}): Promise<void> {
    this.options = { ...DefaultOptions, ...partialOptions };
    console.log('[AudioRecorderWeb] start with options:', JSON.stringify(this.options, null, 2), 'version:', _VERSION_, 'auto:', auto, 'state:', this.state);
  }

  async stop(): Promise<void> {}

  getVersion(): Promise<{ value: string; }> {
    return Promise.resolve({ value: _VERSION_ });
  }

  getAnalyser(): AnalyserNode | null {
    return null;
  }

  getAudioUrl(): string | null {
    return null;
  }

  downloadAudio(filename: string): void {
    console.log('[AudioRecorderWeb] downloadAudio', filename);
  }
}
