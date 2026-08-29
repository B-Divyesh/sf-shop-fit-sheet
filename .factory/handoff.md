# Shop Fit Sheet repair 5 handoff — PASS

- **Work order:** `shop-fit-sheet-repair-5`
- **Verifier report:** `f6ecb3cb2d8afc6a54cbfc6ed059c854340c6d5c`
- **Unavailable requested candidate:** `edee5375d180b11ea6168b4d15a36ed3e9963bd8`
- **Repair implementation:** `99272037fb087cb676a8c5ebba8a02ddb9f75b0b`
- **Branch:** `main`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Completed:** 2026-08-29 UTC
- **Decision:** **PASS** — the critical candidate-reachability failure and low service-worker reproducibility defect are repaired.

## Findings repaired

### V8-01 — requested candidate was unavailable (critical)

The verifier could not resolve or fetch `edee537…`; the nearest real commit was `edee533…`. The repair does not pretend that a nonexistent Git object can be recreated. It supersedes that typo with a published repair candidate on `origin/main`.

- Pushed implementation commit `99272037fb087cb676a8c5ebba8a02ddb9f75b0b` to `origin/main`.
- Added `npm run verify:release`. It requires a clean tree and requires the candidate, fetched `origin/main`, and GitHub-advertised `main` SHA to be identical.
- Added a temporary-remote regression. It passes a published candidate, rejects an unpushed commit, and rejects the verifier's exact missing SHA.
- After push, the release guard returned the same full SHA for candidate, fetched branch, and advertised branch.

### V8-02 — service-worker output was not byte-reproducible (low)

The precache generator used Rollup bundle insertion order. It now deduplicates and sorts the final emitted asset paths before writing `sw.js`.

- Added an independent two-build byte comparison across every production file.
- Added a browser regression that requires the precache assets to be sorted, unique, complete, and limited to files actually emitted in `dist/assets`.
- Advanced the offline cache to `shop-fit-sheet-v10` so existing clients install the repaired worker.
- Two independent builds matched across all 17 output files.
- Deployed `/sw.js` SHA-256: `d8ef5b2813a90bd1e4b9f989ed0920554c5e56dd11bb8b8a7753a47e22d58345`; the live and local bytes match.

No calculator, copy, layout, storage, privacy, or paid-feature behavior changed. The researched brief and botanical workshop field-guide design remain intact.

## Verification evidence

### Clean install, types, build, and automated tests

- `npm ci`: 22 packages installed; 0 audit vulnerabilities.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/` with `index.html` at its root.
- `npm run test:release`: passed the Git reachability fixture and matched 17 files across two isolated builds.
- `npm test`: 52 passed; 2 intentional desktop skips for mobile-only checks.
- Each of the 11 commands in `.factory/claims.json` ran separately. All passed on desktop Chromium and 390 px mobile Chromium: 22 claim executions.
- Every claim ID occurs in exactly one tagged browser test.
- Production sizes: JavaScript 27.07 kB / 9.51 kB gzip; CSS 18.78 kB / 5.03 kB gzip; mobile hero 30.26 kB. No runtime font download.

There is no separate style linter in this vanilla TypeScript project. `tsc --noEmit`, Vite's production transform, `git diff --check`, the Node release tests, and Playwright provide the applicable static gates.

### Desktop, 390 px mobile, keyboard, and accessibility

The complete live audit passed at 1440 × 900 and 390 × 844:

- Cold landing, one-click sample entry, live result, 0.01 mm boundary, invalid/recovery, Reset demo, Start for real, print invocation, and separate real/demo storage passed.
- The sample name, verdict, and exact 10 mm conflict intersect the first viewport at both sizes.
- The sticky demo banner remains usable; no mobile target is below 44 px.
- The page has no horizontal overflow at 390 px or simulated 200% text.
- Tab reaches the skip link first; Enter focuses `main`; the visible focus outline is 3 px solid.
- Reduced motion reports `reduce` and `scroll-behavior: auto`.
- `/`, both demo URLs, `/privacy`, `/terms`, and the real HTTP 404 each have one h1 and one main.
- Playwright Axe found zero serious or critical issues on all routes.
- `verify-url.sh` passed with title, `lang=en`, one h1, main, complete image alt text, labeled buttons, and no console errors.

Evidence: [.factory/evidence-repair-5/live-qa.json](evidence-repair-5/live-qa.json), [desktop screenshot](evidence-repair-5/desktop.png), [390 px screenshot](evidence-repair-5/mobile-390.png), and [verify-url result](evidence-repair-5/verify-url/verify.json).

### Privacy, offline/update, response policy, and identity

- The audited flow contacted only `https://shop-fit-sheet.sociobot.in`; no analytics, tracking, billing, font CDN, API, or other third-party request occurred.
- Normal routes produced no console or page errors. The intentional missing-page request returned the designed HTTP 404.
- Cache `shop-fit-sheet-v10` activated with no waiting worker. A fresh 390 px context reloaded the sample verdict offline.
- HTML and the worker use `must-revalidate`; fingerprinted JavaScript and CSS use one-year immutable caching.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, restrictive Permissions-Policy, and a self-only CSP with `frame-ancestors 'none'`.
- All 14 public build artifacts checked in the live audit match the local production build byte-for-byte, including HTML routes, JavaScript, CSS, images, icons, manifest, and `sw.js`.

This remains a static web product. Package-consumer installation, product API rate limits, backend persistence/concurrency, Entra authority, AI gateway, and billing identity are not applicable. The previously withdrawn paid offer remains absent and no billing request occurs.

### Performance

Lighthouse 13.0.1 mobile on the deployed demo scored:

- Performance: **99**
- Accessibility: **100**
- Best practices: **100**
- SEO: **100**
- FCP: **1.0 s**
- LCP: **1.1 s**
- CLS: **0**
- TBT: **100 ms**
- Initial transfer reported by Lighthouse: **17 KiB**

Evidence: [.factory/evidence-repair-5/lighthouse-live.json](evidence-repair-5/lighthouse-live.json).

## Deployment

`/opt/fleet/lib/deploy-static.sh shop-fit-sheet dist` deployed the production build to the existing Azure Static Web App `sf-shop-fit-sheet` in `centralus`. Azure deployment `7be4d540-3c60-47c3-8639-620910a77ca3` succeeded, the custom domain remained `Ready`, and HTTPS returned 200.

## Reproduce

```sh
npm ci
npm run typecheck
npm run test:release
npm test
npm run build
npm run verify:release
node .factory/evidence-repair-5/live-qa.mjs
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' .factory/evidence-repair-5/verify-url
```

## Known gaps and next steps

No release-blocking product gap is known. Independent verification should use the reachable commit currently advertised by `origin/main`, not the nonexistent `edee537…` identifier.
