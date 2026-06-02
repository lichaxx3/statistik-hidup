/* sw.js — Service Worker for Statistik Hidup PWA */
const CACHE_NAME = 'statistik-hidup-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/app.js',
  '/manifest.json',
];

/* Install: cache static assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* Activate: clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: cache-first for static, network-first for CDN */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  /* Always go network for external CDN resources */
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }

  /* Cache-first strategy for local assets */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => {
      /* Offline fallback */
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
