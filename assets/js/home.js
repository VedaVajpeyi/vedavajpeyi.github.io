/* ─────────────────────────────────────────────────────
   HOME JS — homepage-specific behavior only
   Runs after page.js. Depends on window.lenis and
   window.initReveal being set by page.js.
   (preloader, hero char stagger, spy dots, work bg hover)
───────────────────────────────────────────────────── */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hero char stagger — wraps each character in an animated span.
   Skipped entirely for reduced-motion; text becomes visible via body.ready CSS. */
if (!prefersReduced) {
  (function() {
    const lines = document.querySelectorAll('.hero-h1 .lw-inner');
    lines.forEach((line, lineIdx) => {
      const lineDelay = lineIdx * 0.13;
      const nodes = Array.from(line.childNodes);
      line.innerHTML = '';
      let charCount = 0;
      nodes.forEach(node => {
        if (node.nodeType === 3) {
          node.textContent.split('').forEach(ch => {
            const sp = document.createElement('span');
            sp.className = 'ch';
            sp.style.transitionDelay = (lineDelay + charCount * 0.022) + 's';
            sp.textContent = ch === ' ' ? '\u00a0' : ch;
            line.appendChild(sp);
            charCount++;
          });
        } else {
          const tag = node.tagName.toLowerCase();
          node.textContent.split('').forEach(ch => {
            const outer = document.createElement(tag);
            outer.className = node.className || '';
            const sp = document.createElement('span');
            sp.className = 'ch';
            sp.style.transitionDelay = (lineDelay + charCount * 0.022) + 's';
            sp.textContent = ch === ' ' ? '\u00a0' : ch;
            outer.appendChild(sp);
            line.appendChild(outer);
            charCount++;
          });
        }
      });
    });
  })();
}

/* Preloader — counts to 100, then dismisses and starts reveals.
   Reduced-motion: skip counter entirely, dismiss immediately. */
(function() {
  const preloader = document.getElementById('preloader');
  const loaderNum = document.getElementById('loader-num');
  if (!preloader || !loaderNum) return;

  function dismiss() {
    preloader.classList.add('done');
    document.body.classList.add('ready');
    if (typeof window.initReveal === 'function') window.initReveal();
  }

  if (prefersReduced) {
    loaderNum.textContent = '100';
    dismiss();
    return;
  }

  let start = null;
  const duration = 700;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateLoader(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    loaderNum.textContent = Math.round(easeOut(progress) * 100);
    if (progress < 1) {
      requestAnimationFrame(animateLoader);
    } else {
      setTimeout(dismiss, 200);
    }
  }
  requestAnimationFrame(animateLoader);
})();

/* Spy dots — section progress indicator on right edge */
(function() {
  const spy = document.getElementById('spy');
  if (!spy) return;
  const dots = Array.from(spy.querySelectorAll('.spy-dot'));
  const sectionIds = dots.map(d => d.dataset.target);

  window.updateSpyPos = function(scrollY) {
    const sv = scrollY !== undefined ? scrollY : window.scrollY;
    const y = sv + window.innerHeight * 0.5;
    spy.classList.toggle('visible', sv > 200);
    let active = sectionIds[0];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && y >= el.offsetTop) active = id;
    });
    dots.forEach(d => d.classList.toggle('active', d.dataset.target === active));
  };
  window.updateSpyPos();

  dots.forEach(d => {
    d.addEventListener('click', () => {
      const el = document.getElementById(d.dataset.target);
      if (el && window.lenis) window.lenis.scrollTo(el, { offset: -62, duration: 1.4 });
    });
  });
})();

/* Per-case-study background color on hover — skipped for reduced-motion */
if (!prefersReduced) {
  (function() {
    const workSection = document.getElementById('work');
    if (!workSection) return;
    const root = document.documentElement;
    const defaultBg = '#0d0b09';
    document.querySelectorAll('.ci[data-ci]').forEach(ci => {
      const idx = ci.dataset.ci;
      ci.addEventListener('mouseenter', () => {
        const color = getComputedStyle(root).getPropertyValue(`--ci-${idx}`).trim();
        workSection.style.transition = 'background-color 0.7s var(--ease-out)';
        workSection.style.backgroundColor = color;
      });
      ci.addEventListener('mouseleave', () => {
        workSection.style.backgroundColor = defaultBg;
      });
    });
  })();
}
