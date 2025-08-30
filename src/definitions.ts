import type { PluginListenerHandle } from '@capacitor/core';
import { RecorderState, RecorderOptions } from './options';

export * from './options'

export interface AudioRecorderPlugin {
  getVersion(): Promise<{ value: string }>;
  getAnalyser(): AnalyserNode | null;
  getAudioUrl(): string | null;

  start(auto?: boolean, options?: Partial<RecorderOptions>): Promise<void>;
  stop(): Promise<void>;

  downloadAudio?(filename?: string): void;

  addListener(
    eventName: 'stateChanged',
    listenerFunc: (data: { state: RecorderState }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'analyserChanged',
    listenerFunc: (data: { analyser: any }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'audioUrlReady',
    listenerFunc: (data: { url: string | null }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'recordingTimeChanged',
    listenerFunc: (data: { time: number }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'volume',
    listenerFunc: (data: { rms: number; peak: number }) => void
  ): Promise<PluginListenerHandle>;

  removeAllListeners(): Promise<void>;
}
