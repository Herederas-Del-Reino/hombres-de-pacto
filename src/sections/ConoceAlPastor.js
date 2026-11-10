import { pastor } from '../data/pastor.js';
import { esc, picture, asset } from '../utils/dom.js';
import { icon, brand } from '../components/Icons.js';
import { divider, mountains, ornaments } from '../components/Visuals.js';
import { bindLightbox } from '../components/Lightbox.js';

export const meta = { title: 'Conoce al Pastor' };

const gallery = (items, cls = '') => `<div class="gallery ${cls}">
  ${items.map((p, i) => `<button type="button" class="gallery__item reveal" data-lightbox="${i}" aria-label="Ampliar fotografía: ${esc(p.alt)}">
    ${picture(p.img, p.alt, { sizes: '(max-width: 700px) 50vw, 33vw' })}
  </button>`).join('')}
</div>`;

export function render(main) {
  const b = pastor.biografia;
  main.innerHTML = `
  <section class="pastor-hero">
    ${mountains({ className: 'pastor-hero__mountains' })}
    ${ornaments()}
    <div class="container pastor-hero__grid">
      <figure class="pastor-hero__portrait reveal">
        ${picture(pastor.retrato.img, pastor.retrato.alt, { eager: true, sizes: '(max-width: 900px) 90vw, 40vw' })}
      </figure>
      <div class="pastor-hero__text reveal">
        <p class="eyebrow">Hombres de Pacto</p>
        <h1 id="page-title" class="pastor-hero__title" tabindex="-1">Conoce al pastor <span>Oscar Amarales</span></h1>
        <p class="pastor-hero__lema">Una vida de fe, familia y servicio a Dios.</p>
        ${divider('divider--left')}
        <p class="lead">${esc(b[0])}</p>
        <ul class="social-row">
          ${pastor.redes.map((r) => `<li><a class="social-chip" href="${r.url}" target="_blank" rel="noopener">${brand[r.red](20)} <span>${esc(r.usuario)}</span><span class="sr-only"> en ${r.red} (abre en una pestaña nueva)</span></a></li>`).join('')}
        </ul>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="bio">
    <div class="container bio-grid">
      <div class="reading reveal">
        <h2 id="bio" class="h2">Biografía</h2>
        ${b.slice(1, 3).map((t) => `<p>${esc(t)}</p>`).join('')}
        <p class="pullquote">${esc(b[3])}</p>
        ${b.slice(4, 6).map((t) => `<p>${esc(t)}</p>`).join('')}
      </div>
      <aside class="facts reveal" aria-labelledby="trayectoria">
        <h2 id="trayectoria" class="h3">Trayectoria ministerial</h2>
        <ul class="facts__list">
          ${pastor.datos.map((d) => `<li>
            <span class="facts__icon">${icon(d.icono, { size: 22 })}</span>
            <span><span class="facts__label">${esc(d.etiqueta)}</span><span class="facts__value">${esc(d.valor)}</span></span>
          </li>`).join('')}
        </ul>
      </aside>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="pulpito">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Galería</p>
        <h2 id="pulpito" class="h2">Predicando la Palabra</h2>
        <p class="muted">Fe, esperanza, ánimo y transformación: para Dios nada es imposible.</p>
      </div>
      <div data-gal="pred">${gallery(pastor.predicacion, 'gallery--3')}</div>
    </div>
  </section>

  <section class="section" aria-labelledby="servicio">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Servicio y evangelización</p>
        <h2 id="servicio" class="h2">Llevando el mensaje de Jesucristo</h2>
        <p class="muted">Proclamar que Dios tiene el poder para transformar vidas, en la iglesia y en la calle.</p>
      </div>
      <div data-gal="serv">${gallery(pastor.servicio, 'gallery--mosaic')}</div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="familia">
    <div class="container family reveal">
      <div class="family__icon">${icon('HeartHandshake', { size: 40 })}</div>
      <div>
        <p class="eyebrow">Familia</p>
        <h2 id="familia" class="h2">Fe que se vive en casa</h2>
        <div class="family__stats">
          <p><span class="family__label">Esposa</span><strong>Pastora Jennyfer de Amarales</strong></p>
          <p><span class="family__label">Hijos</span><strong class="family__num">5</strong></p>
        </div>
        <p class="lead">${esc(b[6])}</p>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="redes">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Redes sociales</p>
        <h2 id="redes" class="h2">Sigue el ministerio</h2>
      </div>
      <div class="social-cards">
        ${pastor.redes.map((r) => `<a class="social-card reveal" href="${r.url}" target="_blank" rel="noopener">
          <span class="social-card__icon">${brand[r.red](34)}</span>
          <span class="social-card__net">${r.red}</span>
          <span class="social-card__user">${esc(r.usuario)}</span>
          <span class="social-card__go">Abrir perfil ${icon('ExternalLink', { size: 16 })}<span class="sr-only"> (pestaña nueva)</span></span>
        </a>`).join('')}
      </div>
    </div>
  </section>`;

  bindLightbox(main.querySelector('[data-gal="pred"]'), pastor.predicacion);
  bindLightbox(main.querySelector('[data-gal="serv"]'), pastor.servicio);
  void asset;
}
