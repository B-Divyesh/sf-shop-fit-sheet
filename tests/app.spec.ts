import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:conflict-check sample exposes the exact fit conflict', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await expect(page.getByText('Build depth exceeds the cleared space by 10 mm.')).toBeVisible();
  await page.getByLabel('Build depth').fill('735');
  await expect(page.getByRole('heading', { name: /Fits with 1 check/ })).toBeVisible();
});

test('@claim:panel-list calculates panels and invokes print', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'print', { value: () => document.body.dataset.printed = 'true' }); });
  await page.goto('/?demo=1');
  const table = page.getByRole('table');
  await expect(table.getByRole('rowheader', { name: /Centre support/ })).toBeVisible();
  await expect(table.getByRole('rowheader', { name: /Back/ })).toBeVisible();
  await expect(page.getByText('3 × 1,220 × 2,440 mm sheet at 18 mm')).toBeVisible();
  await page.getByRole('button', { name: 'Print build sheet' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
});

test('@claim:sheet-area-allowance adds 15% to each material total before counting sheets', async ({ page }) => {
  await page.goto('/?demo=1');
  const estimate = page.locator('[data-stock-thickness="18"]');
  await expect(estimate).toContainText('3 × 1,220 × 2,440 mm sheet at 18 mm');
  const detail = await estimate.locator('.stock-area').textContent();
  const match = detail?.match(/Panel area ([\d.]+) m² \+ 15% allowance \(([\d.]+) m²\) = ([\d.]+) m²\./);
  expect(match, `Unexpected 18 mm allowance detail: ${detail}`).not.toBeNull();
  const [, shownPanelArea, shownAllowance, shownTotal] = match!;
  const panelAreaFromVisibleRows = await page.locator('tbody tr').evaluateAll((rows) => rows
    .map((row) => {
      const cells = row.querySelectorAll<HTMLElement>('th, td');
      const dimensions = cells[2]?.textContent?.match(/([\d,.]+) × ([\d,.]+)/);
      return {
        quantity: Number(cells[1]?.textContent),
        length: Number(dimensions?.[1]?.replaceAll(',', '')),
        width: Number(dimensions?.[2]?.replaceAll(',', '')),
        thickness: Number(cells[3]?.textContent),
      };
    })
    .filter((piece) => piece.thickness === 18)
    .reduce((area, piece) => area + piece.quantity * piece.length * piece.width, 0));
  const expectedPanelArea = panelAreaFromVisibleRows / 1_000_000;
  const tolerance = 0.005; // Values shown to two decimals, in square metres.
  expect(Math.abs(Number(shownPanelArea) - expectedPanelArea)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(Number(shownAllowance) - expectedPanelArea * 0.15)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(Number(shownTotal) - (expectedPanelArea * 1.15))).toBeLessThanOrEqual(tolerance);
});

test('@claim:calculated-parts sample calculates openings, doors, supports, shelves, and a back', async ({ page }) => {
  await page.goto('/?demo=1');
  const results = page.locator('.result-slot');
  await expect(results.getByText('648 × 764 mm')).toBeVisible();
  await expect(results.getByText('670.5 × 794 mm')).toBeVisible();
  for (const part of ['Centre support', 'Shelf', 'Door', 'Back']) {
    await expect(results.getByRole('rowheader', { name: new RegExp(part) })).toBeVisible();
  }
});

test('@claim:stock-fit-check flags an oversize panel for the selected sheet', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByLabel('Sheet width').fill('500');
  await expect(page.getByText('Side at 800 × 750 mm does not fit the chosen stock sheet.')).toBeVisible();
});

test('@claim:unit-conversion preserves a boundary conflict through a unit round trip', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByLabel('Build depth').fill('740.01');
  await expect(page.getByText('Build depth exceeds the cleared space by 0.01 mm.')).toBeVisible();
  await page.getByLabel('Units').selectOption('in');
  await expect(page.getByLabel('Build depth')).toHaveValue('29.13');
  await expect(page.getByText(/All dimensions use inches/)).toBeVisible();
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await expect(page.getByText(/Build depth exceeds the cleared space by 0\.0004 in\./)).toBeVisible();
  await page.getByLabel('Units').selectOption('mm');
  await expect(page.getByLabel('Build depth')).toHaveValue('740.01');
  await expect(page.getByText('Build depth exceeds the cleared space by 0.01 mm.')).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:shop-fit-sheet:project:v1') ?? '{}'));
  expect(stored).toMatchObject({ schemaVersion: 2, displayUnit: 'mm', canonicalProject: { unit: 'mm', outerDepth: 740.01 } });
});

