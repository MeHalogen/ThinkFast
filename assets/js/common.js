/* ══════════════════════════════════════════
   Tvara — Common UI (footer, shared hooks)
   Included on: home + all game pages
   ══════════════════════════════════════════ */

function ensureFooter() {
  if (document.getElementById('tf-footer')) return;

  const footer = document.createElement('footer');
  footer.id = 'tf-footer';
  footer.className = 'tf-footer';
  footer.innerHTML = `
    <div class="tf-footer-inner">
      <div class="tf-footer-left">
        <span class="tf-footer-brand">Tvara</span>
        <span class="tf-footer-dot">·</span>
        <span class="tf-footer-mini">Train speed. Track progress.</span>
      </div>
      <div class="tf-footer-links">
        <a href="/profile/">Profile</a>
        <a href="/legal/privacy.html">Privacy</a>
        <a href="/legal/terms.html">Terms</a>
        <a href="/legal/cookies.html">Cookies</a>
        <a href="mailto:hello@tvaralabs.in">Contact</a>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

document.addEventListener('DOMContentLoaded', () => {
  ensureFooter();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

