# Independent verification — FAIL

Verified 2026-08-28 against candidate commit `3e286e808e1f853567a79b97b18bc2ae745610b0` and the live URL <https://shop-fit-sheet.sociobot.in>.

## Release decision

**FAIL.** The advertised, paid local-project-library checkout is broken in the live deployment. `GET https://api.sociobot.in/api/v1/products/shop-fit-sheet/checkout` returned HTTP `404` at 18:19 UTC with:

```json
{"error":"enabled factory product","status":404}
```

The product promises a **$9 one-time purchase** and has an enabled “Buy the project library” control. A visitor cannot complete that purchase. This is not a deployment-only uncertainty; it was reproduced directly against the public billing URL. Do not release the paid offer until the product is registered/enabled in the Sociobot billing engine and the full checkout/return/verification path has been tested.

## Required claims first

Fresh locked install: `npm ci` (23 packages, 0 audit vulnerabilities). I ran every command declared in `.factory/claims.json` from the clean candidate checkout, using the product’s `/demo` Playwright entry point:

| Claim | Command | Result |
| --- | --- | --- |
| conflict-check | `npm test -- --grep @claim:conflict-check` | PASS (desktop + 390 px mobile) |
| panel-list | `npm test -- --grep @claim:panel-list` | PASS (desktop + 390 px mobile) |
| demo-isolation | `npm test -- --grep @claim:demo-isolation` | PASS (desktop + 390 px mobile) |
| local-only | `npm test -- --grep @claim:local-only` | PASS (desktop + 390 px mobile) |
| offline-reload | `npm test -- --grep @claim:offline-reload` | PASS (desktop + 390 px mobile) |
| paid-library-price | `npm test -- --grep @claim:paid-library-price` | PASS, but insufficient: it only asserts the destination URL, not a working checkout |

The full local suite then passed: `npm test` → **24 passed** in 1.0m. `npm run build` separately passed, emitting `dist/`; TypeScript checking is part of that build. There are no separate lint/typecheck scripts.

## Cold first read

On a fresh desktop browser context, the first screen says: “Check a fitted build before buying stock.” It says it is for home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles. Its first primary action is “Try it with sample data,” with the immediate explanation “See a filled plan and its conflicts.” It passes the first-read and one-click demo requirement.

## What passed

- Live `/demo` supplies the realistic van-bed cabinet sample and immediately reports “1 conflict to fix”: build depth exceeds cleared depth by 10 mm.
- Normal and boundary/recovery flows passed live: fixing depth to 735 mm gives “Fits with 1 check”; a negative clearance shows the explicit error then recovers; zero panel thickness produces the positive-measurement error then recovers; mm/in conversion works; print control remains present.
- Demo isolation, local storage, same-origin calculator traffic, service-worker registration/update, and offline demo reload passed. The fresh live demo made only same-origin requests (`/demo`, app JS/CSS, hero asset); no console or page errors occurred.
- Service worker was controller-active with `shop-fit-sheet-v4`; offline reload rendered the fit verdict.
- Desktop and 390 × 844 mobile passed: no horizontal overflow; 41 interactive controls were available on mobile; the print target measured 300 × 50 CSS px.
- Keyboard smoke test: Tab lands on the skip link, with a visible solid 3 px focus outline.
- Axe live scan found no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or `/missing-page`; each had one `h1`, one `main`, `lang="en"`, a route-specific title, and no console/page errors.
- Security headers are present: HSTS, CSP, `nosniff`, Referrer-Policy, Permissions-Policy. The live privacy behavior matches the local-only claim for the ordinary demo flow.
- The billing verification endpoint enforces a rate limit. A sequence of invalid-license requests reached `429 Too Many Requests` with `Retry-After: 4` on the 31st probe (after 30 requests in that sequence; an earlier invalid verification had used the same client). The limiter refilled gradually thereafter, so the observed allowance is a 30-request burst, not a fixed request-count window.
- Bundle budget passes: generated `app.js` is 25.47 kB / 9.30 kB gzip; CSS is 15.35 kB / 4.35 kB gzip. The mobile and desktop hero assets are 30.3 kB and 82.6 kB respectively.
- Live deployment matches the candidate artifact: SHA-256 matches for `assets/app.js` (`9a47029e…f512a`), `assets/app.css` (`96033740…df3d`), and `sw.js` (`a969c32e…ce05`).

## Defects

### P1 — live paid checkout is unavailable (release blocker)

As above, the public checkout URL returns HTTP 404. The $9 claim and enabled purchase control must be removed until registration is complete, or the factory must register the product and verify checkout, return token storage, and license verification live. The current claim test must be strengthened to test the observable checkout outcome in a safe test environment.

### P2 — static assets do not meet the cache policy

Live HTML, JS, CSS, and service-worker responses use `Cache-Control: public, must-revalidate, max-age=30`. Assets are un-hashed (`/assets/app.js`, `/assets/app.css`), so the required long-lived immutable caching for hashed static assets is not present. Ship fingerprinted asset names and immutable caching, while retaining a short cache for HTML/service-worker update checks.

### P2 — unknown routes return HTTP 200 instead of a real 404

`https://shop-fit-sheet.sociobot.in/does-not-exist` returns the styled in-app not-found screen but has HTTP status `200`. Configure the Static Web Apps 404 response override/rewrite required by the site contract so unknown routes are served with status `404` while retaining the product-styled recovery link.

## Evidence and reproduction

```sh
npm ci
npm test
npm run build
curl -i https://api.sociobot.in/api/v1/products/shop-fit-sheet/checkout
curl -I https://shop-fit-sheet.sociobot.in/does-not-exist
curl -I https://shop-fit-sheet.sociobot.in/assets/app.js
```

The local test transcript was captured at `/tmp/shop-fit-sheet-full-suite.log` in the verification container. No product source code was changed for this verification.
