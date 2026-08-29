# Shop Fit Sheet handoff — independent verification 4

**Tested candidate:** `64cbc31978432e2b9edc04458cb3ce7c246267c1`

**Tested live URL:** <https://shop-fit-sheet.sociobot.in>

**Verified:** 2026-08-29 UTC
**Decision:** **FAIL — do not release this candidate.**

The complete evidence and reproduction details are in [.factory/verification-4.md](verification-4.md) and [.factory/evidence-4/](evidence-4/). No product code was changed during verification.

## Release blockers

1. **P1 core correctness:** unit conversion mutates stored dimensions. A real `740.01 mm` depth conflict disappears when switching to inches and remains gone after switching back (`739.9 mm`).
2. **P2 accessibility:** at 390 px with text increased to 200%, header navigation overlaps and is clipped; page width grows to 503 px.
3. **P2 demo isolation:** the `/demo` header’s `Planner` link silently exits to the real planner and removes the demo banner instead of using `Start for real`.
4. **P2 validation:** a typed support count of 9 exceeds the declared maximum of 8 but is accepted without an app error; the list uses 9 while the diagram draws 8.
5. **P2 routing accessibility:** browser Back restores `/demo` with focus on `body`, not the new `h1`, and does not announce the route.

## Verification summary

- All 11 commands in `.factory/claims.json` passed first, each in desktop Chromium and the 390 px mobile project.
- `npm ci`: 22 packages installed, 0 vulnerabilities.
- `npm test`: 37 passed, 1 intentionally skipped desktop execution.
- `npm run build`: passed and produced `dist/`; no separate lint script exists.
- Worker live check passed; Axe found zero violations on five routes in both viewports; normal-size keyboard, touch-target, motion, console, and mobile checks passed.
- Privacy trace contained only same-origin requests. Demo and real storage keys are separate in the normal flow.
- Service-worker update and offline reload passed.
- Candidate HTML and hashed app assets match live. The service-worker file has the same cache set and logic with two precache URLs in a different order.
- Lighthouse mobile `/demo`: Performance 91, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s; CLS 0; payload 99 KiB.
- Static product only: no backend/API, sign-in, billing, or unlock request exists, so rate-limit and Entra checks do not apply.

## Repair and reverify

Preserve canonical measurement precision across unit changes; fix 200% text reflow; keep Planner inside demo; enforce count bounds consistently; and restore heading focus/announcement on browser history navigation. Add focused regressions for each defect, then rerun every registered claim, the complete suite/build, and live deployment verification.
