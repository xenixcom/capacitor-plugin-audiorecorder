// utils/Logger.ts

import type { Ref } from 'vue'

export type LogLevel = 'log' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
}

export class Logger {
  private static _enabled = true
  private static _logs: LogEntry[] = []
  private static _max = 200
  private static _store: Ref<LogEntry[]> | null = null

  private static _original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  }

  /** 安裝攔截器 */
  static install() {
    console.log = (...args) => {
      if (Logger._enabled) Logger.append('log', args)
      Logger._original.log(...args)
    }

    console.warn = (...args) => {
      if (Logger._enabled) Logger.append('warn', args)
      Logger._original.warn(...args)
    }

    console.error = (...args) => {
      if (Logger._enabled) Logger.append('error', args)
      Logger._original.error(...args)
    }
  }

  /** 中止 Logger（保留 console 功能） */
  static disable() {
    Logger._enabled = false
  }

  /** 啟用 Logger */
  static enable() {
    Logger._enabled = true
  }

  /** 設定最大儲存筆數 */
  static setMax(n: number) {
    Logger._max = n
  }

  /** 綁定到外部 Pinia store */
  static setStore(store: Ref<LogEntry[]>) {
    Logger._store = store
    store.value = [...Logger._logs]
  }

  /** 取得所有 log */
  static getLogs(): LogEntry[] {
    return [...Logger._logs]
  }

  /** 清除所有 log */
  static clear() {
    Logger._logs = []
    if (Logger._store) Logger._store.value = []
  }

  /** 新增 log（內部使用） */
  static append(level: LogLevel, args: unknown[]) {
    const message = args.map(a =>
      typeof a === 'string' ? a : JSON.stringify(a)
    ).join(' ')

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    Logger._logs.push(entry)
    if (Logger._logs.length > Logger._max) {
      Logger._logs.shift()
    }

    if (Logger._store) {
      Logger._store.value = [...Logger._logs]
    }
  }

  static export(): string {
    return JSON.stringify(Logger._logs, null, 2)
  }
}


/*
1.	Logger 安裝位置
	•	記得在 app 入口（main.ts）最早呼叫一次 Logger.install()，並在 Pinia 建好後呼叫 Logger.setStore(useLoggerStore().logs)。不做這兩步，LogViewer 只會看到原生 console，而不會進 Pinia。
2.	Persist 設定
	•	你目前用的是「精簡版 store」，註解裡那段 createPersistedStore/indexedDBStorage 是預留。先確定這兩個 util 的路徑；若暫時沒有，要保留現在這版（非持久化）即可，避免匯入失敗。
3.	Ion 元件
	•	LogViewer.vue 用到 ion-segment / ion-toolbar / ion-buttons / ion-button / ion-icon。若是自動註冊（ionic/vue 官方插件）就 OK；否則記得在使用頁面或全域註冊。
4.	自動捲動
	•	onUpdated 以 store.autoscroll 控制 scroll 底部，OK。若 log 很密集時出現「搶 scroll」情況，可以之後再改成 requestAnimationFrame（先不動）。
5.	MockAudio 與檔案路徑
	•	MockAudio 預設讀 /test/test-audio.mp3，請確認 example/public/test/ 下確實有該檔，且大小寫一致。
6.	型別/相依
	•	Logger.append 會 JSON.stringify 非字串參數，若傳進來含循環參照的物件會丟錯（目前不需改，但之後若要打點大型物件要注意）。
*/