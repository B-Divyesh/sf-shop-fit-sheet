# Independent verification 4 — FAIL

**Candidate:** `64cbc31978432e2b9edc04458cb3ce7c246267c1` (`docs: record allowance repair verification`)

**Live URL:** <https://shop-fit-sheet.sociobot.in>

**Verified:** 2026-08-29 UTC from a clean checkout and locked dependency install
**Decision:** **FAIL — a unit switch can erase a fit conflict, and additional demo, validation, and accessibility contract defects remain.**

No product code was changed. Reproducible browser evidence is in [evidence-4](evidence-4/), especially [live-qa.json](evidence-4/live-qa.json) and [mobile-text-200.png](evidence-4/mobile-text-200.png).

## Release-blocking findings

### P1 — Changing units silently changes measurements and can erase a conflict

The unit selector converts every stored value in place and rounds each value to two decimal places. This changes the project rather than only changing its display unit.

Fresh live reproduction from **Reset demo**:

1. Set Build depth to `740.01 mm`. The clear depth is `780 - 40 = 740 mm`.
2. The verdict correctly reports `1 conflict to fix` and `Build depth exceeds the cleared space by 0.01 mm.`
3. Change Units to Inches. Build depth becomes `29.13`; the verdict immediately becomes `Fits with 1 check` and the depth conflict disappears.
4. Change back to millimetres. Build depth is now `739.9`, space depth `780.03`, and rear clearance `39.88`; the lost conflict does not return.

This fails the core job of exposing fit conflicts before stock purchase. It also shows that `@claim:unit-conversion` covers only the displayed converted value, not preservation of the represented dimensions or verdict.

### P2 — 200% text size loses and overlaps navigation

At the required 390 px viewport with root text size increased to 200%, document width grows to `503 px` while the viewport remains `390 px`. The wordmark overlaps `Demo`, and the right side of the navigation is clipped. See [mobile-text-200.png](evidence-4/mobile-text-200.png). This fails the supplied accessibility requirement that text resize to 200% without loss.

### P2 — “Planner” silently leaves the demo sandbox

From `/demo`, activating the header’s `Planner` link navigates to `/#planner`, removes the demo banner, and loads the real project (`Untitled fit sheet` in a fresh context). It does not use the explicit `Start for real` action. A visitor can therefore leave the isolated namespace and begin editing real storage while following a normal demo navigation link.

### P2 — Declared count limits are not enforced

The Centre supports input declares `max="8"`, but typing `9` is accepted. Browser validity reports `rangeOverflow: true`; the app gives no error, the panel list contains 9 supports, and the diagram draws only 8. The live output is internally inconsistent and provides no recovery instruction for this invalid input. Doors and shelves use the same unenforced pattern.

### P2 — Back/forward route changes lose focus and are not announced

An in-app move from `/demo` to `/privacy` correctly focuses the new `h1`. Browser Back restores `/demo` with focus on `BODY`, not its `h1`, and the recreated live region is empty. This fails the supplied routing requirement for focus and announcement on back/forward navigation.

## Mandatory first-read gate

**PASS.** A cold desktop visit answered all three questions in the first screen:

- What: `Check a fitted build before buying stock`.
- For whom: home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.
- First click: `Try it with sample data`, followed by `See a filled plan and its conflicts.`

The action opens `/demo` in one click. The demo immediately shows a realistic van cabinet, `1 conflict to fix`, a persistent sample-data banner, `Reset demo`, and `Start for real`. Cold screenshots are [screenshot-desktop.png](evidence-4/screenshot-desktop.png) and [mobile-cold.png](evidence-4/mobile-cold.png).

## Required claim tests

`.factory/claims.json` exists. Before broader inspection, `npm ci` installed 22 locked packages with zero reported vulnerabilities, then every listed command was run separately through the repository’s `/demo` entry point. Each result passed both Playwright projects:

| Claim | Exact command | Result |
| --- | --- | --- |
| `conflict-check` | `npm test -- --grep @claim:conflict-check` | 2 passed |
| `panel-list` | `npm test -- --grep @claim:panel-list` | 2 passed |
| `sheet-area-allowance` | `npm test -- --grep @claim:sheet-area-allowance` | 2 passed |
| `calculated-parts` | `npm test -- --grep @claim:calculated-parts` | 2 passed |
| `stock-fit-check` | `npm test -- --grep @claim:stock-fit-check` | 2 passed |
| `unit-conversion` | `npm test -- --grep @claim:unit-conversion` | 2 passed, but misses the P1 round-trip/verdict defect above |
| `live-results` | `npm test -- --grep @claim:live-results` | 2 passed |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | 2 passed, but does not exercise the Planner escape above |
| `demo-namespace` | `npm test -- --grep @claim:demo-namespace` | 2 passed |
| `local-only` | `npm test -- --grep @claim:local-only` | 2 passed |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | 2 passed |

The repaired 15% statement is now registered and measured correctly. The shipped sample’s visible rows produce the tested 18 mm panel area, 15% allowance, total, and three-sheet estimate.

