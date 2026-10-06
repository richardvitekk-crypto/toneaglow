/* KNEETECH – týmová objednávka: počty podle velikosti a barvy → košík */
if (!customElements.get('kt-team')) {
  customElements.define(
    'kt-team',
    class KtTeam extends HTMLElement {
      connectedCallback() {
        this.min = parseInt(this.dataset.min || '5', 10);
        this.price = parseInt(this.dataset.price || '0', 10);
        this.toggleButton = this.querySelector('.kt-team__toggle');
        this.panel = this.querySelector('.kt-team__panel');
        this.inputs = Array.from(this.querySelectorAll('input[data-kt-variant]'));
        this.countEl = this.querySelector('[data-kt-team-count]');
        this.totalEl = this.querySelector('[data-kt-team-total]');
        this.hintEl = this.querySelector('[data-kt-team-hint]');
        this.addButton = this.querySelector('[data-kt-team-add]');
        this.errorEl = this.querySelector('[data-kt-team-error]');
        if (!this.toggleButton || !this.panel) return;

        this.toggleButton.addEventListener('click', () => this.toggle());
        this.addEventListener('click', (event) => {
          const step = event.target.closest('[data-kt-step]');
          if (!step) return;
          const input = step.parentElement.querySelector('input');
          this.setValue(input, this.read(input) + parseInt(step.dataset.ktStep, 10));
        });
        this.inputs.forEach((input) => {
          input.addEventListener('input', () => this.update());
          input.addEventListener('change', () => this.setValue(input, this.read(input)));
        });
        if (this.addButton) this.addButton.addEventListener('click', () => this.add());
        this.update();
      }

      toggle(force) {
        const open = typeof force === 'boolean' ? force : this.panel.hidden;
        this.panel.hidden = !open;
        this.toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        this.classList.toggle('is-open', open);
        if (open) {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          this.panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        }
      }

      read(input) {
        const n = parseInt(input.value, 10);
        return Number.isFinite(n) ? n : 0;
      }

      setValue(input, value) {
        const clamped = Math.max(0, Math.min(99, value));
        input.value = String(clamped);
        input.closest('td')?.classList.toggle('has-qty', clamped > 0);
        this.update();
      }

      money(kc) {
        return kc.toLocaleString('cs-CZ') + ' Kč';
      }

      update() {
        const count = this.inputs.reduce((sum, input) => sum + Math.max(0, this.read(input)), 0);
        const ready = count >= this.min && this.price > 0;
        if (this.countEl) this.countEl.textContent = String(count);
        if (this.totalEl) {
          this.totalEl.textContent = ready ? `Celkem ${this.money(count * this.price)}` : '';
        }
        if (this.hintEl) {
          const missing = this.min - count;
          if (this.price <= 0) {
            this.hintEl.textContent = 'Týmová cena zatím není nastavená.';
          } else if (missing > 0) {
            this.hintEl.textContent =
              count === 0 ? `Přidej aspoň ${this.min} ks.` : `Přidej ještě ${missing} ks a platí týmová cena.`;
          } else {
            this.hintEl.textContent = `${this.money(this.price)} za kus, týmová cena platí.`;
          }
        }
        if (this.addButton) this.addButton.disabled = !ready;
        if (this.errorEl) this.errorEl.hidden = true;
      }

      async add() {
        const items = this.inputs
          .map((input) => ({ id: parseInt(input.dataset.ktVariant, 10), quantity: this.read(input) }))
          .filter((item) => item.quantity > 0);
        if (!items.length) return;

        this.addButton.disabled = true;
        this.addButton.classList.add('is-loading');
        try {
          const response = await fetch(`${this.dataset.add}.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ items }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.description || data.message || 'Nepodařilo se přidat do košíku.');
          window.location.href = this.dataset.cart || '/cart';
        } catch (error) {
          if (this.errorEl) {
            this.errorEl.textContent = error.message;
            this.errorEl.hidden = false;
          }
          this.addButton.disabled = false;
          this.addButton.classList.remove('is-loading');
        }
      }
    }
  );
}
