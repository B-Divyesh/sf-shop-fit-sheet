# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-29 UTC
**Live URL:** <https://shop-fit-sheet.sociobot.in>
**Verdict:** **FAIL** — one minor copy finding remains. There are no blocking findings. The requested standard is zero findings of any severity.

## First read

Fresh, signed-out browser contexts were used at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** Checks whether a cabinet or bench will fit its available space before the visitor buys material; it also prepares a panel/build sheet.
- **For whom:** Home makers fitting cabinets or benches in garages, utility rooms, or vehicles.
- **First click:** **Try it with sample data**. The adjacent text correctly says it will show a filled plan and conflicts.

This clears the first-screen blocking gate: the job, audience, and first action are visible in both viewports. The wording in F-1-1 is nevertheless less clear than the product's own terminology.

## Findings

### F-1-1 — Minor: first-screen jargon uses a different name for the material

- **Location / exact quote:** Landing hero `<h1>`: “**Check a fitted build before buying stock**.” The same landing page later says “printable build sheet”; the footer and README use “sheet material”; the calculator labels use “Stock sheet.”
- **Why this fails first-read copy:** For the stated home-maker audience, “stock” can mean inventory or financial stock. It also breaks the required one-term rule for the sheet material the visitor is deciding whether to buy. The rest of the page lets a visitor infer the meaning, but the headline must do that work on its own.
- **Concrete fix:** Change the headline to **“Check a fitted build before buying sheet material”** (8 words), then update the landing-copy audit and its first-screen regression assertion. Retain “stock sheet” only as the label for the physical sheet-size input, or rename it “Sheet size” if it is not otherwise defined.

## Demo and sandbox check

The first click opened `/demo` directly. Its first product screen already showed the realistic **Van bed utility cabinet**, the verdict **“1 conflict to fix”**, and the 10 mm depth conflict. The persistent banner read “Demo — sample data, nothing is saved to your project,” with **Reset demo** and **Start for real**.

Editing the sample project name, choosing Reset demo, and checking it again restored **Van bed utility cabinet**. In a separate fresh context, leaving via Start for real opened `/` with **Untitled fit sheet** and no real-data key. While demo was active, browser storage contained only `demo:shop-fit-sheet:project:v1`. The source uses separate `DEMO_KEY` and `REAL_KEY` constants and removes the demo key only on the explicit exit path.

## Claims, privacy, and quality gates

Started from a fresh `npm ci` installation. Every command named by `.factory/claims.json` completed successfully in both configured Playwright projects (desktop Chromium and 390 px mobile):

| Claim id | Result |
| --- | --- |
| `conflict-check` | PASS |
| `panel-list` | PASS |
| `sheet-area-allowance` | PASS |
| `calculated-parts` | PASS |
| `stock-fit-check` | PASS |
| `unit-conversion` | PASS |
| `live-results` | PASS |
| `demo-isolation` | PASS |
| `demo-namespace` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |

`npm test` then passed all **44** tests, and `npm run build` passed as part of that command, emitting `dist/`. `/opt/fleet/lib/verify-url.sh` on the live root reported HTTPS 200, the expected title, `lang="en"`, one h1, one main landmark, no missing image alt text, no unlabeled buttons, and no console errors.

Fresh browser request logs for the root → demo → edit → reset flow contained only `https://shop-fit-sheet.sociobot.in` requests. No analytics, tracking, font CDN, or third-party calculator request was observed. The passed offline claim waits for the service worker and reloads `/demo` while the browser context is offline.

## Copy audit

