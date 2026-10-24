// Match Sticks — unified audio engine with expo-audio
// Preloads all SFX and looping background music
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const SOUND_ASSETS = {
  match_burn: require('../../assets/sounds/match_burn.mp3'),
  stick_pick: require('../../assets/sounds/stick_pick.mp3'),
  stick_drop: require('../../assets/sounds/stick_drop.mp3'),
  tap: require('../../assets/sounds/tap.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  star: require('../../assets/sounds/star.mp3'),
  victory: require('../../assets/sounds/victory.mp3'),
  bg_music: require('../../assets/sounds/bg_music.mp3'),
};

const SFX_VOLUME = 0.9;
const MUSIC_DEFAULT_VOLUME = 0.35;
const MUSIC_DUCK_VOLUME = 0.15;

class SoundManagerClass {
  constructor() {
    this.sfxPlayers = {};
    this.musicPlayer = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.isInitialized = false;
    this.musicPlaying = false;
    this.musicFadeTimer = null;
    this.appStateSubscription = null;

    this.initSettings();
  }

  async initSettings() {
    try {
      const sfxVal = await AsyncStorage.getItem('@matchsticks_sfx');
      if (sfxVal !== null) {
        this.sfxEnabled = JSON.parse(sfxVal);
      }
      const musicVal = await AsyncStorage.getItem('@matchsticks_music');
      if (musicVal !== null) {
        this.musicEnabled = JSON.parse(musicVal);
      }
    } catch (e) {}
  }

  async initAudio() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'doNotMix',
      });
    } catch (e) {}

    // Preload all SFX players once at startup for zero-latency instant playback
    const sfxKeys = ['match_burn', 'stick_pick', 'stick_drop', 'tap', 'wrong', 'star', 'victory'];
    for (const key of sfxKeys) {
      try {
        const player = createAudioPlayer(SOUND_ASSETS[key]);
        player.volume = SFX_VOLUME;
        player.loop = false;
        this.sfxPlayers[key] = player;
      } catch (err) {
        if (__DEV__) console.warn(`Failed to preload SFX [${key}]:`, err);
      }
    }

    // Preload background music player
    try {
      const music = createAudioPlayer(SOUND_ASSETS.bg_music);
      music.volume = MUSIC_DEFAULT_VOLUME;
      music.loop = true;
      this.musicPlayer = music;
    } catch (err) {
      if (__DEV__) console.warn('Failed to preload background music:', err);
    }

    // Handle AppState to pause music in background and resume on return
    if (!this.appStateSubscription) {
      this.appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState.match(/inactive|background/)) {
          if (this.musicPlayer && this.musicPlaying) {
            try { this.musicPlayer.pause(); } catch (e) {}
          }
        } else if (nextState === 'active') {
          if (this.musicPlayer && this.musicEnabled && this.musicPlaying) {
            try { this.musicPlayer.play(); } catch (e) {}
          }
        }
      });
    }
  }

  playSfx(name, customVol) {
    if (!this.sfxEnabled) return;
    const player = this.sfxPlayers[name];
    if (!player) return;

    try {
      player.volume = typeof customVol === 'number' ? customVol : SFX_VOLUME;
      // Seek to 0 so fast repeated taps restart immediately
      player.seekTo(0).catch(() => {});
      player.play();
    } catch (e) {
      try { player.play(); } catch (_) {}
    }
  }

  startMusic(fadeInDuration = 1500) {
    if (!this.musicEnabled || !this.musicPlayer) return;
    this.musicPlaying = true;

    if (this.musicFadeTimer) clearInterval(this.musicFadeTimer);

    try {
      this.musicPlayer.volume = 0;
      this.musicPlayer.loop = true;
      this.musicPlayer.play();
    } catch (e) {}

    // Smooth fade in from 0 to 0.35 over 1.5s
    const steps = 15;
    const stepTime = fadeInDuration / steps;
    const volStep = MUSIC_DEFAULT_VOLUME / steps;
    let currentVol = 0;

    this.musicFadeTimer = setInterval(() => {
      currentVol += volStep;
      if (currentVol >= MUSIC_DEFAULT_VOLUME) {
        currentVol = MUSIC_DEFAULT_VOLUME;
        clearInterval(this.musicFadeTimer);
        this.musicFadeTimer = null;
      }
      if (this.musicPlayer) {
        this.musicPlayer.volume = currentVol;
      }
    }, stepTime);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicFadeTimer) {
      clearInterval(this.musicFadeTimer);
      this.musicFadeTimer = null;
    }
    if (this.musicPlayer) {
      try {
        this.musicPlayer.pause();
        this.musicPlayer.seekTo(0).catch(() => {});
      } catch (e) {}
    }
  }

  pauseMusic() {
    if (this.musicPlayer) {
      try { this.musicPlayer.pause(); } catch (e) {}
    }
  }

  resumeMusic() {
    if (this.musicEnabled && this.musicPlaying && this.musicPlayer) {
      try { this.musicPlayer.play(); } catch (e) {}
    }
  }

  // Duck music during burn sound or pause menu, then restore smoothly
  duckMusic(targetVol = MUSIC_DUCK_VOLUME, returnVol = MUSIC_DEFAULT_VOLUME, holdMs = 1500, fadeBackMs = 500) {
    if (!this.musicPlayer || !this.musicPlaying || !this.musicEnabled) return;

    this.musicPlayer.volume = targetVol;

    setTimeout(() => {
      if (!this.musicPlayer || !this.musicPlaying || !this.musicEnabled) return;
      const steps = 10;
      const stepTime = fadeBackMs / steps;
      const stepDelta = (returnVol - targetVol) / steps;
      let cur = targetVol;

      const fadeTimer = setInterval(() => {
        cur += stepDelta;
        if (cur >= returnVol) {
          cur = returnVol;
          clearInterval(fadeTimer);
        }
        if (this.musicPlayer) this.musicPlayer.volume = cur;
      }, stepTime);
    }, holdMs);
  }

  setMusicVolume(vol) {
    if (this.musicPlayer) {
      this.musicPlayer.volume = vol;
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    AsyncStorage.setItem('@matchsticks_sfx', JSON.stringify(enabled)).catch(() => {});
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    AsyncStorage.setItem('@matchsticks_music', JSON.stringify(enabled)).catch(() => {});
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  isSfxEnabled() {
    return this.sfxEnabled;
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }
}

export const SoundManager = new SoundManagerClass();
export default SoundManager;
