// ===== Match Sticks — move one stick to fix the equation =====
// Seven-segment slots for a digit (x1,y1 = match head end)
const SEG = {
  a: [10, 6, 50, 6], b: [56, 12, 56, 50], c: [56, 60, 56, 98], d: [10, 104, 50, 104],
  e: [4, 98, 4, 60], f: [4, 50, 4, 12], g: [10, 55, 50, 55]
};
const OPSEG = { h: [10, 55, 50, 55], v: [30, 35, 30, 75] };
const EQSEG = [[10, 45, 50, 45], [10, 65, 50, 65]];
const DIG = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];
const keyOf = s => [...s].sort().join("");
const LOOK = {}; DIG.forEach((s, i) => (LOOK[keyOf(s)] = i));
const TOKEN_W = 60, GAP = 22;

// ---------- model ----------
const slotsOf = t => (t.t === "d" ? Object.keys(SEG) : t.t === "o" ? ["h", "v"] : []);
const has = (t, k) => (t.t === "d" ? t.s.has(k) : !!t[k]);
const put = (t, k, on) => { if (t.t === "d") on ? t.s.add(k) : t.s.delete(k); else t[k] = on; };
const clone = st => st.map(t => (t.t === "d" ? { t: "d", s: new Set(t.s) } : { ...t }));

function build(str) {
  return [...str].map(ch => {
    if (/\d/.test(ch)) return { t: "d", s: new Set(DIG[+ch]) };
    if (ch === "+") return { t: "o", h: true, v: true };
    if (ch === "-") return { t: "o", h: true, v: false };
    return { t: "e" };
  });
}

function evaluate(st) {
  let str = "";
  for (const t of st) {
    if (t.t === "d") { const d = LOOK[keyOf(t.s)]; if (d === undefined) return { valid: false }; str += d; }
    else if (t.t === "o") { if (!t.h) return { valid: false }; str += t.v ? "+" : "-"; }
    else str += "=";
  }
  const m = str.match(/^(\d+)([+-])(\d+)=(\d+)$/);
  if (!m || [m[1], m[3], m[4]].some(n => n.length > 1 && n[0] === "0")) return { valid: false, str };
  const lhs = m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3];
  return { valid: true, correct: lhs === +m[4], str };
}

function sticks(st) {
  const filled = [], empty = [];
  st.forEach((t, i) => slotsOf(t).forEach(k => (has(t, k) ? filled : empty).push([i, k])));
  return { filled, empty };
}

function applyMove(st, from, to) {
  const s = clone(st); put(s[from[0]], from[1], false); put(s[to[0]], to[1], true); return s;
}

function solutions(st) {
  const { filled, empty } = sticks(st), out = [];
  for (const f of filled) for (const e of empty) {
    const r = evaluate(applyMove(st, f, e));
    if (r.valid && r.correct) out.push({ from: f, to: e });
  }
  return out;
}

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function generate(level) {
  const maxA = level < 4 ? 9 : level < 10 ? 50 : 99;
  const maxB = level < 10 ? 9 : 99;
  for (let tries = 0; tries < 400; tries++) {
    const a = rnd(0, maxA), b = rnd(0, maxB), plus = Math.random() < .5;
    const c = plus ? a + b : a - b;
    if (c < 0 || c > 99) continue;
    const truth = build(`${a}${plus ? "+" : "-"}${b}=${c}`);
    const { filled, empty } = sticks(truth), cands = [];
    for (const f of filled) for (const e of empty) {
      const s = applyMove(truth, f, e), r = evaluate(s);
      if (!r.valid || r.correct) continue;
      const crossToken = f[0] !== e[0];
      if (level >= 3 && !crossToken && Math.random() < .5) continue; // favour harder moves later
      cands.push(s);
    }
    if (cands.length) return cands[rnd(0, cands.length - 1)];
  }
  return build("6+4=4"); // fallback (move a stick from 6→? classic)
}

// ---------- persistence ----------
const store = {
  get() { try { return JSON.parse(localStorage.getItem("matchsticks") || "{}"); } catch { return {}; } },
  set(v) { try { localStorage.setItem("matchsticks", JSON.stringify(v)); } catch {} }
};

// ---------- sound ----------
let ac;
function beep(freq, dur = .08, type = "triangle", vol = .15) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
  } catch {}
}
const sfx = {
  pick: () => beep(520), drop: () => beep(380),
  bad: () => { beep(200, .2, "sawtooth", .1); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .15), i * 110))
};

// ---------- game state ----------
const saved = store.get();
const G = {
  level: saved.level || 1, score: saved.score || 0, best: saved.best || 0, streak: 0,
  puzzle: null, cur: null, picked: null, locked: false, hint: null, hintUsed: false, start: 0
};
const $ = id => document.getElementById(id);
const svg = $("board"), NS = "http://www.w3.org/2000/svg";

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent && parent.appendChild(n); return n;
}

function drawMatch(parent, [x1, y1, x2, y2], cls) {
  const g = el("g", { class: "match " + cls }, parent);
  el("line", { class: "hit", x1, y1, x2, y2 }, g);
  el("line", { class: "stick", x1, y1, x2, y2 }, g);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  el("line", { class: "grain", x1: (x1 + mx) / 2, y1: (y1 + my) / 2, x2: (x2 + mx) / 2, y2: (y2 + my) / 2 }, g);
  el("circle", { class: "head", cx: x1, cy: y1, r: 6 }, g);
  return g;
}

