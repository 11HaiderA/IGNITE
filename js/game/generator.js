import {
  build,
  evaluate,
  sticks,
  applyMove,
  applyRemove,
  applyAdd,
} from './model.js';
import { solve } from './solver.js';

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function generatePuzzle(difficulty = 1, mode = 'move-1') {
  const maxA = difficulty < 5 ? 9 : difficulty < 25 ? 40 : 99;
  const maxB = difficulty < 15 ? 9 : 80;

  for (let tries = 0; tries < 600; tries++) {
    const a = rnd(0, maxA);
    const b = rnd(0, maxB);
    const plus = Math.random() < 0.55;
    const c = plus ? a + b : a - b;
    if (c < 0 || c > 99) continue;

    const truthStr = `${a}${plus ? '+' : '-'}${b}=${c}`;
    const truthState = build(truthStr);
    const truthEv = evaluate(truthState);
    if (!truthEv.valid || !truthEv.correct) continue;

    if (mode === 'move-1') {
      const { filled, empty } = sticks(truthState);
      const candidates = [];
      for (const f of filled) {
        for (const e of empty) {
          const s = applyMove(truthState, f, e);
          const ev = evaluate(s);
          if (!ev.valid || ev.correct) continue; // must be a valid display of symbols, but false math

          // Check that it's solvable
          const sols = solve(s, 'move-1');
          if (sols.length >= 1) {
            candidates.push({
              equation: ev.str,
              state: s,
              mode: 'move-1',
              movesAllowed: 1,
              solutions: sols,
            });
          }
        }
      }
      if (candidates.length) {
        return candidates[rnd(0, candidates.length - 1)];
      }
    } else if (mode === 'remove-1') {
      // Create by adding a stick to a true equation so removing it fixes it
      const { empty } = sticks(truthState);
      const candidates = [];
      for (const e of empty) {
        const s = applyAdd(truthState, e);
        const ev = evaluate(s);
        if (!ev.valid || ev.correct) continue;
        const sols = solve(s, 'remove-1');
        if (sols.length >= 1) {
          candidates.push({
            equation: ev.str,
            state: s,
            mode: 'remove-1',
            movesAllowed: 1,
            solutions: sols,
          });
        }
      }
      if (candidates.length) {
        return candidates[rnd(0, candidates.length - 1)];
      }
    } else if (mode === 'add-1') {
      // Create by removing a stick from a true equation so adding it fixes it
      const { filled } = sticks(truthState);
      const candidates = [];
      for (const f of filled) {
        const s = applyRemove(truthState, f);
        const ev = evaluate(s);
        if (!ev.valid || ev.correct) continue;
        const sols = solve(s, 'add-1');
        if (sols.length >= 1) {
          candidates.push({
            equation: ev.str,
            state: s,
            mode: 'add-1',
            movesAllowed: 1,
            solutions: sols,
          });
        }
      }
      if (candidates.length) {
        return candidates[rnd(0, candidates.length - 1)];
      }
    }
  }

  // Fallbacks if random fails
  if (mode === 'remove-1') {
    return {
      equation: '8-4=4', // remove middle stick of 8 -> 0-4=4 not true, or similar
      state: build('8-4=4'),
      mode: 'remove-1',
      movesAllowed: 1,
    };
  }
  return {
    equation: '6+4=4',
    state: build('6+4=4'),
    mode: 'move-1',
    movesAllowed: 1,
  };
}
