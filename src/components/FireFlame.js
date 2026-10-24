import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  LinearGradient as SvgGrad,
  Stop,
  Line,
} from 'react-native-svg';

const SPARK_COUNT = 8;

export default function FireFlame({
  size = 140, // width & height of the flame unit
  intensity = 1,
  showSparks = true,
  style,
}) {
  // Waveform 1: Slow organic breathing & swaying
  const swayAnim = useRef(new Animated.Value(0)).current;
  // Waveform 2: Medium frequency flame licking
  const lickAnim = useRef(new Animated.Value(0)).current;
  // Waveform 3: Fast incandescent core jitter
  const jitterAnim = useRef(new Animated.Value(0)).current;
  // Waveform 4: Ambient glow pulsation
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Sparks animations
  const sparkAnims = useRef(
    Array.from({ length: SPARK_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // 1. Slow sway
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Medium lick / vertical stretch
    const lickLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lickAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lickAnim, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Fast core jitter
    const jitterLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(jitterAnim, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(jitterAnim, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Start spark loops with staggered delays
    const sparkLoops = sparkAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 260),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1200 + (i % 4) * 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    swayLoop.start();
    lickLoop.start();
    jitterLoop.start();
    glowLoop.start();
    sparkLoops.forEach((l) => l.start());

    return () => {
      swayLoop.stop();
      lickLoop.stop();
      jitterLoop.stop();
      glowLoop.stop();
      sparkLoops.forEach((l) => l.stop());
    };
  }, []);

  // Outer flame transformations
  const outerRotate = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });
  const outerScaleY = lickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.08],
  });
  const outerScaleX = lickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.02, 0.97],
  });

  // Mid flame transformations (counter-sway for natural organic flicker)
  const midRotate = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['4deg', '-4deg'],
  });
  const midScaleY = lickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.12],
  });

  // Core jitter
  const coreScale = jitterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.06],
  });
  const coreOpacity = jitterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  // Glow pulse
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.9],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* 1. Pulsing Ambient Fire Halo Glow */}
      <Animated.View
        style={[
          styles.absoluteCenter,
          {
            transform: [{ scale: glowScale }],
            opacity: glowOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={size * 1.5} height={size * 1.5} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="fireHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffb300" stopOpacity="0.8" />
              <Stop offset="35%" stopColor="#ff4d00" stopOpacity="0.45" />
              <Stop offset="70%" stopColor="#d61a00" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="95" fill="url(#fireHalo)" />
        </Svg>
      </Animated.View>

      {/* 2. Outer Deep Red-Orange Flame (Licking Envelope) */}
      <Animated.View
        style={[
          styles.absoluteCenter,
          {
            transform: [
              { rotate: outerRotate },
              { scaleY: outerScaleY },
              { scaleX: outerScaleX },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 120 140">
          <Defs>
            <SvgGrad id="outerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#b31400" />
              <Stop offset="30%" stopColor="#e63900" />
              <Stop offset="70%" stopColor="#ff6200" />
              <Stop offset="100%" stopColor="#ff8c00" />
            </SvgGrad>
          </Defs>
          {/* Main outer fire silhouette with organic licking curve */}
          <Path
            d="M60 4 C76 22, 94 44, 95 72 C96 98, 80 120, 60 122 C40 120, 24 98, 25 72 C26 44, 44 22, 60 4 Z"
            fill="url(#outerFlameGrad)"
          />
          {/* Left fire lick tongue */}
          <Path
            d="M48 35 C38 48, 30 68, 32 86 C22 72, 28 52, 44 38 Z"
            fill="#ff3c00"
            opacity={0.85}
          />
          {/* Right fire lick tongue */}
          <Path
            d="M72 35 C82 48, 90 68, 88 86 C98 72, 92 52, 76 38 Z"
            fill="#ff4d00"
            opacity={0.85}
          />
        </Svg>
      </Animated.View>

      {/* 3. Mid Golden-Amber Flame Body */}
      <Animated.View
        style={[
          styles.absoluteCenter,
          {
            transform: [
              { rotate: midRotate },
              { scaleY: midScaleY },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 120 140">
          <Defs>
            <SvgGrad id="midFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#ff5500" />
              <Stop offset="40%" stopColor="#ff8800" />
              <Stop offset="80%" stopColor="#ffbe00" />
              <Stop offset="100%" stopColor="#ffe600" />
            </SvgGrad>
          </Defs>
          <Path
            d="M60 22 C72 38, 84 56, 83 78 C82 96, 72 112, 60 114 C48 112, 38 96, 37 78 C36 56, 48 38, 60 22 Z"
            fill="url(#midFlameGrad)"
          />
          {/* Internal flame lick highlight */}
          <Path
            d="M60 28 C66 42, 72 58, 69 76 C65 62, 61 46, 60 28 Z"
            fill="#fff066"
            opacity={0.65}
          />
        </Svg>
      </Animated.View>

      {/* 4. Inner Incandescent White-Hot Dancing Core */}
      <Animated.View
        style={[
          styles.absoluteCenter,
          {
            transform: [{ scale: coreScale }],
            opacity: coreOpacity,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 120 140">
          <Defs>
            <SvgGrad id="coreFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#ffb300" />
              <Stop offset="40%" stopColor="#fff066" />
              <Stop offset="100%" stopColor="#ffffff" />
            </SvgGrad>
          </Defs>
          <Path
            d="M60 48 C68 60, 72 74, 71 88 C70 98, 64 106, 60 106 C56 106, 50 98, 49 88 C48 74, 52 60, 60 48 Z"
            fill="url(#coreFlameGrad)"
          />
        </Svg>
      </Animated.View>

      {/* 5. Live Animated Flying Embers / Sparks */}
      {showSparks && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {sparkAnims.map((anim, i) => {
            // Distinct deterministic physics trajectories for each spark
            const seed = (i * 37) % 100;
            const startX = size * 0.5 + ((seed - 50) / 100) * (size * 0.35);
            const startY = size * 0.45;

            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -size * (0.6 + (i % 3) * 0.25)],
            });
            const translateX = anim.interpolate({
              inputRange: [0, 0.4, 0.8, 1],
              outputRange: [
                0,
                i % 2 === 0 ? 12 : -12,
                i % 2 === 0 ? -6 : 6,
                i % 2 === 0 ? 16 : -16,
              ],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.15, 0.7, 1],
              outputRange: [0, 1, 0.8, 0],
            });
            const scale = anim.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0.6, 1.2, 0.3],
            });

            const sparkSize = 3 + (i % 3);
            const sparkColor = i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#ffe066' : '#ff7700';

            return (
              <Animated.View
                key={`flame-spark-${i}`}
                style={[
                  styles.spark,
                  {
                    left: startX,
                    top: startY,
                    width: sparkSize,
                    height: sparkSize,
                    borderRadius: sparkSize / 2,
                    backgroundColor: sparkColor,
                    shadowColor: sparkColor,
                    shadowOpacity: 0.9,
                    shadowRadius: 4,
                    elevation: 3,
                    opacity,
                    transform: [{ translateY }, { translateX }, { scale }],
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
  },
});
