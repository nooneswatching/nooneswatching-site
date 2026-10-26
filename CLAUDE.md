# NO/ONES/WATCHING (nooneswatching.me)

Josh Newton's portfolio. Migrated off Framer to a static site hosted on Vercel.
The current build is a 1:1 recreation of the Framer site (the baseline). A redesign
is planned next, so keep the baseline intact until it's committed to git.

## Stack
Plain HTML/CSS/JS. No framework, no npm dependencies. `build.mjs` (~200 lines of
Node) renders pages from `src/data.mjs` into `dist/`. Node 18+.

## Commands
- `npm run dev`: build, then serve `dist/` at http://localhost:3000 (scripts/serve.mjs,
  zero deps, clean URLs, byte ranges for video). Does not watch: rebuild after edits.
- `npm run build`: build only. This is what Vercel runs.
- `npm run fetch-assets`: re-download media from Framer's CDN. Already done, and only
  works while the Framer site is live. Don't rely on it.
- `PREVIEW=1 node build.mjs`: single-file pages in `preview/` that load media from
  Framer's CDN. QA only.

## Layout
- `src/data.mjs`: ALL content. Site meta, socials, feed rows, project cards, case studies
  (order = prev/next order in the dock), menu items. Edit content here, not in templates.
- `build.mjs`: templates (nav, menu overlay, intro, feed, projects grid, case study, dock).
- `static/styles.css`: all styles. `static/main.js`: menu, video autoplay-in-view, feed
  flipbook slideshow (hard cut every 500ms), Lottie init (lottie_light from cdnjs).
- `static/assets/{img,video,fonts,lottie}`: self-hosted media, ~164 MB, committed to git.
  Files are named by their original Framer asset id.
- `src/svg/`: inline SVGs (e.g. gotcha-icons).
- `vercel.json`: build command, `dist` output, cleanUrls, /projects -> /Projects redirect,
  immutable caching for /assets.

## Media model (src/data.mjs)
- Rows: `full(item, w, h)` or `pair(a, b, w, h, { mobilePair })`. w/h are the original
  design pixels and only set aspect-ratio, so everything scales.
- Items: `img(id, ext, { fit })`, `vid(id)`, `lottie(id)`, `svg(name)`.
- `panel(bg, w, h, [kid(item, w, h, radius)], gap)`: coloured tile with centred media.
  Child sizes are converted to percentages of the panel width.

## Design values (measured from Framer, keep for the baseline)
- Font: PP Neue Montreal Regular (400) / Medium (500), self-hosted as family "NM".
  Check the license covers web self-hosting before relying on it long term.
- Colours: ink #3d3d3d, strong #1c1c1c, muted #aeaeae, slash #898989, line #f0f0f0,
  chip #eaeaea, dock #0e0e0e / #efefef.
- Breakpoints match Framer: phone < 810, tablet 810 to 1199, desktop 1200+.
  Tablet: intro 480px, case info column 259px. Desktop: intro 540px, info column 320px,
  extra 10px under the feed slideshow.
- 8px gutters, 4px tile radius, 10px column gap on the Projects grid.

## URLs (must stay stable, they match the old Framer site)
`/`, `/Projects` (capital P), `/projects/frame-v4`, `/projects/adidas_boston-marathon`,
`/projects/think-with-google`, `/projects/pixel`, `/projects/gotcha`, `/projects/don-julio`.
`dist/Projects.html` and `dist/projects/` coexist; macOS is case-insensitive, Vercel is not.

## Gotchas
- `public/` is a leftover from a failed first build. Ignored; safe to delete.
- The project lives in ~/Documents, which may sync to iCloud. If files appear empty or
  vanish, check that the folder is set to "Keep Downloaded".
- Copy matches Framer exactly, including inconsistencies (e.g. Gotcha is 2021 on the
  Projects card but 2022 on its page; the home intro says "2016—2025", Projects says
  "2016—2024"). Don't "fix" these without asking.
- Google Analytics id lives in `site.gaId` in src/data.mjs.

## Preferences
- Josh's writing preference: no em-dashes in new copy (existing Framer copy is unchanged).
- Josh is a designer who builds high-fidelity prototypes; favour clean, hand-written
  HTML/CSS over adding frameworks or dependencies unless asked.
