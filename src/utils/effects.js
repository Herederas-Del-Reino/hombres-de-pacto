/**
 * Efectos visuales ligeros (sin dependencias). Todos se desactivan con
 * «reducir movimiento» y en dispositivos sin puntero fino donde no aportan.
 *  - Parallax en [data-parallax]
 *  - Barra de progreso de lectura
 *  - Contadores [data-count]
 *  - Inclinación 3D sutil en .tile, .book, .feature, .station__card (solo ratón)
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let bar;
let items = [];
let ticking = false;

function frame() {
  ticking = false;
  const vh = window.innerHeight;
  const doc = document.documentElement;
  const max = doc.scrollHeight - vh;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  for (const el of items) {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) continue;
    const f = parseFloat(el.dataset.parallax) || 0;
    const lim = r.height * 0.09; // margen disponible con scale(1.2)
    const offset = Math.max(-lim, Math.min(lim, (r.top + r.height / 2 - vh / 2) * -f));
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.2)`;
  }
}

const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

function countUp(root) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    const to = parseInt(el.dataset.count, 10) || 0;
    if (reduce || to === 0) { el.textContent = String(to); return; }
    const t0 = performance.now();
    const dur = 900 + to * 20;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });
}

function tilt(root) {
  if (reduce || !finePointer) return;
  root.querySelectorAll('.tile, .book__cover, .feature, .reading-card').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
      el.classList.add('is-tilting');
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('is-tilting'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
  });
}

export function initEffects() {
  bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

/** Llamar después de cada renderizado de vista. */
export function applyEffects(root) {
  items = reduce ? [] : [...root.querySelectorAll('[data-parallax]')].map((w) => w.querySelector('.scene__img') ?? w);
  items.forEach((img) => { img.dataset.parallax = img.closest('[data-parallax]').dataset.parallax; });
  countUp(root);
  tilt(root);
  onScroll();
}
