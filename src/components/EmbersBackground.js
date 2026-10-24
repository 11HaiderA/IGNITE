import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenW, height: screenH } = Dimensions.get('window');

// 22 deterministic embers with varied positions, sizes, and float speeds
const EMBER_DATA = [
  { x: 0.12, y: 0.25, size: 4, dur: 3800, delay: 100, color: '#ffcc00' },
  { x: 0.82, y: 0.18, size: 5, dur: 4500, delay: 400, color: '#ff6600' },
  { x: 0.22, y: 0.42, size: 3, dur: 3200, delay: 800, color: '#ffa500' },
  { x: 0.74, y: 0.55, size: 6, dur: 5200, delay: 200, color: '#ff4400' },
  { x: 0.08, y: 0.65, size: 4, dur: 4100, delay: 600, color: '#ffea79' },
  { x: 0.88, y: 0.72, size: 5, dur: 3600, delay: 1000, color: '#ff7700' },
  { x: 0.35, y: 0.82, size: 3, dur: 4400, delay: 500, color: '#ffbb11' },
  { x: 0.65, y: 0.88, size: 4, dur: 3900, delay: 300, color: '#ff5500' },
  { x: 0.48, y: 0.12, size: 3, dur: 4800, delay: 700, color: '#ffaa00' },
  { x: 0.18, y: 0.88, size: 5, dur: 3400, delay: 1200, color: '#ff3300' },
  { x: 0.85, y: 0.38, size: 4, dur: 4600, delay: 900, color: '#ffdd33' },
  { x: 0.28, y: 0.15, size: 3, dur: 3500, delay: 350, color: '#ff6a00' },
  { x: 0.92, y: 0.85, size: 4, dur: 4200, delay: 150, color: '#ff9900' },
  { x: 0.05, y: 0.35, size: 5, dur: 5000, delay: 650, color: '#ff5500' },
  { x: 0.78, y: 0.92, size: 3, dur: 3700, delay: 850, color: '#ffcc22' },
];

export default function EmbersBackground({ children, style }) {
  const anims = useRef(EMBER_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) => {
      const data = EMBER_DATA[i];
      return Animated.loop(
        Animated.sequence([
          Animated.delay(data.delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: data.dur,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((l) => l.start());

    return () => {
      loops.forEach((l) => l.stop());
    };
  }, [anims]);

  return (
    <View style={[styles.root, style]}>
      {/* Base warm dark gradient */}
      <LinearGradient
        colors={['#170602', '#260a04', '#150502', '#0a0201']}
        locations={[0, 0.4, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle charred wood vertical plank stripes */}
      <View style={styles.planksOverlay}>
        <View style={styles.plankLine} />
        <View style={styles.plankLine} />
        <View style={styles.plankLine} />
        <View style={styles.plankLine} />
      </View>

      {/* Floating Ember Particles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {EMBER_DATA.map((d, i) => {
          const translateY = anims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -35],
          });
          const translateX = anims[i].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, i % 2 === 0 ? 8 : -8, 0],
          });
          const opacity = anims[i].interpolate({
            inputRange: [0, 0.2, 0.7, 1],
            outputRange: [0.2, 0.9, 0.8, 0.1],
          });
          const scale = anims[i].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 1.2, 0.7],
          });

          return (
            <Animated.View
              key={`ember-${i}`}
              style={[
                styles.ember,
                {
                  left: d.x * screenW,
                  top: d.y * screenH,
                  width: d.size,
                  height: d.size,
                  borderRadius: d.size / 2,
                  backgroundColor: d.color,
                  shadowColor: d.color,
                  shadowOpacity: 0.9,
                  shadowRadius: d.size * 2,
                  elevation: 4,
                  opacity,
                  transform: [{ translateY }, { translateX }, { scale }],
                },
              ]}
            />
          );
        })}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d0402',
  },
  planksOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.15,
  },
  plankLine: {
    width: 1.5,
    height: '100%',
    backgroundColor: '#000000',
  },
  ember: {
    position: 'absolute',
  },
});
