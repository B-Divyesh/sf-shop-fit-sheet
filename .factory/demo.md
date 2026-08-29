# Demo sandbox

- URL: `https://shop-fit-sheet.sociobot.in/?demo=1` (local: `http://127.0.0.1:4173/?demo=1`). `/demo` remains a supported alias.
- Sample: a 1350 × 800 × 750 mm cabinet below a van bed. It has two doors, one centre support, two shelves, and a back.
- Expected finding: the 750 mm build depth exceeds the 740 mm cleared depth by 10 mm. Each 670.5 mm door also needs a hinge and weight check.
- Reset: use **Reset demo** in the persistent demo banner.
- Leave: use **Start for real**. This discards the demo copy and opens the real project.
- Navigation: the wordmark and **Planner** keep `?demo=1` active. Legal pages carry demo mode in the URL and keep the banner. Only **Start for real** opens real storage.
- Storage: demo changes use `demo:shop-fit-sheet:project:v1`. Real project data uses `shop-fit-sheet:project:v1`. The calculator never reads the real key while demo mode is active.
- Offline check: visit once, wait for the service worker, disable the network, and reload `/?demo=1`.
