Fix the splash screen in my Match Sticks React Native (Expo) app. Problem: it shows a BLACK screen while the audio plays, and when it does show, the animation lags.

I am giving you two replacement files. Replace the existing ones exactly:
- assets/splash/match-sticks-splash.mp4 (re-encoded: H.264 Main profile, level 4.0, no B-frames, 30 fps; lighter to decode)
- src/screens/SplashScreen.js (new version)

Then do the following, and do not change the new SplashScreen.js logic:

1. Run: npx expo install expo-video expo-splash-screen
   Make sure expo-video is the version matching my Expo SDK (expo install picks it). The `surfaceType="textureView"` and `onFirstFrameRender` props must be supported. If my SDK is older than 52, upgrade expo-video or tell me.

2. In App.js, at the very top level (outside any component):
   import * as NativeSplash from 'expo-splash-screen';
   NativeSplash.preventAutoHideAsync();
   SplashScreen.js hides the native splash itself, once the first video frame is on screen. Remove any other hideAsync() calls.

3. Render the splash as the ONLY thing on screen. Do NOT mount the Home screen, navigation stack, fonts/levels loading, or background music underneath it at the same time. Use a simple state switch:
   const [showSplash, setShowSplash] = useState(true);
   if (showSplash) return <SplashScreen muted={!soundEffectsOn} onFinish={() => setShowSplash(false)} />;
   return <AppNavigator />;
   Load fonts, levels and audio AFTER the splash finishes (or very lightly during it). Do not run heavy work on the JS thread during the 7.5 s splash.

4. Do NOT wrap <SplashScreen /> in any Animated.View, opacity, transform, Pressable, SafeAreaView with a background, or a screen transition animation. Wrapping the Android video surface in those makes the picture black while the sound plays. Disable the navigator's transition animation for this screen if it lives inside a navigator.

5. app.json: "splash": { "backgroundColor": "#000000", "resizeMode": "contain" }, and "android": { "splash": { "backgroundColor": "#000000" } }. Rebuild the native app after changing app.json.

6. Test ONLY on a release/preview build, not Expo Go and not a debug build. Debug builds are much slower and make animations lag:
   eas build -p android --profile preview   (or: npx expo run:android --variant release)

Expected result: black → the matchstick video plays smoothly WITH picture and sound → it fades to Home. Tap skips after 1.5 s. If the video can't load, the app reaches Home within 9.5 s.
