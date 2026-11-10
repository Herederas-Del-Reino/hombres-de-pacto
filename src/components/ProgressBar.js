import { pct } from '../utils/dom.js';

/** Barra de progreso accesible. */
export function progressBar(done, total, { label = 'Progreso', className = '' } = {}) {
  const p = pct(done, total);
  return `<div class="progress ${className}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-valuetext="${done} de ${total} (${p} %)">
    <div class="progress__fill" style="--p:${p}%"></div>
  </div>`;
}

/** Anillo circular de progreso. */
export function progressRing(done, total, { size = 120, label = '' } = {}) {
  const p = pct(done, total);
  const r = 52; const c = 2 * Math.PI * r;
  return `<div class="ring" style="--size:${size}px" role="img" aria-label="${label || `${done} de ${total} completados`}">
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="${r}" class="ring__track"/>
      <circle cx="60" cy="60" r="${r}" class="ring__bar" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}"/>
    </svg>
    <div class="ring__text"><strong>${done}</strong><span>de ${total}</span></div>
  </div>`;
}
