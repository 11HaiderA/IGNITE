import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '../theme';
import PrimaryButton from './PrimaryButton';
import DarkButton from './DarkButton';
import SoundManager from '../src/audio/SoundManager';

export default function TryAgainModal({
  visible,
  livesRemaining = 0,
  onWatchAdRetry,
  onMainMenu,
}) {
  if (!visible) return null;

  const handleRetryWithAd = () => {
    SoundManager.playSfx('tap');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (e) {}
    if (onWatchAdRetry) onWatchAdRetry();
  };

  const handleMenu = () => {
    SoundManager.playSfx('tap');
    if (onMainMenu) onMainMenu();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleMenu}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>TRY AGAIN</Text>

          {/* 3 Lives display */}
          <View style={styles.heartsRow}>
            {[0, 1, 2].map((idx) => {
              const active = idx < livesRemaining;
              return (
                <View key={idx} style={styles.heartWrap}>
                  <Svg width={36} height={36} viewBox="0 0 24 24">
                    <Path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={active ? '#FF3D00' : '#3E2218'}
                      stroke={active ? '#FF9E1B' : '#5C3020'}
                      strokeWidth="1.2"
                    />
                  </Svg>
                </View>
              );
            })}
          </View>

          <Text style={styles.subtitle}>
            Out of lives! Watch an ad to restore 3 lives and try again.
          </Text>

          <View style={styles.buttonStack}>
            <PrimaryButton
              label="RETRY"
              showAdBadge={true}
              onPress={handleRetryWithAd}
              style={styles.btn}
            />

            <DarkButton
              label="MAIN MENU"
              onPress={handleMenu}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#26140B',
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#783A14',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  title: {
    fontFamily: fonts.display800,
    fontSize: 26,
    color: '#FF6D00',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 109, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartWrap: {
    padding: 2,
  },
  subtitle: {
    fontFamily: fonts.body700,
    fontSize: 14,
    color: '#E0C5A4',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonStack: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
});
