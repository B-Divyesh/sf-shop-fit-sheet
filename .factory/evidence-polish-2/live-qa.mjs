import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const evidence = '.factory/evidence-polish-2/live';
const report = { testedAt: new Date().toISOString(), base };
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const localHtml = await readFile('dist/index.html');
const liveHtmlResponse = await fetch(`${base}/`, { cache: 'no-store' });
const liveHtml = Buffer.from(await liveHtmlResponse.arrayBuffer());
const html = liveHtml.toString();
const scriptPath = html.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
assert(scriptPath && stylePath, 'Live HTML must contain fingerprinted JS and CSS.');

const localScript = await readFile(`dist${scriptPath}`);
const localStyle = await readFile(`dist${stylePath}`);
const localWorker = await readFile('dist/sw.js');
const liveScript = Buffer.from(await (await fetch(`${base}${scriptPath}`, { cache: 'no-store' })).arrayBuffer());
const liveStyle = Buffer.from(await (await fetch(`${base}${stylePath}`, { cache: 'no-store' })).arrayBuffer());
const liveWorker = Buffer.from(await (await fetch(`${base}/sw.js`, { cache: 'no-store' })).arrayBuffer());
report.identity = {
  html: sha256(localHtml) === sha256(liveHtml),
  script: sha256(localScript) === sha256(liveScript),
  style: sha256(localStyle) === sha256(liveStyle),
  worker: sha256(localWorker) === sha256(liveWorker),
  scriptPath,
  stylePath,
};
assert(Object.values(report.identity).slice(0, 4).every(Boolean), 'Live files must match dist.');

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
assert.match(report.responses['/'].csp ?? '', /frame-ancestors 'none'/);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  localStorage.clear();
  await Promise.all((await navigator.serviceWorker.getRegistrations()).map((registration) => registration.unregister()));
  await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
});
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: `${evidence}/cold-desktop.png`, fullPage: true });
report.firstScreen = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.hero-copy .lede').innerText(),
  actionHref: await page.getByRole('link', { name: /Try it with sample data/ }).getAttribute('href'),
  facts: await page.locator('.plain-facts li').allInnerTexts(),
};
assert.equal(report.firstScreen.h1, 'Check a fitted build before buying sheet material');
assert.equal(report.firstScreen.actionHref, '/?demo=1');
assert.equal(report.firstScreen.facts.length, 3);
assert.equal(await page.getByText(/\$9 project library|Buy the project library|One-time purchase/).count(), 0);

await page.getByLabel('Project name').fill('Live real project');
await page.getByRole('link', { name: /Try it with sample data/ }).click();
report.demo = {
  url: page.url(),
  banner: await page.getByLabel('Demo mode').innerText(),
  sampleName: await page.getByLabel('Project name').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
  conflict: await page.getByText('Build depth exceeds the cleared space by 10 mm.').isVisible(),
  panelRows: await page.locator('tbody tr').count(),
  allowance: await page.locator('[data-stock-thickness="18"] .stock-area').innerText(),
};
assert.equal(report.demo.url, `${base}/?demo=1`);
assert.match(report.demo.banner, /Demo\s+— sample data, nothing is saved/);
assert.equal(report.demo.sampleName, 'Van bed utility cabinet');
assert.equal(report.demo.verdict, '1 conflict to fix');
assert(report.demo.conflict && report.demo.panelRows >= 6);
assert.match(report.demo.allowance, /15% allowance/);

const diagram = page.getByRole('img', { name: /Front view of the fitted build/ });
report.diagram = { singular: await diagram.locator('desc').textContent() };
assert.equal(report.diagram.singular, 'The build is 1,350 by 800 mm with 1 centre support.');
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('2');
report.diagram.plural = await diagram.locator('desc').textContent();
assert.equal(report.diagram.plural, 'The build is 1,350 by 800 mm with 2 centre supports.');

