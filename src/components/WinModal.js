import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import EmbersBackground from './EmbersBackground';
import MatchstickButton from './MatchstickButton';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function WinModal({
  visible,
  level,
  stars = 3,
  timeSec = 0,
  fontsLoaded,
  onNext,
  onRestart,
  onLevels,
  onHome,
}) {
  if (!visible) return null;

  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  const mins = Math.floor(timeSec / 60);
  const secs = String(timeSec % 60).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <EmbersBackground style={styles.card}>
          <View style={styles.ribbon}>
            <Text style={[styles.ribbonText, fontBody && { fontFamily: fontBody }]}>
              LEVEL {level} COMPLETED
            </Text>
          </View>

          <Text style={[styles.title, fontBody && { fontFamily: fontBody }]}>
            BRILLIANT!
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((n) => (
              <Text
                key={`star-${n}`}
                style={[styles.star, n <= stars ? styles.starFilled : styles.starDim]}
              >
                ★
              </Text>
            ))}
          </View>

          <View style={styles.timeBadge}>
            <Text style={[styles.timeText, fontBody && { fontFamily: fontBody }]}>
              ⏱️ {mins}:{secs}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <MatchstickButton
              title="NEXT LEVEL  ➔"
              showMatchIcon={true}
              fontFamily={fontBody}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onNext();
              }}
            />
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onRestart();
              }}
            >
              <Text style={styles.iconSymbol}>↺</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onLevels();
              }}
            >
              <Text style={styles.iconSymbol}>≡</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onHome();
              }}
            >
              <Text style={styles.iconSymbol}>🏠</Text>
            </TouchableOpacity>
          </View>
        </EmbersBackground>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 2, 1, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#4d1c0b',
    paddingVertical: screenH < 700 ? 20 : 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
    overflow: 'hidden',
  },
  ribbon: {
    backgroundColor: '#38160a',
    borderWidth: 1.5,
    borderColor: '#ff8800',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  ribbonText: {
    color: '#ffc83b',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ff9c1a',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  star: {
    fontSize: 42,
  },
  starFilled: {
    color: '#ffc83b',
    textShadowColor: '#ff6600',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  starDim: {
    color: '#36180e',
  },
  timeBadge: {
    backgroundColor: '#240d06',
    borderWidth: 1.5,
    borderColor: '#4a1b0b',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeText: {
    color: '#ffb347',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3b160a',
    borderWidth: 2,
    borderColor: '#ff8800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbol: {
    fontSize: 18,
    color: '#ffc83b',
  },
});
