# NO/ONES/WATCHING (nooneswatching.me)

Josh Newton's portfolio. v3 (Oct 2026) replaced the Framer-era pages with a product-like
experience: an endless pannable canvas of every piece, filters, an Index view, an Info
page and one lightbox for single pieces and projects. The design source of truth is the
Figma file `Portfolio-24` (sKLFi6zl9TqHZSdSCRUzLL), page `Portfolio v3 · Designs`
(node 958:53). Where Figma and the handoff doc disagree: Figma wins on visuals, the doc
on behaviour. The v1 code (1:1 Framer rebuild) is in git history before commit "v3:".

## Stack
Plain HTML/CSS/JS. No framework, no npm dependencies (Lenis vendored). `build.mjs`
renders one shell page per route from `src/work.mjs` + `src/content.mjs` into `dist/`.
Node 18+. `scripts/media.mjs` needs ffmpeg/ffprobe (local only; outputs are committed).

## Commands
- `npm run dev`: build, then serve `dist/` at http://localhost:3000 (scripts/serve.mjs,
  mirrors the Vercel routing). Does not watch: rebuild after edits.
- `npm run build`: build only. What Vercel runs.
- `npm run media`: after adding media files: thumbnails (640w), video posters and
  `src/media-manifest.json` (sizes). Idempotent, skips files it already made.

## Layout
- `src/work.mjs`: ALL work. `projects[]` (ordered; each with `assets` as
  `[media, title, caption]` and a `cover` id) and `singles[]`. `buildCatalogue()`
  normalises it. `todo(id, label)` is a placeholder for media Josh still has to supply.
- `src/content.mjs`: site meta, socials, Info copy (statement, about, experience,
  recognition, clients). TODO(Josh) comments mark copy still to approve.
- `build.mjs`: catalogue derivation (canvas order is a round-robin across projects and
  singles; filters with counts), inline SVG icons, chrome, the three views, the lightbox
  shell, page template. Embeds the catalogue as JSON in `#data`.
- `static/main.js`: `Canvas` class (virtualised endless masonry: shortest-column packing,
  each column repeats with its own period, blocks repeat sideways; pan with momentum,
  hover, in-view video, repopulate animation, zoom around the opening tile), sheets, filters, view switch,
  `lb` (lightbox), Index sort/filter/preview, URL state + history.
- `static/styles.css`: tokens for dark and light, components, `@media (max-width: 809px)`
  phone layout at the bottom. Figma values are noted inline.
- `vercel.json`: clean URLs, `/work/:slug/:n` rewrite, redirects from the old URLs.

## Routes
`/` grid, `/list` Index (not `/index`: that is `index.html`), `/info`, `/work/<project>`,
`/work/<project>/<n>`, `/work/<piece>`. Filter is `?f=<id>`. Every route is a real file
in `dist/` with its own title/OG tags; main.js reads `location` on boot.

## Behaviour that was decided deliberately (don't change without asking)
- Theme follows the device. No toggle. Edge fades on the canvas only in dark mode.
- All UI is rounded rectangles, never pills or circles. PP Neue Montreal 400 for
  everything except the logo wordmark (500).
- Labels on tiles appear only on hover. No always-on labels, no minimap, no recenter.
- Filters are mutually exclusive; applying one repopulates the canvas (no dimming).
  `REPEAT_SMALL_SETS` in main.js is the open question (repeat vs finite canvas).
- Lightbox: left/right walk the whole filmstrip first, then move on through the current
  filter's grid order (skipping further tiles of the project just finished) and enter the
  next project at its first asset going forward, its last going backward. Project
  assets show the project card (expands downward over the asset, never resizes it) and a
  filmstrip; singles show title + caption + "From <project> ↗". Controls auto-hide after
  2s without pointer movement on desktop only; on phones they never hide.
- Mobile sheets expand in place from their corner (filter bottom-left, view bottom-right)
  and blur everything behind them. The project card becomes the bottom info tray.
- No em dashes in UI copy. Existing project copy from the old site is unchanged.

## Deployment
Production = `main` = nooneswatching.me. v3 work lives on a dev branch; the project's
`*.vercel.app` domain should be assigned to that branch in Vercel. Never push or merge
to `main` or touch domain settings without Josh's explicit go-ahead.

## Design values (from Figma)
- Backgrounds #0b0b0c / #f3f3f1. Ink white / #111 with 40 to 55% secondary.
- Glass: rgba(28,28,30,.72) (dock .82, sheets .88 to .9), blur 12 to 24px, 1px border
  rgba(255,255,255,.08). Light: white .72 to .9, border rgba(17,17,17,.08). Controls over
  imagery in light mode are clear glass (white .04) with white icons.
- Radii: sheets 18 (22 phone), docks/buttons 14 to 16, segments/rows 7 to 12, tiles 10
  (8 phone), lightbox asset 14 (12 phone).
- Masonry: 296px columns, 20px gaps (168px / 12px on phones); every tile keeps its asset's
  natural aspect ratio, never cropped. Video sizes in the manifest are display sizes (sample
  aspect ratio applied); several files use non-square pixels. No panel backgrounds;
  `bg` only backs PNGs with transparency.
- Breakpoints: phone < 810, tablet 810 to 1199, desktop 1200+.
