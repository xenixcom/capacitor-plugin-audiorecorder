// recorder-processor.ts

// 先聲明 Web Audio Worklet 相關全域物件及型別，避免 TS 報錯

declare var registerProcessor: (name: string, processorCtor: any) => void;

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const bufferL = input[0];
    const bufferR = input.length > 1 ? input[1] : bufferL;

    // 計算 RMS 和 Peak
    let sumL = 0, peakL = 0;
    let sumR = 0, peakR = 0;

    for (let i = 0; i < bufferL.length; i++) {
      const l = bufferL[i];
      const r = bufferR[i];

      sumL += l * l;
      sumR += r * r;

      peakL = Math.max(peakL, Math.abs(l));
      peakR = Math.max(peakR, Math.abs(r));
    }

    const rms = Math.sqrt((sumL + sumR) / (bufferL.length * 2));
    const peak = Math.max(peakL, peakR);

    this.port.postMessage({
      bufferL: bufferL.slice(),
      bufferR: bufferR.slice(),
      volume: { rms, peak },
    }, [bufferL.buffer, bufferR.buffer]);

    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
