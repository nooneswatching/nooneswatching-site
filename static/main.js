(() => {
  // Smooth scroll: Lenis, the same library behind Framer's "smooth scroll" setting.
  // Framer runs it with duration = intensity / 10 (default intensity 10).
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.Lenis && !reduced) window.lenis = new Lenis({ duration: 1, autoRaf: true });

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

  const io = 'IntersectionObserver' in window;

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

  // Appear effects: fade + rise once an element enters the viewport (Framer "Appear")
  const appear = document.querySelectorAll('[data-appear]');
  if (io && appear.length) {
    const ao = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('is-in'); ao.unobserve(target); }
    }), { threshold: 0.01 });
    appear.forEach((el) => ao.observe(el));
  } else appear.forEach((el) => el.classList.add('is-in'));

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