await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByLabel('Project name').fill('Live demo edit');
await page.getByRole('link', { name: 'Planner', exact: true }).click();
report.demo.plannerUrl = page.url();
report.demo.storageKeys = await page.evaluate(() => Object.keys(localStorage).sort());
assert.match(report.demo.plannerUrl, /\?demo=1#planner$/);
assert.deepEqual(report.demo.storageKeys, ['demo:shop-fit-sheet:project:v1', 'shop-fit-sheet:project:v1']);
await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
assert.equal(await page.title(), 'Privacy — Shop Fit Sheet');
assert(await page.locator('h1').evaluate((node) => node === document.activeElement));
await page.goBack();
await page.waitForTimeout(100);
report.history = {
  url: page.url(),
  focused: await page.locator('h1').evaluate((node) => node === document.activeElement),
  announcement: await page.locator('#route-status').innerText(),
};
assert(report.history.focused);
assert.match(report.history.announcement, /^Page changed:/);
await page.getByRole('button', { name: 'Start for real' }).click();
report.demo.realName = await page.getByLabel('Project name').inputValue();
report.demo.keysAfterExit = await page.evaluate(() => Object.keys(localStorage).sort());
assert.equal(report.demo.realName, 'Live real project');
assert.deepEqual(report.demo.keysAfterExit, ['shop-fit-sheet:project:v1']);

report.routes = {};
report.axe = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  report.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    description: await page.locator('meta[name="description"]').getAttribute('content'),
    ogTitle: await page.locator('meta[property="og:title"]').getAttribute('content'),
    twitterTitle: await page.locator('meta[name="twitter:title"]').getAttribute('content'),
    privacyLinks: await page.getByRole('link', { name: 'Privacy', exact: true }).count(),
    termsLinks: await page.getByRole('link', { name: 'Terms', exact: true }).count(),
  };
  assert.equal(report.routes[route].h1, 1);
  assert.equal(report.routes[route].main, 1);
  assert(report.routes[route].canonical && report.routes[route].description);
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe[route] = axe.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id, impact }) => ({ id, impact }));
  assert.deepEqual(report.axe[route], []);
}

await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
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
  rows: await page.getByRole('rowheader', { name: /^Centre support/ }).count(),
};
assert.deepEqual(report.countLimit, { ariaInvalid: 'true', message: true, rows: 0 });

await page.getByRole('button', { name: 'Reset demo' }).click();
const registration = await page.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  }
  await ready.update();
  return { active: ready.active?.state, caches: await caches.keys() };
});
assert(registration.caches.includes('shop-fit-sheet-v8'));
await context.setOffline(true);
await page.reload();
report.offline = { registration, title: await page.title(), verdict: await page.locator('#verdict-title').innerText() };
assert.equal(report.offline.verdict, '1 conflict to fix');
await context.setOffline(false);
report.privacy = {
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== base),
  errors: errors.filter((error) => !error.includes('status of 404')),
  expected404ConsoleMessages: errors.filter((error) => error.includes('status of 404')),
};
assert.deepEqual(report.privacy.offOrigin, []);
assert.deepEqual(report.privacy.errors, []);
await context.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
await mobile.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
await mobile.screenshot({ path: `${evidence}/demo-mobile-390.png`, fullPage: true });
const normal = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
const undersizedTargets = await mobile.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
}).filter((target) => target.visible && (target.width < 44 || target.height < 44)));
await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
const text200 = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
report.mobile = { normal, undersizedTargets, text200 };
assert.deepEqual(normal, { scrollWidth: 390, clientWidth: 390 });
assert.deepEqual(undersizedTargets, []);
assert.deepEqual(text200, { scrollWidth: 390, clientWidth: 390 });
await mobileContext.close();

const keyboardContext = await browser.newContext();
const keyboard = await keyboardContext.newPage();
await keyboard.goto(`${base}/`);
await keyboard.keyboard.press('Tab');
report.keyboard = { firstFocus: await keyboard.evaluate(() => document.activeElement?.textContent?.trim()), outline: await keyboard.evaluate(() => getComputedStyle(document.activeElement).outline) };
await keyboard.keyboard.press('Enter');
report.keyboard.skipTarget = await keyboard.evaluate(() => `${document.activeElement?.tagName}#${document.activeElement?.id}`);
assert.equal(report.keyboard.firstFocus, 'Skip to main content');
assert.equal(report.keyboard.skipTarget, 'MAIN#main');
await keyboardContext.close();

const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
const reduced = await reducedContext.newPage();
await reduced.goto(`${base}/?demo=1`);
report.reducedMotion = await reduced.evaluate(() => ({
  animation: getComputedStyle(document.querySelector('.hero-copy')).animationDuration,
  scroll: getComputedStyle(document.documentElement).scrollBehavior,
}));
assert.equal(report.reducedMotion.scroll, 'auto');
await reducedContext.close();
await browser.close();

await writeFile('.factory/evidence-polish-2/live-qa.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
