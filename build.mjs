// Static site generator for NO/ONES/WATCHING v3:  node build.mjs  ->  ./dist
//
// One shell page carries all three views (Grid, Index, Info), the chrome and the
// lightbox; static/main.js switches between them and drives the canvas. The shell is
// written once per route so every URL is a real file with its own <title> and OG tags:
//   /            index.html          grid
//   /list        list.html           index view
//   /info        info.html           info view
//   /work/<slug> work/<slug>.html    grid + lightbox open (project or single piece)
// /work/<project>/<n> is rewritten to /work/<project> by vercel.json and scripts/serve.mjs.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { site, socials, info } from './src/content.mjs';
import { buildCatalogue, DISCIPLINES } from './src/work.mjs';

const OUT = 'dist';
const manifest = JSON.parse(readFileSync('src/media-manifest.json', 'utf8'));
const { assets, projects } = buildCatalogue(manifest);
const byId = Object.fromEntries(assets.map((a) => [a.id, a]));
const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === '.DS_Store') continue;
    const s = join(src, name), d = join(dest, name);
    if (statSync(s).isDirectory()) copyDir(s, d); else writeFileSync(d, readFileSync(s));
  }
}

// ---- derived catalogue ------------------------------------------------------------
// Canvas order for "All work": round-robin across projects and the singles so the
// canvas mixes clients instead of showing sixteen Adidas tiles in a row.
const groups = [...projects.map((p) => p.assets), assets.filter((a) => !a.inProject).map((a) => a.id)];
const order = [];
for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (g[i]) order.push(g[i]);

const pieces = order; // every asset is a piece
const filters = [
  { id: 'all', name: 'All work', ids: pieces, sub: plural(pieces.length, 'piece') },
  { id: 'projects', name: 'Projects', ids: projects.map((p) => p.cover), sub: `${projects.length} case studies` },
  ...DISCIPLINES.map((d) => {
    const ids = pieces.filter((id) => byId[id].disciplines.includes(d));
    return { id: d, name: cap(d), ids, sub: plural(ids.length, 'piece') };
  }),
].map((f) => {
  // dock/sheet thumbnail: a project cover that has real media, if there is one
  const pick = f.ids.find((id) => byId[id].media.thumb && projects.some((p) => p.cover === id)) || f.ids.find((id) => byId[id].media.thumb);
  return { ...f, count: f.ids.length, thumb: pick ? byId[pick].media.thumb : null };
});

// Which project a piece opens with in the lightbox (project assets and covers).
const projectOf = (a) => (a.inProject ? projectById[a.projectId] : null);
const pieceUrl = (a) => {
  const p = projectOf(a);
  if (!p) return `/work/${a.slug}`;
  const n = p.assets.indexOf(a.id) + 1;
  return n === 1 ? `/work/${p.slug}` : `/work/${p.slug}/${n}`;
};

const data = {
  assets: Object.fromEntries(assets.map((a) => [a.id, { ...a, url: pieceUrl(a), projectSlug: projectOf(a)?.slug || (a.projectId ? projectById[a.projectId].slug : null) }])),
  projects: projects.map((p) => ({ ...p, url: `/work/${p.slug}` })),
  filters,
  order,
};

