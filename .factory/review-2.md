# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-29 UTC  
**Live URL:** <https://shop-fit-sheet.sociobot.in>  
**Verdict:** **FAIL** — one minor finding remains. The requested acceptance rule is zero findings of every severity.

## First read

I used fresh, signed-out Chromium contexts at 390 × 844 and 1440 × 900. I recorded the first viewport before scrolling.

- **What it does:** It checks whether a cabinet, bench, or storage build fits the available space before the user buys sheet material. It also makes a printable panel list.
- **For whom:** Home makers fitting cabinets or benches in a garage, utility room, or vehicle.
- **First click:** **Try it with sample data**. The nearby sentence says it will show a filled plan and its conflicts.

The visible first screen answers all three questions at both widths. The headline is direct, names sheet material, and is eight words. This clears the first-screen blocking gate.

## Findings

### F-2-1 — Minor: sample diagram has an incorrect singular accessible description

- **Location / exact quote:** The demo planner’s SVG description, exposed to screen readers: “**The build is 1,350 by 800 mm with 1 centre supports.**”
- **Why this fails:** A screen-reader visitor receives grammatically incorrect information in the first realistic sample. The product explicitly supports keyboard and screen-reader use, so accessible copy must be as correct as visible copy. This is not a calculation error, but it makes the sample sound unreviewed.
- **Concrete fix:** In `diagram()`, make the noun conditional: `1 centre support` for one and `n centre supports` otherwise. Add a regression that reads the SVG accessible description for the shipped one-support demo and a multi-support edit.

## Demo and sandbox

The one-click link opened `/?demo=1`, not a setup flow. Its first product screen already showed **Van bed utility cabinet**, **1 conflict to fix**, and “Build depth exceeds the cleared space by 10 mm.” The persistent banner said “Demo — sample data, nothing is saved.” It included **Reset demo** and **Start for real**.

After changing the sample name, **Reset demo** restored **Van bed utility cabinet**. After **Start for real**, the route was `/`, the project was **Untitled fit sheet**, and no real key existed. A demo edit wrote only `demo:shop-fit-sheet:project:v1`; source inspection confirms that demo and real use different constants and the demo path never reads the real key. This clears the blocking demo-isolation gate.

In a fresh live browser, root → demo → edit → reset → exit made five requests, all to `https://shop-fit-sheet.sociobot.in`. A fresh service-worker visit then reloaded `/?demo=1` offline and retained the sample verdict. No console error occurred. These checks confirm the stated local-only and offline behaviour.

## Claims

I created a fresh no-local clone at `/tmp/shop-fit-sheet-review-2-H6GHig`, ran `npm ci`, and ran every exact command from `.factory/claims.json` separately. Each command passed in both configured projects (desktop Chromium and 390 px mobile).

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

The clean clone’s full `npm test` completed with 44 passing tests and two expected desktop skips for mobile-only checks. Its build emitted `dist/`. The only visitor-facing operational claims on the landing page and README are covered by the listed claim IDs: fit checking, panel/build-sheet output, 15% allowance, calculated parts, stock fit, unit conversion, live updates, demo isolation/namespace, local-only traffic, and offline reload. Safety limits and instructions state what the calculator does **not** do; they are not performance or product promises. No unlisted operational claim was found.

## Copy audit

