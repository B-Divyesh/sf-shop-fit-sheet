# Shop Fit Sheet handoff

## Independent verification status — FAIL (2026-08-28)

Candidate `3e286e808e1f853567a79b97b18bc2ae745610b0` was independently verified against <https://shop-fit-sheet.sociobot.in>. Local claims, the 24-test suite, production build, live calculator flows, offline reload, privacy request log, responsive keyboard/axe checks, and artifact hashes passed. **Release fails** because the public $9 project-library checkout URL returns HTTP 404 from the Sociobot billing API. The promise is visible and actionable but cannot be purchased.

Additional P2 findings: static JS/CSS are un-hashed and sent with only `max-age=30`, contrary to the immutable static-cache policy; unknown URLs render the styled 404 content with HTTP 200. See [.factory/verification.md](verification.md) for exact evidence, rate-limit observation, and remediation.

## What was built

- A local-first fit calculator for cabinets, benches, and storage builds.
- Constraint checks for the outer width, height, depth, clearances, openings, supports, door blanks, and stock-sheet fit.
- A calculated panel list, rough sheet allowance, and printable build sheet.
- Millimetre and inch conversion, live updates, explicit invalid-input messages, empty states, and an offline state.
- A one-click `/demo` with a realistic van cabinet and isolated `demo:shop-fit-sheet:project:v1` storage.
- An optional $9 one-time project library with Sociobot checkout, license restore, cached first paint, and daily background verification.
- `/privacy`, `/terms`, and styled 404 routes with History API navigation and focus management.
- A versioned service worker, install manifest, metadata, social preview, sitemap, robots file, and Azure Static Web Apps headers.
- An original botanical field-guide hero. The source, prompt, model, and production WebP files are documented in `.factory/design.md`.

## Run and verify

```sh
npm install
npm test
npm run build
```

The production build command is exactly `npm run build`. Output lands in `dist/`, with `dist/index.html` at its root.

Final local verification on 2026-08-28:

- Playwright: 24 tests passed across desktop Chromium and a 390 × 844 mobile viewport.
- Every entry in `.factory/claims.json` passed in the `/demo` sandbox.
- Axe integration: no serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, or the 404 route.
- Keyboard check: skip link, forms, demo actions, print action, and navigation are reachable.
- Console and links: no console or page errors; every internal link returned a successful response.
- Offline: the service worker reloaded `/demo` with the browser network disabled.
- Production assets: 9.30 KB JS gzip, 4.35 KB CSS gzip, 30 KB mobile hero, and 83 KB desktop hero.
- Lighthouse 13.4.1 mobile simulation on `/demo`: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse metrics: LCP 1.4 s, CLS 0, total blocking time 80 ms, speed index 1.0 s, total transfer 100 KiB.

Screenshots and the browser smoke-test record are in `.factory/evidence/`.

## Known limits

- The sheet allowance uses panel area plus 15%. It is not a cutting or nesting layout.
- Output does not cover joints, fixing selection, loads, sag engineering, or site certification.
- The paid checkout and verification path needs the factory’s product registration before release. No payment-provider secret is stored here.
- Browser storage is device-local. It does not sync between browsers or devices.

## Release steps

1. Register `shop-fit-sheet` with the Sociobot billing engine at the stated $9 one-time price.
2. Deploy `dist/` through the factory static-web pipeline.
3. Check the production checkout return URL and license verification once after registration.
