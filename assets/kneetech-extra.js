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

/* E-mail v patičce: výraznější odkaz + „Napsat v Gmailu“ a „Zkopírovat“.
   Funguje pro každý mailto odkaz v patičce, texty podle jazyka stránky. */
(() => {
  const en = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const t = en
    ? { gmail: 'Write in Gmail', copy: 'Copy', copied: 'Copied' }
    : { gmail: 'Napsat v Gmailu', copy: 'Zkopírovat', copied: 'Zkopírováno' };

  const css = `
    .kt-mail{display:inline-block;margin:.2rem 0 .4rem;font-size:clamp(1.4rem,1.1vw + .6rem,1.6rem);font-weight:700;letter-spacing:0;
      color:var(--kt-lime,#d8ff3e)!important;text-decoration:none!important;overflow-wrap:normal;word-break:normal}
    .kt-mail:hover{text-decoration:underline!important;text-underline-offset:.3rem}
    .kt-mail-actions{display:flex;flex-wrap:wrap;gap:.8rem;margin:.6rem 0 1.4rem}
    .kt-mail-btn{display:inline-flex;align-items:center;gap:.6rem;min-height:4rem;padding:0 1.4rem;border-radius:99rem;
      border:1.5px solid var(--kt-lime,#d8ff3e);background:transparent;color:rgb(var(--color-foreground));
      font:inherit;font-size:1.3rem;font-weight:600;line-height:1;text-decoration:none!important;cursor:pointer;
      transition:background-color .2s,color .2s}
    .kt-mail-btn:hover,.kt-mail-btn.is-done{background:var(--kt-lime,#d8ff3e);color:#0a0a0a}
    .kt-mail-btn svg{width:1.6rem;height:1.6rem;flex-shrink:0}
    .kt-mail-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}`;

  const iconMail =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const iconCopy =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  const copyText = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } catch (e) {}
      area.remove();
      resolve();
    });
  };

  const init = () => {
    const links = document.querySelectorAll('.footer a[href^="mailto:"]');
    if (!links.length) return;
    if (!document.getElementById('kt-mail-style')) {
      const style = document.createElement('style');
      style.id = 'kt-mail-style';
      style.textContent = css;
      document.head.appendChild(style);
    }
    links.forEach((link) => {
      if (link.dataset.ktMail) return;
      link.dataset.ktMail = '1';
      const email = decodeURIComponent(link.getAttribute('href').replace(/^mailto:/i, '').split('?')[0]);
      link.classList.add('kt-mail');
      if (link.textContent.trim() === email) {
        link.textContent = '';
        const [user, domain] = email.split('@');
        link.append(user, document.createElement('wbr'), '@' + (domain || ''));
      }

      const actions = document.createElement('span');
      actions.className = 'kt-mail-actions';

      const gmail = document.createElement('a');
      gmail.className = 'kt-mail-btn';
      gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
      gmail.target = '_blank';
      gmail.rel = 'noopener';
      gmail.innerHTML = `${iconMail}<span>${t.gmail}</span>`;

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'kt-mail-btn';
      copy.innerHTML = `${iconCopy}<span>${t.copy}</span>`;
      copy.addEventListener('click', () => {
        copyText(email).then(() => {
          copy.classList.add('is-done');
          copy.querySelector('span').textContent = t.copied;
          window.setTimeout(() => {
            copy.classList.remove('is-done');
            copy.querySelector('span').textContent = t.copy;
          }, 2000);
        });
      });

      actions.append(gmail, copy);
      const next = link.nextSibling;
      if (next && next.nodeName === 'BR') next.remove();
      link.after(actions);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
