import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4173);
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
  const safePath = normalize(pathname).replace(/^(?:\.\.\/?)+/, '');
  let file = join(root, safePath === '/' ? 'index.html' : safePath.slice(1));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  const found = existsSync(file) && statSync(file).isFile();
  if (!found) file = join(root, '404.html');
  const immutable = /^\/assets\/[^/]+-[a-z0-9_-]{8,}\.(?:js|css|webp)$/i.test(pathname);
  response.writeHead(found ? 200 : 404, {
    'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1');
