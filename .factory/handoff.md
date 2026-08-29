# Shop Fit Sheet handoff

## Repair outcome

Repaired and deployed the independent-verification failure from candidate `3e286e808e1f853567a79b97b18bc2ae745610b0`.

- Removed the unavailable $9 project-library offer, checkout link, license flow, paid claim, and related copy. The Sociobot checkout still returns `404 {"error":"enabled factory product","status":404}`; the product no longer promises or exposes that broken path.
- Preserved the researched calculator, demo sandbox, local browser storage, printable build sheet, offline operation, fit calculations, safety warning, routes, and visual system.
- Fingerprinted the compiled JS/CSS and static image asset names. Generated service worker `shop-fit-sheet-v5` precaches the exact hashed build assets.
- Added Azure Static Web Apps cache rules: `/assets/*` is `public, max-age=31536000, immutable`; HTML and `/sw.js` are `public, max-age=0, must-revalidate`.
- Replaced the catch-all SPA fallback with explicit known-route rewrites and a 404 response override. Unknown URLs now render the designed in-app recovery screen with an actual HTTP 404.
- Added regressions for the suppressed unregistered checkout and the fingerprint/cache/404 deployment contract.

## Commits and deployment

- Repair commit: `5abb570 fix: remove unavailable checkout and harden static delivery`
- Pushed to `origin/main`.
- Production deployment: Azure Static Web Apps deployment `c506951d-d443-4c13-96ce-fc6f5fcdf51e` on 2026-08-29.
- Live URL: <https://shop-fit-sheet.sociobot.in>

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm run build` runs TypeScript checking and emits the static app to `dist/` with `dist/index.html` at its root. There is no separate lint script or package-consumer surface for this static web product.

Verification completed on 2026-08-29:

- Fresh `npm ci`: 23 packages, 0 audit vulnerabilities.
- `npm test`: 24 Playwright tests passed across desktop Chromium and 390 × 844 mobile. This includes every `.factory/claims.json` command, keyboard skip-link behavior, axe serious/critical checks, responsive layout, privacy traffic, offline reload, and the new release regressions.
- `npm run build`: passed. Output: JS 21.62 kB / 8.05 kB gzip; CSS 15.35 kB / 4.35 kB gzip; total deployed transfer measured 99 KiB.
- Live `verify-url.sh`: HTTP 200, no console/page errors, title/lang/one `h1`/`main`/image alt checks passed. Updated screenshots and report are in `.factory/evidence/`.
- Live browser checks on `/`, `/demo`, `/privacy`, `/terms`, and `/does-not-exist` at desktop and 390 px: no horizontal overflow; no serious/critical axe findings; route titles correct; skip link receives first Tab focus; all normal demo-flow requests remained same-origin.
- Live offline check: after first `/demo` load, service-worker-controlled offline reload showed “1 conflict to fix”.
- Live response-policy checks: `/does-not-exist` returned HTTP 404 and the styled recovery page; hashed app JS returned HTTP 200 with `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returned HTTP 200 with `Cache-Control: public, max-age=0, must-revalidate`.
- Lighthouse mobile on live `/demo`: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, total blocking time 90 ms, transfer 99 KiB.

## Known limits and next step

- Sheet allowance remains panel area plus 15%; it is not a cut-layout or nesting optimiser.
- Output does not design joints, select fixings, certify loads, or replace site measurement and safety checks.
- Browser storage is local to one device/browser.
- The researched brief names a one-time monetization path, but no factory billing registration tool or credential was present in this work order. The offer is deliberately absent until the factory registers and enables `shop-fit-sheet`; only then should a paid feature be restored with a safe end-to-end checkout, return-token, and live verification test.
