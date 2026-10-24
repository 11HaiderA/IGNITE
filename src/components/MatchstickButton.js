import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export default function MatchstickButton({
  title,
  onPress,
  style,
  textStyle,
  fontFamily,
  showMatchIcon = false,
  variant = 'primary', // 'primary' (orange) | 'dark' (charred wood)
  disabled = false,
}) {
  const isDark = variant === 'dark';

  const gradColors = isDark
    ? ['#381c12', '#220e07', '#120502']
    : ['#ffd454', '#ff9200', '#eb4e00', '#c22800'];

  const textColor = isDark ? '#ffaa33' : '#280a01';
  const borderColor = isDark ? '#592916' : '#260a02';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled}
      style={[styles.wrapper, style, disabled && styles.disabled]}
    >
      {/* 3D bottom depth ridge underneath */}
      <View
        style={[
          styles.shadowRidge,
          { backgroundColor: isDark ? '#0a0301' : '#140400' },
        ]}
      />

      {/* Button face */}
      <LinearGradient
        colors={gradColors}
        locations={isDark ? [0, 0.5, 1] : [0, 0.28, 0.75, 1]}
        style={[styles.buttonBody, { borderColor }]}
      >
        {/* Specular White Glass Reflection Curve across the top */}
        {!isDark && (
          <View style={styles.topGlossContainer}>
            <View style={styles.glassReflection} />
          </View>
        )}

        <View style={styles.contentRow}>
          <Text
            style={[
              styles.btnText,
              { color: textColor },
              fontFamily ? { fontFamily } : styles.fallbackFont,
              textStyle,
            ]}
          >
            {title}
          </Text>

          {showMatchIcon && (
            <View style={styles.iconWrap}>
              <Svg width={28} height={28} viewBox="0 0 28 28">
                {/* 3D Wood shaft */}
                <Rect
                  x="11"
                  y="7"
                  width="4.5"
                  height="16"
                  rx="1.5"
                  fill="#dfac60"
                  stroke="#593212"
                  strokeWidth="0.8"
                  transform="rotate(45 13 15)"
                />
                {/* Wood highlight */}
                <Rect
                  x="11.5"
                  y="7"
                  width="1"
                  height="16"
                  fill="#fff"
                  opacity={0.4}
                  transform="rotate(45 13 15)"
                />
                {/* Sulfur head */}
                <Ellipse
                  cx="21"
                  cy="7.5"
                  rx="4.2"
                  ry="5.2"
                  fill="#c72510"
                  stroke="#1a0301"
                  strokeWidth="1"
                  transform="rotate(45 21 7.5)"
                />
                {/* Head highlight */}
                <Ellipse
                  cx="20.5"
                  cy="7"
                  rx="1.4"
                  ry="2"
                  fill="#ffffff"
                  opacity={0.75}
                  transform="rotate(45 20.5 7)"
                />
              </Svg>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 62,
    position: 'relative',
    marginVertical: 7,
  },
  disabled: {
    opacity: 0.55,
  },
  shadowRidge: {
    position: 'absolute',
    bottom: -6,
    left: 2,
    right: 2,
    height: 62,
    borderRadius: 31,
  },
  buttonBody: {
    flex: 1,
    borderRadius: 31,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  topGlossContainer: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 22,
    overflow: 'hidden',
    borderRadius: 18,
  },
  glassReflection: {
    width: '100%',
    height: 16,
    backgroundColor: '#ffffff',
    opacity: 0.38,
    borderRadius: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  btnText: {
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 230, 140, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fallbackFont: {
    fontWeight: '900',
  },
  iconWrap: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
