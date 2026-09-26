/* KNEETECH – drobné interakce nad tématem Dawn */
(() => {
  /* Objevení prvků při scrollu */
  const revealItems = document.querySelectorAll('.kt-reveal');
  if (revealItems.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
      );
      revealItems.forEach((el) => io.observe(el));
    } else {
      revealItems.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* Videa v sekci „Z hřiště“ hrají jen, když jsou vidět */
  const videos = document.querySelectorAll('.kt-video video');
  if (videos.length && 'IntersectionObserver' in window) {
    const vo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const playing = video.play();
            if (playing && playing.catch) playing.catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
    videos.forEach((v) => vo.observe(v));
  }
})();

/* Karty balení (1 kus / 2 kusy) ovládají skrytou volbu „Balení“ */
if (!customElements.get('kt-offers')) {
  customElements.define(
    'kt-offers',
    class KtOffers extends HTMLElement {
      connectedCallback() {
        this.optionHandle = this.dataset.option;
        this.section = this.closest('.shopify-section') || document;
        this.buttons = Array.from(this.querySelectorAll('.kt-offer'));
        if (!this.getFieldset()) return;

        this.section.classList && this.section.classList.add('kt-offers-ready');

        this.buttons.forEach((button) => {
          button.addEventListener('click', () => this.select(button.dataset.value));
          button.addEventListener('keydown', (event) => this.onKeydown(event, button));
        });

        this.onChange = (event) => {
          const fieldset = this.getFieldset();
          if (fieldset && fieldset.contains(event.target)) this.sync();
        };
        document.addEventListener('change', this.onChange);
        this.sync();
      }

      disconnectedCallback() {
        if (this.onChange) document.removeEventListener('change', this.onChange);
      }

      getFieldset() {
        return this.section.querySelector(`[data-kt-option="${this.optionHandle}"]`);
      }

      getInput(value) {
        const fieldset = this.getFieldset();
        if (!fieldset) return null;
        return Array.from(fieldset.querySelectorAll('input[type="radio"]')).find((input) => input.value === value);
      }

      select(value) {
        const input = this.getInput(value);
        if (!input) return;
        if (!input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.setActive(value);
      }

      sync() {
        const fieldset = this.getFieldset();
        const checked = fieldset && fieldset.querySelector('input[type="radio"]:checked');
        if (checked) this.setActive(checked.value);
      }

      setActive(value) {
        this.buttons.forEach((button) => {
          const active = button.dataset.value === value;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-checked', active ? 'true' : 'false');
          button.tabIndex = active ? 0 : -1;
        });
      }

      onKeydown(event, button) {
        const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const index = this.buttons.indexOf(button);
        const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
        const next = this.buttons[(index + step + this.buttons.length) % this.buttons.length];
        next.focus();
        this.select(next.dataset.value);
      }
    }
  );
}

/* Plovoucí lišta „Koupit“ – ukáže se, když hlavní tlačítko zmizí z obrazovky */
if (!customElements.get('kt-sticky-atc')) {
  customElements.define(
    'kt-sticky-atc',
    class KtStickyAtc extends HTMLElement {
      connectedCallback() {
        this.bar = this.querySelector('.kt-sticky');
        this.trigger = this.querySelector('[data-kt-sticky-button]');
        this.target = document.querySelector('.product-form__submit') || document.querySelector('product-info');
        if (!this.bar || !this.target || !('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver(([entry]) => {
          const pastTarget = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          this.bar.classList.toggle('is-visible', pastTarget);
          this.bar.setAttribute('aria-hidden', pastTarget ? 'false' : 'true');
          this.trigger.tabIndex = pastTarget ? 0 : -1;
        });
        this.observer.observe(this.target);

        this.trigger.addEventListener('click', () => {
          const form = document.querySelector('product-info .product__info-wrapper') || this.target;
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
      }
    }
  );
}
