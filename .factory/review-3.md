# Adversarial first-read review 3 — FAIL

**Reviewed:** 2026-08-29 UTC
**Candidate:** `52a209ad3582cf96d89ed57e9c577d02d9a162cd`
**Live URL:** <https://shop-fit-sheet.sociobot.in>
**Verdict:** **FAIL** — three blocking findings remain. The declared claims pass, but the one-click demo does not reveal the product in the next viewport, its required banner is not persistent, and an earlier plain-copy finding remains half-fixed on the 404 page.

## Findings

### F-3-1 — BLOCKING: the one-click demo opens another marketing screen, not the product in use

- **Location / exact text:** The first-screen action is “**Try it with sample data**,” followed by “**See a filled plan and its conflicts.**” After that click, `/?demo=1` still begins with the same headline, artwork, and the same “Try it with sample data” action.
- **Observed evidence:** At 390 × 844, the planner begins **1,451 px** below the viewport and the sample verdict begins **4,915 px** below it. At 1440 × 900, the planner begins **1,163 px** down and the verdict begins **1,842 px** down. Neither first post-click viewport shows the sample project name, filled controls, calculated panels, verdict, or conflict.
- **Why this blocks:** The required first screen after one click must already show realistic sample data being used. A visitor instead sees the landing hero again and must discover that the actual demo is several screens below. The repeated demo button is also a no-op in the state it claims to enter.
- **Concrete fix:** Give demo mode a product-first layout. After the click, show **Van bed utility cabinet**, **1 conflict to fix**, and “Build depth exceeds the cleared space by 10 mm” in the first 390 px and desktop viewports. On mobile, place a compact result summary before the long form. Remove or replace the redundant demo CTA while demo mode is active. Add a 390 px and desktop regression that asserts the sample name and verdict boxes intersect the viewport immediately after the click.

### F-3-2 — BLOCKING: the demo banner is not persistent while the demo is used

- **Location / exact text:** `/?demo=1` banner: “**Demo — sample data, nothing is saved. Reset demo Start for real**.”
- **Observed evidence:** The banner is a normal-flow element. After scrolling to the planner, its bottom edge is **−3,529 px** on mobile and **−1,652 px** on desktop. It is not visible while the visitor edits the sample or reads its result.
- **Why this blocks:** The demo contract requires a persistent banner with the sandbox warning, Reset, and exit action. Once the user reaches the product, all three disappear. The user can then mistake sample edits for real work and cannot reset or leave without returning several screens to the top.
- **Concrete fix:** Keep the compact demo banner sticky at the top while demo mode is active, without covering focused controls. Verify that the banner, **Reset demo**, and **Start for real** remain visible after scrolling to the first input, verdict, and panel list at 390 px and desktop widths.

### F-3-3 / H-6 (reopened) — BLOCKING: the 404 h1 is still a metaphor

- **Location / exact quote:** Live `/does-not-exist` h1: “**This page is not on the sheet**.” Source: `notFound()` in `src/main.ts`.
- **Why this blocks:** The plain-words rule requires a heading to name its section and prohibits metaphor or brand-lore copy. This line is a sheet-themed euphemism for a 404. The page title already uses the clearer phrase “Page not found.” Earlier item **H-6 — decorative copy** removed “Specimen not found,” but the replacement retains the same defect, so H-6 is half-fixed and must be blocking again under the history rule.
- **Concrete fix:** Change the h1 to **“Page not found”**. Keep “The address may be wrong or the page may have moved” and **Return to the fit checker**. Add the exact h1 to the route regression and the copy audit.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900. Nothing was scrolled or clicked before recording the first view.

- **What it does:** Checks whether a fitted cabinet or bench will fit before the user buys sheet material, then provides a build sheet.
- **For whom:** Home makers fitting cabinets or benches into garages, utility rooms, or vehicles.
- **What to click first:** **Try it with sample data**; the adjacent text says it will show a filled plan and its conflicts.

