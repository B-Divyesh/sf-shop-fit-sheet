# Adversarial first-read review 4 — PASS

**Reviewed:** 2026-08-29 UTC  
**Candidate:** `2ecebc604016e92e038f3061f3a2613be6b39bed`  
**Live URL:** <https://shop-fit-sheet.sociobot.in>  
**Verdict:** **PASS** — zero blocking or minor findings. Every declared claim was tested from a clean clone; all passed.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900. I recorded the first viewport before scrolling.

- **What it does:** Checks a cabinet, bench, or storage build against its available space before the user buys sheet material; it also makes a printable build sheet.
- **For whom:** Home makers fitting cabinets or benches into garages, utility rooms, or vehicles.
- **First action:** **Try it with sample data**. The adjacent sentence says it will show a filled plan and its conflicts.

The first screen answers all three questions at both widths. It has no horizontal overflow at 390 px. The paper field-sheet presentation, cabinet/fern image, and measured typography are distinct from a generic SaaS template and match the recorded design direction.

## Copy audit

Words below use the visible sentence or heading as rendered. Direct field labels, table headings, URLs, commands, and product names are labels rather than sentences; they were also checked for clarity. No listed copy exceeds 22 words, uses banned marketing language, changes a defined term, or leaves a non-result-naming action. No rewrite is required.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Check a fitted build before buying sheet material | 8 | Pass |
| For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| See a filled plan and its conflicts. | 7 | Pass |
| Plans stay on this device | 5 | `local-only` |
| Works offline after the first visit | 6 | `offline-reload` |
| Calculator and printable build sheet | 5 | `panel-list` |
| A plywood cabinet arranged like a botanical specimen beside a fern and folding rule. | 14 | Image alt, pass |
| Cabinet planning reference image, generated for Shop Fit Sheet | 9 | Provenance caption, pass |
| Measure twice. | 2 | Safety instruction, pass |
| Verify the result before cutting. | 6 | Safety instruction, pass |
| This sheet is not structural or load-safety advice. | 8 | Scope limit, pass |
| Confirm fixings, spans, hinges, ventilation, and site conditions. | 8 | Safety instruction, pass |
| Live calculation | 2 | Descriptive label, pass |
| Measure the space, then size the build | 8 | Descriptive heading, pass |
| All dimensions use millimetres. | 4 | `unit-conversion` |
| All dimensions use inches. | 4 | `unit-conversion` |
| Results update while you type. | 5 | `live-results` |
| Project note | 2 | Descriptive label, pass |
| Space envelope | 2 | Descriptive label, pass |
| Clearance to leave | 3 | Descriptive label, pass |
| Outer build | 2 | Descriptive label, pass |
| Doors and back | 3 | Descriptive label, pass |
| Stock sheet | 2 | Descriptive label, pass |
| For walls, doors, cables, or airflow. | 6 | Instruction, pass |
| The build is [width] by [height] [unit] with 1 centre support. | 11 | Accessible diagram description, pass |
| The build is [width] by [height] [unit] with [n] centre supports. | 11 | Accessible diagram description, pass |
| The build is [width] by [height] [unit] with a support count that needs correction. | 14 | Accessible error description, pass |
| Front view · clear envelope shown as a dashed line | 9 | Diagram caption, pass |
| Fit verdict | 2 | Descriptive heading, pass |
| [n] conflict(s) to fix | 4 | Result, pass |
| Fits with [n] check(s) | 4 | Result, pass |
| Fits the cleared space | 4 | Result, pass |
| Calculated openings | 2 | Descriptive heading, pass |
| Panel list | 2 | Descriptive heading, pass |
| Print build sheet | 3 | Result-naming action, pass |
| Rough sheet allowance | 3 | Descriptive heading, pass |
| Panel area [area] + 15% allowance ([area]) = [area]. | 7 | `sheet-area-allowance` |
| Each material thickness adds 15% of its panel area before sheet counting. | 12 | `sheet-area-allowance` |
| This is not a cutting layout. | 6 | Scope limit, pass |
| Your panel list appears after you enter the space and build sizes. | 12 | Empty state, pass |
| Enter positive space, build, panel, and stock measurements. | 8 | Error recovery, pass |
| Clearances and gaps cannot be negative. | 6 | Error recovery, pass |
| Supports, shelves, and doors must use whole numbers of zero or more. | 12 | Error recovery, pass |
| Enter a whole number from 0 to [maximum]. | 8 | Error recovery, pass |
| Enter no more than [maximum]. | 5 | Error recovery, pass |
| Centre supports must be no more than 8. | 8 | Error recovery, pass |
| Shelves must be no more than 30. | 7 | Error recovery, pass |
| Doors must be no more than 12. | 7 | Error recovery, pass |
| Build [axis] exceeds the cleared space by [value] [unit]. | 9 | `conflict-check` |
| Supports and side panels leave no usable opening width. | 9 | Error recovery, pass |
| Top and bottom panels leave no usable opening height. | 9 | Error recovery, pass |
| An opening spans [value] [unit]. | 6 | Manual check, pass |
| Consider another support or confirm sag limits. | 7 | Manual check, pass |
| Each door is [value] [unit] wide. | 6 | Manual check, pass |
| Confirm hinge limits and door weight. | 6 | Manual check, pass |
| [Part] at [length] × [width] [unit] does not fit the chosen stock sheet. | 13 | `stock-fit-check` |
| The outer build fits inside the clear envelope. | 8 | `conflict-check` |
| Add measurements to check this build. | 6 | Empty-state recovery, pass |
| How the fit check works | 5 | Descriptive heading, pass |
| Measure the space | 3 | Descriptive heading, pass |
| Record the tightest width, height, and depth. | 7 | Instruction, pass |
| Add room for walls, doors, cables, and airflow. | 8 | Instruction, pass |
| Describe the build | 3 | Descriptive heading, pass |
| Enter the outer size, panel thickness, supports, shelves, and doors. | 10 | Instruction, pass |
| Check before buying | 3 | Descriptive heading, pass |
| Fix conflicts. | 2 | Instruction, pass |
| Then print the panel list and verify every size at the site. | 12 | Instruction, pass |
| A fit check, not an engineering drawing | 7 | Scope heading, pass |
| Shop Fit Sheet checks the outer envelope and makes a rough panel list. | 12 | Listed behavior, pass |
| It does not design joints, choose fixings, test loads, or optimise cuts. | 12 | Scope limit, pass |
| Your current plan stays in your browser. | 7 | `local-only` |
| Check a fitted build before you buy sheet material. | 9 | Footer one-liner, pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Check a fitted build before you buy sheet material. | 9 | Pass |
| Shop Fit Sheet is for home makers sizing cabinets, benches, and storage for tight garages, utility rooms, or vehicles. | 19 | Pass |
| Enter the available space, required clearances, outer build, panels, supports, shelves, and doors. | 13 | Pass |
| The calculator flags conflicts and prepares a printable panel list with a rough sheet allowance. | 14 | Listed behavior |
| Checks the outer build against the cleared space | 9 | `conflict-check` |
| Opening, door blank, support, shelf, and back calculations | 8 | `calculated-parts` |
| Oversize-part checks against the chosen stock sheet | 7 | `stock-fit-check` |
| A printable build sheet with a 15% sheet-area allowance | 10 | `panel-list`, `sheet-area-allowance` |
| Millimetres and inches | 3 | `unit-conversion` |
| Local browser storage and an offline service worker | 8 | `local-only`, `offline-reload` |
| A separate demo storage namespace | 6 | `demo-namespace` |
| Shop Fit Sheet is a planning aid. | 6 | Scope limit, pass |
| It does not design joints, test loads, choose fixings, or optimise sheet cuts. | 12 | Scope limit, pass |
| Verify every measurement and safety decision before cutting. | 8 | Safety instruction, pass |
| Requires Node.js 20 or newer. | 6 | Setup instruction, pass |
| Open http://localhost:5173. | 2 | Setup instruction, pass |
| Use http://localhost:5173/?demo=1 for sample data. | 4 | Demo instruction, pass |
| Playwright 1.58.2 is pinned because the factory image ships its browser build. | 12 | Test setup, pass |
| The exact production build command is `npm run build`. | 9 | Build instruction, pass |
| It writes `index.html` and static assets to `dist/`. | 9 | Verified build output |
| To run one product claim: | 6 | Instruction, pass |
| The tests cover each claim in `.factory/claims.json`, both desktop and 390 px mobile layouts, keyboard basics, route structure, and serious accessibility findings. | 22 | Verified test scope |
| Plans stay in browser storage. | 5 | `local-only` |
| The demo uses `demo:shop-fit-sheet:project:v1`, separate from the real project key. | 10 | `demo-namespace` |
| There are no analytics, trackers, runtime fonts, third-party scripts, or cross-origin calculator requests. | 11 | `local-only` |
| After the first visit, the service worker reloads the calculator without a network. | 12 | `offline-reload` |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 9 | Deployment instruction, pass |
| `public/staticwebapp.config.json` supplies security headers, immutable cache rules for fingerprinted assets, and a product-styled HTTP 404. | 13 | Verified configuration |
| The service worker uses same-origin cached files only. | 8 | `local-only`, `offline-reload` |
| MIT. See `LICENSE`. | 3 | License instruction, pass |

