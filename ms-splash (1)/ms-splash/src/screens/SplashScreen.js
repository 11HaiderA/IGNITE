// Match Sticks — animated splash (plays the exact splash video incl. its audio)
// Requires: npx expo install expo-video
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Animated, StatusBar } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const SPLASH = require('../../assets/splash/match-sticks-splash.mp4');
const MAX_MS = 9500;      // safety: never stay stuck on the splash
const SKIP_AFTER_MS = 1500; // tap-to-skip allowed after this

export default function SplashScreen({ onFinish, muted = false }) {
  const done = useRef(false);
  const fade = useRef(new Animated.Value(1)).current;
  const [canSkip, setCanSkip] = useState(false);

  const player = useVideoPlayer(SPLASH, p => {
    p.loop = false;
    p.muted = muted;
    p.play();
  });

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true })
      .start(() => onFinish && onFinish());
  };

  useEffect(() => {
    const endSub = player.addListener('playToEnd', finish);
    const errSub = player.addListener('statusChange', ({ status }) => { if (status === 'error') finish(); });
    const skipT = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    const maxT = setTimeout(finish, MAX_MS);
    return () => { endSub.remove(); errSub.remove(); clearTimeout(skipT); clearTimeout(maxT); };
  }, [player]);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <StatusBar hidden />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => canSkip && finish()}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
});
