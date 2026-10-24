// Model for 7-segment matchstick arithmetic

export const SEG = {
  a: [10, 8, 50, 8],     // top
  b: [54, 12, 54, 52],   // top-right
  c: [54, 60, 54, 100],  // bottom-right
  d: [10, 104, 50, 104], // bottom
  e: [6, 100, 6, 60],    // bottom-left
  f: [6, 52, 6, 12],     // top-left
  g: [10, 56, 50, 56],   // middle
};

export const OPSEG = {
  h: [10, 56, 50, 56],   // horizontal
  v: [30, 36, 30, 76],   // vertical
};

export const EQSEG = [
  [10, 46, 50, 46],
  [10, 66, 50, 66],
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

export const keyOf = (s) => (s instanceof Set ? [...s] : [...s]).sort().join('');
export const LOOK = {};
DIG.forEach((s, i) => {
  LOOK[keyOf(s)] = i;
});

export const TOKEN_W = 60;
export const GAP = 18;

export function slotsOf(token) {
  if (token.t === 'd') return Object.keys(SEG);
  if (token.t === 'o') return ['h', 'v'];
  return [];
}

export function has(token, slotKey) {
  if (token.t === 'd') return token.s.has(slotKey);
  if (token.t === 'o') return !!token[slotKey];
  return false;
}

export function put(token, slotKey, on) {
  if (token.t === 'd') {
    on ? token.s.add(slotKey) : token.s.delete(slotKey);
  } else if (token.t === 'o') {
    token[slotKey] = !!on;
  }
}

export function clone(state) {
  return state.map((t) => {
    if (t.t === 'd') return { t: 'd', s: new Set(t.s) };
    if (t.t === 'o') return { t: 'o', h: !!t.h, v: !!t.v };
    return { t: 'e' };
  });
}

export function build(str) {
  const tokens = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (/\d/.test(ch)) {
      tokens.push({ t: 'd', s: new Set(DIG[+ch]) });
    } else if (ch === '+') {
      tokens.push({ t: 'o', h: true, v: true });
    } else if (ch === '-') {
      tokens.push({ t: 'o', h: true, v: false });
    } else if (ch === '=') {
      tokens.push({ t: 'e' });
    }
  }
  return tokens;
}

export function stringify(state) {
  let str = '';
  for (const t of state) {
    if (t.t === 'd') {
      const d = LOOK[keyOf(t.s)];
      if (d === undefined) return null;
      str += d;
    } else if (t.t === 'o') {
      if (!t.h) return null;
      str += t.v ? '+' : '-';
    } else if (t.t === 'e') {
      str += '=';
    }
  }
  return str;
}

export function evaluate(state) {
  let str = '';
  for (const t of state) {
    if (t.t === 'd') {
      const d = LOOK[keyOf(t.s)];
      if (d === undefined) return { valid: false, reason: 'invalid_digit' };
      str += d;
    } else if (t.t === 'o') {
      if (!t.h) return { valid: false, reason: 'invalid_op' };
      str += t.v ? '+' : '-';
    } else {
      str += '=';
    }
  }
  const m = str.match(/^(\d+)([+-])(\d+)=(\d+)$/);
  if (!m) return { valid: false, str, reason: 'format' };
  if ([m[1], m[3], m[4]].some((n) => n.length > 1 && n[0] === '0')) {
    return { valid: false, str, reason: 'leading_zero' };
  }
  const a = +m[1];
  const b = +m[3];
  const c = +m[4];
  const lhs = m[2] === '+' ? a + b : a - b;
  return {
    valid: true,
    correct: lhs === c,
    str,
    lhs,
    rhs: c,
    a,
    op: m[2],
    b,
  };
}

export function sticks(state) {
  const filled = [];
  const empty = [];
  state.forEach((t, i) => {
    slotsOf(t).forEach((k) => {
      (has(t, k) ? filled : empty).push([i, k]);
    });
  });
  return { filled, empty };
}

export function applyMove(state, from, to) {
  const s = clone(state);
  put(s[from[0]], from[1], false);
  put(s[to[0]], to[1], true);
  return s;
}

export function applyRemove(state, at) {
  const s = clone(state);
  put(s[at[0]], at[1], false);
  return s;
}

export function applyAdd(state, at) {
  const s = clone(state);
  put(s[at[0]], at[1], true);
  return s;
}
