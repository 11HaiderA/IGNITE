import { writeFileSync } from 'fs';
import { build, evaluate, sticks, applyMove } from '../js/game/model.js';
import { solve } from '../js/game/solver.js';

// Curated first 10 iconic levels
const curatedLevels = [
  { id: 1, equation: '6+4=4', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 2, equation: '5+7=2', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 3, equation: '9+3=6', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 4, equation: '8-3=9', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 5, equation: '0+3=9', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 6, equation: '5-9=4', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 7, equation: '5+5=8', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 8, equation: '9-5=6', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 9, equation: '6+9=9', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
  { id: 10, equation: '5+0=3', mode: 'move-1', movesAllowed: 1, difficulty: 1 },
];

// Generate pool of valid, tricky, mental-math-friendly equations
// Numbers: A <= 15, B <= 12, C <= 18
const pool = [];
const seen = new Set(curatedLevels.map(l => l.equation));

for (let a = 0; a <= 15; a++) {
  for (let b = 0; b <= 12; b++) {
    for (const op of ['+', '-']) {
      const c = op === '+' ? a + b : a - b;
      if (c < 0 || c > 18) continue;
      const trueStr = `${a}${op}${b}=${c}`;
      const trueSt = build(trueStr);
      const trueEv = evaluate(trueSt);
      if (!trueEv.valid || !trueEv.correct) continue;

      const { filled, empty } = sticks(trueSt);
      for (const f of filled) {
        for (const e of empty) {
          if (f[0] === e[0] && f[1] === e[1]) continue;
          const cand = applyMove(trueSt, f, e);
          const ev = evaluate(cand);
          if (!ev.valid || ev.correct) continue;

          // Reject equations with multi-digit large numbers
          const parts = ev.str.match(/^(\d+)([+-])(\d+)=(\d+)$/);
          if (!parts) continue;
          const pA = +parts[1];
          const pB = +parts[3];
          const pC = +parts[4];

          // Strictly small numbers: mental arithmetic easy, matchsticks tricky
          if (pA > 15 || pB > 12 || pC > 18) continue;
          // Avoid trivial 0=0
          if (pA === 0 && pB === 0 && pC === 0) continue;

          const eqStr = ev.str;
          if (seen.has(eqStr)) continue;

          const sols = solve(cand, 'move-1');
          if (sols && sols.length >= 1 && sols.length <= 4) {
            seen.add(eqStr);
            pool.push({
              equation: eqStr,
              mode: 'move-1',
              movesAllowed: 1,
              solutionsCount: sols.length,
              // Sort key: single-digit arithmetic first, then small teens
              isSingleDigit: pA <= 9 && pB <= 9 && pC <= 9,
              maxNum: Math.max(pA, pB, pC),
            });
          }
        }
      }
    }
  }
}

console.log(`Generated pool of ${pool.length} valid tricky equations.`);

// For level 17 specifically: user specifically mentioned level 17 and wanted a tricky single digit puzzle
// like 7+9=... or similar
const level17Candidates = pool.filter(p => p.equation.includes('7') && (p.equation.includes('9') || p.equation.includes('8') || p.equation.includes('5')));
const level17Choice = level17Candidates[0] || { equation: '7+4=9', mode: 'move-1', movesAllowed: 1 };

// Filter pool to ensure wide variety of numbers across levels
// Shuffle pool with deterministic seed so it doesn't repeat 1+2, 2+1, 2-1
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  while (currentIndex !== 0) {
    randomIndex = Math.floor(pseudoRandom() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const variedPool = shuffle([...pool]);

// Build 100 levels
const allLevels = [...curatedLevels];

// Fill up to 100 levels
for (let i = 0; i < variedPool.length && allLevels.length < 100; i++) {
  const item = variedPool[i];
  const lvlId = allLevels.length + 1;
  const diff = lvlId <= 30 ? 1 : lvlId <= 70 ? 2 : 3;

  if (lvlId === 17) {
    // Specifically set Level 17 to the tricky puzzle with 7 and 9 / 8
    allLevels.push({
      id: 17,
      equation: level17Choice.equation,
      mode: 'move-1',
      movesAllowed: 1,
      difficulty: 2,
    });
  } else {
    allLevels.push({
      id: lvlId,
      equation: item.equation,
      mode: 'move-1',
      movesAllowed: 1,
      difficulty: diff,
    });
  }
}

// Ensure level 17 has a tricky single digit puzzle
console.log('Level 17 is currently:', allLevels[16].equation);

writeFileSync('./levels/levels.json', JSON.stringify(allLevels, null, 2), 'utf-8');
console.log(`Successfully wrote ${allLevels.length} levels to ./levels/levels.json`);
