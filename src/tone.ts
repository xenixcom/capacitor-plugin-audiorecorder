export class TonePlayer {
  private ctx: AudioContext;
  private playing = false;
  private queue: (() => Promise<void>)[] = [];

  constructor() {
    this.ctx = new AudioContext();
  }

  async play(freqs: number[], durationMs: number, volume: number): Promise<void> {
    return new Promise((resolve) => {
      console.log(`[TonePlayer] play: freqs=${freqs}, durationMs=${durationMs}, volume=${volume}`);
      // 把播放任務放入佇列
      this.queue.push(async () => {
        for (const freq of freqs) {
          await this.playTone(freq, durationMs, volume);
        }
      });

      // 啟動播放
      this.processQueue().then(() => resolve());
    });
  }

  private async processQueue() {
    if (this.playing) return; // 正在播放，不重複執行

    this.playing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }

    this.playing = false;
  }

  private playTone(freq: number, durationMs: number, volume: number): Promise<void> {
    const ctx = this.ctx;
    return new Promise((resolve) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(volume, ctx.currentTime + (durationMs / 1000) - 0.1);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (durationMs / 1000));

      osc.onended = () => resolve();
    });
  }
}

/*
1.	共同介面/行為

	•	參數（freqs: number[] | List、durationMs/duration、volume）一致性 OK。
	•	「序列播放＋淡入淡出包絡」在三端都有實作，結束自動釋放資源 ✅。
	•	建議在插件層包一個跨端 API：playNotification({ mode:‘start’|‘stop’, volume })，把模式→頻率序列的對應放同一處（避免三處各自定義）。

2.	Web（TypeScript）

	•	AudioContext 在 constructor 即 new：iOS/Safari 會因未經使用者手勢而 suspended。建議延遲建立或在第一次播放前 ensure resume()。
	•	佇列邏輯：play() 將任務推入 queue，processQueue 串行執行，playing 鎖避免重入，合理。
	•	可加一點保護：在 processQueue 前 await ctx.resume()（避免首次被阻）。
	•	線性 ramp 0.1s 淡入/淡出 OK；若要更平順，可改用 expRamp，但非必要。

3.	Android（Kotlin）

	•	目前使用舊式 AudioTrack 建構子（STREAM_MUSIC）。新 SDK 建議用 AudioAttributes + AudioFormat 建構 AudioTrack（留待之後強化）。
	•	write() 預設阻塞，一次把 samples 寫完後 stop/release，沒問題。
	•	volume 直接乘樣本值 OK；另可補 setVolume()（對部份裝置有效）。
	•	建議補：使用 USAGE_ASSISTANCE_SONIFICATION 或 USAGE_MEDIA 的 AudioAttributes，避免某些情況被通知音量/鈴聲路徑影響。
	•	若未來要並行播放多段，記得不要每次都 new/stop/release，可做簡易池化（現在先不用）。

4.	iOS（Swift / AVAudioEngine）

	•	建議在播放前設定 AVAudioSession 類別與啟用：
	•	只播提示音：.soloAmbient 或 .ambient。
	•	若未來要與錄音並存：.playAndRecord 並加 .defaultToSpeaker / .allowBluetooth。
	•	目前程式碼沒有設 session；有些機型會靜音或受靜音鍵影響。
	•	你在背景執行緒建立/啟動 engine 沒問題，但 session 設定通常放主緒（規範較穩）。
	•	淡入淡出以 20% 長度做包絡 OK。播放完成 callback 有呼叫 engine.stop()、completion() ✅。
	•	若未來多次快速呼叫 play，現在的 stop() → 釋放 → 重建流程可承受，但可考慮保留 engine、只換 buffer（之後再優化）。

5.	體驗一致性

	•	start/stop 頻率序列請在插件層統一（例如 start: [880, 1320]、stop: [660]），三端共用同一套 mapping，避免行為飄移。
	•	建議把音量區間統一為 0.0–1.0，並在各端 clamp。

6.	之後接線（等你說「貼完了」再動）

	•	在 Capacitor plugin 的 web.ts / Android Plugin / iOS Plugin，統一導出 playNotification({mode, volume})，內部轉 freq 序列後呼叫 TonePlayer。
	•	加上最基本防抖：同一時刻僅一則 tone 在播，重複呼叫排入 queue（你 web 已有 queue，Android/iOS 目前是 stop→播，行為 OK）。

7.	小坑預警

	•	iOS 靜音鍵：若要無視靜音鍵，得用 .playAndRecord 或 .playback；若尊重靜音鍵，用 .ambient。看你錄音情境而定。
	•	Web 首次播放權限：務必確保用戶手勢（點按）後才 play/resume。
	•	多媒體並行（之後）：和錄音同時播放提示音時的路由、ducking（降低其他音量）要由 session/attributes 決定。

要我下一步幫你：
	•	我可以把三端的「playNotification({mode, volume})」在 plugin 端對齊、補上 iOS 的 AVAudioSession 設定、Android 的 AudioAttributes 範本，並寫最小測試程式（保留你現有的 MockAudio 與 LogViewer）。

*/