All three answers are available in the first viewport at both sizes. The three plain facts are also visible. This clears the cold landing gate, but not the post-click demo gate in F-3-1.

## Copy audit

Word counts treat hyphenated terms and placeholders as one word. Individual form labels, units, table headings, URLs, and code commands are direct labels rather than sentences; they were checked separately for clarity. No landing or README sentence exceeds 22 words. No banned marketing adjective, inconsistent product term, or unclear landing/README heading was found. The separate 404 heading failure is F-3-3.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Check a fitted build before buying sheet material | 8 | Pass |
| For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles. | 14 | Pass |
| Try it with sample data | 5 | Pass; prescribed demo action |
| See a filled plan and its conflicts. | 7 | Pass as copy; its promised placement fails F-3-1 |
| Plans stay on this device | 5 | Pass; `local-only` |
| Works offline after the first visit | 6 | Pass; `offline-reload` |
| Calculator and printable build sheet | 5 | Pass; `panel-list` |
| A plywood cabinet arranged like a botanical specimen beside a fern and folding rule. | 14 | Pass; image alternative |
| Cabinet planning reference image, generated for Shop Fit Sheet | 9 | Pass; provenance caption |
| Measure twice. | 2 | Pass; safety instruction |
| Verify the result before cutting. | 6 | Pass; safety instruction |
| This sheet is not structural or load-safety advice. | 8 | Pass; scope limit |
| Confirm fixings, spans, hinges, ventilation, and site conditions. | 8 | Pass; safety instruction |
| Live calculation | 2 | Pass; section label |
| Measure the space, then size the build | 8 | Pass; heading |
| All dimensions use millimetres. | 4 | Pass; `unit-conversion` |
| All dimensions use inches. | 4 | Pass; `unit-conversion` |
| Results update while you type. | 5 | Pass; `live-results` |
| Project note | 2 | Pass; group heading |
| Space envelope | 2 | Pass; group heading |
| Clearance to leave | 3 | Pass; group heading |
| Outer build | 2 | Pass; group heading |
| Doors and back | 3 | Pass; group heading |
| Stock sheet | 2 | Pass; group heading |
| For walls, doors, cables, or airflow. | 6 | Pass |
| The build is [width] by [height] [unit] with 1 centre support. | 11 | Pass; F-2-1 fixed |
| The build is [width] by [height] [unit] with [n] centre supports. | 11 | Pass |
| The build is [width] by [height] [unit] with a support count that needs correction. | 14 | Pass |
| Front view · clear envelope shown as a dashed line | 9 | Pass; caption |
| Fit verdict | 2 | Pass; heading |
| [n] conflict(s) to fix | 4 | Pass; status |
| Fits with [n] check(s) | 4 | Pass; status |
| Fits the cleared space | 4 | Pass; status |
| Calculated openings | 2 | Pass; heading |
| Panel list | 2 | Pass; heading |
| Rough sheet allowance | 3 | Pass; heading |
| Panel area [area] + 15% allowance ([area]) = [area]. | 7 | Pass; `sheet-area-allowance` |
| Each material thickness adds 15% of its panel area before sheet counting. | 12 | Pass; `sheet-area-allowance` |
| This is not a cutting layout. | 6 | Pass; scope limit |
| Your panel list appears after you enter the space and build sizes. | 12 | Pass; empty state |
| Enter positive space, build, panel, and stock measurements. | 8 | Pass; error recovery |
| Clearances and gaps cannot be negative. | 6 | Pass; error recovery |
| Supports, shelves, and doors must use whole numbers of zero or more. | 12 | Pass; error recovery |
| Enter a whole number from 0 to [maximum]. | 8 | Pass; error recovery |
| Enter no more than [maximum]. | 5 | Pass; error recovery |
| Centre supports must be no more than 8. | 8 | Pass; error recovery |
| Shelves must be no more than 30. | 7 | Pass; error recovery |
| Doors must be no more than 12. | 7 | Pass; error recovery |
| Build [axis] exceeds the cleared space by [value] [unit]. | 9 | Pass; `conflict-check` |
| Supports and side panels leave no usable opening width. | 9 | Pass; error recovery |
| Top and bottom panels leave no usable opening height. | 9 | Pass; error recovery |
| An opening spans [value] [unit]. | 6 | Pass; manual-check prompt |
| Consider another support or confirm sag limits. | 7 | Pass; manual-check prompt |
| Each door is [value] [unit] wide. | 6 | Pass; manual-check prompt |
| Confirm hinge limits and door weight. | 6 | Pass; manual-check prompt |
| [Part] at [length] × [width] [unit] does not fit the chosen stock sheet. | 13 | Pass; `stock-fit-check` |
| The outer build fits inside the clear envelope. | 8 | Pass; `conflict-check` |
| Add measurements to check this build. | 6 | Pass; empty-state recovery |
| How the fit check works | 5 | Pass; heading |
| Measure the space | 3 | Pass; heading |
| Record the tightest width, height, and depth. | 7 | Pass |
| Add room for walls, doors, cables, and airflow. | 8 | Pass |
| Describe the build | 3 | Pass; heading |
| Enter the outer size, panel thickness, supports, shelves, and doors. | 10 | Pass |
| Check before buying | 3 | Pass; heading |
| Fix conflicts. | 2 | Pass |
| Then print the panel list and verify every size at the site. | 12 | Pass |
| A fit check, not an engineering drawing | 7 | Pass; heading |
| Shop Fit Sheet checks the outer envelope and makes a rough panel list. | 12 | Pass; registered claims |
| It does not design joints, choose fixings, test loads, or optimise cuts. | 12 | Pass; scope limit |
| Your current plan stays in your browser. | 7 | Pass; `local-only` |
| Check a fitted build before you buy sheet material. | 9 | Pass; footer one-liner |
| Demo — sample data, nothing is saved. | 6 | Pass as copy; persistence fails F-3-2 |
| Page changed: [page heading]. | 4 | Pass; route announcement |

