import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const report = { testedAt: new Date().toISOString(), base };

const localHtml = await readFile('dist/index.html');
const liveHtmlResponse = await fetch(`${base}/?identity=${Date.now()}`, { cache: 'no-store' });
const liveHtml = Buffer.from(await liveHtmlResponse.arrayBuffer());
const html = liveHtml.toString();
const scriptPath = html.match(/src="(\/assets\/main-[^"]+\.js)"/)?.[1];
const stylePath = html.match(/href="(\/assets\/main-[^"]+\.css)"/)?.[1];
if (!scriptPath || !stylePath) throw new Error('Live HTML did not contain the hashed app assets.');

const [localScript, localStyle, localWorker, liveScriptResponse, liveStyleResponse, liveWorkerResponse] = await Promise.all([
  readFile(`dist${scriptPath}`),
  readFile(`dist${stylePath}`),
  readFile('dist/sw.js'),
  fetch(`${base}${scriptPath}`, { cache: 'no-store' }),
  fetch(`${base}${stylePath}`, { cache: 'no-store' }),
  fetch(`${base}/sw.js`, { cache: 'no-store' }),
]);
const [liveScript, liveStyle, liveWorker] = await Promise.all([
  liveScriptResponse.arrayBuffer(), liveStyleResponse.arrayBuffer(), liveWorkerResponse.arrayBuffer(),
]);
report.identity = {
  html: { local: sha256(localHtml), live: sha256(liveHtml), matches: sha256(localHtml) === sha256(liveHtml) },
  script: { path: scriptPath, local: sha256(localScript), live: sha256(Buffer.from(liveScript)), matches: sha256(localScript) === sha256(Buffer.from(liveScript)) },
  style: { path: stylePath, local: sha256(localStyle), live: sha256(Buffer.from(liveStyle)), matches: sha256(localStyle) === sha256(Buffer.from(liveStyle)) },
  worker: { local: sha256(localWorker), live: sha256(Buffer.from(liveWorker)), matches: sha256(localWorker) === sha256(Buffer.from(liveWorker)) },
};

const policyRoutes = ['/', '/demo', '/privacy', '/terms', '/does-not-exist', scriptPath, '/sw.js'];
report.responses = {};
for (const route of policyRoutes) {
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

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const browserErrors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
page.on('pageerror', (error) => browserErrors.push(error.message));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
report.firstRead = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.hero-copy .lede').innerText(),
  action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
};
await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByLabel('Build depth').fill('740.01');
report.unitBoundary = {
  before: { value: await page.getByLabel('Build depth').inputValue(), verdict: await page.locator('#verdict-title').innerText(), conflict: await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible() },
};
await page.getByLabel('Units').selectOption('in');
report.unitBoundary.inches = { value: await page.getByLabel('Build depth').inputValue(), verdict: await page.locator('#verdict-title').innerText(), conflict: await page.getByText(/Build depth exceeds the cleared space by 0\.0004 in\./).isVisible() };
await page.getByLabel('Units').selectOption('mm');
report.unitBoundary.after = { value: await page.getByLabel('Build depth').inputValue(), verdict: await page.locator('#verdict-title').innerText(), conflict: await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible(), stored: await page.evaluate(() => JSON.parse(localStorage.getItem('demo:shop-fit-sheet:project:v1'))) };

await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('9');
report.countLimit = {
  value: await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).inputValue(),
  ariaInvalid: await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).getAttribute('aria-invalid'),
  error: await page.getByText('Centre supports must be no more than 8.').isVisible(),
  panelRows: await page.getByRole('rowheader', { name: /^Centre support/ }).count(),
  diagramLines: await page.locator('.cabinet-diagram line').count(),
};

await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByLabel('Project name').fill('Live demo navigation check');
await page.getByRole('link', { name: 'Planner', exact: true }).click();
report.demoNavigation = {
  url: page.url(),
  banner: await page.getByLabel('Demo mode').isVisible(),
  projectName: await page.getByLabel('Project name').inputValue(),
  realStorage: await page.evaluate(() => localStorage.getItem('shop-fit-sheet:project:v1')),
};

await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
report.routing = { privacyUrl: page.url(), privacyFocus: await page.evaluate(() => document.activeElement?.tagName) };
await page.goBack();
await page.waitForTimeout(100);
report.routing.backUrl = page.url();
report.routing.backFocus = await page.evaluate(() => document.activeElement?.tagName);
report.routing.backAnnouncement = await page.locator('#route-status').textContent();
await page.goForward();
await page.waitForTimeout(100);
report.routing.forwardFocus = await page.evaluate(() => document.activeElement?.tagName);
report.routing.forwardAnnouncement = await page.locator('#route-status').textContent();

await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
const registration = await page.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  await ready.update();
  return { active: ready.active?.state, waiting: ready.waiting?.state ?? null, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() };
});
await context.setOffline(true);
await page.reload();
report.offline = { registration, title: await page.title(), verdict: await page.locator('#verdict-title').innerText() };
await context.setOffline(false);

report.axe = {};
for (const route of ['/', '/demo', '/privacy', '/terms']) {
  await page.goto(`${base}${route}`);
  const result = await new AxeBuilder({ page }).analyze();
  report.axe[`desktop:${route}`] = result.violations.map(({ id, impact }) => ({ id, impact }));
}
report.network = { origins: [...new Set(requests.map((url) => new URL(url).origin))], offOrigin: requests.filter((url) => new URL(url).origin !== base), errors: browserErrors };
await context.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(`${base}/demo`, { waitUntil: 'networkidle' });
report.mobile = {
  normalOverflow: await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })),
  undersizedTargets: await mobilePage.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
    return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
  }).filter((target) => target.visible && (target.width < 44 || target.height < 44))),
};
for (const route of ['/', '/demo', '/privacy', '/terms']) {
  await mobilePage.goto(`${base}${route}`);
  const result = await new AxeBuilder({ page: mobilePage }).analyze();
  report.axe[`mobile:${route}`] = result.violations.map(({ id, impact }) => ({ id, impact }));
}
await mobilePage.goto(`${base}/demo`);
await mobilePage.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
report.mobile.text200 = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, nav: [...document.querySelectorAll('.site-header nav a')].map((element) => element.textContent?.trim()), demoActions: [...document.querySelectorAll('.demo-banner button')].map((element) => element.textContent?.trim()) }));
await mobileContext.close();

const keyboardContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const keyboardPage = await keyboardContext.newPage();
await keyboardPage.goto(`${base}/`);
await keyboardPage.keyboard.press('Tab');
report.keyboard = { firstFocus: await keyboardPage.evaluate(() => document.activeElement?.textContent?.trim()), outline: await keyboardPage.evaluate(() => getComputedStyle(document.activeElement).outline) };
await keyboardPage.keyboard.press('Enter');
report.keyboard.skipTarget = await keyboardPage.evaluate(() => `${document.activeElement?.tagName}#${document.activeElement?.id}`);
await keyboardContext.close();

const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${base}/demo`);
report.reducedMotion = await reducedPage.evaluate(() => ({ heroDuration: getComputedStyle(document.querySelector('.hero-copy')).animationDuration, resultDuration: getComputedStyle(document.querySelector('.result-slot > *')).animationDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
await reducedContext.close();
await browser.close();

await writeFile('.factory/evidence-repair/live-qa.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
