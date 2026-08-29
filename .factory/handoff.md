# Shop Fit Sheet review 3 handoff — FAIL

- **Work order:** `shop-fit-sheet-review-3`
- **Reviewed commit:** `52a209ad3582cf96d89ed57e9c577d02d9a162cd`
- **Live URL:** <https://shop-fit-sheet.sociobot.in>
- **Demo URL:** <https://shop-fit-sheet.sociobot.in/?demo=1>
- **Reviewed:** 2026-08-29 UTC

## What was done

Performed the requested adversarial first-read review without changing product code. The detailed report is in [review-3.md](review-3.md).

The cold landing page is clear at 390 × 844 and 1440 × 900. The calculator, storage isolation, reset/exit flow, offline behavior, claims, routes, metadata, accessibility smoke checks, build, and prior functional repairs all pass. Three blocking findings remain:

1. `F-3-1`: the one-click demo returns to the marketing hero; the populated product is below the next viewport.
2. `F-3-2`: the demo banner scrolls away while the visitor uses the sample.
3. `F-3-3 / H-6`: the 404 h1 is still metaphorical copy: “This page is not on the sheet.”

No product code was modified. Only this handoff and `.factory/review-3.md` were added/updated.

## Verification performed

- Fresh no-local clone: `/tmp/shop-fit-sheet-review-3-RYBfNP`
- `npm ci`: passed; 22 packages, zero reported vulnerabilities
- Every exact command in `.factory/claims.json`: passed independently; 11 claims × desktop/mobile = 22 passing executions
- `npm test`: passed; 46 passed and two expected desktop skips; build emitted `dist/`
- Live cold browser checks: 390 × 844 and 1440 × 900
- Live demo: sample, exact conflict, reset, real/demo isolation, exit, and offline reload passed
- Live request audit: same-origin only; no console/page error in the normal demo flow
- Live routes and link crawl: valid routes 200; designed missing route 404; external factory link 200
- Live route metadata and Back/Forward focus checks: passed
- Live Axe serious/critical checks: none on root, demo, privacy, terms, or 404
- `/opt/fleet/lib/verify-url.sh 'https://shop-fit-sheet.sociobot.in/?demo=1'`: passed
- Live JS/CSS hashes match the clean build
- Live mobile 44 px targets, 200% text reflow, count maxima, unit precision, and diagram grammar: passed

## How to reproduce the blockers

1. Open the live root at 390 × 844 or 1440 × 900 in a fresh context.
2. Click **Try it with sample data** once.
3. Confirm that the next viewport still shows the hero, not the sample project or conflict. At 390 px, the verdict begins roughly 4,915 px below the viewport.
4. Scroll to the planner and confirm that the demo banner, Reset, and Start for real controls are no longer visible.
5. Open `/does-not-exist` and confirm the h1 is “This page is not on the sheet,” not “Page not found.”

## Next steps

Render a product-first demo state, make its banner sticky, replace the 404 h1 with plain copy, and add regressions that assert the demo result is inside the immediate viewport and the banner remains visible at the planner and result. Then deploy and repeat the live review.