Word counts below treat visible prose, headings, image alternatives, and dynamic sentence templates as copy. Individual form labels, table headers, product names, version labels, URLs, and code commands are direct labels rather than sentences. No listed copy is over 22 words. The only copy defect is F-2-1.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Check a fitted build before buying sheet material | 8 | Pass |
| For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles. | 14 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See a filled plan and its conflicts. | 7 | Pass |
| Plans stay on this device | 5 | Pass; `local-only` |
| Works offline after the first visit | 6 | Pass; `offline-reload` |
| Calculator and printable build sheet | 5 | Pass; `panel-list` |
| A plywood cabinet arranged like a botanical specimen beside a fern and folding rule. | 14 | Pass; descriptive image alternative |
| Cabinet planning reference image, generated for Shop Fit Sheet | 9 | Pass; provenance caption |
| Measure twice. | 2 | Pass |
| Verify the result before cutting. | 6 | Pass |
| This sheet is not structural or load-safety advice. | 8 | Pass |
| Confirm fixings, spans, hinges, ventilation, and site conditions. | 8 | Pass |
| Live calculation | 2 | Pass; heading |
| Measure the space, then size the build | 8 | Pass; heading |
| All dimensions use millimetres. | 4 | Pass; `unit-conversion` |
| All dimensions use inches. | 4 | Pass; `unit-conversion` |
| Results update while you type. | 5 | Pass; `live-results` |
| For walls, doors, cables, or airflow. | 6 | Pass |
| Front view · clear envelope shown as a dashed line | 9 | Pass; caption |
| The build is [width] by [height] [unit] with [count] centre supports. | 11 | **F-2-1** for the shipped count of one |
| [n] conflict(s) to fix | 4 | Pass; live status |
| Fits with [n] check(s) | 4 | Pass; live status |
| Fits the cleared space | 4 | Pass; live status |
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
| Your panel list appears after you enter the space and build sizes. | 12 | Pass; empty-state recovery |
| Panel area [area] + 15% allowance ([area]) = [area]. | 7 | Pass; `sheet-area-allowance` |
| Each material thickness adds 15% of its panel area before sheet counting. | 12 | Pass; `sheet-area-allowance` |
| This is not a cutting layout. | 6 | Pass; stated limit |
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
| Shop Fit Sheet checks the outer envelope and makes a rough panel list. | 12 | Pass |
| It does not design joints, choose fixings, test loads, or optimise cuts. | 12 | Pass |
| Your current plan stays in your browser. | 7 | Pass; `local-only` |
| Check a fitted build before you buy sheet material. | 9 | Pass; footer one-liner |
| Demo — sample data, nothing is saved. | 6 | Pass; demo banner |
| Page changed: [page heading] | 4 | Pass; route announcement |

The remaining direct labels and headings — for example **Project note**, **Space envelope**, **Clearance to leave**, **Outer build**, **Doors and back**, **Stock sheet**, **Fit verdict**, **Calculated openings**, **Panel list**, and **Rough sheet allowance** — name their content directly. Buttons are result-naming verbs: **Try it with sample data**, **Print build sheet**, **Reset demo**, **Start for real**, and **Return to the fit checker**. No mood-only heading, slogan, banned marketing adjective, or inconsistent material-buying term was found.

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Check a fitted build before you buy sheet material. | 9 | Pass |
| Shop Fit Sheet is for home makers sizing cabinets, benches, and storage for tight garages, utility rooms, or vehicles. | 19 | Pass |
| Enter the available space, required clearances, outer build, panels, supports, shelves, and doors. | 13 | Pass |
| The calculator flags conflicts and prepares a printable panel list with a rough sheet allowance. | 14 | Pass; registered claims |
| Checks the outer build against the cleared space | 9 | Pass; `conflict-check` |
| Opening, door blank, support, shelf, and back calculations | 8 | Pass; `calculated-parts` |
| Oversize-part checks against the chosen stock sheet | 7 | Pass; `stock-fit-check` |
| A printable build sheet with a 15% sheet-area allowance | 10 | Pass; registered claims |
| Millimetres and inches | 3 | Pass; `unit-conversion` |
| Local browser storage and an offline service worker | 8 | Pass; registered claims |
| A separate demo storage namespace | 6 | Pass; `demo-namespace` |
| Shop Fit Sheet is a planning aid. | 6 | Pass |
| It does not design joints, test loads, choose fixings, or optimise sheet cuts. | 12 | Pass |
| Verify every measurement and safety decision before cutting. | 8 | Pass |
| Requires Node.js 20 or newer. | 6 | Pass; run prerequisite |
| Open http://localhost:5173. | 2 | Pass; instruction |
| Use http://localhost:5173/?demo=1 for sample data. | 4 | Pass; instruction |
| Playwright 1.58.2 is pinned because the factory image ships its browser build. | 12 | Pass; test setup |
| The exact production build command is `npm run build`. | 9 | Pass; instruction |
| It writes `index.html` and static assets to `dist/`. | 9 | Pass; build output |
| To run one product claim: | 6 | Pass; instruction |
| The tests cover each claim in `.factory/claims.json`, both desktop and 390 px mobile layouts, keyboard basics, route structure, and serious accessibility findings. | 22 | Pass; repository scope |
| Plans stay in browser storage. | 5 | Pass; `local-only` |
| The demo uses `demo:shop-fit-sheet:project:v1`, separate from the real project key. | 10 | Pass; `demo-namespace` |
| There are no analytics, trackers, runtime fonts, third-party scripts, or cross-origin calculator requests. | 11 | Pass; `local-only` |
| After the first visit, the service worker reloads the calculator without a network. | 12 | Pass; `offline-reload` |
| Deploy the contents of `dist/` to Azure Static Web Apps. | 9 | Pass; instruction |
| `public/staticwebapp.config.json` supplies security headers, immutable cache rules for fingerprinted assets, and a product-styled HTTP 404. | 13 | Pass; repository configuration |
| The service worker uses same-origin cached files only. | 8 | Pass; registered privacy/offline claims |
| MIT. See `LICENSE`. | 3 | Pass |

