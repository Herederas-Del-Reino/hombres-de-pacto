import { desafios } from '../data/desafios.js';
import { store, desafiosCumplidos } from '../utils/storage.js';
import { esc, debounce, pct } from '../utils/dom.js';
import { bibleLink } from '../utils/bible.js';
import { icon } from '../components/Icons.js';
import { pageHead, divider } from '../components/Visuals.js';
import { progressBar, progressRing } from '../components/ProgressBar.js';
import { confirmar, toast } from '../components/Modal.js';
import { descargarReconocimiento } from '../utils/pdf.js';

export const meta = { title: 'Desafíos de Pacto' };
const TOTAL = desafios.length;
const ESTADOS = { pendiente: 'Pendiente', proceso: 'En proceso', cumplido: 'Completado' };
const estadoDe = (dia) => store.get().desafios[dia]?.estado ?? 'pendiente';

function progressPanel() {
  const n = desafiosCumplidos();
  return `<div class="path-progress" aria-labelledby="mi-camino-titulo">
    ${progressRing(n, TOTAL, { size: 116, label: `${n} de ${TOTAL} desafíos completados` })}
    <div class="path-progress__text">
      <h2 id="mi-camino-titulo" class="path-progress__title">Mi camino de pacto</h2>
      <p class="path-progress__count" aria-live="polite"><strong>${n} de ${TOTAL}</strong> desafíos completados — <strong>${pct(n, TOTAL)} %</strong></p>
      ${progressBar(n, TOTAL, { label: 'Desafíos completados' })}
    </div>
  </div>`;
}

function nextSuggested() {
  const s = store.get();
  return desafios.find((d) => s.desafios[d.dia]?.estado === 'proceso') ?? desafios.find((d) => s.desafios[d.dia]?.estado !== 'cumplido');
}

function pathView() {
  const sug = nextSuggested();
  const n = desafiosCumplidos();
  return `
    ${pageHead({
      eyebrow: 'Hombres de Pacto',
      title: 'Desafíos de Pacto',
      subtitle: '25 días para transformar tu vida',
      intro: `<p>Este apartado ha sido creado para que cada hombre tenga un desafío nuevo cada día.</p>
              <p>No serán simplemente frases motivacionales: serán acciones concretas que deberá llevar a la práctica para que su vida sea transformada y pueda avanzar en el propósito de Dios.</p>
              <p class="page-head__motto">25 días. 25 decisiones. Un compromiso de transformación.</p>`,
    })}
    <section class="section section--tight">
      <div class="container">
        ${progressPanel()}
        ${n === TOTAL
          ? `<div class="banner banner--gold">${icon('Award', { size: 24 })}<p><strong>¡Has completado tus 25 desafíos!</strong> Descarga tu reconocimiento personal.</p><a class="btn btn--primary btn--sm" href="#/desafios/final">Ver reconocimiento</a></div>`
          : sug ? `<a class="continue-card" href="#/desafios/${sug.dia}">
              <span class="continue-card__label">${n ? 'Continúa tu camino' : 'Comienza hoy'}</span>
              <span class="continue-card__title">Día ${sug.dia} · ${esc(sug.titulo)}</span>
              <span class="continue-card__go">${icon('ArrowRight', { size: 20 })}</span>
            </a>` : ''}

        <h2 class="sr-only">Las 25 estaciones</h2>
        <div class="legend" aria-hidden="true">
          <span class="legend__item"><span class="dot dot--pendiente"></span> Pendiente</span>
          <span class="legend__item"><span class="dot dot--proceso"></span> En proceso</span>
          <span class="legend__item"><span class="dot dot--cumplido"></span> Completado</span>
        </div>
        <ol class="path">
          ${desafios.map((d) => {
            const est = estadoDe(d.dia);
            return `<li class="station station--${est}">
              <a class="station__card" href="#/desafios/${d.dia}" aria-label="Día ${d.dia}: ${esc(d.titulo)}. Estado: ${ESTADOS[est]}">
                <span class="station__node">${est === 'cumplido' ? icon('Check', { size: 20, stroke: 2.6 }) : `<span>${d.dia}</span>`}</span>
                <span class="station__icon">${icon(d.icono, { size: 26 })}</span>
                <span class="station__day">Día ${d.dia}</span>
                <span class="station__title">${esc(d.titulo.replace(/^El pacto (de la |del |de las |de )/, '').replace(/^./, (c) => c.toUpperCase()))}</span>
                <span class="station__state">${ESTADOS[est]}</span>
              </a>
            </li>`;
          }).join('')}
        </ol>
        <div class="data-actions">
          <p class="fine">${icon('Lock', { size: 14 })} Tu progreso se guarda automáticamente en este dispositivo y no se sincroniza con otros equipos. No necesitas cuenta.</p>
          <button type="button" class="btn btn--text btn--sm" data-reset>${icon('RotateCcw', { size: 16 })} Reiniciar mis desafíos</button>
        </div>
      </div>
    </section>`;
}

