import { hapticFeedback } from './haptics';
import SoundManager from '../audio/SoundManager';

class NativeSoundEngine {
  constructor() {
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVol = 0.75;
    this.sfxVol = 0.9;
  }

  playClick() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('tap');
      hapticFeedback.pick();
    }
  }

  playWoodTick() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('stick_pick');
      hapticFeedback.pick();
    }
  }

  playWoodTock() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('stick_drop');
      hapticFeedback.drop();
    }
  }

  playStrike() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('match_burn');
      hapticFeedback.hint();
    }
  }

  playIgnite() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('match_burn');
      hapticFeedback.hint();
    }
  }

  playWrong() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('wrong');
      hapticFeedback.bad();
    }
  }

  playCrackle() {
    if (this.sfxEnabled) {
      SoundManager.playSfx('match_burn');
      hapticFeedback.pick();
    }
  }

  playStarPop(index = 1) {
    if (this.sfxEnabled) {
      SoundManager.playSfx('star');
      hapticFeedback.win();
    }
  }

  setSettings(music, sfx, musicVol = 0.75, sfxVol = 0.9) {
    this.musicEnabled = music;
    this.sfxEnabled = sfx;
    this.musicVol = musicVol;
    this.sfxVol = sfxVol;
    SoundManager.setSfxEnabled(sfx);
    SoundManager.setMusicEnabled(music);
  }
}

export const nativeAudio = new NativeSoundEngine();
export default nativeAudio;
