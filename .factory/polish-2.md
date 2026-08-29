# Perfection-loop polish 2

- **Work order:** `shop-fit-sheet-polish-2`
- **Released candidate:** `806a79f48f10ea538ed80b9f37062345124073eb`
- **Review commit:** `5b73204003c525b68f96b8b92e0e2c921b385dae`
- **Repair code commit:** `e4f62e9bf1d8d89503929bb4845498f6b723f573`
- **Deployment:** Azure Static Web Apps `a22e3e3c-734f-41c9-9298-1f589ee0187d`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>

## Finding map

| Finding id | Change made or retained | Evidence |
| --- | --- | --- |
| F-2-1 | Made the SVG description choose singular `support` only for one and plural `supports` otherwise. Added one-support and two-support browser assertions. Bumped the service-worker cache to `v8` so the repair replaces cached code. | `@regression:diagram-support-grammar`; [live QA](evidence-polish-2/live-qa.json) records both exact descriptions; [live mobile screenshot](evidence-polish-2/live/demo-mobile-390.png); live `/?demo=1`. |
| F-1-1 | Retained the repaired first-screen headline, “Check a fitted build before buying sheet material,” and the one-term copy audit. | `@regression:first-screen-copy`; [cold live screenshot](evidence-polish-2/live/cold-desktop.png); live `/`. |
| H-1 — unavailable paid checkout | Retained withdrawal of the unavailable paid offer. No checkout copy or billing request exists. | `withdraws the unavailable paid offer and makes no billing request`; live QA first-screen and same-origin request checks; live `/`. |
| H-2 — static asset caching | Retained fingerprinted JS/CSS and immutable one-year asset caching. | `ships hashed immutable assets and a styled HTTP 404 response`; live QA response for `/assets/main-Dr6XEvF5.js`; live `/`. |
| H-3 — real 404 | Retained the product-styled HTTP 404 response and return action. | `ships hashed immutable assets and a styled HTTP 404 response`; live QA shows status 404, one h1, metadata, legal links, and zero serious/critical Axe findings at live `/does-not-exist`. |
| H-4 — mobile touch targets | Retained 44 px minimum targets for navigation, demo controls, fields, print, and legal links. | `mobile @regression:touch-targets`; live QA `mobile.undersizedTargets: []`; [live 390 px screenshot](evidence-polish-2/live/demo-mobile-390.png); live `/?demo=1`. |
| H-5 — incomplete claims register | Retained all 11 visitor-facing claims in `.factory/claims.json`, each with exactly one tagged observable browser test at the isolated demo entry. | Every exact claim command passed independently from clean clone `/tmp/shop-fit-sheet-polish-2-clean-TPFddR`; live QA rechecks the conflict, panel rows, allowance, conversion, demo, privacy, and offline outcomes. |
| H-6 — decorative copy | Retained the direct first-screen and section copy and updated the round-2 copy audit with both diagram grammar templates. | `.factory/copy-audit.md`; `@regression:first-screen-copy`; live cold screenshots; live `/`. |
| H-7 — untested 15% allowance | Retained the quantitative claim and derives the shown allowance from visible panel rows. | `@claim:sheet-area-allowance`; live QA records `5.78 m² + 15% allowance (0.87 m²) = 6.65 m²`; live `/?demo=1#planner`. |
| H-8 — unit conversion precision | Retained canonical millimetre storage and the 0.01 mm boundary through an inch round trip. | `@claim:unit-conversion`; live QA `unitBoundary` passes in both units; live `/?demo=1`. |
| H-9 — 200% text overflow | Retained intentional mobile stacking and full-width controls. | `mobile @regression:text-resize`; live QA reports `scrollWidth === clientWidth === 390` at normal and 200% text; [live 390 px screenshot](evidence-polish-2/live/demo-mobile-390.png). |
| H-10 — Planner left demo storage | Retained query-demo-aware wordmark, Planner, and legal navigation with separate real/demo keys. | `@claim:demo-isolation`; `@claim:demo-namespace`; live QA keeps `?demo=1#planner`, then Start for real restores `Live real project` and removes the demo key; live `/?demo=1`. |
| H-11 — count maxima not enforced | Retained shared maxima, announced errors, invalid-row suppression, and safe diagram output. | `@regression:count-maxima`; live QA records `aria-invalid=true`, the exact error, and zero support rows at 9 supports; live `/?demo=1`. |
| H-12 — Back/Forward focus lost | Retained History API navigation, h1 focus, and the polite route announcement. | `@regression:history-focus`; live QA records focused h1 and “Page changed: Check a fitted build before buying sheet material”; live `/?demo=1`. |
| M-1 — metadata completeness | Retained route-specific titles, descriptions, canonicals, Open Graph/Twitter data, header/footer, legal links, and one h1/main. | `routes have one h1, distinct titles, and no serious accessibility findings`; live QA covers `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the 404; live verifier JSON. |
| M-2 — required query demo entry | Retained `/?demo=1` as the first-screen action and documented verifier URL. Reset restores the sample; Start for real discards demo data. | `@regression:first-screen-copy`; `@claim:demo-isolation`; `@claim:demo-namespace`; `@claim:offline-reload`; live QA and screenshots at live `/?demo=1`. |

## Verification evidence

- Clean clone: `/tmp/shop-fit-sheet-polish-2-clean-TPFddR` at `e4f62e9bf1d8d89503929bb4845498f6b723f573`.
- `npm ci`: 22 locked packages installed; zero audit vulnerabilities.
- Every exact `.factory/claims.json` command passed separately: 11 claims × desktop/mobile = 22 passing executions.
- Clean-clone `npm test`: 46 passed, with two expected desktop skips for mobile-only checks.
- Clean-clone `npm run build`: passed and emitted `dist/index.html` plus the static route documents.
- Local verifier: [verify.json](evidence-polish-2/local/verify.json); no browser errors, one h1/main, complete image/button names.
- Local screenshots: [desktop](evidence-polish-2/local/screenshot-desktop.png) and [mobile](evidence-polish-2/local/screenshot-mobile.png).
- Live verifier: [verify.json](evidence-polish-2/live/verify.json); no browser errors.
- Full cold live audit: [live-qa.json](evidence-polish-2/live-qa.json); deployed HTML, JS, CSS, and service worker match `dist`; all mapped assertions passed.
- Live screenshots: [cold desktop](evidence-polish-2/live/cold-desktop.png) and [demo mobile](evidence-polish-2/live/demo-mobile-390.png).
- Lighthouse mobile: [report](evidence-polish-2/lighthouse-live.json) — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 0.9 s, CLS 0, TBT 40 ms, 100 KiB transfer.
- Production sizes: JS 25.57 kB / 9.18 kB gzip; CSS 16.61 kB / 4.60 kB gzip; mobile hero 30.26 kB.

No finding of any severity remains open. The product remains a Vite + TypeScript static site with its botanical workshop field-guide identity intact.