The README headings—**What it includes**, **Run locally**, **Test and build**, **Privacy and offline use**, **Deploy**, **Project records**, and **License**—name their sections. The claims register covers all visitor-reliance statements on the landing, README, and legal pages; no unlisted claim was found.

## Demo, sandbox, and privacy

The first click opened `/?demo=1` and immediately displayed **Van bed utility cabinet**, **1 conflict to fix**, and **Build depth exceeds the cleared space by 10 mm.** at both widths. The persistent banner says **“Demo — sample data, nothing is saved.”** and supplies **Reset demo** and **Start for real**.

In a live fresh context, a real project named `Real storage witness` survived a demo edit and reappeared after **Start for real**. Reset restored `Van bed utility cabinet`. The demo uses `demo:shop-fit-sheet:project:v1` once edited; it never reads or writes the real key while its banner is present, and exiting removes the demo copy.

The complete ordinary root → demo → edit → reset → exit flow made requests only to `https://shop-fit-sheet.sociobot.in`. No analytics, tracking, runtime-font, third-party calculator, billing, API, or other cross-origin request was observed. The only console error in the wider route crawl was the expected HTTP-404 resource message caused by deliberately loading `/does-not-exist`; normal routes were error-free. After service-worker activation, the live demo reloaded offline and retained **1 conflict to fix**.

