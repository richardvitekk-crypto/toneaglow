/* KNEETECH – nákupní cesta: plovoucí tlačítko, tabulka velikostí v okně, „Chci 2 kusy“ */
(() => {
  if (window.ktLanding) return;
  window.ktLanding = true;

  const smooth = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  /* ---------- Plovoucí tlačítko ----------
     Viditelné, když hlavní tlačítko není na obrazovce (nad i pod ní) a zákazník
     už posunul stránku – první pohled na produkt tak lišta nezakrývá.
     Klik sjede k výběru velikosti a krátce ho zvýrazní. */
  if (!customElements.get('kt-sticky-buy')) {
    customElements.define(
      'kt-sticky-buy',
      class KtStickyBuy extends HTMLElement {
        connectedCallback() {
          this.bar = this.querySelector('.kt-sticky');
          this.button = this.querySelector('[data-kt-sticky-button]');
          this.target = document.querySelector('.product-form__submit');
          if (!this.bar || !this.button || !this.target || !('IntersectionObserver' in window)) return;

          const rect = this.target.getBoundingClientRect();
          this.offscreen = rect.bottom < 0 || rect.top > window.innerHeight;
          this.update();

          this.observer = new IntersectionObserver(([entry]) => {
            this.offscreen = !entry.isIntersecting;
            this.update();
          });
          this.observer.observe(this.target);

          this.onScroll = () => {
            if (this.ticking) return;
            this.ticking = true;
            requestAnimationFrame(() => {
              this.ticking = false;
              this.update();
            });
          };
          window.addEventListener('scroll', this.onScroll, { passive: true });

          this.button.addEventListener('click', () => this.goToPicker());
        }

        update() {
          this.toggle(this.offscreen && window.scrollY > 240);
        }

        toggle(show) {
          this.bar.classList.toggle('is-visible', show);
          this.bar.setAttribute('aria-hidden', show ? 'false' : 'true');
          this.button.tabIndex = show ? 0 : -1;
        }

        goToPicker() {
          const fieldsets = Array.from(document.querySelectorAll('variant-selects fieldset'));
          const size =
            fieldsets.find((f) => /velikost/i.test(f.querySelector('legend')?.textContent || '')) ||
            document.querySelector('variant-selects') ||
            this.target;
          size.scrollIntoView({ behavior: smooth(), block: 'center' });
          size.classList.remove('kt-flash');
          void size.offsetWidth;
          size.classList.add('kt-flash');
          const firstInput = size.querySelector('input:not([disabled])');
          if (firstInput) firstInput.focus({ preventScroll: true });
        }

        disconnectedCallback() {
          if (this.observer) this.observer.disconnect();
          if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
        }
      }
    );
  }

  /* ---------- Tabulka velikostí v okně + „Chci 2 kusy“ u balení ---------- */
  document.addEventListener('click', (event) => {
    const upsell = event.target.closest('[data-kt-upsell]');
    if (upsell) {
      const wrap = upsell.closest('kt-offers');
      const value = upsell.dataset.ktUpsell;
      const offer = wrap && Array.from(wrap.querySelectorAll('.kt-offer')).find((o) => o.dataset.value === value);
      if (offer) {
        offer.click();
        offer.focus({ preventScroll: true });
        offer.scrollIntoView({ behavior: smooth(), block: 'nearest' });
      }
      return;
    }
    const opener = event.target.closest('[data-kt-size-open]');
    if (opener) {
      const dialog = document.getElementById(opener.getAttribute('aria-controls'));
      if (!dialog || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      dialog.showModal();
      return;
    }
    const closer = event.target.closest('[data-kt-size-close]');
    if (closer) {
      closer.closest('dialog')?.close();
      return;
    }
    // klik na ztmavené pozadí zavře okno
    if (event.target.matches && event.target.matches('dialog.kt-size-dialog')) {
      event.target.close();
    }
  });
})();
