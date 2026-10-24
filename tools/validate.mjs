// Validation script for Matchsticks levels
// Tests every level in levels/levels.json:
// 1. Must form valid syntax
// 2. Must NOT be already solved
// 3. Must have at least 1 solution according to the specified mode

import { readFileSync } from 'fs';
import { build, evaluate } from '../js/game/model.js';
import { solve } from '../js/game/solver.js';

let levels;
try {
  const content = readFileSync('./levels/levels.json', 'utf-8');
  levels = JSON.parse(content);
} catch (err) {
  console.error('Error reading levels/levels.json:', err.message);
  process.exit(1);
}

if (!Array.isArray(levels) || levels.length < 100) {
  console.error(`Expected at least 100 levels, found ${levels ? levels.length : 0}`);
  process.exit(1);
}

let passed = 0;
let errors = 0;

console.log(`\nValidating ${levels.length} levels in levels/levels.json...\n`);

for (let i = 0; i < levels.length; i++) {
  const lvl = levels[i];
  const st = build(lvl.equation);
  const ev = evaluate(st);

  if (!ev.valid) {
    console.error(`❌ Level ${lvl.id} [${lvl.equation}]: Invalid symbols or syntax!`);
    errors++;
    continue;
  }

  if (ev.correct) {
    console.error(`❌ Level ${lvl.id} [${lvl.equation}]: Equation is already correct!`);
    errors++;
    continue;
  }

  const sols = solve(st, lvl.mode || 'move-1');
  if (!sols || sols.length === 0) {
    console.error(`❌ Level ${lvl.id} [${lvl.equation} (${lvl.mode})]: NO VALID SOLUTION FOUND!`);
    errors++;
    continue;
  }

  passed++;
}

console.log(`\n--------------------------------------------`);
console.log(`Results: ${passed}/${levels.length} levels PASSED validation.`);
if (errors > 0) {
  console.error(`Failed with ${errors} error(s)!`);
  process.exit(1);
} else {
  console.log(`✅ ALL ${levels.length} LEVELS VALIDATED SUCCESSFULLY!`);
  process.exit(0);
}
