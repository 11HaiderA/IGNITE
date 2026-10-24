import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function SplashView({ onFinish, fontsLoaded }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 0.4s: Strike sound & ignite flame
    const strikeTimer = setTimeout(() => {
      nativeAudio.playStrike();
      hapticFeedback.pick();
      Animated.spring(flameScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start(() => {
        nativeAudio.playIgnite();
      });
    }, 400);

    // Progress bar fills over 2.4s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2400,
      useNativeDriver: false,
    }).start();

    // Auto advance after 2.8s
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(strikeTimer);
      clearTimeout(timer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const fontTitle = fontsLoaded ? 'RubikBurned_400Regular' : undefined;
  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={onFinish}
    >
      <LinearGradient
        colors={['#000000', '#1c0606', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Center Ambient Radial Fire Glow */}
      <View style={styles.centerGlow} />

      {/* Diagonal 3D Matchstick Artwork */}
      <View style={styles.matchWrap}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          <Defs>
            <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.45" />
              <Stop offset="70%" stopColor="#e11d2a" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Ambient glow behind head */}
          <Ellipse cx="118" cy="72" rx="45" ry="45" fill="url(#splashGlow)" />

          {/* Match stick angled -38 degrees */}
          <G transform="rotate(-38, 120, 120)">
            {/* Stick Shadow */}
            <Rect x="114" y="82" width="16" height="152" rx="3" fill="#000000" opacity="0.65" />
            {/* Wood Stick */}
            <Rect x="112" y="80" width="16" height="150" rx="3" fill="#e2b46a" />
            {/* Grain lines */}
            <Rect x="117" y="90" width="2" height="130" fill="#a8743a" opacity="0.5" />
            {/* Sulfur Red Match Head */}
            <Ellipse cx="120" cy="74" rx="13" ry="15" fill="#e3241f" />
            <Ellipse cx="116" cy="69" rx="3.5" ry="3" fill="#ffffff" opacity="0.85" />
          </G>
        </Svg>

        {/* Animated Layered Flame */}
        <Animated.View
          style={[
            styles.flameContainer,
            { transform: [{ scale: flameScale }] },
          ]}
        >
          <View style={styles.flameOuter} />
          <View style={styles.flameMid} />
          <View style={styles.flameInner} />
        </Animated.View>
      </View>

      {/* Logo: MATCH (White scorched) STICKS (Fiery Red) */}
      <View style={styles.brandBox}>
        <Text style={[styles.logoMatch, fontTitle && { fontFamily: fontTitle }]}>
          MATCH
        </Text>
        <Text style={[styles.logoSticks, fontTitle && { fontFamily: fontTitle }]}>
          STICKS
        </Text>
        <Text style={[styles.tagline, fontBody && { fontFamily: fontBody }]}>
          IGNITE YOUR MIND
        </Text>
      </View>

      {/* Bottom Progress Bar */}
      <View style={styles.loaderBar}>
        <Animated.View style={[styles.loaderProgress, { width: progressWidth }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: screenH < 700 ? 30 : 50,
    paddingHorizontal: 24,
  },
  centerGlow: {
    position: 'absolute',
    top: '22%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(180, 25, 25, 0.25)',
  },
  matchWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: screenH < 700 ? 10 : 30,
  },
  flameContainer: {
    position: 'absolute',
    top: 26,
    left: 104,
    width: 50,
    height: 75,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flameOuter: {
    position: 'absolute',
    bottom: 0,
    width: 44,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#ff3b30',
    opacity: 0.85,
    shadowColor: '#ff7a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  flameMid: {
    position: 'absolute',
    bottom: 0,
    width: 28,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ff9800',
  },
  flameInner: {
    position: 'absolute',
    bottom: 0,
    width: 14,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  brandBox: {
    alignItems: 'center',
    marginVertical: 'auto',
  },
  logoMatch: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  logoSticks: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ff3b30',
    letterSpacing: 2,
    marginTop: -8,
    textShadowColor: '#ff7a1a',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#c9a9a4',
    marginTop: 14,
  },
  loaderBar: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loaderProgress: {
    height: '100%',
    backgroundColor: '#ff7a1a',
    borderRadius: 4,
  },
});
