/** Cabecera, menú lateral (móvil/tablet) y barra inferior tipo app. */
import { icon } from './Icons.js';
import { asset } from '../utils/dom.js';

export const ROUTES = [
  { id: 'inicio', label: 'Inicio', short: 'Inicio', icono: 'House' },
  { id: 'altar', label: 'Vuelve al Altar', short: 'Altar', icono: 'Flame' },
  { id: 'desafios', label: 'Desafíos de Pacto', short: 'Desafíos', icono: 'Mountain' },
  { id: 'encuentros', label: 'Nuestros Encuentros', short: 'Encuentros', icono: 'Calendar' },
  { id: 'pastor', label: 'Conoce al Pastor', short: 'Pastor', icono: 'BookOpen' },
  { id: 'comunidad', label: 'Nuestra Comunidad', short: 'Comunidad', icono: 'Users' },
  { id: 'recursos', label: 'Recursos y Enseñanzas', short: 'Recursos', icono: 'Library' },
  { id: 'oracion', label: 'Oración y Contacto', short: 'Oración', icono: 'HandHeart' },
];

const TAB_IDS = ['inicio', 'altar', 'desafios', 'encuentros'];

export function renderHeader(el) {
  el.className = 'site-header';
  el.innerHTML = `
    <div class="container site-header__inner">
      <a class="brand" href="#/inicio" aria-label="Hombres de Pacto, ir al inicio">
        <img src="${asset('images/logo-sm.webp')}" alt="" width="44" height="46" />
        <span class="brand__text"><span class="brand__top">Hombres de</span><span class="brand__main">Pacto</span></span>
      </a>
      <nav class="mainnav" aria-label="Principal">
        <ul>${ROUTES.map((r) => `<li><a href="#/${r.id}" data-route="${r.id}">${r.short}</a></li>`).join('')}</ul>
      </nav>
      <button class="icon-btn menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="drawer">${icon('Menu')}</button>
    </div>
    <div class="drawer" id="drawer" hidden>
      <div class="drawer__backdrop" data-drawer-close></div>
      <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menú">
        <div class="drawer__head">
          <img src="${asset('images/logo-sm.webp')}" alt="Hombres de Pacto" width="64" height="67" />
          <button class="icon-btn" type="button" data-drawer-close aria-label="Cerrar menú">${icon('X')}</button>
        </div>
        <ul class="drawer__list">
          ${ROUTES.map((r) => `<li><a href="#/${r.id}" data-route="${r.id}">${icon(r.icono, { size: 22 })}<span>${r.label}</span>${icon('ChevronRight', { size: 18, className: 'drawer__chev' })}</a></li>`).join('')}
        </ul>
        <div class="drawer__extra">
          <button type="button" class="btn btn--ghost btn--block" data-install>${icon('Smartphone', { size: 20 })} Instalar la app</button>
          <button type="button" class="btn btn--text btn--block" data-mis-datos>${icon('Lock', { size: 18 })} Mis datos en este dispositivo</button>
        </div>
      </div>
    </div>`;

  const btn = el.querySelector('.menu-btn');
  const drawer = el.querySelector('.drawer');
  const open = () => {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('has-drawer');
    drawer.querySelector('a').focus();
  };
  const close = () => {
    drawer.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('has-drawer');
    setTimeout(() => { drawer.hidden = true; }, 250);
  };
  btn.addEventListener('click', open);
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-drawer-close]') || e.target.closest('a') || e.target.closest('[data-install]') || e.target.closest('[data-mis-datos]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { close(); btn.focus(); } });
  window.addEventListener('scroll', () => el.classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });
  return { open, close };
}

export function renderTabbar(el) {
  el.className = 'tabbar';
  el.innerHTML = `<ul>
    ${TAB_IDS.map((id) => { const r = ROUTES.find((x) => x.id === id); return `<li><a href="#/${r.id}" data-route="${r.id}">${icon(r.icono, { size: 22 })}<span>${r.short}</span></a></li>`; }).join('')}
    <li><button type="button" class="tabbar__more" aria-label="Más secciones">${icon('Ellipsis', { size: 22 })}<span>Más</span></button></li>
  </ul>`;
}

export function setActive(route) {
  document.querySelectorAll('[data-route]').forEach((a) => {
    const on = a.dataset.route === route;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const more = document.querySelector('.tabbar__more');
  if (more) more.classList.toggle('is-active', !TAB_IDS.includes(route));
}
