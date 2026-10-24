// 7-segment coordinates for digits (x1, y1 is match head end)
// Enhanced geometry: longer matchsticks (L_h=60, L_v=74), thickness 11.5, and non-overlapping corner clearances
export const SEG = {
  a: [18, 14, 78, 14],
  b: [84, 22, 84, 96],
  c: [84, 186, 84, 112],
  d: [18, 194, 78, 194],
  e: [12, 186, 12, 112],
  f: [12, 22, 12, 96],
  g: [18, 104, 78, 104],
};

export const OPSEG = {
  h: [18, 104, 78, 104],
  v: [48, 67, 48, 141],
};

export const EQSEG = [
  [18, 90, 78, 90],
  [18, 118, 78, 118],
];

export const DIG = [
  'abcdef',   // 0
  'bc',       // 1
  'abdeg',    // 2
  'abcdg',    // 3
  'bcfg',     // 4
  'acdfg',    // 5
  'acdefg',   // 6
  'abc',      // 7
  'abcdefg',  // 8
  'abcdfg',   // 9
];

export const keyOf = (s) => [...s].sort().join('');
export const LOOK = {};
DIG.forEach((s, i) => {
  LOOK[keyOf(s)] = i;
});

export const TOKEN_W = 96;
export const GAP = 14;

export const slotsOf = (t) =>
  t.t === 'd' ? Object.keys(SEG) : t.t === 'o' ? ['h', 'v'] : [];

export const has = (t, k) => (t.t === 'd' ? t.s.has(k) : !!t[k]);

export const put = (t, k, on) => {
  if (t.t === 'd') {
    on ? t.s.add(k) : t.s.delete(k);
  } else {
    t[k] = on;
  }
};

export const clone = (st) =>
  st.map((t) => (t.t === 'd' ? { t: 'd', s: new Set(t.s) } : { ...t }));

export function build(str) {
  return [...str].map((ch) => {
    if (/\d/.test(ch)) return { t: 'd', s: new Set(DIG[+ch]) };
    if (ch === '+') return { t: 'o', h: true, v: true };
    if (ch === '-') return { t: 'o', h: true, v: false };
    return { t: 'e' };
  });
}

export function evaluate(st) {
  let str = '';
  for (const t of st) {
    if (t.t === 'd') {
      const d = LOOK[keyOf(t.s)];
      if (d === undefined) return { valid: false };
      str += d;
    } else if (t.t === 'o') {
      if (!t.h) return { valid: false };
      str += t.v ? '+' : '-';
    } else {
      str += '=';
    }
  }
  const m = str.match(/^(\d+)([+-])(\d+)=(\d+)$/);
  if (!m || [m[1], m[3], m[4]].some((n) => n.length > 1 && n[0] === '0')) {
    return { valid: false, str };
  }
  const lhs = m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
  return { valid: true, correct: lhs === +m[4], str };
}

export function sticks(st) {
  const filled = [];
  const empty = [];
  st.forEach((t, i) =>
    slotsOf(t).forEach((k) => (has(t, k) ? filled : empty).push([i, k]))
  );
  return { filled, empty };
}

export function applyMove(st, from, to) {
  const s = clone(st);
  put(s[from[0]], from[1], false);
  put(s[to[0]], to[1], true);
  return s;
}

export function solutions(st) {
  const { filled, empty } = sticks(st);
  const out = [];
  for (const f of filled) {
    for (const e of empty) {
      const r = evaluate(applyMove(st, f, e));
      if (r.valid && r.correct) out.push({ from: f, to: e });
    }
  }
  return out;
}

export const solve = (st, mode = 'move-1') => solutions(st);

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function generate(level) {
  const maxA = level < 4 ? 9 : level < 10 ? 50 : 99;
  const maxB = level < 10 ? 9 : 99;
  for (let tries = 0; tries < 500; tries++) {
    const a = rnd(0, maxA);
    const b = rnd(0, maxB);
    const plus = Math.random() < 0.5;
    const c = plus ? a + b : a - b;
    if (c < 0 || c > 99) continue;
    const truth = build(`${a}${plus ? '+' : '-'}${b}=${c}`);
    const { filled, empty } = sticks(truth);
    const cands = [];
    for (const f of filled) {
      for (const e of empty) {
        const s = applyMove(truth, f, e);
        const r = evaluate(s);
        if (!r.valid || r.correct) continue;
        const crossToken = f[0] !== e[0];
        if (level >= 3 && !crossToken && Math.random() < 0.5) continue;
        cands.push(s);
      }
    }
    if (cands.length) return cands[rnd(0, cands.length - 1)];
  }
  return build('6+4=4');
}
