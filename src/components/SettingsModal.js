import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
import EmbersBackground from './EmbersBackground';
import MatchstickToggle from './MatchstickToggle';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function SettingsModal({
  visible,
  settings,
  fontsLoaded,
  onUpdateSettings,
  onClose,
}) {
  const [notification, setNotification] = useState(true);

  if (!visible) return null;

  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  const toggle = (key) => {
    nativeAudio.playClick();
    hapticFeedback.pick();
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    onUpdateSettings(updated);
    nativeAudio.setSettings(updated.music, updated.sfx);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <EmbersBackground style={styles.card}>
          {/* Top Header Matching Screen 4: Back Button + Flaming SETTINGS Title */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onClose();
              }}
            >
              <Text style={styles.backArrow}>⬅</Text>
            </TouchableOpacity>

            <View style={styles.titleWrap}>
              <Svg width={180} height={36} viewBox="0 0 180 36" style={styles.flameSvg}>
                <Defs>
                  <RadialGradient id="flameSetGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#ffb300" stopOpacity="0.8" />
                    <Stop offset="70%" stopColor="#ff4d00" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="60" cy="20" r="18" fill="url(#flameSetGlow)" />
                <Circle cx="120" cy="20" r="18" fill="url(#flameSetGlow)" />
                <Path d="M58 28 C60 14, 65 6, 62 0 C59 9, 54 16, 58 28 Z" fill="#ff7700" />
                <Path d="M118 28 C120 13, 125 5, 122 0 C119 9, 114 16, 118 28 Z" fill="#ffaa00" />
              </Svg>

              <Text style={[styles.titleText, fontBody && { fontFamily: fontBody }]}>
                SETTINGS
              </Text>
            </View>

            <View style={{ width: 44 }} />
          </View>

          {/* Settings Items with Matchstick Toggles Matching Screen 4 */}
          <View style={styles.itemsList}>
            {/* SOUND EFFECTS */}
            <View style={styles.settingRow}>
              <Text style={[styles.itemLabel, fontBody && { fontFamily: fontBody }]}>
                SOUND EFFECTS
              </Text>
              <MatchstickToggle
                value={settings.sfx !== false}
                onToggle={() => toggle('sfx')}
              />
            </View>

            {/* MUSIC */}
            <View style={styles.settingRow}>
              <Text style={[styles.itemLabel, fontBody && { fontFamily: fontBody }]}>
                MUSIC
              </Text>
              <MatchstickToggle
                value={settings.music !== false}
                onToggle={() => toggle('music')}
              />
            </View>

            {/* VIBRATION */}
            <View style={styles.settingRow}>
              <Text style={[styles.itemLabel, fontBody && { fontFamily: fontBody }]}>
                VIBRATION
              </Text>
              <MatchstickToggle
                value={settings.vibration !== false}
                onToggle={() => toggle('vibration')}
              />
            </View>

            {/* NOTIFICATION */}
            <View style={styles.settingRow}>
              <Text style={[styles.itemLabel, fontBody && { fontFamily: fontBody }]}>
                NOTIFICATION
              </Text>
              <MatchstickToggle
                value={notification}
                onToggle={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  setNotification(!notification);
                }}
              />
            </View>
          </View>

          {/* Bottom spacer */}
          <View style={styles.bottomBar}>
            <Text style={styles.versionText}>MATCHSTICKS v1.2 · IGNITE YOUR MIND</Text>
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
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#4d1c0b',
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b1507',
    borderWidth: 2.5,
    borderColor: '#ff8800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#ffc83b',
  },
  titleWrap: {
    alignItems: 'center',
    position: 'relative',
    height: 44,
    justifyContent: 'center',
  },
  flameSvg: {
    position: 'absolute',
    top: -10,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ff9c1a',
    letterSpacing: 2.5,
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  itemsList: {
    width: '100%',
    paddingVertical: 10,
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d0b05',
    borderWidth: 2,
    borderColor: '#3b160b',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffe599',
    letterSpacing: 1.2,
  },
  bottomBar: {
    alignItems: 'center',
    paddingTop: 16,
  },
  versionText: {
    fontSize: 11,
    color: '#6e341f',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
});
