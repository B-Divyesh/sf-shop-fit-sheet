import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const evidenceDirectory = '.factory/evidence-repair-5';
await mkdir(evidenceDirectory, { recursive: true });
const report = { testedAt: new Date().toISOString(), base };
const digest = (value) => createHash('sha256').update(value).digest('hex');

const assetFiles = (await readdir('dist/assets')).sort();
const artifactPaths = [
  ['/', 'dist/index.html'],
  ['/demo/', 'dist/demo/index.html'],
  ['/privacy/', 'dist/privacy/index.html'],
  ['/terms/', 'dist/terms/index.html'],
  ['/404.html', 'dist/404.html'],
  ['/sw.js', 'dist/sw.js'],
  ['/manifest.webmanifest', 'dist/manifest.webmanifest'],
  ['/favicon.svg', 'dist/favicon.svg'],
  ['/apple-touch-icon.png', 'dist/apple-touch-icon.png'],
  ...assetFiles.map((file) => [`/assets/${file}`, `dist/assets/${file}`]),
];
report.identity = {};
for (const [urlPath, localPath] of artifactPaths) {
  const local = await readFile(localPath);
  const response = await fetch(`${base}${urlPath}`, { cache: 'no-store' });
  assert.equal(response.status, 200, `${urlPath} must be live`);
  const live = Buffer.from(await response.arrayBuffer());
  report.identity[urlPath] = { localSha256: digest(local), liveSha256: digest(live), byteMatch: local.equals(live) };
  assert(local.equals(live), `${urlPath} must match the local production build byte-for-byte`);
}

