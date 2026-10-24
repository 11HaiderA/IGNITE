import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import EmbersBackground from './EmbersBackground';
import MatchstickButton from './MatchstickButton';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function LevelsModal({
  visible,
  unlockedLevel,
  starsMap = {},
  fontsLoaded,
  onSelectLevel,
  onClose,
}) {
  const [page, setPage] = useState(0);
  const pageSize = 15; // 3 columns x 5 rows = 15 levels per page
  const totalLevels = 100;
  const maxPages = Math.ceil(totalLevels / pageSize) - 1;

  if (!visible) return null;

  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  const startIdx = page * pageSize + 1;
  const endIdx = Math.min(totalLevels, startIdx + pageSize - 1);
  const levelItems = [];
  for (let i = startIdx; i <= endIdx; i++) {
    levelItems.push(i);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <EmbersBackground style={styles.card}>
          {/* Top Header: Flaming LEVELS title */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              {/* Flame accents over letters */}
              <Svg width={180} height={40} viewBox="0 0 180 40" style={styles.flameSvg}>
                <Defs>
                  <RadialGradient id="flameTopGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#ffb300" stopOpacity="0.8" />
                    <Stop offset="70%" stopColor="#ff4d00" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="22" r="18" fill="url(#flameTopGlow)" />
                <Circle cx="90" cy="20" r="22" fill="url(#flameTopGlow)" />
                <Circle cx="130" cy="22" r="18" fill="url(#flameTopGlow)" />
                {/* Fire tips */}
                <Path d="M48 30 C50 15, 54 8, 52 2 C50 12, 44 18, 48 30 Z" fill="#ff7700" />
                <Path d="M88 30 C90 12, 95 5, 92 0 C89 10, 84 16, 88 30 Z" fill="#ffaa00" />
                <Path d="M128 30 C130 14, 135 6, 132 2 C130 11, 124 18, 128 30 Z" fill="#ff5500" />
              </Svg>

              <Text style={[styles.flamingTitle, fontBody && { fontFamily: fontBody }]}>
                LEVELS
              </Text>
            </View>

            {/* Page indicator & pagination controls */}
            <View style={styles.pageBar}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                disabled={page === 0}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  setPage((p) => Math.max(0, p - 1));
                }}
              >
                <Text style={styles.pageBtnText}>◀</Text>
              </TouchableOpacity>

              <Text style={[styles.pageText, fontBody && { fontFamily: fontBody }]}>
                {startIdx} - {endIdx} / {totalLevels}
              </Text>

              <TouchableOpacity
                style={[styles.pageBtn, page >= maxPages && styles.pageBtnDisabled]}
                disabled={page >= maxPages}
                onPress={() => {
                  nativeAudio.playClick();
                  hapticFeedback.pick();
                  setPage((p) => Math.min(maxPages, p + 1));
                }}
              >
                <Text style={styles.pageBtnText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3-Column Level Badges Grid Matching Screen 3 */}
          <ScrollView
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {levelItems.map((lvl) => {
                const isUnlocked = lvl <= unlockedLevel;
                const isCurrent = lvl === unlockedLevel;
                const stars = starsMap[lvl] || 0;

                return (
                  <View key={`level-badge-${lvl}`} style={styles.badgeSlot}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={!isUnlocked}
                      onPress={() => {
                        nativeAudio.playClick();
                        hapticFeedback.pick();
                        onSelectLevel(lvl);
                      }}
                      style={[
                        styles.badgeTouch,
                        isCurrent && styles.currentTouch,
                      ]}
                    >
                      {isCurrent && (
                        /* Flaming Aura Ring around Current Level */
                        <View style={styles.flameRing}>
                          <Svg width={78} height={78} viewBox="0 0 78 78">
                            <Circle
                              cx="39"
                              cy="39"
                              r="36"
                              stroke="#ff8800"
                              strokeWidth="3.5"
                              strokeDasharray="6,4"
                              fill="none"
                            />
                            {/* Little flame tongues on top */}
                            <Path d="M39 6 C42 -1, 46 -3, 44 -8 C41 -3, 38 -1, 39 6 Z" fill="#ffdd33" />
                            <Path d="M26 12 C28 5, 32 3, 30 -2 C28 3, 25 5, 26 12 Z" fill="#ff7700" />
                            <Path d="M52 12 C54 5, 58 3, 56 -2 C54 3, 51 5, 52 12 Z" fill="#ff5500" />
                          </Svg>
                        </View>
                      )}

                      {/* Badge Background */}
                      {isUnlocked ? (
                        <LinearGradient
                          colors={isCurrent ? ['#ffe366', '#ff8400', '#d83800'] : ['#ffb733', '#e86a00', '#ab2400']}
                          style={styles.unlockedCircle}
                        >
                          <Text style={[styles.levelNum, fontBody && { fontFamily: fontBody }]}>
                            {lvl}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.lockedCircle}>
                          <Text style={styles.lockIcon}>🔒</Text>
                          <Text style={[styles.lockedNum, fontBody && { fontFamily: fontBody }]}>
                            {lvl}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* 3 Stars Below Badge */}
                    <View style={styles.starsRow}>
                      {[1, 2, 3].map((starIdx) => (
                        <Text
                          key={`star-${lvl}-${starIdx}`}
                          style={[
                            styles.starText,
                            starIdx <= stars ? styles.starFilled : styles.starDim,
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom BACK Button Matching Screen 3 */}
          <View style={styles.footer}>
            <MatchstickButton
              title="⬅  BACK"
              fontFamily={fontBody}
              onPress={() => {
                nativeAudio.playClick();
                hapticFeedback.pick();
                onClose();
              }}
            />
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
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    height: Math.min(screenH * 0.9, 680),
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#4d1c0b',
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWrap: {
    alignItems: 'center',
    position: 'relative',
    height: 52,
    justifyContent: 'center',
  },
  flameSvg: {
    position: 'absolute',
    top: -12,
  },
  flamingTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ff9c1a',
    letterSpacing: 3,
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 14,
  },
  pageBtn: {
    backgroundColor: '#38160a',
    borderWidth: 2,
    borderColor: '#ff8800',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pageBtnDisabled: {
    opacity: 0.35,
    borderColor: '#4d2416',
  },
  pageBtnText: {
    color: '#ffb300',
    fontSize: 14,
    fontWeight: '900',
  },
  pageText: {
    color: '#ffc83b',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gridContainer: {
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  badgeSlot: {
    width: '32%',
    alignItems: 'center',
    marginVertical: 8,
  },
  badgeTouch: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  currentTouch: {
    shadowColor: '#ff8800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  flameRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#3b1206',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  levelNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#240801',
    letterSpacing: 0.5,
  },
  lockedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f0d07',
    borderWidth: 3,
    borderColor: '#38160d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 14,
    color: '#733722',
  },
  lockedNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5e2a18',
    marginTop: -2,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  starText: {
    fontSize: 12,
  },
  starFilled: {
    color: '#ffc83b',
    textShadowColor: '#ff7700',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starDim: {
    color: '#3d1c11',
  },
  footer: {
    width: '100%',
    paddingTop: 8,
  },
});
