import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const evidence = '.factory/verification-8-evidence/live';
await mkdir(evidence, { recursive: true });
const report = { testedAt: new Date().toISOString(), base };
const digest = (value) => createHash('sha256').update(value).digest('hex');

const liveHtml = Buffer.from(await (await fetch(`${base}/`, { cache: 'no-store' })).arrayBuffer());
const html = liveHtml.toString();
const scriptPath = html.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
assert(scriptPath && stylePath);

report.identity = {};
for (const [name, path] of Object.entries({ html: '/', script: scriptPath, style: stylePath, worker: '/sw.js' })) {
  const localPath = path === '/' ? 'dist/index.html' : `dist${path}`;
  const local = await readFile(localPath);
  const live = Buffer.from(await (await fetch(`${base}${path}`, { cache: 'no-store' })).arrayBuffer());
  report.identity[name] = {
    path,
    localSha256: digest(local),
    liveSha256: digest(live),
    byteMatch: digest(local) === digest(live),
  };
}

report.responses = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist', scriptPath, stylePath, '/sw.js']) {
  const response = await fetch(`${base}${route}`, { cache: 'no-store', redirect: 'manual' });
  report.responses[route] = {
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
report.firstRead = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.lede').innerText(),
  action: await page.getByRole('link', { name: /Try it with sample data/ }).innerText(),
  actionHref: await page.getByRole('link', { name: /Try it with sample data/ }).getAttribute('href'),
  outcome: await page.locator('.hero-actions > span').innerText(),
  facts: await page.locator('.plain-facts li').allInnerTexts(),
};

await page.keyboard.press('Tab');
const skipLink = page.getByRole('link', { name: 'Skip to main content' });
report.keyboard = {
  firstFocus: await skipLink.innerText(),
  outline: await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset };
  }),
};
await page.keyboard.press('Enter');
report.keyboard.skipTargetFocused = await page.locator('main').evaluate((element) => element === document.activeElement);

await page.getByRole('link', { name: /Try it with sample data/ }).click();
await page.waitForTimeout(100);
report.normalFlow = {
  project: await page.locator('h1').innerText(),
  verdict: await page.locator('#verdict-title').first().innerText(),
  conflict: await page.getByText('Build depth exceeds the cleared space by 10 mm.').isVisible(),
  panelRows: await page.locator('tbody tr').count(),
  allowance: await page.locator('[data-stock-thickness="18"] .stock-area').innerText(),
  demoBanner: await page.getByLabel('Demo mode').innerText(),
};
await page.screenshot({ path: `${evidence}/demo-desktop.png`, fullPage: true });

await page.getByLabel('Build depth').fill('740');
report.boundary = { exactFitConflictCount: await page.getByText(/Build depth exceeds/).count() };
await page.getByLabel('Build depth').fill('740.01');
report.boundary.overByPointZeroOne = await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible();

await page.getByLabel('Left').fill('-1');
report.invalidRecovery = {
  negativeMessage: await page.getByText('Clearances and gaps cannot be negative.').isVisible(),
};
await page.getByLabel('Left').fill('15');
report.invalidRecovery.negativeCleared = await page.getByText('Clearances and gaps cannot be negative.').count() === 0;
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1.5');
report.invalidRecovery.fractionMessage = await page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.').isVisible();
report.invalidRecovery.ariaInvalid = await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).getAttribute('aria-invalid');
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1');
report.invalidRecovery.fractionCleared = await page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.').count() === 0;

await page.getByRole('button', { name: 'Reset demo' }).click();
report.reset = {
  project: await page.getByLabel('Project name').inputValue(),
  focused: await page.getByRole('button', { name: 'Reset demo' }).evaluate((element) => element === document.activeElement),
};
await page.getByLabel('Project name').fill('Temporary sample');
report.storage = { keysInDemo: await page.evaluate(() => Object.keys(localStorage).sort()) };
await page.getByRole('button', { name: 'Start for real' }).click();
report.storage.keysAfterExit = await page.evaluate(() => Object.keys(localStorage).sort());

report.routes = {};
report.axe = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms', '/does-not-exist']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  report.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator('h1').allInnerTexts(),
    mainCount: await page.locator('main').count(),
    lang: await page.locator('html').getAttribute('lang'),
  };
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe[route] = axe.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id, impact }) => ({ id, impact }));
}

report.network = {
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== base),
  consoleErrors,
  pageErrors,
};
await context.close();

const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
await reducedPage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
report.reducedMotion = await reducedPage.locator('.demo-overview').evaluate((element) => {
  const root = getComputedStyle(document.documentElement);
  const style = getComputedStyle(element);
  return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, animationDuration: style.animationDuration, scrollBehavior: root.scrollBehavior };
});
await reduced.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
await mobile.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
report.mobile = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
report.mobile.targetsUnder44 = await mobile.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return { name: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
}).filter((item) => item.visible && (item.width < 44 || item.height < 44)));
await mobile.screenshot({ path: `${evidence}/demo-mobile-390.png`, fullPage: true });
await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
report.mobile.text200 = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));

const registration = await mobile.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  await ready.update();
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  return { activeState: ready.active?.state, scriptURL: ready.active?.scriptURL, caches: await caches.keys() };
});
await mobileContext.setOffline(true);
await mobile.reload();
report.pwa = { registration, offlineVerdict: await mobile.locator('#verdict-title').first().innerText() };
await mobileContext.close();
await browser.close();

await writeFile(`${evidence}/live-audit.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
