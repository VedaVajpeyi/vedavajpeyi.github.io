/* ─────────────────────────────────────────────────────
   SHARED PAGE JS — used on all pages including home
   (Lenis, mobile nav, scroll reveals, nav theme,
    footer rotator, spy hook, case-study hover tint)
───────────────────────────────────────────────────── */

/* Lenis — exposed globally so home.js can reference it */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = window.lenis = new Lenis({
  lerp: prefersReduced ? 1 : 0.085,
  smoothWheel: !prefersReduced,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.8,
});
if (!prefersReduced) {
  function lenisRaf(t) { lenis.raf(t); requestAnimationFrame(lenisRaf); }
  requestAnimationFrame(lenisRaf);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      lenis.scrollTo(el, { offset: -62, duration: 1.4 });
      document.body.classList.remove('nav-open');
      document.getElementById('nav-burger')?.setAttribute('aria-expanded', 'false');
      /* Move keyboard focus to the target, not just the viewport — matters for
         skip links and any other in-page anchor. No-op on non-focusable targets. */
      el.focus({ preventScroll: true });
    }
  });
});

/* Mobile nav */
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger) {
  const firstMobileLink = mobileMenu ? mobileMenu.querySelector('a') : null;
  burger.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    isOpen ? lenis.stop() : lenis.start();
    if (isOpen) firstMobileLink?.focus();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      lenis.start();
      burger.focus();
    }
  });
}

/* Nav theme (light sections use data-nav-light attribute) */
const nav = document.getElementById('nav');
const lightEls = document.querySelectorAll('[data-nav-light]');

function updateNav(sy) {
  const y = (sy !== undefined ? sy : window.scrollY) + 80;
  let light = false;
  lightEls.forEach(el => {
    if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) light = true;
  });
  if (nav) nav.setAttribute('data-t', light ? 'light' : 'dark');
}
lenis.on('scroll', ({ scroll }) => {
  updateNav(scroll);
  if (typeof window.updateSpyPos === 'function') window.updateSpyPos(scroll);
});
updateNav();

/* Scroll reveals — deferred on pages with a preloader (home.js calls initReveal after preloader) */
window.initReveal = function() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.04, rootMargin: '0px 0px 40px 0px' });
  document.querySelectorAll('.fu, .wu').forEach(el => obs.observe(el));
};

if (!document.getElementById('preloader')) {
  /* Interior pages: run immediately and set page-ready class */
  window.initReveal();
  document.body.classList.add('pg-ready');
}

/* Current-page nav indicator — sets aria-current="page" on the active link */
(function() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    // Exact match, or prefix match for section pages (e.g. /work/ matches /work/case-study-1.html)
    const active =
      href === path ||
      (href !== '/' && path.startsWith(href)) ||
      (href === '/sociology-product/' && path.startsWith('/sociology-product'));
    if (active) a.setAttribute('aria-current', 'page');
  });
})();

/* Case-study hover tint — runs on any page with a #work section (home, /work/) */
(function() {
  const workSection = document.getElementById('work');
  if (!workSection || prefersReduced) return;
  const defaultBg = getComputedStyle(workSection).backgroundColor;
  document.querySelectorAll('.ci[data-ci]').forEach(ci => {
    ci.addEventListener('mouseenter', () => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--ci-${ci.dataset.ci}`).trim();
      if (color) workSection.style.backgroundColor = color;
    });
    ci.addEventListener('mouseleave', () => {
      workSection.style.backgroundColor = defaultBg;
    });
  });
})();

/* Footer rotator */
(function() {
  const labels = ['Product Strategy <em>·</em>', 'Career Coaching <em>·</em>', 'Behavioral Thinking <em>·</em>', 'Writing + Advising <em>·</em>'];
  let idx = 0;
  const cur = document.getElementById('rot-current');
  const nxt = document.getElementById('rot-next');
  if (!cur || !nxt || prefersReduced) return;
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
  function rotateTo(ni) {
    nxt.innerHTML = labels[ni];
    nxt.style.transition = 'none'; nxt.style.transform = 'translateY(100%)'; nxt.style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cur.style.transition = `transform 0.7s ${ease}, opacity 0.4s ease`;
      nxt.style.transition = `transform 0.7s ${ease}, opacity 0.45s ease 0.05s`;
      cur.style.transform = 'translateY(-100%)'; cur.style.opacity = '0';
      nxt.style.transform = 'translateY(0)'; nxt.style.opacity = '1';
      setTimeout(() => {
        cur.innerHTML = labels[ni]; cur.style.transition = 'none';
        cur.style.transform = 'translateY(0)'; cur.style.opacity = '1';
        nxt.style.transition = 'none'; nxt.style.transform = 'translateY(100%)'; nxt.style.opacity = '0';
        idx = ni;
      }, 750);
    }));
  }
  setInterval(() => rotateTo((idx + 1) % labels.length), 4400);
})();