test('@claim:live-results updates the verdict without a submit action', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: '1 conflict to fix' })).toBeVisible();
  await page.getByLabel('Build depth').fill('735');
  await expect(page.getByRole('heading', { name: 'Fits with 1 check' })).toBeVisible();
});

test('@claim:demo-isolation keeps sample changes separate', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Project name').fill('My real garage bench');
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Project name')).toHaveValue('Van bed utility cabinet');
  await page.getByLabel('Project name').fill('Changed sample only');
  await page.getByRole('link', { name: 'Planner', exact: true }).click();
  await expect(page).toHaveURL(/\?demo=1#planner$/);
  await expect(page.getByLabel('Demo mode')).toBeVisible();
  await expect(page.getByLabel('Project name')).toHaveValue('Changed sample only');
  expect(await page.evaluate(() => localStorage.getItem('shop-fit-sheet:project:v1'))).toContain('My real garage bench');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel('Project name')).toHaveValue('My real garage bench');
});

test('@claim:demo-namespace saves demo edits under a separate browser-storage key', async ({ page }) => {
  await page.goto('/?demo=1');
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
  await page.goto('/?demo=1');
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
  await page.goto('/?demo=1');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
  });
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).includes('shop-fit-sheet-v8'))).toBe(true);
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

test('@regression:first-screen-copy names sheet material and opens the isolated query demo in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check a fitted build before buying sheet material');
  const demoLink = page.getByRole('link', { name: /Try it with sample data/ });
  await expect(demoLink).toHaveAttribute('href', '/?demo=1');
  await demoLink.click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved.');
  await expect(page.getByLabel('Project name')).toHaveValue('Van bed utility cabinet');
  await page.getByLabel('Project name').fill('Temporary sample edit');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Project name')).toHaveValue('Van bed utility cabinet');
  expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual(['demo:shop-fit-sheet:project:v1']);
});

test('@regression:diagram-support-grammar describes one and multiple centre supports correctly', async ({ page }) => {
  await page.goto('/?demo=1');
  const diagram = page.getByRole('img', { name: /Front view of the fitted build/ });
  await expect(diagram.locator('desc')).toHaveText('The build is 1,350 by 800 mm with 1 centre support.');

  await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('2');
  await expect(diagram.locator('desc')).toHaveText('The build is 1,350 by 800 mm with 2 centre supports.');
});

test('mobile @regression:touch-targets gives every visible control a 44 px target', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression checks the required 390 px viewport.');
  await page.goto('/?demo=1');
  const undersized = await page.locator('a, button, input, select, summary').evaluateAll((elements) => elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { name: element.getAttribute('aria-label') || element.textContent?.trim() || (element as HTMLInputElement).name || element.tagName, width: rect.width, height: rect.height, visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 };
    })
    .filter((target) => target.visible && (target.width < 44 || target.height < 44)));
  expect(undersized).toEqual([]);
});

test('mobile @regression:text-resize reflows navigation and controls at 200% text', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression checks the required 390 px viewport.');
  await page.goto('/?demo=1');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.getByRole('link', { name: 'Shop Fit Sheet' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Planner', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  const layout = await page.evaluate(() => {
    const targets = [...document.querySelectorAll<HTMLElement>('.site-header a, .demo-banner button')]
      .map((element) => ({ label: element.textContent?.trim(), rect: element.getBoundingClientRect() }));
    const outsideViewport = targets.filter(({ rect }) => rect.left < 0 || rect.right > innerWidth);
    const overlap = targets.some((target, index) => targets.slice(index + 1).some((other) => (
      target.rect.left < other.rect.right && target.rect.right > other.rect.left
      && target.rect.top < other.rect.bottom && target.rect.bottom > other.rect.top
    )));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      outsideViewport: outsideViewport.map(({ label }) => label),
      overlap,
    };
  });
  expect(layout).toEqual({ scrollWidth: 390, clientWidth: 390, outsideViewport: [], overlap: false });
});

