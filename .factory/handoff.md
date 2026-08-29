# Shop Fit Sheet handoff

## Repair status — ready for deployment (2026-08-29)

Repaired independent-verification findings from candidate `3e286e808e1f853567a79b97b18bc2ae745610b0` (report commit `014d4812fab1e829399d1713f1f4346d31aac178`). The free, local-first fit calculator, demo, print sheet, safety warnings, conversion, privacy pages, offline use, and responsive behavior are retained.

### Findings repaired

- **Broken paid checkout (P1):** removed the $9 project-library claim, purchase link, license storage, and Sociobot billing requests. The repository contract prohibits registering or changing billing from this repo, so the product no longer advertises an unavailable purchase. The calculator and printable build sheet remain free. Regression test: `withdraws the unavailable paid offer and makes no billing request` asserts absent offer copy and no `api.sociobot.in` traffic.
- **Cache policy (P2):** Vite now fingerprints JavaScript, CSS, and generated WebP asset names. The generated `sw.js` precaches the exact hashed shell and uses cache `shop-fit-sheet-v5`. Static Web Apps config marks `/assets/*` as `public, max-age=31536000, immutable`; HTML and `sw.js` use `public, max-age=0, must-revalidate`.
- **HTTP 404 (P2):** known app routes are emitted as real static documents (`/demo`, `/privacy`, `/terms`), with Static Web Apps `responseOverrides.404` rewriting unknown URLs to product-styled `/404.html` at status 404. The local production server applies the same response policy. Regression test: `ships hashed immutable assets and a styled HTTP 404 response` checks the hashed asset header, actual 404 status/content, and deployed configuration.

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm test` runs the production build first, then 24 Playwright tests across desktop Chromium and a 390 × 844 mobile viewport. The current clean-install verification on 2026-08-29 passed: **24 passed in 31.3 s**.

- All five entries in `.factory/claims.json` passed from `/demo`: conflict check, panel list/print, demo isolation, same-origin local storage, and offline reload.
- TypeScript is checked by `npm run build`; no separate lint script exists in this intentionally small Vite/TypeScript project.
- Axe integration found no serious or critical issues across `/`, `/demo`, `/privacy`, `/terms`, and the missing-route page. Browser checks cover one h1/main/lang/title per route, desktop and 390 px mobile, skip-link keyboard access, console/page errors, internal links, print, validation recovery, and service-worker offline reload.
- Response policy regression coverage confirms a fingerprinted JS asset is served immutable and an unknown route is a product-styled HTTP 404. The built bundle is 21.86 kB JS (8.11 kB gzip), 15.35 kB CSS (4.35 kB gzip), with 30.26 kB mobile and 82.60 kB desktop hero images.
- Privacy regression coverage records the demo flow and confirms every request is same-origin. The final CSP permits only same-origin connections.

Build output is `dist/`, with `dist/index.html` at its root. Use `npm run preview` to serve the built artifact locally with its response policy.

## Deployment and live checks

Deploy `dist/` using `/opt/fleet/lib/deploy-static.sh shop-fit-sheet dist`. After deployment, verify identity and response policy:

```sh
curl -I https://shop-fit-sheet.sociobot.in/
curl -I https://shop-fit-sheet.sociobot.in/does-not-exist
curl -I https://shop-fit-sheet.sociobot.in/assets/<fingerprinted-file>.js
```

Expect the product title on `/`, HTTP 404 on the unknown route, and immutable cache control on fingerprinted assets.

## Known limits and next step

- Sheet allowance is area plus 15%; it is not a nesting or cutting-layout optimizer.
- The tool does not design joints, select fixings, assess loads, or certify site safety.
- If the factory later registers a paid project library, reintroduce it only with a working staging checkout, return-token storage, live verification, and an observable checkout regression test. Do not restore the old URL-only test.
