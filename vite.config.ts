import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function precachePlugin(): Plugin {
  return {
    name: 'shop-fit-sheet-precache',
    generateBundle(_, bundle) {
      const generatedAssets = Object.values(bundle).flatMap((item) => {
        if (item.type === 'chunk' && item.fileName.startsWith('assets/main-') && item.fileName.endsWith('.js')) return [`/${item.fileName}`];
        if (item.type === 'asset' && item.fileName.startsWith('assets/') && /\.(?:css|webp)$/.test(item.fileName)) return [`/${item.fileName}`];
        if (item.type !== 'asset' || !item.fileName.endsWith('.html') || typeof item.source !== 'string') return [];
        return [...item.source.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.js)"/g)].map((match) => match[1]);
      });
      const shell = ['/', '/demo', '/privacy', '/terms', '/404.html', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png', ...generatedAssets];
      const source = `const CACHE = 'shop-fit-sheet-v6';\nconst SHELL = ${JSON.stringify(shell)};\n\nself.addEventListener('install', (event) => {\n  const freshRequests = SHELL.map((url) => new Request(url, { cache: 'reload' }));\n  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(freshRequests)).then(() => self.skipWaiting()));\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));\n});\n\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;\n  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {\n    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));\n    return response;\n  }).catch(() => event.request.mode === 'navigate' ? caches.match('/', { ignoreVary: true }) : undefined)));\n});\n`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

function socialMetadataPlugin(): Plugin {
  return {
    name: 'shop-fit-sheet-social-metadata',
    async writeBundle(options, bundle) {
      const social = Object.keys(bundle).find((fileName) => fileName.includes('social-') && fileName.endsWith('.webp'));
      if (!social) throw new Error('Social image was not emitted');
      if (!options.dir) throw new Error('Build output directory is required');
      const pages = ['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404.html'];
      await Promise.all(pages.map(async (page) => {
        const path = resolve(options.dir!, page);
        const html = await readFile(path, 'utf8');
        await writeFile(path, html.replaceAll('/__SOCIAL_IMAGE__', `/${social}`));
      }));
    },
  };
}

export default defineConfig({
  plugins: [socialMetadataPlugin(), precachePlugin()],
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'demo/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
      output: {
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