test('@regression:count-maxima rejects counts beyond every rendered limit', async ({ page }) => {
  await page.goto('/?demo=1');
  const cases = [
    { label: 'Centre supports', max: 8, finding: 'Centre supports must be no more than 8.', row: 'Centre support' },
    { label: 'Shelves total', max: 30, finding: 'Shelves must be no more than 30.', row: 'Shelf' },
    { label: 'Doors', max: 12, finding: 'Doors must be no more than 12.', row: 'Door' },
  ];
  for (const item of cases) {
    const input = page.getByRole('spinbutton', { name: item.label, exact: true });
    const original = await input.inputValue();
    await input.fill(String(item.max + 1));
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText(item.finding)).toBeVisible();
    await expect(page.getByRole('rowheader', { name: new RegExp(`^${item.row}`) })).toHaveCount(0);
    if (item.label === 'Centre supports') await expect(page.locator('.cabinet-diagram line')).toHaveCount(0);
    await input.fill(original);
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  }
});

test('@regression:history-focus focuses and announces routes on Back and Forward', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL(/\/privacy\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Page changed: Check a fitted build before buying sheet material');
  await page.goForward();
  await expect(page).toHaveURL(/\/privacy\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Page changed: Your plan stays in your browser');
});

test('ships hashed immutable assets and a styled HTTP 404 response', async ({ page }) => {
  await page.goto('/?demo=1');
  const assetUrl = await page.locator('script[type="module"]').getAttribute('src');
  expect(assetUrl).toMatch(/^\/assets\/(?:app|main)-[a-zA-Z0-9_-]+\.js$/);
  const asset = await page.request.get(assetUrl!);
  expect(asset.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  const missing = await page.goto('/does-not-exist');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page is not on the sheet' })).toBeVisible();
  const config = JSON.parse(await readFile(join(process.cwd(), 'dist/staticwebapp.config.json'), 'utf8'));
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  for (const output of ['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404.html']) {
    const html = await readFile(join(process.cwd(), 'dist', output), 'utf8');
    expect(html, output).not.toContain('__SOCIAL_IMAGE__');
    expect(html, output).toMatch(/https:\/\/shop-fit-sheet\.sociobot\.in\/assets\/social-[a-zA-Z0-9_-]+\.webp/);
    for (const metadata of ['description', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(html, `${output}: ${metadata}`).toContain(`name="${metadata}"`);
    }
    for (const metadata of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
      expect(html, `${output}: ${metadata}`).toContain(`property="${metadata}"`);
    }
  }
});

test('routes have one h1, distinct titles, and no serious accessibility findings', async ({ page }, testInfo) => {
  const routes = new Map([
    ['/', 'Shop Fit Sheet — Check a fitted build'],
    ['/?demo=1', 'Demo — Shop Fit Sheet'],
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
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/shop-fit-sheet\.sociobot\.in\//);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /^https:\/\/shop-fit-sheet\.sociobot\.in\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^http:\/\/127\.0\.0\.1:4173\/assets\/social-.+\.webp$/);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^http:\/\/127\.0\.0\.1:4173\/assets\/social-.+\.webp$/);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
      `${route} accessibility findings on ${testInfo.project.name}`).toEqual([]);
  }
});

test('demo has no console errors and every internal link resolves', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?demo=1');
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
  await page.goto('/?demo=1');
  await page.getByLabel('Build width').fill('1340');
  await page.getByRole('button', { name: 'Print build sheet' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
});

test('invalid measurements explain what to fix', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByLabel('Left').fill('-1');
  await expect(page.getByText('Clearances and gaps cannot be negative.')).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Centre supports', exact: true }).fill('1.5');
  await expect(page.getByText('Supports, shelves, and doors must use whole numbers of zero or more.')).toBeVisible();
});