// ---- icons (16px, 1.5 stroke, round caps; drawn to the Figma set) ---------------
const I = {
  grid: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><g fill="currentColor"><rect x="1.5" y="1.5" width="3.4" height="3.4" rx="1"/><rect x="6.3" y="1.5" width="3.4" height="3.4" rx="1"/><rect x="11.1" y="1.5" width="3.4" height="3.4" rx="1"/><rect x="1.5" y="6.3" width="3.4" height="3.4" rx="1"/><rect x="6.3" y="6.3" width="3.4" height="3.4" rx="1"/><rect x="11.1" y="6.3" width="3.4" height="3.4" rx="1"/><rect x="1.5" y="11.1" width="3.4" height="3.4" rx="1"/><rect x="6.3" y="11.1" width="3.4" height="3.4" rx="1"/><rect x="11.1" y="11.1" width="3.4" height="3.4" rx="1"/></g></svg>`,
  index: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="2.75" cy="4" r=".9" fill="currentColor" stroke="none"/><circle cx="2.75" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="2.75" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M6 4h8M6 8h8M6 12h8"/></svg>`,
  info: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.2v4"/><circle cx="8" cy="4.9" r=".8" fill="currentColor" stroke="none"/></svg>`,
  up: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg>`,
  down: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`,
  check: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>`,
  close: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
  left: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 4L3 8l4 4"/></svg>`,
  right: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  chevL: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>`,
  chevR: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>`,
  ne: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>`,
};
const logoMark = `<svg class="logo__mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="12" class="logo__disc"/><path class="logo__dots" d="M13.714 8.571a1.714 1.714 0 1 1-3.429 0 1.714 1.714 0 0 1 3.429 0Zm-3.428 5.143a1.714 1.714 0 1 1-3.429 0 1.714 1.714 0 0 1 3.429 0Zm5.143 1.715a1.714 1.714 0 1 0 0-3.429 1.714 1.714 0 0 0 0 3.429Z"/></svg>`;

// ---- chrome ---------------------------------------------------------------------
const logo = () => `<a class="logo" href="/" data-view-link="grid" aria-label="NO/ONES/WATCHING, back to the grid">${logoMark}<span class="logo__word">NO<i>/</i>ONES<i>/</i>WATCHING<sup>®</sup></span></a>`;

const filterRow = (f, active) => `<li role="option" aria-selected="${active}"><button type="button" class="sheet__row${active ? ' is-active' : ''}" data-filter="${f.id}">
  <span class="sheet__thumb">${f.thumb ? `<img src="${f.thumb}" alt="" loading="lazy">` : ''}</span>
  <span class="sheet__text"><span class="sheet__name">${esc(f.name)}</span><span class="sheet__sub">${esc(f.sub)}</span></span>
  <span class="sheet__check">${I.check}</span></button></li>`;

const dock = () => {
  const f = filters[0];
  return `<div class="dock" id="dock">
  <button type="button" class="dock__btn glass" id="dock-btn" aria-expanded="false" aria-controls="filter-sheet" aria-label="Filter">
    <span class="dock__thumb"><img src="${f.thumb}" alt="" id="dock-thumb"></span>
    <span class="dock__text"><span class="dock__name" id="dock-name">${esc(f.name)}</span><span class="dock__count" id="dock-count">${esc(f.sub)}</span></span>
    <span class="dock__chev">${I.up}</span>
  </button>
  <div class="sheet sheet--filter glass" id="filter-sheet" hidden>
    <p class="sheet__label" id="filter-label">Filter</p>
    <ul class="sheet__list" role="listbox" aria-labelledby="filter-label">
${filters.map((f, i) => filterRow(f, i === 0)).join('\n')}
    </ul>
  </div>
</div>`;
};

const VIEWS = [['grid', 'Grid', '/'], ['list', 'Index', '/list'], ['info', 'Info', '/info']];
const views = (active) => `<div class="views" id="views">
  <nav class="seg glass" aria-label="View">
    <span class="seg__pill" aria-hidden="true"></span>
${VIEWS.map(([id, label, href]) => `    <a class="seg__item${id === active ? ' is-active' : ''}" href="${href}" data-view-link="${id}" aria-label="${label}" title="${label}"${id === active ? ' aria-current="page"' : ''}>${I[id === 'list' ? 'index' : id]}<span class="seg__label">${label}</span></a>`).join('\n')}
  </nav>
  <button type="button" class="views__btn glass" id="views-btn" aria-expanded="false" aria-controls="view-sheet" aria-label="View">
${VIEWS.map(([id]) => `    <span class="views__icon" data-view-icon="${id}">${I[id === 'list' ? 'index' : id]}</span>`).join('\n')}
  </button>
  <div class="sheet sheet--view glass" id="view-sheet" hidden>
    <p class="sheet__label" id="view-label">View</p>
    <ul class="sheet__list" role="listbox" aria-labelledby="view-label">
${VIEWS.map(([id, label, href]) => `      <li role="option" aria-selected="${id === active}"><a class="sheet__row${id === active ? ' is-active' : ''}" href="${href}" data-view-link="${id}"><span class="sheet__tile">${I[id === 'list' ? 'index' : id]}</span><span class="sheet__text"><span class="sheet__name">${label}</span></span><span class="sheet__check">${I.check}</span></a></li>`).join('\n')}
    </ul>
  </div>
</div>
<div class="scrim" id="scrim" hidden></div>`;

// ---- views ----------------------------------------------------------------------
const grid = () => `<section class="grid" id="grid" aria-label="Work" data-lenis-prevent>
  <div class="canvas" id="canvas" tabindex="0"><div class="canvas__layer" id="layer"></div></div>
  <div class="grid__fade grid__fade--t"></div><div class="grid__fade grid__fade--b"></div><div class="grid__fade grid__fade--l"></div><div class="grid__fade grid__fade--r"></div>
</section>`;

// Index rows: one per project, then the single pieces. main.js filters and sorts them.
const indexRows = () => {
  const rows = [
    ...projects.map((p) => ({ kind: 'project', id: p.id, href: p.url, thumb: byId[p.cover].media.thumb, title: p.title, client: p.client, disciplines: p.disciplines, type: `Project · ${p.assets.length}`, year: p.year })),
    ...assets.filter((a) => !a.inProject).map((a) => ({ kind: 'single', id: a.id, href: `/work/${a.slug}`, thumb: a.media.thumb, title: a.title, client: a.client, disciplines: a.disciplines, type: 'Single', year: a.year })),
  ];
  return rows.map((r) => `<a class="row" href="${r.href}" data-kind="${r.kind}" data-id="${r.id}" data-title="${esc(r.title.toLowerCase())}" data-year="${r.year}" data-disc="${r.disciplines.join(',')}" data-thumb="${r.thumb || ''}">
  <span class="row__thumb">${r.thumb ? `<img src="${r.thumb}" alt="" loading="lazy">` : ''}</span>
  <span class="row__title">${esc(r.title)}</span>
  <span class="row__client">${esc(r.client)}</span>
  <span class="row__disc">${r.disciplines.map(cap).join(', ')}</span>
  <span class="row__type">${esc(r.type)}</span>
  <span class="row__year">${r.year}</span>
  <span class="row__arrow">${r.kind === 'project' ? I.ne : ''}</span>
</a>`).join('\n');
};

const list = () => `<section class="list" id="list" hidden>
  <div class="list__head">
    <div><h1 class="list__title">Index</h1><p class="list__sub" id="list-sub">${plural(pieces.length, 'piece')} · ${plural(projects.length, 'project')}</p></div>
    <div class="seg seg--sort glass" role="radiogroup" aria-label="Sort">
      <span class="seg__pill" aria-hidden="true"></span>
      <button type="button" class="seg__item is-active" data-sort="newest" role="radio" aria-checked="true">Newest</button>
      <button type="button" class="seg__item" data-sort="az" role="radio" aria-checked="false">A–Z</button>
      <button type="button" class="seg__item" data-sort="discipline" role="radio" aria-checked="false">Discipline</button>
    </div>
  </div>
  <div class="table" id="table">
    <div class="table__head" aria-hidden="true"><span></span><span>Title</span><span>Client</span><span>Discipline</span><span>Type</span><span>Year</span><span></span></div>
${indexRows()}
  </div>
  <div class="list__preview" id="preview" aria-hidden="true"><img alt=""></div>
  <div class="list__fade"></div>
</section>`;

const infoView = () => `<section class="info" id="info" hidden>
  <div class="info__inner">
    <h1 class="info__statement">${esc(info.statement.lead)} <span>${esc(info.statement.rest)}</span></h1>
    <div class="info__section"><h2 class="info__label">About</h2><div class="info__body info__about">${info.about.map((p, i) => `<p${i ? ' class="is-muted"' : ''}>${esc(p)}</p>`).join('')}</div></div>
    <div class="info__section"><h2 class="info__label">Experience</h2><div class="info__body"><ul class="info__rows">${info.experience.map(([a, b, c]) => `<li><span class="info__a">${esc(a)}</span><span class="info__b">${esc(b)}</span><span class="info__c">${esc(c)}</span></li>`).join('')}</ul></div></div>
    <div class="info__section"><h2 class="info__label">Recognition</h2><div class="info__body"><ul class="info__rows">${info.recognition.map(([a, b]) => `<li><span class="info__a">${esc(a)}</span><span class="info__b">${esc(b)}</span></li>`).join('')}</ul></div></div>
    <div class="info__section"><h2 class="info__label">Selected clients</h2><div class="info__body"><p class="info__clients">${esc(info.clients)}</p></div></div>
    <div class="info__section"><h2 class="info__label">Contact</h2><div class="info__body">
      <a class="info__email" href="mailto:${site.email}">${esc(site.email)}<span class="info__ne">${I.ne}</span></a>
      <ul class="info__socials">${socials.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.name}">${s.label}</a></li>`).join('')}</ul>
    </div></div>
    <footer class="info__foot"><span>${esc(info.copyright)}</span><a href="#top" id="back-to-top">Back to top ↑</a></footer>
  </div>
