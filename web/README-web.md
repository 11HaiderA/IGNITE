# Match Sticks

Puzzle game: move exactly one matchstick so the equation becomes true.

## Run
Pure HTML/CSS/JS — no build step.
- Open the `match-sticks` folder in Google Antigravity (open folder / workspace).
- Open `index.html` in the browser, or run a local server from the folder:
  `npx serve .`  or  `python -m http.server 8000`

## Files
- `index.html` – layout
- `style.css` – UI/theme
- `game.js` – seven-segment model, puzzle generator, solver, game loop

## Gameplay
- Tap a stick to pick it up, tap an empty (dashed) slot to place it.
- Wrong move → board shakes and resets.
- Hint shows the move (max 1 star). Skip costs 50 points.
- Infinite procedurally generated levels; difficulty grows (1-digit → 2-digit numbers).
- Progress (level, score, best) saved in localStorage.
- Keys: Esc cancel, R reset, H hint, N skip/next.
