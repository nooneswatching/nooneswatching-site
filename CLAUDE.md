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
- `npm run media`: after adding media files: thumbnails (640w), video posters, 640px grid
  video proxies (`static/assets/tile/<id>.mp4`, <=30fps, ~1 Mbps) and
  `src/media-manifest.json` (sizes). Idempotent, skips files it already made.

## Layout
- `src/work.mjs`: ALL work. `projects[]` (ordered; each with `assets` as
  `[media, title, caption]` and a `cover` id) and `singles[]`. `buildCatalogue()`
  normalises it. `todo(id, label)` is a placeholder for media Josh still has to supply;
  `SHOW_PLACEHOLDERS` (false for now) hides them and any project left with nothing else.
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
- build.mjs appends a content hash (`?v=`) to every /assets URL and to /main.js and
  /styles.css. Keep it: Safari served a stale un-versioned main.js through a whole
  afternoon of "the fix changed nothing" (Oct 2026).

## Performance (grid) and diagnostics
- Grid tiles play the 640px proxies; the lightbox plays the masters in `static/assets/video`
  (1080p to 4K, 6-18 Mbps). Half a dozen masters decoding at once in 296px tiles made
  Safari's drag unusable; proxies fixed it (Oct 2026). Opening a video tile adopts its proxy
  for the zoom flight, loads the master only after the flight has landed (450ms), seeks it
  to the proxy's moment and fades it in on `requestVideoFrameCallback`, i.e. once a frame
  has really been presented (Safari fires loadeddata/canplay before painting: black flash).
- New tile clips are created only once a drag has settled, one per frame; clips already
  playing carry on through a drag.
- URL flags in main.js (sticky per tab via sessionStorage, `?flag=0` clears): `?diag` shows
  a frame-time readout and posts every real grid drag's stats to the dev server
  (`POST /__bench`, printed in its log); `?bench` runs scripted drags per variant and posts
  them; `?novideo`, `?noglass` (no backdrop blurs or logo blend), `?nohover`,
  `?squarevideo`, `?noblur` (lightbox) isolate one cost each. To measure Safari:
  `open -a Safari 'http://localhost:3000/?bench&diag'`, then read the dev server log.
  safaridriver sessions time out on this Mac even with remote automation allowed.
- Safari 27 on this Mac: 60fps in every variant, input clean; the phantom "still slow" was
  the stale script above.

## Routes
`/` grid, `/list` Index (not `/index`: that is `index.html`), `/info`, `/work/<project>`,
`/work/<project>/<n>`, `/work/<piece>`. Filter is `?f=<id>`. Every route is a real file
in `dist/` with its own title/OG tags; main.js reads `location` on boot.

## Behaviour that was decided deliberately (don't change without asking)
- Theme follows the device. No toggle. Edge fades on the canvas only in dark mode.
- All UI is rounded rectangles, never pills or circles. PP Neue Montreal 400 for
  everything except the logo wordmark (500).
- No labels on tiles. Hover (desktop) lifts the tile slightly and shows a faint 1px stroke;
  it does not dim the other tiles (that read as blinking). No minimap, no recenter.
- Filters are mutually exclusive; applying one repopulates the canvas (no dimming).
  `REPEAT_SMALL_SETS` in main.js is the open question (repeat vs finite canvas). The filter
  dock exists on the grid only: the Index always lists everything and Info has nothing to
  filter; a lightbox opened from the Index walks every piece.
- Lightbox: left/right walk the whole filmstrip first, then move on through the current
  filter's grid order (skipping further tiles of the project just finished) and enter the
  next project at its first asset going forward, its last going backward. Project
  assets show the project card (expands downward over the asset, never resizes it) and a
  filmstrip; singles show title + caption + "From <project> ↗". Controls auto-hide after
  2s without pointer movement on desktop only; on phones they never hide.
- Mobile sheets expand in place from their corner (filter bottom-left, view bottom-right)
  and blur everything behind them. The project card becomes the bottom info tray.
- No em dashes in UI copy. Existing project copy from the old site is unchanged.
- The view switcher (Grid/Index/Info) is icon-only (labels removed Oct 2026); the pill
  slides between fixed 34px items on `--ease-pill`, measured from the seg's padding box.
- The root reserves the scrollbar gutter (`scrollbar-gutter: stable`): the grid locks
  scrolling and Index/Info scroll, so otherwise a classic scrollbar appeared on every
  switch and shoved the right-anchored switcher 15px sideways mid-animation.
- The Index section never transforms on entry (its head and table rise instead): a
  transform makes it the containing block for its fixed hover preview card, which then
  widened the document and flashed a horizontal scrollbar.
- Light-mode grid logo blends with `difference`; its dots must be the disc's opposite
  colour inside the group or they vanish into it. The All work button's glass is a
  pseudo-element so hover can scale the background alone.

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
  natural aspect ratio, never cropped. Videos must use square pixels (Safari paints a
  clip's first frames at its stored size, a squashed flash); `npm run media` re-encodes any
  that don't. No panel backgrounds;
  `bg` only backs PNGs with transparency.
- Breakpoints: phone < 810, tablet 810 to 1199, desktop 1200+.
