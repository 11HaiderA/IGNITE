# Build: "MATCHSTICKS — Ignite Your Mind" (premium mobile-first puzzle game)

Attached are concept screens (01–08). Match their look and layout closely. They are the visual target, not pixel-exact specs.

## 0. Tech & project rules
- Plain HTML5 + CSS + vanilla JavaScript (ES modules). No framework, no build step. Must run with `npx serve .`.
- Mobile-first, portrait 9:16, also works in landscape and on desktop. Full screen: use `100dvh` and safe-area insets, hide the browser UI where possible (Fullscreen API on first tap, PWA `display: fullscreen`).
- Add a PWA manifest + service worker so it installs to the home screen and works offline.
- Structure:
  ```
  /index.html
  /css/      base.css, screens.css, popups.css
  /js/       main.js (screen router), game/ (model.js, generator.js, solver.js, render.js, input.js),
             ui/ (splash.js, home.js, settings.js, pause.js, hint.js, win.js, levels.js),
             audio.js, storage.js, ads.js
  /assets/   fonts/, audio/, img/
  /levels/levels.json
  ```
- Never use `alert()`, `confirm()` or browser default dialogs. Every popup is a custom animated modal (see §8).
- 60 fps target. Animate only `transform` and `opacity`. Respect `prefers-reduced-motion`.

## 1. Visual identity (fire theme: black + red)
- Palette (CSS variables):
  - `--bg-0 #000000`, `--bg-1 #070404`, `--bg-2 #1c0606`, `--bg-glow #5a0b0b`
  - `--red #e11d2a`, `--red-hot #ff3b30`, `--red-deep #b3121c`, `--red-shadow #5e0a0f`
  - `--ember #ff7a1a`, `--flame #ffd36a`, `--text #ffffff`, `--text-dim #c9a9a4`, `--line #4a1d1d`
- Background: a radial gradient from deep red at the bottom to black, a subtle film-grain overlay, and slowly rising ember particles (canvas, max 40 particles, low opacity).
- Fonts (Google Fonts, self-host the files in /assets/fonts for offline use):
  - Titles / logo / popup headings: **Rubik Burned** (letters look scorched, which fits the concept). Logo: "MATCH" white, "STICKS" red with an orange glow (`text-shadow`).
  - Buttons / HUD / body: **Oswald** 500/700, uppercase, letter-spacing 2–3px.
- Buttons:
  - Primary: red vertical gradient (`#ff4436` → `#b3121c`), 2px border `#ff8a70`, 16px radius, 6px solid bottom shadow `#5e0a0f`, outer glow.
  - Secondary: dark gradient (`#2a1414` → `#140909`), border `#5a2323`.
  - Press state: move down 4px and shrink the bottom shadow, plus a short haptic (`navigator.vibrate(10)` if vibration is on) and a click sound.
- Icon buttons: 52px rounded squares, `rgba(20,8,8,.85)` background, 2px `--line` border. Use SVG icons (Lucide or custom), not emoji.

## 2. Screen flow
`Splash → Home → (Play → Level Select or continue) → Gameplay → Win/Fail → next`.
Home also leads to: How to Play, Settings. Each screen is a `<section>` and the router switches between them with a 300ms fade + scale transition.

## 3. Splash screen (concept 01)
- Black screen. A single large realistic matchstick (SVG) sits diagonally in the centre.
- Animation, 2.5s total:
  1. 0.0s: an unlit match fades in.
  2. 0.4s: strike. A spark burst and a "strike" sound, then the head ignites.
  3. A flame (animated SVG/canvas: 2–3 layered teardrop shapes, flicker via noise) with a warm radial light glow that pulses.
  4. The logo "MATCH / STICKS" burns in letter by letter, revealed by an ember edge (mask animation).
  5. The tagline "IGNITE YOUR MIND" fades in.
  6. A thin progress bar (red → orange → yellow gradient with a glow) fills while assets preload.
- Moves to Home when loading is done (minimum 2.5s). A tap skips it after 1s.
- The first tap anywhere unlocks audio (browser autoplay rule).

## 4. Home screen (concept 02)
- Two crossed matches behind the logo, one of them burning with a live flame. Ember particles rise from the bottom.
- Logo at the top third. It breathes slowly (scale 1 → 1.02) and the glow flickers.
- Centre: big **PLAY** (primary) and **HOW TO PLAY** (secondary) buttons, staggered slide-up entrance.
- Top-right: settings gear icon. Top-left: streak/fire counter chip.
- Bottom: small text "LEVEL 24 · 61 ★" (current progress).
- PLAY continues at the highest unlocked level. Long-press, or a small "levels" link, opens Level Select.

