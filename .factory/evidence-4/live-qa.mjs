import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://shop-fit-sheet.sociobot.in';
const browser = await chromium.launch();
const report = { testedAt: new Date().toISOString(), base };

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

const rootResponse = await page.goto(base + '/', { waitUntil: 'networkidle' });
report.firstRead = {
  status: rootResponse?.status(),
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  audience: await page.locator('.hero-copy .lede').innerText(),
  action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
  actionHref: await page.getByRole('link', { name: 'Try it with sample data' }).getAttribute('href'),
  outcome: await page.getByText('See a filled plan and its conflicts.').innerText(),
};

await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.waitForLoadState('networkidle');
report.demo = {
  url: page.url(),
  banner: await page.locator('.demo-banner').innerText(),
  initialVerdict: await page.locator('#verdict-title').innerText(),
  initialConflict: await page.getByText('Build depth exceeds the cleared space by 10 mm.').isVisible(),
  storageBeforeEdit: await page.evaluate(() => Object.keys(localStorage).sort()),
};

await page.getByLabel('Project name').fill('Independent demo check');
await page.getByLabel('Build depth').fill('740');
report.boundaryExact = {
  value: await page.getByLabel('Build depth').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
  depthConflictCount: await page.getByText(/Build depth exceeds/).count(),
};
await page.getByLabel('Build depth').fill('740.01');
report.boundaryOver = {
  value: await page.getByLabel('Build depth').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
  conflict: await page.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible(),
};

await page.getByLabel('Left').fill('-1');
report.invalidClearance = {
  shown: await page.getByText('Clearances and gaps cannot be negative.').isVisible(),
};
await page.getByLabel('Left').fill('15');
report.invalidClearance.recovered = (await page.getByText('Clearances and gaps cannot be negative.').count()) === 0;

await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1.5');
report.invalidCount = {
  shown: await page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.').isVisible(),
};
await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1');
report.invalidCount.recovered = (await page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.').count()) === 0;

await page.getByLabel('Panel thickness').fill('0');
report.invalidRequired = {
  shown: await page.getByText('Enter positive space, build, panel, and stock measurements.').isVisible(),
};
await page.getByLabel('Panel thickness').fill('18');
report.invalidRequired.recovered = (await page.getByText('Enter positive space, build, panel, and stock measurements.').count()) === 0;

await page.getByLabel('Include a back panel').uncheck();
report.optionalBack = {
  removed: (await page.getByRole('rowheader', { name: 'Back' }).count()) === 0,
};
await page.getByLabel('Include a back panel').check();
report.optionalBack.restored = await page.getByRole('rowheader', { name: 'Back' }).isVisible();

await page.getByLabel('Build depth').fill('740');
await page.getByLabel('Units').selectOption('in');
const inches = await page.getByLabel('Build depth').inputValue();
await page.getByLabel('Units').selectOption('mm');
report.unitRoundTrip = {
  inches,
  millimetresAfterRoundTrip: await page.getByLabel('Build depth').inputValue(),
};

report.demo.storageAfterEdit = await page.evaluate(() => ({
  keys: Object.keys(localStorage).sort(),
  demo: localStorage.getItem('demo:shop-fit-sheet:project:v1'),
  real: localStorage.getItem('shop-fit-sheet:project:v1'),
}));

await page.getByRole('button', { name: 'Reset demo' }).click();
report.demo.afterReset = {
  projectName: await page.getByLabel('Project name').inputValue(),
  verdict: await page.locator('#verdict-title').innerText(),
};

await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
await page.waitForTimeout(100);
report.routing = {
  privacyUrl: page.url(),
  privacyFocus: await page.evaluate(() => document.activeElement?.tagName + '#' + (document.activeElement?.id || '')),
};
await page.goBack();
await page.waitForTimeout(100);
report.routing.afterBackUrl = page.url();
report.routing.afterBackFocus = await page.evaluate(() => document.activeElement?.tagName + '#' + (document.activeElement?.id || ''));
report.routing.afterBackH1Focused = await page.locator('h1').evaluate((element) => element === document.activeElement);

const keyboardPage = await context.newPage();
await keyboardPage.goto(base + '/');
await keyboardPage.keyboard.press('Tab');
report.keyboard = {
  firstFocusText: await keyboardPage.evaluate(() => document.activeElement?.textContent?.trim()),
  firstFocusStyle: await keyboardPage.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return { outline: style.outline, outlineOffset: style.outlineOffset };
  }),
};
await keyboardPage.keyboard.press('Enter');
report.keyboard.skipTarget = await keyboardPage.evaluate(() => document.activeElement?.tagName + '#' + (document.activeElement?.id || ''));
const tabSequence = [];
for (let i = 0; i < 20; i += 1) {
  await keyboardPage.keyboard.press('Tab');
  tabSequence.push(await keyboardPage.evaluate(() => {
    const element = document.activeElement;
    return { tag: element?.tagName, text: element?.textContent?.trim().slice(0, 60), id: element?.id || null };
  }));
}
report.keyboard.firstTwentyTabs = tabSequence;
await keyboardPage.close();

const limitPage = await context.newPage();
await limitPage.goto(base + '/demo');
await limitPage.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('9');
report.upperBoundInput = {
  value: await limitPage.getByRole('spinbutton', { name: 'Centre supports', exact: true }).inputValue(),
  declaredMax: await limitPage.getByRole('spinbutton', { name: 'Centre supports', exact: true }).getAttribute('max'),
  browserRangeOverflow: await limitPage.getByRole('spinbutton', { name: 'Centre supports', exact: true }).evaluate((element) => element.validity.rangeOverflow),
  appErrorShown: (await limitPage.getByText(/supports.*must|centre supports.*maximum|too many supports/i).count()) > 0,
  panelQuantity: await limitPage.getByRole('rowheader', { name: 'Centre support' }).locator('xpath=following-sibling::td[1]').innerText(),
  diagramSupportLines: await limitPage.locator('.cabinet-diagram line').count(),
};
await limitPage.close();

