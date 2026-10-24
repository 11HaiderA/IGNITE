import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EmbersBackground from './EmbersBackground';
import FireFlame from './FireFlame';
import RealisticMatchstick from './RealisticMatchstick';
import MatchstickButton from './MatchstickButton';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function HomeView({
  fontsLoaded,
  onPlay,
  onHowToPlay,
  onSettings,
  onLevels,
}) {
  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  return (
    <EmbersBackground style={styles.container}>
      {/* Top Bar with Settings Logo on Right Top as requested */}
      <View style={styles.topBar}>
        <View style={styles.topSpacer} />

        <TouchableOpacity
          style={styles.settingsWrapper}
          activeOpacity={0.8}
          onPress={() => {
            nativeAudio.playClick();
            hapticFeedback.pick();
            onSettings();
          }}
        >
          {/* 3D bottom depth */}
          <View style={styles.settingsShadow} />

          <LinearGradient
            colors={['#ffd454', '#ff8e00', '#eb4e00', '#b82600']}
            locations={[0, 0.3, 0.75, 1]}
            style={styles.settingsCircle}
          >
            {/* Top glass reflection */}
            <View style={styles.settingsGlass} />
            <Text style={styles.settingsIcon}>⚙</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Hero: Standing Real Matchstick with Live Animated Fire Flame */}
      <View style={styles.heroSection}>
        <View style={styles.matchHeroWrap}>
          {/* Live Animated Multi-Layered Fire */}
          <View style={styles.flameContainer}>
            <FireFlame size={150} showSparks={true} />
          </View>

          {/* Real 3D Handcrafted Matchstick */}
          <View style={styles.matchstickContainer}>
            <RealisticMatchstick
              width={20}
              height={145}
              headSize={26}
              isBurning={true}
            />
          </View>
        </View>

        {/* Title: MATCH STICKS (Exact 3D Scorched Chunky Game Typography) */}
        <View style={styles.titleBox}>
          <View style={styles.wordContainer}>
            <Text style={[styles.titleShadow, fontBody && { fontFamily: fontBody }]}>
              MATCH
            </Text>
            <Text style={[styles.titleText, fontBody && { fontFamily: fontBody }]}>
              MATCH
            </Text>
          </View>

          <View style={styles.wordContainer}>
            <Text style={[styles.titleShadow, fontBody && { fontFamily: fontBody }]}>
              STICKS
            </Text>
            <Text style={[styles.titleText, fontBody && { fontFamily: fontBody }]}>
              STICKS
            </Text>
          </View>
        </View>
      </View>

      {/* Stacked 3D Buttons Matching Concept Screen 1:
          1. PLAY (with real diagonal matchstick)
          2. LEVELS
          3. HOW TO PLAY (replaces settings, per user instruction)
      */}
      <View style={styles.buttonsContainer}>
        {/* PLAY Button */}
        <MatchstickButton
          title="PLAY"
          showMatchIcon={true}
          fontFamily={fontBody}
          onPress={() => {
            nativeAudio.playClick();
            hapticFeedback.pick();
            onPlay();
          }}
        />

        {/* LEVELS Button */}
        <MatchstickButton
          title="LEVELS"
          fontFamily={fontBody}
          onPress={() => {
            nativeAudio.playClick();
            hapticFeedback.pick();
            onLevels();
          }}
        />

        {/* HOW TO PLAY Button */}
        <MatchstickButton
          title="HOW TO PLAY"
          fontFamily={fontBody}
          onPress={() => {
            nativeAudio.playClick();
            hapticFeedback.pick();
            onHowToPlay();
          }}
        />
      </View>
    </EmbersBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: screenH < 700 ? 14 : 22,
    paddingBottom: screenH < 700 ? 22 : 34,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topSpacer: {
    width: 52,
  },
  settingsWrapper: {
    width: 52,
    height: 52,
    position: 'relative',
  },
  settingsShadow: {
    position: 'absolute',
    bottom: -4,
    left: 2,
    right: 2,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#150501',
  },
  settingsCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    borderColor: '#260a02',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  settingsGlass: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    opacity: 0.38,
  },
  settingsIcon: {
    fontSize: 26,
    color: '#280a01',
    fontWeight: '900',
    marginTop: -1,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  matchHeroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
    marginBottom: -10,
  },
  flameContainer: {
    position: 'absolute',
    top: -24,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchstickContainer: {
    position: 'absolute',
    top: 50,
    zIndex: 2,
    alignItems: 'center',
  },
  titleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 8,
    marginTop: -8,
  },
  wordContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginVertical: -2,
  },
  titleShadow: {
    fontSize: 54,
    fontWeight: '900',
    color: '#160400',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 52,
    position: 'absolute',
    top: 5,
  },
  titleText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#ff9400',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 52,
    textShadowColor: '#ffdd55',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 330,
    alignItems: 'center',
    zIndex: 10,
  },
});
