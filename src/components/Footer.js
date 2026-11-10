import { icon, brand } from './Icons.js';
import { asset } from '../utils/dom.js';
import { ROUTES } from './Navigation.js';
import { pastor } from '../data/pastor.js';

export function renderFooter(el) {
  el.className = 'site-footer';
  const year = new Date().getFullYear();
  el.innerHTML = `
    <div class="container site-footer__grid">
      <div class="site-footer__brand">
        <img src="${asset('images/logo-sm.webp')}" alt="Hombres de Pacto" width="120" height="126" loading="lazy" />
        <p class="site-footer__lema">Hombres restaurados, comprometidos con Dios y sus familias.</p>
        <p class="site-footer__verse">«Pero yo y mi casa serviremos a Jehová». <span>Josué 24:15</span></p>
      </div>
      <nav aria-label="Secciones">
        <h2 class="site-footer__title">Secciones</h2>
        <ul class="site-footer__links">${ROUTES.map((r) => `<li><a href="#/${r.id}">${r.label}</a></li>`).join('')}</ul>
      </nav>
      <div>
        <h2 class="site-footer__title">Síguenos</h2>
        <ul class="site-footer__social">
          ${pastor.redes.map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener">${brand[r.red](20)}<span>${r.usuario}</span><span class="sr-only"> en ${r.red} (abre en una pestaña nueva)</span></a></li>`).join('')}
        </ul>
        <div class="site-footer__actions">
          <button type="button" class="btn btn--ghost btn--sm" data-install>${icon('Smartphone', { size: 18 })} Instalar la app</button>
          <button type="button" class="btn btn--text btn--sm" data-mis-datos>${icon('Lock', { size: 16 })} Mis datos</button>
        </div>
      </div>
    </div>
    <div class="container site-footer__bottom">
      <p><strong>Hombres de Pacto</strong> · No solamente lo declaramos. Lo vivimos. · ${year}</p>
      <p class="site-footer__note">Tu progreso y tus reflexiones se guardan solo en este dispositivo.</p>
    </div>`;
}
