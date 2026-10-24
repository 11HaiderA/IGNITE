import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '../theme';
import ToggleSwitch from './ToggleSwitch';
import PrimaryButton from './PrimaryButton';
import SoundManager from '../src/audio/SoundManager';

export default function SettingsModal({ visible, onClose }) {
  const [sfx, setSfx] = useState(SoundManager.isSfxEnabled());
  const [music, setMusic] = useState(SoundManager.isMusicEnabled());
  const [vibration, setVibration] = useState(true);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sfxVal = await AsyncStorage.getItem('@matchsticks_sfx');
        if (sfxVal !== null) setSfx(JSON.parse(sfxVal));

        const musicVal = await AsyncStorage.getItem('@matchsticks_music');
        if (musicVal !== null) setMusic(JSON.parse(musicVal));

        const vibVal = await AsyncStorage.getItem('@matchsticks_vibration');
        if (vibVal !== null) setVibration(JSON.parse(vibVal));
      } catch (e) {}
    })();
  }, [visible]);

  const handleSfxChange = (val) => {
    setSfx(val);
    SoundManager.setSfxEnabled(val);
    SoundManager.playSfx('tap');
  };

  const handleMusicChange = (val) => {
    setMusic(val);
    SoundManager.setMusicEnabled(val);
    SoundManager.playSfx('tap');
  };

  const handleVibChange = (val) => {
    setVibration(val);
    AsyncStorage.setItem('@matchsticks_vibration', JSON.stringify(val)).catch(() => {});
    if (val) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    }
  };

  const handleClose = () => {
    SoundManager.playSfx('tap');
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Title */}
          <View style={styles.headerBox}>
            <Text style={styles.title}>SETTINGS</Text>
          </View>

          {/* Settings Items List */}
          <View style={styles.list}>
            {/* Sound Effects */}
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>SOUND EFFECTS</Text>
              </View>
              <View style={styles.toggleContainer}>
                <ToggleSwitch value={sfx} onValueChange={handleSfxChange} />
              </View>
            </View>

            {/* Music */}
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>MUSIC</Text>
              </View>
              <View style={styles.toggleContainer}>
                <ToggleSwitch value={music} onValueChange={handleMusicChange} />
              </View>
            </View>

            {/* Vibration */}
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>VIBRATION</Text>
              </View>
              <View style={styles.toggleContainer}>
                <ToggleSwitch value={vibration} onValueChange={handleVibChange} />
              </View>
            </View>

            {/* Notification */}
            <View style={[styles.row, styles.lastRow]}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>NOTIFICATION</Text>
              </View>
              <View style={styles.toggleContainer}>
                <ToggleSwitch value={notif} onValueChange={setNotif} />
              </View>
            </View>
          </View>

          {/* Done / Close Button */}
          <View style={styles.btnWrap}>
            <PrimaryButton label="DONE" onPress={handleClose} style={styles.doneBtn} />
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
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#4A2E1C',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  headerBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display800,
    fontSize: 26,
    color: colors.flameLight,
    letterSpacing: 2,
    textAlign: 'center',
  },
  list: {
    width: '100%',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(185, 132, 58, 0.25)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display700,
    fontSize: 17,
    color: colors.cream,
    letterSpacing: 0.5,
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 50,
  },
  btnWrap: {
    width: '100%',
    alignItems: 'center',
  },
  doneBtn: {
    width: '100%',
  },
});
