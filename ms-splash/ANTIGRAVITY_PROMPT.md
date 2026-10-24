# Add the animated splash screen to Match Sticks (React Native)

Add the attached splash screen to my Match Sticks app. It must play **exactly** the video `assets/splash/match-sticks-splash.mp4` (6.5 s, 720×1560, H.264 + AAC audio), with its own audio. Do not recreate or change the animation, and do not replace the audio.

## Files to add (provided)
- `assets/splash/match-sticks-splash.mp4` → copy into the project at this path.
- `src/screens/SplashScreen.js` → copy in as is. Adjust the `require` path only if the project's folder structure differs.

## Steps
1. Install the video player: `npx expo install expo-video`.
   - If this is a bare React Native project (not Expo), use `react-native-video` instead and rewrite `SplashScreen.js` with `<Video source={SPLASH} resizeMode="cover" repeat={false} paused={false} muted={muted} onEnd={finish} onError={finish} />`. Keep the same behaviour: fade out, the 8 s safety timeout, and tap-to-skip after 1.5 s.
2. Show `SplashScreen` as the very first screen when the app opens. When `onFinish` fires, go to the Home screen. Use `navigation.replace('Home')`, or a state switch in `App.js`, so Back cannot return to the splash.
3. Native splash (the screen shown before JS loads): set it to plain black (`#000000`), with no icon or a tiny one, so it blends into the video (the video starts from black). In app.json / app.config: `"splash": { "backgroundColor": "#000000", "resizeMode": "contain" }`. Hide it with `expo-splash-screen` (`SplashScreen.preventAutoHideAsync()` at startup, `hideAsync()` once the video component has mounted) so there is no white flash.
4. Sound setting: read the saved "Sound Effects" setting before showing the splash. If sound is OFF, pass `muted={true}`. The video still plays, only silently.
5. The video fills the screen with `contentFit="cover"` and the status bar hidden. It must look correct on tall phones (19.5:9 and up) and on tablets. With cover the edges crop slightly, and the match and title must stay fully visible because they are centred.
6. Show the splash on every cold app start, but not when the app returns from the background.

## Acceptance checks
- On a cold start: black → video plays with sound → fades into Home. No white or grey flash at any point.
- Tapping before 1.5 s does nothing; tapping after 1.5 s skips to Home.
- With Sound Effects OFF the splash is silent.
- If the video fails to load, the app still reaches Home within 8 s.
- Works on Android and iOS (test in a development build or APK; note that Expo Go may not include `expo-video` on older SDKs).
