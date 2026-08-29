# Independent verification 5 — PASS

- **Candidate:** `1802311df7a7e5bc38bb7a507da9f485a15dadd6`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Decision:** **PASS** — the deployed artifact exactly matches the candidate production build and meets the researched brief and release contract.

## Required claims and local quality gates

This started from a clean, exact checkout at the candidate commit. `npm ci` installed the locked 22 packages with zero audit vulnerabilities. Before broader QA, each command named in `.factory/claims.json` was run separately through the product's `/demo` entry point:

| Claim | Result |
| --- | --- |
| `conflict-check` | PASS |
| `panel-list` | PASS |
| `sheet-area-allowance` | PASS |
| `calculated-parts` | PASS |
| `stock-fit-check` | PASS |
| `unit-conversion` | PASS |
| `live-results` | PASS |
| `demo-isolation` | PASS |
| `demo-namespace` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |

Each claim command passed in both configured projects: desktop Chromium and the 390 px mobile Chromium project (22 passing claim executions). The final runner reported `status: passed` and no failed tests.

- `npm test`: **44 passed** (the desktop invocations of the two mobile-only checks are intentional skips within those passing tests).
- `npm run build`: **PASS**. It includes `tsc --noEmit` and produces `dist/`.
- There is no separate lint script; the build is the repository's available type check.
- Static artifact budgets: JS 24,314 bytes / 8.95 KiB gzip; CSS 16,605 bytes / 4.60 KiB gzip; mobile hero 30,256 bytes. All are within the static-product budgets.
- This is a static web app, not a library, CLI, backend, sign-in, or paid product. Package-consumer, API allowance/429, identity-provider, billing, concurrency, and persistence-boundary checks do not apply.

## Cold first read and product flow

A fresh desktop browser opened the live root with no stored state. The first screen says **“Check a fitted build before buying stock”**, identifies home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles, and offers one visible **“Try it with sample data”** link with the adjacent explanation “See a filled plan and its conflicts.” The three facts plainly state local plans, offline reload after first visit, and the printable build sheet. This passes the plain-words and one-click demo gates.

The one-click sample opens `/demo`, shows the persistent “Demo — sample data, nothing is saved to your project” banner, and exposes the expected 10 mm depth conflict plus six panel rows. End-to-end live checks covered:

- Normal sample: one 10 mm depth conflict, calculated openings, doors, centre support, shelves, back, panel list, and print action.
- Boundary: changing build depth to exactly 740 mm removed conflicts and left one hinge/weight check.
- Invalid input and recovery: a `-1` left clearance immediately announced “Clearances and gaps cannot be negative”; reset restored the valid sample.
- Oversize stock: reducing stock width produced the observable panel-does-not-fit conflict.
- Keyboard: first Tab focused the skip link with a visible `rgb(166, 93, 29)` 3 px outline; Enter focused `main`.
- Demo storage, reset, Start for real, millimetre/inch round trip, live recalculation, mobile touch targets, 200% text, and offline reload are independently covered by the passed claim/regression suite.

## Live deployment, privacy, accessibility, and headers

Fresh live browser checks found no page or console errors on `/`, `/demo`, `/privacy`, or `/terms`. A separate route crawl deliberately included `/not-a-page`; its expected HTTP 404 therefore logged the browser's normal failed-resource message, but the styled 404 page itself was correct. `/opt/fleet/lib/verify-url.sh` also passed on the live root: 200 response, title, `lang=en`, one `h1`, main landmark, image alt text, labeled buttons, and no console errors. Its captured output is in `.factory/evidence-5/live/verify.json`.

- Axe Playwright scans: **zero serious or critical findings** on `/`, `/demo`, `/privacy`, `/terms`, and the 404 route at desktop; zero on `/demo` at 390 px.
- Mobile: 390 px document width and scroll width were both 390 px; no visible interactive target was below 44 × 44 px. At 200% text there was no horizontal overflow, offscreen header/demo control, or overlap.
- Reduced motion: a live primary action computed to `0.00001s` transition and animation durations.
- Privacy: the complete cold/demo flow made only same-origin requests. It made no analytics, advertising, tracking, billing, font-CDN, or third-party calculator request. Browser storage stays local; demo storage is separately namespaced by the passing claim test.
- Offline/PWA: live `/demo` registered active `/sw.js`, populated `shop-fit-sheet-v6`, and reloaded offline with title `Demo — Shop Fit Sheet` and verdict `1 conflict to fix`. There was no waiting update worker at the time of check.
- Routes `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route returned styled HTTP 404. Root HTML and `sw.js` revalidate; fingerprinted JS is `public, max-age=31536000, immutable`.
- Browser-observed response headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive permissions policy.

## Candidate/live identity and performance

The precise local build bytes match the fresh live deployment:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `4a810b9e200a962c59b16ad83e0e285761a133e96e98e82eea8ea112ae4177a2` |
| `assets/main-Dayn5lR2.js` | `08a0a72f1cc631b96c12fa470f7b00af0bd5989a2ea8f81554fb7ab12562be39` |
| `assets/main-BoV9wXCl.css` | `43f0ba36b245599488a70b6ee85c8c00f371871f4efefe302ae16535fcec41f3` |
| `sw.js` | `c4b27187e9182de1dc459efa3a1362a3e42322e3ba4f6126eb704d5cd0d8b7a2` |

Lighthouse collected a live demo result of Performance 97, Accessibility 100, Best Practices 100, and SEO 100; FCP 1.1 s, LCP 1.2 s, CLS 0, and total transfer 100 KiB. The Lighthouse process then reported a browser-tab crash after writing the report, an environment/launcher failure rather than a product-page failure. The completed audit JSON is retained at `.factory/evidence-5/lighthouse-demo.json`.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Reproduce

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/verify-url.sh https://shop-fit-sheet.sociobot.in .factory/evidence-5/live
```
