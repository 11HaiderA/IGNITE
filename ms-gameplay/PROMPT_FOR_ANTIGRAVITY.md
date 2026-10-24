Add sounds, background music and a "sticks burn" win effect to my Match Sticks React Native (Expo) game. Keep my existing UI style (dark brown background, orange/yellow gradient, rounded bold font). Do not break the existing game logic or the splash screen.

## 1. Audio files (I am providing them — copy them into assets/sounds/)
| File | When to play |
|---|---|
| match_burn.mp3 | When the equation is solved correctly (burn effect, see section 3) |
| stick_pick.mp3 | When the player picks up / starts dragging a matchstick |
| stick_drop.mp3 | When a matchstick snaps into a slot |
| tap.mp3 | Every UI button tap (Play, Pause, Resume, Restart, Levels, Settings, Main Menu, Hint, toggles, back) |
| wrong.mp3 | When the move makes a wrong or invalid equation |
| star.mp3 | Each star appearing on the win popup (play 1 per star, 150 ms apart) |
| bg_music.mp3 | Background music, looping |

## 2. Sound system (create src/audio/SoundManager.js)
- Use `expo-audio` (`npx expo install expo-audio`). If my SDK doesn't have it, use `expo-av`.
- PRELOAD every sound once when the app starts (after the splash). Never create a new player on each tap, because that causes lag and delays.
- Use one reusable player per SFX. On play: seek to 0, then play, so fast repeated taps still work.
- Exported functions: `playSfx(name)`, `startMusic()`, `stopMusic()`, `pauseMusic()`, `resumeMusic()`, `setSfxEnabled(bool)`, `setMusicEnabled(bool)`.
- Volumes: SFX 0.9, bg music 0.35. While the burn sound plays, lower the music to 0.15, then fade it back to 0.35 over 500 ms.
- Settings screen: the "SOUND EFFECTS" toggle controls all SFX; the "MUSIC" toggle starts/stops bg music immediately. Save both in AsyncStorage and read them on startup.
- Music: starts after the splash on the Home screen, loops forever, continues through gameplay. Lower it to 0.15 while the Pause menu is open. Pause it when the app goes to the background (AppState) and resume it on return.
- Set the audio mode so the music respects the phone's silent mode on iOS and doesn't stop other apps' audio unnecessarily (`playsInSilentMode: false`, mix with others: false).

