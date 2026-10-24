import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeaderHUD({ level, score, streak, time, best }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            Match<Text style={styles.titleAccent}>Sticks</Text>
          </Text>
        </View>
        <View style={styles.bestBadge}>
          <Text style={styles.bestLabel}>BEST</Text>
          <Text style={styles.bestValue}>{best}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={[styles.statValue, { color: '#ffb347' }]}>{score}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={[styles.statValue, { color: '#fb923c' }]}>
            {streak > 0 ? `🔥${streak}` : '0'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{time}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  titleAccent: {
    color: '#ffb347',
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bestLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
    letterSpacing: 0.8,
  },
  bestValue: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
});
