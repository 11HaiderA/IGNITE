import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing, Image } from 'react-native';

const MATCH_HERO_IMG = require('../../assets/img/match_hero_perfect.png');

export default function RealisticMatchLogo({
  height = 290,
  animated = true,
  igniteDelay = 400,
}) {
  // Original asset dimensions: width = 240, height = 560
  const aspectRatio = 240 / 560;
  const containerH = height;
  const containerW = Math.round(height * aspectRatio);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.88 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Gentle floating bob (±3.5 dp, 3.6s smooth sine loop)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3.5,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 3.5,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Subtle living flame breath (1.0 <-> 1.018, 1.6s loop)
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.018,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0.985,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    breathLoop.start();

    let igniteTimer;
    if (animated) {
      igniteTimer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }, igniteDelay);
    }

    return () => {
      if (igniteTimer) clearTimeout(igniteTimer);
      floatLoop.stop();
      breathLoop.stop();
    };
  }, [animated, igniteDelay]);

  const combinedScale = Animated.multiply(scaleAnim, breathAnim);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: containerW,
          height: containerH,
          opacity: opacityAnim,
          transform: [
            { translateY: floatAnim },
            { scale: combinedScale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={MATCH_HERO_IMG}
        style={{ width: containerW, height: containerH }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
