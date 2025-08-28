import type { PluginListenerHandle } from '@capacitor/core'

export type RecorderState = 'idle' | 'recording'

export interface AudioRecorderPlugin {
  getVersion(): Promise<{ value: string }>;

  start(): Promise<void>
  stop(): Promise<void>

  addListener(
    eventName: 'stateChanged',
    listenerFunc: (data: { state: RecorderState }) => void
  ): Promise<PluginListenerHandle>

  removeAllListeners(): Promise<void>
}
