/* KNEETECH – kalkulačka velikosti: obvod kolena v cm → velikost, sama ji vybere */
if (!customElements.get('kt-size-calc')) {
  customElements.define(
    'kt-size-calc',
    class KtSizeCalc extends HTMLElement {
      connectedCallback() {
        this.ranges = (this.dataset.ranges || '')
          .split('|')
          .map((row) => {
            const [size, low, high] = row.split(';');
            return { size: (size || '').trim(), low: parseFloat(low), high: parseFloat(high) };
          })
          .filter((r) => r.size && Number.isFinite(r.low) && Number.isFinite(r.high))
          .sort((a, b) => a.low - b.low);
        this.input = this.querySelector('input');
        this.out = this.querySelector('.kt-calc__out');
        this.defaultText = this.out ? this.out.textContent : '';
        if (!this.input || !this.out || !this.ranges.length) return;

        this.input.addEventListener('input', () => {
          window.clearTimeout(this.timer);
          this.timer = window.setTimeout(() => this.calculate(), 450);
        });
        this.input.addEventListener('change', () => this.calculate());
        this.input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            this.calculate();
          }
        });
      }

      text(key, fallback) {
        return (this.dataset[key] || fallback)
          .split('[contact]').join(this.dataset.contact || '/pages/contact');
      }

      show(state, html) {
        this.dataset.state = state;
        this.out.innerHTML = html;
      }

      calculate() {
        window.clearTimeout(this.timer);
        const raw = this.input.value.trim().replace(',', '.');
        if (!raw) {
          this.dataset.state = '';
          this.out.textContent = this.defaultText;
          return;
        }
        const cm = parseFloat(raw);
        if (!Number.isFinite(cm) || cm < 15 || cm > 80) {
          this.show('error', this.text('tInvalid', 'Zadej obvod v centimetrech, třeba 34'));
          return;
        }

        const first = this.ranges[0];
        const last = this.ranges[this.ranges.length - 1];
        if (cm < first.low) {
          this.show(
            'error',
            this.text('tBelow', 'Pod [low] cm bude i velikost [size] volná. <a href="[contact]">Napiš nám</a>, poradíme.')
              .replace('[low]', first.low)
              .replace('[size]', first.size)
          );
          return;
        }
        if (cm > last.high) {
          this.show(
            'error',
            this.text('tAbove', 'Nad [high] cm bude i velikost [size] těsná. <a href="[contact]">Napiš nám</a>, poradíme.')
              .replace('[high]', last.high)
              .replace('[size]', last.size)
          );
          return;
        }

        const matches = this.ranges.filter((r) => cm >= r.low && cm <= r.high);
        const pick = matches[0];
        if (!pick) {
          this.show('error', this.text('tMissing', 'Tenhle obvod v tabulce nemáme. <a href="[contact]">Napiš nám</a>, poradíme.'));
          return;
        }
        const picked = this.selectSize(pick.size);
        const done = picked ? ` <span class="kt-calc__done">${this.text('tDone', 'vybráno')}</span>` : '';
        if (matches.length > 1) {
          this.show(
            'ok',
            `<strong>${pick.size}</strong>${done}<small>${this.text('tEdge', 'Jsi na hranici [a] a [b]. [a] drží pevněji, [b] je volnější na dlouhé nošení.')
              .split('[a]').join(pick.size)
              .split('[b]').join(matches[1].size)}</small>`
          );
        } else {
          const range = this.text('tRange', 'Obvod [low]–[high] cm').replace('[low]', pick.low).replace('[high]', pick.high);
          this.show('ok', `<strong>${pick.size}</strong>${done}<small>${range}</small>`);
        }
      }

      selectSize(size) {
        const scope = this.closest('.shopify-section') || document;
        const fieldset =
          scope.querySelector('[data-kt-option="velikost"], [data-kt-option="size"]') ||
          Array.from(scope.querySelectorAll('variant-selects fieldset')).find((f) =>
            /velikost|size/i.test(f.querySelector('legend')?.textContent || '')
          );
        if (!fieldset) return false;
        const input = Array.from(fieldset.querySelectorAll('input[type="radio"]')).find((i) => i.value === size);
        if (!input) return false;
        if (!input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
      }
    }
  );
}
