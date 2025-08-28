import type { PluginListenerHandle } from '@capacitor/core';

export type RecorderState = 'idle' | 'recording';

export interface RecorderOptions {
  channels?: 1 | 2;
  sampleRate?: number;
  sampleSize?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  format?: 'wav' | 'mp3';
  monitorPlayback?: boolean;
}

export interface AudioRecorderPlugin {
  getVersion(): Promise<{ value: string }>;
  getAnalyser(): AnalyserNode | null;
  getAudioUrl(): string | null;

  start(options?: Partial<RecorderOptions>): Promise<void>;
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