</section>`;

// ---- lightbox -------------------------------------------------------------------
const lightbox = () => `<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Work" tabindex="-1">
  <div class="lb__bg"></div>
  <div class="lb__stage" id="lb-stage">
    <figure class="lb__asset" id="lb-asset"></figure>
    <div class="lb__scrim"></div>
  </div>
  <div class="lb__ui" id="lb-ui">
    <div class="lb__dim" id="lb-dim"></div>
    <div class="lb__card" id="lb-card">
      <span class="lb__handle" aria-hidden="true"></span>
      <button type="button" class="lb__cardhead" id="lb-cardhead" aria-expanded="false" aria-controls="lb-cardbody">
        <span class="lb__cardtext"><span class="lb__title" id="lb-title"></span><span class="lb__sub" id="lb-sub"></span></span>
        <span class="lb__toggle" id="lb-toggle" aria-label="Show project info">${I.down}</span>
      </button>
      <div class="lb__cardbody" id="lb-cardbody" hidden>
        <p class="lb__desc" id="lb-desc"></p>
        <dl class="lb__meta" id="lb-meta"></dl>
      </div>
    </div>
    <button type="button" class="lb__close glass" id="lb-close" aria-label="Close">${I.close}</button>
    <button type="button" class="lb__arrow lb__arrow--prev glass" id="lb-prev" aria-label="Previous">${I.left}</button>
    <button type="button" class="lb__arrow lb__arrow--next glass" id="lb-next" aria-label="Next">${I.right}</button>
    <div class="lb__bottom" id="lb-bottom">
      <p class="lb__count" id="lb-count"></p>
      <div class="lb__navrow">
        <button type="button" class="lb__marrow glass" id="lb-mprev" aria-label="Previous">${I.chevL}</button>
        <div class="lb__strip glass" id="lb-strip" hidden><div class="lb__thumbs" id="lb-thumbs" role="list"></div></div>
        <button type="button" class="lb__marrow glass" id="lb-mnext" aria-label="Next">${I.chevR}</button>
      </div>
    </div>
  </div>