The direct controls are **Try it with sample data**, **Print build sheet**, **Reset demo**, and **Start for real**. They follow the prescribed demo wording or name their result. The field and table labels identify their values without marketing language.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Check a fitted build before you buy sheet material. | 9 | Pass |
| Shop Fit Sheet is for home makers sizing cabinets, benches, and storage for tight garages, utility rooms, or vehicles. | 19 | Pass |
| Enter the available space, required clearances, outer build, panels, supports, shelves, and doors. | 13 | Pass |
| The calculator flags conflicts and prepares a printable panel list with a rough sheet allowance. | 14 | Pass; registered claims |
| Checks the outer build against the cleared space | 9 | Pass; `conflict-check` |
| Opening, door blank, support, shelf, and back calculations | 8 | Pass; `calculated-parts` |
| Oversize-part checks against the chosen stock sheet | 7 | Pass; `stock-fit-check` |
| A printable build sheet with a 15% sheet-area allowance | 10 | Pass; `panel-list`, `sheet-area-allowance` |
| Millimetres and inches | 3 | Pass; `unit-conversion` |
| Local browser storage and an offline service worker | 8 | Pass; `local-only`, `offline-reload` |
| A separate demo storage namespace | 6 | Pass; `demo-namespace` |
| Shop Fit Sheet is a planning aid. | 6 | Pass; scope |
| It does not design joints, test loads, choose fixings, or optimise sheet cuts. | 12 | Pass; scope |
| Verify every measurement and safety decision before cutting. | 8 | Pass; safety instruction |
| Requires Node.js 20 or newer. | 6 | Pass; run prerequisite |
| Open http://localhost:5173. | 2 | Pass; instruction |
| Use http://localhost:5173/?demo=1 for sample data. | 4 | Pass; instruction |
| Playwright 1.58.2 is pinned because the factory image ships its browser build. | 12 | Pass; test setup |
| The exact production build command is `npm run build`. | 9 | Pass; instruction |
| It writes `index.html` and static assets to `dist/`. | 9 | Pass; verified build output |
| To run one product claim: | 6 | Pass; instruction |
| The tests cover each claim in `.factory/claims.json`, both desktop and 390 px mobile layouts, keyboard basics, route structure, and serious accessibility findings. | 22 | Pass; verified test scope |
| Plans stay in browser storage. | 5 | Pass; `local-only` |
| The demo uses `demo:shop-fit-sheet:project:v1`, separate from the real project key. | 10 | Pass; `demo-namespace` |
| There are no analytics, trackers, runtime fonts, third-party scripts, or cross-origin calculator requests. | 11 | Pass; `local-only` |
| After the first visit, the service worker reloads the calculator without a network. | 12 | Pass; `offline-reload` |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 9 | Pass; instruction |
| `public/staticwebapp.config.json` supplies security headers, immutable cache rules for fingerprinted assets, and a product-styled HTTP 404. | 13 | Pass; verified repository configuration |
| The service worker uses same-origin cached files only. | 8 | Pass; `local-only`, `offline-reload` |
| MIT. See `LICENSE`. | 3 | Pass |

