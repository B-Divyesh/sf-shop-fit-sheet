# Independent verification 8 — FAIL

- **Requested candidate:** `edee5375d180b11ea6168b4d15a36ed3e9963bd8`
- **Only available remote revision tested:** `edee533a6ddda620f938966a4f5b12333e29e21c` (`origin/main`)
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL**

The requested candidate is not a Git object in the supplied clone or remote. `git fetch origin edee5375…` returned `upload-pack: not our ref`; `git rev-parse --verify` failed; and GitHub's commit API returned HTTP 422, `No commit found for SHA`. `origin/main` still resolves to the stated base, `edee533…`. Consequently, the candidate could not be checked out, its claim tests could not be run, and the live deployment cannot be proven to match it. This is release-blocking even though the available base and live product pass the functional QA below.

No product code was changed during verification.

## First-read gate

**PASS on the live deployment.** Cold desktop and 390 px phone views answer all three required questions in the first viewport:

- What: **“Check a fitted build before buying sheet material.”**
- For whom: home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.
- What to click: **“Try it with sample data”**, beside **“See a filled plan and its conflicts.”**

The click opens the populated van-bed cabinet, its exact 10 mm depth conflict, and a persistent **“Demo — sample data, nothing is saved”** banner with Reset demo and Start for real. Evidence: [desktop](verification-8-evidence/live-cold-desktop.png), [390 px](verification-8-evidence/live/cold-mobile-390.png), and [demo](verification-8-evidence/live/demo-mobile-390.png).

## Mandatory claim gate

`.factory/claims.json` exists and contains 11 entries. Each ID occurs in exactly one tagged test. After `npm ci`, every listed command was run separately through the demo entry point on the only available clean revision. Each passed in desktop Chromium and 390 px mobile Chromium.

| Claim | Exact command | Available-base result |
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

The landing page, legal pages, and README claims are represented in the register; no unlisted visitor-reliance claim was found. The release gate is nevertheless **FAIL** because none of these executions can be attributed to the missing candidate.

## Clean repository gates

- `npm ci`: PASS — 22 locked packages installed; zero audit vulnerabilities.
- `npm test`: PASS — 50 passed, two intentional desktop skips for mobile-only checks.
- `npm run build`: PASS — includes `tsc --noEmit`; `dist/` produced.
- Lint: no separate lint command exists.
- Initial bundles: 27.07 kB JS (9.51 kB gzip), 18.78 kB CSS (5.03 kB gzip), 30.26 kB mobile hero, and no downloaded font. All are within budget.

## Live end-to-end results

The sample produces six panel rows, a 10 mm depth conflict, and the displayed 18 mm stock calculation `5.78 m² + 15% allowance (0.87 m²) = 6.65 m²`. At exactly 740 mm the depth conflict disappears; at 740.01 mm it reports a 0.01 mm conflict. Negative clearance and fractional support values produce clear errors and recover after correction. Demo reset restores the sample and focus; leaving demo deletes the demo key. The print layout generated a 40,114-byte PDF. Evidence: [live audit](verification-8-evidence/live/live-audit.json) and [print PDF](verification-8-evidence/live/demo-build-sheet.pdf).

The same live flow passed at desktop and 390 px. At 390 px there is no horizontal overflow, every visible target is at least 44 px, and 200% text still reflows to the viewport.

Keyboard-only navigation reaches the skip link first, moves through header links to the sample action, opens the demo with Enter, edits a field, and resets with Space. Focus uses a visible 3 px solid outline with 3 px offset. Reduced-motion mode reports `prefers-reduced-motion: reduce`, `scroll-behavior: auto`, and a 0.01 ms animation duration.

Playwright Axe found zero serious or critical issues on `/`, both demo URLs, Privacy, Terms, and the designed HTTP 404. Every route has `lang=en`, one h1, and one main. `verify-url.sh` also passed title, language, landmark, alt text, button labels, and console checks. Evidence: [verify result](verification-8-evidence/verify-url/verify.json).

## Privacy, headers, caching, and PWA

The complete browser flow contacted only `https://shop-fit-sheet.sociobot.in`; it made no analytics, tracker, font-CDN, billing, or API request. Cold root/demo runs had no console or page errors. The recorded 404 console message came only from deliberately requesting `/does-not-exist`; the route correctly returned HTTP 404.

Live HTML and `/sw.js` use `public, max-age=0, must-revalidate`; fingerprinted JS/CSS use `public, max-age=31536000, immutable`. Responses carry HSTS, `nosniff`, strict-origin referrer policy, a restrictive Permissions-Policy, and a self-only CSP with `frame-ancestors 'none'`.

The service worker is activated at `/sw.js`, `registration.update()` completes, cache `shop-fit-sheet-v9` exists, and the demo reloads offline with its conflict intact.

This is a static product with no product API, unlock endpoint, sign-in, library package, or CLI. Rate-limit/429, persistence/concurrency, Entra authority, and consumer-install checks are not applicable.

## Performance

Fresh Lighthouse 13.0.1 mobile results: **99 performance, 100 accessibility, 100 best practices, 100 SEO**; FCP 0.9 s, LCP 1.0 s, CLS 0, TBT 140 ms, and 71 KiB total. A separate 4× CPU / constrained-network Playwright run measured FCP/LCP 1.144 s, CLS 0, and a maximum observed interaction event duration of 152 ms. Evidence: [Lighthouse JSON](verification-8-evidence/lighthouse-live.json).

## Deployment identity

The live root HTML, JavaScript, and CSS are byte-identical to a fresh `edee533…` build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `0b46f76638f939e7a051b3d40670ab3a33cb9b59b76cc8a5971a7c558ab6c9e9` |
| `assets/main-tmwnctVJ.js` | `016b7eed9eb0fe68e03d17f64c103cbe8c824223c7a0a2cf790a344773fabf75` |
| `assets/main-DDrsfY5z.css` | `536382999b8d3629ed4af0f7193fb5cdbb1d0da8e751a349d8584cf624d8df7d` |

The service worker is semantically identical but not byte-identical: the local SHA is `38d70d…`, live is `7a74f1…`, and the only diff is the order of two image URLs in the precache array. This indicates non-deterministic bundle iteration, not a runtime defect. It still prevents an exact all-artifact identity assertion against the available build. More importantly, no comparison to `edee537…` is possible because that commit does not exist remotely.

## Defects by severity

- **Critical — V8-01: requested candidate is unavailable.** The exact SHA cannot be fetched, checked out, tested, or matched to production. Publish the candidate commit to `main` (or provide a reachable ref) and rerun independent verification.
- **Low — V8-02: service-worker build is not byte-reproducible.** The fresh build and live worker differ only in precache URL order. Sort the generated shell list before emission if exact artifact identity is required.
- **High/Medium product defects:** none found on the available live/base implementation.

## Reproduce

```sh
git fetch origin edee5375d180b11ea6168b4d15a36ed3e9963bd8
npm ci
npm test
npm run build
node .factory/verification-8-evidence/live-audit.mjs
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' .factory/verification-8-evidence/verify-url
```
