# Shop Fit Sheet handoff — perfection-loop polish 2

- **Work order:** `shop-fit-sheet-polish-2`
- **Released candidate:** `806a79f48f10ea538ed80b9f37062345124073eb`
- **Review commit:** `5b73204003c525b68f96b8b92e0e2c921b385dae`
- **Repair code commit:** `e4f62e9bf1d8d89503929bb4845498f6b723f573`
- **Deployment:** Azure Static Web Apps `a22e3e3c-734f-41c9-9298-1f589ee0187d`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>

**Result:** PASS — every current and historical finding is resolved locally and on the deployed site.

## What changed

- Fixed F-2-1 by announcing “1 centre support” and pluralizing only other counts.
- Added `@regression:diagram-support-grammar` for the shipped one-support sample and a two-support edit in desktop and mobile browsers.
- Updated the service-worker cache to `shop-fit-sheet-v8` so existing installations receive the repair.
- Updated the round-2 copy audit and the verb-first, 48-character catalog description.
- Rechecked every earlier first-screen, demo, claim, paid-offer, cache, 404, mobile, copy, calculation, conversion, routing, focus, legal, metadata, privacy, offline, keyboard, and accessibility finding.

The existing paper-toned botanical workshop field-guide design is unchanged. The artifact remains a Vite + TypeScript static site with no backend, account, payment provider, analytics, runtime font, third-party script, or AI call.

## Exact verification

- Clean clone: `/tmp/shop-fit-sheet-polish-2-clean-TPFddR` at `e4f62e9bf1d8d89503929bb4845498f6b723f573`.
- `npm ci`: 22 locked packages; zero audit vulnerabilities.
- All 11 exact claim commands passed independently in both desktop Chromium and 390 px mobile Chromium: 22 passing executions.
- Clean-clone `npm test`: 46 passed; two expected desktop skips for mobile-only checks.
- Clean-clone `npm run build`: passed; `dist/index.html` and all static route files exist.
- Build sizes: JS 25.57 kB / 9.18 kB gzip; CSS 16.61 kB / 4.60 kB gzip; mobile hero 30.26 kB.
- Local verifier and screenshots: `.factory/evidence-polish-2/local/`.
- Live verifier and screenshots: `.factory/evidence-polish-2/live/`.
- Cold live browser audit: `.factory/evidence-polish-2/live-qa.json`; source-to-live hashes match, valid routes have no console errors, and all serious/critical Axe arrays are empty.
- Live F-2-1 evidence: the diagram description is exactly “The build is 1,350 by 800 mm with 1 centre support.” After editing the count it is exactly “The build is 1,350 by 800 mm with 2 centre supports.”
- Live privacy: every observed request stayed on `https://shop-fit-sheet.sociobot.in`; no analytics, tracking, billing, CDN, or calculator request left the origin.
- Live offline: cache `shop-fit-sheet-v8` reloaded `/?demo=1` offline with the sample verdict.
- Live mobile: no horizontal overflow at 390 px or 200% text; no visible target below 44 px.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 0.9 s, CLS 0, TBT 40 ms, total transfer 100 KiB. Report: `.factory/evidence-polish-2/lighthouse-live.json`.

The complete finding-to-change-to-evidence map is in `.factory/polish-2.md`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

Then open <http://127.0.0.1:4173/?demo=1>. The production verification commands are:

```sh
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' .factory/evidence-polish-2/live
node .factory/evidence-polish-2/live-qa.mjs
```

## Known gaps and next steps

None. No finding of any severity remains unresolved.