function render() {
  svg.innerHTML = "";
  const w = G.cur.length * TOKEN_W + (G.cur.length - 1) * GAP;
  svg.setAttribute("viewBox", `-10 -10 ${w + 20} 130`);
  G.cur.forEach((t, i) => {
    const g = el("g", { transform: `translate(${i * (TOKEN_W + GAP)},0)` }, svg);
    if (t.t === "e") { EQSEG.forEach(s => drawMatch(g, s, "fixed")); return; }
    const geo = t.t === "d" ? SEG : OPSEG;
    for (const k of slotsOf(t)) {
      const isHint = G.hint && ((G.hint.from[0] === i && G.hint.from[1] === k) || (G.hint.to[0] === i && G.hint.to[1] === k));
      if (has(t, k)) {
        const picked = G.picked && G.picked[0] === i && G.picked[1] === k;
        const m = drawMatch(g, geo[k], (picked ? "picked " : "") + (isHint ? "hint" : ""));
        m.addEventListener("click", () => onStick(i, k));
      } else if (G.picked || isHint) {
        const s = el("g", { class: "slot" + (isHint ? " hint" : "") }, g);
        const [x1, y1, x2, y2] = geo[k];
        el("line", { class: "hit", x1, y1, x2, y2 }, s);
        el("line", { class: "ghost", x1, y1, x2, y2 }, s);
        s.addEventListener("click", () => onSlot(i, k));
      }
    }
  });
}

function hud() {
  $("level").textContent = G.level; $("score").textContent = G.score;
  $("streak").textContent = G.streak; $("best").textContent = G.best;
}
function msg(t, cls = "") { const m = $("msg"); m.textContent = t; m.className = "msg " + cls; }

function newPuzzle() {
  G.puzzle = generate(G.level); G.cur = clone(G.puzzle);
  G.picked = null; G.hint = null; G.hintUsed = false; G.locked = false; G.start = Date.now();
  $("boardWrap").classList.remove("win");
  msg("Tap a stick to pick it up, then tap an empty slot.");
  hud(); render();
}

function onStick(i, k) {
  if (G.locked) return;
  G.picked = G.picked && G.picked[0] === i && G.picked[1] === k ? null : [i, k];
  G.picked && sfx.pick(); render();
}

function onSlot(i, k) {
  if (G.locked || !G.picked) return;
  G.cur = applyMove(G.cur, G.picked, [i, k]); G.picked = null; G.hint = null; sfx.drop(); render();
  const r = evaluate(G.cur);
  if (r.valid && r.correct) return win();
  G.locked = true;
  msg(r.valid ? `${r.str.replace(/([+\-=])/g, " $1 ")} is not true` : "That doesn't form valid symbols", "bad");
  sfx.bad();
  const b = $("boardWrap"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
  setTimeout(() => { G.cur = clone(G.puzzle); G.locked = false; render(); }, 900);
}

function win() {
  G.locked = true;
  const secs = (Date.now() - G.start) / 1000;
  const stars = G.hintUsed ? 1 : secs < 20 ? 3 : secs < 60 ? 2 : 1;
  const pts = stars * 100 + G.level * 10 + G.streak * 20;
  G.score += pts; G.streak++; G.best = Math.max(G.best, G.score);
  $("boardWrap").classList.add("win"); msg("Correct!", "good"); sfx.win(); hud();
  $("stars").innerHTML = [1, 2, 3].map(n => `<span class="${n <= stars ? "" : "off"}">⭐</span>`).join("");
  $("winInfo").textContent = `${Math.round(secs)}s · +${pts} points`;
  setTimeout(() => $("overlay").classList.remove("hidden"), 500);
  G.level++; store.set({ level: G.level, score: G.score, best: G.best });
}

function showHint() {
  if (G.locked) return;
  const sol = solutions(G.puzzle)[0]; if (!sol) return;
  G.cur = clone(G.puzzle); G.picked = null; G.hint = sol; G.hintUsed = true;
  msg("Move the flashing stick to the green slot.", "good"); render();
}

function skip() { G.streak = 0; G.score = Math.max(0, G.score - 50); store.set({ level: G.level, score: G.score, best: G.best }); newPuzzle(); }

$("btnReset").onclick = () => { if (G.locked) return; G.cur = clone(G.puzzle); G.picked = null; render(); };
$("btnHint").onclick = showHint;
$("btnSkip").onclick = skip;
$("btnNext").onclick = () => { $("overlay").classList.add("hidden"); newPuzzle(); };
document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (k === "escape") { G.picked = null; render(); }
  else if (k === "r") $("btnReset").click();
  else if (k === "h") showHint();
  else if (k === "n") { if (!$("overlay").classList.contains("hidden")) $("btnNext").click(); else skip(); }
});
setInterval(() => {
  if (G.locked) return;
  const s = Math.floor((Date.now() - G.start) / 1000);
  $("time").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}, 250);

newPuzzle();
