import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import PrimaryButton from './PrimaryButton';
import DarkButton from './DarkButton';
import SoundManager from '../src/audio/SoundManager';

export default function PauseModal({
  visible,
  onResume,
  onRestart,
  onLevels,
  onSettings,
  onHome,
}) {
  // Lower music to 0.15 while Pause menu is open, restore on close
  useEffect(() => {
    if (visible) {
      SoundManager.setMusicVolume(0.15);
    } else {
      SoundManager.setMusicVolume(0.35);
    }
    return () => {
      SoundManager.setMusicVolume(0.35);
    };
  }, [visible]);

  if (!visible) return null;

  const handleAction = (cb) => {
    SoundManager.playSfx('tap');
    if (cb) cb();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => handleAction(onResume)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>PAUSED</Text>

          <View style={styles.menuButtons}>
            <PrimaryButton
              label="RESUME"
              onPress={() => handleAction(onResume)}
              style={styles.btn}
            />
            <DarkButton
              label="↻ RESTART LEVEL"
              onPress={() => handleAction(onRestart)}
              style={styles.btn}
            />
            <DarkButton
              label="LEVEL SELECT"
              onPress={() => handleAction(onLevels)}
              style={styles.btn}
            />
            <DarkButton
              label="SETTINGS"
              onPress={() => handleAction(onSettings)}
              style={styles.btn}
            />
            <DarkButton
              label="MAIN MENU"
              onPress={() => handleAction(onHome)}
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
    backgroundColor: 'rgba(10, 4, 2, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#4A2E1C',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontFamily: fonts.display800,
    fontSize: 28,
    color: colors.flameLight,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  menuButtons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
});
