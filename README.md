# NO/ONES/WATCHING

Static rebuild of nooneswatching.me, migrated off Framer. Plain HTML/CSS/JS generated
by a ~200 line Node script. No framework, no dependencies.

```
src/data.mjs           all content: copy, project order, media layout
src/svg/               inline SVGs
static/styles.css      all styles (values measured 1:1 from the Framer site)
static/main.js         menu, video autoplay-in-view, feed flipbook, Lottie
static/assets/         images, videos, fonts, Lottie JSON (downloaded once, see below)
build.mjs              generates ./dist
scripts/fetch-assets.mjs  pulls every asset off Framer's CDN
vercel.json            Vercel build + clean URLs + redirects + caching
```

Pages: `/`, `/Projects`, `/projects/frame-v4`, `/projects/adidas_boston-marathon`,
`/projects/think-with-google`, `/projects/pixel`, `/projects/gotcha`, `/projects/don-julio`
(same URLs as the Framer site, so existing links keep working).

## 1. Download the assets (once, before cancelling Framer)

```
npm run fetch-assets
```

Pulls ~90 files into `static/assets/` from Framer's CDN. Safe to re-run; it skips
files it already has. Do this while the Framer site is still live.

## 2. Preview locally

```
npm run dev        # builds, then serves dist/ at http://localhost:3000 (no downloads needed)
```

## 3. Deploy to Vercel

1. `git init && git add -A && git commit -m "Static rebuild of nooneswatching.me"`
2. Push to a new GitHub repo.
3. In Vercel: Add New > Project > import the repo. Leave Framework Preset as "Other";
   `vercel.json` already sets the build command (`node build.mjs`) and output (`dist`).
4. Check the `*.vercel.app` URL.

Or skip GitHub: `npx vercel` from this folder, then `npx vercel --prod`.

## 4. Move the domain

1. Vercel project > Settings > Domains > add `nooneswatching.me` and `www.nooneswatching.me`
   (set `www` as primary to match today's canonical URLs; redirect the apex to it).
2. Wherever the domain's DNS lives, remove the Framer records and add the ones Vercel
   shows on each domain card: an `A` record for the apex and a `CNAME` for `www`
   (the CNAME value is project-specific, so copy it from the dashboard).
3. Wait for both domains to show "Valid Configuration" and an SSL certificate.
4. Then disconnect the domain in Framer and downgrade/cancel the site plan.

## Editing content

Everything is in `src/data.mjs`. Media rows are `full(...)` or `pair(...)`;
`panel(...)` is a coloured tile with centred media inside. Sizes are the original
design pixels and only set aspect ratios, so everything scales. Run `npm run build`
(Vercel does this on every push).

## Notes

- Fonts: PP Neue Montreal (Regular, Medium) are now self-hosted from `static/assets/fonts`.
  Make sure your Pangram Pangram license covers web self-hosting.
- Google Analytics (G-MG2F86NDXQ) is carried over from Framer. Change or remove `gaId`
  in `src/data.mjs`.
- `PREVIEW=1 node build.mjs` writes single-file pages to `preview/` that load media from
  Framer's CDN. Only useful for QA before the assets are downloaded.
- Breakpoints match Framer: phone < 810px, tablet 810 to 1199px, desktop 1200px+.
