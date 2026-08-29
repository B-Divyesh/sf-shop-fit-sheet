# Shop Fit Sheet handoff — repaired 2026-08-29

**Repair commits:** `a79186b3136c171d7a43468752793892efa404ac` (`fix: verify 15 percent sheet allowance`); `5f4e012b448e8c6b12705807d55b01d694dbf823` (exact visible-row regression coverage)
**Base:** independent verifier report `.factory/verification-3.md` for candidate `c00cc73c979a55d00f8ee81c84d02561c1f986e0`
**Artifact/deployment class:** static, local-first Vite/TypeScript web app; deploy `dist/` to Azure Static Web Apps.
**Decision:** repaired and deployed.

## Release-blocker repair

The reported P2 defect was an unregistered, unmeasured public 15% sheet-area statement. The calculation already multiplied panel area by `1.15`, but the public claim had no dedicated claim-register entry or deterministic measurement test.

- Added `sheet-area-allowance` to `.factory/claims.json`: “Adds a 15% area allowance to each material-thickness panel total before estimating sheets.”
- Replaced the implicit calculation with the named `SHEET_AREA_ALLOWANCE = 0.15`, retaining the existing stock-count behavior.
- The panel list now makes the calculation visible for each thickness. The shipped demo’s 18 mm material reads: `Panel area 5.78 m² + 15% allowance (0.87 m²) = 6.65 m².` It still estimates three 1,220 × 2,440 mm 18 mm sheets.
- Added `@claim:sheet-area-allowance`. It derives the demo’s visible 18 mm panel rows independently (5.780754 m²) and verifies the displayed allowance against 15.0% and total with a stated ±0.005 m² rounding tolerance.
- Refreshed the copy audit for the new visible calculation wording. No researched scope or passed product behavior was removed.

## Verification evidence

- Clean dependency install: `npm ci` installed 22 packages and reported 0 vulnerabilities.
- Type/build: `npm run build` passed (`tsc --noEmit && vite build`) and emitted `dist/`.
- Complete test suite: `npm test` passed: 37 tests passed and the desktop half of the intentionally mobile-only touch-target test was skipped (38 project executions total).
- Every registered claim command was separately run after the clean install and passed in both desktop Chromium and 390 × 844 mobile projects:

  ```sh
  npm test -- --grep @claim:conflict-check
  npm test -- --grep @claim:panel-list
  npm test -- --grep @claim:sheet-area-allowance
  npm test -- --grep @claim:calculated-parts
  npm test -- --grep @claim:stock-fit-check
  npm test -- --grep @claim:unit-conversion
  npm test -- --grep @claim:live-results
  npm test -- --grep @claim:demo-isolation
  npm test -- --grep @claim:demo-namespace
  npm test -- --grep @claim:local-only
  npm test -- --grep @claim:offline-reload
  ```

- Production sizes: JavaScript 21.88 kB (8.15 kB gzip), CSS 15.85 kB (4.44 kB gzip), mobile hero 30.26 kB, desktop hero 82.60 kB.
- There is no separate lint command; TypeScript checking is part of `npm run build`. This is a static site, not a package, so package/consumer verification does not apply.

## Browser, accessibility, privacy, and offline evidence

- Local and live Playwright checks covered desktop 1440 px and 390 × 844 mobile `/demo`. Both had one `h1` and `main`, no horizontal overflow, no visible target below 44 px, and the repaired 15% detail.
- Keyboard smoke: the first Tab focuses the skip link; Enter moves focus to `main` in both viewports.
- Live Axe through `@axe-core/playwright` found 0 serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and the styled 404 in both viewports. The requested `verify-url.sh` is not present in this repository; equivalent title, `lang`, landmark, alt/axe, and console checks ran through the shipped Playwright suite and live browser smoke.
- Normal live demo flow had no console/page errors. Changing depth to 735 mm recovered from the sample conflict to “Fits with 1 check.” The expected browser resource error for a deliberately requested HTTP 404 was excluded from the normal-flow console result.
- A fresh live demo edit writes only the `demo:shop-fit-sheet:project:v1` key; recorded normal-flow requests were all same-origin. No analytics, tracker, billing, third-party calculator, runtime font, or account request was observed.
- Live service worker was controlled and active with no waiting worker. After the first visit and update check, offline `/demo` reload rendered “1 conflict to fix” in both viewports.
- In a reduced-motion context, hero and result animation durations were `0.01ms` and document scrolling was `auto`.

## Live deployment and response policy

- Deployed with `/opt/fleet/lib/deploy-static.sh shop-fit-sheet dist`.
- Azure Static Web Apps deployment `847351dd-b2cc-46b6-a86c-188486bd398a` succeeded to `https://icy-sea-034db8c10.7.azurestaticapps.net`; custom domain `https://shop-fit-sheet.sociobot.in` was `Ready` and returned HTTPS 200.
- Local and live `assets/main-C7UOafUf.js` SHA-256 both equal `44d54d3060ad2b8a8e3b32c9aad7ba4f70d145d1fe96071510330de7441b0752`.
- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route returned the styled 404 with HTTP 404. The hash-named JS was `Cache-Control: public, max-age=31536000, immutable`; the service worker was `public, max-age=0, must-revalidate`.
- Live headers include CSP with same-origin `connect-src` and response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy.
- Lighthouse 13.4.1 mobile audit of live `/demo` with full-page screenshots disabled: Performance 100, Accessibility 100, FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 60 ms.
- This static release has no product API, sign-in, identity provider, billing call, or server endpoint. Rate-limit and identity-provider checks are therefore not applicable; the live no-off-origin-request trace verifies that no such flow is invoked.

## Known gaps and next steps

No release-blocking gaps remain. Shop Fit Sheet is intentionally a planning aid, not structural or load-safety advice: users must verify measurements, joints, fixings, loads, clearances, hardware, and site conditions before cutting.
