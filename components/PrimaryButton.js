import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, fonts, shadow } from '../theme';
import SoundManager from '../src/audio/SoundManager';

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  showAdBadge = false,
  style,
  textStyle,
}) {
  const handlePress = () => {
    if (disabled) return;
    SoundManager.playSfx('tap');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (e) {}
    if (onPress) onPress();
  };

  return (
    <View style={[styles.wrap, disabled && styles.disabled, style]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={[colors.primary1, colors.primary2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.btn}
        >
          <Text style={[styles.primaryText, textStyle]}>{label}</Text>
        </LinearGradient>
      </Pressable>

      {showAdBadge && (
        <View style={styles.adBadge} pointerEvents="none">
          <Svg width={8} height={8} viewBox="0 0 24 24" fill="none" style={{ marginRight: 2 }}>
            <Path d="M5 4v16l14-8L5 4z" fill="#FFFFFF" />
          </Svg>
          <Text style={styles.adBadgeText}>AD</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    ...shadow,
  },
  pressable: {
    borderRadius: 999,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  btn: {
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryText: {
    fontFamily: fonts.display800,
    fontSize: 22,
    letterSpacing: 1,
    color: '#2B1500',
    textTransform: 'uppercase',
  },
  adBadge: {
    position: 'absolute',
    top: -5,
    right: 12,
    zIndex: 10,
    backgroundColor: '#D84315',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  adBadgeText: {
    fontFamily: fonts.display800,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
});
