import {
  evaluate,
  sticks,
  applyMove,
  applyRemove,
  applyAdd,
} from './model.js';

export function solveMove1(state) {
  const { filled, empty } = sticks(state);
  const results = [];
  for (const f of filled) {
    for (const e of empty) {
      if (f[0] === e[0] && f[1] === e[1]) continue;
      const nextState = applyMove(state, f, e);
      const ev = evaluate(nextState);
      if (ev.valid && ev.correct) {
        results.push({
          type: 'move-1',
          from: f,
          to: e,
          resultStr: ev.str,
        });
      }
    }
  }
  return results;
}

export function solveRemove1(state) {
  const { filled } = sticks(state);
  const results = [];
  for (const f of filled) {
    const nextState = applyRemove(state, f);
    const ev = evaluate(nextState);
    if (ev.valid && ev.correct) {
      results.push({
        type: 'remove-1',
        at: f,
        resultStr: ev.str,
      });
    }
  }
  return results;
}

export function solveAdd1(state) {
  const { empty } = sticks(state);
  const results = [];
  for (const e of empty) {
    const nextState = applyAdd(state, e);
    const ev = evaluate(nextState);
    if (ev.valid && ev.correct) {
      results.push({
        type: 'add-1',
        at: e,
        resultStr: ev.str,
      });
    }
  }
  return results;
}

export function solveMove2(state) {
  const { filled, empty } = sticks(state);
  const results = [];
  // Move 1st stick
  for (let i = 0; i < filled.length; i++) {
    const f1 = filled[i];
    for (let j = 0; j < empty.length; j++) {
      const e1 = empty[j];
      const s1 = applyMove(state, f1, e1);

      // Remaining filled and empty for 2nd stick
      const st2 = sticks(s1);
      for (const f2 of st2.filled) {
        if (f2[0] === e1[0] && f2[1] === e1[1]) continue; // don't just move it right back
        for (const e2 of st2.empty) {
          if (e2[0] === f1[0] && e2[1] === f1[1]) continue; // redundant loop
          const s2 = applyMove(s1, f2, e2);
          const ev = evaluate(s2);
          if (ev.valid && ev.correct) {
            results.push({
              type: 'move-2',
              moves: [
                { from: f1, to: e1 },
                { from: f2, to: e2 },
              ],
              resultStr: ev.str,
            });
            if (results.length >= 5) return results; // cap early
          }
        }
      }
    }
  }
  return results;
}

export function solve(state, mode = 'move-1') {
  switch (mode) {
    case 'move-1':
      return solveMove1(state);
    case 'move-2':
      return solveMove2(state);
    case 'remove-1':
      return solveRemove1(state);
    case 'add-1':
      return solveAdd1(state);
    default:
      return solveMove1(state);
  }
}
