// Static site generator: node build.mjs  ->  ./dist
// PREVIEW=1 node build.mjs  ->  ./preview (single-file pages pointing at Framer's CDN; for QA only)
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Plain recursive copy (fs.cpSync trips over some synced/mounted folders)
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === '.DS_Store') continue;
    const s = join(src, name), d = join(dest, name);
    if (statSync(s).isDirectory()) copyDir(s, d); else writeFileSync(d, readFileSync(s));
  }
}
import { site, socials, feed, projects, projectsIntro, menuExtra } from './src/data.mjs';

const PREVIEW = !!process.env.PREVIEW;
const OUT = PREVIEW ? 'preview' : 'dist';
const used = new Set();

// Local asset path -> path (or Framer CDN URL in preview mode)
const CDN = 'https://framerusercontent.com';
function asset(p) {
  used.add(p);
  if (!PREVIEW) return p;
  const file = p.split('/').pop();
  if (p.startsWith('/assets/img/')) return `${CDN}/images/${file}?scale-down-to=2048`;
  return `${CDN}/assets/${file}`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (n) => `${+(n * 100).toFixed(4)}%`;
const svgs = { 'gotcha-icons': readFileSync('src/svg/gotcha-icons.svg', 'utf8').trim() };

// ---- media ---------------------------------------------------------------
function media(m, extraStyle = '') {
  const st = extraStyle ? ` style="${extraStyle}"` : '';
  if (m.t === 'img') {
    const fit = m.fit && m.fit !== 'cover' ? ` data-fit="${m.fit}"` : '';
    return `<img src="${asset(m.src)}" alt="" loading="lazy" decoding="async"${fit}${st}>`;
  }
  if (m.t === 'vid') return `<video src="${asset(m.src)}" muted loop playsinline preload="metadata" data-autoplay${st}></video>`;
  if (m.t === 'lottie') return `<div class="lottie" data-lottie="${asset(m.src)}"${st}></div>`;
  if (m.t === 'svg') return `<div class="svg"${st}>${svgs[m.name]}</div>`;
  if (m.t === 'panel') {
    const kids = m.children.map((k) => {
      const s = `width:${pct(k.w / m.w)};aspect-ratio:${k.w}/${k.h};${k.br ? `border-radius:${k.br}px;` : ''}`;
      return `<div class="kid" style="${s}">${media(k.item)}</div>`;
    }).join('');
    const gap = m.gap ? `column-gap:${pct(m.gap / m.w)};` : '';
    return `<div class="panel" style="background:${m.bg};${gap}">${kids}</div>`;
  }
  throw new Error('unknown media ' + m.t);
}

function rows(list) {
  return list.map((r) => {
    const cls = `row row--${r.kind}${r.mobilePair ? ' row--mpair' : ''}`;
    const tiles = r.items.map((m) => `<div class="tile" data-appear style="aspect-ratio:${r.ar[0]}/${r.ar[1]}">${media(m)}</div>`).join('');
    return `<div class="${cls}">${tiles}</div>`;
  }).join('\n');
}

// ---- chrome --------------------------------------------------------------
const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 24C5.373 24 0 24 0 24V0s5.373 0 12 0 12 0 12 0v24s-5.373 0-12 0Z" fill="#1c1c1c"/><path d="M13.714 8.571a1.714 1.714 0 1 1-3.429 0 1.714 1.714 0 0 1 3.429 0Zm-3.428 5.143a1.714 1.714 0 1 1-3.429 0 1.714 1.714 0 0 1 3.429 0Zm5.143 1.715a1.714 1.714 0 1 0 0-3.429 1.714 1.714 0 0 0 0 3.429Z" fill="#fff"/></svg>`;

function nav() {
  return `<header class="nav">
  <a class="brand" href="/" aria-label="NO/ONES/WATCHING home"><span class="brand__logo">${logo}</span><span class="brand__word">NO<span>/</span>ONES<span>/</span>WATCHING</span></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-btn__label" data-open="Close" data-closed="Menu">Menu</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span></button>
</header>
<div class="menu" id="menu" hidden data-lenis-prevent>
  <div class="menu__inner">
    <p class="menu__eyebrow">Projects / Case Studies</p>
    <ul class="menu__list">
${[...projects.map((p) => ({ name: p.menuName, year: p.menuYear, href: `/projects/${p.slug}` })), menuExtra].map((i, n) => `      <li style="--i:${n}"><a class="menu__row" href="${i.href}"><span class="menu__name">${esc(i.name)}<span class="menu__arrow" aria-hidden="true"><span>→</span></span></span><span class="pill">${esc(i.year)}</span></a></li>`).join('\n')}
    </ul>
    <ul class="socials">${socials.map((s, n) => `<li style="--i:${n}"><a href="${s.href}" target="_blank" rel="noopener">${s.label}</a></li>`).join('')}</ul>
  </div>
</div>`;
}

const dockFeed = (active) => `<nav class="dock" aria-label="Sections"><div class="dock__inner dock__inner--tabs">
  <a href="/"${active === 'feed' ? ' class="is-active" aria-current="page"' : ''}>Feed</a><a href="/Projects"${active === 'projects' ? ' class="is-active" aria-current="page"' : ''}>Projects</a>
</div></nav>`;

const dockProject = (prev, next) => `<nav class="dock" aria-label="Projects"><div class="dock__inner dock__inner--project">
  <a class="dock__arrow dock__arrow--prev" href="/projects/${prev.slug}" aria-label="Previous project: ${esc(prev.title)}">←</a><a class="is-active" href="/Projects">All Projects</a><a class="dock__arrow dock__arrow--next" href="/projects/${next.slug}" aria-label="Next project: ${esc(next.title)}">→</a>
</div></nav>`;

function intro(i) {
  return `<section class="intro"><div class="intro__text" data-appear="20">
  ${i.lines.map((l) => `<p>${esc(l)}</p>`).join('\n  ')}
  <p class="intro__sw">Selected Work <span>${esc(i.range)}</span></p>
</div></section>`;
}

let CSS = '', JS = '';
if (PREVIEW) { CSS = readFileSync('static/styles.css', 'utf8'); JS = readFileSync('static/main.js', 'utf8'); }

function page({ title = site.title, path, body, desc = site.description }) {
  const fontRule = PREVIEW
    ? `<style>@font-face{font-family:"NM";font-weight:400;src:url(${CDN}/assets/Vgooyn5UgzxUXCAvebdulHCfXA.woff2) format("woff2");font-display:swap}@font-face{font-family:"NM";font-weight:500;src:url(${CDN}/assets/gFY5sT08OJzaVKejDc8tZ3kRgFo.woff2) format("woff2");font-display:swap}</style>`
    : '';
  ['/assets/fonts/Vgooyn5UgzxUXCAvebdulHCfXA.woff2', '/assets/fonts/gFY5sT08OJzaVKejDc8tZ3kRgFo.woff2', site.ogImage, site.favicon].forEach((p) => used.add(p));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className+=" js";addEventListener("pagereveal",(e)=>{if(e.viewTransition)e.viewTransition.ready.catch(()=>{})})</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.url}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.url}${path}">
