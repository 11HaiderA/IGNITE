// LocalStorage Persistence Wrapper with Safe Fallbacks

const KEYS = {
  PROGRESS: 'ms_progress',
  SETTINGS: 'ms_settings',
  STATS: 'ms_stats',
};

const DEFAULT_SETTINGS = {
  music: true,
  musicVol: 50,
  sfx: true,
  sfxVol: 80,
  vibration: true,
};

const DEFAULT_PROGRESS = {
  unlockedLevel: 1,
  stars: {}, // { levelId: number (1-3) }
  howToPlaySeen: false,
};

const DEFAULT_STATS = {
  streak: 12,
  totalSolved: 0,
  totalTime: 0,
};

export const storage = {
  getSettings() {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  },

  getProgress() {
    try {
      const raw = localStorage.getItem(KEYS.PROGRESS);
      return raw ? { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } : { ...DEFAULT_PROGRESS };
    } catch (e) {
      return { ...DEFAULT_PROGRESS };
    }
  },

  saveProgress(prog) {
    try {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(prog));
    } catch (e) {}
  },

  getStats() {
    try {
      const raw = localStorage.getItem(KEYS.STATS);
      return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };
    } catch (e) {
      return { ...DEFAULT_STATS };
    }
  },

  saveStats(stats) {
    try {
      localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  recordLevelWin(levelId, starsCount, elapsedSec) {
    const prog = this.getProgress();
    const currentStars = prog.stars[levelId] || 0;
    if (starsCount > currentStars) {
      prog.stars[levelId] = starsCount;
    }
    if (levelId >= prog.unlockedLevel) {
      prog.unlockedLevel = levelId + 1;
    }
    this.saveProgress(prog);

    const stats = this.getStats();
    stats.streak = (stats.streak || 0) + 1;
    stats.totalSolved = (stats.totalSolved || 0) + 1;
    stats.totalTime = (stats.totalTime || 0) + elapsedSec;
    this.saveStats(stats);

    return { progress: prog, stats };
  },

  getTotalStars() {
    const prog = this.getProgress();
    return Object.values(prog.stars || {}).reduce((acc, s) => acc + s, 0);
  },
};
