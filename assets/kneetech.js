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

/* Vyskakovací okno se slevou za e-mail */
if (!customElements.get('kt-popup')) {
  customElements.define(
    'kt-popup',
    class KtPopup extends HTMLElement {
      connectedCallback() {
        this.key = 'kt_popup_' + (this.dataset.section || 'x');
        this.dialog = this.querySelector('.kt-popup__dialog');
        this.form = this.querySelector('form');
        this.querySelectorAll('[data-kt-popup-close]').forEach((el) => el.addEventListener('click', () => this.close(true)));
        this.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') this.close(true);
          if (event.key === 'Tab') this.trapFocus(event);
        });
        const copy = this.querySelector('[data-kt-copy]');
        if (copy) copy.addEventListener('click', () => this.copyCode(copy));

        const params = new URLSearchParams(window.location.search);
        const posted = params.get('customer_posted') === 'true';
        const ownForm = this.form && window.location.hash === '#' + this.form.id;
        const hasError = !!this.querySelector('[data-kt-popup-error]');
        const success = !!this.querySelector('[data-kt-popup-success]');

        if (success && (ownForm || posted)) {
          this.store('subscribed');
          if (ownForm) this.open();
          return;
        }
        if (hasError && ownForm) {
          this.open();
          return;
        }
        if (window.Shopify && window.Shopify.designMode) {
          document.addEventListener('shopify:section:select', (e) => {
            if (e.detail && e.detail.sectionId === this.dataset.section) this.open();
          });
          document.addEventListener('shopify:section:deselect', (e) => {
            if (e.detail && e.detail.sectionId === this.dataset.section) this.close(false);
          });
          return;
        }
        if (!this.shouldShow()) return;
        const delay = Math.max(0, parseInt(this.dataset.delay || '2', 10)) * 1000;
        this.timer = window.setTimeout(() => this.autoOpen(), delay);
      }

      read() {
        try {
          return JSON.parse(window.localStorage.getItem(this.key) || 'null');
        } catch (e) {
          return null;
        }
      }

      store(state) {
        try {
          window.localStorage.setItem(this.key, JSON.stringify({ state, at: Date.now() }));
        } catch (e) {}
      }

      shouldShow() {
        const saved = this.read();
        if (!saved) return true;
        if (saved.state === 'subscribed') return false;
        const days = parseInt(this.dataset.days || '7', 10);
        return Date.now() - saved.at > days * 86400000;
      }

      autoOpen() {
        /* Nerušit zákazníka, který má otevřený košík a jde platit – zkusíme to znovu za 20 s */
        const drawer = document.querySelector('cart-drawer');
        if (drawer && drawer.classList.contains('active')) {
          this.timer = window.setTimeout(() => this.autoOpen(), 20000);
          return;
        }
        this.open();
      }

      open() {
        if (!this.hidden) return;
        this.lastFocus = document.activeElement;
        this.hidden = false;
        document.body.classList.add('kt-popup-open');
        requestAnimationFrame(() => {
          this.classList.add('is-open');
          const input = this.querySelector('input[type="email"]');
          (input || this.dialog).focus({ preventScroll: true });
        });
      }

      close(remember) {
        if (this.timer) window.clearTimeout(this.timer);
        if (this.hidden) return;
        if (remember && !this.querySelector('[data-kt-popup-success]')) this.store('closed');
        this.classList.remove('is-open');
        document.body.classList.remove('kt-popup-open');
        window.setTimeout(() => {
          this.hidden = true;
        }, 250);
        if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true });
      }

      trapFocus(event) {
        const focusable = Array.from(
          this.dialog.querySelectorAll('a[href], button, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      copyCode(button) {
        const code = button.dataset.ktCopy;
        const done = () => {
          button.textContent = button.dataset.copiedLabel || 'Zkopírováno';
          window.setTimeout(() => (button.textContent = button.dataset.copyLabel || 'Zkopírovat'), 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done, done);
        } else {
          done();
        }
      }
    }
  );
}
