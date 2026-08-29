import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';

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

test('regression: an unregistered checkout is neither advertised nor requested', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByText(/\$9/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /buy|checkout|project library/i })).toHaveCount(0);
  await page.getByLabel('Space width').fill('1000');
  await expect(page.getByLabel('Space width')).toHaveValue('1000');
  await page.goto('/privacy');
  await expect(page.getByText('This version makes no third-party requests.')).toBeVisible();
  expect(offOrigin).toEqual([]);
});

test('regression: release config fingerprints assets, caches them immutably, and preserves HTTP 404', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
    navigationFallback: { exclude: string[] };
    responseOverrides: Record<string, { rewrite: string }>;
  };
  const assetsRoute = config.routes.find((route) => route.route === '/assets/*');
  expect(assetsRoute?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(config.routes.filter((route) => route.rewrite === '/index.html').map((route) => route.route))
    .toEqual(['/demo', '/privacy', '/terms']);
  expect(config.navigationFallback.exclude).toContain('/*');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/index.html' });

  const assets = readdirSync('dist/assets');
  const appJs = assets.find((name) => /^app-[a-zA-Z0-9_-]+\.js$/.test(name));
  const appCss = assets.find((name) => /^app-[a-zA-Z0-9_-]+\.css$/.test(name));
  expect(appJs).toBeTruthy();
  expect(appCss).toBeTruthy();
  const serviceWorker = readFileSync('dist/sw.js', 'utf8');
  expect(serviceWorker).toContain(`/assets/${appJs}`);
  expect(serviceWorker).toContain(`/assets/${appCss}`);
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
