# Independent verification 6 — PASS

- **Candidate:** `1e8b6ff973970dbdeb16e62e593bf9cd2832f04b`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Decision:** **PASS** — the live deployment exactly matches the candidate build and satisfies the researched brief and acceptance contract.

No product code was changed during verification. Fresh evidence is in [evidence-6](evidence-6/).

## Mandatory claim gate

The clean clone was checked out at the exact candidate, then `npm ci` installed 22 locked packages with zero audit vulnerabilities. `.factory/claims.json` exists. Every listed command was run separately before broader QA; every command passed in desktop Chromium and the configured 390 px mobile project:

| Claim | Exact command | Result |
| --- | --- | --- |
| `conflict-check` | `npm test -- --grep @claim:conflict-check` | PASS — 2 passed |
| `panel-list` | `npm test -- --grep @claim:panel-list` | PASS — 2 passed |
| `sheet-area-allowance` | `npm test -- --grep @claim:sheet-area-allowance` | PASS — 2 passed |
| `calculated-parts` | `npm test -- --grep @claim:calculated-parts` | PASS — 2 passed |
| `stock-fit-check` | `npm test -- --grep @claim:stock-fit-check` | PASS — 2 passed |
| `unit-conversion` | `npm test -- --grep @claim:unit-conversion` | PASS — 2 passed |
| `live-results` | `npm test -- --grep @claim:live-results` | PASS — 2 passed |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — 2 passed |
| `demo-namespace` | `npm test -- --grep @claim:demo-namespace` | PASS — 2 passed |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — 2 passed |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — 2 passed |

The landing page and README were cross-checked against this register. Their product-capability, privacy, demo, calculation, printing, unit, stock-fit, and offline statements are represented by the claims above; no unlisted visitor-reliance claim was found.

## Cold first-read gate

**PASS.** A fresh live browser opened the root with no interaction or stored state. The first viewport plainly answers:

- **What:** “Check a fitted build before buying sheet material.”
- **For whom:** home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.
- **First action:** the visible “Try it with sample data” link, explained by “See a filled plan and its conflicts.”

The action opens `/?demo=1` in one click. It immediately shows the realistic van-bed cabinet, persistent demo banner, Reset demo and Start for real controls, the 10 mm depth conflict, calculated openings, six panel rows, and rough sheet allowances. This passed at 1440 × 900 and 390 × 844.

## Repository gates

- `npm test`: **PASS — 44 passed, 2 expected desktop skips** for mobile-only checks.
- `npm run build`: **PASS**. This includes `tsc --noEmit` and emits `dist/`.
- No separate lint script exists; TypeScript checking is part of the production build.
- Built initial JS: 25,548 bytes / 9.17 KiB gzip.
- Built CSS: 16,605 bytes / 4.60 KiB gzip.
- Mobile hero: 30,256 bytes; desktop hero: 82,602 bytes; no downloaded font.
- This is a static web product, not a library or CLI, so consumer pack/install checks do not apply.

## Independent end-to-end behavior

Fresh live checks established:

- Normal sample: `1 conflict to fix`, the exact 10 mm depth conflict, six correct panel rows, 18 mm stock estimate, and working print invocation. A 39 KiB A4 print artifact was captured.
- Exact boundary: setting build depth to 740 mm removes the fit conflict and reports `Fits with 1 check`.
- Precision boundary: 740.01 mm remains a 0.01 mm conflict through inches and back, returning to exactly 740.01 mm in canonical storage.
- Invalid/recovery: a negative clearance displays the specific live error; Reset demo restores the valid 15 mm value and initial verdict.
- Count limit: nine centre supports sets `aria-invalid=true`, explains the maximum of eight, and excludes invalid support panels and diagram lines.
- Oversize stock: setting sheet width to 500 mm reports the expected side-panel stock conflict.
- Demo isolation: Planner and legal navigation retain demo mode and its separate key; real storage is untouched. Back/Forward focuses each new `h1` and updates the route announcement.
- All internal demo links returned 200. Root, demo alias, query demo, Privacy, Terms, robots, sitemap, and the external Factory footer destination also returned 200. An unknown route returned the styled page with HTTP 404.

## Accessibility and responsive behavior

- `/opt/fleet/lib/verify-url.sh` passed the live root: correct title, `lang=en`, one `h1`, one `main`, complete image alt text, labeled buttons, and no console errors.
- Axe found zero violations on `/`, `/demo`, `/privacy`, and `/terms` at desktop and 390 px. The live 404 separately had zero serious/critical findings.
- At 390 px, document and viewport widths both remained 390 px; every visible interactive target was at least 44 × 44 CSS px. At 200% text, there was no horizontal overflow and all header/demo actions remained available.
- Keyboard-only Tab navigation reached the skip link, wordmark, navigation, and sample action in DOM order. Enter opened the demo. Keyboard entry changed the fit result. Focus used the designed 3 px ochre outline; the skip link moved focus to `main`.
- With reduced motion enabled, animation durations were 0.01 ms and scroll behavior was `auto`.
- There were no console errors, page errors, traps, missing labels, or serious/critical accessibility findings.

## Privacy, PWA, headers, and deployment identity

- The complete fresh live flow made requests only to `https://shop-fit-sheet.sociobot.in`; there were no analytics, trackers, billing, font-CDN, or other off-origin requests.
- Browser-observed root headers include the self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive Permissions-Policy.
- HTML and `sw.js` use `public, max-age=0, must-revalidate`; the hashed JS uses `public, max-age=31536000, immutable`.
- Service worker update completed with active `/sw.js`, no waiting worker, and cache `shop-fit-sheet-v7`. Offline demo reload retained `Demo — Shop Fit Sheet` and `1 conflict to fix`.
- This release has no server endpoint, product-unlock call, sign-in, or payment flow. API allowance/429, Entra authority, billing, backend concurrency, and server persistence checks are therefore not applicable.

Fresh candidate and live bytes match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `5545bafcf59672f163b90c29c93d2b3d5a643df89b5b303cb0a4f0b55b88f494` |
| `assets/main-BGHWHPeP.js` | `48a9236ea74da0cb13e2c3828f1e399bf7fc3e3e02b40b444f11a8772c8225d0` |
| `assets/main-BoV9wXCl.css` | `43f0ba36b245599488a70b6ee85c8c00f371871f4efefe302ae16535fcec41f3` |
| `sw.js` | `c33144004c8ebd52f147ea3589b9798a9297201264992cc16f25630f971e7e44` |

Lighthouse 13.4.1 on the live query demo completed successfully: **Performance 99, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 120 ms, and total transfer 102,606 bytes.

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
/opt/fleet/lib/verify-url.sh https://shop-fit-sheet.sociobot.in .factory/evidence-6/live
node .factory/evidence-6/live-e2e.mjs
```
