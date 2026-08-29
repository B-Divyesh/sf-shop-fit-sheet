# Perfection-loop polish 1

**Work order:** `shop-fit-sheet-polish-1`  
**Base review:** `62bf8236240e686b9c3a6e2a15241f88db2f1444`  
**Released candidate:** `771e6b23c3455e99b865cf4f7d5101f2f1045c13`  
**Public URL:** <https://shop-fit-sheet.sociobot.in>

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The cumulative historical items below come from the earlier verification reports referenced by `review-1.md` and were re-tested in this round.

## Finding map

| Finding id | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced ambiguous “stock” in the first-screen headline with “sheet material.” Updated the copy audit and terminology table. | `@regression:first-screen-copy`; `.factory/evidence-polish-1/local/screenshot-desktop.png`; live cold check at `/` recorded below. |
| H-1 — unavailable paid checkout | Kept the unavailable paid offer fully withdrawn. The calculator remains a useful free static product and makes no billing request. | `withdraws the unavailable paid offer and makes no billing request`; live request audit recorded below. |
| H-2 — static asset caching | Kept fingerprinted JS/CSS/image output and immutable asset caching. | `ships hashed immutable assets and a styled HTTP 404 response`; live response audit recorded below. |
| H-3 — real 404 | Kept the styled recovery page and Azure Static Web Apps HTTP 404 override. | `ships hashed immutable assets and a styled HTTP 404 response`; live `/does-not-exist` check recorded below. |
| H-4 — mobile touch targets | Retained the 44 px target treatment across demo controls, navigation, form controls, and footer links. | `mobile @regression:touch-targets`; `.factory/evidence-polish-1/local/screenshot-mobile.png`; live mobile audit recorded below. |
| H-5 — incomplete claims register | Retained all 11 operational claims, each with one tagged test, and moved every sandbox test to the required `/?demo=1` entry point. | Every command in `.factory/claims.json`; clean-clone transcript summarized below. |
| H-6 — decorative copy | Kept the earlier plain-language rewrite and complete landing copy audit. No decorative labels or banned marketing words returned. | `.factory/copy-audit.md`; full-suite route and first-screen tests. |
| H-7 — untested 15% allowance | Retained the exact registered quantitative claim and calculation derived from visible panel rows. | `@claim:sheet-area-allowance`. |
| H-8 — unit conversion lost precision | Retained canonical millimetre storage and boundary-conflict preservation through an inch round trip. | `@claim:unit-conversion`. |
| H-9 — 200% text overflow | Retained mobile reflow for navigation, demo controls, calculator, and footer. | `mobile @regression:text-resize`; live mobile audit recorded below. |
| H-10 — Planner left demo storage | Changed every visible demo entry and demo-aware home/Planner link to `?demo=1`; retained the separate `demo:` key and explicit exit. | `@claim:demo-isolation`; `@regression:first-screen-copy`; live `/?demo=1#planner` check recorded below. |
| H-11 — count maxima not enforced | Retained shared support, shelf, and door maxima with announced input errors and invalid-output suppression. | `@regression:count-maxima`. |
| H-12 — Back/Forward focus lost | Updated the expected announcement for the repaired headline; retained `h1` focus and polite announcements on route history. | `@regression:history-focus`. |
| M-1 — metadata completeness audit | Added full description, canonical, Open Graph, and Twitter metadata to every static route and synchronized it during client navigation. Both `/demo` and `/?demo=1` have demo titles. | `routes have one h1, distinct titles, and no serious accessibility findings`; static metadata assertions in `ships hashed immutable assets and a styled HTTP 404 response`. |
| M-2 — required query demo entry | Made `/?demo=1` the primary action, documented URL, claim-test entry, and precached offline route. The banner reads “Demo — sample data, nothing is saved.” Reset restores the shipped sample and Start for real discards demo data. | `@regression:first-screen-copy`; `@claim:demo-isolation`; `@claim:demo-namespace`; `@claim:offline-reload`. |

## Local evidence

- `npm test`: 44 passed, 2 expected desktop skips for mobile-only checks.
- `npm run build`: passed; `dist/` contains `index.html` and the five static route documents.
- `/opt/fleet/lib/verify-url.sh 'http://127.0.0.1:4173/?demo=1' .factory/evidence-polish-1/local`: passed with no console errors.
- Local screenshots: `.factory/evidence-polish-1/local/screenshot-desktop.png` and `.factory/evidence-polish-1/local/screenshot-mobile.png`.

## Clean-clone and live evidence

- Fresh clone: `/tmp/shop-fit-sheet-polish-clean-dv7DMW`, created with `git clone --no-local` at repair commit `1e8b6ff973970dbdeb16e62e593bf9cd2832f04b`.
- Every exact command in `.factory/claims.json` passed separately: 11 claims × desktop/mobile = 22 passed executions.
- The clean clone then ran `npm test`: 44 passed, 2 expected desktop skips. `npm run build` passed and emitted `dist/`.
- Deployment: Azure Static Web Apps production deployment `3edb82b4-f280-46d0-9307-f8478d6e3c0c`.
- `/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' .factory/evidence-polish-1/live` passed: 200, `Demo — Shop Fit Sheet`, `lang=en`, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.
- Cold live screenshots: `.factory/evidence-polish-1/live/screenshot-desktop.png` and `.factory/evidence-polish-1/live/screenshot-mobile.png`.
- Full live browser evidence: `.factory/evidence-polish-1/live-qa.json`. Root HTML, JS, CSS, and service worker hashes all match `dist/`. All Axe serious/critical arrays are empty.
- Live route checks: `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200 with distinct titles and complete metadata; `/does-not-exist` returns the styled HTTP 404.
- Live demo check: headline is “Check a fitted build before buying sheet material”; first action targets `/?demo=1`; the banner, sample, reset, separate key, Planner isolation, and explicit exit all work.
- Live privacy/offline check: every observed request was same-origin; no console errors occurred; cache `shop-fit-sheet-v7` served the sample verdict offline.
- Live responsive/accessibility check: 390 px and 200% text both had `scrollWidth === clientWidth === 390`; no visible target was below 44 px; keyboard skip focus and reduced motion passed.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 130 ms, total transfer 100 KiB. Report: `.factory/evidence-polish-1/lighthouse-live.json`.

All mapped findings are resolved on the live deployment. No critical, high, medium, minor, or informational item remains open.
