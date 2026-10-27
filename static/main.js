// NO/ONES/WATCHING v3: canvas, filters, view switch, lightbox, index, routing.
// Everything reads the catalogue that build.mjs embeds in #data.
(() => {
  'use strict';
  const DATA = JSON.parse(document.getElementById('data').textContent);
  const { assets, projects, filters, order } = DATA;
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
  const assetBySlug = Object.fromEntries(Object.values(assets).map((a) => [a.slug, a]));
  const filterById = Object.fromEntries(filters.map((f) => [f.id, f]));

  // Open question from the brief: when a filtered set is small, keep tiling it
  // infinitely (true) or show a finite, centred canvas (false).
  const REPEAT_SMALL_SETS = true;
  // How much the canvas zooms in around a tile while it opens into the lightbox.
  const ZOOM = 1.5, ZOOM_PHONE = 1.35;

  const body = document.body;
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 809px)');
  const hoverable = matchMedia('(hover: hover)').matches;
  const isPhone = () => phone.matches;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const mod = (n, m) => ((n % m) + m) % m;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  // ---- state + routing --------------------------------------------------------
  const state = { view: body.dataset.view || 'grid', filter: 'all', open: null };
  const VIEW_PATH = { grid: '/', list: '/list', info: '/info' };

  function parseUrl(pathname = location.pathname, search = location.search) {
    const path = pathname.replace(/\/+$/, '') || '/';
    const q = new URLSearchParams(search);
    const f = q.get('f');
    const out = { view: 'grid', filter: filterById[f] ? f : 'all', open: null };
    if (path === '/list' || path === '/index') out.view = 'list'; // Vercel serves index.html for /index, so the view is picked up here
    else if (path === '/info') out.view = 'info';
    else if (path.startsWith('/work/')) {
      const [slug, n] = path.slice(6).split('/');
      const p = projectBySlug[slug];
      if (p) out.open = { id: p.assets[clamp((parseInt(n, 10) || 1) - 1, 0, p.assets.length - 1)], project: p.id };
      else if (assetBySlug[slug]) out.open = { id: assetBySlug[slug].id, project: null };
    }
    return out;
  }
  function urlFor(s) {
    const q = s.filter !== 'all' ? `?f=${s.filter}` : '';
    if (s.open) {
      const a = assets[s.open.id];
      return a.url + q;
    }
    return VIEW_PATH[s.view] + q;
  }
  function push(replace = false) {
    const url = urlFor(state);
    const snap = { view: state.view, filter: state.filter, open: state.open };
    if (replace) history.replaceState(snap, '', url); else history.pushState(snap, '', url);
    if (typeof gtag === 'function' && !replace) gtag('event', 'page_view', { page_path: url, page_title: document.title });
  }

  // ---- Lenis (Index and Info scroll) ------------------------------------------
  const lenis = window.Lenis && !reduced ? new Lenis({ duration: 1, autoRaf: true }) : null;
  const scrollTop = (immediate = true) => { if (lenis) lenis.scrollTo(0, { immediate }); else window.scrollTo(0, 0); };

  // ---- view switch ------------------------------------------------------------
  const seg = document.querySelector('.views .seg');
  const placePill = (segEl, animate = true) => {
    const pill = segEl.querySelector('.seg__pill');
    const a = segEl.querySelector('.seg__item.is-active');
    if (!pill || !a) return;
    const r = a.getBoundingClientRect(), d = segEl.getBoundingClientRect();
    if (!animate) pill.style.transition = 'none';
    pill.style.width = `${r.width}px`;
    pill.style.transform = `translateX(${r.left - d.left}px)`;
    if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
  };
  const readySeg = (segEl) => {
    placePill(segEl, false);
    segEl.classList.add('is-ready');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placePill(segEl, false));
    // the active label grows and the inactive one shrinks over 300ms: keep the pill glued
    // to the segments while they resize (width follows instantly, transform eases)
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => placePill(segEl));
      segEl.querySelectorAll('.seg__item').forEach((i) => ro.observe(i));
    }
  };

  // ---- view crossfade ----------------------------------------------------------
  const sections = { grid: $('grid'), list: $('list'), info: $('info') };
  let viewToken = 0;

  function setView(view, { push: doPush = true, scroll = true, animate = true } = {}) {
    const prev = state.view;
    const changed = prev !== view;
    state.view = view;
    document.querySelectorAll('[data-view-link]').forEach((el) => {
      const on = el.dataset.viewLink === view;
      if (el.classList.contains('seg__item') || el.classList.contains('sheet__row')) {
        el.classList.toggle('is-active', on);
        if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
        const li = el.closest('li'); if (li) li.setAttribute('aria-selected', String(on));
      }
    });
    if (seg) requestAnimationFrame(() => placePill(seg, changed));
    document.title = view === 'grid' ? 'NO/ONES/WATCHING' : `${view === 'list' ? 'Index' : 'Info'} · NO/ONES/WATCHING`;
    const token = ++viewToken;
    const swap = () => {
      if (token !== viewToken) return;
      Object.values(sections).forEach((s) => s.classList.remove('is-leaving', 'is-entering'));
      body.dataset.view = view;
      sections.list.hidden = view !== 'list';
      sections.info.hidden = view !== 'info';
      if (view === 'grid') { if (lenis) lenis.stop(); canvas.resume(); }
      else { if (lenis) lenis.start(); canvas.pause(); if (scroll && changed) scrollTop(); }
      if (view === 'list') listView.refresh();
      if (changed && animate && !reduced) {
        const inc = sections[view];
        inc.classList.add('is-entering');
        inc.addEventListener('animationend', () => inc.classList.remove('is-entering'), { once: true });
      }
    };
    if (changed && animate && !reduced) {
      // outgoing view fades first, then the incoming one rises in
      sections[prev].classList.add('is-leaving');
      setTimeout(swap, 150);
    } else swap();
    if (doPush) push();
  }

  // ---- sheets (filter + view) -------------------------------------------------
  const dock = $('dock'), dockBtn = $('dock-btn'), filterSheet = $('filter-sheet');
  const views = $('views'), viewsBtn = $('views-btn'), viewSheet = $('view-sheet');
  const scrim = $('scrim');
  let openSheet = null;
  function showSheet(which) {
    closeSheet(true);
    const [wrap, btn, sheet] = which === 'filter' ? [dock, dockBtn, filterSheet] : [views, viewsBtn, viewSheet];
    openSheet = which;
    sheet.hidden = false;
    sheet.classList.remove('is-closing');
    sheet.classList.add('is-open');
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    scrim.classList.remove('is-closing');
    scrim.hidden = false;
    const active = sheet.querySelector('.sheet__row.is-active') || sheet.querySelector('.sheet__row');
    if (active) active.focus({ preventScroll: true });
  }
  function closeSheet(instant = false) {
    if (!openSheet) return;
    const [wrap, btn, sheet] = openSheet === 'filter' ? [dock, dockBtn, filterSheet] : [views, viewsBtn, viewSheet];
    openSheet = null;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    sheet.classList.remove('is-open');
    if (instant || reduced) { sheet.hidden = true; scrim.hidden = true; return; }
    sheet.classList.add('is-closing');
    scrim.classList.add('is-closing');
    setTimeout(() => {
      if (!sheet.classList.contains('is-open')) { sheet.hidden = true; sheet.classList.remove('is-closing'); }
      if (!openSheet) { scrim.hidden = true; scrim.classList.remove('is-closing'); }
    }, 220);
  }
  dockBtn.addEventListener('click', () => (openSheet === 'filter' ? closeSheet() : showSheet('filter')));
  viewsBtn.addEventListener('click', () => (openSheet === 'view' ? closeSheet() : showSheet('view')));
  scrim.addEventListener('click', () => closeSheet());
  document.addEventListener('pointerdown', (e) => {
    if (openSheet && !e.target.closest('.dock, .views')) closeSheet();
  }, true);

  // ---- filters ----------------------------------------------------------------
  function setFilter(id, { push: doPush = true, animate = true } = {}) {
    const f = filterById[id] || filters[0];
    const changed = state.filter !== f.id;
    state.filter = f.id;
    body.dataset.filter = f.id;
    const swapDock = () => {
      $('dock-name').textContent = f.name;
      $('dock-count').textContent = f.sub;
      if (f.thumb) $('dock-thumb').src = f.thumb;
    };
    if (changed && animate && !reduced) {
      const parts = dockBtn.querySelectorAll('.dock__thumb, .dock__text');
      parts.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }));
      setTimeout(() => { swapDock(); parts.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' })); }, 120);
    } else swapDock();
    filterSheet.querySelectorAll('.sheet__row').forEach((row) => {
      const on = row.dataset.filter === f.id;
      row.classList.toggle('is-active', on);
      row.closest('li').setAttribute('aria-selected', String(on));
    });
    canvas.setItems(f.ids, animate && changed);
    listView.apply();
    if (doPush) push();
  }
  filterSheet.addEventListener('click', (e) => {
    const row = e.target.closest('[data-filter]');
    if (!row) return;
    setFilter(row.dataset.filter);
    closeSheet();
  });

  // ---- view links (segmented control, mobile sheet, logo) ----------------------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-view-link]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    closeSheet();
    if (lb.isOpen()) lb.close({ push: false });
    setView(a.dataset.viewLink);
  });

  // ---- canvas ------------------------------------------------------------------
  class Canvas {
    constructor(root, layer) {
      this.root = root; this.layer = layer;
      this.tiles = new Map();
      this.ids = [];
      this.tx = 0; this.ty = 0; this.vx = 0; this.vy = 0;
      this.paused = false; this.raf = 0; this.dirty = true;
      this.enterUntil = 0; this.gen = 0;
      this.metrics();
      this.bind();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    }
    metrics() {
      const cs = getComputedStyle(document.documentElement);
      this.w = parseFloat(cs.getPropertyValue('--tw')); this.h = parseFloat(cs.getPropertyValue('--th')); this.g = parseFloat(cs.getPropertyValue('--tg'));
      this.cw = this.w + this.g; this.rh = this.h + this.g;
      this.vw = this.root.clientWidth; this.vh = this.root.clientHeight;
    }
    // Block of C columns x R rows that repeats in both directions. C is even so the
    // half-row stagger lines up across repeats.
    plan() {
      const n = this.ids.length;
      if (!n) { this.C = 2; this.R = 1; return; }
      let C = Math.ceil(Math.sqrt(n * this.rh / this.cw));
      if (C % 2) C++;
      C = Math.max(2, C);
      this.C = C; this.R = Math.max(1, Math.ceil(n / C));
      this.finite = !REPEAT_SMALL_SETS && n < 24;
    }
    indexAt(col, row) {
      const n = this.ids.length;
      if (!n) return -1;
      const bx = Math.floor(col / this.C), by = Math.floor(row / this.R);
      const c = mod(col, this.C), r = mod(row, this.R);
      const cell = r * this.C + c;
      if (this.finite) return (bx || by || cell >= n) ? -1 : cell;
      return mod(cell + bx * 3 + by * 5, n);
    }
    posOf(col, row) { return { x: col * this.cw, y: row * this.rh + (mod(col, 2) ? this.rh / 2 : 0) }; }
    center() {
      // tile (0,0) sits in the middle of the viewport
      this.tx = (this.vw - this.w) / 2; this.ty = (this.vh - this.h) / 2; this.vx = this.vy = 0;
      this.dirty = true;
    }
    setItems(ids, animate) {
      const gen = ++this.gen;
      const apply = () => {
        if (gen !== this.gen) return;
        this.ids = ids; this.plan();
        for (const [k, el] of this.tiles) { this.stopVideo(el); el.remove(); }
        this.tiles.clear();
        this.center();
        this.enterUntil = performance.now() + 700;
        this.render(true);
      };
      if (animate && !reduced && this.tiles.size) {
        for (const el of this.tiles.values()) el.classList.add('is-out');
        setTimeout(apply, 230);
      } else apply();
    }
    bind() {
      const root = this.root;
      let down = null;
      root.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), moved: false, id: e.pointerId, samples: [], tile: e.target.closest('.tile') };
        this.vx = this.vy = 0;
        root.setPointerCapture(e.pointerId);
      });
      root.addEventListener('pointermove', (e) => {
        if (!down || e.pointerId !== down.id) return;
        const dx = e.clientX - down.lx, dy = e.clientY - down.ly;
        if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) { down.moved = true; root.classList.add('is-dragging'); this.clearHover(); }
        if (!down.moved) return;
        down.lx = e.clientX; down.ly = e.clientY;
        this.tx += dx; this.ty += dy; this.dirty = true;
        const now = performance.now();
        down.samples.push({ dx, dy, t: now });
        down.samples = down.samples.filter((s) => now - s.t < 100);
      });
      const up = (e) => {
        if (!down || e.pointerId !== down.id) return;
        root.classList.remove('is-dragging');
        const d = down; down = null;
        if (d.moved) {
          const now = performance.now();
          const recent = d.samples.filter((s) => now - s.t < 100);
          if (recent.length) {
            const dt = Math.max(16, now - recent[0].t);
            this.vx = recent.reduce((a, s) => a + s.dx, 0) / dt * 16;
            this.vy = recent.reduce((a, s) => a + s.dy, 0) / dt * 16;
          }
        } else if (d.tile && d.tile.isConnected) {
          // pointer capture makes the click event land on the canvas, so open from here
          lb.open(d.tile.dataset.id, { tile: d.tile });
        }
      };
      root.addEventListener('pointerup', up);
      root.addEventListener('pointercancel', up);
      root.addEventListener('click', (e) => {
        const tile = e.target.closest('.tile');
        if (!tile) return;
        e.preventDefault();
        if (e.detail === 0) lb.open(tile.dataset.id, { tile }); // keyboard (Enter) on a focused tile
      });
      root.addEventListener('dragstart', (e) => e.preventDefault());
      root.addEventListener('wheel', (e) => {
        e.preventDefault();
        const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.vh : 1;
        this.tx -= e.deltaX * k; this.ty -= e.deltaY * k; this.vx = this.vy = 0; this.dirty = true;
      }, { passive: false });
      root.addEventListener('keydown', (e) => {
        const step = 160;
        if (e.key === 'ArrowLeft') this.tx += step; else if (e.key === 'ArrowRight') this.tx -= step;
        else if (e.key === 'ArrowUp') this.ty += step; else if (e.key === 'ArrowDown') this.ty -= step; else return;
        if (e.target !== root) return; // let focused tiles keep their keys
        e.preventDefault(); this.dirty = true;
      });
      if (hoverable) {
        root.addEventListener('pointerover', (e) => {
          if (down) return;
          const tile = e.target.closest('.tile');
          if (tile && tile !== this.hover) this.setHover(tile);
        });
        root.addEventListener('pointerout', (e) => {
          const tile = e.target.closest('.tile');
          if (tile && tile === this.hover && !tile.contains(e.relatedTarget)) this.clearHover();
        });
      }
      root.addEventListener('focusin', (e) => { const t = e.target.closest('.tile'); if (t) this.setHover(t); });
      root.addEventListener('focusout', (e) => { const t = e.target.closest('.tile'); if (t && t === this.hover) this.clearHover(); });
      addEventListener('resize', () => {
        const wasPhone = this.w === 168;
        this.metrics();
        if (wasPhone !== isPhone()) { this.setItems(this.ids, false); return; }
        this.dirty = true;
      });
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.pauseVideos(); else this.dirty = true; });
    }
    setHover(tile) {
      this.clearHover();
      this.hover = tile; tile.classList.add('is-hover'); this.root.classList.add('has-hover');
      if (!tile.querySelector('.tile__label')) {
        const a = assets[tile.dataset.id];
        const p = a.inProject ? projectById[a.projectId] : null;
        const label = document.createElement('span');
        label.className = 'tile__label';
        const isCover = state.filter === 'projects';
        label.innerHTML = `<span>${esc(isCover && p ? p.title : a.title)}</span>${p ? `<span class="tile__chip">Project · ${p.assets.length}</span>` : ''}`;
        tile.appendChild(label);
      }
    }
    clearHover() {
      if (!this.hover) return;
      this.hover.classList.remove('is-hover'); this.hover = null; this.root.classList.remove('has-hover');
    }
    makeTile(id, col, row) {
      const a = assets[id];
      const el = document.createElement('a');
      el.className = 'tile';
      el.href = a.url;
      el.dataset.id = id;
      el.setAttribute('aria-label', a.inProject ? `${a.title}, ${projectById[a.projectId].title}` : a.title);
      if (a.media.bg) el.style.background = a.media.bg;
      if (a.media.fit === 'contain') el.dataset.fit = 'contain';
      const m = a.media;
      if (m.type === 'placeholder') {
        el.innerHTML = `<span class="tile__ph">${esc(m.label || a.title)}</span>`;
      } else if (m.type === 'video') {
        el.innerHTML = `<img src="${m.thumb}" alt="" loading="lazy" decoding="async">`;
        el.dataset.video = m.src;
      } else {
        el.innerHTML = `<img src="${m.thumb}" alt="${esc(a.title)}" loading="lazy" decoding="async">`;
      }
      const { x, y } = this.posOf(col, row);
      el.style.transform = '';
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      return el;
    }
    // Videos only exist in the DOM while their tile is on screen.
    startVideo(el) {
      if (!el.dataset.video || el.querySelector('video')) return;
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('muted', '');
      v.src = el.dataset.video; v.poster = el.querySelector('img')?.src || '';
      el.appendChild(v);
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    }
    stopVideo(el) { const v = el.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); } }
    pauseVideos() { for (const el of this.tiles.values()) { const v = el.querySelector('video'); if (v) v.pause(); } }
    render(entering = false) {
      if (!this.ids.length) { this.layer.style.transform = `translate3d(${this.tx}px,${this.ty}px,0)`; return; }
      const margin = this.cw;
      const c0 = Math.floor((-this.tx - margin) / this.cw), c1 = Math.ceil((-this.tx + this.vw + margin) / this.cw);
      const r0 = Math.floor((-this.ty - margin - this.rh) / this.rh), r1 = Math.ceil((-this.ty + this.vh + margin) / this.rh);
      const keep = new Set();
      const now = performance.now();
      const enter = entering || now < this.enterUntil;
      const cx = this.vw / 2 - this.tx, cy = this.vh / 2 - this.ty;
      const maxD = Math.hypot(this.vw, this.vh) / 2;
      const frag = document.createDocumentFragment();
      for (let col = c0; col <= c1; col++) for (let row = r0; row <= r1; row++) {
        const i = this.indexAt(col, row);
        if (i < 0) continue;
        const key = `${col},${row}`;
        keep.add(key);
        if (this.tiles.has(key)) continue;
        const el = this.makeTile(this.ids[i], col, row);
        el.dataset.key = key;
        if (enter && !reduced) {
          const { x, y } = this.posOf(col, row);
          const d = Math.hypot(x + this.w / 2 - cx, y + this.h / 2 - cy);
          el.style.setProperty('--d', `${(clamp(d / maxD, 0, 1.2) * 0.25).toFixed(3)}s`);
          el.classList.add('is-in');
          el.addEventListener('animationend', () => { el.classList.remove('is-in'); el.style.removeProperty('--d'); }, { once: true });
        }
        this.tiles.set(key, el);
        frag.appendChild(el);
      }
      if (frag.childNodes.length) this.layer.appendChild(frag);
      for (const [key, el] of this.tiles) if (!keep.has(key)) { if (el === this.hover) this.clearHover(); this.stopVideo(el); el.remove(); this.tiles.delete(key); }
      this.layer.style.transform = `translate3d(${this.tx}px,${this.ty}px,0)`;
      // play videos that are actually in view
      for (const el of this.tiles.values()) {
        if (!el.dataset.video) continue;
        const x = parseFloat(el.style.left) + this.tx, y = parseFloat(el.style.top) + this.ty;
        const inView = x + this.w > 0 && x < this.vw && y + this.h > 0 && y < this.vh;
        if (inView && !this.paused && !document.hidden) this.startVideo(el); else { const v = el.querySelector('video'); if (v) v.pause(); if (!inView) this.stopVideo(el); }
      }
    }
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      if (this.paused) return;
      if (Math.abs(this.vx) > .05 || Math.abs(this.vy) > .05) {
        this.tx += this.vx; this.ty += this.vy;
        this.vx *= .94; this.vy *= .94;
        this.dirty = true;
      } else { this.vx = this.vy = 0; }
      if (this.finite) {
        // keep a finite canvas on screen
        const W = this.C * this.cw - this.g, H = this.R * this.rh + this.rh / 2 - this.g;
        this.tx = clamp(this.tx, Math.min(this.vw - W - 24, (this.vw - W) / 2), Math.max(24, (this.vw - W) / 2));
        this.ty = clamp(this.ty, Math.min(this.vh - H - 24, (this.vh - H) / 2), Math.max(24, (this.vh - H) / 2));
      }
      if (this.dirty) { this.dirty = false; this.render(); }
    }
    pause() { this.paused = true; this.pauseVideos(); }
    resume() { if (!this.paused) return; this.paused = false; this.metrics(); this.dirty = true; }
    // The canvas zooms in around the tile that opens (like the reference moodboard app):
    // neighbours fly outward, faster the farther they are, and settle back on close.
    push(source) {
      if (reduced || !source) return;
      const r = source.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      this.zoom = { ox, oy, s: isPhone() ? ZOOM_PHONE : ZOOM };
      this.root.style.transformOrigin = `${ox}px ${oy}px`;
      this.root.style.transition = 'transform .5s cubic-bezier(.22, 1, .36, 1)';
      this.root.style.transform = `scale(${this.zoom.s})`;
    }
    release() {
      if (!this.zoom) return;
      this.zoom = null;
      this.root.style.transition = 'transform .45s cubic-bezier(.22, 1, .36, 1)';
      this.root.style.transform = '';
      setTimeout(() => { if (!this.zoom) { this.root.style.transition = ''; this.root.style.transformOrigin = ''; } }, 500);
    }
    // a tile's rect as it will be once the zoom is released (FLIP target on close)
    restRect(el) {
      const r = el.getBoundingClientRect();
      if (!this.zoom) return r;
      const { ox, oy, s } = this.zoom;
      return { left: ox + (r.left - ox) / s, top: oy + (r.top - oy) / s, width: r.width / s, height: r.height / s };
    }
    tileFor(id) {
      // the on-screen tile closest to the centre for this asset (for FLIP)
      let best = null, bd = Infinity;
      for (const el of this.tiles.values()) {
        if (el.dataset.id !== id) continue;
        const r = el.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - this.vw / 2, r.top + r.height / 2 - this.vh / 2);
        if (d < bd) { bd = d; best = el; }
      }
      return best;
    }
  }
  const canvas = new Canvas($('canvas'), $('layer'));

  // ---- index (list) view --------------------------------------------------------
  const listView = (() => {
    const table = $('table');
    const rows = [...table.querySelectorAll('.row')];
    const sortSeg = document.querySelector('.seg--sort');
    const preview = $('preview'), previewImg = preview.querySelector('img');
    let sort = 'newest';
    rows.forEach((r) => { r.querySelector('.row__client').dataset.disc = r.querySelector('.row__disc').textContent; });
    const visible = () => {
      const f = state.filter;
      return rows.filter((r) => {
        if (f === 'all') return true;
        if (f === 'projects') return r.dataset.kind === 'project';
        return r.dataset.disc.split(',').includes(f);
      });
    };
    const cmp = {
      newest: (a, b) => b.dataset.year - a.dataset.year || (a.dataset.kind === 'project' ? -1 : 1) - (b.dataset.kind === 'project' ? -1 : 1) || a.dataset.title.localeCompare(b.dataset.title),
      az: (a, b) => a.dataset.title.localeCompare(b.dataset.title),
      discipline: (a, b) => a.dataset.disc.localeCompare(b.dataset.disc) || b.dataset.year - a.dataset.year,
    };
    let applyToken = 0;
    const apply = (animate = true) => {
      const vis = visible();
      const set = new Set(vis);
      const reorder = () => {
        rows.forEach((r) => r.classList.toggle('is-hidden', !set.has(r)));
        vis.sort(cmp[sort]).forEach((r) => table.appendChild(r));
      };
      const token = ++applyToken;
      if (animate && !reduced && !sections.list.hidden) {
        // quick fade out, reorder, then the rows that are on screen fade back in top to bottom
        table.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).onfinish = () => {
          if (token !== applyToken) return;
          reorder();
          table.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, fill: 'forwards' });
          const vh = innerHeight;
          vis.forEach((r, i) => {
            if (r.getBoundingClientRect().top > vh) return;
            r.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: Math.min(i, 14) * 18, easing: 'ease-out', fill: 'backwards' });
          });
        };
      } else reorder();
      const f = filterById[state.filter];
      const nProjects = vis.filter((r) => r.dataset.kind === 'project').length;
      $('list-sub').textContent = state.filter === 'projects' ? f.sub : `${f.count} ${f.count === 1 ? 'piece' : 'pieces'} · ${nProjects} ${nProjects === 1 ? 'project' : 'projects'}`;
    };
    sortSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sort]');
      if (!b || b.dataset.sort === sort) return;
      sort = b.dataset.sort;
      sortSeg.querySelectorAll('[data-sort]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-checked', String(on)); });
      placePill(sortSeg);
      apply();
    });
    table.addEventListener('click', (e) => {
      const row = e.target.closest('.row');
      if (!row || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      preview.classList.remove('is-on');
      if (row.dataset.kind === 'project') { const p = projectById[row.dataset.id]; lb.open(p.cover, { project: p.id }); }
      else lb.open(row.dataset.id, { project: null });
    });
    if (hoverable) {
      let raf = 0, px = 0, py = 0;
      const move = () => { raf = 0; preview.style.setProperty('--pt', `translate(${px + 24}px, ${py - 90}px)`); };
      table.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(move); });
      table.addEventListener('pointerover', (e) => {
        const row = e.target.closest('.row');
        if (!row || !row.dataset.thumb) { preview.classList.remove('is-on'); return; }
        if (previewImg.src !== location.origin + row.dataset.thumb) previewImg.src = row.dataset.thumb;
        preview.classList.add('is-on');
      });
      table.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
    }
    let ready = false;
    return { apply, refresh() { apply(); if (!ready) { ready = true; readySeg(sortSeg); } else placePill(sortSeg, false); } };
  })();

  $('back-to-top').addEventListener('click', (e) => { e.preventDefault(); scrollTop(false); });

  // ---- lightbox ----------------------------------------------------------------
  const lb = (() => {
    const el = $('lb'), stage = $('lb-stage'), assetEl = $('lb-asset'), ui = $('lb-ui');
    const card = $('lb-card'), cardHead = $('lb-cardhead'), cardBody = $('lb-cardbody'), toggle = $('lb-toggle');
    const titleEl = $('lb-title'), subEl = $('lb-sub'), descEl = $('lb-desc'), metaEl = $('lb-meta');
    const strip = $('lb-strip'), thumbs = $('lb-thumbs'), countEl = $('lb-count');
    const dim = $('lb-dim');
    let cur = null;      // { id, project, navIds, pos, cardOpen }
    let media = null;    // current .lb__media element
    let idleTimer = 0, lastFocus = null, overUi = false, pointerSeen = false;

    const isOpen = () => !el.hidden;
    const navList = () => filterById[state.filter].ids;

    function sizeMedia() {
      if (!media || !cur) return;
      const a = assets[cur.id], m = a.media;
      const r = m.width / m.height;
      const sw = stage.clientWidth, sh = stage.clientHeight;
      let w = sw, h = w / r;
      if (h > sh) { h = sh; w = h * r; }
      if (isPhone() && m.type !== 'placeholder') { /* keep side margins; height follows */ }
      media.style.width = `${Math.round(w)}px`; media.style.height = `${Math.round(h)}px`;
    }

    function buildMedia(a) {
      const m = a.media;
      const box = document.createElement('div');
      box.className = 'lb__media';
      if (m.bg) box.style.background = m.bg;
      if (m.fit === 'contain') box.dataset.fit = 'contain';
      if (m.type === 'placeholder') box.innerHTML = `<span class="tile__ph">${esc(m.label || a.title)}</span>`;
      else if (m.type === 'video') box.innerHTML = `<video src="${m.src}" poster="${m.poster}" muted loop playsinline autoplay preload="auto"></video>`;
      else box.innerHTML = `<img src="${m.src}" alt="${esc(a.title)}" decoding="async">`;
      return box;
    }

    function render({ fromTile = null } = {}) {
      const a = assets[cur.id];
      const p = cur.project ? projectById[cur.project] : null;
      el.classList.toggle('is-single', !p);
      el.classList.toggle('has-strip', !!p);
      const newTitle = p ? p.title : a.title;
      if (titleEl.textContent && titleEl.textContent !== newTitle && !reduced) cardHead.querySelector('.lb__cardtext').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      // card
      if (p) {
        titleEl.textContent = p.title;
        subEl.textContent = `${p.client} · ${p.year}`;
        descEl.textContent = p.description;
        metaEl.innerHTML = [['Role', p.role], ['Agency', p.agency], ['Discipline', p.disciplines.map(cap).join(', ')]].filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
        setCard(cur.cardOpen, false);
      } else {
        titleEl.textContent = a.title;
        const link = a.projectId ? projectById[a.projectId] : null;
        subEl.innerHTML = `${esc(a.caption || a.client)}${link ? ` · <a href="${link.url}" data-open-project="${link.id}">From ${esc(link.title)} ↗</a>` : ''}`;
        setCard(false, false);
      }
      // filmstrip + count
      if (p) {
        thumbs.innerHTML = p.assets.map((id, i) => {
          const x = assets[id];
          return `<button type="button" class="lb__thumb${id === cur.id ? ' is-active' : ''}" data-id="${id}" role="listitem" aria-label="${esc(x.title)} ${i + 1} of ${p.assets.length}"${id === cur.id ? ' aria-current="true"' : ''}>${x.media.thumb ? `<img src="${x.media.thumb}" alt="">` : ''}</button>`;
        }).join('');
        strip.hidden = false;
        countEl.textContent = `${p.assets.indexOf(cur.id) + 1} / ${p.assets.length}`;
        const active = thumbs.querySelector('.is-active');
        if (active) requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' }));
      } else { strip.hidden = true; thumbs.innerHTML = ''; countEl.textContent = ''; }
      // media
      const old = media;
      media = buildMedia(a);
      assetEl.appendChild(media);
      sizeMedia();
      if (old) {
        if (!reduced) { old.style.transition = 'opacity .2s ease'; old.style.opacity = '0'; setTimeout(() => old.remove(), 200); } else old.remove();
      }
      if (fromTile && !reduced) { flipIn(fromTile); canvas.push(fromTile); }
      else if (!reduced && old) { media.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease' }); }
      document.title = `${p ? p.title : a.title} · NO/ONES/WATCHING`;
    }

    function flipIn(tile) {
      const from = tile.getBoundingClientRect(), to = media.getBoundingClientRect();
      const sx = from.width / to.width, sy = from.height / to.height;
      media.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`, borderRadius: `${parseFloat(getComputedStyle(tile).borderRadius) / sx}px` },
        { transform: 'none', borderRadius: '' },
      ], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      ui.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120, easing: 'ease', fill: 'backwards' });
      // the dim ramps in with the zoom so the neighbours are seen flying outward
      el.querySelector('.lb__bg').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-in' });
    }

    function setCard(open, animate = true) {
      const wasOpen = !cardBody.hidden;
      cur.cardOpen = open;
      const h0 = card.offsetHeight;
      cardBody.hidden = !open;
      card.classList.toggle('is-open', open);
      el.classList.toggle('is-card-open', open);
      cardHead.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Hide project info' : 'Show project info');
      if (open) wake();
      if (animate && !reduced && wasOpen !== open) {
        // grow or shrink from the anchored edge (top-left on desktop, bottom on phones)
        const h1 = card.offsetHeight;
        if (h0 !== h1) card.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
        if (open) cardBody.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 100, easing: 'ease-out', fill: 'backwards' });
      }
    }

    function open(id, { tile = null, project, push: doPush = true } = {}) {
      const a = assets[id];
      const list = navList();
      let pos = list.indexOf(id);
      const projId = project !== undefined ? project : (a.inProject ? a.projectId : null);
      if (pos < 0 && projId) { pos = list.findIndex((x) => assets[x].projectId === projId); }
      cur = { id, project: projId, pos: Math.max(0, pos), cardOpen: cur?.cardOpen || false };
      state.open = { id, project: projId };
      const wasOpen = isOpen();
      if (!wasOpen) {
        pointerSeen = false;
        lastFocus = document.activeElement;
        el.hidden = false;
        body.classList.add('lb-open');
        canvas.pause();
        if (lenis) lenis.stop();
        if (!reduced && !tile) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease' });
      }
      render({ fromTile: tile });
      if (!wasOpen) $('lb-close').focus({ preventScroll: true });
      wake();
      if (doPush) push(!wasOpen && !tile && !state.open ? true : false);
    }

    function close({ push: doPush = true } = {}) {
      if (!isOpen()) return;
      const id = cur.id;
      clearTimeout(idleTimer);
      el.classList.remove('is-idle', 'is-card-open');
      state.open = null;
      body.classList.remove('lb-open');
      const tile = state.view === 'grid' ? canvas.tileFor(id) : null;
      const to = tile ? canvas.restRect(tile) : null;
      canvas.release();
      const finish = () => {
        el.hidden = true;
        if (media) { media.remove(); media = null; }
        if (state.view === 'grid') canvas.resume(); else if (lenis) lenis.start();
        if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true }); else $('canvas').focus({ preventScroll: true });
      };
      if (tile && !reduced && media) {
        const from = media.getBoundingClientRect();
        const sx = to.width / from.width, sy = to.height / from.height;
        ui.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' });
        el.querySelector('.lb__bg').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
        media.animate([{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx}, ${sy})` }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }).onfinish = finish;
        canvas.resume();
      } else if (!reduced) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease' }).onfinish = finish;
      } else finish();
      cur = null;
      document.title = state.view === 'grid' ? 'NO/ONES/WATCHING' : `${state.view === 'list' ? 'Index' : 'Info'} · NO/ONES/WATCHING`;
      if (doPush) push();
    }

    function step(dir) {
      if (!cur) return;
      const list = navList();
      if (!list.length) return;
      const pos = mod(cur.pos + dir, list.length);
      const id = list[pos];
      const a = assets[id];
      cur.pos = pos; cur.id = id; cur.project = a.inProject ? a.projectId : null;
      state.open = { id, project: cur.project };
      render();
      push(true);
      wake();
    }
    function jump(id) {
      if (!cur) return;
      cur.id = id;
      state.open = { id, project: cur.project };
      render();
      push(true);
    }

    // auto-hide
    function wake(e) {
      el.classList.remove('is-idle');
      clearTimeout(idleTimer);
      if (e && e.type === 'pointermove') pointerSeen = true;
      // nothing hides until the pointer has moved at least once (deep links land with it still)
      if (isPhone() || !pointerSeen) return;
      idleTimer = setTimeout(() => { if (isOpen() && !cur?.cardOpen && !overUi) el.classList.add('is-idle'); }, 2000);
    }
    ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach((t) => el.addEventListener(t, wake, { passive: true }));
    ui.addEventListener('pointerover', (e) => { overUi = !!e.target.closest('.lb__ui > :not(.lb__dim)'); if (overUi) el.classList.remove('is-idle'); });
    ui.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !ui.contains(e.relatedTarget)) overUi = false; });

    // controls
    $('lb-close').addEventListener('click', () => close());
    $('lb-prev').addEventListener('click', () => step(-1));
    $('lb-next').addEventListener('click', () => step(1));
    $('lb-mprev').addEventListener('click', () => step(-1));
    $('lb-mnext').addEventListener('click', () => step(1));
    thumbs.addEventListener('click', (e) => { const t = e.target.closest('[data-id]'); if (t) jump(t.dataset.id); });
    cardHead.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (!cur?.project) return;
      setCard(!cur.cardOpen);
    });
    dim.addEventListener('click', () => setCard(false));
    subEl.addEventListener('click', (e) => {
      const a = e.target.closest('[data-open-project]');
      if (!a) return;
      e.preventDefault();
      const p = projectById[a.dataset.openProject];
      open(p.assets[0], { project: p.id });
    });
    // swipe the asset to navigate (controls never hide on phones)
    let sw = null;
    stage.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; });
    stage.addEventListener('pointerup', (e) => {
      if (!sw || e.pointerId !== sw.id) return;
      const dx = e.clientX - sw.x, dy = e.clientY - sw.y, dt = performance.now() - sw.t;
      sw = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600 && e.pointerType === 'touch') { step(dx < 0 ? 1 : -1); return; }
      if (Math.hypot(dx, dy) < 8 && isPhone() && cur?.cardOpen) setCard(false);
    });
    // swipe the tray down to close it
    let ty = null;
    card.addEventListener('pointerdown', (e) => { if (isPhone() && cur?.cardOpen) ty = { y: e.clientY, id: e.pointerId }; });
    card.addEventListener('pointerup', (e) => { if (ty && e.pointerId === ty.id && e.clientY - ty.y > 40) setCard(false); ty = null; });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); if (cur?.cardOpen) setCard(false); else close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'Tab') {
        const f = [...el.querySelectorAll('button:not([hidden]), a[href]')].filter((x) => x.offsetParent !== null && !x.closest('[hidden]'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    addEventListener('resize', () => sizeMedia());

    return { open, close, isOpen, step };
  })();

  // ---- global keys ----------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openSheet) { closeSheet(); return; }
    if (lb.isOpen()) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { /* canvas handles when focused */ }
  });

  // ---- history ----------------------------------------------------------------------
  function applyState(s, { push: doPush = false } = {}) {
    if (s.filter !== state.filter) setFilter(s.filter, { push: false, animate: state.view === 'grid' });
    if (s.view !== state.view) setView(s.view, { push: false });
    if (s.open) lb.open(s.open.id, { project: s.open.project, push: false });
    else if (lb.isOpen()) lb.close({ push: false });
    if (doPush) push();
  }
  addEventListener('popstate', () => applyState(parseUrl()));

  // ---- init -------------------------------------------------------------------------
  if (seg) readySeg(seg);
  const initial = parseUrl();
  state.view = initial.view;
  setFilter(initial.filter, { push: false, animate: false });
  setView(initial.view, { push: false, scroll: false });
  if (initial.open) lb.open(initial.open.id, { project: initial.open.project, push: false });
  push(true);
  phone.addEventListener('change', () => { if (seg) placePill(seg, false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (seg) placePill(seg, false); });
})();