README headings — **What it includes**, **Run locally**, **Test and build**, **Privacy and offline use**, **Deploy**, **Project records**, and **License** — name their sections directly. Build/setup statements were verified from the clean clone and configuration; the visitor-reliance behavior claims map to the register. No unlisted product claim was found.

## Demo and sandbox

The sample itself is realistic and functional once reached: **Van bed utility cabinet**, six panel rows, **1 conflict to fix**, and the exact 10 mm depth conflict. Reset restores the shipped sample. A pre-existing real project named **Persistent real plan** remained byte-for-byte unchanged during demo edits and reappeared after **Start for real**. Demo edits used only `demo:shop-fit-sheet:project:v1`; exiting removed that key.

The complete root → demo → edit → reset → exit → offline-reload request log contained only `https://shop-fit-sheet.sociobot.in`. The active cache was `shop-fit-sheet-v8`; an offline reload restored the sample verdict. There were no console or page errors in this flow. F-3-1 and F-3-2 still make the demo gate fail.

## Claims

A no-local clean clone was created at `/tmp/shop-fit-sheet-review-3-RYBfNP` from the candidate commit. `npm ci` installed 22 packages with zero reported vulnerabilities. Every exact command in `.factory/claims.json` ran separately:

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `conflict-check` | PASS | Sample reports the exact 10 mm depth conflict |
| `panel-list` | PASS | Parts, stock estimate, and print invocation asserted |
| `sheet-area-allowance` | PASS | Visible panel areas reproduce the stated 15% allowance |
| `calculated-parts` | PASS | Openings, doors, support, shelves, and back asserted |
| `stock-fit-check` | PASS | Reduced sheet flags the oversize side panel |
| `unit-conversion` | PASS | 0.01 mm boundary survives inch round trip |
| `live-results` | PASS | Verdict changes without submit |
| `demo-isolation` | PASS | Real project survives demo edits and exit |
| `demo-namespace` | PASS | Demo edit writes only the `demo:` key |
| `local-only` | PASS | Storage is local and all requests are same-origin |
| `offline-reload` | PASS | Service-worker-controlled demo reloads offline |

Each claim id appears exactly once in the browser tests. No listed test failed and no visitor-reliance claim on the landing page or README lacks a matching entry. The full clean-clone `npm test` run also passed **46 tests**, with two expected desktop skips for mobile-only checks, and emitted `dist/`.