<meta property="og:image" content="${site.url}${site.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${site.url}${site.ogImage}">
<link rel="icon" href="${PREVIEW ? CDN + '/images/AGzsB6H28fPQW2ZNTdGj0kZCqZs.png' : site.favicon}">
${PREVIEW ? `<style>${CSS}</style>` + fontRule : `<link rel="preload" href="/assets/fonts/Vgooyn5UgzxUXCAvebdulHCfXA.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/gFY5sT08OJzaVKejDc8tZ3kRgFo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">`}
${!PREVIEW && site.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');</script>` : ''}
</head>
<body>
${nav()}
${body}
${PREVIEW ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js"></script><script src="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js"></script><script>${JS}</script>` : `<script src="/vendor/lenis.min.js" defer></script>
<script src="/main.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js" async></script>`}
</body>
</html>
`;
}

// ---- pages ---------------------------------------------------------------
const out = {};

out['index.html'] = page({
  path: '/',
  body: `<main class="feed">
${intro(feed.intro)}
<div class="grid">
<div class="row row--full row--slideshow"><div class="tile slideshow" style="aspect-ratio:1409/794">${feed.slideshow.map((m, i) => media(m, i ? '' : '')).join('')}</div></div>
${rows(feed.rows)}
</div>
</main>
${dockFeed('feed')}`,
});

out['Projects.html'] = page({
  path: '/Projects',
  body: `<main class="projects">
${intro(projectsIntro)}
<div class="cards">
${projects.map((p) => `<a class="card" data-appear="20" href="/projects/${p.slug}">
  <div class="card__info"><div><p class="card__name">${esc(p.card.name)}</p><p class="card__sub">${esc(p.card.sub)}</p></div><span class="pill">${esc(p.card.year)}</span></div>
  <div class="card__img">${media(p.card.cover)}</div>
</a>`).join('\n')}
</div>
</main>
${dockFeed('projects')}`,
});

projects.forEach((p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  out[`projects/${p.slug}.html`] = page({
    path: `/projects/${p.slug}`,
    title: site.title,
    body: `<main class="case">
<aside class="case__info"><div class="case__sticky" data-appear="30">
  <div class="case__head"><div><h1 class="case__title">${esc(p.title)}</h1><p class="case__sub">${esc(p.subtitle)}</p></div><span class="pill">${esc(p.year)}</span></div>
  <p class="case__desc">${esc(p.description)}</p>
  <dl class="case__meta">${p.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
</div></aside>
<div class="case__media">
${rows(p.rows)}
</div>
</main>
${dockProject(prev, next)}`,
  });
});

// ---- write ---------------------------------------------------------------
mkdirSync(`${OUT}/projects`, { recursive: true });
for (const [f, html] of Object.entries(out)) writeFileSync(`${OUT}/${f}`, html);
if (!PREVIEW) {
  copyDir('static', OUT);
  // Asset manifest for scripts/fetch-assets.mjs
  writeFileSync('scripts/assets.json', JSON.stringify([...used].sort(), null, 2) + '\n');
}
console.log(`Built ${Object.keys(out).length} pages -> ${OUT}/ (${used.size} assets referenced)`);
