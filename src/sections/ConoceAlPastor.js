import { pastor } from '../data/pastor.js';
import { esc, picture } from '../utils/dom.js';
import { icon, brand } from '../components/Icons.js';
import { ornaments, goldRule } from '../components/Visuals.js';
import { bindLightbox } from '../components/Lightbox.js';

export const meta = { title: 'Conoce al Pastor' };

const gallery = (items, cls = '') => `<div class="gallery ${cls}">
  ${items.map((p, i) => `<button type="button" class="gallery__item reveal" style="--d:${i * 60}ms" data-lightbox="${i}" aria-label="Ampliar fotografía: ${esc(p.alt)}">
    ${picture(p.img, p.alt, { sizes: '(max-width: 700px) 80vw, 33vw' })}
  </button>`).join('')}
</div>`;

export function render(main) {
  const b = pastor.biografia;
  main.innerHTML = `
  <section class="pastor3" aria-labelledby="page-title">
    <figure class="pastor3__portrait">
      ${picture(pastor.retrato.img, pastor.retrato.alt, { eager: true, sizes: '(max-width: 900px) 100vw, 50vw' })}
    </figure>
    ${ornaments({ streaks: false })}
    <div class="container pastor3__inner">
      <div class="pastor3__text reveal">
        <p class="ph__eyebrow">Conoce al pastor</p>
        <h1 id="page-title" class="pastor3__title" tabindex="-1"><span class="sr-only">Conoce al pastor </span>Oscar <span>Amarales</span></h1>
        <p class="pastor3__lema">Una vida de fe, familia y servicio a Dios.</p>
        ${goldRule('gold-rule--left')}
        <p class="pastor3__lead">${esc(b[0])}</p>
        <ul class="social-row">
          ${pastor.redes.map((r) => `<li><a class="social-chip" href="${r.url}" target="_blank" rel="noopener">${brand[r.red](20)} <span>${esc(r.usuario)}</span><span class="sr-only"> en ${r.red} (abre en una pestaña nueva)</span></a></li>`).join('')}
        </ul>
      </div>
    </div>
  </section>

  <section class="section section--ivory" aria-labelledby="bio">
    <div class="container bio3">
      <div class="bio3__text">
        <p class="kicker reveal">Biografía</p>
        <h2 id="bio" class="display reveal">Un siervo de Dios <span>comprometido</span></h2>
        <p class="lead dropcap reveal">${esc(b[1])} ${esc(b[2])}</p>
        <blockquote class="quote-xl reveal"><p>${esc(b[3])}</p></blockquote>
        <div class="columns reveal">
          <p>${esc(b[4])}</p>
          <p>${esc(b[5])}</p>
        </div>
      </div>
      <aside class="facts3 reveal" aria-labelledby="trayectoria">
        <h2 id="trayectoria" class="facts3__title">Trayectoria ministerial</h2>
        <ol class="facts3__list">
          ${pastor.datos.map((d) => `<li>
            <span class="facts3__icon">${icon(d.icono, { size: 20 })}</span>
            <span class="facts3__label">${esc(d.etiqueta)}</span>
            <span class="facts3__value">${esc(d.valor)}</span>
          </li>`).join('')}
        </ol>
      </aside>
    </div>
  </section>

  <section class="section pulpit" aria-labelledby="pulpito">
    <div class="container">
      <div class="split-head">
        <div>
          <p class="kicker reveal">Galería</p>
          <h2 id="pulpito" class="display display--light reveal">Predicando <span>la Palabra</span></h2>
        </div>
        <p class="split-head__aside reveal">Fe, esperanza, ánimo y transformación: para Dios nada es imposible.</p>
      </div>
      <div data-gal="pred">${gallery(pastor.predicacion, 'gallery--film')}</div>
    </div>
  </section>

  <section class="section section--stone" aria-labelledby="servicio">
    <div class="container">
      <div class="split-head">
        <div>
          <p class="kicker reveal">Servicio y evangelización</p>
          <h2 id="servicio" class="display reveal">Llevando el mensaje <span>de Jesucristo</span></h2>
        </div>
        <p class="split-head__aside reveal">Proclamar que Dios tiene el poder para transformar vidas, en la iglesia y en la calle.</p>
      </div>
      <div data-gal="serv">${gallery(pastor.servicio, 'gallery--mosaic')}</div>
    </div>
  </section>

  <section class="section section--bronze" aria-labelledby="familia">
    <div class="container family3 reveal">
      <div class="family3__mark">${icon('HeartHandshake', { size: 44 })}</div>
      <div>
        <p class="kicker kicker--light">Familia</p>
        <h2 id="familia" class="display display--light">Fe que se vive <span>en casa</span></h2>
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
      <div class="split-head">
        <div>
          <p class="kicker reveal">Redes sociales</p>
          <h2 id="redes" class="display display--light reveal">Sigue <span>el ministerio</span></h2>
        </div>
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
}