## Structure, routes, accessibility, and identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. `/does-not-exist` returns the designed page with HTTP 404.
- Titles are route-specific and within the required pattern: **Shop Fit Sheet — Check a fitted build**, **Demo — Shop Fit Sheet**, **Privacy — Shop Fit Sheet**, **Terms — Shop Fit Sheet**, and **Page not found — Shop Fit Sheet**.
- Each route has `lang="en"`, one h1, one main, a description, canonical URL, Open Graph/Twitter metadata, SVG favicon, 180 px apple-touch icon, and the 1200 × 630 product social image.
- The internal-link crawl returned 200 for every page destination. The in-page skip link on the HTTP 404 retains the containing 404 response and is not a dead destination. The external Param Factory link returned 200.
- Back and forward navigation restore focus to the route h1 and announce the new heading. Reduced motion is applied. Live Axe checks found no serious or critical issue. `/opt/fleet/lib/verify-url.sh` reported no demo console errors, one h1/main, complete image alternatives, and named buttons.
- The live JS/CSS hashes match the fresh build. JavaScript is 25.57 kB / 9.18 KiB gzip; fingerprinted assets return one-year immutable caching. The CSP, referrer policy, `nosniff`, and permissions policy are present.
- The paper, ruled-sheet panels, clipped corners, serif display face, fern/ruler motifs, and original cabinet art make the product recognisable and match `.factory/design.md`; it is not a generic SaaS card template.
- The 404 is visually designed and routable, but its h1 fails plain words under F-3-3.

## Earlier finding verification

Every earlier review, polish record, and the cumulative handoff was read. Verification used both the live site and the matching candidate source; the deployed JS and CSS SHA-256 hashes equal the clean build.

| Earlier id | Current result | Independent confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | Live/source h1 says “sheet material,” not “stock”; regression passes |
| F-2-1 | Fixed | Live SVG says “1 centre support” and “2 centre supports”; regression passes |
| H-1 | Fixed | No paid offer, checkout copy, API request, or billing request |
| H-2 | Fixed | Hashed assets return `public, max-age=31536000, immutable` |
| H-3 | Fixed | Unknown route returns styled HTTP 404 with recovery action |
| H-4 | Fixed | Live 390 px audit finds no interactive target below 44 px |
| H-5 | Fixed | Eleven operational claims exist, each with one tag; all exact commands pass |
| H-6 | **BLOCKING: half-fixed** | Landing decorative labels are gone, but 404 h1 remains the metaphor in F-3-3 |
| H-7 | Fixed | Registered 15% calculation is derived from visible rows and passes |
| H-8 | Fixed | Live 740.01 mm survives an inch round trip and retains its exact conflict |
| H-9 | Fixed | Live 200% text at 390 px has `scrollWidth === clientWidth === 390` |
| H-10 | Fixed | Demo-aware Planner keeps `?demo=1`; real and demo keys remain separate |
| H-11 | Fixed | Nine supports produces the announced maximum error and suppresses support rows |
| H-12 | Fixed | Back/Forward focuses h1 and updates the polite route announcement |
| M-1 | Fixed | Route metadata, legal links, header/footer, icons, and social image are complete |
| M-2 | Fixed as originally scoped | `/?demo=1` is the primary entry, reset works, and exit clears demo data; F-3-1 is the separate post-click viewport failure |

## Missed leverage

No missing AI, import, export, or sync feature is implied by the brief. The required output is one printable build sheet, which exists. An AI step would add key setup and network disclosure without improving the deterministic measurement task. No AI control, provider key, Azure endpoint, or decorative model call exists in the product.

## What would make this perfect

1. Make demo mode product-first so the realistic project and conflict are visible immediately after one click at 390 px and desktop sizes.
2. Keep the demo banner and its Reset/exit actions visible throughout demo use.
3. Replace the 404 h1 with **Page not found**.
4. Add viewport and banner-persistence regressions, update the copy audit, then rerun all claim commands and the complete suite from a clean clone.

Until all three findings are fixed and independently verified on the live site, the verdict remains **FAIL**.