</div>`;

// ---- page shell -----------------------------------------------------------------
function page({ path, view, title = site.title, desc = site.description, image = site.ogImage, open = null }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>document.documentElement.className+=" js"</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b0b0c">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f3f1">
<link rel="canonical" href="${site.url}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.url}${path}">
<meta property="og:image" content="${site.url}${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${site.url}${image}">
<link rel="icon" href="${site.favicon}">
<link rel="preload" href="/assets/fonts/Vgooyn5UgzxUXCAvebdulHCfXA.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
${site.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');</script>` : ''}
</head>
<body data-view="${view}" data-filter="all" id="top"${open ? ` data-open="${esc(open)}"` : ''}>
${logo()}
<main id="main">
${grid()}
${list()}
${infoView()}
</main>
${dock()}
${views(view)}
${lightbox()}
<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/vendor/lenis.min.js" defer></script>
<script src="/main.js" defer></script>
</body>
</html>
`;
}

// ---- write ----------------------------------------------------------------------
const out = {};
out['index.html'] = page({ path: '/', view: 'grid' });
out['list.html'] = page({ path: '/list', view: 'list', title: `Index · ${site.title}` });
out['info.html'] = page({ path: '/info', view: 'info', title: `Info · ${site.title}` });
for (const p of projects) {
  const cover = byId[p.cover];
  out[`work/${p.slug}.html`] = page({ path: p.url, view: 'grid', open: p.url, title: `${p.title} · ${site.title}`, desc: p.description, image: cover.media.poster || cover.media.src || site.ogImage });
}
for (const a of assets.filter((x) => !x.inProject)) {
  out[`work/${a.slug}.html`] = page({ path: `/work/${a.slug}`, view: 'grid', open: `/work/${a.slug}`, title: `${a.title} · ${site.title}`, desc: `${a.caption} · ${a.client} · ${a.year}`, image: a.media.poster || a.media.src || site.ogImage });
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/work`, { recursive: true });
// /assets is served immutable for a year, so every asset URL carries a content hash:
// a re-encoded or replaced file gets a new URL and no browser keeps the old one.
const hashes = new Map();
const ver = (url) => {
  const clean = url.replace(/[?#].*$/, '');
  if (!hashes.has(clean)) {
    const file = join('static', clean);
    hashes.set(clean, existsSync(file) ? createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8) : null);
  }
  const h = hashes.get(clean);
  return h ? `${clean}?v=${h}` : clean;
};
const versioned = (html) => html.replace(/\/assets\/[^"'\s)<\\?]+/g, (m) => ver(m));
for (const [f, html] of Object.entries(out)) writeFileSync(`${OUT}/${f}`, versioned(html));
copyDir('static', OUT);
console.log(`Built ${Object.keys(out).length} pages -> ${OUT}/ (${assets.length} pieces, ${projects.length} projects)`);
