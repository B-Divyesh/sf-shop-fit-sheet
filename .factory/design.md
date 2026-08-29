# Shop Fit Sheet visual thesis

## Direction: botanical field guide for the workshop

The product treats a fitted cabinet as an object to measure before it is cut. A quiet, paper-toned field sheet, ruled annotations, and an original cabinet illustration make the calculator feel specific to hands-on planning. It must not resemble a centred SaaS landing page or a generic CAD dashboard.

The interface is intentionally single-mode. Its warm paper ground is part of the field-guide metaphor and remains explicit in every route and print view.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F3EEDC` | page ground |
| `paper-light` | `#FBF8ED` | raised sheets and inputs |
| `ink` | `#18332A` | primary text, 11.8:1 on paper |
| `ink-soft` | `#52645B` | secondary text, 5.7:1 on paper |
| `fern` | `#2F664D` | actions and measured lines |
| `fern-dark` | `#214A38` | action hover, white contrast 9.4:1 |
| `ochre` | `#B16B24` | annotations and warnings |
| `danger` | `#9B362C` | conflicts and errors |
| `success` | `#2C6846` | passing constraints |
| `rule` | `#AEB5A2` | dividers and graph-paper rules |

Color is never the only state signal. Every warning uses a symbol and explicit text.

## Type and spacing

- Display: Georgia, `Times New Roman`, serif. It supplies the humane, engraved quality of a field-guide title without a font download.
- Body: system sans (`Inter`-like platform stack). It keeps measurements and controls clear.
- Measurements use tabular numerals. The scale is 14, 16, 18, 24, 36, and 56 px.
- An 8 px base rhythm governs gaps. Major sections use 64–112 px; control groups use 16–24 px.
- Reading text stays below 70 characters. Form labels are short and sit above fields.

## Shape, depth, and interaction grammar

- Panels resemble loose survey sheets: square corners with one clipped corner, a 1 px ink rule, and a low offset shadow.
- Section headings use direct task names such as `Measure the space`; the field-guide influence stays visual rather than decorative copy.
- Buttons are solid fern rectangles with a small arrow or direct verb. Links stay underlined.
- The calculator is the main visual object. Decoration remains behind or beside the work.
- Focus is a 3 px ochre outline with a 3 px offset.
- On small screens, the live fit verdict moves before the detailed stock list. Nothing is hidden.
- Demo mode starts with a compact project field sheet: the sample name and live verdict sit above the long measurement form. Its dark sticky banner stays visually separate from the paper workspace.

## Motion policy

The signature motion is a single “pressed leaf to measured panel” reveal: page elements rise 8 px into place over 240 ms as their containing section enters. Calculator changes cross-fade for 160 ms; no element loops. Under `prefers-reduced-motion: reduce`, all transforms and smooth scrolling stop and state updates are immediate.

## Asset plan and provenance

- Hero: an original editorial still life showing a small plywood cabinet as a botanical specimen, surrounded by pressed fern fronds, a folding rule, pencil marks, and dimension lines. It explains the mix of fit planning and field notes without showing fake software.
- Supporting marks: hand-authored SVG leaf, ruler, warning, and section-line motifs.
- Social preview: composed locally from the hero crop and product typography at 1200×630.
- Favicon/apple icon: hand-authored cabinet-and-leaf mark.

### Image prompt sheet

Subject: a precise small plywood utility cabinet in an exploded but physically plausible arrangement, three-quarter view, with two doors and a centre divider; a folding wooden ruler and pressed fern specimens around it. World: an old botanical field-guide plate used on a tidy workbench. Materials: birch plywood, aged ivory paper, graphite, linen tape, dried fern. Light: soft north-window daylight with short honest shadows. Lens/composition: editorial overhead three-quarter still life, large clear subject, generous quiet negative space at upper left, no dramatic perspective. Palette words: parchment, forest green, muted ochre, graphite, pale birch. Negative list: no text, no letters, no numbers, no watermark, no logos, no people, no hands, no plastic, no power tools, no glossy 3D render, no impossible joints, no clutter.

Generated asset provenance: the hero is generated for this product with the factory image model (`factory-image`) on 2026-08-28 from the prompt above. Source PNG and prompt sidecar live in `assets/src/`; production WebP derivatives live in `public/assets/`. Generated imagery is original to Shop Fit Sheet.

## Why it fits

A field guide is made to identify problems before action. That is the product’s exact job: record a space, compare the specimen to its limits, and carry one legible sheet to the timber shop. Botanical forms soften a technical task while measured rules and labels preserve precision.
