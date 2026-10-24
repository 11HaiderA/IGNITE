import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOTAL_LEVELS = 50;

const LEVEL_KEY = '@matchsticks_current_level';
const MAX_UNLOCKED_KEY = '@matchsticks_max_unlocked';
const GAME_COMPLETED_KEY = '@matchsticks_game_completed';

export async function getSavedLevel() {
  try {
    const val = await AsyncStorage.getItem(LEVEL_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return Math.min(TOTAL_LEVELS, parsed);
      }
    }
  } catch (err) {
    console.warn('Failed to load current level:', err);
  }
  return 1;
}

export async function isGameCompleted() {
  try {
    const val = await AsyncStorage.getItem(GAME_COMPLETED_KEY);
    return val === 'true';
  } catch (err) {
    return false;
  }
}

export async function setGameCompleted(completed = true) {
  try {
    await AsyncStorage.setItem(GAME_COMPLETED_KEY, completed ? 'true' : 'false');
    if (completed) {
      await AsyncStorage.setItem(MAX_UNLOCKED_KEY, String(TOTAL_LEVELS));
    }
  } catch (err) {
    console.warn('Failed to set game completed:', err);
  }
}

export async function saveCurrentLevel(levelNum) {
  try {
    if (levelNum && levelNum >= 1) {
      const clamped = Math.min(TOTAL_LEVELS, levelNum);
      await AsyncStorage.setItem(LEVEL_KEY, String(clamped));
      const curMax = await getMaxUnlockedLevel();
      if (clamped > curMax) {
        await AsyncStorage.setItem(MAX_UNLOCKED_KEY, String(clamped));
      }
    }
  } catch (err) {
    console.warn('Failed to save current level:', err);
  }
}

export async function getMaxUnlockedLevel() {
  try {
    const completed = await isGameCompleted();
    if (completed) {
      return TOTAL_LEVELS;
    }
    const val = await AsyncStorage.getItem(MAX_UNLOCKED_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return Math.min(TOTAL_LEVELS, parsed);
      }
    }
    return await getSavedLevel();
  } catch (err) {
    console.warn('Failed to load max unlocked level:', err);
  }
  return 1;
}
