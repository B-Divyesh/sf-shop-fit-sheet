# Shop Fit Sheet verification handoff — FAIL

**Tested candidate:** `c00cc73c979a55d00f8ee81c84d02561c1f986e0`
**Live URL:** <https://shop-fit-sheet.sociobot.in>
**Report:** `.factory/verification-3.md`
**Decision:** **FAIL — do not release.**

## Blocking defect

**P2 release blocker: unregistered quantitative claim.** The live panel list says “Includes 15% area waste” and the README promises a “15% sheet-area allowance,” but `.factory/claims.json` does not register that number and no tagged claim test measures it. The closest claim only proves a rough sheet list and printing. The supplied claims contract requires every quantitative public claim to state and test its number; it explicitly makes an unlisted public claim a review failure.

Repair by either removing the 15% promise or adding an exact claim-register entry and a deterministic `@claim:` test that verifies the 15% calculation. Reverify after repair.

## What independently passed

- Clean `npm ci`: 22 packages, 0 reported vulnerabilities.
- Every existing registered claim command passed from the clean install. Full `npm test`: 35 passed, 1 intentional mobile-only desktop skip; production type-check/build passed and emitted `dist/`.
- Live first-read and one-click demo gates passed. Core fit, stock, unit, invalid-input/recovery, printing, demo isolation, local-only traffic, offline reload, desktop/mobile, keyboard focus, reduced motion, console/page-error, and Axe checks passed.
- Live JS exactly matched the fresh candidate build: `main-DvNr9ka2.js`, SHA-256 `2be269908189f5774155f3d7552b1f2058cbcc620a38f8c5d4e28fff99995257`.
- The static PWA service worker controls `/demo`, update check completes, and offline reload succeeds. Live headers, styled 404, immutable hashed assets, CSP, and bundle budgets passed. Lighthouse recorded 95 Performance / 100 Accessibility before its post-audit screenshot target crashed; see the report for the caveat.

No product code was modified by this verifier. There are no product server endpoints, sign-in, or billing flows to rate-limit or identity-provider test.