## 5. How to Play (concept 03)
A modal with 3 swipeable pages (dots indicator, NEXT/GOT IT button):
1. "Move ONE matchstick to make the equation true." An animated demo: 7 − 2 = 8 → a stick slides from the 8 onto the minus → 7 + 2 = 9, and the sticks burn.
2. "Drag a stick and drop it on a glowing slot. Tap a stick, then tap a slot, also works."
3. "Stuck? Use a hint. Fewer moves and faster time = more stars."
It shows automatically the first time the player opens level 1.

## 6. Settings (concept 04)
A modal containing:
- **Music**: toggle + volume slider (0–100).
- **Sound FX**: toggle + volume slider.
- **Vibration**: toggle.
- Language placeholder (EN only for now), Privacy, Terms, version number.
- Custom toggles: pill shape, red→orange gradient when ON, grey when OFF, knob slides with a spring.
- Saved in localStorage (wrap every read/write in try/catch). Changes apply instantly.

## 7. Gameplay (concept 05) — the core
### 7.1 Layout
- Full screen, no page scroll.
- HUD top: Pause (left), "LEVEL N" chip (centre), Hint button with an "AD" badge (right).
- Under the HUD: the objective text "MOVE 1 STICK" (or "MOVE 2 / REMOVE 1 / ADD 1" depending on the level).
- The equation board takes **at least 50% of the screen height**, centred. Scale it so the equation fills ~92% of the screen width. In landscape it can grow larger.
- Bottom: Reset and Undo icon buttons, plus a small "MOVES 0/1 · ★★★" line.

### 7.2 Matchstick rendering (must look real)
- Draw every match as SVG (or canvas) at high DPI. **All sticks have the same length.** Digits are 1 stick wide and 2 sticks tall (seven-segment).
- Wooden body: rounded rectangle with a vertical gradient (`#f7d89a` → `#e2b46a` → `#a8743a`) and 2–3 faint wood-grain lines.
- Head: a slightly oversized ellipse (≈1.5× the stick thickness) with a red radial gradient (`#ff8a7a` → `#e3241f` → `#7a0808`) and a small white specular highlight.
- Soft drop shadow under each stick (offset 3px/6px, blur 4px).
- Vary the head direction slightly per stick and add ±1.5° random rotation so it looks hand-placed.
- Empty slots appear only while a stick is picked up: dashed orange outline with a faint fill and a pulse.

### 7.3 Interaction
- Drag & drop (pointer events, works with touch and mouse): the picked stick lifts (scale 1.08, bigger shadow, golden outline) and follows the finger.
- On drop it snaps to the nearest valid empty slot within ~40px, with a 150ms ease-out. Otherwise it springs back.
- Alternative: tap a stick, then tap a slot.
- Sounds: wooden "tick" on pick-up, "tock" on drop.
- Undo restores the previous state. Reset restores the level's start.
- A wrong final equation gives a short shake of the board, a dull "thunk" sound, a red flash on the "=" sign, and the move is returned.

### 7.4 Solve moment (very important)
When the equation becomes true:
1. Lock input.
2. A flame ignites at the head of the first stick (striking sound), then **fire spreads stick to stick** along the equation (~80ms per stick). Each stick gets a small travelling flame.
3. A matchstick **burning/crackle sound** plays (looped crackle for the duration, fade out).
4. Each stick, as it burns, **turns black**: animate the wood gradient to charcoal (`#3a2a24` → `#050303`), turn the head to grey ash, and add glowing orange ember specks that fade over 1.5s.
5. Thin smoke wisps rise from the burned equation (animated SVG paths, low opacity).
6. A warm screen glow pulses and a light camera "breath" (scale 1.02) plays.
7. After ~1.6s the Win popup appears (concept 08) with the burned equation still visible behind it.

### 7.5 Game logic (reuse the existing logic from my current Match Sticks code)
- Seven-segment model, operators + and − (− is 1 stick, + is 2 sticks), and "=".
- Modes: move 1, move 2, remove 1, add 1 (one mode per level, shown in the objective text).
- A solver checks that every level has at least one solution and is used for hints.
- Validation rules: no leading zeros, the operator must be valid, the result must be mathematically correct.
- Levels: 100 handcrafted puzzles in `levels.json`, ordered by difficulty, then endless procedurally generated ones (generator + solver validation).
- Stars: 3★ = solved with no hint and no wrong attempts; 2★ = one wrong attempt or more than 60s; 1★ = solved using a hint.

