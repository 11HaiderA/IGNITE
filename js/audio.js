// Procedural Web Audio API Engine
// Zero external file dependencies - 100% offline, realistic, and responsive.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;

    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVol = 0.5;
    this.sfxVol = 0.8;

    this.isMusicPlaying = false;
    this.musicOscs = [];
    this.crackleNode = null;
    this.crackleTimer = null;

    this.unlocked = false;

    // Visibility change handling
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && this.unlocked) {
            this.ctx.resume();
          }
        }
      });
    }
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicEnabled ? this.musicVol * 0.35 : 0;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVol : 0;
    this.sfxGain.connect(this.masterGain);
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.unlocked = true;
    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    }
  }

  setMusicSettings(enabled, volume) {
    this.musicEnabled = enabled;
    this.musicVol = volume / 100;
    if (this.musicGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = this.musicEnabled ? this.musicVol * 0.35 : 0;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(target, now, 0.1);
    }
    if (this.musicEnabled && !this.isMusicPlaying && this.unlocked) {
      this.startAmbientMusic();
    }
  }

  setSfxSettings(enabled, volume) {
    this.sfxEnabled = enabled;
    this.sfxVol = volume / 100;
    if (this.sfxGain && this.ctx) {
      const target = this.sfxEnabled ? this.sfxVol : 0;
      this.sfxGain.gain.value = target;
    }
  }

  // --- Procedural SFX ---

  playClick() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  playWoodTick() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 3.5;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  playWoodTock() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playWrong() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playStrike() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
      filter.Q.value = 4.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(now);
    } catch (e) {}
  }

  playIgnite() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.45);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch (e) {}
  }

  startCrackle() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.stopCrackle();

    const triggerPop = () => {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.value = 1800 + Math.random() * 2000;

        osc.type = Math.random() < 0.5 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 1200, now);

        gain.gain.setValueAtTime(0.12 + Math.random() * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02 + Math.random() * 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {}

      const nextTime = 40 + Math.random() * 90;
      this.crackleTimer = setTimeout(triggerPop, nextTime);
    };

    triggerPop();
  }

  stopCrackle() {
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
  }

  playStarPop(index = 1) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const freq = pitches[Math.min(index, pitches.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playPopup(open = true) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (open) {
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
      } else {
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // --- Warm Ambient Fireplace Ambient Music Pad ---

  startAmbientMusic() {
    if (!this.ctx || this.isMusicPlaying) return;
    try {
      const freqs = [110, 164.81, 220, 261.63]; // A2, E3, A3, C4 warm minor/ambient chord
      this.musicOscs = [];

      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f + (Math.random() * 0.8 - 0.4), this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, this.ctx.currentTime);

        oscGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.musicGain);

        osc.start();
        this.musicOscs.push(osc);
      });

      this.isMusicPlaying = true;
    } catch (e) {}
  }

  stopAmbientMusic() {
    this.musicOscs.forEach((o) => {
      try {
        o.stop();
      } catch (e) {}
    });
    this.musicOscs = [];
    this.isMusicPlaying = false;
  }
}

export const audio = new SoundEngine();
