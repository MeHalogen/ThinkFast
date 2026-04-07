/* Tvara service worker (simple offline support) */

const CACHE_VERSION = 'tvara-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Keep this list small + high value (shell + shared assets)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/base.css',
  '/assets/css/nav.css',
  '/assets/css/home.css',
  '/assets/js/common.js',
  '/assets/js/home.js',
  '/assets/js/session.js',
  '/assets/js/user.js',
  '/assets/favicon.ico',
  '/assets/favicon-16x16.png',
  '/assets/favicon-32x32.png',
  '/assets/apple-touch-icon.png',
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
  '/assets/site.webmanifest',
  '/legal/privacy.html',
  '/legal/terms.html',
  '/legal/cookies.html',
  '/profile/',
  '/profile/index.html',
  '/assets/css/profile.css',
  '/assets/js/profile.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((k) => k.startsWith('tvara-') && k !== STATIC_CACHE)
        .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first for HTML; cache-first for other GET assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html') || req.mode === 'navigate';

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});

