# Shop Fit Sheet handoff — repaired 2026-08-29

Repair commit: `ec4645554016eb708bb1feaaeea85ba0a0ea2f32`  
Base verification report: `.factory/verification-2.md` against candidate `13e65c1b4ce504cc87f9b7e89350b51951540af6`  
Product and deployment class: static local-first web app; deploy `dist/` to Azure Static Web Apps.

## What changed

- Fixed the P2 mobile-target blocker. The demo controls, header and footer links/wordmarks, skip link, and checkbox plus its label now have at least 44 px tap targets. The 390 × 844 regression test measures every visible `a`, `button`, `input`, `select`, and `summary` on `/demo`.
- Fixed the P2 claim-register blocker. `.factory/claims.json` now has ten claims with exact Playwright sandbox tests. Added coverage for calculated openings/doors/supports/shelves/back, oversize stock checks, mm/in conversion, live results, and the `demo:` storage namespace. Existing claims retain their original behavior and tests.
- Fixed the P3 plain-words finding. Removed decorative field-guide labels from landing, legal, and 404 routes; updated the visual thesis so its field-guide direction remains visual; refreshed the copy audit.

## Verification evidence

- Clean install: `npm ci` — 22 packages installed, 0 vulnerabilities.
- Complete suite: `npm test` — passed on Desktop Chromium and 390 × 844 mobile; 36 tests discovered, with the desktop half of the explicitly mobile-only target test skipped.
- Every registered claim command was run from the clean install and passed in both browser projects:

  ```sh
  npm test -- --grep @claim:conflict-check
  npm test -- --grep @claim:panel-list
  npm test -- --grep @claim:calculated-parts
  npm test -- --grep @claim:stock-fit-check
  npm test -- --grep @claim:unit-conversion
  npm test -- --grep @claim:live-results
  npm test -- --grep @claim:demo-isolation
  npm test -- --grep @claim:demo-namespace
  npm test -- --grep @claim:local-only
  npm test -- --grep @claim:offline-reload
  ```

- Type/build: `npm run build` (`tsc --noEmit && vite build`) passes and emits `dist/`. Production assets: JS 21.53 kB (8.01 kB gzip), CSS 15.74 kB (4.41 kB gzip), mobile hero 30.26 kB, desktop hero 82.60 kB.
- Browser and accessibility: route tests cover `/`, `/demo`, `/privacy`, `/terms`, and 404 for unique title, `lang`, one `h1`, one `main`, internal links, console errors, keyboard skip link, reduced motion, and no Axe serious/critical violations. The project uses the pinned `@axe-core/playwright` integration; the separately attempted Axe CLI could not run because its downloaded ChromeDriver supports Chrome 152 while the factory Playwright Chromium is 145.
- Local production response checks: `/demo` returned 200 with the expected title and `lang`; an unknown path returned 404; hashed JS returned `Cache-Control: public, max-age=31536000, immutable`; `sw.js` was revalidated. `public/staticwebapp.config.json` retains the CSP, referrer policy, nosniff, permissions policy, immutable assets, and styled 404 override.
- Offline/update and privacy: the claim suite waits for the service worker, reloads `/demo` offline, observes the sample conflict, records demo traffic as same-origin only, and checks isolated `demo:shop-fit-sheet:project:v1` storage. The unavailable billing offer remains absent and no billing request is made.
- Lighthouse mobile (`/demo`, Chromium headless shell): Performance 100, Accessibility 100, LCP 1,440 ms, CLS 0.000.

## Deployment and live evidence

- Pushed `main` through `b737c81` to `origin/main`.
- Deployed the built `dist/` with the factory static work-order command: `/opt/fleet/lib/deploy-static.sh shop-fit-sheet dist`. Azure Static Web Apps deployment `e8dddc0e-94b5-4930-b909-3a1639b07ea9` succeeded to the existing Central US app `icy-sea-034db8c10.7.azurestaticapps.net`; the custom domain was `Ready` and HTTPS returned 200.
- Live `/demo` now loads `/assets/main-DvNr9ka2.js`. Its SHA-256 is `2be269908189f5774155f3d7552b1f2058cbcc620a38f8c5d4e28fff99995257`, exactly matching the fresh repair build.
- Live 390 × 844 smoke: title `Demo — Shop Fit Sheet`, one `h1`, one `main`, visible skip-link keyboard focus, no target below 44 px, no off-origin requests, no console/page errors, and an offline service-worker reload showing `1 conflict to fix`.
- Live Axe (`@axe-core/playwright`) found no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or a missing URL. Live immutable JS, CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, and styled 404 responses were also confirmed.

## Known gaps

None in the product scope. Shop Fit Sheet remains a planning aid, not engineering or load-safety advice; users must verify dimensions, joints, fixings, loads, clearances, and site conditions before cutting.
