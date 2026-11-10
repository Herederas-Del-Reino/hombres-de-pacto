import { encuentros } from '../data/encuentros.js';
import { horarioSemanal, proximasOcurrencias, formatear, esVeranoEspana, ZONA_BASE } from '../utils/timezones.js';
import { esc, asset } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { pageHead, flags } from '../components/Visuals.js';
import {
  countrySelector, bindCountrySelector, paisActual, nextMeetingCard, startCountdowns, opcionesPais, horaBase,
} from '../components/Schedule.js';

export const meta = { title: 'Nuestros Encuentros' };

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
  return `<h2 class="h3 table-title" id="tabla-horarios">Horarios de esta semana en cada país</h2>
  <div class="table-wrap reveal" role="region" aria-labelledby="tabla-horarios" tabindex="0">
    <table class="times-table">
      <thead><tr><th scope="col">Encuentro</th>${opts.map((o) => `<th scope="col">${flags[o.id] ?? flags.LOCAL} ${esc(o.nombre)}</th>`).join('')}</tr></thead>
      <tbody>
        ${encuentros.map((e) => `<tr><th scope="row">${esc(e.nombre)}</th>${opts.map((o) => {
          const h = horarioSemanal(e, o.zona, now);
          return `<td><span class="times-table__days">${h.diasTexto}</span><strong>${h.hora}</strong></td>`;
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

    <section class="section section--alt">
      <div class="container meet-bottom">
        <div data-table>${tablaPaises()}</div>
        <figure class="poster reveal">
          <img src="${asset('images/afiche-encuentros.webp')}" alt="Afiche oficial de Nuestros Encuentros: Devocional de Madrugada los martes a las 5:00 a. m. y Salmos de lunes a viernes a las 8:00 p. m., hora de España" width="370" height="373" loading="lazy" />
          <figcaption>Afiche oficial de los encuentros</figcaption>
        </figure>
      </div>
    </section>`;

  const refresh = () => {
    main.querySelector('[data-next]').innerHTML = nextMeetingCard();
    main.querySelector('[data-meetings]').innerHTML = meetingCards();
    main.querySelectorAll('[data-meetings] .reveal').forEach((n) => n.classList.add('is-in'));
  };
  bindCountrySelector(main, refresh);
  return startCountdowns(main, refresh);
}
