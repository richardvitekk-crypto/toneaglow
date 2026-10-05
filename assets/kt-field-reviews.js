/* KNEETECH – Recenze z terénu: karusel (nativní scroll-snap + šipky/tečky)
   a odznak hodnocení pod produktem, který plynule skroluje na sekci. */
(() => {
  if (window.ktFieldReviews) return;
  window.ktFieldReviews = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
  const MAX_DOTS = 12;

  /* ---------- Karusel ---------- */
  function initCarousel(root) {
    if (root.ktReady) return;
    root.ktReady = true;

    const track = root.querySelector('[data-kt-fr-track]');
    const prev = root.querySelector('[data-kt-fr-prev]');
    const next = root.querySelector('[data-kt-fr-next]');
    const dotsWrap = root.querySelector('[data-kt-fr-dots]');
    const bar = root.querySelector('[data-kt-fr-bar]');
    const counter = root.querySelector('[data-kt-fr-counter]');
    const cards = Array.from(track.children);
    if (!cards.length) return;

    let step = 1;
    let perView = 1;
    let pages = 1;
    let ticking = false;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = cards[0].getBoundingClientRect().width + gap;
      perView = Math.max(1, Math.round((track.clientWidth + gap) / step));
      pages = Math.max(1, cards.length - perView + 1);
      buildDots();
      update();
    };

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      const show = pages > 1 && pages <= MAX_DOTS;
      root.classList.toggle('kt-fr--dots', show);
      root.classList.toggle('kt-fr--static', pages <= 1);
      if (!show) return;
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kt-fr__dot';
        b.setAttribute('aria-label', `Přejít na hráče ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      }
    };

    const index = () => Math.min(pages - 1, Math.round(track.scrollLeft / step));

    const goTo = (i) => {
      const target = Math.max(0, Math.min(pages - 1, i));
      track.scrollTo({ left: target * step, behavior: behavior() });
    };

    const update = () => {
      ticking = false;
      const i = index();
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      if (bar) {
        const ratio = max > 0 ? track.scrollLeft / max : 1;
        const size = Math.min(1, perView / cards.length);
        bar.style.width = `${size * 100}%`;
        bar.style.transform = `translateX(${(ratio * (1 - size) * 100) / size}%)`;
      }
      dotsWrap.querySelectorAll('.kt-fr__dot').forEach((d, n) => {
        d.setAttribute('aria-current', n === i ? 'true' : 'false');
      });
      if (counter) {
        const last = Math.min(cards.length, i + perView);
        counter.textContent = perView > 1 ? `${i + 1}–${last} / ${cards.length}` : `${i + 1} / ${cards.length}`;
      }
    };

    track.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    prev.addEventListener('click', () => goTo(index() - perView));
    next.addEventListener('click', () => goTo(index() + perView));

    if ('ResizeObserver' in window) {
      new ResizeObserver(measure).observe(track);
    } else {
      window.addEventListener('resize', measure);
    }
    measure();

    // Theme editor: vybraný blok (hráč) přijede do záběru
    root.addEventListener('shopify:block:select', (e) => {
      const i = cards.indexOf(e.target);
      if (i > -1) goTo(i);
    });
  }

  /* ---------- Odznak pod produktem ---------- */
  function initBadges() {
    const summary = document.querySelector('[data-kt-fr-summary]');
    document.querySelectorAll('[data-kt-fr-badge]').forEach((badge) => {
      const avg = summary ? parseFloat(summary.dataset.avg) : 0;
      const count = summary ? parseInt(summary.dataset.count, 10) : 0;
      const rated = summary ? parseInt(summary.dataset.rated, 10) : 0;
      if (!summary || !rated || !avg) {
        badge.hidden = true;
        return;
      }
      const avgText = avg.toFixed(1).replace('.', ',');
      badge.querySelector('[data-kt-frb-score]').textContent = `${avgText}/5`;
      badge.querySelector('[data-kt-frb-label]').textContent = (badge.dataset.label || '').replace(
        '[pocet]',
        count
      );
      const fill = badge.querySelector('[data-kt-balls-fill]');
      if (fill) fill.style.width = `${(Math.min(avg, 5) / 5) * 100}%`;
      const balls = badge.querySelector('.kt-balls');
      if (balls) balls.setAttribute('aria-label', `Hodnocení ${avgText} z 5 míčů`);
      badge.setAttribute('href', `#${summary.id}`);
      badge.hidden = false;

      if (badge.ktBound) return;
      badge.ktBound = true;
      badge.addEventListener('click', (e) => {
        const target = document.querySelector('[data-kt-fr-summary]');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: behavior(), block: 'start' });
        const heading = target.querySelector('.kt-fr__heading');
        if (heading) heading.focus({ preventScroll: true });
        if (history.replaceState) history.replaceState(null, '', `#${target.id}`);
      });
    });
  }

  function initAll() {
    document.querySelectorAll('[data-kt-fr-carousel]').forEach(initCarousel);
    initBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Theme editor – po úpravě sekce se HTML vymění, je potřeba znovu navázat
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:section:unload', () => setTimeout(initBadges, 0));
})();
