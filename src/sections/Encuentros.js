import { encuentros } from '../data/encuentros.js';
import { horarioSemanal, proximasOcurrencias, formatear, esVeranoEspana, ZONA_BASE } from '../utils/timezones.js';
import { esc, asset } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { pageHead, flags } from '../components/Visuals.js';
import { bindLightbox } from '../components/Lightbox.js';
import {
  countrySelector, bindCountrySelector, paisActual, nextMeetingCard, startCountdowns, opcionesPais, horaBase,
} from '../components/Schedule.js';

export const meta = { title: 'Nuestros Encuentros' };

const AFICHES = [
  { img: 'afiche-horarios-encuentros', h: 711, pie: 'Horarios de nuestros encuentros · Hora Europa (España)', alt: 'Afiche Horarios de Nuestros Encuentros: Berea lunes y viernes 8:00 p. m., Entre Valientes martes 8:00 p. m. y Devocional de Madrugada martes 5:00 a. m., hora de Europa (España), con los horarios por país' },
];

function meetingCards() {
  const pais = paisActual();
  const now = new Date();
  return encuentros.map((e) => {
    const conv = horarioSemanal(e, pais.zona, now);
    const base = horarioSemanal(e, ZONA_BASE, now);
    const prox = proximasOcurrencias(e, now, 1)[0];
    const proxLocal = prox ? formatear(prox, pais.zona) : null;
    return `<article class="meeting reveal">
      <div class="meeting__icon">${icon(e.icono, { size: 34 })}</div>
      <div class="meeting__body">
        <h3 class="meeting__title">${esc(e.nombre)}</h3>
        <p class="meeting__desc">${esc(e.descripcion)}</p>
        <dl class="meeting__times">
          <div class="meeting__time meeting__time--main">
            <dt>${flags[pais.id] ?? flags.LOCAL} ${esc(pais.nombre)}</dt>
            <dd><span>${conv.diasTexto}</span><strong>${conv.hora}</strong></dd>
          </div>
          ${pais.id !== 'ES' ? `<div class="meeting__time">
            <dt>${flags.ES} España (hora oficial)</dt>
            <dd><span>${base.diasTexto}</span><strong>${horaBase(e)}</strong></dd>
          </div>` : ''}
        </dl>
        ${proxLocal ? `<p class="meeting__next">${icon('Calendar', { size: 16 })} Próxima fecha: <strong>${proxLocal.fecha}, ${proxLocal.hora}</strong></p>` : ''}
        <div class="meeting__link">
          ${e.enlace
            ? `<a class="btn btn--primary btn--sm" href="${esc(e.enlace)}" target="_blank" rel="noopener">${icon('Video', { size: 18 })} Unirme al encuentro</a>`
            : `<span class="soon">${icon('Video', { size: 16 })} Enlace de conexión disponible próximamente</span>`}
        </div>
      </div>
    </article>`;
  }).join('');
}

function tablaPaises() {
  const now = new Date();
  const opts = opcionesPais();
  const actual = paisActual();
  return `<h2 class="h3 table-title" id="tabla-horarios">Horario en tu país</h2>
  <div class="table-wrap reveal" role="region" aria-labelledby="tabla-horarios" tabindex="0">
    <table class="times-table times-table--paises">
      <thead><tr><th scope="col">País</th>${encuentros.map((e) => `<th scope="col">${esc(e.nombre)}</th>`).join('')}</tr></thead>
      <tbody>
        ${opts.map((o) => `<tr${o.id === actual.id ? ' class="is-mine"' : ''}><th scope="row">${flags[o.id] ?? flags.LOCAL} <span>${esc(o.nombre)}</span></th>${encuentros.map((e) => {
          const h = horarioSemanal(e, o.zona, now);
          return `<td data-label="${esc(e.nombre)}"><span class="times-table__days">${h.diasTexto}</span><strong>${h.hora}</strong></td>`;
        }).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

export function render(main) {
  const verano = esVeranoEspana();
  main.innerHTML = `
    ${pageHead({
      image: 'adoracion',
      scene: 'night',
      index: 'III',
      eyebrow: 'Hombres de Pacto',
      title: 'Nuestros Encuentros',
      subtitle: 'Un mismo propósito: crecer en nuestra relación con Dios, fortalecer nuestra fe y caminar como hombres de pacto.',
    })}
    <section class="section section--tight">
      <div class="container">
        <div class="meet-top">
          <div data-country>${countrySelector({ id: 'pais-encuentros' })}</div>
          <p class="dst-note">${icon('Clock', { size: 16 })}<span>Horario oficial: España peninsular. Ahora rige el <strong>horario de ${verano ? 'verano' : 'invierno'}</strong> en España; las conversiones se ajustan automáticamente.</span></p>
        </div>
        <div data-next class="next-solo">${nextMeetingCard()}</div>
        <div class="meetings" data-meetings>${meetingCards()}</div>
      </div>
    </section>

    <section class="section section--stone">
      <div class="container meet-bottom">
        <div data-table>${tablaPaises()}</div>
        <div class="posters" data-afiches>
          ${AFICHES.map((a, i) => `<button type="button" class="poster reveal" data-lightbox="${i}" style="--d:${i * 100}ms" aria-label="Ampliar ${esc(a.pie)}">
            <img src="${asset(`images/${a.img}-sm.webp`)}" alt="${esc(a.alt)}" width="640" height="${a.h}" loading="lazy" decoding="async" />
            <span class="poster__cap">${esc(a.pie)}</span>
          </button>`).join('')}
        </div>
      </div>
    </section>`;

  const refresh = () => {
    main.querySelector('[data-next]').innerHTML = nextMeetingCard();
    main.querySelector('[data-meetings]').innerHTML = meetingCards();
    main.querySelector('[data-table]').innerHTML = tablaPaises();
    main.querySelectorAll('[data-meetings] .reveal, [data-table] .reveal').forEach((n) => n.classList.add('is-in'));
  };
  bindLightbox(main.querySelector('[data-afiches]'), AFICHES.map((a) => ({ img: a.img, alt: a.alt, pie: a.pie })));
  bindCountrySelector(main, refresh);
  return startCountdowns(main, refresh);
}
