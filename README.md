# MATCHSTICKS — Ignite Your Mind 🔥

A premium, mobile-first arithmetic matchstick puzzle game built with pure HTML5, CSS3, and vanilla JavaScript (ES modules). Zero dependencies, zero build step.

Inspired by tactile physics and fire aesthetics: realistic wooden matchsticks, burning sulfur heads, procedural embers, and authentic audio synthesis.

---

## 🚀 How to Run

### Option 1: Using `serve`
```bash
npx serve .
```
or
```bash
npm run serve
```
Open the browser at `http://localhost:3000` (or the port indicated).

### Option 2: Python local server
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

---

## 🧪 Validating Levels

All 100 handcrafted levels are verified for solvability and correctness by running the automated solver:
```bash
npm run validate
```
*(Runs `node tools/validate.js` which verifies that all 100 levels form valid equations, are not already true, and have at least 1 verified mathematical solution).*

---

## 🎮 Screens & Concepts Implemented

1. **Splash Screen**: Diagonal realistic striking matchstick with animated layered flames, spark burst audio, and brand burn-in.
2. **Home Screen**: Crossed burning matches, streak chip (`🔥 12`), settings gear, `▶ PLAY`, `? HOW TO PLAY`, and level progress indicator.
3. **How to Play**: 3-page interactive carousel with animated matchstick equation demo (`7 - 2 = 8` → `7 + 2 = 9`).
4. **Settings**: Real-time sliders for Music and Sound FX volumes, vibration toggle, restore purchases, and privacy terms.
5. **Gameplay**: Full-screen board (>50% height), `MOVE 1 STICK` prompt, pause button, and rewarded ad hint button.
6. **Solve Sequence**: Fire spreads stick to stick (~80ms per stick), procedural burning crackle audio, charred black transformation, and fading glowing embers.
7. **Pause Modal**: In-card confirmation flip for Restart and Main Menu.
8. **Hint Modal**: Rewarded video ad simulation with countdown and move trajectory indicator.
9. **Win Modal**: Staggered popping star ratings, time elapsed, and next level action.
10. **Level Select**: 4-column grid with smooth pagination by 20, star ratings, and locked padlocks.

---

## 🧩 How to Add New Levels

Levels are stored in [`levels/levels.json`](file:///c:/Users/Sammad%20Raja%20Dhanyal/OneDrive/Desktop/Match%20Sticks/match-sticks/levels/levels.json).
Each level entry follows this schema:
```json
{
  "id": 101,
  "equation": "6+4=4",
  "mode": "move-1",
  "movesAllowed": 1,
  "difficulty": 10
}
```

Supported modes:
- `"move-1"`: Move exactly 1 matchstick.
- `"move-2"`: Move 2 matchsticks.
- `"remove-1"`: Remove 1 matchstick.
- `"add-1"`: Add 1 matchstick.

After adding or modifying levels, always run:
```bash
npm run validate
```

---

## 📺 How to Plug in Real AdMob Ads

The ad architecture is decoupled in [`js/ads.js`](file:///c:/Users/Sammad%20Raja%20Dhanyal/OneDrive/Desktop/Match%20Sticks/match-sticks/js/ads.js) via the `AdService` class:

### 1. For Capacitor (Android / iOS):
1. Install the Capacitor AdMob community plugin:
   ```bash
   npm install @capacitor-community/admob
   npx cap sync
   ```
2. In [`js/ads.js`](file:///c:/Users/Sammad%20Raja%20Dhanyal/OneDrive/Desktop/Match%20Sticks/match-sticks/js/ads.js), replace `MockAdAdapter` with `CapacitorAdMobAdapter`:
   ```javascript
   import { AdMob, RewardAdOptions } from '@capacitor-community/admob';

   class CapacitorAdMobAdapter {
     async showRewarded() {
       try {
         await AdMob.prepareRewardVideoAd({ adId: 'YOUR_ADMOB_REWARDED_UNIT_ID' });
         const reward = await AdMob.showRewardVideoAd();
         return reward ? 'rewarded' : 'dismissed';
       } catch (err) {
         return 'failed';
       }
     }
   }
   ```

### 2. For Web (Google H5 Games Ads / Ad Placement API):
In [`js/ads.js`](file:///c:/Users/Sammad%20Raja%20Dhanyal/OneDrive/Desktop/Match%20Sticks/match-sticks/js/ads.js), call `adBreak({ type: 'reward', ... })`:
```javascript
adBreak({
  type: 'reward',
  name: 'hint_reward',
  beforeReward: (showAdFn) => { showAdFn(); },
  adDismissed: () => resolve('dismissed'),
  adViewed: () => resolve('rewarded')
});
```

---

## 🎵 Sound Design

All sounds are synthesized procedurally in real-time using the **Web Audio API** in [`js/audio.js`](file:///c:/Users/Sammad%20Raja%20Dhanyal/OneDrive/Desktop/Match%20Sticks/match-sticks/js/audio.js). No external audio files are required, ensuring zero network latency and 100% offline reliability.
