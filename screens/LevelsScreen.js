import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import LevelCircle from '../components/LevelCircle';
import PrimaryButton from '../components/PrimaryButton';
import EmberBackground from '../src/components/EmberBackground';
import SoundManager from '../src/audio/SoundManager';

export default function LevelsScreen({ onBack, onPlay, maxUnlockedLevel = 1, gameCompleted = false }) {
  const { width: windowW } = useWindowDimensions();

  const isAllUnlocked = gameCompleted || maxUnlockedLevel >= 50;

  // Dynamic 50 levels based on user progress
  const levelsData = Array.from({ length: 50 }, (_, i) => {
    const n = i + 1;
    let state = 'locked';
    let stars = 0;
    if (isAllUnlocked) {
      state = n === 50 ? 'current' : 'done';
      stars = 3;
    } else if (n < maxUnlockedLevel) {
      state = 'done';
      stars = 3;
    } else if (n === maxUnlockedLevel) {
      state = 'current';
      stars = 0;
    }
    return { n, state, stars };
  });

  const completedCount = isAllUnlocked ? 50 : Math.min(50, Math.max(0, maxUnlockedLevel - 1));
  const starsCount = isAllUnlocked ? 150 : Math.min(150, completedCount * 3);

  // 3-column spacing calculation
  const numColumns = 3;
  const horizontalPadding = 20;
  const gap = 16;
  const availableW = windowW - horizontalPadding * 2;
  const itemW = Math.floor((availableW - (numColumns - 1) * gap) / numColumns);

  const handleBack = () => {
    SoundManager.playSfx('tap');
    if (onBack) onBack();
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.root}>
      {/* Matching EmberBackground with 50% fewer embers */}
      <EmberBackground emberCount={18} logoGlow={false} />

      <SafeAreaView style={styles.container}>
        {/* Title LEVELS Centered */}
        <View style={styles.headerWrap}>
          <Text style={styles.screenTitle}>LEVELS</Text>
        </View>

        {/* Grid: 20 items with dynamic lock/unlock state */}
        <FlatList
          data={levelsData}
          keyExtractor={(item) => `level-${item.n}`}
          numColumns={numColumns}
          columnWrapperStyle={[styles.columnWrapper, { gap }]}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={{ width: itemW, alignItems: 'center' }}>
              <LevelCircle
                level={item}
                onPress={(lvl) => {
                  SoundManager.playSfx('tap');
                  if (onPlay) onPlay(lvl);
                }}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer: Dynamic completed count & stars + BACK Primary Button */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerStats}>
            COMPLETED: {completedCount}/50 • {starsCount}/150 ★
          </Text>
          <PrimaryButton label="← BACK" onPress={handleBack} style={styles.backBtn} />
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  screenTitle: {
    fontFamily: fonts.display800,
    fontSize: 32,
    letterSpacing: 1,
    color: colors.flameLight,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  footerWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  footerStats: {
    fontFamily: fonts.body900,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  backBtn: {
    width: '100%',
    maxWidth: 280,
  },
});
