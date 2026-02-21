type PlayOptions = {
  fadeInMs?: number;
  fadeOutMs?: number;
  volume?: number;
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private cache = new Map<string, AudioBuffer>();
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;

  createAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  async loadAudioBuffer(url: string) {
    const ctx = this.createAudioContext();
    if (!ctx) return null;
    if (this.cache.has(url)) return this.cache.get(url) ?? null;

    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(data);
    this.cache.set(url, buffer);
    return buffer;
  }

  private fadeNode(node: GainNode, to: number, ms: number) {
    const ctx = this.createAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(to, now + ms / 1000);
  }

  async playPhaseAudio(url: string, options: PlayOptions = {}) {
    const { fadeInMs = 800, volume = 0.6 } = options;
    const ctx = this.createAudioContext();
    if (!ctx) return this.playFallback(url, volume, fadeInMs);

    if (ctx.state === "suspended") await ctx.resume();

    try {
      const buffer = await this.loadAudioBuffer(url);
      if (!buffer) return;

      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.value = 0;
      source.start();
      this.fadeNode(gain, volume, fadeInMs);

      this.currentSource = source;
      this.currentGain = gain;
    } catch {
      this.playFallback(url, volume, fadeInMs);
    }
  }

  async crossfadeTo(urlNext: string, options: PlayOptions = {}) {
    const { fadeInMs = 1800, fadeOutMs = 1800, volume = 0.6 } = options;
    const prevGain = this.currentGain;
    const prevSource = this.currentSource;

    await this.playPhaseAudio(urlNext, { fadeInMs, volume });

    if (prevGain && prevSource) {
      this.fadeNode(prevGain, 0, fadeOutMs);
      window.setTimeout(() => {
        try {
          prevSource.stop();
        } catch {
          // noop
        }
      }, fadeOutMs + 80);
    }

    if (this.fallbackAudio) {
      this.fadeFallback(this.fallbackAudio, 0, fadeOutMs, true);
    }
  }

  setVolume(volume: number) {
    if (this.currentGain) {
      this.currentGain.gain.value = volume;
    }
    if (this.fallbackAudio) {
      this.fallbackAudio.volume = volume;
    }
  }

  stopAll() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // noop
      }
      this.currentSource = null;
    }
    if (this.currentGain) this.currentGain = null;

    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio = null;
    }
  }

  private playFallback(url: string, volume: number, fadeInMs: number) {
    if (typeof window === "undefined") return;
    if (this.fallbackAudio) this.fallbackAudio.pause();
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(() => undefined);
    this.fadeFallback(audio, volume, fadeInMs);
    this.fallbackAudio = audio;
  }

  private fadeFallback(audio: HTMLAudioElement, to: number, durationMs: number, stop = false) {
    const start = audio.volume;
    const diff = to - start;
    const startAt = performance.now();

    const step = (now: number) => {
      const p = Math.min(1, (now - startAt) / durationMs);
      audio.volume = start + diff * p;
      if (p < 1) {
        requestAnimationFrame(step);
      } else if (stop) {
        audio.pause();
      }
    };

    requestAnimationFrame(step);
  }
}

export const audioEngine = new AudioEngine();
