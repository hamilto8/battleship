export type SoundName =
  | "uiClick"
  | "place"
  | "invalid"
  | "fire"
  | "hit"
  | "miss"
  | "sink"
  | "win"
  | "lose";

/**
 * All sound effects are synthesised at runtime with the Web Audio API, so the
 * repo ships no audio assets and has no licensing concerns. The AudioContext is
 * created lazily on the first play so we respect browser autoplay policies
 * (audio only starts after a user gesture). Real audio files could later be
 * dropped in behind the same `play()` interface without touching call sites.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.master) {
      this.master.gain.value = this._muted ? 0 : 1;
    }
    return this._muted;
  }

  /** Ensure the AudioContext exists and is running. Call from a user gesture. */
  resume(): void {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") void ctx.resume();
  }

  play(name: SoundName): void {
    if (this._muted) return;
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;

    switch (name) {
      case "uiClick":
        this.tone({ freq: 320, dur: 0.05, type: "square", gain: 0.12, at: t });
        break;
      case "place":
        this.tone({ freq: 300, dur: 0.06, type: "triangle", gain: 0.18, at: t });
        this.tone({ freq: 460, dur: 0.08, type: "triangle", gain: 0.18, at: t + 0.06 });
        break;
      case "invalid":
        this.tone({ freq: 140, dur: 0.18, type: "sawtooth", gain: 0.18, at: t });
        break;
      case "fire":
        this.sweep({ from: 820, to: 180, dur: 0.32, type: "sine", gain: 0.2, at: t });
        break;
      case "miss":
        this.noise({ dur: 0.35, gain: 0.25, filter: 900, at: t }); // watery splash
        break;
      case "hit":
        this.noise({ dur: 0.4, gain: 0.4, filter: 1800, at: t }); // explosion
        this.tone({ freq: 90, dur: 0.4, type: "sawtooth", gain: 0.3, at: t });
        break;
      case "sink":
        this.noise({ dur: 0.7, gain: 0.45, filter: 1400, at: t });
        this.sweep({ from: 200, to: 40, dur: 0.8, type: "sawtooth", gain: 0.3, at: t });
        break;
      case "win":
        this.arpeggio([523, 659, 784, 1047], t, 0.14);
        break;
      case "lose":
        this.arpeggio([440, 349, 262, 196], t, 0.18);
        break;
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private tone(opts: {
    freq: number;
    dur: number;
    type: OscillatorType;
    gain: number;
    at: number;
  }): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freq, opts.at);
    g.gain.setValueAtTime(0.0001, opts.at);
    g.gain.exponentialRampToValueAtTime(opts.gain, opts.at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
    osc.connect(g).connect(this.master!);
    osc.start(opts.at);
    osc.stop(opts.at + opts.dur + 0.02);
  }

  private sweep(opts: {
    from: number;
    to: number;
    dur: number;
    type: OscillatorType;
    gain: number;
    at: number;
  }): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.from, opts.at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(opts.to, 1), opts.at + opts.dur);
    g.gain.setValueAtTime(0.0001, opts.at);
    g.gain.exponentialRampToValueAtTime(opts.gain, opts.at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
    osc.connect(g).connect(this.master!);
    osc.start(opts.at);
    osc.stop(opts.at + opts.dur + 0.02);
  }

  private noise(opts: {
    dur: number;
    gain: number;
    filter: number;
    at: number;
  }): void {
    const ctx = this.ensureContext();
    const frames = Math.floor(ctx.sampleRate * opts.dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      // White noise with a decay envelope for a percussive "boom".
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = opts.filter;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain, opts.at);
    g.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);
    src.connect(lp).connect(g).connect(this.master!);
    src.start(opts.at);
    src.stop(opts.at + opts.dur);
  }

  private arpeggio(freqs: number[], start: number, step: number): void {
    freqs.forEach((freq, i) => {
      this.tone({
        freq,
        dur: step * 1.6,
        type: "triangle",
        gain: 0.22,
        at: start + i * step,
      });
    });
  }
}

/** Shared instance used across the UI. */
export const sound = new SoundManager();