## 3. Win effect: all sticks burn (when the equation becomes correct)
Use `react-native-reanimated` (useNativeDriver / UI thread) so it stays smooth.
1. Lock input immediately (no more dragging).
2. Play `match_burn.mp3` at the same moment the first stick ignites.
3. Fire spreads stick by stick in reading order (left to right, top to bottom). Delay between sticks = 900 ms / number of sticks, so all sticks have caught fire within ~0.9 s, matching the sound.
4. For each stick when its turn comes:
   - A small flame appears at the match head: an orange/yellow teardrop with a soft glow and a flicker (scale 0.9–1.1 loop, 120 ms). It travels along the stick from head to tail over 600 ms, then fades out.
   - The stick colour changes from wood (#E2B46A) to charcoal black (#1A1210) along with the flame (interpolate colour or cross-fade a black stick image over it). The red head turns dark grey ash (#3A3633).
   - Add 3–5 tiny orange ember dots on the burnt stick that glow, then fade over 1.2 s.
5. After the last stick has burned, show thin grey smoke wisps rising from the equation (2–3 soft semi-transparent shapes moving up and fading, 1.2 s).
6. Hold the burnt equation for ~0.5 s, then open the win popup. The burnt sticks stay visible behind the popup. Play `star.mp3` for each star.
7. When the next level loads, the sticks are fresh wood again.
8. Performance: animate only transform, opacity and colour on the UI thread. Do not re-render the whole board every frame. Keep the flame and ember views simple (no heavy blur on Android; use a pre-made glow PNG or a radial gradient from react-native-svg instead of blur).

## 4. Other sound triggers
- Start dragging a stick → stick_pick. Drop into a valid slot → stick_drop. Drop in an invalid place (stick springs back) → no sound, or a quiet stick_drop at volume 0.4.
- Wrong equation → wrong.mp3, plus the existing shake.
- Undo / Reset buttons → tap.mp3.
- Hint revealed → tap.mp3.

## 5. Checks
- No delay between a tap and its sound, even when tapping quickly.
- The burn sound and the burning sticks start together.
- The Sound Effects toggle OFF = silent game. The Music toggle OFF = no music, even after restarting the app.
- The music doesn't restart from the beginning when changing screens.
- Smooth on a release build (test with `eas build -p android --profile preview`, not Expo Go or a debug build).

## 6. Home screen: music + animated fire background
### Music
- bg_music.mp3 must already be playing when the Home screen appears (start it the moment the splash finishes, fading in from 0 to 0.35 over 1.5 s).
- It keeps playing (same track, no restart) when moving Home → Levels → Gameplay → back to Home.

### Animated background (create src/components/EmberBackground.js and put it behind the Home screen content)
Render it as the bottom layer (position absolute, fill the screen, pointerEvents="none"); all buttons and the logo stay on top. Match the reference video home-screen-preview.mp4.
Layers, bottom to top:
1. Base colour #1B100B (same dark brown as my UI) with very faint horizontal wood-grain lines (opacity 0.05).
2. Fire glow from the bottom edge: a large radial gradient (react-native-svg RadialGradient) centred just below the screen, colours rgba(255,130,20,.55) → rgba(200,70,10,.22) → transparent. Its opacity "breathes" like a fire: loop between 0.65 and 0.95 with an irregular rhythm (combine two Reanimated withRepeat timings of 1.7 s and 0.6 s).
3. A soft orange glow behind the MATCH STICKS logo (rgba(255,150,40,.12)), slowly pulsing (3 s).
4. Smoke: 5 very faint grey circles (opacity ≤ 0.05) drifting slowly upward (15–20 s per cycle) and swaying sideways.
5. Rising embers: 40 small glowing dots (2–6 px, orange core #FFD26E with an orange halo). Each one rises from below the screen to the top in 8–20 s, sways left/right, twinkles (opacity 0.35 ↔ 1), fades out near the top, then restarts from the bottom at a new random x. Use a pre-made small glow PNG (provided or generated) for each ember instead of blur; it is much faster.
6. Occasional spark: every 3–6 s one quick bright streak shoots up from the bottom and fades (0.8 s).
7. Dark vignette at the edges (radial gradient to rgba(0,0,0,.7)).

Performance rules (must stay 60 fps on low-end Android):
- All motion uses react-native-reanimated shared values / withRepeat on the UI thread; no setState in an animation loop, no JS timers per frame.
- No blur filters. Max 40 embers (20 on devices with less than 4 GB RAM, if detectable).
- Pause the animations when Home is not focused (useIsFocused) and when the app is in the background.
- Also use the same EmberBackground (with 50% fewer embers) behind the Levels and Settings screens, so the look matches. Do not use it behind gameplay; it would distract from the sticks.

## 7. Home screen redesign (match home-screen-design.png and home-screen-preview.mp4)
Keep my current Home layout and logic (Continue shows the saved level; the footer shows the latest level and stars), but restyle it like this:

**Layer order:** EmberBackground (section 6) at the bottom → logo → title → buttons → footer.

1. **Logo: realistic burning matchstick (replace the cartoon flame).** Build it in react-native-svg:
   - A wooden stick (vertical, ~34 px wide × 300 px tall on a 720-px-wide design; scale to the screen), with a horizontal wood gradient #A8743A → #F5D79B → #E4B56C → #9A6631, 2 faint grain lines, and a dark scorched band just below the head.
   - A red match head (ellipse, radial gradient #FF8A6A → #C8281C → #4A0804).
   - A flame on the head: 3 stacked teardrop shapes (outer orange #FF9A1A→transparent, middle yellow #FFE27A, inner near-white #FFFDF0), a small blue base glow, and a large soft orange halo behind it.
   - Flame flicker (Reanimated, UI thread): a scaleY 0.92↔1.08 loop (~140 ms), a slight skewX/translateX sway (~380 ms), and halo opacity breathing (~1.7 s). Use two loops with different speeds so it looks irregular, not mechanical.
   - The whole match floats gently (translateY ±6 px, 4 s loop) with a soft shadow under it.
2. **Title:** "MATCH STICKS" (two words, same as the splash), on one line, my rounded bold font, orange gradient #FFD23F → #FFA51A → #FF7A00 (use expo-linear-gradient + MaskedView), with an orange glow. Every 5 s a light shine sweeps across it (0.6 s). Under it: "IGNITE YOUR MIND" in small letters, letter-spacing 9, colour #E9CFA6.
3. **Buttons (same 3 as now):**
   - CONTINUE (LEVEL N): primary orange gradient pill, a light highlight strip on the top half, an orange glow that pulses softly, and a very slight scale "breathing" (1.0 ↔ 1.02, 3 s).
   - LEVELS and SETTINGS: dark translucent brown pills (rgba(58,34,20,.9) → rgba(30,18,12,.9)), 2 px #6A3E1E border, cream text #F3E2C6.
   - Press: scale 0.96 + tap.mp3 + light haptic (expo-haptics, if vibration is on).
4. **Footer:** "Latest Level: 12 • ★ 33 / 60" stays, colour rgba(233,207,166,.75).
5. **Entrance animation** (each time Home opens after the splash): the match fades in and drops 40 px into place (0.8 s) → the flame ignites with a pop (0.5 s) → the title pops in → the buttons slide up one by one (120 ms stagger) → the footer fades in. Total about 2.2 s. Buttons are tappable immediately; don't block input during the animation.
6. Remove the floating grey gear button in the bottom-right corner (the SETTINGS button already does this). If that gear is the Expo dev-menu button, ignore it; it doesn't exist in release builds.
7. Must fit every phone: use percentage/flex sizing, no fixed pixel positions. The title must never overflow the width (scale the font down with useWindowDimensions if needed).
