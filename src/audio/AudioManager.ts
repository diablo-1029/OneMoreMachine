import type { GameSettings } from '../core/save/SaveSchema';

export type SoundId =
  | 'click'
  | 'place'
  | 'remove'
  | 'error'
  | 'coin'
  | 'miner'
  | 'furnace'
  | 'assembler'
  | 'rotate'
  | 'thunk';

/** Minimum seconds between two plays of the same sound, so a busy factory never becomes a wall of noise. */
const COOLDOWNS: Record<SoundId, number> = {
  click: 0.03,
  place: 0.04,
  remove: 0.04,
  error: 0.15,
  coin: 0.09,
  miner: 0.35,
  furnace: 0.4,
  assembler: 0.3,
  rotate: 0.03,
  thunk: 0.14,
};

/** C major pentatonic across two octaves; any combination of these sounds consonant. */
const MUSIC_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

/**
 * All sound is synthesised with Web Audio, so the game ships no audio files.
 * Four buses: UI + machine effects, a belt hum that follows factory size, and soft generative music.
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private humGain!: GainNode;
  private noiseBuffer!: AudioBuffer;
  private readonly lastPlayed = new Map<SoundId, number>();
  private nextNoteTime = 0;
  private settings: GameSettings;

  constructor(settings: GameSettings) {
    this.settings = { ...settings };
  }

  /** Browsers only allow audio after a user gesture; call this from the first click or key press. */
  unlock(): void {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    try {
      this.context = new AudioContext();
    } catch {
      return; // No audio support; the game stays silent.
    }
    const ctx = this.context;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.connect(this.master);

    this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const samples = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

    // Ambient belt hum: looping noise through a low band-pass, silent until belts exist.
    const hum = ctx.createBufferSource();
    hum.buffer = this.noiseBuffer;
    hum.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 130;
    filter.Q.value = 0.8;
    this.humGain = ctx.createGain();
    this.humGain.gain.value = 0;
    hum.connect(filter).connect(this.humGain).connect(this.sfxBus);
    hum.start();

    this.nextNoteTime = ctx.currentTime + 1.5;
    this.applySettings(this.settings);
  }

  applySettings(settings: GameSettings): void {
    this.settings = { ...settings };
    if (!this.context) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(settings.masterVolume, now, 0.05);
    this.sfxBus.gain.setTargetAtTime(settings.sfx ? 1 : 0, now, 0.05);
    this.musicBus.gain.setTargetAtTime(settings.music ? 1 : 0, now, 0.3);
  }

  /** Call every frame. `running` is false while the game is paused or on the menu. */
  update(conveyorCount: number, running: boolean): void {
    const ctx = this.context;
    if (!ctx) return;
    const hum = running ? Math.min(conveyorCount / 40, 1) * 0.11 : 0;
    this.humGain.gain.setTargetAtTime(hum, ctx.currentTime, 0.4);

    // Schedule music a little ahead of time so timing does not depend on frame rate.
    if (this.settings.music && ctx.currentTime > this.nextNoteTime - 0.2) {
      this.playMusicNote(this.nextNoteTime);
      this.nextNoteTime += [1.2, 1.8, 2.4, 3.0][Math.floor(Math.random() * 4)];
    }
    if (this.nextNoteTime < ctx.currentTime) this.nextNoteTime = ctx.currentTime + 1;
  }

  private playMusicNote(when: number): void {
    const ctx = this.context!;
    const frequency = MUSIC_NOTES[Math.floor(Math.random() * MUSIC_NOTES.length)];
    for (const [ratio, level] of [[1, 0.05], [0.5, 0.035]] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency * ratio;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(level, when + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 4.2);
      osc.connect(gain).connect(this.musicBus);
      osc.start(when);
      osc.stop(when + 4.3);
    }
  }

  play(id: SoundId): void {
    const ctx = this.context;
    if (!ctx || !this.settings.sfx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (now - (this.lastPlayed.get(id) ?? -1) < COOLDOWNS[id]) return;
    this.lastPlayed.set(id, now);

    switch (id) {
      case 'click':
        this.tone('sine', 720, 520, 0.05, 0.12);
        break;
      case 'rotate':
        this.tone('triangle', 480, 620, 0.06, 0.1);
        break;
      case 'place':
        this.tone('sine', 170, 60, 0.16, 0.4);
        this.noise(0.05, 1800, 'lowpass', 0.14);
        break;
      case 'remove':
        this.tone('triangle', 330, 150, 0.14, 0.16);
        this.noise(0.08, 900, 'lowpass', 0.1);
        break;
      case 'error':
        this.tone('square', 150, 120, 0.13, 0.06);
        break;
      case 'coin':
        this.tone('triangle', 1318.5, 1318.5, 0.09, 0.1);
        this.tone('triangle', 1975.5, 1975.5, 0.22, 0.1, 0.07);
        break;
      case 'miner':
        this.tone('triangle', 190, 120, 0.07, 0.07);
        this.noise(0.05, 2400, 'bandpass', 0.05);
        break;
      case 'furnace':
        this.noise(0.4, 500, 'lowpass', 0.07);
        break;
      case 'thunk':
        this.tone('sine', 120, 70, 0.06, 0.05);
        break;
      case 'assembler':
        this.noise(0.03, 3200, 'highpass', 0.07);
        this.tone('square', 620, 310, 0.04, 0.025);
        break;
    }
  }

  /** A pitch-swept tone with a fast attack and exponential decay. */
  private tone(type: OscillatorType, from: number, to: number, duration: number, level: number, delay = 0): void {
    const ctx = this.context!;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(this.sfxBus);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /** A burst of filtered noise for thumps, clicks and whooshes. */
  private noise(duration: number, frequency: number, type: BiquadFilterType, level: number): void {
    const ctx = this.context!;
    const start = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(this.sfxBus);
    source.start(start, Math.random() * 0.5, duration + 0.02);
  }
}
