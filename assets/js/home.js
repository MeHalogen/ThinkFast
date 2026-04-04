/* ══════════════════════════════════════════
   ThinkFast — Home Page Logic
   ══════════════════════════════════════════ */

import { initCarousel } from './carousel.js';

const LS_KEY = 'tf_pp_best';

function getBest() {
  return parseInt(localStorage.getItem(LS_KEY) || '0', 10);
}

function refreshHomeBest() {
  const el = document.getElementById('home-best');
  if (!el) return;
  const best = getBest();
  el.textContent = best > 0 ? best : '—';
}

function init() {
  // Populate best score chip on Pattern Pulse card
  refreshHomeBest();

  // Show the best-score chip if a score exists
  const chipEl = document.getElementById('home-best-chip');
  if (chipEl && getBest() > 0) chipEl.classList.add('show');

  // Initialise carousel
  initCarousel('games-carousel', 'carousel-dots');

  // Hero CTA → Pattern Pulse
  const heroBtn = document.getElementById('hero-play-btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      location.href = 'games/pattern-pulse.html';
    });
  }

  // Card click → Pattern Pulse
  const pulseCard = document.getElementById('card-pulse');
  if (pulseCard) {
    pulseCard.addEventListener('click', () => {
      location.href = 'games/pattern-pulse.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
