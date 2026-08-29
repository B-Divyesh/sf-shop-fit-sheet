# Independent verification 7 — PASS

- **Candidate:** `f1337477b29924a52947070f316655684af96e41`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Verified:** 2026-08-29 UTC
- **Decision:** **PASS**

Independent QA made no product-code changes. The live deployment exactly matches the candidate's built HTML, service worker, JavaScript, CSS, and image files.

## Mandatory claim gate

`.factory/claims.json` exists with 11 claims. From the clean candidate checkout, after `npm ci` (22 locked packages, zero audit vulnerabilities), each listed command was run separately through the demo entry point. All passed in both desktop Chromium and 390 px mobile Chromium.

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

Landing-page and README visitor-reliance claims were cross-checked against this register; none was unlisted.

## Cold first-read gate

**PASS.** A cold live root clearly says what it does — “Check a fitted build before buying sheet material” — and who it is for: home makers fitting cabinets or benches into garages, utility rooms, and vehicles. The visible one-click action is “Try it with sample data,” explained as “See a filled plan and its conflicts.” It opens the isolated, realistic van-bed sample with the 10 mm depth conflict, calculated parts, and persistent demo banner with Reset demo and Start for real.

## Repository and end-to-end gates

- `npm test`: **PASS** — 48 tests across desktop and mobile.
- `npm run build`: **PASS**, including `tsc --noEmit`; `dist/` emitted.
- No separate lint script exists; TypeScript checking is part of the production build.
- Initial JS: 25,569 bytes / 9.18 KiB gzip. CSS: 16,605 bytes / 4.60 KiB gzip. Mobile hero: 30,256 bytes. No downloaded font.
- Fresh live desktop and 390 px checks covered the normal sample; exact 740 mm fit boundary; 740.01 mm conflict; negative-clearance and fractional-count error/recovery; oversize stock; print; demo reset; keyboard-only skip-link/focus; no horizontal overflow; and 44 px targets. All passed.
- With reduced motion, computed animation duration was 0.01 ms and `scroll-behavior` was `auto`.
- Playwright Axe found zero serious/critical issues. Console and page-error arrays were empty.
- `verify-url.sh` passed HTTP 200, title, `lang=en`, one h1, main, image alts, labeled buttons, and console checks.
- Complete live demo-flow request logs were same-origin only (`https://shop-fit-sheet.sociobot.in`). There were no trackers, analytics, billing, CDN-font, or calculator calls.
- Service worker `/sw.js` controlled the page with cache `shop-fit-sheet-v8`; the sample reloaded offline with “1 conflict to fix.”

There is no server endpoint, account/sign-in, payment, or product unlock in this static product. API allowance/429, Entra authority, backend concurrency/persistence, and library/CLI consumer checks are not applicable.

## Headers, caching, and deployment identity

Live responses include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, restrictive Permissions-Policy, and self-only CSP with `frame-ancestors 'none'`. HTML and `/sw.js` use `public, max-age=0, must-revalidate`; hashed assets use `public, max-age=31536000, immutable`. The designed unknown-page response is a real HTTP 404.

| Matching live/candidate artifact | SHA-256 |
| --- | --- |
| `index.html` | `7f2052367bc79460a76f4b05e71994cacdd8f2fb49df66c0611a2996f7ccd1fd` |
| `demo/index.html` | `47dac080c4f90fb30155ded12ecb6f711d78086f788424edf25ae89f6bdb0cfd` |
| `privacy/index.html` | `e0d3a17d38b821cc951026a0654f3697a29643427517ce0bb8dac02b1f0db6c0` |
| `terms/index.html` | `100d44a29b424edd2d2fdf03bf7f87ba775bc8e6b390b148695130b7d430af47` |
| `404.html` | `f696137ab9a1df5f0a28b8a49f1d080459ed41b34e48ee3b55e7430c2e75f808` |
| `sw.js` | `c43efab607fce4a4863f106dd17750a6e5cbec5033a10548ef57cb8a349708b9` |
| `assets/main-Dr6XEvF5.js` | `674ed5ae5fbfd2ea72e259cd72827478ea8a2825a49a440702288a1c655b746c` |
| `assets/main-BoV9wXCl.css` | `43f0ba36b245599488a70b6ee85c8c00f371871f4efefe302ae16535fcec41f3` |

I attempted a fresh Lighthouse mobile run with Lighthouse 13.4.1 and the supplied Playwright Chromium. The CLI could not connect to that bundled browser, including with `--no-sandbox`; that is a container limitation, not a page failure. It is not used to substitute for the independent runtime, accessibility, responsive, headers, and budget checks above.

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
mkdir -p /tmp/shop-fit-verify7-url
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' /tmp/shop-fit-verify7-url
```