const rootHtml = await readFile('dist/index.html', 'utf8');
const scriptPath = rootHtml.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = rootHtml.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
assert(scriptPath && stylePath, 'Built HTML must reference fingerprinted JavaScript and CSS.');
report.responses = {};
for (const path of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist', scriptPath, stylePath, '/sw.js']) {
  const response = await fetch(`${base}${path}`, { cache: 'no-store', redirect: 'manual' });
  report.responses[path] = {
    status: response.status,
    cacheControl: response.headers.get('cache-control'),
    contentType: response.headers.get('content-type'),
    csp: response.headers.get('content-security-policy'),
    hsts: response.headers.get('strict-transport-security'),
    nosniff: response.headers.get('x-content-type-options'),
    referrerPolicy: response.headers.get('referrer-policy'),
    permissionsPolicy: response.headers.get('permissions-policy'),
  };
}
assert.equal(report.responses['/does-not-exist'].status, 404);
assert.match(report.responses[scriptPath].cacheControl ?? '', /immutable/);
assert.match(report.responses[stylePath].cacheControl ?? '', /immutable/);
assert.match(report.responses['/'].csp ?? '', /frame-ancestors 'none'/);
assert.match(report.responses['/'].hsts ?? '', /max-age=/);
assert.equal(report.responses['/'].nosniff, 'nosniff');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
const pageErrors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => pageErrors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
report.desktop = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  mainCount: await page.locator('main').count(),
  lang: await page.locator('html').getAttribute('lang'),
};
assert.deepEqual(report.desktop, {
  title: 'Shop Fit Sheet — Check a fitted build',
  h1: 'Check a fitted build before buying sheet material',
  mainCount: 1,
  lang: 'en',
});
await page.keyboard.press('Tab');
const skipLink = page.getByRole('link', { name: 'Skip to main content' });
report.keyboard = {
  firstFocus: await skipLink.evaluate((node) => node === document.activeElement),
  outline: await skipLink.evaluate((node) => {
    const style = getComputedStyle(node);
    return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`;
  }),
};
assert(report.keyboard.firstFocus);
assert.match(report.keyboard.outline, /^3px solid/);
await skipLink.press('Enter');
assert(await page.locator('#main').evaluate((node) => node === document.activeElement));

await page.getByLabel('Project name').fill('Real project stays separate');
await page.getByRole('link', { name: /Try it with sample data/ }).click();
await page.waitForTimeout(150);
const firstViewportLocators = [
  page.getByRole('heading', { level: 1, name: 'Van bed utility cabinet' }),
  page.getByRole('heading', { name: '1 conflict to fix' }),
  page.getByText('Build depth exceeds the cleared space by 10 mm.'),
];
report.desktop.demoFirstViewport = [];
for (const locator of firstViewportLocators) {
  const box = await locator.boundingBox();
  assert(box && box.y < 900 && box.y + box.height > 0, 'Demo result must intersect the first desktop viewport.');
  report.desktop.demoFirstViewport.push(box);
}
assert.equal(await page.locator('tbody tr').count(), 6);
assert.match(await page.locator('[data-stock-thickness="18"] .stock-area').innerText(), /5\.78 m² \+ 15% allowance \(0\.87 m²\) = 6\.65 m²/);
await page.getByLabel('Build depth').fill('740.01');
assert(await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible());
await page.getByLabel('Left').fill('-1');
assert(await page.getByText('Clearances and gaps cannot be negative.').isVisible());
await page.getByRole('button', { name: 'Reset demo' }).click();
assert.equal(await page.getByLabel('Project name').inputValue(), 'Van bed utility cabinet');
await page.evaluate(() => { window.print = () => { document.body.dataset.printed = 'true'; }; });
await page.getByRole('button', { name: 'Print build sheet' }).click();
assert.equal(await page.locator('body').getAttribute('data-printed'), 'true');
await page.getByLabel('Project name').fill('Temporary demo edit');
assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).sort()), ['demo:shop-fit-sheet:project:v1', 'shop-fit-sheet:project:v1']);
await page.getByRole('button', { name: 'Start for real' }).click();
assert.equal(await page.getByLabel('Project name').inputValue(), 'Real project stays separate');
assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).sort()), ['shop-fit-sheet:project:v1']);
await page.screenshot({ path: `${evidenceDirectory}/desktop.png`, fullPage: true });

report.routes = {};
report.axe = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  report.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    h1Count: await page.locator('h1').count(),
    mainCount: await page.locator('main').count(),
  };
  assert.equal(report.routes[route].h1Count, 1);
  assert.equal(report.routes[route].mainCount, 1);
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe[route] = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').map(({ id, impact }) => ({ id, impact }));
  assert.deepEqual(report.axe[route], []);
}
assert.equal(report.routes['/does-not-exist'].status, 404);
report.privacy = {
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== base),
  consoleErrors: consoleErrors.filter((error) => !error.includes('status of 404')),
  pageErrors,
};
assert.deepEqual(report.privacy.offOrigin, []);
assert.deepEqual(report.privacy.consoleErrors, []);
assert.deepEqual(report.privacy.pageErrors, []);
await context.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const mobile = await mobileContext.newPage();
await mobile.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
report.mobile = await mobile.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
}));
assert.deepEqual(report.mobile, { scrollWidth: 390, clientWidth: 390, reducedMotion: true, scrollBehavior: 'auto' });
for (const locator of [
  mobile.getByRole('heading', { level: 1, name: 'Van bed utility cabinet' }),
  mobile.getByRole('heading', { name: '1 conflict to fix' }),
  mobile.getByText('Build depth exceeds the cleared space by 10 mm.'),
]) {
  const box = await locator.boundingBox();
  assert(box && box.y < 844 && box.y + box.height > 0, 'Demo result must intersect the first mobile viewport.');
}
report.mobile.targetsUnder44 = await mobile.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
  const box = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return { name: element.getAttribute('aria-label') || element.textContent?.trim(), width: box.width, height: box.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 };
}).filter((target) => target.visible && (target.width < 44 || target.height < 44)));
assert.deepEqual(report.mobile.targetsUnder44, []);
await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
report.mobile.text200 = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
assert.deepEqual(report.mobile.text200, { scrollWidth: 390, clientWidth: 390 });
await mobile.screenshot({ path: `${evidenceDirectory}/mobile-390.png`, fullPage: true });

const registration = await mobile.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  await ready.update();
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  return { active: ready.active?.state, waiting: Boolean(ready.waiting), caches: await caches.keys() };
});
assert.equal(registration.active, 'activated');
assert.equal(registration.waiting, false);
assert(registration.caches.includes('shop-fit-sheet-v10'));
await mobileContext.setOffline(true);
await mobile.reload();
report.offline = { registration, verdict: await mobile.getByRole('heading', { name: '1 conflict to fix' }).innerText() };
assert.equal(report.offline.verdict, '1 conflict to fix');
await mobileContext.close();
await browser.close();

await writeFile(`${evidenceDirectory}/live-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
