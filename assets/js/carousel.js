/* ══════════════════════════════════════════
   Tvara — Reusable Carousel
   ══════════════════════════════════════════ */

/**
 * Initialise a drag-to-scroll carousel with scroll-synced dot indicators.
 *
 * @param {string} carouselId  - id of the scrollable .carousel element
 * @param {string} dotsId      - id of the .carousel-dots container
 */
export function initCarousel(carouselId, dotsId) {
  const carousel = document.getElementById(carouselId);
  const dotsWrap = document.getElementById(dotsId);
  if (!carousel || !dotsWrap) return;

  // ── Build dots ──────────────────────────────
  const cards = carousel.querySelectorAll('.game-card');
  dotsWrap.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to card ${i + 1}`);
    dot.addEventListener('click', () => {
      carousel.scrollTo({ left: cards[i].offsetLeft - 16, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  });

  const dots = () => dotsWrap.querySelectorAll('.dot');

  function updateDots() {
    const scrollLeft = carousel.scrollLeft;
    const cardWidth  = cards[0] ? cards[0].offsetWidth + 16 : 1;
    const idx        = Math.round(scrollLeft / cardWidth);
    dots().forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  carousel.addEventListener('scroll', updateDots, { passive: true });

  // ── Drag-to-scroll ──────────────────────────
  let isDragging  = false;
  let startX      = 0;
  let scrollStart = 0;

  carousel.addEventListener('mousedown', e => {
    isDragging  = true;
    startX      = e.pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
    carousel.classList.add('grabbing');
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    carousel.classList.remove('grabbing');
  });

  carousel.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.2;
    carousel.scrollLeft = scrollStart - walk;
  });

  // ── Touch passthrough already handled by CSS scroll-snap ──
}