Word counts treat visible headings, facts, captions, and full sentences as copy; field labels and table column labels are direct control labels, not sentences. No sentence exceeds 22 words. F-1-1 is the only jargon/terminology flag. Buttons name their outcomes: **Try it with sample data**, **Print build sheet**, **Reset demo**, and **Start for real**.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Check a fitted build before buying stock | 7 | F-1-1 |
| For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| See a filled plan and its conflicts. | 7 | Pass |
| Plans stay on this device | 5 | Pass (`local-only`) |
| Works offline after the first visit | 6 | Pass (`offline-reload`) |
| Calculator and printable build sheet | 5 | Pass (`panel-list`) |
| Cabinet planning reference image, generated for Shop Fit Sheet | 9 | Pass; provenance caption |
| Measure twice. | 2 | Pass; direct safety instruction |
| Verify the result before cutting. | 6 | Pass; direct safety instruction |
| This sheet is not structural or load-safety advice. | 8 | Pass; scope/safety warning |
| Confirm fixings, spans, hinges, ventilation, and site conditions. | 8 | Pass; scope/safety warning |
| Live calculation | 2 | Pass |
| Measure the space, then size the build | 8 | Pass |
| All dimensions use millimetres or inches. | 6 | Pass (`unit-conversion`) |
| Results update while you type. | 5 | Pass (`live-results`) |
| For walls, doors, cables, or airflow. | 6 | Pass |
| Your panel list appears after you enter the space and build sizes. | 12 | Pass; empty state |
| Enter positive space, build, panel, and stock measurements. | 8 | Pass; error recovery |
| Clearances and gaps cannot be negative. | 6 | Pass; error recovery |
| Supports, shelves, and doors must use whole numbers of zero or more. | 12 | Pass; error recovery |
| Enter a whole number from 0 to [maximum]. | 8 | Pass; dynamic error |
| Enter no more than [maximum]. | 5 | Pass; dynamic error |
| Centre supports must be no more than 8. | 8 | Pass; regression-covered |
| Shelves must be no more than 30. | 7 | Pass; regression-covered |
| Doors must be no more than 12. | 7 | Pass; regression-covered |
| The outer build fits inside the clear envelope. | 8 | Pass (`conflict-check`) |
| Consider another support or confirm sag limits. | 7 | Pass; manual check, not an engineering claim |
| Confirm hinge limits and door weight. | 6 | Pass; manual check, not an engineering claim |
| Panel area [area] + 15% allowance ([area]) = [area]. | 7 | Pass (`sheet-area-allowance`) |
| Each material thickness adds 15% of its panel area before sheet counting. | 12 | Pass (`sheet-area-allowance`) |
| This is not a cutting layout. | 6 | Pass; stated limitation |
| How the fit check works | 5 | Pass |
| Record the tightest width, height, and depth. | 7 | Pass |
| Add room for walls, doors, cables, and airflow. | 8 | Pass |
| Enter the outer size, panel thickness, supports, shelves, and doors. | 10 | Pass |
| Fix conflicts. | 2 | Pass |
| Then print the panel list and verify every size at the site. | 10 | Pass |
| A fit check, not an engineering drawing | 7 | Pass; scope heading |
| Shop Fit Sheet checks the outer envelope and makes a rough panel list. | 12 | Pass; scope |
| It does not design joints, choose fixings, test loads, or optimise cuts. | 12 | Pass; scope |
| Your current plan stays in your browser. | 7 | Pass (`local-only`) |
| Check a fitted build before you buy sheet material. | 9 | Pass; footer one-liner |
| Version 1.0.2 · Original generated field-guide art | 7 | Pass; version/provenance label |