## Clean build and repository gates

- `npm test`: **37 passed, 1 skipped** in 1.1 minutes. The skip is the desktop execution of an intentionally mobile-only touch-target test.
- `npm run build`: **PASS** (`tsc --noEmit && vite build`), producing `dist/`.
- No separate lint script exists. TypeScript checking is part of the exact build.
- This is a static web/PWA product, not a library or CLI; package-consumer checks do not apply.

Production sizes are within budget: JavaScript 21.88 kB (8.15 kB gzip), CSS 15.85 kB (4.44 kB gzip), mobile hero 30.26 kB, desktop hero 82.60 kB, and no downloaded fonts.

## End-to-end behavior

Positive independent results:

- The sample reports its expected 10 mm depth conflict; changing depth to 735 mm updates live to `Fits with 1 check`.
- An exact 740 mm depth fits. A fresh 740.01 mm depth initially reports the exact 0.01 mm conflict.
- Negative clearance, fractional supports, and zero panel thickness each show a specific error and recover after a valid replacement.
- Removing and restoring the optional back removes and restores its panel row.
- Reset demo restores `Van bed utility cabinet` and the initial conflict.
- A real project name survives reload under the real key.
- Print invocation is covered by the complete suite, and a fresh live print produced the 39 kB two-page PDF [demo-build-sheet.pdf](evidence-4/demo-build-sheet.pdf).

The upper-bound, unit-preservation, and demo-navigation failures are documented above.

## Accessibility, keyboard, mobile, and motion

- `/opt/fleet/lib/verify-url.sh` passed the live root: HTTPS 200, correct title, `lang=en`, one `h1`, a main landmark, no missing image alt text, no unlabeled button, and no console error. Output: [verify.json](evidence-4/verify.json).
- Fresh Playwright Axe scans found **zero violations of any impact** on `/`, `/demo`, `/privacy`, `/terms`, and the styled 404 at desktop and 390 px.
- At normal 390 × 844 size: no horizontal overflow (`390/390`), no visible target below 44 px, and no console/page error. Full demo capture: [mobile-demo.png](evidence-4/mobile-demo.png).
- Keyboard: first Tab reaches the skip link; its focus outline is 3 px ochre with 3 px offset; Enter focuses `main`; the first 20 subsequent controls follow DOM order with no trap.
- Reduced motion: inspected hero/result durations are `0.01 ms`; scrolling is `auto`.
- The 200% text-size and browser-Back focus failures remain release blocking.

## Privacy, requests, and response policy

- During the independent root/demo/edit/reset/privacy/back flow, all five observed requests used only `https://shop-fit-sheet.sociobot.in`; there were no analytics, trackers, billing, fonts, or other third-party requests and no console/page errors.
- Demo edits created only `demo:shop-fit-sheet:project:v1`; the real key was absent. Real persistence was separately confirmed.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. The styled missing route returns HTTP 404. All actual navigation/footer destinations resolve; the external Param Factory link returns 200.
- Live responses carry CSP with same-origin `connect-src` and response-header `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
- HTML and the service worker revalidate; hashed JS is `public, max-age=31536000, immutable`.
- This release has no server-side endpoint, unlock call, sign-in, or payment flow, so 429 allowance and Entra authority checks are not applicable.

## PWA, deployment identity, and performance

- Service worker registration is active and controlling `/`; `registration.update()` completes with no waiting worker. Cache `shop-fit-sheet-v5` exists. Offline reload of `/demo` retains `Demo — Shop Fit Sheet` and `1 conflict to fix`.
- Fresh-build HTML, JavaScript, CSS, and both hero assets match live byte-for-byte. The main JS SHA-256 is `44d54d3060ad2b8a8e3b32c9aad7ba4f70d145d1fe96071510330de7441b0752` locally and live.
- `sw.js` differs only in the order of two URLs in its `SHELL` array; the cache name, logic, and complete URL set are identical. This is non-functional build-order nondeterminism, not evidence of different product code.
- Fresh Lighthouse 13.4.1 mobile audit of live `/demo`: Performance **91**, Accessibility **100**, Best Practices **100**, SEO **100**, FCP **0.9 s**, LCP **1.1 s**, CLS **0**, total payload **99 KiB**. Report: [lighthouse-demo.json](evidence-4/lighthouse-demo.json).

## Required repair before release

1. Keep canonical measurements at higher precision and treat the unit selector as presentation; add a claim regression proving a boundary conflict and measurements survive both conversion directions.
2. Reflow the header/demo banner at 200% text size without overlap, clipping, or lost controls.
3. Preserve demo mode when navigating to its planner; only the explicit `Start for real` action may enter real storage.
4. Enforce and explain count maxima, or remove arbitrary maxima and render every accepted value consistently.
5. Apply route focus/live-region handling to `popstate`, with a regression for browser Back and Forward.

Release only after all five defects are repaired and every claim, full suite, build, live browser, and deployment-identity check passes again.
