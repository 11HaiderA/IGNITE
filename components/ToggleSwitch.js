import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

export default function ToggleSwitch({ value, onValueChange }) {
  return (
    <Pressable
      onPress={() => onValueChange && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      {value ? (
        <LinearGradient
          colors={[colors.primary1, colors.primary2]}
          style={[styles.pill, styles.on]}
        >
          <Text style={styles.pillText}>ON</Text>
          <View style={styles.knob} />
        </LinearGradient>
      ) : (
        <View style={[styles.pill, styles.off]}>
          <View style={styles.knob} />
          <Text style={[styles.pillText, { color: '#DDD' }]}>OFF</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 64,
    height: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  on: {
    justifyContent: 'flex-end',
  },
  off: {
    backgroundColor: '#4A4A4A',
    justifyContent: 'flex-start',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  pillText: {
    fontFamily: fonts.body900,
    fontSize: 11,
    color: '#2B1500',
  },
});
