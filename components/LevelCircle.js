import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

// levels 1-12 done (3 stars), 13 current (0 stars), 14-20 locked (number still visible)
export const LEVELS = Array.from({ length: 20 }, (_, i) => ({
  n: i + 1,
  state: i < 12 ? 'done' : i === 12 ? 'current' : 'locked',
  stars: i < 12 ? 3 : 0,
}));

export default function LevelCircle({ level, onPress }) {
  const { n, state, stars } = level;
  const locked = state === 'locked';

  return (
    <View style={styles.cell}>
      <Pressable
        disabled={locked}
        onPress={() => onPress && onPress(level)}
        style={({ pressed }) => [
          styles.pressWrap,
          pressed && !locked && styles.pressed,
        ]}
      >
        {state === 'locked' ? (
          <View style={[styles.circle, styles.lockedCircle]}>
            <Text style={[styles.num, { color: colors.lockedText }]}>{n}</Text>
            <Text style={styles.lockBadge}>🔒</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[colors.primary1, colors.primary2]}
            style={[styles.circle, state === 'current' && styles.currentRing]}
          >
            <Text style={styles.num}>{n}</Text>
          </LinearGradient>
        )}
      </Pressable>

      <Text style={styles.stars}>
        {state === 'done' ? '★★★' : state === 'current' ? '☆☆☆' : ' '}
      </Text>
      <Text style={styles.label}>
        {state === 'done' ? 'Done' : state === 'current' ? 'Current' : 'Locked'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  pressWrap: {
    borderRadius: 36,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCircle: {
    backgroundColor: colors.lockedBg,
    position: 'relative',
  },
  currentRing: {
    borderWidth: 3,
    borderColor: colors.flame,
  },
  num: {
    fontFamily: fonts.display800,
    fontSize: 20,
    color: '#FFF',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 14,
  },
  stars: {
    fontSize: 12,
    color: colors.gold,
    marginTop: 4,
    height: 16,
  },
  label: {
    fontFamily: fonts.body900,
    fontSize: 11,
    color: colors.textMuted,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});
