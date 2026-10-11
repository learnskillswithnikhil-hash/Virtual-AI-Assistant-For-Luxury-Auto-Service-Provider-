// Audio utilities for Gemini 3.8 Live API WebSocket streaming

export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // little-endian
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const float32 = new Float32Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < float32.length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
  }
  return float32;
}

export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  public analyzer: AnalyserNode | null = null;

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      // 24kHz for Gemini Live model output
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.analyzer = this.audioCtx.createAnalyser();
      this.analyzer.fftSize = 64;
      this.analyzer.connect(this.audioCtx.destination);
    }
  }

  public async resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public playChunk(base64Pcm: string) {
    if (!this.audioCtx || !this.analyzer) return;
    this.resume();

    try {
      const float32 = base64ToFloat32(base64Pcm);
      if (float32.length === 0) return;

      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyzer);

      const currentTime = this.audioCtx.currentTime;
      // Scheduled gapless playback
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05; // tiny lead buffer to prevent clicks
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (err) {
      console.warn('Error playing audio chunk:', err);
    }
  }

  public stopAndClear() {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public close() {
    this.stopAndClear();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}
