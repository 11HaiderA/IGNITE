// Match Sticks — animated splash (plays the splash video incl. its audio)
// Requires: npx expo install expo-video expo-splash-screen
//
// Black-screen fixes:
//  - Android uses TextureView (SurfaceView turns black inside animated / pressable parents)
//  - the video is NOT inside an Animated/opacity wrapper; fades use a black overlay ON TOP
//  - a black cover stays until the first video frame is really on screen
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, StatusBar, Platform, TouchableWithoutFeedback } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as NativeSplash from 'expo-splash-screen';

const SPLASH = require('../assets/splash/match-sticks-splash.mp4');
const MAX_MS = 9500;        // safety: never stay stuck on the splash
const SKIP_AFTER_MS = 1500; // tap-to-skip allowed after this

export default function SplashScreen({ onFinish, muted = false }) {
  const done = useRef(false);
  const [canSkip, setCanSkip] = useState(false);
  const cover = useRef(new Animated.Value(1)).current;   // black overlay: 1 = fully black

  const player = useVideoPlayer(SPLASH, p => {
    p.loop = false;
    p.muted = muted;
    // do not play yet — wait until it is ready so audio and picture start together
  });

  const reveal = () => {
    NativeSplash.hideAsync().catch(() => {});
    Animated.timing(cover, { toValue: 0, duration: 120, useNativeDriver: true }).start();
  };

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(cover, { toValue: 1, duration: 250, useNativeDriver: true }).start(() => {
      try { player.pause(); } catch {}
      onFinish && onFinish();
    });
  };

  useEffect(() => {
    let started = false;
    const start = () => { if (!started) { started = true; player.play(); } };
    if (player.status === 'readyToPlay') start();
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') start();
      if (status === 'error') { reveal(); finish(); }
    });
    const endSub = player.addListener('playToEnd', finish);
    const skipT = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    const revealFallback = setTimeout(reveal, 1200); // if onFirstFrameRender isn't supported
    const maxT = setTimeout(finish, MAX_MS);
    return () => {
      statusSub.remove(); endSub.remove();
      clearTimeout(skipT); clearTimeout(revealFallback); clearTimeout(maxT);
    };
  }, [player]);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
        onFirstFrameRender={reveal}
      />
      {/* black overlay on top (fade in/out) — never wrap VideoView itself in opacity */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.black, { opacity: cover }]} />
      {/* invisible touch layer for tap-to-skip, sibling of the video */}
      <TouchableWithoutFeedback onPress={() => canSkip && finish()}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  black: { backgroundColor: '#000' },
});
