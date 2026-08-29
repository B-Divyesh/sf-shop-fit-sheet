# Independent verification 9 — PASS

- **Candidate tested:** `d62ef193280e61efb4a4ac695ac9cd9dba580554`
- **Repository state at verification:** local `HEAD`, `origin/main`, and the SHA advertised by `git ls-remote origin refs/heads/main` were all `d62ef193280e61efb4a4ac695ac9cd9dba580554`.
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Verified:** 2026-08-29 UTC
- **Decision:** **PASS**

No product code was modified during verification.

## First-read and demo gate

**PASS.** In a fresh desktop browser context, the first screen says:

- **What it does:** “Check a fitted build before buying sheet material.”
- **For whom:** “For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.”
- **What to do first:** the visible primary action is **“Try it with sample data”**, with “See a filled plan and its conflicts.” beside it.

The one-click action opens the populated van-bed cabinet sample. The project title, `1 conflict to fix`, and “Build depth exceeds the cleared space by 10 mm.” are all in the initial desktop and 390 px mobile viewport. The persistent banner reads “Demo — sample data, nothing is saved” and offers **Reset demo** and **Start for real**.

## Mandatory claim gate

`.factory/claims.json` exists and contains 11 claims. From the provided clean candidate checkout, `npm ci` installed 22 locked packages with zero audit vulnerabilities. Every registered command was run separately, using the product’s demo entry point; each passed in Chromium desktop and the 390 px mobile project (22 passing claim executions total):

| Claim | Exact command | Result |
| --- | --- | --- |
| `conflict-check` | `npm test -- --grep @claim:conflict-check` | PASS |
| `panel-list` | `npm test -- --grep @claim:panel-list` | PASS |
| `sheet-area-allowance` | `npm test -- --grep @claim:sheet-area-allowance` | PASS |
| `calculated-parts` | `npm test -- --grep @claim:calculated-parts` | PASS |
| `stock-fit-check` | `npm test -- --grep @claim:stock-fit-check` | PASS |
| `unit-conversion` | `npm test -- --grep @claim:unit-conversion` | PASS |
| `live-results` | `npm test -- --grep @claim:live-results` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `demo-namespace` | `npm test -- --grep @claim:demo-namespace` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |

The landing page, README, demo documentation, Privacy, and Terms copy were cross-checked against the register. No unlisted visitor-reliance claim was found.

## Clean repository gates

- `npm run typecheck`: **PASS**.
- `npm run build`: **PASS**; it produced `dist/`.
- `npm run test:release`: **PASS**; release identity guard passed and two isolated production builds matched all 17 generated files byte-for-byte.
- `npm test`: **PASS**; 54 Playwright test definitions across desktop and mobile completed successfully (mobile-only checks are intentionally skipped in the desktop project).
- There is no separate lint script. TypeScript checking, Vite production build, release checks, and Playwright are the applicable checks.
- `npm run verify:release`: **PASS**; it confirmed the candidate, fetched `origin/main`, and advertised branch SHA are identical.
- `git diff --check`: **PASS** before recording this report.

The built initial JavaScript is 27.07 kB (9.51 kB gzip), CSS is 18.78 kB (5.03 kB gzip), and the mobile hero is 30.26 kB. All meet the static product budgets; no runtime font download occurs.

## Product, accessibility, and responsive QA

The real job-to-be-done works end to end. The realistic sample yields six panel rows, a 10 mm depth conflict, and `5.78 m² + 15% allowance (0.87 m²) = 6.65 m²` for the 18 mm material. At 740 mm the depth conflict clears; at 740.01 mm it reports the exact 0.01 mm conflict. A negative clearance produces “Clearances and gaps cannot be negative.” and clears after entering a valid value. The covered claim runs additionally verify oversize stock-sheet handling, whole-number/count maxima, millimetres/inches round trips, live results, printable-sheet invocation, demo reset, and real/demo storage isolation.

Desktop (1440×900) and 390×844 mobile were exercised. At 390 px there is no horizontal overflow, every visible interactive control is at least 44 px in both dimensions, and simulated 200% text remains within the 390 px viewport. With reduced motion requested, the page reports `prefers-reduced-motion: reduce` and uses `scroll-behavior: auto`.

Keyboard-only coverage confirms Tab reaches the skip link first, its designed focus indicator is a visible `3px solid` outline, and Enter moves focus to `main`. The suite also covers route focus/announcement on Back and Forward and form controls. Axe in a fresh live browser found **zero serious or critical findings** on `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the live HTTP 404. `/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1'` passed: HTTP 200, title, `lang=en`, one h1, main landmark, complete image alt text, labeled buttons, and no console errors.

## Privacy, deployment, PWA, and response policy

The complete live browser flow, including cold landing, demo, edits, legal routes, and offline reload, issued requests only to `https://shop-fit-sheet.sociobot.in`. It made no analytics, tracking, billing, font-CDN, API, or other off-origin request; no console or page errors occurred (the intentional 404 console noise was excluded from the normal-route audit). Demo storage uses `demo:shop-fit-sheet:project:v1`; the real key remained separate and Start for real discarded the demo key.

The deployed root, demo, Privacy, Terms, 404 shell, service worker, manifest, icons, all three images, JavaScript, and CSS all matched this candidate’s fresh `dist/` build byte-for-byte. The live service worker activated as `shop-fit-sheet-v10`, `registration.update()` left no waiting worker, and the sample reload succeeded while offline.

HTML and `sw.js` return `public, max-age=0, must-revalidate`; fingerprinted JavaScript and CSS return `public, max-age=31536000, immutable`. Live responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a self-only CSP including `frame-ancestors 'none'`, and a restrictive Permissions-Policy. The styled missing-page route returns HTTP 404.

This is a static, local-first calculator with no server-side product endpoint, product unlock call, sign-in, package/CLI API, or backend persistence. Rate-limit/429, Entra identity, consumer-package, and backend concurrency checks are not applicable.

## Performance

Fresh Lighthouse 13.4.1 mobile against the live demo scored **95 performance, 100 accessibility, 100 best practices, and 100 SEO**. It measured FCP **0.9 s**, LCP **1.0 s**, CLS **0**, TBT **260 ms**, and total transfer **71 KiB**. The artifact budgets and Lighthouse category threshold pass.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Reproduce

```sh
npm ci
npm run typecheck
npm run test:release
npm test
npm run build
npm run verify:release
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' /tmp/shop-fit-verify-url
```
