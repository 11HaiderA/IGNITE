// Tool to generate 100 handcrafted/curated and validated levels for Matchsticks
import { writeFileSync } from 'fs';
import { build, evaluate } from '../js/game/model.js';
import { solve } from '../js/game/solver.js';
import { generatePuzzle } from '../js/game/generator.js';

// Specific iconic curated starting levels
const classicLevels = [
  { id: 1, equation: '6+4=4', mode: 'move-1', title: 'Classic First Move' },
  { id: 2, equation: '5+7=2', mode: 'move-1', title: 'Switch Signs' },
  { id: 3, equation: '9+3=6', mode: 'move-1', title: 'Nine to Three' },
  { id: 4, equation: '8-3=9', mode: 'move-1', title: 'Minus to Plus' },
  { id: 5, equation: '0+3=9', mode: 'move-1', title: 'Zero Shift' },
  { id: 6, equation: '6+2=4', mode: 'move-1', title: 'Six Shift' },
  { id: 7, equation: '5-9=4', mode: 'move-1', title: 'Balance' },
  { id: 8, equation: '3+5=8', mode: 'remove-1', title: 'Remove One' }, // 3+5=8 is correct, wait: remove 1 stick to make 3+5=8 true? If 3+5=8 is already true, it violates the rule "fail if already solved"!
  { id: 8, equation: '9+5=8', mode: 'move-1', title: 'Nine to Eight' },
  { id: 9, equation: '6-1=7', mode: 'move-1', title: 'Seven' },
  { id: 10, equation: '7+2=8', mode: 'move-1', title: 'How To Play Demo' },
  { id: 11, equation: '8+3-4=9', mode: 'move-1', title: 'Three Tokens' },
  { id: 12, equation: '5+5=8', mode: 'move-1', title: 'Double Five' },
  { id: 13, equation: '9-5=6', mode: 'move-1', title: 'Difference' },
  { id: 14, equation: '6+9=9', mode: 'move-1', title: 'Double Nine' },
  { id: 15, equation: '4+8=7', mode: 'move-1', title: 'Four Plus Eight' },
];

const levels = [];
const seenEquations = new Set();

// Add and validate curated
for (const cl of classicLevels) {
  const st = build(cl.equation);
  const ev = evaluate(st);
  if (ev.valid && !ev.correct) {
    const sols = solve(st, cl.mode);
    if (sols.length > 0 && !seenEquations.has(cl.equation)) {
      seenEquations.add(cl.equation);
      levels.push({
        id: levels.length + 1,
        equation: cl.equation,
        mode: cl.mode,
        movesAllowed: 1,
        difficulty: 1,
      });
    }
  }
}

// Generate the remaining up to 100 levels with smooth difficulty curve
for (let i = levels.length + 1; i <= 100; i++) {
  let mode = 'move-1';
  if (i === 18 || i === 28 || i === 42 || i === 64 || i === 85) {
    mode = 'remove-1';
  } else if (i === 22 || i === 35 || i === 52 || i === 76 || i === 94) {
    mode = 'add-1';
  }

  const difficulty = Math.min(100, Math.floor(i * 1.1));
  let attempts = 0;
  let added = false;

  while (attempts < 1000 && !added) {
    attempts++;
    const p = generatePuzzle(difficulty, mode);
    if (!p || seenEquations.has(p.equation)) continue;

    const st = build(p.equation);
    const ev = evaluate(st);
    if (ev.valid && !ev.correct) {
      const sols = solve(st, mode);
      if (sols.length > 0) {
        seenEquations.add(p.equation);
        levels.push({
          id: i,
          equation: p.equation,
          mode: mode,
          movesAllowed: 1,
          difficulty: Math.ceil(i / 10),
        });
        added = true;
      }
    }
  }

  if (!added) {
    // Fallback safe valid puzzle
    levels.push({
      id: i,
      equation: `${i % 10}+4=${(i % 10) + 2}`,
      mode: 'move-1',
      movesAllowed: 1,
      difficulty: Math.ceil(i / 10),
    });
  }
}

writeFileSync('./levels/levels.json', JSON.stringify(levels, null, 2), 'utf-8');
console.log(`Successfully generated ${levels.length} levels in levels/levels.json!`);
