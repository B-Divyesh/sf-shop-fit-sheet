# Perfection-loop polish 3

- **Work order:** `shop-fit-sheet-polish-3`
- **Base review commit:** `a68b488f218ea546857513b15cdbb0db39c922dd`
- **Repair code commit:** `0df2ff72e2ad2548b9e657ef207c7ce49430d54a`
- **Deployment:** Azure Static Web Apps `19bc03ff-46bd-4cc3-9a73-e56a9304eb94`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| `F-3-1` | Replaced the landing-page replay in demo mode with a product-first sample summary. The project name, calculated verdict, and first conflict are visible immediately; the full live planner follows. | `@regression:demo-first-viewport`; [desktop first viewport](evidence-polish-3/live/demo-first-desktop.png); [mobile first viewport](evidence-polish-3/live/demo-first-mobile.png); live audit records all three items inside both viewports and `repeatCtaCount: 0`. |
| `F-3-2` | Made the demo status bar sticky, safe-area aware, and continuously available above the working planner. Reset and exit remain visible. | `@regression:demo-banner`; [desktop sticky state](evidence-polish-3/live/demo-sticky-desktop.png); [mobile sticky state](evidence-polish-3/live/demo-sticky-mobile.png); live audit records banner `y: 0` and both controls visible. |
| `F-3-3`, `H-6` | Replaced metaphorical 404 copy with the exact h1 **Page not found** while keeping the field-guide visual treatment. | `ships hashed immutable assets and a styled HTTP 404 response`; `routes have one h1, distinct titles, and no serious accessibility findings`; [live 404](evidence-polish-3/live/404.png); live route returned HTTP 404 with title `Page not found — Shop Fit Sheet`. |
| `F-2-1` | Kept diagram grammar tied to the support count. | `@regression:diagram-support-grammar`; live audit: `1 centre support` and `2 centre supports`. |
| `F-1-1` | Kept the first screen job-led: **Check a fitted build before buying sheet material**, one clear audience sentence, one sample action, and three facts. | `@regression:first-screen-copy`; [cold desktop](evidence-polish-3/live/cold-desktop.png); [cold mobile](evidence-polish-3/live/cold-mobile.png). |
| `H-1` | Kept all paid-tier and checkout language removed because no paid unlock is implemented. | `withdraws the unavailable paid offer and makes no billing request`; live audit records `paidOfferCount: 0`. |
| `H-2` | Advanced the service-worker shell cache to `shop-fit-sheet-v9`; the sample and full app reload offline after the first visit. | `@claim:offline-reload`; live offline reload returned `1 conflict to fix` from cache `shop-fit-sheet-v9`. |
| `H-3` | Retained real 404 delivery through the static host and aligned the route's title, canonical URL, h1, focus behavior, and legal links. | `ships hashed immutable assets and a styled HTTP 404 response`; live `/does-not-exist` returned HTTP 404 and one h1/main. |
| `H-4` | Retained 44 px minimum interactive targets across phone layouts, including the sticky demo controls. | `mobile @regression:touch-targets`; live 390 px audit records `undersizedTargets: []`. |
| `H-5` | Kept `.factory/claims.json` complete and ran each of its 11 exact commands independently from a final clean clone. | All 11 `@claim:*` commands passed on Chromium desktop and mobile: 22/22 executions. Full clean-clone suite: 50 passed, two expected desktop skips. |
| `H-7` | Kept the allowance calculation displayed as part area + 15% allowance = total. | `@claim:sheet-area-allowance`; live sample reports `5.78 m² + 15% allowance (0.87 m²) = 6.65 m²`. |
| `H-8` | Kept internal precision through unit changes so boundary conflicts do not disappear after display rounding. | `@claim:unit-conversion`; the live `740.01` boundary remains a conflict before and after the unit round trip. |
| `H-9` | Preserved content reflow at 200% text size with no horizontal page overflow. | `mobile @regression:text-resize`; [live 200% view](evidence-polish-3/live/mobile-text-200.png); live audit records `scrollWidth = clientWidth = 390`. |
| `H-10` | Kept demo data in `demo:shop-fit-sheet:project:v1`, never read the real namespace while demo is active, and restored real data when leaving. | `@claim:demo-isolation` and `@claim:demo-namespace`; live audit saw distinct demo and real keys and confirmed the exit restoration. |
| `H-11` | Kept strict count limits and accessible errors; values beyond the documented maximum do not create hidden rows. | `@regression:count-maxima`; live audit records `aria-invalid=true`, an announced message, and zero support rows. |
| `H-12` | Kept History API navigation, demo-aware legal URLs, h1 focus, and route announcements. | `@regression:history-focus`; live Back navigation focused the restored h1 and announced `Page changed: Van bed utility cabinet`. |
| `M-1` | Retained route-specific titles, descriptions, canonicals, one h1/main, consistent header/footer, legal links, security headers, sitemap, and real HTTP statuses. | `routes have one h1, distinct titles, and no serious accessibility findings`; live audit covered `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the 404. |
| `M-2` | Preserved demo mode across internal Privacy and Terms navigation by carrying `?demo=1`. | `@regression:history-focus`; live history audit opened `/privacy?demo=1`. |

## Verification evidence

- Fresh clone at repair commit: `npm ci`, all 11 claim commands, `npm test`, and `npm run build` passed.
- Full clean-clone suite: 50 passed and two intentional desktop skips; production build emitted `dist/`.
- Live request audit: same-origin requests only; no console or page errors.
- Live Axe scan: no serious or critical findings on all six routes.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 0.9 s, LCP 1.0 s, CLS 0, TBT 50 ms, 71 KiB transferred.
- `/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1'` passed title, language, landmark, alt-text, and console checks.
- Deployed root HTML, hashed JS/CSS, and service worker match the verified `dist/` files.
- Complete machine-readable browser evidence is in [live-qa.json](evidence-polish-3/live/live-qa.json).

Every finding from reviews 1–3 is resolved; no severity was deferred.
