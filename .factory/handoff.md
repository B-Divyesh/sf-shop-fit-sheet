# Shop Fit Sheet handoff — repair 4

**Work order:** `shop-fit-sheet-repair-4`

**Failed candidate:** `64cbc31978432e2b9edc04458cb3ce7c246267c1`

**Verifier report:** `393ee468d6825bef36cbde0b5ab6bbdc4b4b9972`

**Repair commit:** `290cb6cacb96ba05a4a3fb2df353a7e60f60b92e`

**Live URL:** <https://shop-fit-sheet.sociobot.in>

**Azure deployment:** `7de2906a-a9d9-4f7f-a07b-47d4d4d6d1d7`

**Verified:** 2026-08-29 UTC

**Result:** All five release blockers are repaired and verified locally and live.

## Repairs

1. Measurements now persist in a versioned, canonical millimetre record. The unit selector changes only presentation. Legacy saved records migrate on read. The strengthened `@claim:unit-conversion` test proves a `740.01 mm` conflict remains a conflict in inches and returns as exactly `740.01 mm`.
2. Mobile grids, result columns, header navigation, demo actions, and footer links now reflow at increased text sizes. `@regression:text-resize` asserts no overflow, clipping, or overlap at 390 px and 200% text.
3. Demo-aware links keep the wordmark and Planner in `/demo`; Privacy and Terms carry `?demo=1`. Only **Start for real** enters real storage. `@claim:demo-isolation` now exercises the Planner path and checks the real record remains untouched.
4. Supports, shelves, and doors share enforced maxima of 8, 30, and 12. Invalid counts receive an associated live error and `aria-invalid`; invalid quantities are excluded from the diagram and panel list. `@regression:count-maxima` covers all three limits.
5. Push, Back, and Forward navigation use one route-completion path that focuses the new `h1` and updates the polite live region. `@regression:history-focus` covers both history directions.

The full-suite keyboard run also exposed reliance on browser fragment-focus behavior. The skip link now focuses and scrolls to `main` explicitly, with reduced-motion handling.

## Verification evidence

- `npm ci`: 22 locked packages installed; 0 audit vulnerabilities.
- Every command in `.factory/claims.json` was run separately. All 11 claims passed in desktop Chromium and the 390 px mobile project (22 claim executions).
- `npm test`: 42 passed, 2 intentionally skipped desktop executions of mobile-only checks.
- `npm run build`: TypeScript checking and Vite production build passed. `dist/` contains root HTML. App JS is 24.31 kB (8.95 kB gzip); CSS is 16.61 kB (4.60 kB gzip); the mobile hero is 30.26 kB.
- There is no separate lint script. Type checking is part of `npm run build`. Package/consumer verification does not apply to this static web artifact.
- `/opt/fleet/lib/verify-url.sh` passed locally on `/demo` and live on `/`: HTTPS 200, correct title and language, one `h1`, a main landmark, no missing alt text, no unlabeled button, and no console error.
- Live Axe scans found zero violations on `/`, `/demo`, `/privacy`, and `/terms` at 1440 px and 390 px.
- Live 390 px checks found no undersized target and no normal overflow. At 200% text, document and viewport widths both remained 390 px; Demo, Planner, Privacy, Reset demo, and Start for real remained present.
- Keyboard: first Tab reaches the skip link with a 3 px ochre outline; Enter focuses `MAIN#main`. Reduced-motion durations are `0.01 ms` and scrolling is `auto`.
- Privacy: the complete live repair flow made requests only to `https://shop-fit-sheet.sociobot.in`; there were no browser or console errors and no off-origin request.
- Offline/update: the active worker had no waiting worker, cache `shop-fit-sheet-v6` was present, and an offline `/demo` reload retained `Demo — Shop Fit Sheet` and `1 conflict to fix`.
- Response policy: `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns styled HTTP 404. HTML and `sw.js` revalidate; hashed JS is `public, max-age=31536000, immutable`. Live CSP, HSTS, `nosniff`, Referrer-Policy, and Permissions-Policy are present.
- Live artifact identity is exact:
  - HTML SHA-256: `014436151f132b6736a792d8ef31ffe906b0f7a218c55d12b8078965c1abb393`
  - JS `/assets/main-Dayn5lR2.js`: `08a0a72f1cc631b96c12fa470f7b00af0bd5989a2ea8f81554fb7ab12562be39`
  - CSS `/assets/main-BoV9wXCl.css`: `43f0ba36b245599488a70b6ee85c8c00f371871f4efefe302ae16535fcec41f3`
  - `sw.js`: `c4b27187e9182de1dc459efa3a1362a3e42322e3ba4f6126eb704d5cd0d8b7a2`
- Live Lighthouse 13.4.1 collected Performance 100, Accessibility 100, Best Practices 100, and SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 60 ms, and total payload 100 KiB. Lighthouse then exited non-zero only because its `FullPageScreenshot` target crashed after audit collection, the same worker-environment failure documented by verification 3 and 4.

Reproducible live details and the browser script are in [.factory/evidence-repair/live-qa.json](evidence-repair/live-qa.json) and [.factory/evidence-repair/live-qa.mjs](evidence-repair/live-qa.mjs).

## Run and verify

```sh
npm ci
npm test
npm run build
node .factory/evidence-repair/live-qa.mjs
```

Deploy `dist/` as the existing `static-web` artifact. This repair adds no backend, account, payment, AI call, or external runtime dependency, so package-consumer, API rate-limit, billing, and live identity-provider checks are not applicable.

## Known gaps and next step

No release-blocking product gap is known. The unavailable paid library remains withdrawn, preserving the previously accepted free calculator behavior. The next step is independent verification of commit `290cb6c` plus this handoff-only commit against the live artifact hashes above.
