const CACHE = 'shop-fit-sheet-v4';
const SHELL = ['/', '/demo', '/privacy', '/terms', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png', '/assets/app.js', '/assets/app.css', '/assets/hero-720.webp', '/assets/hero-1200.webp', '/assets/social.webp'];

self.addEventListener('install', (event) => {
  const freshRequests = SHELL.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(freshRequests)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('/', { ignoreVary: true }) : undefined)));
});