All section headings are descriptive out of context: **Measure the space, then size the build**, **How the fit check works**, and **A fit check, not an engineering drawing** name their content. There are no mood-only section headings or non-result-naming buttons.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Check a fitted build before you buy sheet material. | 9 | Pass |
| Shop Fit Sheet is for home makers sizing cabinets, benches, and storage for tight garages, utility rooms, or vehicles. | 19 | Pass |
| Enter the available space, required clearances, outer build, panels, supports, shelves, and doors. | 13 | Pass |
| The calculator flags conflicts and prepares a printable panel list with a rough sheet allowance. | 14 | Pass (`conflict-check`, `panel-list`, `sheet-area-allowance`) |
| Live site | 2 | Pass; label |
| One-click demo | 2 | Pass; label |
| Checks the outer build against the cleared space | 9 | Pass (`conflict-check`) |
| Opening, door blank, support, shelf, and back calculations | 8 | Pass (`calculated-parts`) |
| Oversize-part checks against the chosen stock sheet | 7 | Pass (`stock-fit-check`) |
| A printable build sheet with a 15% sheet-area allowance | 10 | Pass (`panel-list`, `sheet-area-allowance`) |
| Millimetres and inches | 3 | Pass (`unit-conversion`) |
| Local browser storage and an offline service worker | 8 | Pass (`local-only`, `offline-reload`) |
| A separate demo storage namespace | 6 | Pass (`demo-namespace`) |
| Shop Fit Sheet is a planning aid. | 6 | Pass; scope |
| It does not design joints, test loads, choose fixings, or optimise sheet cuts. | 12 | Pass; scope |
| Verify every measurement and safety decision before cutting. | 8 | Pass; safety instruction |
| Requires Node.js 20 or newer. | 6 | Pass; run prerequisite |
| Open http://localhost:5173. | 2 | Pass; run instruction |
| Use http://localhost:5173/demo for sample data. | 4 | Pass; demo instruction |
| Playwright 1.58.2 is pinned because the factory image ships its browser build. | 12 | Pass; test setup |
| The exact production build command is `npm run build`. | 9 | Pass; deployment instruction |
| It writes `index.html` and static assets to `dist/`. | 9 | Pass; build output |
| To run one product claim: | 6 | Pass; instruction |
| The tests cover each claim in `.factory/claims.json`, both desktop and 390 px mobile layouts, keyboard basics, route structure, and serious accessibility findings. | 22 | Pass |
| Plans stay in browser storage. | 5 | Pass (`local-only`) |
| The demo uses `demo:shop-fit-sheet:project:v1`, separate from the real project key. | 10 | Pass (`demo-namespace`) |
| There are no analytics, trackers, runtime fonts, third-party scripts, or cross-origin calculator requests. | 11 | Pass (`local-only`) |
| After the first visit, the service worker reloads the calculator without a network. | 12 | Pass (`offline-reload`) |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 9 | Pass; deployment instruction |
| `public/staticwebapp.config.json` supplies security headers, immutable cache rules for fingerprinted assets, and a product-styled HTTP 404. | 13 | Pass; build/configuration fact |
| The service worker uses same-origin cached files only. | 8 | Pass (`local-only`, `offline-reload`) |
| MIT. See `LICENSE`. | 3 | Pass; license label/instruction |

## Structure and routes

The live root title is **Shop Fit Sheet — Check a fitted build**. `/demo`, `/privacy`, `/terms`, and the designed missing route each had a distinct, route-appropriate title, one h1, one main landmark, a meta description, canonical URL, Open Graph image, and `lang="en"`. The missing route returned HTTP 404 and offered a route back.

The header and footer are consistent. Demo-aware legal links retain `?demo=1`; Back/Forward focus and polite route announcement are covered by `@regression:history-focus`. The robots file and sitemap are present. A crawl of every live page link returned 200 for `/`, `/demo`, `/privacy`, `/terms`, their demo legal forms, and the external Param Factory link.

The visual system is distinct from a generic SaaS template: paper-toned field sheets, engraved serif display type, measured-rule motifs, and original cabinet/fern art match `.factory/design.md`. It remains usable at 390 px and has a reduced-motion path.

## Earlier history check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read `.factory/handoff.md` and every `.factory/verification*.md`. Their earlier findings were rechecked rather than accepted as marked complete.

| Earlier finding | Current confirmation |
| --- | --- |
| Broken $9 project-library checkout | Fixed: the offer and billing request are absent; the regression confirms neither appears. |
| Unhashed/short-cache assets | Fixed: the built assets use hashed names and the regression asserts immutable cache headers. |
| Unknown route served 200 | Fixed: live `/does-not-exist` returned HTTP 404 with the designed recovery page. |
| Mobile targets below 44 px | Fixed: mobile touch-target regression passed. |
| Claims register omitted public claims | Fixed for the operational visitor claims: 11 registered claims passed individually. |
| 15% sheet allowance was inaccurate/untested | Fixed: `sheet-area-allowance` derives and checks the visible panel area. |
| Unit conversion lost boundary precision | Fixed: the canonical-mm round-trip claim passed. |
| 200% mobile text reflow | Fixed: the regression passed. |
| Demo Planner navigation escaped into real data | Fixed: demo-isolation test and live check kept `/demo#planner` in the demo namespace. |
| Count maxima did not match calculated output | Fixed: regression rejects and removes invalid supports, shelves, and doors. |
| Back/Forward did not restore focus/live announcement | Fixed: history-focus regression passed. |

## Missed leverage

No missing AI feature is implied by the brief: this is an offline, local-first measurement calculator and an AI action would not improve its core job. The brief's valuable export is the printable build sheet, which is present and covered by `panel-list`. No provider key or decorative AI feature was found.

## What would make this perfect

Apply F-1-1's headline rewrite, keep all material terminology consistent, re-run the first-screen and full claim suites, then repeat this independent review. With that minor removed, the demo, privacy boundary, route structure, tests, and visual identity leave no other finding from this pass.
