/* ══════════════════════════════════════════
   Tvara — Prime Sprint
   Decide: prime / composite / neither(1)
   ══════════════════════════════════════════ */

const LS_KEY = 'tf_ps_best';

const GAME_SECONDS = 45;

const state = {
  running: false,
  t0: 0,
  timer: null,
  score: 0,
  streak: 0,
  mult: 1,
  current: null,
};

function getBest() { return parseInt(localStorage.getItem(LS_KEY) || '0', 10); }
function saveBest(n) { if (n > getBest()) localStorage.setItem(LS_KEY, String(n)); }

function show(id) {
  document.getElementById('ps-preplay').style.display = id === 'pre' ? '' : 'none';
  document.getElementById('ps-game').style.display = id === 'game' ? '' : 'none';
  document.getElementById('ps-gameover').style.display = id === 'over' ? '' : 'none';
}

function toast(msg, dur = 1800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), dur);
}

function isPrime(n) {
  if (n <= 1) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const r = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= r; i += 2) if (n % i === 0) return false;
  return true;
}

function pickNumber() {
  // Mix of small & medium numbers that are “decisionable” quickly.
  const roll = Math.random();
  if (roll < 0.08) return 1;
  if (roll < 0.50) return 10 + Math.floor(Math.random() * 90);     // 10..99
  return 100 + Math.floor(Math.random() * 400);                     // 100..499
}

function correctType(n) {
  if (n === 1) return 'neither';
  return isPrime(n) ? 'prime' : 'composite';
}

function updateHUD() {
  const scoreBadge = document.getElementById('ps-score-badge');
  const streakEl = document.getElementById('ps-streak');
  const multEl = document.getElementById('ps-mult');
  if (scoreBadge) scoreBadge.textContent = String(state.score);
  if (streakEl) streakEl.textContent = String(state.streak);
  if (multEl) multEl.textContent = String(state.mult);
}

function setInline(kind, msg) {
  const el = document.getElementById('ps-inline');
  if (!el) return;
  el.className = 'ps-inline' + (kind === 'good' ? ' good' : kind === 'bad' ? ' bad' : '');
  el.textContent = msg || '';
}

function nextQuestion() {
  state.current = pickNumber();
  const nEl = document.getElementById('ps-number');
  if (nEl) nEl.textContent = String(state.current);
  setInline('', 'Prime or composite?');
}

function bumpScore() {
  const badge = document.getElementById('ps-score-badge');
  if (!badge) return;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function lockButtons(disabled) {
  ['ps-prime','ps-composite','ps-neither'].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.disabled = !!disabled;
  });
}

function applyStreakMultiplier() {
  // Multiplier steps up as streak grows.
  const s = state.streak;
  state.mult = s >= 18 ? 4 : s >= 10 ? 3 : s >= 5 ? 2 : 1;
}

function answer(choice) {
  if (!state.running) return;
  const n = state.current;
  const correct = correctType(n);
  const ok = choice === correct;

  if (ok) {
    state.streak += 1;
    applyStreakMultiplier();
    state.score += 1 * state.mult;
    bumpScore();
    setInline('good', correct === 'prime' ? '✓ Prime' : correct === 'composite' ? '✓ Composite' : '✓ Neither');
  } else {
    state.streak = 0;
    applyStreakMultiplier();
    setInline('bad', `✗ ${n} is ${correct === 'prime' ? 'Prime' : correct === 'composite' ? 'Composite' : 'Neither (1)'}`);
  }
  updateHUD();
  nextQuestion();
}

function renderBest() {
  const best = getBest();
  const el = document.getElementById('ps-best');
  if (el) el.textContent = best > 0 ? best : '—';
}

function start() {
  state.running = true;
  state.score = 0;
  state.streak = 0;
  state.mult = 1;
  state.t0 = performance.now();

  show('game');
  updateHUD();
  nextQuestion();
  lockButtons(false);

  const timeEl = document.getElementById('ps-time');
  const bar = document.getElementById('ps-timer-bar');

  clearInterval(state.timer);
  state.timer = setInterval(() => {
    const elapsed = (performance.now() - state.t0) / 1000;
    const left = Math.max(0, GAME_SECONDS - elapsed);
    if (timeEl) timeEl.textContent = String(Math.ceil(left));
    if (bar) bar.style.width = (left / GAME_SECONDS * 100) + '%';
    if (left <= 0) end();
  }, 80);
}

function end() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.timer);
  lockButtons(true);

  const score = state.score;
  const prevBest = getBest();
  const isBest = score > prevBest;
  saveBest(score);

  const finalEl = document.getElementById('ps-final-score');
  const bestEl = document.getElementById('ps-best-display');
  const beatEl = document.getElementById('ps-beat-best');
  if (finalEl) finalEl.textContent = String(score);
  if (bestEl) bestEl.textContent = String(Math.max(score, prevBest));
  if (beatEl) beatEl.textContent = isBest ? '🎉 New Personal Best!' : '';

  show('over');
  renderBest();
}

function share() {
  const score = state.score;
  const text = `I scored ${score} on Prime Sprint (Tvara). Can you beat it? tvaralabs.in`;
  if (navigator.share) {
    navigator.share({ title: 'Prime Sprint — Tvara', text, url: 'https://tvaralabs.in' }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => toast('Copied share text.')).catch(() => toast('Copy failed.'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBest();

  const play = document.getElementById('ps-play-btn');
  const retry = document.getElementById('ps-restart-btn');
  const menu = document.getElementById('ps-menu-btn');
  const shareBtn = document.getElementById('ps-share-btn');

  const prime = document.getElementById('ps-prime');
  const comp = document.getElementById('ps-composite');
  const neither = document.getElementById('ps-neither');

  if (play) play.addEventListener('click', start);
  if (retry) retry.addEventListener('click', start);
  if (menu) menu.addEventListener('click', () => { location.href = '/'; });
  if (shareBtn) shareBtn.addEventListener('click', share);

  if (prime) prime.addEventListener('click', () => answer('prime'));
  if (comp) comp.addEventListener('click', () => answer('composite'));
  if (neither) neither.addEventListener('click', () => answer('neither'));

  document.addEventListener('keydown', (e) => {
    if (!state.running) return;
    if (e.key === 'ArrowLeft') answer('prime');
    if (e.key === 'ArrowRight') answer('composite');
    if (e.key === 'ArrowDown') answer('neither');
  });
});

