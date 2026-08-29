import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const output = '.factory/evidence-polish-1/live-qa.json';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const report = { testedAt: new Date().toISOString(), base };

const localHtml = await readFile('dist/index.html');
const liveHtmlResponse = await fetch(`${base}/`, { cache: 'no-store' });
const liveHtml = Buffer.from(await liveHtmlResponse.arrayBuffer());
const html = liveHtml.toString();
const scriptPath = html.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
if (!scriptPath || !stylePath) throw new Error('Live HTML does not contain the built assets.');

const localScript = await readFile(`dist${scriptPath}`);
const localStyle = await readFile(`dist${stylePath}`);
const localWorker = await readFile('dist/sw.js');
const liveScript = Buffer.from(await (await fetch(`${base}${scriptPath}`, { cache: 'no-store' })).arrayBuffer());
const liveStyle = Buffer.from(await (await fetch(`${base}${stylePath}`, { cache: 'no-store' })).arrayBuffer());
const liveWorker = Buffer.from(await (await fetch(`${base}/sw.js`, { cache: 'no-store' })).arrayBuffer());
report.identity = {
  html: { sha256: sha256(localHtml), matches: sha256(localHtml) === sha256(liveHtml) },
  script: { path: scriptPath, sha256: sha256(localScript), matches: sha256(localScript) === sha256(liveScript) },
  style: { path: stylePath, sha256: sha256(localStyle), matches: sha256(localStyle) === sha256(liveStyle) },
  worker: { sha256: sha256(localWorker), matches: sha256(localWorker) === sha256(liveWorker) },
};

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
  };
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
report.firstScreen = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.hero-copy .lede').innerText(),
  actionHref: await page.getByRole('link', { name: /Try it with sample data/ }).getAttribute('href'),
};
await page.getByRole('link', { name: /Try it with sample data/ }).click();
report.demo = {
  url: page.url(),
  banner: await page.getByLabel('Demo mode').innerText(),
  sampleName: await page.getByLabel('Project name').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
};
await page.getByLabel('Project name').fill('Live reset check');
await page.getByRole('button', { name: 'Reset demo' }).click();
report.demo.resetName = await page.getByLabel('Project name').inputValue();
report.demo.storageKeys = await page.evaluate(() => Object.keys(localStorage).sort());

await page.getByLabel('Build depth').fill('740.01');
await page.getByLabel('Units').selectOption('in');
const inchConflict = await page.getByText(/Build depth exceeds the cleared space by 0\.0004 in\./).isVisible();
await page.getByLabel('Units').selectOption('mm');
report.unitBoundary = {
  value: await page.getByLabel('Build depth').inputValue(),
  conflict: await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible(),
  inchConflict,
};
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('9');
report.countLimit = {
  ariaInvalid: await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).getAttribute('aria-invalid'),
  error: await page.getByText('Centre supports must be no more than 8.').isVisible(),
  outputRows: await page.getByRole('rowheader', { name: /^Centre support/ }).count(),
};
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByLabel('Project name').fill('Live navigation check');
await page.getByRole('link', { name: 'Planner', exact: true }).click();
report.demoNavigation = { url: page.url(), banner: await page.getByLabel('Demo mode').isVisible(), projectName: await page.getByLabel('Project name').inputValue() };
await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
await page.goBack();
await page.waitForTimeout(100);
report.history = { backUrl: page.url(), backFocus: await page.evaluate(() => document.activeElement?.tagName), announcement: await page.locator('#route-status').innerText() };

report.routes = {};
report.axe = {};
for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms']) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  report.routes[route] = {
    title: await page.title(),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    description: await page.locator('meta[name="description"]').getAttribute('content'),
    ogTitle: await page.locator('meta[property="og:title"]').getAttribute('content'),
    twitterTitle: await page.locator('meta[name="twitter:title"]').getAttribute('content'),
  };
  const axe = await new AxeBuilder({ page }).analyze();
  report.axe[route] = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').map(({ id, impact }) => ({ id, impact }));
}

await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
const registration = await page.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  await ready.update();
  return { active: ready.active?.state, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() };
});
await context.setOffline(true);
await page.reload();
report.offline = { registration, title: await page.title(), verdict: await page.locator('#verdict-title').innerText() };
await context.setOffline(false);
report.privacy = { origins: [...new Set(requests.map((url) => new URL(url).origin))], offOrigin: requests.filter((url) => new URL(url).origin !== base), errors };
await context.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
await mobile.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
const normal = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
const undersizedTargets = await mobile.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
  const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
  return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
}).filter((target) => target.visible && (target.width < 44 || target.height < 44)));
await mobile.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
const text200 = await mobile.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, demoButtons: [...document.querySelectorAll('.demo-banner button')].map((element) => element.textContent?.trim()) }));
report.mobile = { normal, undersizedTargets, text200 };
await mobileContext.close();

const keyboardContext = await browser.newContext();
const keyboard = await keyboardContext.newPage();
await keyboard.goto(`${base}/`);
await keyboard.keyboard.press('Tab');
report.keyboard = { firstFocus: await keyboard.evaluate(() => document.activeElement?.textContent?.trim()), outline: await keyboard.evaluate(() => getComputedStyle(document.activeElement).outline) };
await keyboard.keyboard.press('Enter');
report.keyboard.skipTarget = await keyboard.evaluate(() => `${document.activeElement?.tagName}#${document.activeElement?.id}`);
await keyboardContext.close();

const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
const reduced = await reducedContext.newPage();
await reduced.goto(`${base}/?demo=1`);
report.reducedMotion = await reduced.evaluate(() => ({ transition: getComputedStyle(document.querySelector('.primary-button')).transitionDuration, animation: getComputedStyle(document.querySelector('.hero-copy')).animationDuration, scroll: getComputedStyle(document.documentElement).scrollBehavior }));
await reducedContext.close();
await browser.close();

await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ identity: report.identity, firstScreen: report.firstScreen, demo: report.demo, responses: report.responses, privacy: report.privacy, offline: report.offline, mobile: report.mobile, keyboard: report.keyboard, reducedMotion: report.reducedMotion }, null, 2));
