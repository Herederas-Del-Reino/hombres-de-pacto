/** Diálogo accesible (foco atrapado, Esc para cerrar) y avisos breves (toast). */
import { icon } from './Icons.js';
import { esc } from '../utils/dom.js';

let active = null;

export function closeModal() {
  if (!active) return;
  const { el, prevFocus, onClose, onKey } = active;
  document.removeEventListener('keydown', onKey);
  el.classList.remove('is-open');
  document.body.classList.remove('has-modal');
  active = null;
  setTimeout(() => el.remove(), 200);
  onClose?.();
  prevFocus?.focus?.();
}

/**
 * openModal({ title, body (html), actions: [{label, variant, onClick, close}], size, onClose, className })
 * Devuelve el elemento del diálogo.
 */
export function openModal({ title, body = '', actions = [], size = 'md', onClose, className = '' }) {
  closeModal();
  const root = document.getElementById('modal-root');
  const el = document.createElement('div');
  el.className = `modal ${className}`;
  el.innerHTML = `
    <div class="modal__backdrop" data-close></div>
    <div class="modal__dialog modal__dialog--${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__head">
        <h2 id="modal-title" class="modal__title">${esc(title)}</h2>
        <button class="icon-btn modal__x" type="button" data-close aria-label="Cerrar">${icon('X')}</button>
      </div>
      <div class="modal__body">${body}</div>
      ${actions.length ? `<div class="modal__actions">${actions.map((a, i) => `<button type="button" class="btn btn--${a.variant || 'ghost'}" data-action="${i}">${esc(a.label)}</button>`).join('')}</div>` : ''}
    </div>`;
  root.append(el);
  document.body.classList.add('has-modal');
  requestAnimationFrame(() => el.classList.add('is-open'));

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const btn = e.target.closest('[data-action]');
    if (btn) {
      const a = actions[+btn.dataset.action];
      const keep = a.onClick?.(e) === false;
      if (a.close !== false && !keep) closeModal();
    }
  });

  const onKey = (e) => {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, iframe, [tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0]; const last = f.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  active = { el, prevFocus: document.activeElement, onClose, onKey };
  setTimeout(() => (el.querySelector('[autofocus]') || el.querySelector('.modal__actions .btn--primary') || el.querySelector('.modal__x')).focus(), 30);
  return el;
}

/** Confirmación con promesa. */
export function confirmar({ title, text, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    let ok = false;
    openModal({
      title,
      size: 'sm',
      body: `<p>${esc(text)}</p>`,
      actions: [
        { label: cancelLabel, variant: 'ghost' },
        { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: () => { ok = true; } },
      ],
      onClose: () => resolve(ok),
    });
  });
}

export function toast(message, { action, onAction, timeout = 3800 } = {}) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button" class="toast__btn">${esc(action)}</button>` : ''}`;
  root.append(el);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  const hide = () => { el.classList.remove('is-visible'); setTimeout(() => el.remove(), 300); };
  el.querySelector('.toast__btn')?.addEventListener('click', () => { onAction?.(); hide(); });
  if (timeout) setTimeout(hide, timeout);
  return hide;
}
