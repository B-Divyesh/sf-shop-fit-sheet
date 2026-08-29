import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = 'https://shop-fit-sheet.sociobot.in';
const report = { testedAt: new Date().toISOString(), base };
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

const rootResponse = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
report.browserResponse = {
  status: rootResponse?.status(),
  headers: await rootResponse?.allHeaders(),
};
report.firstViewport = {
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.lede').innerText(),
  primaryAction: await page.getByRole('link', { name: /Try it with sample data/ }).innerText(),
  actionVisible: await page.getByRole('link', { name: /Try it with sample data/ }).isVisible(),
};
await page.screenshot({ path: '.factory/evidence-6/cold-desktop.png', fullPage: false });

await page.getByRole('link', { name: /Try it with sample data/ }).click();
await page.waitForURL(/\?demo=1$/);
report.sample = {
  url: page.url(),
  banner: await page.getByLabel('Demo mode').innerText(),
  project: await page.getByLabel('Project name').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
  depthConflict: await page.getByText('Build depth exceeds the cleared space by 10 mm.').isVisible(),
  panelRows: await page.locator('tbody tr').count(),
  stock: await page.locator('[data-stock-thickness="18"]').innerText(),
};

await page.evaluate(() => { window.print = () => { document.body.dataset.printed = 'true'; }; });
await page.getByRole('button', { name: 'Print build sheet' }).click();
report.sample.printInvoked = await page.locator('body').getAttribute('data-printed');

await page.getByLabel('Build depth').fill('740');
report.exactBoundary = {
  value: await page.getByLabel('Build depth').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
  depthConflictCount: await page.getByText(/Build depth exceeds/).count(),
};

await page.getByLabel('Left').fill('-1');
report.invalidAndRecovery = {
  invalidValue: await page.getByLabel('Left').inputValue(),
  errorVisible: await page.getByText('Clearances and gaps cannot be negative.').isVisible(),
};
await page.getByRole('button', { name: 'Reset demo' }).click();
report.invalidAndRecovery.recoveredValue = await page.getByLabel('Left').inputValue();
report.invalidAndRecovery.recoveredVerdict = await page.locator('#verdict-title').innerText();

await page.getByLabel('Sheet width').fill('500');
report.stockOversize = {
  conflict: await page.getByText('Side at 800 × 750 mm does not fit the chosen stock sheet.').isVisible(),
  verdict: await page.locator('#verdict-title').innerText(),
};
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.screenshot({ path: '.factory/evidence-6/demo-desktop.png', fullPage: true });
await page.pdf({ path: '.factory/evidence-6/demo-build-sheet.pdf', format: 'A4', printBackground: true });

const internalLinks = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => link.href).filter((href) => new URL(href).origin === location.origin))]);
report.internalLinks = {};
for (const href of internalLinks) {
  const response = await context.request.get(href);
  report.internalLinks[href] = response.status();
}
report.network = {
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== base),
  errors,
};
await context.close();

const keyboardContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const keyboardPage = await keyboardContext.newPage();
await keyboardPage.goto(`${base}/`);
const focusTrail = [];
for (let i = 0; i < 10; i += 1) {
  await keyboardPage.keyboard.press('Tab');
  const current = await keyboardPage.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    tag: document.activeElement?.tagName,
    href: document.activeElement?.getAttribute('href'),
    outline: getComputedStyle(document.activeElement).outline,
  }));
  focusTrail.push(current);
  if (current.text?.includes('Try it with sample data')) {
    await keyboardPage.keyboard.press('Enter');
    break;
  }
}
await keyboardPage.waitForURL(/\?demo=1$/);
await keyboardPage.getByLabel('Build depth').focus();
await keyboardPage.keyboard.press('Control+A');
await keyboardPage.keyboard.type('735');
report.keyboardOnly = {
  focusTrail,
  demoUrlAfterEnter: keyboardPage.url(),
  editedValue: await keyboardPage.getByLabel('Build depth').inputValue(),
  verdictAfterTyping: await keyboardPage.locator('#verdict-title').innerText(),
  inputOutline: await keyboardPage.getByLabel('Build depth').evaluate((element) => getComputedStyle(element.parentElement).outline),
};
await keyboardContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: '.factory/evidence-6/demo-mobile-390.png', fullPage: true });
report.mobile = await mobilePage.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  verdictVisible: document.querySelector('#verdict-title')?.getBoundingClientRect().width > 0,
}));
await mobileContext.close();

await browser.close();
await writeFile('.factory/evidence-6/live-e2e.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
