import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '../theme';
import ToggleSwitch from '../components/ToggleSwitch';
import EmberBackground from '../src/components/EmberBackground';
import SoundManager from '../src/audio/SoundManager';

const { height: screenH } = Dimensions.get('window');

export default function SettingsScreen({ onBack }) {
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
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      SoundManager.playSfx('tap');
      if (onBack) onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBack]);

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

  const handleVibrationChange = (val) => {
    setVibration(val);
    AsyncStorage.setItem('@matchsticks_vibration', JSON.stringify(val)).catch(() => {});
    if (val) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    }
  };

  const handleBack = () => {
    SoundManager.playSfx('tap');
    if (onBack) onBack();
  };

  return (
    <View style={styles.root}>
      {/* 50% fewer embers for settings screen */}
      <EmberBackground emberCount={18} logoGlow={false} />

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header: Back Button + SETTINGS Title */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19l-7-7 7-7"
                  stroke={colors.flameLight}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>

            <Text style={styles.screenTitle}>SETTINGS</Text>
            <View style={styles.spacer} />
          </View>

          {/* Settings Toggle Rows */}
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>SOUND EFFECTS</Text>
              <ToggleSwitch value={sfx} onValueChange={handleSfxChange} />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>MUSIC</Text>
              <ToggleSwitch value={music} onValueChange={handleMusicChange} />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>VIBRATION</Text>
              <ToggleSwitch value={vibration} onValueChange={handleVibrationChange} />
            </View>

            <View style={[styles.settingRow, styles.lastRow]}>
              <Text style={styles.settingLabel}>NOTIFICATION</Text>
              <ToggleSwitch value={notif} onValueChange={setNotif} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B100B',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: screenH < 700 ? 10 : 20,
    paddingBottom: 30,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(58, 34, 20, 0.9)',
    borderWidth: 1.5,
    borderColor: '#6A3E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  screenTitle: {
    fontFamily: fonts.display800,
    fontSize: 26,
    color: '#FFD23F',
    letterSpacing: 1.5,
  },
  spacer: {
    width: 44,
  },
  settingsCard: {
    backgroundColor: 'rgba(38, 22, 14, 0.88)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#542E15',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 62, 30, 0.4)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontFamily: fonts.display700,
    fontSize: 18,
    color: '#F3E2C6',
    letterSpacing: 0.5,
  },
});
