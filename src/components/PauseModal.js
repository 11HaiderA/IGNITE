import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import EmbersBackground from './EmbersBackground';
import MatchstickButton from './MatchstickButton';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function PauseModal({
  visible,
  fontsLoaded,
  onResume,
  onRestart,
  onLevels,
  onSettings,
  onHome,
}) {
  if (!visible) return null;

  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.menuLayout}>
          {/* Left Vertical Icons Toolbar Matching Screen 5 */}
          <View style={styles.leftToolbar}>
            {/* Back / Resume */}
            <TouchableOpacity
              style={styles.iconCircle}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onResume();
              }}
            >
              <Text style={styles.toolbarIcon}>⬅</Text>
            </TouchableOpacity>

            {/* Main Menu */}
            <TouchableOpacity
              style={styles.iconCircle}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onHome();
              }}
            >
              <Text style={styles.toolbarIcon}>🏠</Text>
            </TouchableOpacity>

            {/* Restart Level */}
            <TouchableOpacity
              style={styles.iconCircle}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onRestart();
              }}
            >
              <Text style={styles.toolbarIcon}>🔄</Text>
            </TouchableOpacity>

            {/* Level Select */}
            <TouchableOpacity
              style={styles.iconCircle}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onLevels();
              }}
            >
              <Text style={styles.toolbarIcon}>≡</Text>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              style={styles.iconCircle}
              activeOpacity={0.75}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                if (onSettings) onSettings();
              }}
            >
              <Text style={styles.toolbarIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Right Main Menu Card Matching Screen 5 */}
          <EmbersBackground style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, fontBody && { fontFamily: fontBody }]}>
                MENU
              </Text>
            </View>

            <View style={styles.buttonsList}>
              {/* RESUME */}
              <MatchstickButton
                title="RESUME"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  onResume();
                }}
              />

              {/* RESTART LEVEL */}
              <MatchstickButton
                title="🔄 RESTART LEVEL"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  onRestart();
                }}
              />

              {/* LEVEL SELECT */}
              <MatchstickButton
                title="LEVEL SELECT"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  onLevels();
                }}
              />

              {/* SETTINGS */}
              <MatchstickButton
                title="SETTINGS"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  if (onSettings) onSettings();
                }}
              />

              {/* MAIN MENU */}
              <MatchstickButton
                title="MAIN MENU"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  onHome();
                }}
              />
            </View>
          </EmbersBackground>
        </View>
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
    paddingHorizontal: 12,
  },
  menuLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  leftToolbar: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b160a',
    borderWidth: 2.5,
    borderColor: '#ff8a00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  toolbarIcon: {
    fontSize: 20,
    color: '#ffc83b',
  },
  menuCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#4d1c0b',
    padding: 18,
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#421606',
    paddingBottom: 6,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ff9c1a',
    letterSpacing: 3,
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  buttonsList: {
    width: '100%',
    gap: 4,
  },
});
