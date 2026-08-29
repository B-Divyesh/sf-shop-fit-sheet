# Shop Fit Sheet handoff — perfection-loop polish 1

**Work order:** `shop-fit-sheet-polish-1`  
**Released candidate:** `771e6b23c3455e99b865cf4f7d5101f2f1045c13`  
**Review commit:** `62bf8236240e686b9c3a6e2a15241f88db2f1444`  
**Repair commit:** `1e8b6ff973970dbdeb16e62e593bf9cd2832f04b`  
**Live URL:** <https://shop-fit-sheet.sociobot.in>  
**Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>  
**Deployment:** Azure Static Web Apps `3edb82b4-f280-46d0-9307-f8478d6e3c0c`  
**Result:** PASS — every current and historical finding is resolved locally and live.

## What changed

- Rewrote the first-screen headline to “Check a fitted build before buying sheet material” and updated the copy audit and terminology record.
- Made `/?demo=1` the visible one-click sample entry, demo-aware navigation path, documentation URL, claim-test entry, and offline-precache URL.
- Kept demo data isolated under `demo:shop-fit-sheet:project:v1`; the banner, reset, Start for real, Planner navigation, and real-data preservation are browser-tested.
- Added complete static and client-updated descriptions, canonicals, Open Graph, and Twitter metadata for the landing, demo, privacy, terms, and styled 404 routes.
- Strengthened browser coverage for the first screen, reset behavior, query demo, route metadata, and emitted static metadata.
- Updated `.factory/catalog-description.txt` with a 51-character verb-first description.
- Rechecked all older checkout, caching, 404, claims, allowance, conversion, validation, focus, privacy, offline, accessibility, and mobile findings. The complete map is in `.factory/polish-1.md`.

The existing botanical workshop field-guide identity remains intact. This stays a Vite + TypeScript static web artifact with no backend, account, payment provider, AI call, analytics, runtime font, or third-party script.

## Exact verification evidence

- Clean clone: `/tmp/shop-fit-sheet-polish-clean-dv7DMW` at repair commit `1e8b6ff973970dbdeb16e62e593bf9cd2832f04b`.
- `npm ci`: 22 locked packages installed; 0 audit vulnerabilities.
- Every `.factory/claims.json` command passed separately: 11 claims in desktop Chromium and 390 px mobile Chromium, 22 passed executions total.
- Clean-clone `npm test`: 44 passed, 2 expected desktop skips for mobile-only assertions.
- `npm run build`: passed TypeScript checking and Vite production build; `dist/index.html` exists.
- Production sizes: JS 25.55 kB / 9.17 kB gzip; CSS 16.61 kB / 4.60 kB gzip; mobile hero 30.26 kB; social image 67.35 kB; total live transfer 100 KiB.
- Local verifier: `.factory/evidence-polish-1/local/verify.json`; no console errors.
- Live verifier: `.factory/evidence-polish-1/live/verify.json`; no console errors.
- Live browser audit: `.factory/evidence-polish-1/live-qa.json`; all deployed artifact hashes match `dist/`, and all route Axe serious/critical results are empty.
- Live screenshots: `.factory/evidence-polish-1/live/screenshot-desktop.png` and `.factory/evidence-polish-1/live/screenshot-mobile.png`.
- Lighthouse: `.factory/evidence-polish-1/lighthouse-live.json` — Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 130 ms.

The live cold check confirmed the repaired headline, `/?demo=1` action, banner, realistic sample, reset, separate storage key, Planner isolation, Start for real, unit boundary, count limits, history focus, complete route metadata, legal links, styled 404, 44 px targets, 200% text reflow, reduced motion, same-origin requests, and offline reload.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

Then open <http://127.0.0.1:4173/?demo=1>. To rerun the live evidence:

```sh
/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1' .factory/evidence-polish-1/live
node .factory/evidence-polish-1/live-qa.mjs
```

## Known gaps and next steps

None. No finding of any severity remains unresolved.
