(() => {
  // Smooth scroll: Lenis, the same library behind Framer's "smooth scroll" setting.
  // Framer ran it with duration = intensity / 10 (intensity 10).
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.Lenis && !reduced) window.lenis = new Lenis({ duration: 1, autoRaf: true });

  const io = 'IntersectionObserver' in window;

  // Menu overlay
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const label = btn && btn.querySelector('.menu-btn__label');
  const setMenu = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? label.dataset.open : label.dataset.closed;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); }
    else { menu.classList.remove('is-open'); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 300); }
  };
  if (btn && menu) {
    btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  // Appear effects: fade + rise once an element enters the viewport (Framer "Appear")
  const ao = io && new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.classList.add('is-in'); ao.unobserve(target); }
  }), { threshold: 0.01 });
  const observeAppear = (el) => (ao ? ao.observe(el) : el.classList.add('is-in'));
  document.querySelectorAll('[data-appear]').forEach(observeAppear);

  // Feed / Projects: one page, two grids. The dock swaps them in place, slides the pill,
  // and keeps the URLs (/ and /Projects) in the address bar and history.
  const home = document.querySelector('main.home');
  const tabs = document.querySelector('.dock__inner--tabs');
  const pill = tabs && tabs.querySelector('.dock__pill');
  if (tabs && pill) {
    const dock = tabs.closest('.dock');
    const placePill = (animate = true) => {
      const a = tabs.querySelector('a.is-active');
      if (!a) return;
      const r = a.getBoundingClientRect(), d = tabs.getBoundingClientRect();
      if (!animate) pill.style.transition = 'none';
      pill.style.width = `${r.width}px`;
      pill.style.transform = `translateX(${r.left - d.left}px)`;
      if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
    };
    placePill(false);
    dock.classList.add('is-ready');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placePill(false));
    addEventListener('resize', () => placePill(false));

    if (home) {
      const views = { feed: home.querySelector('.view--feed'), projects: home.querySelector('.view--projects') };
      const paths = { feed: '/', projects: '/Projects' };
      const fromPath = () => (location.pathname.replace(/\/$/, '').toLowerCase() === '/projects' ? 'projects' : 'feed');
      let busy = false;
      const setView = (view, push) => {
        const cur = home.dataset.view;
        if (view === cur || busy || !views[view]) return;
        busy = true;
        tabs.querySelectorAll('a[data-view]').forEach((a) => {
          const on = a.dataset.view === view;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        placePill();
        if (push) history.pushState({ view }, '', paths[view]);
        const out = views[cur], inc = views[view];
        out.classList.add('is-leaving');
        setTimeout(() => {
          out.classList.remove('is-leaving');
          // the incoming grid rises in again, like a fresh page did on Framer
          inc.querySelectorAll('[data-appear]').forEach((el) => { el.classList.remove('is-in'); observeAppear(el); });
          home.dataset.view = view;
          // if the reader had scrolled into the old grid, start them at the top of the new one
          const top = inc.getBoundingClientRect().top + scrollY - 64;
          if (scrollY > top) { if (window.lenis) window.lenis.scrollTo(top, { immediate: true }); else window.scrollTo(0, top); }
          if (typeof gtag === 'function') gtag('event', 'page_view', { page_path: paths[view], page_title: document.title });
          busy = false;
        }, 150);
      };
      tabs.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-view]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault();
        setView(a.dataset.view, true);
      });
      addEventListener('popstate', () => setView(fromPath(), false));
      history.replaceState({ view: home.dataset.view }, '');
    }
  }

  // Videos: play only while on screen (matches Framer's behaviour)
  const vids = document.querySelectorAll('video[data-autoplay]');
  if (io) {
    const vo = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { const p = target.play(); if (p && p.catch) p.catch(() => {}); } else target.pause();
    }), { threshold: 0.05 });
    vids.forEach((v) => vo.observe(v));
  } else vids.forEach((v) => { v.autoplay = true; v.play(); });

  // Feed slideshow: hard cut every 500ms while visible
  document.querySelectorAll('.slideshow').forEach((el) => {
    const slides = [...el.querySelectorAll('img')];
    if (slides.length < 2) return;
    slides.forEach((s) => { s.loading = 'eager'; });
    let i = 0, timer = null;
    const show = () => { slides.forEach((s, n) => s.classList.toggle('is-active', n === i)); };
    el.classList.add('is-running'); show();
    const start = () => { if (!timer) timer = setInterval(() => { i = (i + 1) % slides.length; show(); }, 500); };
    const stop = () => { clearInterval(timer); timer = null; };
    if (io) new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(el); else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  });

  // Lottie animations
  const lotties = document.querySelectorAll('[data-lottie]');
  if (lotties.length) {
    const init = () => lotties.forEach((el) => window.lottie && window.lottie.loadAnimation({
      container: el, path: el.dataset.lottie, renderer: 'svg', loop: true, autoplay: true,
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    }));
    if (window.lottie) init(); else window.addEventListener('load', init);
  }
})();
