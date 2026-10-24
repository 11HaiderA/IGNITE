import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import EmbersBackground from './EmbersBackground';
import MatchstickButton from './MatchstickButton';
import { nativeAudio } from '../utils/nativeAudio';
import { hapticFeedback } from '../utils/haptics';

const { height: screenH } = Dimensions.get('window');

export default function HintModal({ visible, fontsLoaded, onRewarded, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const fontBody = fontsLoaded ? 'Oswald_700Bold' : undefined;

  const handleWatchAd = () => {
    nativeAudio.playClick();
    hapticFeedback.pick();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onRewarded();
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <EmbersBackground style={styles.card}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              nativeAudio.playClick();
              onClose();
            }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.bulbWrap}>
            <Text style={styles.bulbIcon}>💡</Text>
          </View>

          <Text style={[styles.title, fontBody && { fontFamily: fontBody }]}>
            NEED A HINT?
          </Text>
          <Text style={styles.desc}>
            Watch a quick video to reveal which matchstick to move and where to place it!
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ff8800" />
              <Text style={[styles.loadingText, fontBody && { fontFamily: fontBody }]}>
                Loading Video Ad...
              </Text>
            </View>
          ) : (
            <View style={styles.btnCol}>
              <MatchstickButton
                title="▶  WATCH AD"
                showMatchIcon={true}
                fontFamily={fontBody}
                onPress={handleWatchAd}
              />

              <MatchstickButton
                title="NO THANKS"
                variant="dark"
                fontFamily={fontBody}
                onPress={() => {
                  nativeAudio.playClick();
                  onClose();
                }}
              />
            </View>
          )}
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
    maxWidth: 320,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#4d1c0b',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#ff7700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b160a',
    borderWidth: 1.5,
    borderColor: '#ff8800',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    color: '#ffc83b',
    fontSize: 14,
    fontWeight: '800',
  },
  bulbWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#381607',
    borderWidth: 2.5,
    borderColor: '#ff9000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bulbIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ff9c1a',
    letterSpacing: 2,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    color: '#deb38a',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    color: '#ffb347',
    fontSize: 14,
    fontWeight: '700',
  },
  btnCol: {
    width: '100%',
  },
});
