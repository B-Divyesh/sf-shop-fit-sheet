# Independent verification — FAIL

Verified on 2026-08-29 against candidate commit `13e65c1b4ce504cc87f9b7e89350b51951540af6` and <https://shop-fit-sheet.sociobot.in>.

## Release decision

**FAIL.** The calculator works and all declared claims pass, but the candidate does not meet two explicit release-contract requirements: 44 px mobile touch targets, and a complete claim register for visitor-reliance copy. These are P2 release blockers under the supplied accessibility, design-principles, and claims contracts. No product source was changed during verification.

## Mandatory claims first

Fresh checkout preparation: `npm ci` completed successfully (22 packages added; zero audit vulnerabilities). I then ran every exact command declared by `.factory/claims.json`, through the shipped `/demo` entry point. Each command ran its desktop Chromium and 390 x 844 mobile project and passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| conflict-check | `npm test -- --grep @claim:conflict-check` | PASS — 2 tests |
| panel-list | `npm test -- --grep @claim:panel-list` | PASS — 2 tests |
| demo-isolation | `npm test -- --grep @claim:demo-isolation` | PASS — 2 tests |
| local-only | `npm test -- --grep @claim:local-only` | PASS — 2 tests |
| offline-reload | `npm test -- --grep @claim:offline-reload` | PASS — 2 tests |

The rerun transcript ended `CLAIMS_OK` with exit code 0. The complete repository suite also passed: `npm test` -> **24 passed** in 1.2 minutes. Its production-build pre-step is the exact `npm run build` command (`tsc --noEmit && vite build`) and emitted `dist/`. There are no separate lint or typecheck scripts; TypeScript checking is part of the build.

## Cold live-page first read

Pass. In a fresh browser context the first screen says **“Check a fitted build before buying stock.”** It says this is **“For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.”** The first primary action is **“Try it with sample data”**, immediately explained by **“See a filled plan and its conflicts.”** One click opens `/demo`, shows the persistent isolated-demo banner, and immediately exposes the realistic van-bed cabinet conflict.

## What passed

- **Candidate/live identity:** `origin/main` resolves to `13e65c1b4ce504cc87f9b7e89350b51951540af6`. Live `main-Bqy6gQO_.js` and `main-B6kgXICn.css` SHA-256 values exactly match a fresh candidate build. The live service worker precaches the same shell set as the fresh build; its two hero entries are ordered differently, which changes its byte hash but not its behavior.
- **End to end:** `/demo` reports “1 conflict to fix” and the exact 10 mm depth conflict. Reducing depth to 740 mm gives “Fits with 1 check.” Negative clearance and zero panel thickness produce specific validation messages and recover after correction. Millimetre/inch conversion produced a 740 mm depth as 29.13 in. The printable build-sheet action invoked `window.print` in the browser smoke test.
- **Demo and local-first privacy:** demo reset/start-real controls are present; the unit suite proves its `demo:` key does not overwrite the real-project key. Live request logs for a cold landing and complete demo flow contained only `shop-fit-sheet.sociobot.in` requests. No analytics, tracking, or off-origin calculator traffic was observed. The live CSP has `connect-src 'self'`; HSTS, `nosniff`, Referrer-Policy, and Permissions-Policy are present.
- **PWA/offline:** live registration had an active `/sw.js` controller and `shop-fit-sheet-v5` cache. `registration.update()` completed, then an offline `/demo` reload still rendered “1 conflict to fix” and the offline indicator.
- **Accessibility smoke checks:** live `/`, `/demo`, `/privacy`, `/terms`, and a missing URL had one `h1`, one `main`, `lang="en"`, route-appropriate titles, and no Axe serious/critical findings. The first Tab reaches the visible skip link; forms use labels and normal keyboard controls. A reduced-motion context reported no active entrance animations. Normal routes had no console/page errors; the deliberately requested missing page naturally logged its HTTP 404 resource failure.
- **Responsive/layout:** at desktop 1440 px and mobile 390 x 844, document scroll width equalled client width. The sample demo had 37 interactive controls and a 300 x 50 px print control on mobile.
- **Deployment policy/performance:** unknown URLs return styled HTTP 404. Hash-named JS and CSS response headers are `Cache-Control: public, max-age=31536000, immutable`; HTML and service worker are short-cache revalidated. Built JS is 21.86 kB (8.11 kB gzip), CSS 15.35 kB (4.35 kB gzip), and mobile/desktop hero WebP files are 30.26/82.60 kB. This is within the stated static-web budgets.
- **Scope checks:** this is a static local-only product with no server-side product endpoint or unlock call, and no sign-in, so rate-limit and Entra-tenant checks are not applicable. The old unavailable billing offer is absent from live and test coverage confirms no `api.sociobot.in` request.

## Defects

### P2 — Several mobile controls are below the required 44 x 44 px touch target

At the required 390 px viewport on live `/demo`, the persistent demo controls measure **Reset demo 86 x 34 px** and **Start for real 91 x 34 px**. The demo-header wordmark is 114 x 37 px; the checkbox itself is 24 x 24 px; footer wordmark and Privacy/Terms/Factory links are 148 x 28, 58 x 24, 47 x 24, and 180 x 24 px respectively. They are reachable by keyboard, but the product contract requires touch targets of at least 44 px. Increase the target/padding (including the label target for the checkbox) without reducing adjacent spacing, then add a 390 px regression test.

Reproduction: open <https://shop-fit-sheet.sociobot.in/demo> in a 390 x 844 viewport and inspect `getBoundingClientRect()` for `button`, footer links, and the checkbox.

### P2 — Visitor-reliance claims are not all registered in `.factory/claims.json`

The required claim register has only five entries, but the landing page and README make additional concrete claims without a corresponding `@claim:<id>` sandbox test. Examples include **“Free calculator and printable build sheet”**, **“Results update while you type,”** README claims of **“Opening, door blank, support, shelf, and back calculations,”** **“Oversize-part checks,”** **“Millimetres and inches,”** and the separate-storage-namespace promise. Some behavior happens to be covered by broader tests, but the claims contract requires each visitor-reliance claim to be listed and independently observable from the demo. Add entries/tests or remove/reword the unsupported copy.

### P3 — Plain-words audit omits visible decorative copy that the supplied copy rule prohibits

`.factory/copy-audit.md` says headings and labels were included, but it omits visible landing strings such as **“Workshop field note · No. 01,”** **“Cabinet specimen, plate 01,”** **“A short field method,”** and **“Scope note.”** The supplied plain-words rule explicitly prohibits metaphor/brand-lore and decorative labels; “A short field method” also does not name the section as clearly as the required content-heading rule. The primary first-read content is clear, so this did not trigger the first-screen gate, but the audit and copy should be corrected before release.

## Reproduction summary

```sh
npm ci
npm test -- --grep @claim:conflict-check
npm test -- --grep @claim:panel-list
npm test -- --grep @claim:demo-isolation
npm test -- --grep @claim:local-only
npm test -- --grep @claim:offline-reload
npm test
npm run build
curl -I https://shop-fit-sheet.sociobot.in/does-not-exist
curl -I https://shop-fit-sheet.sociobot.in/assets/main-Bqy6gQO_.js
```
