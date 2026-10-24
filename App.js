import React, { useEffect, useState } from 'react';
import { StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import * as NativeSplash from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';

import SplashScreenView from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import LevelsScreen from './screens/LevelsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { nativeAudio } from './src/utils/nativeAudio';
import { getSavedLevel, getMaxUnlockedLevel, saveCurrentLevel, isGameCompleted } from './src/utils/storage';
import SoundManager from './src/audio/SoundManager';
import adMobService from './src/services/AdMobService';

// Native splash screen prevented from auto-hiding until video splash screen mounts
NativeSplash.preventAutoHideAsync().catch(() => {});

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    NativeSplash.hideAsync().catch(() => {});
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeoutReady, setTimeoutReady] = useState(false);
  const [screen, setScreen] = useState('home');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [gameCompleted, setGameCompletedState] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    // Failsafe: ensure app proceeds even if font network request is slow
    const timer = setTimeout(() => {
      setTimeoutReady(true);
    }, 1500);

    (async () => {
      // Initialize Google Mobile Ads SDK early
      adMobService.initialize().catch(() => {});

      try {
        const val = await AsyncStorage.getItem('@matchsticks_sfx');
        if (val !== null) {
          const enabled = JSON.parse(val);
          setSoundEnabled(enabled);
          nativeAudio.sfxEnabled = enabled;
        }
      } catch (e) {}

      try {
        const savedLvl = await getSavedLevel();
        const savedMax = await getMaxUnlockedLevel();
        const completed = await isGameCompleted();
        setGameCompletedState(completed);
        if (savedLvl && savedLvl >= 1) {
          setCurrentLevel(Math.min(50, savedLvl));
        }
        if (completed) {
          setMaxUnlockedLevel(50);
        } else if (savedMax && savedMax >= 1) {
          setMaxUnlockedLevel(Math.min(50, Math.max(savedLvl || 1, savedMax)));
        }
      } catch (e) {}
    })();

    return () => clearTimeout(timer);
  }, []);

  // Global hardware back handler: The game should NOT get closed in any case / whichever screen we are in
  useEffect(() => {
    const onHardwareBack = () => {
      if (screen === 'levels' || screen === 'settings') {
        setScreen('home');
        return true;
      }
      if (screen === 'home') {
        // Prevent default exit behavior on home screen
        return true;
      }
      // If in game, GameScreen handles it internally, but if bubbled, go to home
      setScreen('home');
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [screen]);

  // Display animated splash screen immediately (does not block on font loading)
  if (showSplash) {
    return (
      <RootErrorBoundary
        fallback={null}
        onError={() => {
          setShowSplash(false);
          NativeSplash.hideAsync().catch(() => {});
          SoundManager.initAudio().then(() => {
            SoundManager.startMusic(1500);
          }).catch(() => {});
        }}
      >
        <SplashScreenView
          muted={!soundEnabled}
          onFinish={() => {
            setShowSplash(false);
            SoundManager.initAudio().then(() => {
              SoundManager.startMusic(1500);
            }).catch(() => {});
          }}
        />
      </RootErrorBoundary>
    );
  }

  // Once splash finishes, ensure fonts are ready for HomeScreen/GameScreen
  const isReady = fontsLoaded || fontError || timeoutReady;
  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {screen === 'home' && (
        <HomeScreen
          currentLevel={currentLevel}
          gameCompleted={gameCompleted}
          onPlay={() => {
            if (gameCompleted) {
              setScreen('levels');
            } else {
              setScreen('game');
            }
          }}
          onLevels={() => setScreen('levels')}
          onSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'levels' && (
        <LevelsScreen
          maxUnlockedLevel={maxUnlockedLevel}
          gameCompleted={gameCompleted}
          onBack={() => setScreen('home')}
          onPlay={(lvl) => {
            setCurrentLevel(lvl.n);
            saveCurrentLevel(lvl.n);
            setScreen('game');
          }}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          level={currentLevel}
          onBack={() => {
            saveCurrentLevel(currentLevel);
            setScreen('home');
          }}
          onLevels={() => {
            saveCurrentLevel(currentLevel);
            setScreen('levels');
          }}
          onSettings={() => setScreen('settings')}
          onHome={() => {
            saveCurrentLevel(currentLevel);
            setScreen('home');
          }}
          onNextLevel={(next) => {
            if (next > 50) {
              setGameCompletedState(true);
              setMaxUnlockedLevel(50);
              setCurrentLevel(50);
              setScreen('levels');
            } else {
              setCurrentLevel(next);
              setMaxUnlockedLevel((prev) => Math.min(50, Math.max(prev, next)));
              saveCurrentLevel(next);
            }
          }}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen('home')}
        />
      )}
    </SafeAreaProvider>
  );
}
