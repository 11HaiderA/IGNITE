import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, Image } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Individual Sparkle Particle with immediate presence, upward drift, sway, and twinkle
function SparkleParticle({ index, width, height }) {
  // Deterministic pseudorandom parameters per particle index
  const seed1 = ((index * 137.5) % 1);
  const seed2 = ((index * 269.3) % 1);
  const seed3 = ((index * 419.7) % 1);
  const seed4 = ((index * 587.1) % 1);

  // Type: 0 = Micro-sparkle, 1 = Glowing Amber, 2 = Soft Bokeh Orb, 3 = Fire Fleck
  const type = index % 4;

  const startX = seed1 * (width - 24) + 12;
  // Initial Y is distributed across the entire screen so particles are visible immediately
  const initialY = seed2 * height;

  let size = 3;
  let baseOpacity = 0.85;
  let duration = 7000 + Math.round(seed3 * 6000); // 7s to 13s full cycle

  if (type === 0) {
    // Micro-sparkle pinpoint
    size = 2.5 + seed4 * 2; // 2.5px - 4.5px
    baseOpacity = 0.85 + seed3 * 0.15;
    duration = 6000 + seed3 * 5000;
  } else if (type === 1) {
    // Glowing amber ember dot
    size = 5 + seed4 * 3.5; // 5px - 8.5px
    baseOpacity = 0.75 + seed3 * 0.2;
    duration = 8000 + seed3 * 6000;
  } else if (type === 2) {
    // Soft ambient bokeh circle
    size = 14 + Math.round(seed4 * 16); // 14px - 30px
    baseOpacity = 0.25 + seed3 * 0.25;
    duration = 10000 + seed3 * 7000;
  } else {
    // Fire fleck
    size = 4;
    baseOpacity = 0.8;
    duration = 5500 + seed3 * 4500;
  }

  const swayDist = 12 + seed1 * 22; // 12 to 34 px horizontal sway

  const transY = useRef(new Animated.Value(initialY)).current;
  const transX = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(baseOpacity)).current;

  useEffect(() => {
    let isMounted = true;

    // 1. Upward continuous rise loop
    const firstLegDuration = Math.max(800, Math.round(((initialY + 30) / (height + 40)) * duration));

    const loopFullRise = () => {
      if (!isMounted) return;
      transY.setValue(height + 20);

      Animated.timing(transY, {
        toValue: -30,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && isMounted) {
          loopFullRise();
        }
      });
    };

    // First leg from initial on-screen position to top
    Animated.timing(transY, {
      toValue: -30,
      duration: firstLegDuration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isMounted) {
        loopFullRise();
      }
    });

    // 2. Horizontal gentle sinusoidal sway
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(transX, {
          toValue: swayDist,
          duration: 1800 + seed2 * 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(transX, {
          toValue: -swayDist,
          duration: 1900 + seed3 * 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    swayLoop.start();

    // 3. Gentle twinkle / brightness pulsing
    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: baseOpacity * 0.35,
          duration: 900 + seed4 * 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: baseOpacity,
          duration: 1000 + seed1 * 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    twinkleLoop.start();

    return () => {
      isMounted = false;
      swayLoop.stop();
      twinkleLoop.stop();
    };
  }, [height, initialY, duration, swayDist, baseOpacity, seed1, seed2, seed3, seed4]);

  // Render particle based on type (pure React Native Views, ZERO SVG gradient glitches)
  const renderContent = () => {
    if (type === 0) {
      // Micro-sparkle: bright pinpoint with intense glow
      return (
        <View
          style={[
            styles.microSparkle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      );
    } else if (type === 1) {
      // Glowing amber ember
      return (
        <View
          style={[
            styles.amberEmber,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      );
    } else if (type === 2) {
      // Soft blurred bokeh orb (pure translucent warm circle)
      return (
        <View
          style={[
            styles.bokehOrb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      );
    } else {
      // Fire fleck streak
      return (
        <View
          style={[
            styles.fireFleck,
            {
              transform: [{ rotate: `${(index % 2 === 0 ? 1 : -1) * 18}deg` }],
            },
          ]}
        />
      );
    }
  };

  return (
    <Animated.View
      style={[
        styles.particleWrap,
        {
          left: startX,
          width: size,
          height: type === 3 ? 8 : size,
          opacity: opacityAnim,
          transform: [{ translateY: transY }, { translateX: transX }],
        },
      ]}
      pointerEvents="none"
    >
      {renderContent()}
    </Animated.View>
  );
}

export default function EmberBackground({ emberCount = 48 }) {
  const w = SCREEN_W;
  const h = SCREEN_H;

  const particles = useMemo(() => {
    return Array.from({ length: emberCount }, (_, i) => (
      <SparkleParticle key={`sparkle-${i}`} index={i} width={w} height={h} />
    ));
  }, [emberCount, w, h]);

  return (
    <View style={styles.root} pointerEvents="none">
      {/* 1. Base dark chocolate brown background */}
      <View style={styles.baseBg} />

      {/* 2. Authentic Clean High-Resolution Sparkle Background */}
      <Image
        source={require('../../assets/img/clean_bg_test.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* 3. Magical Sparkles & Embers distributed across the entire canvas */}
      <View style={StyleSheet.absoluteFill}>
        {particles}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  baseBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B0B04',
  },
  particleWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microSparkle: {
    backgroundColor: '#FFF8E1',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 4,
  },
  amberEmber: {
    backgroundColor: '#FFA726',
    borderWidth: 0.8,
    borderColor: '#FFE082',
    shadowColor: '#FF6D00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 7,
    elevation: 4,
  },
  bokehOrb: {
    backgroundColor: 'rgba(255, 167, 38, 0.28)',
    shadowColor: '#FF6D00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3,
  },
  fireFleck: {
    width: 2.2,
    height: 7,
    borderRadius: 1.2,
    backgroundColor: '#FFE57F',
    shadowColor: '#FF9100',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 3,
  },
});
