# Independent verification 3 — FAIL

**Candidate:** `c00cc73c979a55d00f8ee81c84d02561c1f986e0` (`docs: record live repair deployment`)
**Live URL:** <https://shop-fit-sheet.sociobot.in>
**Verified:** 2026-08-29 (UTC), from a clean checkout and clean `npm ci` install
**Decision:** **FAIL — release-blocking claim-contract defect.**

## First-read result

A cold desktop visit to `/` answered the required questions in plain words:

- It does: “Check a fitted build before buying stock.”
- It is for: “home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.”
- First action: the visible `/demo` link “Try it with sample data,” followed by “See a filled plan and its conflicts.”

The live first screen therefore passes the plain-words and one-click demo gate. The demo banner states that it is sample data and provides Reset demo and Start for real.

## Release blocker

### P2 — unregistered, unmeasured quantitative public claim

The product publicly promises a **“15% sheet-area allowance”** in `README.md` and displays **“Includes 15% area waste.”** in the live panel-list result. `.factory/claims.json` has no claim with that number. Its closest entry, `panel-list`, says only “Makes a printable panel and rough sheet list”; its test asserts a sample stock-list string and print invocation, not the 15% calculation or a tolerance.

This violates the supplied claims contract: quantitative claims must state the number in the claim and test the number in the sandbox; a public claim absent from the register is a release failure. This is documentation/test-contract work, not a demonstrated calculation failure. The candidate must either remove the 15% promise or add an exact registered claim and deterministic observable test before release.

No product source was changed during this verification.

## Required claim commands

`npm ci` installed 22 packages with 0 reported vulnerabilities. Before the broader QA, every command recorded in `.factory/claims.json` was invoked from the clean install, using the product’s `/demo` Playwright entry point:

| Claim | Result |
| --- | --- |
| `@claim:conflict-check` | Pass |
| `@claim:panel-list` | Pass |
| `@claim:calculated-parts` | Pass |
| `@claim:stock-fit-check` | Pass |
| `@claim:unit-conversion` | Pass |
| `@claim:live-results` | Pass |
| `@claim:demo-isolation` | Pass |
| `@claim:demo-namespace` | Pass |
| `@claim:local-only` | Pass |
| `@claim:offline-reload` | Pass |

The later complete independent run, `npm test`, rebuilt production output and passed **35 tests** in 1.1 minutes across desktop Chromium and the 390 px mobile project; one desktop half of a test intentionally marked mobile-only was skipped. `npm run build` is part of that script and passed (`tsc --noEmit && vite build`). The exact production build emitted `dist/`.

## Product and browser evidence

- Normal demo: `/demo` initially reports “1 conflict to fix”; changing build depth to 735 mm changes it live to “Fits with 1 check.”
- Boundary/invalid/recovery: a negative left clearance produces “Clearances and gaps cannot be negative.” Returning it to 10 removes that error. The test suite separately verifies the sample’s 500 mm sheet-width oversize conflict and fractional support-count error.
- Conversion: switching the adjusted 735 mm depth to inches displayed 28.94. Panel, door, support, shelf, back, print, empty-state, and demo-isolation flows passed in the suite.
- Keyboard: first Tab focuses the skip link with a visible `rgb(166, 93, 29) solid 3px` outline and 3 px offset; Enter moves focus to `main`.
- Reduced motion: with `prefers-reduced-motion: reduce`, the inspected hero animation and transition durations are both `0.01ms`.
- Mobile 390 × 844: one `h1`, one `main`, no horizontal overflow (`scrollWidth: 390`), no visible interactive control under 44 px, and no console/page errors. Visual inspection found a legible, correctly stacked first screen.
- Live Axe (`@axe-core/playwright`) found zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`, and a missing-page route. The repository does not contain the requested `verify-url.sh`; equivalent checks were independently performed through Playwright plus Axe.
- Console/page errors: none during the live landing/demo exercise. All observed demo-flow requests were same-origin `shop-fit-sheet.sociobot.in`; no account, billing, analytics, tracking, or third-party calculator request was observed.

## PWA, deployment, headers, and budget evidence

- Live `/demo` registered and controlled a service worker. Its cache was `shop-fit-sheet-v5`; `registration.update()` completed with an active controller and no waiting/failed worker. With the browser context offline, a reload still rendered “1 conflict to fix.”
- Fresh production build `main-DvNr9ka2.js` SHA-256: `2be269908189f5774155f3d7552b1f2058cbcc620a38f8c5d4e28fff99995257`. Live `/demo` loads that same filename and its fetched SHA-256 is identical. The live deployment is therefore the tested candidate output.
- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200; a made-up path returned the styled 404 with status 404. HTML and service worker cache policy is revalidation; hashed JS is `public, max-age=31536000, immutable`.
- Live responses include CSP (`default-src 'self'`, same-origin `connect-src`, `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, strict-origin-when-cross-origin referrer policy, and a restrictive permissions policy.
- Build sizes: initial JS 21,531 B / 8.01 kB gzip, CSS 15,737 B / 4.41 kB gzip, mobile hero 30,256 B, desktop hero 82,602 B. All are within the applicable static-product budgets.
- Lighthouse 13.4.1 mobile-style audit of live `/demo` recorded Performance **95**, Accessibility **100**, FCP **0.9 s**, LCP **1.1 s**, CLS **0**. Lighthouse then exited non-zero because its full-page-screenshot target crashed after audit collection (`TARGET_CRASHED`); the result should not be treated as a product console/browser error, and the independent Playwright/axe checks above completed normally.

There are no server-side product endpoints or sign-in/billing flows in this static release, so request allowance/429 and identity-provider checks do not apply.

## Required repair and re-verification

1. Register the exact 15% allowance statement in `.factory/claims.json` and add a single tagged sandbox test that verifies the 15% calculation/observable output with a specified tolerance, or remove that public promise everywhere.
2. Rerun every registered claim command, the full suite, build, and this live verification. Do not release this candidate until that contract is satisfied.