README headings and labels — **Shop Fit Sheet**, **What it includes**, **Run locally**, **Test and build**, **Privacy and offline use**, **Deploy**, **Project records**, and **License** — all identify their sections without metaphor. No README sentence exceeds 22 words or uses a banned marketing word.

## Structure, routes, and visual identity

Live `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200. `/does-not-exist` returned a styled HTTP 404 with a return link. All have one h1, one main landmark, `lang="en"`, route-specific titles, descriptions, canonical URLs, Open Graph/Twitter metadata, favicon, and apple-touch icon. The root title is **Shop Fit Sheet — Check a fitted build**; the other titles follow the route/product pattern. `robots.txt` and `sitemap.xml` are present.

The internal-link crawl returned 200 for every live destination. The 404 page’s local `#main` skip link naturally retains that page’s 404 status; it is an in-page anchor, not a dead destination. The external **Built by Param Factory** link returned 200. The header/footer contain the required navigation, Privacy, Terms, skip link, and product/version information. Back navigation restored focus to the h1 and announced the changed page.

`/opt/fleet/lib/verify-url.sh` passed for the live demo: 200, title **Demo — Shop Fit Sheet**, `lang=en`, one h1, one main, no missing alt text, no unlabeled buttons, and no console errors. The live JS asset has a fingerprinted name and `Cache-Control: public, max-age=31536000, immutable`.

The visual system is distinct from a generic SaaS template: paper ground, field-sheet panels, engraved serif heading, measured rules, and original cabinet/fern art match `.factory/design.md`. The botanical theme is visual rather than mood-copy. The first screen remains clear at 390 px. Reduced-motion mode is active and did not produce console errors.

## Earlier-history confirmation

I read `.factory/review-1.md`, `.factory/polish-1.md`, and `.factory/handoff.md`. F-1-1 is fixed on the live page and in source: the h1 is “Check a fitted build before buying sheet material,” not the earlier ambiguous “stock.” The existing regression covers that exact string and one-click query demo.

The prior historical items in the polish/handoff are also confirmed rather than accepted as marked complete: no checkout or billing request; hashed immutable assets; real HTTP 404; 44 px mobile targets; complete 11-claim register; plain copy; tested 15% allowance; preserved unit boundary; 200% mobile reflow; demo-aware Planner navigation; enforced count maxima; Back/Forward h1 focus; complete metadata; and direct `?demo=1` entry. The fresh claim runs, source inspection, full suite, and live checks above cover those items. No earlier finding regressed.

## Missed leverage

The brief calls for a local-first fit calculator and one printable build sheet. The printable build-sheet action is present and tested. Import, sync, or AI would add setup or external data traffic without improving this narrow measurement job, so none is an implied missing feature. No runtime provider key, model call, or decorative AI control was found.

## What would make this perfect

Fix F-2-1, add the singular/plural accessible-description regression, then rerun the claim commands and full suite. With that one screen-reader sentence corrected, this review has no other open finding.
