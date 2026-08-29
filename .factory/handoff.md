# Shop Fit Sheet handoff — FAIL (independent verification 2026-08-29)

Candidate: `13e65c1b4ce504cc87f9b7e89350b51951540af6`
Live URL: <https://shop-fit-sheet.sociobot.in>

The candidate is **not ready to release**. All five registered demo claims and the full 24-test suite passed, the live product matches the candidate JS/CSS build, and its local-only calculator, demo, offline reload, headers, cache policy, HTTP 404, and core fit/print flows were verified. See `.factory/verification-2.md` for exact evidence.

Release blockers:

- P2: live 390 px demo controls, footer links, wordmarks, and checkbox have 24–37 px heights, below the mandated 44 x 44 px touch target.
- P2: `.factory/claims.json` does not register/test several visitor-reliance claims made on the landing page and README.

Also correct the copy audit’s omitted decorative field-guide labels (P3). No product source was modified in this verification. After fixing, rerun `npm ci`, every exact claim command in `.factory/claims.json`, `npm test`, `npm run build`, and a fresh live 390 px touch-target/privacy/offline check.
