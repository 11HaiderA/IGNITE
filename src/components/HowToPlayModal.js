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
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function HowToPlayModal({ visible, fontsLoaded, onClose }) {
  const [page, setPage] = useState(0);

  if (!visible) return null;

  const fontTitle = fontsLoaded ? 'RubikBurned_400Regular' : undefined;
  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  const handleNext = () => {
    nativeAudio.playClick();
    hapticFeedback.pick();
    if (page < 2) {
      setPage(page + 1);
    } else {
      setPage(0);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              nativeAudio.playClick();
              setPage(0);
              onClose();
            }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.title, fontTitle && { fontFamily: fontTitle }]}>
            HOW TO PLAY
          </Text>

          {/* Page 1: Exact 7 - 2 = 8 Matchstick Equation from Image 2 */}
          {page === 0 && (
            <View style={styles.pageBox}>
              <View style={styles.equationBoard}>
                <Svg width={250} height={105} viewBox="0 0 250 105">
                  <Defs>
                    <LinearGradient id="miniWood" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#f7d89a" />
                      <Stop offset="50%" stopColor="#e2b46a" />
                      <Stop offset="100%" stopColor="#a8743a" />
                    </LinearGradient>
                    <RadialGradient id="miniHead" cx="35%" cy="35%" r="65%">
                      <Stop offset="0%" stopColor="#ff9b8e" />
                      <Stop offset="45%" stopColor="#e3241f" />
                      <Stop offset="100%" stopColor="#7a0808" />
                    </RadialGradient>
                  </Defs>

                  {/* Digit 7 (x: 10) */}
                  <G transform="translate(10, 8)">
                    {/* Top stick */}
                    <Line x1="4" y1="4" x2="32" y2="4" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="4" r="4" fill="url(#miniHead)" />
                    {/* Top right */}
                    <Line x1="32" y1="8" x2="32" y2="42" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="32" cy="8" r="4" fill="url(#miniHead)" />
                    {/* Bottom right */}
                    <Line x1="32" y1="46" x2="32" y2="80" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="32" cy="46" r="4" fill="url(#miniHead)" />
                  </G>

                  {/* Minus sign '-' turning into '+' (x: 58) */}
                  <G transform="translate(58, 8)">
                    {/* Horizontal stick */}
                    <Line x1="4" y1="44" x2="32" y2="44" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="44" r="4" fill="url(#miniHead)" />
                    {/* Dashed vertical slot for + */}
                    <Line x1="18" y1="28" x2="18" y2="60" stroke="#ffb347" strokeWidth="4" strokeDasharray="3, 3" strokeLinecap="round" opacity="0.8" />
                  </G>

                  {/* Digit 2 (x: 104) */}
                  <G transform="translate(104, 8)">
                    <Line x1="4" y1="4" x2="32" y2="4" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="4" r="4" fill="url(#miniHead)" />
                    <Line x1="32" y1="8" x2="32" y2="42" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="32" cy="8" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="44" x2="32" y2="44" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="44" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="46" x2="4" y2="80" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="46" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="84" x2="32" y2="84" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="84" r="4" fill="url(#miniHead)" />
                  </G>

                  {/* Equal sign '=' (x: 150) */}
                  <G transform="translate(150, 8)">
                    <Line x1="4" y1="36" x2="28" y2="36" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="36" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="52" x2="28" y2="52" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="52" r="4" fill="url(#miniHead)" />
                  </G>

                  {/* Digit 8 (x: 194) */}
                  <G transform="translate(194, 8)">
                    <Line x1="4" y1="4" x2="32" y2="4" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="4" r="4" fill="url(#miniHead)" />
                    <Line x1="32" y1="8" x2="32" y2="42" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="32" cy="8" r="4" fill="url(#miniHead)" />
                    <Line x1="32" y1="46" x2="32" y2="80" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="32" cy="46" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="84" x2="32" y2="84" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="84" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="8" x2="4" y2="42" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="8" r="4" fill="url(#miniHead)" />
                    <Line x1="4" y1="44" x2="32" y2="44" stroke="url(#miniWood)" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="44" r="4" fill="url(#miniHead)" />

                    {/* Bottom-left stick being moved (highlighted) */}
                    <Line x1="4" y1="46" x2="4" y2="80" stroke="#f7d89a" strokeWidth="5" strokeLinecap="round" />
                    <Circle cx="4" cy="46" r="4" fill="url(#miniHead)" />
                    {/* Glowing golden circle indicator around the moving stick */}
                    <Circle cx="4" cy="63" r="10" stroke="#ffb347" strokeWidth="2" fill="none" opacity="0.9" />
                  </G>

                  {/* Dashed curved arc showing moving stick from 8 to the minus sign */}
                  <Path
                    d="M 198 70 Q 140 100 76 52"
                    fill="none"
                    stroke="#ffb347"
                    strokeWidth="2.5"
                    strokeDasharray="4, 4"
                  />
                </Svg>
              </View>

              <Text style={[styles.instText, fontBody && { fontFamily: fontBody }]}>
                Move <Text style={styles.instHot}>ONE</Text> matchstick to make the equation true.
              </Text>
              <Text style={styles.instSub}>
                Drag a stick → drop it on a glowing slot
              </Text>
            </View>
          )}

          {page === 1 && (
            <View style={styles.pageBox}>
              <Text style={styles.demoIcon}>👆 ➔ ✨</Text>
              <Text style={[styles.instText, fontBody && { fontFamily: fontBody }]}>
                Drag & drop or tap-to-move.
              </Text>
              <Text style={styles.instSub}>
                Tap any stick to pick it up, then tap any dashed outline to place it.
              </Text>
            </View>
          )}

          {page === 2 && (
            <View style={styles.pageBox}>
              <Text style={styles.demoIcon}>💡 ⭐⭐⭐</Text>
              <Text style={[styles.instText, fontBody && { fontFamily: fontBody }]}>
                Stuck? Use a hint.
              </Text>
              <Text style={styles.instSub}>
                Fewer moves and faster time unlock all 3 stars on every puzzle!
              </Text>
            </View>
          )}

          {/* Dots Indicator: Elongated red pill + 2 dark circles */}
          <View style={styles.dotsRow}>
            <View style={[styles.dotPill, page === 0 && styles.dotActive]} />
            <View style={[styles.dotPill, page === 1 && styles.dotActive]} />
            <View style={[styles.dotPill, page === 2 && styles.dotActive]} />
          </View>

          {/* NEXT > Red 3D Pill Button */}
          <TouchableOpacity
            style={styles.btnNext}
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#ff4436', '#b3121c']}
              style={styles.btnNextGrad}
            >
              <Text style={[styles.btnNextText, fontBody && { fontFamily: fontBody }]}>
                {page === 2 ? 'GOT IT!' : 'NEXT  >'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 0, 0, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#180808',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#7a2020',
    paddingVertical: screenH < 700 ? 18 : 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#e11d2a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(40, 16, 16, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4a1d1d',
    zIndex: 10,
  },
  closeText: {
    color: '#c9a9a4',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: 'rgba(225, 29, 42, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  pageBox: {
    alignItems: 'center',
    width: '100%',
    minHeight: 160,
    justifyContent: 'center',
  },
  equationBoard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  demoIcon: {
    fontSize: 38,
    marginVertical: 20,
  },
  instText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 20,
  },
  instHot: {
    color: '#ff3b30',
    fontWeight: '900',
  },
  instSub: {
    fontSize: 12,
    color: '#c9a9a4',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  dotPill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#ff3b30',
  },
  btnNext: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ff8a70',
    shadowColor: '#e11d2a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  btnNextGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNextText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