const conversionPage = await context.newPage();
await conversionPage.goto(base + '/demo');
await conversionPage.getByRole('button', { name: 'Reset demo' }).click();
await conversionPage.getByLabel('Build depth').fill('740.01');
report.unitBoundary = {
  before: {
    value: await conversionPage.getByLabel('Build depth').inputValue(),
    verdict: await conversionPage.locator('#verdict-title').innerText(),
    conflict: await conversionPage.getByText('Build depth exceeds the cleared space by 0.01 mm.').isVisible(),
  },
};
await conversionPage.getByLabel('Units').selectOption('in');
report.unitBoundary.inches = {
  value: await conversionPage.getByLabel('Build depth').inputValue(),
  verdict: await conversionPage.locator('#verdict-title').innerText(),
  conflictCount: await conversionPage.getByText(/Build depth exceeds/).count(),
};
await conversionPage.getByLabel('Units').selectOption('mm');
report.unitBoundary.after = {
  value: await conversionPage.getByLabel('Build depth').inputValue(),
  spaceDepth: await conversionPage.getByLabel('Space depth').inputValue(),
  rearClearance: await conversionPage.getByLabel('Behind').inputValue(),
  verdict: await conversionPage.locator('#verdict-title').innerText(),
  conflictCount: await conversionPage.getByText(/Build depth exceeds/).count(),
};
await conversionPage.close();

const plannerNavPage = await context.newPage();
await plannerNavPage.goto(base + '/demo');
await plannerNavPage.getByRole('link', { name: 'Planner', exact: true }).click();
await plannerNavPage.waitForLoadState('networkidle');
report.demoPlannerNavigation = {
  url: plannerNavPage.url(),
  demoBannerCount: await plannerNavPage.locator('.demo-banner').count(),
  projectName: await plannerNavPage.getByLabel('Project name').inputValue(),
};
await plannerNavPage.close();

const persistencePage = await context.newPage();
await persistencePage.goto(base + '/');
await persistencePage.getByLabel('Project name').fill('Persistent real project');
await persistencePage.reload();
report.realPersistence = {
  projectNameAfterReload: await persistencePage.getByLabel('Project name').inputValue(),
  storageKeys: await persistencePage.evaluate(() => Object.keys(localStorage).sort()),
};
await persistencePage.close();

report.network = {
  total: requests.length,
  origins: [...new Set(requests.map((url) => new URL(url).origin))],
  offOrigin: requests.filter((url) => new URL(url).origin !== new URL(base).origin),
  consoleErrors,
};

await context.close();

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(base + '/demo');
report.reducedMotion = await reducedPage.evaluate(() => {
  const hero = getComputedStyle(document.querySelector('.hero-copy'));
  const result = getComputedStyle(document.querySelector('.result-slot > *'));
  return {
    heroAnimationDuration: hero.animationDuration,
    resultAnimationDuration: result.animationDuration,
    htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  };
});
await reducedContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
const mobileErrors = [];
mobilePage.on('console', (message) => {
  if (message.type() === 'error') mobileErrors.push(message.text());
});
mobilePage.on('pageerror', (error) => mobileErrors.push(error.message));
await mobilePage.goto(base + '/', { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: '.factory/evidence-4/mobile-cold.png', fullPage: false });
const mobileFirstScreenTexts = await mobilePage.locator('h1, .hero-copy .lede, .hero-action, .hero-facts').allInnerTexts();
await mobilePage.goto(base + '/demo', { waitUntil: 'networkidle' });
await mobilePage.screenshot({ path: '.factory/evidence-4/mobile-demo.png', fullPage: true });
report.mobile = {
  viewport: await mobilePage.evaluate(() => ({ width: innerWidth, height: innerHeight })),
  firstScreenTexts: mobileFirstScreenTexts,
  overflow: await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })),
  undersizedTargets: await mobilePage.locator('a, button, input, select, summary').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { name: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name') || element.tagName, width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
  }).filter((target) => target.visible && (target.width < 44 || target.height < 44))),
  consoleErrors: mobileErrors,
};

await mobilePage.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
await mobilePage.screenshot({ path: '.factory/evidence-4/mobile-text-200.png', fullPage: false });
report.mobile.textAt200Percent = await mobilePage.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  printButtonVisible: Boolean(document.querySelector('[data-action="print"]')?.getBoundingClientRect().width),
}));

const registration = await mobilePage.evaluate(async () => {
  const ready = await navigator.serviceWorker.ready;
  await ready.update();
  return {
    scope: ready.scope,
    active: ready.active?.state,
    waiting: ready.waiting?.state || null,
    controller: navigator.serviceWorker.controller?.scriptURL || null,
    caches: await caches.keys(),
  };
});
await mobileContext.setOffline(true);
await mobilePage.reload();
report.pwa = {
  registration,
  offlineReloadVerdict: await mobilePage.locator('#verdict-title').innerText(),
  offlineTitle: await mobilePage.title(),
};
await mobileContext.setOffline(false);
await mobileContext.close();

await browser.close();
const serialized = JSON.stringify(report, null, 2);
await writeFile('.factory/evidence-4/live-qa.json', serialized + '\n');
console.log(serialized);
