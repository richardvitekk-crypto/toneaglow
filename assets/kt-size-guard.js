/* KNEETECH – velikost si zákazník vybere sám.
   Shopify vždy předvybere první velikost (S). Dokud zákazník velikost nezvolí (klikem, šipkami
   nebo kalkulačkou), výběr vypadá nevyplněný a „Přidat do košíku“ ho místo přidání pošle
   k výběru velikosti. Odkaz s konkrétní variantou (?variant=…) se bere jako zvolená velikost. */
(() => {
  if (window.ktSizeGuard) return;
  window.ktSizeGuard = true;

  const en = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const t = {
    hint: en ? 'choose yours' : 'vyber svoji',
    need: en
      ? 'Choose your size first – the size chart or the calculator below will help.'
      : 'Nejdřív vyber velikost – pomůže tabulka nebo kalkulačka níž.',
  };
  const smooth = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  let chosen = new URL(window.location.href).searchParams.has('variant');

  const isSize = (fieldset) =>
    !!fieldset &&
    (/^(velikost|size)$/i.test(fieldset.dataset.ktOption || '') ||
      /velikost|size/i.test(fieldset.querySelector('legend')?.textContent || ''));
  const sizeFieldsets = () => Array.from(document.querySelectorAll('variant-selects fieldset')).filter(isSize);

  const mark = () => {
    if (!chosen && document.querySelector('.kt-calc__done')) chosen = true;
    sizeFieldsets().forEach((fieldset) => {
      fieldset.classList.toggle('kt-size-pending', !chosen);
      const legend = fieldset.querySelector('legend');
      if (legend) legend.dataset.ktHint = t.hint;
      if (chosen) fieldset.querySelector('.kt-size-need')?.remove();
    });
  };

  const choose = () => {
    if (chosen) return;
    chosen = true;
    mark();
  };

  document.addEventListener(
    'change',
    (event) => {
      if (event.target.matches?.('input[type="radio"]') && isSize(event.target.closest('fieldset'))) choose();
    },
    true
  );

  /* klik i na už označené S (to žádný „change“ nevyvolá) */
  document.addEventListener(
    'click',
    (event) => {
      const fieldset = event.target.closest?.('fieldset');
      if (isSize(fieldset) && event.target.closest('label, input')) choose();
    },
    true
  );

  document.addEventListener(
    'submit',
    (event) => {
      if (chosen) return;
      const form = event.target;
      if (!form.matches?.('form[action*="/cart/add"]')) return;
      const fieldset = sizeFieldsets().find((f) => {
        const input = f.querySelector('input[type="radio"]');
        return input && input.form === form;
      });
      if (!fieldset) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      let need = fieldset.querySelector('.kt-size-need');
      if (!need) {
        need = document.createElement('p');
        need.className = 'kt-size-need';
        need.setAttribute('role', 'alert');
        fieldset.appendChild(need);
      }
      need.textContent = t.need;

      fieldset.scrollIntoView({ behavior: smooth(), block: 'center' });
      fieldset.classList.remove('kt-flash');
      void fieldset.offsetWidth;
      fieldset.classList.add('kt-flash');
      fieldset.querySelector('input[type="radio"]:not([disabled])')?.focus({ preventScroll: true });
    },
    true
  );

  /* výběr velikostí se po změně balení/barvy překresluje – znovu ho označit */
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      mark();
    }, 0);
  }).observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mark);
  } else {
    mark();
  }
})();
