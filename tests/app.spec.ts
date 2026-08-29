import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:conflict-check sample exposes the exact fit conflict', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await expect(page.getByText('Build depth exceeds the cleared space by 10 mm.')).toBeVisible();
  await page.getByLabel('Build depth').fill('735');
  await expect(page.getByRole('heading', { name: /Fits with 1 check/ })).toBeVisible();
});

test('@claim:panel-list calculates panels and invokes print', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'print', { value: () => document.body.dataset.printed = 'true' }); });
  await page.goto('/demo');
  const table = page.getByRole('table');
  await expect(table.getByRole('rowheader', { name: /Centre support/ })).toBeVisible();
  await expect(table.getByRole('rowheader', { name: /Back/ })).toBeVisible();
  await expect(page.getByText('3 × 1,220 × 2,440 mm sheet at 18 mm')).toBeVisible();
  await page.getByRole('button', { name: 'Print build sheet' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
});

test('@claim:calculated-parts sample calculates openings, doors, supports, shelves, and a back', async ({ page }) => {
  await page.goto('/demo');
  const results = page.locator('.result-slot');
  await expect(results.getByText('648 × 764 mm')).toBeVisible();
  await expect(results.getByText('670.5 × 794 mm')).toBeVisible();
  for (const part of ['Centre support', 'Shelf', 'Door', 'Back']) {
    await expect(results.getByRole('rowheader', { name: new RegExp(part) })).toBeVisible();
  }
});

test('@claim:stock-fit-check flags an oversize panel for the selected sheet', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Sheet width').fill('500');
  await expect(page.getByText('Side at 800 × 750 mm does not fit the chosen stock sheet.')).toBeVisible();
});

test('@claim:unit-conversion changes the displayed measurements to inches', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Build depth').fill('740');
  await page.getByLabel('Units').selectOption('in');
  await expect(page.getByLabel('Build depth')).toHaveValue('29.13');
  await expect(page.getByText(/All dimensions use inches/)).toBeVisible();
});

test('@claim:live-results updates the verdict without a submit action', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await page.getByLabel('Build depth').fill('735');
  await expect(page.getByRole('heading', { name: 'Fits with 1 check' })).toBeVisible();
});

test('@claim:demo-isolation keeps sample changes separate', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Project name').fill('My real garage bench');
  await page.goto('/demo');
  await expect(page.getByLabel('Project name')).toHaveValue('Van bed utility cabinet');
  await page.getByLabel('Project name').fill('Changed sample only');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel('Project name')).toHaveValue('My real garage bench');
});

test('@claim:demo-namespace saves demo edits under a separate browser-storage key', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Project name').fill('Demo storage check');
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toContain('demo:shop-fit-sheet:project:v1');
  expect(keys).not.toContain('shop-fit-sheet:project:v1');
  const demoValue = await page.evaluate(() => localStorage.getItem('demo:shop-fit-sheet:project:v1'));
  expect(demoValue).toContain('Demo storage check');
});

test('@claim:local-only keeps calculator traffic same-origin', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.goto('/demo');
  await page.getByLabel('Build width').fill('1340');
  const stored = await page.evaluate(() => localStorage.getItem('demo:shop-fit-sheet:project:v1'));
  expect(stored).toContain('1340');
  expect(offOrigin).toEqual([]);
  await expect(page.getByText('Shop Fit Sheet has no account, analytics, advertising, or tracking.')).not.toBeAttached();
  await page.goto('/privacy');
  await expect(page.getByText('Shop Fit Sheet has no account, analytics, advertising, or tracking.')).toBeVisible();
  expect(offOrigin).toEqual([]);
});

test('@claim:offline-reload reloads the demo without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
  });
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).includes('shop-fit-sheet-v5'))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await context.setOffline(false);
});

test('withdraws the unavailable paid offer and makes no billing request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByText(/\$9 project library|Buy the project library|One-time purchase/)).toHaveCount(0);
  await expect(page.getByText('Calculator and printable build sheet')).toBeVisible();
  await page.getByLabel('Space width').fill('1000');
  await expect(page.getByLabel('Space width')).toHaveValue('1000');
  expect(requests.some((url) => url.includes('api.sociobot.in'))).toBe(false);
});

test('mobile @regression:touch-targets gives every visible control a 44 px target', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression checks the required 390 px viewport.');
  await page.goto('/demo');
  const undersized = await page.locator('a, button, input, select, summary').evaluateAll((elements) => elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { name: element.getAttribute('aria-label') || element.textContent?.trim() || (element as HTMLInputElement).name || element.tagName, width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
    })
    .filter((target) => target.visible && (target.width < 44 || target.height < 44)));
  expect(undersized).toEqual([]);
});

test('ships hashed immutable assets and a styled HTTP 404 response', async ({ page }) => {
  await page.goto('/demo');
  const assetUrl = await page.locator('script[type="module"]').getAttribute('src');
  expect(assetUrl).toMatch(/^\/assets\/main-[a-zA-Z0-9_-]+\.js$/);
  const asset = await page.request.get(assetUrl!);
  expect(asset.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  const missing = await page.goto('/does-not-exist');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page is not on the sheet' })).toBeVisible();
  const config = JSON.parse(await readFile(join(process.cwd(), 'dist/staticwebapp.config.json'), 'utf8'));
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
});

test('routes have one h1, distinct titles, and no serious accessibility findings', async ({ page }, testInfo) => {
  const routes = new Map([
    ['/', 'Shop Fit Sheet — Check a fitted build'],
    ['/demo', 'Demo — Shop Fit Sheet'],
    ['/privacy', 'Privacy — Shop Fit Sheet'],
    ['/terms', 'Terms — Shop Fit Sheet'],
    ['/missing-page', 'Page not found — Shop Fit Sheet'],
  ]);
  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
      `${route} accessibility findings on ${testInfo.project.name}`).toEqual([]);
  }
});

test('demo has no console errors and every internal link resolves', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo');
  const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).href))]);
  for (const href of hrefs.filter((href) => new URL(href).origin === 'http://127.0.0.1:4173')) {
    const response = await page.request.get(href);
    expect(response.ok(), href).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('calculator has an empty state and keyboard-reachable controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Your panel list appears after you enter the space and build sizes.')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Skip to main content' }).press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('editing after load keeps the print action working', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'print', { value: () => document.body.dataset.printed = 'true' }); });
  await page.goto('/demo');
  await page.getByLabel('Build width').fill('1340');
  await page.getByRole('button', { name: 'Print build sheet' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
});

test('invalid measurements explain what to fix', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Left').fill('-1');
  await expect(page.getByText('Clearances and gaps cannot be negative.')).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1.5');
  await expect(page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.')).toBeVisible();
});
