import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme';

// Place with absolute positioning inside the board: style={{ left:'20%', top:'15%', transform:[{rotate:'45deg'}] }}
export default function Matchstick({ style, selected, onPress, headDirection = 'top' }) {
  const content = (
    <View style={[styles.stick, selected && styles.selected, style]}>
      <View style={[styles.head, headDirection === 'bottom' && styles.headBottom]} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={style}>
        <View style={[styles.stick, selected && styles.selected]}>
          <View style={[styles.head, headDirection === 'bottom' && styles.headBottom]} />
        </View>
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  stick: {
    position: 'absolute',
    width: 8,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#E8B06A',
  },
  head: {
    position: 'absolute',
    top: -6,
    left: -3,
    width: 14,
    height: 18,
    borderRadius: 7,
    backgroundColor: '#7A2E00',
  },
  headBottom: {
    top: undefined,
    bottom: -6,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
});