## Claims and clean-clone gates

A fresh non-local clone at `/tmp/shop-fit-sheet-review-4-8VuUj3` was installed with `npm ci` (22 packages; zero audit vulnerabilities). Every exact command in `.factory/claims.json` passed separately in desktop Chromium and the 390 px project:

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

`npm test` completed with 52 passing tests and two intentional desktop skips for mobile-only checks, and built `dist/`. `npm run verify:release` passed and confirmed the candidate, fetched `origin/main`, and advertised branch SHA all equal `2ecebc604016e92e038f3061f3a2613be6b39bed`. Two isolated production builds matched all 17 artifacts byte-for-byte. Initial JavaScript is 27.07 kB (9.51 kB gzip); no font is downloaded.

## Structure, accessibility, and routes

Live checks confirmed:

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200; the styled `/does-not-exist` returns 404.
- Each route has one `h1`, one `main`, `lang="en"`, a plain-language description, route-specific title/canonical/OG/Twitter metadata, favicon, and product social image.
- The title pattern is correct: **Shop Fit Sheet — Check a fitted build**, **Demo — Shop Fit Sheet**, **Privacy — Shop Fit Sheet**, **Terms — Shop Fit Sheet**, and **Page not found — Shop Fit Sheet**.
- The live internal-link crawl returned 200 for all destinations. Header/footer links are consistent, and Privacy/Terms are present on every route.
- Keyboard focus, skip link, route focus/live announcement, 44 px mobile targets, 200% text reflow, reduced motion, and serious/critical Axe checks pass in the clean suite.
- Live responses use a self-only CSP, response-header `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, restrictive Permissions-Policy, revalidating HTML/service-worker, and immutable hashed assets.

## Earlier findings rechecked

Every earlier review, polish record, verification, and handoff was read. Each historical defect below was rechecked against the live site and current code, not accepted merely because a prior report marked it fixed.

| Earlier finding(s) | Current confirmation |
| --- | --- |
| Paid checkout unavailable (`P1`, `H-1`) | Fixed: no paid offer, checkout control, billing request, or billing claim remains. |
| Unhashed/short-cached assets (`P2`, `H-2`) | Fixed: fingerprinted JS/CSS and immutable cache headers are live. |
| Unknown route returned 200 (`P2`, `H-3`) | Fixed: the designed missing route returned HTTP 404. |
| Mobile targets under 44 px (`P2`, `H-4`) | Fixed: the 390 px target regression passes. |
| Missing claims / unmeasured allowance (`P2`, `P3`, `H-5`, `H-7`) | Fixed: 11 declared claims each have one tagged sandbox test; the visible 15% calculation is derived and asserted. |
| Decorative/metaphor copy (`P3`, `H-6`, `F-3-3`) | Fixed: the 404 h1 is **Page not found**; headings are direct. |
| Unit conversion lost boundary conflict (`P1`, `H-8`) | Fixed: 740.01 mm survives the inch round trip and keeps its conflict. |
| 200% mobile text reflow (`P2`, `H-9`) | Fixed: 390 px reflow has no overflow, clipping, or overlap. |
| Planner escaped demo storage (`P2`, `H-10`) | Fixed: demo Planner retains `?demo=1`; only **Start for real** enters real storage. |
| Count limits not enforced (`P2`, `H-11`) | Fixed: invalid counts show an error and suppress invalid output. |
| Back/forward lost focus and announcement (`P2`, `H-12`) | Fixed: history regression focuses the route h1 and updates the live region. |
| Incomplete route metadata/legal structure (`M-1`) | Fixed: live metadata, legal routes, icons, consistent skeleton, and link crawl pass. |
| Demo first screen/isolation concerns (`M-2`, `F-3-1`, `F-3-2`) | Fixed: one click opens sample work immediately and its sticky banner persists through the planner. |
| Material wording (`F-1-1`) | Fixed: the headline consistently names **sheet material**. |
| Singular accessible diagram wording (`F-2-1`) | Fixed: one support is announced as **1 centre support**. |
| Unreachable candidate / nondeterministic worker (`V8-01`, `V8-02`) | Fixed: the advertised candidate is reachable and two builds match all 17 artifacts byte-for-byte. |

## Missed leverage

No further AI, import, export, or sync capability is implied by the brief. The useful output is a printable build sheet, which is present and tested. An AI action would add an optional key, network disclosure, and uncertainty to a deterministic local measurement task without improving the stated job. No decorative AI control, provider key, or Azure endpoint is present.

## What would make this perfect

Keep the current protections in future changes: retain the product-first demo, separate `demo:` storage key, plain material terminology, exact claim coverage, live 404, and reproducible release check. No additional product work is required for this revision.
