import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
} from 'react-native-svg';

import { colors, fonts } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import DarkButton from '../components/DarkButton';
import MatchStickBoard from '../src/components/MatchStickBoard';
import PauseModal from '../components/PauseModal';
import SettingsModal from '../components/SettingsModal';
import ConfirmModal from '../components/ConfirmModal';
import TryAgainModal from '../components/TryAgainModal';
import AdModal from '../src/components/AdModal';
import adMobService from '../src/services/AdMobService';
import levelsData from '../levels/levels.json';
import {
  build,
  clone,
  applyMove,
  evaluate,
  solve,
  SEG,
  OPSEG,
  EQSEG,
  TOKEN_W,
  GAP,
  slotsOf,
  has,
} from '../src/engine/matchEngine';
import SoundManager from '../src/audio/SoundManager';
import { hapticFeedback } from '../src/utils/haptics';
import { saveCurrentLevel, setGameCompleted } from '../src/utils/storage';

export default function GameScreen({ level = 1, onBack, onLevels, onHome, onNextLevel }) {
  const { height: windowH } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState(level);
  const [levelInfo, setLevelInfo] = useState(null);
  const [puzzleState, setPuzzleState] = useState(null);
  const [curState, setCurState] = useState(null);
  const [movesTaken, setMovesTaken] = useState(0);
  const [picked, setPicked] = useState(null);
  const [hint, setHint] = useState(null);
  const [usedHint, setUsedHint] = useState(false);
  const [, setMoveHistory] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  // 3 Lives System
  const [lives, setLives] = useState(3);

  // Win animation states
  const [burningSticks, setBurningSticks] = useState(new Set());
  const [burnedSticks, setBurnedSticks] = useState(new Set());
  const [showSmoke, setShowSmoke] = useState(false);
  const [winVisible, setWinVisible] = useState(false);
  const [starsShown, setStarsShown] = useState(0);

  // Try Again state (triggered when player loses all 3 lives)
  const [tryAgainVisible, setTryAgainVisible] = useState(false);

  // Simulated 5-second skippable Ad state
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [adPurpose, setAdPurpose] = useState('retry'); // 'retry' | 'hint' | 'tryAgain'

  // Modals state
  const [pauseVisible, setPauseVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Intercept Android hardware back button: The game must NEVER close under any circumstances
  useEffect(() => {
    const onBackPress = () => {
      if (adModalVisible) {
        setAdModalVisible(false);
        return true;
      }
      if (tryAgainVisible) {
        setTryAgainVisible(false);
        if (onHome) onHome();
        return true;
      }
      if (winVisible) {
        setWinVisible(false);
        if (onHome) onHome();
        return true;
      }
      if (settingsVisible) {
        setSettingsVisible(false);
        return true;
      }
      if (pauseVisible) {
        setPauseVisible(false);
        return true;
      }
      if (exitModalVisible) {
        setExitModalVisible(false);
        return true;
      }

      // If playing the game, open the Pause menu instead of closing
      setPauseVisible(true);
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    adModalVisible,
    tryAgainVisible,
    winVisible,
    settingsVisible,
    pauseVisible,
    exitModalVisible,
    onHome,
  ]);

  // Load level equation
  useEffect(() => {
    loadLevel(level);
  }, [level]);

  // Win popup sequence (plays only the new victory audio track)
  useEffect(() => {
    if (winVisible) {
      SoundManager.playSfx('victory');
      setStarsShown(0);
      const t1 = setTimeout(() => {
        setStarsShown(1);
        hapticFeedback.win();
      }, 180);
      const t2 = setTimeout(() => {
        setStarsShown(2);
        hapticFeedback.win();
      }, 360);
      const t3 = setTimeout(() => {
        setStarsShown(3);
        hapticFeedback.win();
      }, 540);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [winVisible]);

  const loadLevel = (lvlNum) => {
    setCurrentLevel(lvlNum);
    const lvl = levelsData.find((l) => l.id === lvlNum) || levelsData[0] || {
      id: lvlNum,
      equation: '6+4=4',
      mode: 'move-1',
      movesAllowed: 1,
    };
    setLevelInfo(lvl);

    const built = build(lvl.equation);
    setPuzzleState(built);
    setCurState(clone(built));
    setMovesTaken(0);
    setPicked(null);
    setHint(null);
    setUsedHint(false);
    setLives(3); // 3 lives per level attempt
    setMoveHistory([]);
    setBurningSticks(new Set());
    setBurnedSticks(new Set());
    setShowSmoke(false);
    setIsLocked(false);
    setWinVisible(false);
    setTryAgainVisible(false);
    setAdModalVisible(false);
    setStarsShown(0);
  };

  const resetCurrentBoard = () => {
    setCurState(clone(puzzleState));
    setMovesTaken(0);
    setPicked(null);
    setHint(null);
    setBurningSticks(new Set());
    setBurnedSticks(new Set());
    setShowSmoke(false);
    setMoveHistory([]);
    setIsLocked(false);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Win effect: all sticks burn in reading order matching match_burn.mp3
  const startBurnWinSequence = (solvedState) => {
    setIsLocked(true);
    SoundManager.playSfx('match_burn');
    SoundManager.duckMusic(0.15, 0.35, 1400, 500);
    if (currentLevel >= 50) {
      saveCurrentLevel(50);
      setGameCompleted(true);
    } else {
      saveCurrentLevel(currentLevel + 1);
    }

    // Collect all active sticks with their position
    const stickList = [];
    solvedState.forEach((token, i) => {
      const transX = i * (TOKEN_W + GAP);
      if (token.t === 'e') {
        EQSEG.forEach(([x1, y1, x2, y2], idx) => {
          stickList.push({
            id: `e-${i}-${idx}`,
            x: transX + (x1 + x2) / 2,
            y: (y1 + y2) / 2,
          });
        });
      } else {
        const geo = token.t === 'd' ? SEG : OPSEG;
        const slots = slotsOf(token);
        slots.forEach((k) => {
          if (has(token, k)) {
            const [x1, y1, x2, y2] = geo[k];
            stickList.push({
              id: `${i}-${k}`,
              x: transX + (x1 + x2) / 2,
              y: (y1 + y2) / 2,
            });
          }
        });
      }
    });

    // Sort in reading order: left to right, then top to bottom
    stickList.sort((a, b) => {
      if (Math.abs(a.x - b.x) > 20) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    const totalSticks = Math.max(1, stickList.length);
    const delayPerStick = 900 / totalSticks;

    // Spread fire stick-by-stick within ~0.9s
    stickList.forEach((stick, idx) => {
      const burnStart = idx * delayPerStick;

      // 1. Ignites at head (flame travels along stick)
      setTimeout(() => {
        setBurningSticks((prev) => new Set([...prev, stick.id]));
      }, burnStart);

      // 2. Stick transitions to charcoal black and ash head
      setTimeout(() => {
        setBurnedSticks((prev) => new Set([...prev, stick.id]));
      }, burnStart + 300);

      // 3. Flame fades out, glowing embers remain
      setTimeout(() => {
        setBurningSticks((prev) => {
          const next = new Set(prev);
          next.delete(stick.id);
          return next;
        });
      }, burnStart + 600);
    });

    // 4. Thin grey smoke wisps rise after last stick burns (~1500ms)
    setTimeout(() => {
      setShowSmoke(true);
    }, 1500);

    // 5. Hold burnt equation for 0.5s, then open win popup with victory audio (~2000ms)
    setTimeout(() => {
      setShowSmoke(false);
      setWinVisible(true);
    }, 2000);
  };

  // Handle Stick Tap (Picks up matchstick)
  const handleStickPress = (tokenIdx, slotKey) => {
    if (isLocked) return;

    if (picked && picked[0] === tokenIdx && picked[1] === slotKey) {
      setPicked(null);
      SoundManager.playSfx('stick_pick');
      hapticFeedback.pick();
    } else {
      setPicked([tokenIdx, slotKey]);
      SoundManager.playSfx('stick_pick');
      hapticFeedback.pick();
    }
  };

  // Handle Empty Slot Tap (Places matchstick)
  const handleSlotPress = (tokenIdx, slotKey) => {
    if (isLocked || !picked) return;

    SoundManager.playSfx('stick_drop');
    hapticFeedback.drop();

    setMoveHistory((prev) => [...prev, clone(curState)]);

    const nextState = applyMove(curState, picked, [tokenIdx, slotKey]);
    setCurState(nextState);
    const nextMoves = movesTaken + 1;
    setMovesTaken(nextMoves);
    setPicked(null);
    setHint(null);

    // Evaluate equation
    const ev = evaluate(nextState);
    const allowed = levelInfo?.movesAllowed || 1;

    if (ev.valid && ev.correct) {
      // Equation is true! Player solves level and wins!
      startBurnWinSequence(nextState);
    } else {
      if (nextMoves >= allowed) {
        setIsLocked(true);
        SoundManager.playSfx('wrong');
        hapticFeedback.bad();
        triggerShake();

        const remainingLives = lives - 1;
        setLives(remainingLives);

        if (remainingLives <= 0) {
          // Out of 3 lives! Shows TRY AGAIN popup
          setTimeout(() => {
            setTryAgainVisible(true);
            setIsLocked(false);
          }, 800);
        } else {
          // Lives remaining -> reset board so player can try again with remaining lives
          setTimeout(() => {
            resetCurrentBoard();
            setIsLocked(false);
          }, 800);
        }
      }
    }
  };

  const grantReward = (purpose) => {
    if (purpose === 'tryAgain' || purpose === 'reset' || purpose === 'retry') {
      setLives(3); // Reset lives to 3
      setTryAgainVisible(false);
      resetCurrentBoard();
    } else if (purpose === 'hint') {
      setUsedHint(true);
      const sols = solve(puzzleState, levelInfo?.mode || 'move-1');
      if (sols && sols.length > 0) {
        setHint(sols[0]);
        setPicked(sols[0].from);
      }
    }
  };

  // Resetting the game: restores lives to 3 and resets the board to initial equation.
  // Requires watching an AD (nothing for free).
  const handleResetPress = () => {
    if (isLocked) return;
    SoundManager.playSfx('tap');
    setAdPurpose('reset');
    adMobService.showInterstitial({
      onComplete: () => grantReward('reset'),
      onFallback: () => setAdModalVisible(true),
    });
  };

  // Using a hint requires watching an AD
  const handleHintPress = () => {
    if (isLocked) return;
    SoundManager.playSfx('tap');
    setAdPurpose('hint');
    adMobService.showInterstitial({
      onComplete: () => grantReward('hint'),
      onFallback: () => setAdModalVisible(true),
    });
  };

  // Ad Completion callback (Reward granted after 5s skip or full watch)
  const handleAdCompleted = () => {
    setAdModalVisible(false);
    grantReward(adPurpose);
  };

  const allowedMoves = levelInfo?.movesAllowed || 1;
  const progressRatio = Math.min(1, movesTaken / allowedMoves);

  // Big, comfortable board height for upper levels:
  const isUpperLevel = curState && curState.length >= 7;
  const responsiveBoardHeight = isUpperLevel
    ? Math.min(Math.round(windowH * 0.44), 330)
    : Math.min(Math.round(windowH * 0.35), 245);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            SoundManager.playSfx('tap');
            setPauseVisible(true);
          }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Back / Pause"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19l-7-7 7-7"
              stroke={colors.flameLight}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>LEVEL {currentLevel}</Text>
        </View>

        {/* 3 Lives Hearts indicator */}
        <View style={styles.livesPill}>
          {[0, 1, 2].map((i) => {
            const active = i < lives;
            return (
              <Svg key={i} width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={active ? '#FF3D00' : '#3E2218'}
                  stroke={active ? '#FFB300' : '#5C3020'}
                  strokeWidth="1.2"
                />
              </Svg>
            );
          })}
        </View>

        {/* Themed 3D Pause Button */}
        <Pressable
          onPress={() => {
            SoundManager.playSfx('tap');
            setPauseVisible(true);
          }}
          style={({ pressed }) => [styles.pauseWrap, pressed && styles.pressed]}
          accessibilityLabel="Pause Game"
        >
          <LinearGradient
            colors={[colors.dark1, colors.dark2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.pauseBody}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Rect x="4" y="3" width="4" height="14" rx="2" fill={colors.flameLight} />
              <Rect x="5" y="4" width="1" height="12" fill="#fff" opacity={0.6} />
              <Rect x="12" y="3" width="4" height="14" rx="2" fill={colors.flameLight} />
              <Rect x="13" y="4" width="1" height="12" fill="#fff" opacity={0.6} />
            </Svg>
          </LinearGradient>
        </Pressable>
      </View>

      {/* 2. Progress Bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(10, progressRatio * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>
          MOVES • {movesTaken}/{allowedMoves}
        </Text>
      </View>

      {/* 3. Seven-Segment Matchstick Board (Adaptive Big Sizing) */}
      <Animated.View style={[styles.boardCard, { transform: [{ translateX: shakeAnim }] }]}>
        <MatchStickBoard
          state={curState}
          picked={picked}
          hint={hint}
          boardHeight={responsiveBoardHeight}
          burnedSticks={burnedSticks}
          burningSticks={burningSticks}
          showSmoke={showSmoke}
          onStickPress={handleStickPress}
          onSlotPress={handleSlotPress}
          onBackgroundPress={() => {
            if (picked) {
              setPicked(null);
              SoundManager.playSfx('stick_drop', 0.4);
            }
          }}
        />
      </Animated.View>

      {/* 4. Objective Banner */}
      <LinearGradient
        colors={['#8A3A00', '#5C2400']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Text style={styles.bannerTitle}>
          MOVE {allowedMoves} {allowedMoves === 1 ? 'MATCHSTICK' : 'MATCHSTICKS'} TO MAKE EQUATION TRUE
        </Text>
        <Text style={styles.bannerSubtitle}>3 LIVES TO CLEAR THIS LEVEL</Text>
      </LinearGradient>

      {/* 5. Bottom Controls: RESET & HINT with clean labels & subtle AD badges */}
      <View style={styles.bottomRow}>
        <DarkButton
          label="RESET"
          showAdBadge={true}
          onPress={handleResetPress}
          style={styles.bottomBtn}
        />
        <PrimaryButton
          label="HINT"
          showAdBadge={true}
          onPress={handleHintPress}
          style={styles.bottomBtn}
        />
      </View>

      {/* Pause Modal */}
      <PauseModal
        visible={pauseVisible}
        onResume={() => setPauseVisible(false)}
        onRestart={() => {
          setPauseVisible(false);
          loadLevel(currentLevel);
        }}
        onLevels={() => {
          setPauseVisible(false);
          saveCurrentLevel(currentLevel);
          if (onLevels) onLevels();
        }}
        onSettings={() => {
          setPauseVisible(false);
          setSettingsVisible(true);
        }}
        onHome={() => {
          setPauseVisible(false);
          saveCurrentLevel(currentLevel);
          if (onHome) onHome();
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      {/* Exit Confirmation Modal (Returns to Main Menu, never kills app) */}
      <ConfirmModal
        visible={exitModalVisible}
        title="EXIT TO MENU"
        message="Return to the main menu?"
        confirmLabel="YES"
        cancelLabel="NO"
        onConfirm={() => {
          setExitModalVisible(false);
          saveCurrentLevel(currentLevel);
          if (onHome) onHome();
          else if (onBack) onBack();
        }}
        onCancel={() => setExitModalVisible(false)}
      />

      {/* Try Again Modal with 5-second Ad Retry and Main Menu */}
      <TryAgainModal
        visible={tryAgainVisible}
        livesRemaining={lives}
        onWatchAdRetry={() => {
          setAdPurpose('tryAgain');
          adMobService.showInterstitial({
            onComplete: () => grantReward('tryAgain'),
            onFallback: () => setAdModalVisible(true),
          });
        }}
        onMainMenu={() => {
          setTryAgainVisible(false);
          saveCurrentLevel(currentLevel);
          if (onHome) onHome();
          else if (onBack) onBack();
        }}
      />

      {/* Simulated 5-Second Skippable Ad Modal */}
      <AdModal
        visible={adModalVisible}
        rewardTitle={
          adPurpose === 'hint'
            ? 'Level Hint'
            : adPurpose === 'tryAgain'
            ? 'Level Retry & 3 Lives'
            : 'Reset & 3 Lives'
        }
        onComplete={handleAdCompleted}
        onCancel={() => setAdModalVisible(false)}
      />

      {/* 3-Star Victory Modal with astralsynthesizer Victory Audio */}
      <Modal visible={winVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.winCard}>
            <Text style={styles.winTitle}>
              {currentLevel >= 50 ? '🎉 GAME COMPLETED!' : 'SOLVED!'}
            </Text>

            {/* 3 Animated Star Pops */}
            <View style={styles.starsRow}>
              <Text style={[styles.starIcon, starsShown >= 1 ? styles.starActive : styles.starInactive]}>
                ★
              </Text>
              <Text style={[styles.starIcon, starsShown >= 2 ? styles.starActive : styles.starInactive]}>
                ★
              </Text>
              <Text style={[styles.starIcon, starsShown >= 3 ? styles.starActive : styles.starInactive]}>
                ★
              </Text>
            </View>

            <Text style={styles.winSubtitle}>
              {currentLevel >= 50
                ? 'You Conquered All 50 Levels! • All Levels Unlocked'
                : 'Equation Is Correct • 3 ★'}
            </Text>

            {currentLevel >= 50 ? (
              <View style={{ width: '100%', gap: 10 }}>
                <PrimaryButton
                  label="SELECT LEVEL"
                  onPress={() => {
                    setWinVisible(false);
                    if (onLevels) onLevels();
                  }}
                  style={styles.winBtn}
                />
                <PrimaryButton
                  label="REPLAY LEVEL 50"
                  onPress={() => {
                    setWinVisible(false);
                    loadLevel(50);
                  }}
                  style={styles.winBtn}
                />
              </View>
            ) : (
              <PrimaryButton
                label="NEXT LEVEL"
                onPress={() => {
                  setWinVisible(false);
                  const nextLvl = currentLevel + 1;
                  saveCurrentLevel(nextLvl);
                  loadLevel(nextLvl);
                  if (onNextLevel) onNextLevel(nextLvl);
                }}
                style={styles.winBtn}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.dark1,
    borderWidth: 2,
    borderColor: '#4A2E1C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  levelPill: {
    backgroundColor: colors.flame,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 24,
    borderWidth: 2.5,
    borderColor: '#7A2E00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  levelPillText: {
    fontFamily: fonts.display800,
    fontSize: 19,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  livesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#4A2E1C',
    gap: 4,
  },
  pauseWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.flame,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  pauseBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  progressWrap: {
    width: '100%',
    marginVertical: 4,
    gap: 3,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#422416',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.flame,
  },
  progressText: {
    fontFamily: fonts.body900,
    fontSize: 12,
    color: '#FFD9A0',
    textAlign: 'right',
  },
  boardCard: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#4A2E1C',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  banner: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#A84400',
    alignItems: 'center',
    gap: 2,
    marginVertical: 4,
  },
  bannerTitle: {
    fontFamily: fonts.display800,
    fontSize: 12.5,
    color: '#FFF0D0',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontFamily: fonts.body700,
    fontSize: 11,
    color: '#FFB366',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  bottomBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  winCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#26140B',
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#FF7A00',
    padding: 26,
    alignItems: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  winTitle: {
    fontFamily: fonts.display800,
    fontSize: 32,
    color: '#FFD23F',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 122, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  starIcon: {
    fontSize: 40,
  },
  starActive: {
    color: '#FFD23F',
    textShadowColor: '#FF7A00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  starInactive: {
    color: '#4A2A1A',
  },
  winSubtitle: {
    fontFamily: fonts.body700,
    fontSize: 15,
    color: '#E0C5A4',
    marginBottom: 22,
  },
  winBtn: {
    width: '100%',
  },
});