function detailView(d) {
  const reg = store.get().desafios[d.dia] ?? {};
  const est = reg.estado ?? 'pendiente';
  const prev = d.dia > 1 ? d.dia - 1 : null;
  const next = d.dia < TOTAL ? d.dia + 1 : null;
  const n = desafiosCumplidos();
  return `
  <section class="challenge-wrap">
    <div class="container container--reading">
      <nav class="crumbs" aria-label="Ruta">
        <a href="#/desafios">${icon('ChevronLeft', { size: 18 })} Mi camino de pacto</a>
        <span class="crumbs__count">${n} de ${TOTAL} · ${pct(n, TOTAL)} %</span>
      </nav>
      ${progressBar(n, TOTAL, { label: 'Desafíos completados', className: 'progress--thin' })}

      <article class="challenge challenge--${est}" aria-labelledby="page-title">
        <div class="challenge__top">
          <span class="challenge__icon">${icon(d.icono, { size: 34 })}</span>
          <div>
            <p class="eyebrow">Día ${d.dia} de ${TOTAL}</p>
            <h1 id="page-title" class="challenge__title" tabindex="-1">${esc(d.titulo)}</h1>
          </div>
          <span class="status-pill status-pill--${est}">${ESTADOS[est]}</span>
        </div>
        ${divider('divider--left')}
        <div class="challenge__block">
          <h2 class="challenge__label">${icon('Footprints', { size: 18 })} Acción concreta</h2>
          <p class="challenge__action">${esc(d.accion)}</p>
          ${d.alternativa ? `<p class="challenge__alt">${esc(d.alternativa)}</p>` : ''}
        </div>
        ${d.versiculo ? `<div class="challenge__block">
          <h2 class="challenge__label">${icon('BookOpen', { size: 18 })} Referencia bíblica</h2>
          <div class="bible-refs">${bibleLink(d.versiculo)}</div>
        </div>` : ''}
        <div class="challenge__block">
          <label class="challenge__label" for="nota">${icon('PenLine', { size: 18 })} Reflexión personal <span class="tag">Opcional</span></label>
          <textarea id="nota" class="journal" rows="5" placeholder="¿Qué aprendiste? ¿Qué cambió en ti o en tu familia al vivir este pacto?">${esc(reg.nota ?? '')}</textarea>
          <p class="save-state" aria-live="polite" data-save-state>${icon('Lock', { size: 14 })} Se guarda automáticamente solo en este dispositivo</p>
        </div>
        <div class="challenge__actions">
          ${est === 'cumplido'
            ? `<p class="done-badge">${icon('CircleCheck', { size: 22 })} Desafío cumplido</p>
               <button type="button" class="btn btn--ghost" data-unmark>${icon('RotateCcw', { size: 18 })} Desmarcar</button>`
            : `<button type="button" class="btn btn--primary btn--lg" data-mark>${icon('Check', { size: 20 })} Marcar como cumplido</button>
               ${est === 'pendiente' ? `<button type="button" class="btn btn--ghost" data-start>${icon('CircleDot', { size: 18 })} Lo estoy haciendo</button>` : ''}`}
        </div>
      </article>

      <nav class="pager" aria-label="Navegación entre desafíos">
        ${prev ? `<a class="btn btn--ghost" href="#/desafios/${prev}">${icon('ChevronLeft', { size: 18 })} Día ${prev}</a>` : '<span></span>'}
        ${next ? `<a class="btn btn--ghost" href="#/desafios/${next}">Día ${next} ${icon('ChevronRight', { size: 18 })}</a>` : '<span></span>'}
      </nav>
    </div>
  </section>`;
}

