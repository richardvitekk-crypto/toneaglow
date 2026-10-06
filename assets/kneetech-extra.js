/* KNEETECH – doplňky 2026-10: souhrn výběru varianty a „Poslat rodičům“ */
/* Souhrn vybrané varianty u tlačítka „Přidat do košíku“ */
(() => {
  const update = (box) => {
    const section = box.closest('.shopify-section') || document;
    const fieldsets = Array.from(section.querySelectorAll('variant-selects fieldset'));
    if (!fieldsets.length) return;
    const values = fieldsets.map((fieldset) => {
      const checked = fieldset.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : '';
    });
    const valueEl = box.querySelector('[data-kt-selection-value]');
    if (valueEl && values.every(Boolean)) valueEl.textContent = values.join(' · ');

    const sizeEl = box.querySelector('[data-kt-selection-size]');
    const sizeIndex = parseInt(box.dataset.sizeIndex || '-1', 10);
    if (!sizeEl || sizeIndex < 0) return;
    const size = values[sizeIndex];
    const pair = (box.dataset.sizes || '')
      .split('|')
      .map((item) => item.split(':'))
      .find((item) => item[0] === size);
    const template = box.dataset.tSize || 'Velikost [size] sedí na obvod kolena [range]';
    sizeEl.textContent = pair ? template.replace('[size]', size).replace('[range]', pair[1]) : '';
  };

  const boxes = () => document.querySelectorAll('[data-kt-selection]');
  document.addEventListener('change', (event) => {
    if (!event.target.closest || !event.target.closest('variant-selects')) return;
    boxes().forEach(update);
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boxes().forEach(update));
  } else {
    boxes().forEach(update);
  }
})();

/* „Poslat rodičům“ – systémové sdílení, jinak WhatsApp / e-mail / kopie odkazu */
if (!customElements.get('kt-share')) {
  customElements.define(
    'kt-share',
    class KtShare extends HTMLElement {
      connectedCallback() {
        const native = this.querySelector('[data-kt-share-native]');
        const links = this.querySelector('[data-kt-share-links]');
        const copy = this.querySelector('[data-kt-share-copy]');
        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        if (native && navigator.share && isTouch) {
          native.hidden = false;
          if (links) links.hidden = true;
          native.addEventListener('click', () => {
            navigator
              .share({ title: this.dataset.title, text: this.dataset.text, url: this.dataset.url })
              .catch(() => {});
          });
        }

        if (copy) {
          copy.addEventListener('click', () => {
            const done = () => {
              copy.textContent = copy.dataset.copied || 'Odkaz zkopírován';
              window.setTimeout(() => (copy.textContent = copy.dataset.copy || 'Zkopírovat odkaz'), 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(this.dataset.url).then(done, done);
            } else {
              done();
            }
          });
        }
      }
    }
  );
}