## 8. Popups — premium quality rules (applies to all)
- Backdrop: `rgba(5,0,0,.72)` + `backdrop-filter: blur(4px)`. Fade in over 200ms.
- Card: 24px radius, dark red gradient (`#2b1010` → `#120707`), 2px `#7a2020` border, outer red glow, a 1px top inner highlight.
- Entrance: scale 0.8 → 1.0 with a spring overshoot (`cubic-bezier(.2,1.6,.4,1)`, 350ms). Children stagger in 40ms apart. Exit: scale 0.95 + fade, 180ms.
- Heading in Rubik Burned with a red glow. An optional ember particle burst behind the card on Win.
- Close (✕) top-right where relevant. Android back button and Esc close the top popup. Background is not interactive while a popup is open.
- Focus is trapped inside the popup, and buttons have aria-labels.

### 8.1 Pause (concept 06)
Opened from the HUD pause button. It pauses the timer and lowers the music volume.
Buttons in order: **RESUME** (primary), **RESTART**, **LEVELS**, **MAIN MENU** (secondary).
Restart and Main Menu ask for confirmation inside the same card (the card flips to "Lose progress on this level?" with Yes/No), never a browser dialog.

### 8.2 Hint (concept 07) — rewarded ad only
- The hint button shows a bulb + "AD" badge.
- Tap → popup "NEED A HINT? Watch a short video to reveal which stick to move." → **WATCH AD** (primary) / **NO THANKS**.
- After the ad completes successfully: close the popup, the stick to move glows and pulses, and a ghost arrow animates to its target slot for 3s. On a 2-move level, reveal one move per ad.
- If the ad fails or isn't available: an in-card message "No video available right now, try again in a moment." Never give the hint without the reward callback.
- Hint usage caps that level at 1★.

### 8.3 Win (concept 08)
"LEVEL N" ribbon, heading **BRILLIANT!** (vary it: GENIUS!, ON FIRE!, NICE!), 3 stars that pop in one by one with a sound each, "SOLVED IN 0:14", then **NEXT LEVEL** (primary) and icon buttons Restart / Levels / Home.

### 8.4 Level Select
A grid of 4 columns. Each tile shows the level number, its stars, and a locked state with a padlock. Scroll through 100+ levels smoothly with paging by 20. Burned-wood tile style; the current level glows.

## 9. Audio (`audio.js`, Web Audio API)
- Background music: a calm, warm, looping ambient track (royalty-free, e.g. from Pixabay Music, with the license noted in README). It fades in and out between screens.
- SFX (royalty-free files in /assets/audio, mp3 + ogg): match strike, ignite whoosh, burning crackle loop, wood tick/tock (pick/drop), wrong thunk, star pop ×3, UI click, popup open/close.
- Music and SFX run on separate gain nodes controlled by Settings. Audio unlocks on the first user gesture. Pause all audio when the tab is hidden (`visibilitychange`).

## 10. Ads (`ads.js`)
- Create an `AdService` interface: `isRewardedReady()`, `showRewarded(): Promise<'rewarded'|'dismissed'|'failed'>`.
- Web build: use a **mock adapter** for now (a fullscreen 5-second fake "Ad" overlay with a countdown and a close button that only appears after it finishes). Clearly mark it as a mock.
- Leave adapter stubs for **Google AdMob rewarded ads via Capacitor** (`@capacitor-community/admob`) for the Android/iOS build, and for Google H5 Games Ads (Ad Placement API) for the web.
- No interstitial ads in v1 (they hurt retention). Rewarded only.

## 11. Storage (`storage.js`)
localStorage keys: `ms_progress` (unlocked level, stars per level), `ms_settings`, `ms_stats` (streak, total solved). All reads and writes go through try/catch with defaults.

## 12. Polish checklist (must pass)
- No layout shift, no text overflow at 360px width, works from 320px up to desktop.
- Every button has hover, active and disabled states.
- All transitions ≤ 400ms except the splash and the burn sequence.
- Unlit sticks and burned sticks are clearly distinguishable even for colour-blind users (burned = dark + ember texture, not just a colour change).
- No console errors. Lighthouse PWA + performance ≥ 90 on mobile.

## 13. Deliverables
Working project with the structure above, a README (run instructions, how to add levels, how to plug in real AdMob), and `levels.json` with 100 validated levels (run the solver over all of them in a `npm run validate` / `node tools/validate.js` script and fail if any level is unsolvable or already solved).
