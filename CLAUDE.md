# NO/ONES/WATCHING (nooneswatching.me)

Josh Newton's portfolio. Migrated off Framer to a static site hosted on Vercel.
The first commit (38499e1) is the untouched 1:1 recreation of the Framer site; the
commit after it adds Framer's animations. A redesign is planned next.

## Stack
Plain HTML/CSS/JS. No framework, no npm dependencies (Lenis is vendored as a single
minified file). `build.mjs` (~200 lines of Node) renders pages from `src/data.mjs` into
`dist/`. Node 18+.

## Commands
- `npm run dev`: build, then serve `dist/` at http://localhost:3000 (scripts/serve.mjs,
  zero deps, clean URLs, byte ranges for video). Does not watch: rebuild after edits.
  `.claude/launch.json` has a `dev` entry for the in-app browser preview.
- `npm run build`: build only. This is what Vercel runs.
- `npm run fetch-assets`: re-download media from Framer's CDN. Already done, and only
  works while the Framer site is live. Don't rely on it.
- `PREVIEW=1 node build.mjs`: single-file pages in `preview/` that load media from
  Framer's CDN. QA only.

## Layout
- `src/data.mjs`: ALL content. Site meta, socials, the one intro, feed rows, project cards,
  case studies (order = prev/next order in the dock), menu items. Edit content here, not
  in templates.
- `build.mjs`: templates (nav, menu overlay, intro, home with both grids, case study, dock).
  Feed and Projects are ONE page: `home(view)` renders the intro plus both grids, and
  `index.html` / `Projects.html` differ only in which grid starts visible (`data-view`)
  and which dock tab is active. main.js toggles them in place and pushes `/` or
  `/Projects` into history, so both URLs still work, deep-link and crawl.
- `static/styles.css`: all styles. `static/main.js`: menu, video autoplay-in-view, feed
  flipbook slideshow (hard cut every 500ms), appear effects, Lottie init (lottie_light
  from cdnjs). main.js is loaded `defer` BEFORE the Lottie script (which is `async`),
  otherwise every behaviour waits on the CDN download.
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

## Animations (measured from the Framer site with a MutationObserver, Oct 2026)
- Menu open: overlay fades 300ms linear; eyebrow + rows rise in 100ms apart (eyebrow and
  row 1 rise 20px, later rows 10px, 300ms, cubic-bezier(.4,0,.25,1)); social chips fade
  in last, 100ms apart from 0.8s. Close: content fades 250ms, overlay 300ms. Stagger index
  is an inline `--i` on each `<li>` from build.mjs; everything else is CSS on `.is-open`.
- Dock: Feed/Projects toggle swaps the grids in place. The outgoing grid fades 150ms, the
  incoming one replays its appear effects, and if the reader was scrolled into the old
  grid they're put at the top of the new one. The highlight is a `.dock__pill` span that
  main.js measures and slides (300ms ease-in-out); until it's placed the active tab keeps
  its own background (`.dock.is-ready` flips that). Nav, intro and dock never move.
  Inactive dock items dim to 80% on hover.
- Smooth scroll: Lenis 1.3.27, vendored at `static/vendor/lenis.min.js` (the same library
  behind Framer's "Smooth Scroll" setting; Framer ran it at intensity 10, which is
  `duration: 1`). Initialised at the top of main.js, skipped under `prefers-reduced-motion`.
  Anything with its own scrollbar needs `data-lenis-prevent` (the menu overlay has it).
- Appear effects: elements with `data-appear` start at opacity 0 and rise into place once
  main.js sees them enter the viewport (one-shot `is-in`). Default 10px / 500ms
  ease-in-out (feed and case media tiles); `data-appear="20"` is 20px with `ease`
  (intros, project cards); `data-appear="30"` is 30px / 300ms ease-out (case info
  column). The `.js` class is added by an inline head script so nothing flashes, and
  `prefers-reduced-motion` disables all of it.

## Design values (measured from Framer, keep for the baseline)
- Font: PP Neue Montreal Regular (400) / Medium (500), self-hosted as family "NM".
  Check the license covers web self-hosting before relying on it long term.
- Colours: ink #3d3d3d, strong #1c1c1c, muted #aeaeae, slash #898989, line #f0f0f0,
  chip #eaeaea, dock #0e0e0e / #efefef.
- Breakpoints match Framer: phone < 810, tablet 810 to 1199, desktop 1200+.
  Tablet: intro 480px, case info column 259px. Desktop: intro 540px, info column 320px.
- 8px gutters everywhere (Framer had 18px under the feed slideshow and a 10px column gap
  on Projects; Josh unified them to 8px, Oct 2026). 4px tile radius. 60px between Projects
  card rows is deliberate spacing, not a gutter.

## URLs (must stay stable, they match the old Framer site)
`/`, `/Projects` (capital P), `/projects/frame-v4`, `/projects/adidas_boston-marathon`,
`/projects/think-with-google`, `/projects/pixel`, `/projects/gotcha`, `/projects/don-julio`.
`dist/Projects.html` and `dist/projects/` coexist; macOS is case-insensitive, Vercel is not.

## Gotchas
- `public/` is a leftover from a failed first build. Ignored; safe to delete.
- The project lives in Dropbox ("Personal Projects/00_Portfolio"). The path has spaces, so
  scripts/serve.mjs resolves `dist/` with fileURLToPath. If files appear empty or vanish,
  check the folder is set to be available offline.
- Copy matches Framer exactly, including inconsistencies (e.g. Gotcha is 2021 on the
  Projects card but 2022 on its page). Don't "fix" these without asking. The intro was
  rewritten by Josh in Oct 2026 ("designer & director. Currently at Adobe. 2016 — 2026")
  and is now shared by Feed and Projects.
- Google Analytics id lives in `site.gaId` in src/data.mjs.

## Preferences
- Josh's writing preference: no em-dashes in new copy (existing Framer copy is unchanged).
- Josh is a designer who builds high-fidelity prototypes; favour clean, hand-written
  HTML/CSS over adding frameworks or dependencies unless asked.
