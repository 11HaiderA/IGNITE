import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '../../theme';
import SoundManager from '../audio/SoundManager';

export default function AdModal({
  visible,
  rewardTitle = 'Reward',
  onComplete,
  onCancel,
}) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setCountdown(5);
      setCanSkip(false);
      progressAnim.setValue(0);
      return;
    }

    // Duck background music during ad
    SoundManager.duckMusic(0.08, 0.35, 6000, 500);

    // 5-second progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Pulse animation for skip button once available
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    // Countdown interval
    let current = 5;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        setCanSkip(true);
        pulseLoop.start();
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } catch (e) {}
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      pulseLoop.stop();
    };
  }, [visible]);

  if (!visible) return null;

  const handleSkipOrClaim = () => {
    if (!canSkip) return;
    SoundManager.playSfx('tap');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (e) {}
    if (onComplete) onComplete();
  };

  const handleClose = () => {
    if (canSkip) {
      handleSkipOrClaim();
    } else {
      SoundManager.playSfx('tap');
      if (onCancel) onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        {/* Ad Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.adTagBadge}>
            <Text style={styles.adTagText}>AD • SPONSORED</Text>
          </View>

          {/* Countdown / Skip Button */}
          {canSkip ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                onPress={handleSkipOrClaim}
                style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={['#FFB300', '#FF6D00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skipBtnGrad}
                >
                  <Text style={styles.skipBtnText}>SKIP AD ✕</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>Skip in {countdown}s</Text>
            </View>
          )}
        </View>

        {/* Ad Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Main Ad Showcase Container */}
        <View style={styles.adBody}>
          <LinearGradient
            colors={['#2A160C', '#180B05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.adCard}
          >
            {/* Glowing Flame Emblem */}
            <View style={styles.iconCircle}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Defs>
                  <RadialGradient id="adFlame" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FFF176" />
                    <Stop offset="45%" stopColor="#FFA000" />
                    <Stop offset="90%" stopColor="#E65100" />
                    <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="32" cy="32" r="28" fill="url(#adFlame)" />
              </Svg>
            </View>

            <Text style={styles.adTitle}>MATCH STICKS PRO</Text>
            <Text style={styles.adSubtitle}>Brain Puzzle & Logic Challenge</Text>

            <View style={styles.starsRow}>
              <Text style={styles.starsText}>★★★★★</Text>
              <Text style={styles.ratingText}> 4.9 (120K Reviews)</Text>
            </View>

            <View style={styles.featuresBox}>
              <Text style={styles.featureItem}>✓ 100+ Handcrafted Levels</Text>
              <Text style={styles.featureItem}>✓ Realistic Physics & Live Fire</Text>
              <Text style={styles.featureItem}>✓ Train Logic & Spatial IQ</Text>
            </View>

            <View style={styles.rewardNotice}>
              <Text style={styles.rewardNoticeText}>
                {canSkip
                  ? `✓ Ad complete! Tap 'SKIP AD' to claim ${rewardTitle}.`
                  : `Watching ad to unlock: ${rewardTitle}...`}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Bottom Bar with Early Dismiss */}
        <View style={styles.bottomBar}>
          <Pressable onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>
              {canSkip ? 'CLAIM REWARD' : 'Cancel & Return to Game'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 5, 2, 0.96)',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 18,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
  },
  adTagBadge: {
    backgroundColor: 'rgba(255, 160, 20, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9E1B',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  adTagText: {
    fontFamily: fonts.body800 || fonts.display700,
    fontSize: 11,
    color: '#FFB834',
    letterSpacing: 1,
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  timerText: {
    fontFamily: fonts.display700,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#FF9E1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  skipBtnGrad: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontFamily: fonts.display800,
    fontSize: 13,
    color: '#1A0A02',
    letterSpacing: 0.8,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9E1B',
  },
  adBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
  },
  adCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#5C3218',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3D1C0C',
    borderWidth: 2.5,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  adTitle: {
    fontFamily: fonts.display800,
    fontSize: 22,
    color: '#FFDA44',
    letterSpacing: 1,
    textAlign: 'center',
  },
  adSubtitle: {
    fontFamily: fonts.body700,
    fontSize: 13,
    color: '#D4B592',
    marginTop: 4,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  starsText: {
    color: '#FFC107',
    fontSize: 16,
    letterSpacing: 2,
  },
  ratingText: {
    fontFamily: fonts.body700,
    fontSize: 12,
    color: '#E0C5A4',
  },
  featuresBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    gap: 6,
  },
  featureItem: {
    fontFamily: fonts.body700,
    fontSize: 13,
    color: '#F0D4B8',
  },
  rewardNotice: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 160, 20, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 20, 0.3)',
  },
  rewardNoticeText: {
    fontFamily: fonts.body800 || fonts.display700,
    fontSize: 12,
    color: '#FFB834',
    textAlign: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontFamily: fonts.body700,
    fontSize: 13,
    color: 'rgba(233, 207, 166, 0.65)',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.8,
  },
});
