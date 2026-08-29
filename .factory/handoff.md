# Shop Fit Sheet polish 3 handoff — PASS

- **Work order:** `shop-fit-sheet-polish-3`
- **Base:** `a68b488f218ea546857513b15cdbb0db39c922dd`
- **Repair code:** `0df2ff72e2ad2548b9e657ef207c7ce49430d54a`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Deployment:** Azure Static Web Apps `19bc03ff-46bd-4cc3-9a73-e56a9304eb94`
- **Verified:** 2026-08-29 UTC

## What changed

The one-click demo now opens on the populated product, with the sample project, calculated verdict, and first conflict visible in the immediate desktop and phone viewport. Its demo status, Reset demo, and Start for real controls remain sticky while the visitor works. Reset restores the sample without touching real data.

The 404 h1 now says **Page not found**. The earlier first-screen copy, diagram grammar, allowance arithmetic, unit precision, count limits, demo isolation, route titles and metadata, history focus, legal links, responsive behavior, offline shell, and complete claim coverage were retained and re-verified. The distinct annotated field-guide design remains intact.

The catalog description is now: **Check a fitted build before buying sheet material.**

The full finding-to-change-to-evidence ledger is in [polish-3.md](polish-3.md).

## Verification

- Final clean clone at `0df2ff72e2ad2548b9e657ef207c7ce49430d54a`
- `npm ci`: passed; 22 packages, zero reported vulnerabilities
- Every exact `.factory/claims.json` command: passed independently; 11 claims × desktop/mobile = 22 passing executions
- `npm test`: 50 passed, two expected desktop skips
- `npm run build`: passed; `dist/` produced
- Initial bundle: 27.07 kB JS / 9.51 kB gzip and 18.78 kB CSS / 5.03 kB gzip
- Live cold checks at 1440 × 900 and 390 × 844: passed
- Live demo first viewport, sticky controls, reset, exit, sample calculations, and real/demo storage isolation: passed
- Live routes: five intended routes returned 200; designed missing route returned 404
- Live titles, canonicals, one h1, one main, focus restoration, announcements, and legal links: passed
- Live Axe serious/critical scan on root, both demo URLs, Privacy, Terms, and 404: zero findings
- Live network/privacy audit: same-origin requests only; no console or page errors
- Live offline reload: passed from service-worker cache `shop-fit-sheet-v9`
- Live 390 px target-size and 200% text-reflow checks: passed
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 0.9 s, LCP 1.0 s, CLS 0, TBT 50 ms, 71 KiB transferred
- `/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1'`: passed
- Deployed HTML, hashed JS/CSS, and service worker match the verified `dist/`

Screenshots, Lighthouse reports, verifier output, and the browser audit are under `.factory/evidence-polish-3/`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

Then open <http://localhost:4173/?demo=1>. To repeat the live audit:

```sh
node .factory/evidence-polish-3/live-qa.mjs \
  https://shop-fit-sheet.sociobot.in \
  .factory/evidence-polish-3/live
```

## Known gaps

None.
