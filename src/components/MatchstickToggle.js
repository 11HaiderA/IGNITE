import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MatchstickToggle({ value, onToggle }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 38],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      style={styles.container}
    >
      {/* Outer beveled slot border */}
      <View style={styles.trackOuter}>
        {/* Track fill */}
        {value ? (
          <LinearGradient
            colors={['#ffa61a', '#e65c00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trackFill}
          />
        ) : (
          <View style={styles.trackOff} />
        )}

        {/* The Matchstick Knob */}
        <Animated.View
          style={[
            styles.matchKnob,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Wood shaft */}
          <View style={styles.woodShaft} />
          {/* Sulfur head */}
          <LinearGradient
            colors={value ? ['#ff4422', '#8c1605'] : ['#4a2118', '#200c07']}
            style={styles.sulfurHead}
          >
            <View style={styles.headHighlight} />
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  trackOuter: {
    width: 68,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1b0a04',
    borderWidth: 2.5,
    borderColor: '#4d1e0c',
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  trackFill: {
    ...StyleSheet.absoluteFillObject,
  },
  trackOff: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e0c07',
  },
  matchKnob: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 26,
    height: 22,
  },
  woodShaft: {
    width: 10,
    height: 8,
    backgroundColor: '#deb268',
    borderRadius: 1.5,
    borderWidth: 1,
    borderColor: '#9a6b29',
  },
  sulfurHead: {
    width: 16,
    height: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#260802',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headHighlight: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 4,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    opacity: 0.6,
  },
});
