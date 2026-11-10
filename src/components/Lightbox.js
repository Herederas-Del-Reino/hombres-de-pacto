/** Visor de fotografías a pantalla completa con navegación por teclado. */
import { openModal } from './Modal.js';
import { icon } from './Icons.js';
import { asset, esc } from '../utils/dom.js';

export function bindLightbox(container, items) {
  if (!container) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lightbox]');
    if (!btn) return;
    let i = +btn.dataset.lightbox;
    const el = openModal({
      title: 'Galería',
      size: 'xl',
      className: 'lightbox',
      body: `<figure class="lightbox__fig">
        <img src="" alt="" />
        <figcaption></figcaption>
      </figure>
      <div class="lightbox__nav">
        <button type="button" class="icon-btn" data-prev aria-label="Foto anterior">${icon('ChevronLeft')}</button>
        <span class="lightbox__count" aria-live="polite"></span>
        <button type="button" class="icon-btn" data-next aria-label="Foto siguiente">${icon('ChevronRight')}</button>
      </div>`,
    });
    const img = el.querySelector('img');
    const cap = el.querySelector('figcaption');
    const count = el.querySelector('.lightbox__count');
    const show = () => {
      const it = items[i];
      img.src = asset(`images/${it.img}.webp`);
      img.alt = it.alt;
      cap.innerHTML = esc(it.pie ?? it.alt);
      count.textContent = `${i + 1} / ${items.length}`;
    };
    const go = (d) => { i = (i + d + items.length) % items.length; show(); };
    el.querySelector('[data-prev]').addEventListener('click', () => go(-1));
    el.querySelector('[data-next]').addEventListener('click', () => go(1));
    el.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowLeft') go(-1); if (ev.key === 'ArrowRight') go(1); });
    let x0 = null;
    img.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', (ev) => { if (x0 === null) return; const dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; });
    show();
  });
}
