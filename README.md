# Shop Fit Sheet

Check a fitted build before you buy sheet material.

Shop Fit Sheet is for home makers sizing cabinets, benches, and storage for tight garages, utility rooms, or vehicles. Enter the available space, required clearances, outer build, panels, supports, shelves, and doors. The calculator flags conflicts and prepares a printable panel list with a rough sheet allowance.

Live site: <https://shop-fit-sheet.sociobot.in>  
One-click demo: <https://shop-fit-sheet.sociobot.in/demo>

## What it includes

- Live width, height, and depth clearance checks
- Opening, door blank, support, shelf, and back calculations
- Oversize-part checks against the chosen stock sheet
- A printable build sheet with a 15% sheet-area allowance
- Millimetres and inches
- Local browser storage and an offline service worker
- A separate demo storage namespace

Shop Fit Sheet is a planning aid. It does not design joints, test loads, choose fixings, or optimise sheet cuts. Verify every measurement and safety decision before cutting.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open <http://localhost:5173>. Use <http://localhost:5173/demo> for sample data.

## Test and build

Playwright 1.58.2 is pinned because the factory image ships its browser build.

```sh
npm test
npm run build
```

The exact production build command is `npm run build`. It writes `index.html` and static assets to `dist/`.

To run one product claim:

```sh
npm test -- --grep @claim:offline-reload
```

The tests cover each claim in [.factory/claims.json](.factory/claims.json), both desktop and 390 px mobile layouts, keyboard basics, route structure, and serious accessibility findings.

## Privacy and offline use

Plans stay in browser storage. The demo uses `demo:shop-fit-sheet:project:v1`, separate from the real project key. There are no analytics, trackers, runtime fonts, or third-party scripts. After the first visit, the service worker reloads the calculator without a network.

The calculator makes no third-party requests. It stores plans only in browser storage on this device.

## Deploy

Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` supplies the SPA fallback and security headers. The service worker uses same-origin cached files only.

## Project records

- [.factory/brief.json](.factory/brief.json) — researched scope
- [.factory/design.md](.factory/design.md) — visual system and asset provenance
- [.factory/demo.md](.factory/demo.md) — sandbox behavior
- [.factory/claims.json](.factory/claims.json) — tested public claims
- [.factory/copy-audit.md](.factory/copy-audit.md) — plain-language check
- [.factory/handoff.md](.factory/handoff.md) — verification and known gaps

## License

MIT. See [LICENSE](LICENSE).
