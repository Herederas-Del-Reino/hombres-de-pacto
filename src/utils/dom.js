/** Utilidades mínimas de DOM y plantillas. */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Ruta pública de un archivo de /public respetando la base de GitHub Pages. */
export const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export function debounce(fn, ms = 400) {
  let t;
  const d = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  d.flush = (...args) => { clearTimeout(t); fn(...args); };
  return d;
}

/** Imagen responsive con versiones -sm (640px) y completa (1200px). */
export function picture(name, alt, { className = '', eager = false, sizes = '(max-width: 700px) 100vw, 50vw' } = {}) {
  const sm = asset(`images/${name}-sm.webp`);
  const lg = asset(`images/${name}.webp`);
  return `<img class="${className}" src="${lg}" srcset="${sm} 640w, ${lg} 1200w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

export const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