function finalView() {
  const n = desafiosCumplidos();
  if (n < TOTAL) {
    return `<section class="section"><div class="container container--reading finale">
      <h1 id="page-title" class="finale__title" tabindex="-1">Tu reconocimiento te espera</h1>
      <p>Llevas ${n} de ${TOTAL} desafíos. Cuando completes los 25, aquí podrás descargar tu reconocimiento personal.</p>
      <a class="btn btn--primary" href="#/desafios">Volver a mi camino</a></div></section>`;
  }
  return `<section class="celebration">
    <div class="celebration__glow" aria-hidden="true"></div>
    <div class="container container--reading celebration__inner">
      <div class="celebration__badge">${icon('Award', { size: 54 })}</div>
      <h1 id="page-title" class="celebration__title" tabindex="-1">¡Has completado tus 25 Desafíos de Pacto!</h1>
      <p class="celebration__text">Has recorrido un camino de fe, compromiso, servicio y transformación.</p>
      <p class="celebration__text">Este no es el final.</p>
      <p class="celebration__motto">El verdadero pacto se vive cada día.</p>
      ${divider()}
      <form class="cert-form" data-cert>
        <label for="cert-nombre">Tu nombre para el reconocimiento <span class="tag">Opcional</span></label>
        <input id="cert-nombre" class="input" type="text" maxlength="60" autocomplete="name" value="${esc(store.get().nombre)}" placeholder="Escribe tu nombre" />
        <button type="submit" class="btn btn--primary btn--lg">${icon('Download', { size: 20 })} Descargar mi reconocimiento (PDF)</button>
        <p class="fine">Reconocimiento personal de recorrido. No es una certificación ministerial oficial. Se genera en tu dispositivo; tu nombre no se envía a ningún servidor.</p>
      </form>
      <div class="finale__actions">
        <a class="btn btn--ghost" href="#/desafios">Ver mi camino</a>
        <a class="btn btn--ghost" href="#/altar">Vuelve al Altar</a>
      </div>
    </div>
  </section>`;
}

export function render(main, params, ctx) {
  const p = params[0];
  if (p === 'final') {
    main.innerHTML = finalView();
    main.querySelector('[data-cert]')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = main.querySelector('#cert-nombre').value.trim();
      store.update((s) => { s.nombre = nombre; });
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try { await descargarReconocimiento(nombre); toast('Tu reconocimiento se ha descargado.'); }
      catch (err) { console.error(err); toast('No se pudo generar el PDF. Inténtalo de nuevo.'); }
      finally { btn.disabled = false; }
    });
    return;
  }

  const dia = parseInt(p, 10);
  const d = desafios.find((x) => x.dia === dia);
  if (!d) {
    main.innerHTML = pathView();
    main.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-reset]')) return;
      const ok = await confirmar({
        title: '¿Reiniciar tus desafíos?',
        text: 'Se borrarán de este dispositivo los 25 desafíos marcados y tus reflexiones. Esta acción no se puede deshacer.',
        confirmLabel: 'Sí, reiniciar', danger: true,
      });
      if (ok) { store.resetDesafios(); toast('Tus desafíos se reiniciaron.'); ctx.rerender(); }
    });
    return;
  }

  main.innerHTML = detailView(d);
  const setEstado = (estado) => store.update((s) => {
    s.desafios[d.dia] = { ...(s.desafios[d.dia] ?? {}), estado, fecha: new Date().toISOString() };
  });

  const ta = main.querySelector('#nota');
  const st = main.querySelector('[data-save-state]');
  const save = debounce(() => {
    store.update((s) => {
      const prev = s.desafios[d.dia] ?? {};
      s.desafios[d.dia] = { ...prev, nota: ta.value, estado: prev.estado ?? (ta.value.trim() ? 'proceso' : undefined) };
      if (!s.desafios[d.dia].estado) delete s.desafios[d.dia].estado;
    });
    st.innerHTML = `${icon('Lock', { size: 14 })} Guardado en este dispositivo`;
  }, 500);
  ta.addEventListener('input', () => { st.textContent = 'Guardando…'; save(); });
  ta.addEventListener('blur', () => save.flush());

  main.addEventListener('click', (e) => {
    if (e.target.closest('[data-mark]')) {
      save.flush();
      setEstado('cumplido');
      const n = desafiosCumplidos();
      if (n === TOTAL) { ctx.go('#/desafios/final'); return; }
      toast(`Día ${d.dia} cumplido · ${n} de ${TOTAL} (${pct(n, TOTAL)} %)`);
      ctx.rerender();
    }
    if (e.target.closest('[data-unmark]')) { setEstado('proceso'); toast(`Día ${d.dia} desmarcado.`); ctx.rerender(); }
    if (e.target.closest('[data-start]')) { setEstado('proceso'); toast('¡Adelante! Este desafío quedó en proceso.'); ctx.rerender(); }
  });
}
