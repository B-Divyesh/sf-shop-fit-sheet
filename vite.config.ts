import { defineConfig, type Plugin } from 'vite';

const staticShell = [
  '/', '/demo', '/privacy', '/terms', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png',
  '/assets/hero-720.748a1193.webp', '/assets/hero-1200.7e56413d.webp', '/assets/social.7a30391a.webp',
];

function precacheServiceWorker(): Plugin {
  return {
    name: 'precache-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const builtAssets = Object.values(bundle)
        .filter((file) => file.type === 'chunk' || file.type === 'asset')
        .map((file) => `/${file.fileName}`);
      const shell = [...new Set([...staticShell, ...builtAssets])].sort();
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE = 'shop-fit-sheet-v5';\nconst SHELL = ${JSON.stringify(shell)};\n\nself.addEventListener('install', (event) => {\n  const freshRequests = SHELL.map((url) => new Request(url, { cache: 'reload' }));\n  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(freshRequests)).then(() => self.skipWaiting()));\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));\n});\n\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;\n  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {\n    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));\n    return response;\n  }).catch(() => event.request.mode === 'navigate' ? caches.match('/', { ignoreVary: true }) : undefined)));\n});\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [precacheServiceWorker()],
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => assetInfo.name?.endsWith('.css') ? 'assets/app-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
