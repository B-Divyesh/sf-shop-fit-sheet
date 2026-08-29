import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'https://shop-fit-sheet.sociobot.in';
const evidence = process.argv[3] ?? '.factory/evidence-polish-3/live';
await mkdir(evidence, { recursive: true });
const report = { testedAt: new Date().toISOString(), base };
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const localHtml = await readFile('dist/index.html');
const liveHtml = Buffer.from(await (await fetch(`${base}/`, { cache: 'no-store' })).arrayBuffer());
const html = liveHtml.toString();
const scriptPath = html.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
assert(scriptPath && stylePath, 'Deployed HTML must reference fingerprinted JS and CSS.');
const compare = async (path) => sha256(await readFile(`dist${path}`)) === sha256(Buffer.from(await (await fetch(`${base}${path}`, { cache: 'no-store' })).arrayBuffer()));
report.identity = {
  html: sha256(localHtml) === sha256(liveHtml),
  script: await compare(scriptPath),
  style: await compare(stylePath),
  worker: await compare('/sw.js'),
  scriptPath,
  stylePath,
};
assert(Object.values(report.identity).slice(0, 4).every(Boolean), 'Deployed files must match dist.');

report.responses = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist', scriptPath, stylePath, '/sw.js']) {
  const response = await fetch(`${base}${route}`, { cache: 'no-store', redirect: 'manual' });
  report.responses[route] = {
    status: response.status,
    cacheControl: response.headers.get('cache-control'),
    csp: response.headers.get('content-security-policy'),
    nosniff: response.headers.get('x-content-type-options'),
    referrerPolicy: response.headers.get('referrer-policy'),
  };
}
assert.equal(report.responses['/does-not-exist'].status, 404);
assert.match(report.responses[scriptPath].cacheControl ?? '', /immutable/);
if (base.startsWith('https://')) assert.match(report.responses['/'].csp ?? '', /frame-ancestors 'none'/);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
report.firstScreen = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  actionHref: await page.getByRole('link', { name: /Try it with sample data/ }).getAttribute('href'),
  facts: await page.locator('.plain-facts li').allInnerTexts(),
  paidOfferCount: await page.getByText(/\$9 project library|Buy the project library|One-time purchase/).count(),
};
assert.deepEqual(report.firstScreen, {
  title: 'Shop Fit Sheet — Check a fitted build',
  h1: 'Check a fitted build before buying sheet material',
  actionHref: '/?demo=1',
  facts: ['Plans stay on this device', 'Works offline after the first visit', 'Calculator and printable build sheet'],
  paidOfferCount: 0,
});
await page.screenshot({ path: `${evidence}/cold-desktop.png` });
await page.getByLabel('Project name').fill('Live real project');
await page.getByRole('link', { name: /Try it with sample data/ }).click();
await page.waitForTimeout(300);

const viewportEvidence = async (activePage) => {
  const result = {};
  for (const [key, locator] of [
    ['project', activePage.getByRole('heading', { level: 1, name: 'Van bed utility cabinet' })],
    ['verdict', activePage.getByRole('heading', { name: '1 conflict to fix' })],
    ['conflict', activePage.getByText('Build depth exceeds the cleared space by 10 mm.')],
  ]) {
    const box = await locator.boundingBox();
    assert(box, `${key} must have a layout box`);
    result[key] = { ...box, inViewport: box.y < activePage.viewportSize().height && box.y + box.height > 0 };
    assert(result[key].inViewport, `${key} must appear in the first viewport`);
  }
  return result;
};

report.demo = {
  url: page.url(),
  firstViewport: await viewportEvidence(page),
  banner: await page.getByLabel('Demo mode').innerText(),
  repeatCtaCount: await page.getByRole('link', { name: /Try it with sample data/ }).count(),
  sampleName: await page.getByLabel('Project name').inputValue(),
  panelRows: await page.locator('tbody tr').count(),
  allowance: await page.locator('[data-stock-thickness="18"] .stock-area').innerText(),
};
assert.equal(report.demo.url, `${base}/?demo=1`);
assert.equal(report.demo.repeatCtaCount, 0);
assert.equal(report.demo.sampleName, 'Van bed utility cabinet');
assert(report.demo.panelRows >= 6);
assert.match(report.demo.allowance, /Panel area 5\.78 m² \+ 15% allowance \(0\.87 m²\) = 6\.65 m²\./);
await page.screenshot({ path: `${evidence}/demo-first-desktop.png` });

const diagram = page.getByRole('img', { name: /Front view of the fitted build/ });
report.diagram = { singular: await diagram.locator('desc').textContent() };
assert.equal(report.diagram.singular, 'The build is 1,350 by 800 mm with 1 centre support.');
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('2');
report.diagram.plural = await diagram.locator('desc').textContent();
assert.equal(report.diagram.plural, 'The build is 1,350 by 800 mm with 2 centre supports.');
await page.getByRole('button', { name: 'Reset demo' }).click();

await page.getByLabel('Build depth').fill('740.01');
await page.getByLabel('Units').selectOption('in');
const inchConflict = await page.getByText(/Build depth exceeds the cleared space by 0\.0004 in\./).isVisible();
await page.getByLabel('Units').selectOption('mm');
report.unitBoundary = {
  value: await page.getByLabel('Build depth').inputValue(),
  inchConflict,
  millimetreConflict: await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible(),
};
assert.deepEqual(report.unitBoundary, { value: '740.01', inchConflict: true, millimetreConflict: true });
await page.getByRole('button', { name: 'Reset demo' }).click();

