import { pilares, galeria } from '../data/comunidad.js';
import { esc, picture } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { pageHead } from '../components/Visuals.js';
import { bindLightbox } from '../components/Lightbox.js';

export const meta = { title: 'Nuestra Comunidad' };

export function render(main) {
  main.innerHTML = `
    ${pageHead({
      image: 'equipo-evangelismo',
      scene: 'dawn',
      layout: 'split',
      index: 'V',
      eyebrow: 'Nuestra comunidad',
      title: 'Una familia de hombres con propósito',
      intro: '<p>Hombres de Pacto es una comunidad de crecimiento espiritual donde buscamos fortalecer nuestra relación con Dios, desarrollar un carácter conforme a Cristo y vivir nuestra fe en el hogar y en la sociedad.</p>',
    })}
    <section class="section section--bronze pillars-section" aria-labelledby="pilares">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Lo que nos sostiene</p>
          <h2 id="pilares" class="h2">Cinco pilares</h2>
        </div>
        <ol class="pillars">
          ${pilares.map((p, i) => `<li class="pillar reveal" style="--d:${i * 70}ms">
            <span class="pillar__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <span class="pillar__icon">${icon(p.icono, { size: 30 })}</span>
            <h3 class="pillar__title">${esc(p.titulo)}</h3>
            <p class="pillar__text">${esc(p.texto)}</p>
          </li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="section section--stone" aria-labelledby="galeria">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Galería ministerial</p>
          <h2 id="galeria" class="h2">Fe que se vive en comunidad</h2>
        </div>
        <div class="masonry" data-gal>
          ${galeria.map((g, i) => `<button type="button" class="masonry__item reveal" data-lightbox="${i}" aria-label="Ampliar fotografía: ${esc(g.alt)}">
            ${picture(g.img, g.alt, { sizes: '(max-width: 700px) 50vw, 33vw' })}
            <span class="masonry__cap">${esc(g.pie)}</span>
          </button>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--cta">
      <div class="container cta-band reveal">
        <div>
          <h2 class="h3">Camina con nosotros</h2>
          <p>Únete a nuestros encuentros y crece junto a otros hombres de pacto.</p>
        </div>
        <a class="btn btn--primary" href="#/encuentros">${icon('Calendar', { size: 20 })} Ver nuestros encuentros</a>
      </div>
    </section>`;
  bindLightbox(main.querySelector('[data-gal]'), galeria);
}
