import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '../theme';
import EmberBackground from '../src/components/EmberBackground';
import RealisticMatchLogo from '../src/components/RealisticMatchLogo';
import SettingsModal from '../components/SettingsModal';
import SoundManager from '../src/audio/SoundManager';

// Interactive Pill Button matching home-screen-design.png
function HomePillButton({
  label,
  isPrimary = false,
  onPress,
  pulse = false,
  entranceAnim,
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const breathScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;

    // Gentle 3s breathing scale loop (1.0 <-> 1.025)
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.025,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1.0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    breathLoop.start();
    return () => breathLoop.stop();
  }, [pulse]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    SoundManager.playSfx('tap');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (e) {}
    if (onPress) onPress();
  };

  const combinedTransform = [
    { scale: pulse ? Animated.multiply(pressScale, breathScale) : pressScale },
    ...(entranceAnim ? [{ translateY: entranceAnim }] : []),
  ];

  if (isPrimary) {
    return (
      <Animated.View style={[styles.btnWrap, styles.primaryGlow, { transform: combinedTransform }]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.btnPressable}
        >
          {/* Primary Orange Gradient Pill (Seamless glossy pill) */}
          <LinearGradient
            colors={['#FFA726', '#FF8F00', '#F57C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.primaryPill}
          >
            {/* Top Gloss Capsule Highlight */}
            <LinearGradient
              colors={['rgba(255, 245, 205, 0.42)', 'rgba(255, 215, 120, 0.0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.topGloss}
            />
            <Text style={styles.primaryBtnText} numberOfLines={1}>
              {label}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.btnWrap, styles.darkShadow, { transform: combinedTransform }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.btnPressable}
      >
        {/* Dark Translucent Chocolate Pill with warm border */}
        <LinearGradient
          colors={['#24130A', '#190C06']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.darkPill}
        >
          <Text style={styles.darkBtnText} numberOfLines={1}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Glowing Fiery Gradient Title matching home-screen-design.png
function GradientTitle({ text, fontSize }) {
  try {
    return (
      <View style={styles.titleWrap}>
        {/* Layer 1: Warm glowing ambient shadow behind text */}
        <Text
          style={[
            styles.titleText,
            styles.titleGlow,
            { fontSize },
          ]}
          numberOfLines={1}
        >
          {text}
        </Text>

        {/* Layer 2: Masked fiery gradient fill */}
        <View style={StyleSheet.absoluteFill}>
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <View style={styles.maskContainer}>
                <Text
                  style={[styles.titleText, { fontSize, color: '#000000' }]}
                  numberOfLines={1}
                >
                  {text}
                </Text>
              </View>
            }
          >
            <LinearGradient
              colors={['#FFD542', '#FFA41B', '#FF6200']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </View>
      </View>
    );
  } catch (e) {
    return (
      <Text style={[styles.titleText, styles.titleFallback, { fontSize }]} numberOfLines={1}>
        {text}
      </Text>
    );
  }
}

export default function HomeScreen({
  onPlay,
  onLevels,
  onSettings,
  currentLevel = 1,
  gameCompleted = false,
}) {
  const { width: windowW, height: windowH } = useWindowDimensions();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Entrance animations matching home-screen-preview.mp4
  const matchDropAnim = useRef(new Animated.Value(-40)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const titlePopAnim = useRef(new Animated.Value(0)).current;
  const btn1Slide = useRef(new Animated.Value(30)).current;
  const btn2Slide = useRef(new Animated.Value(30)).current;
  const btn3Slide = useRef(new Animated.Value(30)).current;
  const btnsOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Intercept Android hardware back button: Never close game under any circumstance
  useEffect(() => {
    const onBackPress = () => {
      if (settingsModalVisible) {
        setSettingsModalVisible(false);
        return true;
      }
      // Consume back event, never exit app
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [settingsModalVisible]);

  // Entrance sequence matching video (~1.8s total, non-blocking)
  useEffect(() => {
    // 1. Unlit match fades in and drops into place
    Animated.parallel([
      Animated.timing(matchDropAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(matchOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Title pops in
      Animated.spring(titlePopAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();

      // 3. Buttons slide up with 100ms stagger
      Animated.timing(btnsOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      Animated.stagger(100, [
        Animated.spring(btn1Slide, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(btn2Slide, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(btn3Slide, { toValue: 0, friction: 6, useNativeDriver: true }),
      ]).start();

      // 4. Footer fades in
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Responsive sizing:
  // Matchstick height is ~34% of screen height (max 300dp)
  const matchHeight = Math.round(Math.min(windowH * 0.35, 300));
  // Title font size scaled to fit width without wrapping
  const titleFontSize = Math.min(44, Math.floor(windowW * 0.114));

  // Continue button label matching reference image / completed state
  const continueLabel = gameCompleted
    ? 'PLAY ANY LEVEL'
    : `CONTINUE (LEVEL ${Math.min(50, currentLevel)})`;

  // Stars count (up to 150 stars for 50 levels)
  const starsTotal = gameCompleted
    ? 150
    : Math.min(150, Math.max(0, (currentLevel - 1) * 3));

  return (
    <View style={styles.root}>
      {/* 1. Deep Warm Brown Background with Floating Glowing Embers */}
      <EmberBackground emberCount={52} logoGlow={true} />

      <SafeAreaView style={styles.safeArea}>
        {/* 2. Realistic Standing Matchstick with Live Animated Flame */}
        <Animated.View
          style={[
            styles.matchWrap,
            {
              height: matchHeight,
              opacity: matchOpacity,
              transform: [{ translateY: matchDropAnim }],
            },
          ]}
        >
          <RealisticMatchLogo height={matchHeight} animated={true} igniteDelay={500} />
        </Animated.View>

        {/* 3. Glowing Title & Subtitle */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: titlePopAnim,
              transform: [
                {
                  scale: titlePopAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <GradientTitle text="IGNITE" fontSize={titleFontSize} />
          <Text style={styles.tagline}>IGNITE YOUR MIND</Text>
        </Animated.View>

        {/* 4. Action Buttons Stack */}
        <Animated.View style={[styles.buttonStack, { opacity: btnsOpacity }]}>
          <HomePillButton
            label={continueLabel}
            isPrimary={true}
            pulse={true}
            entranceAnim={btn1Slide}
            onPress={onPlay}
          />

          <HomePillButton
            label="LEVELS"
            isPrimary={false}
            entranceAnim={btn2Slide}
            onPress={onLevels}
          />

          <HomePillButton
            label="SETTINGS"
            isPrimary={false}
            entranceAnim={btn3Slide}
            onPress={() => {
              if (onSettings) {
                onSettings();
              } else {
                setSettingsModalVisible(true);
              }
            }}
          />
        </Animated.View>

        {/* 5. Footer Stats */}
        <Animated.View style={[styles.footerWrap, { opacity: footerOpacity }]}>
          <Text style={styles.footerText}>
            Latest Level: {Math.min(50, currentLevel)} • ★ {starsTotal} / 150
          </Text>
        </Animated.View>
      </SafeAreaView>

      {/* Settings Modal (if opened locally) */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0704',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  matchWrap: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  maskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: fonts.display800,
    textAlign: 'center',
    letterSpacing: 1.2,
    lineHeight: 52,
  },
  titleGlow: {
    color: '#FF7A00',
    textShadowColor: 'rgba(255, 110, 0, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  titleFallback: {
    color: '#FFA51A',
    textShadowColor: 'rgba(255, 110, 0, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    fontFamily: fonts.display700 || fonts.body800,
    fontSize: 12.5,
    color: '#D8C4B0',
    letterSpacing: 4.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  buttonStack: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
    paddingHorizontal: 6,
    marginVertical: 6,
  },
  btnWrap: {
    width: '100%',
  },
  primaryGlow: {
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 10,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressable: {
    width: '100%',
    borderRadius: 33,
    overflow: 'hidden',
  },
  primaryPill: {
    width: '100%',
    height: 64,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topGloss: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 26,
    borderRadius: 18,
  },
  primaryBtnText: {
    fontFamily: fonts.display800,
    fontSize: 20,
    color: '#2B1200',
    letterSpacing: 0.5,
  },
  darkPill: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3D2012',
  },
  darkBtnText: {
    fontFamily: fonts.display800,
    fontSize: 19,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  footerText: {
    fontFamily: fonts.display700,
    fontSize: 14.5,
    color: '#C7A991',
    letterSpacing: 0.8,
  },
});
