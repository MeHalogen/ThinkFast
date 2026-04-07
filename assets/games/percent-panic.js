/* ══════════════════════════════════════════
   Tvara — Percent Panic
   One wrong answer ends the run.
   ══════════════════════════════════════════ */

const LS_KEY = 'tf_pc_best';
const QUESTION_SECONDS = 6.5;

const state = {
  running: false,
  streak: 0,
  best: 0,
  t0: 0,
  timer: null,
  current: null,
};

function getBest() { return parseInt(localStorage.getItem(LS_KEY) || '0', 10); }
function saveBest(n) { if (n > getBest()) localStorage.setItem(LS_KEY, String(n)); }

function toast(msg, dur = 1800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), dur);
}

function show(id) {
  document.getElementById('pc-preplay').style.display = id === 'pre' ? '' : 'none';
  document.getElementById('pc-game').style.display = id === 'game' ? '' : 'none';
  document.getElementById('pc-gameover').style.display = id === 'over' ? '' : 'none';
}

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function pickPercent() {
  const nice = [5, 10, 12.5, 15, 20, 25, 30, 35, 40, 50, 60, 75];
  return nice[randInt(0, nice.length - 1)];
}

function pickBase() {
  // Prefer values that keep answers “mental-math friendly”.
  const bases = [
    40, 50, 60, 80, 100, 120, 150, 160, 200, 240, 250, 300, 320, 400, 500, 600, 800, 1000
  ];
  if (Math.random() < 0.72) return bases[randInt(0, bases.length - 1)];
  return randInt(20, 900);
}

function buildQuestion() {
  const typeRoll = Math.random();

  if (typeRoll < 0.55) {
    // p% of N
    const p = pickPercent();
    const n = pickBase();
    const ans = (p / 100) * n;
    return {
      prompt: `${p}% of ${n} = ?`,
      answer: ans,
      fmt: (x) => (Number.isInteger(x) ? String(x) : String(x)),
    };
  }

  if (typeRoll < 0.80) {
    // After discount
    const p = [10, 15, 20, 25, 30, 40, 50][randInt(0, 6)];
    const n = [200, 240, 300, 400, 500, 800, 1000][randInt(0, 6)];
    const ans = n * (1 - p / 100);
    return {
      prompt: `${n} after ${p}% off = ?`,
      answer: ans,
      fmt: (x) => (Number.isInteger(x) ? String(x) : String(x)),
    };
  }

  // Increase by %
  const p = [5, 10, 12.5, 15, 20, 25][randInt(0, 5)];
  const n = [80, 100, 120, 160, 200, 240, 400][randInt(0, 6)];
  const ans = n * (1 + p / 100);
  return {
    prompt: `${n} increased by ${p}% = ?`,
    answer: ans,
    fmt: (x) => (Number.isInteger(x) ? String(x) : String(x)),
  };
}

function buildOptions(answer) {
  const used = new Set();
  const opts = [];

  function push(v) {
    const key = Number.isInteger(v) ? String(v) : String(v);
    if (used.has(key)) return false;
    used.add(key);
    opts.push(v);
    return true;
  }

  push(answer);

  const a = Number(answer);
  const spread = Math.max(5, Math.round(Math.abs(a) * 0.18));
  let tries = 0;
  while (opts.length < 4 && tries++ < 200) {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const delta = randInt(Math.max(2, Math.floor(spread * 0.35)), spread);
    const v = a + sign * delta;
    push(v);
  }

  return opts.sort(() => Math.random() - 0.5);
}

function setInline(kind, msg) {
  const el = document.getElementById('pc-inline');
  if (!el) return;
  el.className = 'pc-inline' + (kind === 'good' ? ' good' : kind === 'bad' ? ' bad' : '');
  el.textContent = msg || '';
}

function lockOptions(disabled) {
  document.querySelectorAll('.pc-opt').forEach((b) => { b.disabled = !!disabled; });
}

function renderBest() {
  const best = getBest();
  const el = document.getElementById('pc-best');
  if (el) el.textContent = best > 0 ? best : '—';
}

function renderStreak() {
  const s = document.getElementById('pc-streak');
  if (s) s.textContent = String(state.streak);
}

function next() {
  state.current = buildQuestion();
  const qEl = document.getElementById('pc-question');
  const oEl = document.getElementById('pc-options');
  if (qEl) qEl.textContent = state.current.prompt;
  if (oEl) oEl.innerHTML = '';

  const opts = buildOptions(state.current.answer);
  opts.forEach((v) => {
    const btn = document.createElement('button');
    btn.className = 'pc-opt';
    btn.textContent = state.current.fmt(v);
    btn.dataset.val = String(v);
    btn.addEventListener('click', () => choose(Number(v)));
    oEl.appendChild(btn);
  });

  setInline('', 'Pick the answer.');
  startTimer();
}

function startTimer() {
  const bar = document.getElementById('pc-timer-bar');
  clearInterval(state.timer);
  state.t0 = performance.now();

  state.timer = setInterval(() => {
    const elapsed = (performance.now() - state.t0) / 1000;
    const left = Math.max(0, QUESTION_SECONDS - elapsed);
    if (bar) bar.style.width = (left / QUESTION_SECONDS * 100) + '%';
    if (left <= 0) {
      clearInterval(state.timer);
      fail(`Time's up. Answer: ${formatAnswer(state.current.answer)}`);
    }
  }, 80);
}

function formatAnswer(x) {
  return Number.isInteger(x) ? String(x) : String(x);
}

function choose(v) {
  if (!state.running) return;
  clearInterval(state.timer);
  lockOptions(true);

  const ans = Number(state.current.answer);
  const ok = Math.abs(v - ans) < 1e-9;
  if (ok) {
    state.streak += 1;
    renderStreak();
    setInline('good', '✓ Correct');
    setTimeout(() => {
      lockOptions(false);
      next();
    }, 420);
  } else {
    fail(`✗ Answer: ${formatAnswer(ans)}`);
  }
}

function fail(msg) {
  state.running = false;
  clearInterval(state.timer);
  setInline('bad', msg);

  const streak = state.streak;
  const prevBest = getBest();
  const isBest = streak > prevBest;
  saveBest(streak);

  const fs = document.getElementById('pc-final-streak');
  const best = document.getElementById('pc-best-display');
  const beat = document.getElementById('pc-beat-best');
  if (fs) fs.textContent = String(streak);
  if (best) best.textContent = String(Math.max(streak, prevBest));
  if (beat) beat.textContent = isBest ? '🎉 New Personal Best!' : '';

  show('over');
  renderBest();
}

function start() {
  state.running = true;
  state.streak = 0;
  renderStreak();
  show('game');
  next();
}

function share() {
  const streak = state.streak;
  const text = `I hit a ${streak} streak on Percent Panic (Tvara). Try it: tvaralabs.in`;
  if (navigator.share) {
    navigator.share({ title: 'Percent Panic — Tvara', text, url: 'https://tvaralabs.in' }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => toast('Copied share text.')).catch(() => toast('Copy failed.'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBest();
  show('pre');

  const play = document.getElementById('pc-play-btn');
  const retry = document.getElementById('pc-restart-btn');
  const menu = document.getElementById('pc-menu-btn');
  const shareBtn = document.getElementById('pc-share-btn');

  if (play) play.addEventListener('click', start);
  if (retry) retry.addEventListener('click', start);
  if (menu) menu.addEventListener('click', () => { location.href = '/'; });
  if (shareBtn) shareBtn.addEventListener('click', share);
});

