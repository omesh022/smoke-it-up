// Lightweight Web Audio sound engine — all sounds synthesized, no assets.
// Subtle, immersive SFX + a calm ambient music loop, with separate toggles + master volume.

const AUDIO_KEY = 'smokeItUp.audioPrefs.v2';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private exhale: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private musicStep = 0;

  private _musicOn = true;
  private _sfxOn = true;
  private _masterVol = 0.9;

  get musicOn() {
    return this._musicOn;
  }
  get sfxOn() {
    return this._sfxOn;
  }
  get masterVol() {
    return this._masterVol;
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem(AUDIO_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as { m?: boolean; s?: boolean; v?: number };
      if (typeof p.m === 'boolean') this._musicOn = p.m;
      if (typeof p.s === 'boolean') this._sfxOn = p.s;
      if (typeof p.v === 'number') this._masterVol = Math.max(0, Math.min(1, p.v));
    } catch {
      // ignore
    }
  }

  private savePrefs() {
    try {
      localStorage.setItem(AUDIO_KEY, JSON.stringify({ m: this._musicOn, s: this._sfxOn, v: this._masterVol }));
    } catch {
      // ignore
    }
  }

  setMusicOn(v: boolean) {
    this._musicOn = v;
    this.savePrefs();
    if (v) this.startMusic();
    else this.stopMusic();
  }

  setSfxOn(v: boolean) {
    this._sfxOn = v;
    this.savePrefs();
  }

  setMasterVolume(v: number) {
    this._masterVol = Math.max(0, Math.min(1, v));
    this.savePrefs();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._masterVol, this.ctx.currentTime, 0.05);
    }
  }

  /** Must be called from a user gesture (click/touch/keydown). */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => undefined);
      return;
    }
    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._masterVol;
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.45;
      this.sfxGain.connect(this.masterGain);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.3;
      this.musicGain.connect(this.masterGain);

      const len = Math.floor(this.ctx.sampleRate * 1.2);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      if (this._musicOn) this.startMusic();
    } catch {
      this.ctx = null;
    }
  }

  // ---------- helpers ----------
  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    when = 0,
    slideTo?: number
  ) {
    if (!this.ctx || !this.sfxGain || !this._sfxOn) return;
    try {
      const t0 = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // ignore
    }
  }

  private noise(dur: number, filterType: BiquadFilterType, freq: number, vol: number, when = 0) {
    if (!this.ctx || !this.sfxGain || !this.noiseBuf || !this._sfxOn) return;
    try {
      const t0 = this.ctx.currentTime + when;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const filt = this.ctx.createBiquadFilter();
      filt.type = filterType;
      filt.frequency.value = freq;
      filt.Q.value = 0.8;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.sfxGain);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
    } catch {
      // ignore
    }
  }

  // ---------- one-shots ----------
  playSfx(name: string) {
    if (!this._sfxOn) return;
    switch (name) {
      case 'inhale':
        this.noise(0.28, 'bandpass', 900, 0.22);
        this.tone(420, 0.28, 'sine', 0.08, 0, 180);
        break;
      case 'pop':
        this.tone(340, 0.18, 'triangle', 0.35, 0, 90);
        this.noise(0.16, 'lowpass', 1600, 0.2);
        break;
      case 'coin':
        this.tone(880, 0.12, 'sine', 0.25);
        this.tone(1320, 0.22, 'sine', 0.22, 0.07);
        break;
      case 'level':
        this.tone(523, 0.18, 'triangle', 0.28);
        this.tone(659, 0.18, 'triangle', 0.28, 0.09);
        this.tone(784, 0.18, 'triangle', 0.28, 0.18);
        this.tone(1046, 0.4, 'triangle', 0.3, 0.27);
        break;
      case 'challenge':
        this.tone(220, 0.3, 'square', 0.16);
        this.tone(196, 0.3, 'square', 0.16, 0.22);
        this.tone(220, 0.45, 'square', 0.16, 0.44);
        break;
      case 'eat':
        this.noise(0.08, 'lowpass', 700, 0.18);
        this.tone(620, 0.09, 'sine', 0.16, 0.02, 880);
        break;
      case 'drink':
        this.noise(0.35, 'highpass', 1800, 0.14);
        this.tone(520, 0.3, 'sine', 0.12, 0.05, 760);
        break;
      case 'cough':
        this.noise(0.16, 'lowpass', 420, 0.3);
        this.tone(180, 0.16, 'sawtooth', 0.1, 0, 90);
        break;
      case 'milestone':
        this.tone(1568, 0.25, 'sine', 0.2);
        this.tone(2093, 0.4, 'sine', 0.18, 0.1);
        break;
      case 'unlock':
        this.tone(659, 0.15, 'triangle', 0.26);
        this.tone(831, 0.15, 'triangle', 0.26, 0.09);
        this.tone(1046, 0.15, 'triangle', 0.26, 0.18);
        this.tone(1318, 0.5, 'triangle', 0.28, 0.27);
        this.noise(0.4, 'highpass', 4000, 0.08, 0.1);
        break;
      case 'event':
        this.tone(392, 0.12, 'sine', 0.18);
        this.tone(523, 0.12, 'sine', 0.18, 0.08);
        this.tone(659, 0.2, 'sine', 0.18, 0.16);
        break;
      case 'heart':
        this.tone(58, 0.12, 'sine', 0.4);
        this.tone(48, 0.1, 'sine', 0.22, 0.02);
        break;
      case 'breath':
        this.noise(0.5, 'bandpass', 500, 0.12);
        break;
      case 'gameover':
        this.tone(392, 0.3, 'sawtooth', 0.16);
        this.tone(311, 0.3, 'sawtooth', 0.16, 0.25);
        this.tone(233, 0.7, 'sawtooth', 0.16, 0.5);
        break;
      case 'click':
        this.tone(1200, 0.05, 'sine', 0.1);
        break;
      default:
        break;
    }
  }

  // ---------- exhale loop ----------
  setSmoking(on: boolean) {
    if (!this.ctx || !this.sfxGain || !this.noiseBuf) return;
    if (on && !this.exhale) {
      try {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        src.loop = true;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 520;
        const g = this.ctx.createGain();
        g.gain.value = 0;
        src.connect(filt);
        filt.connect(g);
        g.connect(this.sfxGain);
        src.start();
        g.gain.linearRampToValueAtTime(0.055, this.ctx.currentTime + 0.12);
        this.exhale = { src, gain: g };
      } catch {
        // ignore
      }
    } else if (!on && this.exhale) {
      try {
        const e = this.exhale;
        e.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        const s = e.src;
        setTimeout(() => {
          try {
            s.stop();
          } catch {
            // ignore
          }
        }, 150);
        this.exhale = null;
      } catch {
        this.exhale = null;
      }
    }
  }

  // ---------- ambient music ----------
  private chords: number[][] = [
    [110, 130.81, 164.81, 196], // Am7
    [87.31, 110, 130.81, 164.81], // Fmaj7
    [130.81, 164.81, 196, 246.94], // Cmaj7
    [98, 123.47, 146.83, 196], // G
  ];

  startMusic() {
    if (!this.ctx || !this.musicGain || !this._musicOn || this.musicTimer !== null) return;
    this.musicStep = 0;
    this.scheduleChord();
  }

  private scheduleChord() {
    if (!this.ctx || !this.musicGain || !this._musicOn) return;
    try {
      const chord = this.chords[this.musicStep % this.chords.length];
      const t0 = this.ctx.currentTime + 0.1;
      for (const f of chord) {
        for (const det of [-5, 5]) {
          const osc = this.ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.value = f;
          osc.detune.value = det;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'lowpass';
          filt.frequency.value = 460;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(0.024, t0 + 2.2);
          g.gain.linearRampToValueAtTime(0.0001, t0 + 4.3);
          osc.connect(filt);
          filt.connect(g);
          g.connect(this.musicGain);
          osc.start(t0);
          osc.stop(t0 + 4.5);
        }
      }
      this.musicStep++;
      this.musicTimer = setTimeout(() => this.scheduleChord(), 4100);
    } catch {
      // ignore
    }
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
