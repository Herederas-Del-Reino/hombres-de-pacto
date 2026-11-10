import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/responsive.css';
import './styles/brand.css';

import { renderHeader, renderTabbar, setActive, ROUTES } from './components/Navigation.js';
import { renderFooter } from './components/Footer.js';
import { initPwa, installApp } from './components/Pwa.js';
import { openModal, confirmar, toast } from './components/Modal.js';
import { icon } from './components/Icons.js';
import { store, desafiosCumplidos, altarCompletados } from './utils/storage.js';

import * as Inicio from './sections/Inicio.js';
import * as VuelveAlAltar from './sections/VuelveAlAltar.js';
import * as DesafiosDePacto from './sections/DesafiosDePacto.js';
import * as Encuentros from './sections/Encuentros.js';
import * as ConoceAlPastor from './sections/ConoceAlPastor.js';
import * as Comunidad from './sections/Comunidad.js';
import * as Recursos from './sections/Recursos.js';
import * as Oracion from './sections/Oracion.js';

const SECTIONS = {
  inicio: Inicio,
  altar: VuelveAlAltar,
  desafios: DesafiosDePacto,
  encuentros: Encuentros,
  pastor: ConoceAlPastor,
  comunidad: Comunidad,
  recursos: Recursos,
  oracion: Oracion,
};

const main = document.getElementById('main');
const nav = renderHeader(document.getElementById('site-header'));
renderTabbar(document.getElementById('tabbar'));
renderFooter(document.getElementById('site-footer'));
initPwa();

let cleanup = null;
let current = { route: null, params: [] };

/* ---------- Animación de aparición discreta ---------- */
// Comprobación por posición (más fiable que IntersectionObserver en vistas
// incrustadas o en segundo plano). El contenido nunca queda oculto: tras 3 s
// se muestra todo lo pendiente aunque no haya habido desplazamiento.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealTimer = null;
let ticking = false;

function revealCheck() {
  ticking = false;
  const limit = window.innerHeight * 0.94;
  document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
    if (el.getBoundingClientRect().top < limit) el.classList.add('is-in');
  });
}

function observeReveals(root) {
  if (reduceMotion) { root.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in')); return; }
  requestAnimationFrame(revealCheck);
  setTimeout(revealCheck, 120);
  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => root.querySelectorAll('.reveal:not(.is-in)').forEach((el) => el.classList.add('is-in')), 3000);
}

const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(revealCheck); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

/* ---------- Enrutador por hash (compatible con GitHub Pages, sin 404) ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [route, ...params] = raw.split('/').filter(Boolean);
  return { route: SECTIONS[route] ? route : 'inicio', params, known: !route || !!SECTIONS[route] };
}

function render({ keepScroll = false } = {}) {
  const { route, params, known } = parseHash();
  if (!known) { history.replaceState(null, '', '#/inicio'); }
  const sameView = current.route === route && current.params.join('/') === params.join('/');
  cleanup?.();
  cleanup = null;

  const view = document.createElement('div');
  view.className = `view view--${route}`;
  const ctx = {
    rerender: () => render({ keepScroll: true }),
    go: (hash) => { if (location.hash === hash) render({ keepScroll: true }); else location.hash = hash; },
  };
  const result = SECTIONS[route].render(view, params, ctx);
  if (typeof result === 'function') cleanup = result;
  main.replaceChildren(view);
  observeReveals(view);
  setActive(route);

  const r = ROUTES.find((x) => x.id === route);
  document.title = route === 'inicio'
    ? 'Hombres de Pacto · Hombres restaurados, comprometidos con Dios y sus familias'
    : `${SECTIONS[route].meta?.title ?? r.label} · Hombres de Pacto`;

  if (!keepScroll || !sameView) {
    window.scrollTo(0, 0);
  }
  if (current.route !== null && !keepScroll) {
    // Lleva el foco al título para lectores de pantalla y teclado.
    const h = view.querySelector('#page-title, #dia-titulo, h1');
    h?.focus({ preventScroll: true });
  }
  current = { route, params };
}

window.addEventListener('hashchange', () => render());

/* ---------- Mis datos: privacidad, exportar, importar y borrar ---------- */
function misDatos() {
  const s = store.get();
  const el = openModal({
    title: 'Mis datos en este dispositivo',
    size: 'md',
    body: `
      <p>Tu progreso, tus reflexiones y tus preferencias se guardan <strong>solo en este navegador</strong>. No se envían a ningún servidor y no se sincronizan automáticamente con otros equipos.</p>
      <ul class="data-summary">
        <li>${icon('Flame', { size: 18 })} Vuelve al Altar: <strong>${altarCompletados(s)} de 7</strong> encuentros</li>
        <li>${icon('Mountain', { size: 18 })} Desafíos de Pacto: <strong>${desafiosCumplidos(s)} de 25</strong> completados</li>
      </ul>
      ${store.available() ? '' : '<p class="warn">Tu navegador no permite guardar datos (modo privado o almacenamiento bloqueado). El progreso se perderá al cerrar la página.</p>'}
      <p class="fine">Para llevar tu progreso a otro dispositivo, exporta una copia y luego impórtala allí.</p>
      <div class="data-buttons">
        <button type="button" class="btn btn--ghost" data-export>${icon('Download', { size: 18 })} Exportar copia</button>
        <label class="btn btn--ghost">${icon('Upload', { size: 18 })} Importar copia<input type="file" accept="application/json,.json" data-import hidden /></label>
        <button type="button" class="btn btn--danger" data-wipe>${icon('RotateCcw', { size: 18 })} Borrar todo</button>
      </div>`,
  });
  el.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([store.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hombres-de-pacto-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('Copia exportada.');
  });
  el.querySelector('[data-import]').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      store.import(await file.text());
      toast('Progreso importado correctamente.');
      render({ keepScroll: true });
      misDatos();
    } catch { toast('El archivo no es una copia válida de Hombres de Pacto.'); }
  });
  el.querySelector('[data-wipe]').addEventListener('click', async () => {
    const ok = await confirmar({
      title: '¿Borrar todos tus datos?',
      text: 'Se eliminarán de este dispositivo tus encuentros, desafíos, reflexiones y preferencias. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, borrar todo', danger: true,
    });
    if (ok) { store.resetAll(); toast('Se borraron tus datos de este dispositivo.'); render({ keepScroll: true }); }
  });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-install]')) installApp();
  if (e.target.closest('[data-mis-datos]')) misDatos();
  if (e.target.closest('.tabbar__more')) nav.open();
});

render();
