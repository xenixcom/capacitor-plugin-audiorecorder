// src/options.ts

export type RecorderState =
  | 'idle'
  | 'calibrating'
  | 'notifying'
  | 'waiting'
  | 'recording'
  | 'stopping'
  | 'error'

export interface InputOptions {
  sampleRate: number
  sampleSize: number
  channelCount: number
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
  micGain: number
}

export type OutputFormat = 'wav' | 'mp3'

export interface OutputOptions {
  format: OutputFormat
}

export interface MonitorOptions {
  enable: boolean
  volume: number            // 0.0 ~ 1.0
}

export interface NotificationOptions {
  enable: boolean
  volume: number            // 0.0 ~ 1.0
}

export interface CalibrationOptions {
  enable: boolean
  duration: number          // 校準時間（ms）
  startFactor: number       // 起始門檻（倍數)
  stopFactor: number        // 結束門檻（倍數)
}

export interface DetectionOptions {
  enable: boolean
  startThreshold: number    // 若 calibration.enable=true，會以校準結果覆寫
  stopThreshold: number     // 同上
  startHoldMs: number       // 連續超過門檻多久才觸發開始
  stopHoldMs: number        // 連續低於門檻多久才觸發結束
  preRecordMs: number       // 用於 prebuffer
  minRecordMs: number       // 錄製至少多久才允許自動停止（避免誤觸）
  maxRecordMs: number       // 最長錄製時間，超過會自動停止
}

export interface DspOptions {
  enable: boolean
}

export interface HistoryItem {
  id: string
  url: string
  size: number
  type: string
  createdAt: number
  duration?: number
}

export interface HistoryOptions {
  enable: boolean
  maxItems: number
}

export interface RecorderOptions {
  input: InputOptions
  output: OutputOptions
  monitor: MonitorOptions
  notification: NotificationOptions
  calibration: CalibrationOptions
  detection: DetectionOptions
  dsp: DspOptions
  history: HistoryOptions
  debug: boolean
}

export const DefaultRecorderOptions: RecorderOptions = {
  input: {
    sampleRate: 16000,
    sampleSize: 16,
    channelCount: 1,
    echoCancellation: false,
    noiseSuppression: true,
    autoGainControl: false,
    micGain: 1.0,
  },
  output: {
    format: 'wav',
  },
  monitor: {
    enable: false,
    volume: 0.5,
  },
  notification: {
    enable: true,
    volume: 0.5,
  },
  calibration: {
    enable: true,
    duration: 3000,
    startFactor: 3.0,
    stopFactor: 1.5,
  },
  detection: {
    enable: true,
    startThreshold: 0.10,   
    stopThreshold: 0.08,    
    startHoldMs: 2000,
    stopHoldMs: 3000,       
    preRecordMs: 2000,    
    minRecordMs: 3000,      
    maxRecordMs: 60 * 60 * 1000,
  },
  dsp: {
    enable: false,
  },
  history: {
    enable: true,
    maxItems: 20,
  },
  debug: false,
}