await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('9');
report.countLimit = {
  ariaInvalid: await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).getAttribute('aria-invalid'),
  message: await page.getByText('Centre supports must be no more than 8.').isVisible(),
  supportRows: await page.getByRole('rowheader', { name: /^Centre support/ }).count(),
};
assert.deepEqual(report.countLimit, { ariaInvalid: 'true', message: true, supportRows: 0 });
await page.getByRole('button', { name: 'Reset demo' }).click();

await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await page.getByRole('heading', { name: 'Panel list' }).evaluate((element) => element.scrollIntoView({ block: 'center' }));
const bannerBox = await page.getByLabel('Demo mode').boundingBox();
assert(bannerBox && Math.round(bannerBox.y) === 0);
report.demo.stickyAtPanelList = {
  banner: bannerBox,
  resetVisible: await page.getByRole('button', { name: 'Reset demo' }).isVisible(),
  exitVisible: await page.getByRole('button', { name: 'Start for real' }).isVisible(),
};
assert(report.demo.stickyAtPanelList.resetVisible && report.demo.stickyAtPanelList.exitVisible);
await page.screenshot({ path: `${evidence}/demo-sticky-desktop.png` });

await page.getByRole('button', { name: 'Reset demo' }).click();
assert.equal(await page.getByLabel('Project name').inputValue(), 'Van bed utility cabinet');
assert(await page.getByRole('button', { name: 'Reset demo' }).evaluate((node) => node === document.activeElement));
await page.getByLabel('Project name').fill('Live demo edit');
report.demo.storageKeys = await page.evaluate(() => Object.keys(localStorage).sort());
assert.deepEqual(report.demo.storageKeys, ['demo:shop-fit-sheet:project:v1', 'shop-fit-sheet:project:v1']);
await page.getByRole('button', { name: 'Start for real' }).click();
assert.equal(await page.getByLabel('Project name').inputValue(), 'Live real project');
assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).sort()), ['shop-fit-sheet:project:v1']);

report.routes = {};
report.axe = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  report.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').innerText(),
    h1Count: await page.locator('h1').count(),
    mainCount: await page.locator('main').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    privacyLinks: await page.getByRole('link', { name: 'Privacy', exact: true }).count(),
    termsLinks: await page.getByRole('link', { name: 'Terms', exact: true }).count(),
  };
  assert.equal(report.routes[route].h1Count, 1);
  assert.equal(report.routes[route].mainCount, 1);
  assert(report.routes[route].canonical);
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe[route] = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').map(({ id, impact }) => ({ id, impact }));
  assert.deepEqual(report.axe[route], []);
}
assert.equal(report.routes['/does-not-exist'].h1, 'Page not found');
await page.screenshot({ path: `${evidence}/404.png` });

await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
report.history = { privacyUrl: page.url() };
assert.equal(report.history.privacyUrl, `${base}/privacy?demo=1`);
await page.goBack();
await page.waitForTimeout(100);
Object.assign(report.history, {
  focused: await page.locator('h1').evaluate((node) => node === document.activeElement),
  announcement: await page.locator('#route-status').innerText(),
});
assert(report.history.focused);
assert.equal(report.history.announcement, 'Page changed: Van bed utility cabinet');
report.privacy = {
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== base),
  errors: errors.filter((error) => !error.includes('status of 404')),
};
assert.deepEqual(report.privacy.offOrigin, []);
assert.deepEqual(report.privacy.errors, []);
await context.close();

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
const registration = await offlinePage.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  return { state: ready.active?.state, caches: await caches.keys() };
});
assert(registration.caches.includes('shop-fit-sheet-v9'));
await offlineContext.setOffline(true);
await offlinePage.reload();
report.offline = { registration, verdict: await offlinePage.locator('#verdict-title').innerText() };
assert.equal(report.offline.verdict, '1 conflict to fix');
await offlineContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
await mobile.goto(`${base}/`, { waitUntil: 'networkidle' });
await mobile.screenshot({ path: `${evidence}/cold-mobile.png` });
await mobile.getByRole('link', { name: /Try it with sample data/ }).click();
report.mobile = { firstViewport: await viewportEvidence(mobile) };
await mobile.screenshot({ path: `${evidence}/demo-first-mobile.png` });
await mobile.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await mobile.getByRole('heading', { name: 'Panel list' }).evaluate((element) => element.scrollIntoView({ block: 'center' }));
report.mobile.stickyBanner = await mobile.getByLabel('Demo mode').boundingBox();
assert(report.mobile.stickyBanner && Math.round(report.mobile.stickyBanner.y) === 0);
await mobile.screenshot({ path: `${evidence}/demo-sticky-mobile.png` });
report.mobile.undersizedTargets = await mobile.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
}).filter((target) => target.visible && (target.width < 44 || target.height < 44)));
assert.deepEqual(report.mobile.undersizedTargets, []);
await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; scrollTo(0, 0); });
report.mobile.text200 = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
assert.deepEqual(report.mobile.text200, { scrollWidth: 390, clientWidth: 390 });
await mobile.screenshot({ path: `${evidence}/mobile-text-200.png` });
await mobileContext.close();

await browser.close();
await writeFile(`${evidence}/live-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
