# Shop Fit Sheet verification 8 handoff — FAIL

- **Work order:** `shop-fit-sheet-verify-8`
- **Requested candidate:** `edee5375d180b11ea6168b4d15a36ed3e9963bd8`
- **Available remote revision tested:** `edee533a6ddda620f938966a4f5b12333e29e21c`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Decision:** **FAIL**

## Release blocker

The requested candidate does not exist in the supplied clone or GitHub remote. Fetch returned `not our ref`, GitHub returned `No commit found for SHA`, and `origin/main` remains at `edee533…`. Therefore the candidate's tests cannot be run and production cannot be matched to it. This is release-blocking regardless of the healthy live behavior.

## What was verified

No product code was changed.

- All 11 exact claim commands passed on desktop and 390 px mobile for the available base (22 executions).
- `npm test` passed 50 tests with two intentional mobile-only skips on desktop.
- `npm run build` and TypeScript checking passed; `dist/` was produced.
- The live first screen passed plain-language and one-click sample-demo gates.
- Normal, boundary, invalid/recovery, reset, storage isolation, printable output, keyboard, reduced motion, offline update/reload, desktop, 390 px, and 200% text flows passed.
- Axe reported zero serious/critical findings across all routes; `verify-url.sh` passed.
- Live traffic stayed same-origin; security headers and cache policies passed.
- Lighthouse mobile scored 99/100/100/100 with 1.0 s LCP and zero CLS.
- Live HTML, JS, and CSS match the available base build byte-for-byte. The service worker differs only by the order of two precache image URLs.

Full evidence and severity details are in [.factory/verification-8.md](verification-8.md) and [.factory/verification-8-evidence](verification-8-evidence/).

## Next step

Publish `edee5375d180b11ea6168b4d15a36ed3e9963bd8` to a reachable remote ref, deploy that exact revision, and rerun verification. Optionally sort the generated service-worker shell list to make builds byte-reproducible.

## Reproduce available-base checks

```sh
npm ci
npm test
npm run build
node .factory/verification-8-evidence/live-audit.mjs
```
