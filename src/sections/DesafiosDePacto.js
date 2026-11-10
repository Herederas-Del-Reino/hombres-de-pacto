/**
 * EL CAMINO DE PACTO — 25 días para transformar tu vida.
 * Un ascenso en 5 etapas (Valle → Cumbre) con 25 estaciones. Cada estación abre
 * la experiencia del día: Palabra, acción, reflexión personal y oración.
 */
import { desafios, etapas, etapaDe } from '../data/desafios.js';
import { store, desafiosCumplidos } from '../utils/storage.js';
import { esc, debounce, pct } from '../utils/dom.js';
import { bibleLink } from '../utils/bible.js';
import { icon } from '../components/Icons.js';
import { divider, ornaments } from '../components/Visuals.js';
import { scene } from '../components/Landscape.js';
import { progressBar } from '../components/ProgressBar.js';
import { confirmar, toast } from '../components/Modal.js';
import { descargarReconocimiento } from '../utils/pdf.js';

export const meta = { title: 'El Camino de Pacto' };
const TOTAL = desafios.length;
const ESTADOS = { pendiente: 'Pendiente', proceso: 'En proceso', cumplido: 'Completado' };
const estadoDe = (dia) => store.get().desafios[dia]?.estado ?? 'pendiente';
const corto = (t) => t.replace(/^El pacto (de la |del |de las |de )/, '').replace(/^./, (c) => c.toUpperCase());
let celebrar = null; // día recién conquistado (celebración discreta tras marcarlo)

function actual() {
  const s = store.get();
  return desafios.find((d) => s.desafios[d.dia]?.estado === 'proceso') ?? desafios.find((d) => s.desafios[d.dia]?.estado !== 'cumplido');
}

/* ---------------- Recorrido ---------------- */
function trailSvg(desde, hasta) {
  const xs = (k) => (k % 2 ? 74 : 26);
  const ys = (k) => 10 + k * 20;
  let d = `M50 0 C50 4 ${xs(0)} 4 ${xs(0)} ${ys(0)}`;
  const golds = [];
  for (let k = 1; k <= hasta - desde; k++) {
    const seg = `M${xs(k - 1)} ${ys(k - 1)} C${xs(k - 1)} ${ys(k - 1) + 10} ${xs(k)} ${ys(k) - 10} ${xs(k)} ${ys(k)}`;
    d += ` C${xs(k - 1)} ${ys(k - 1) + 10} ${xs(k)} ${ys(k) - 10} ${xs(k)} ${ys(k)}`;
    if (estadoDe(desde + k - 1) === 'cumplido' && estadoDe(desde + k) === 'cumplido') golds.push(seg);
  }
  d += ` C${xs(hasta - desde)} 96 50 96 50 100`;
  return `<svg class="estaciones__trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="${d}" class="trail-base"/>
    ${golds.map((g) => `<path d="${g}" class="trail-gold"/>`).join('')}
  </svg>`;
}

function stationItem(d, k, cur) {
  const est = estadoDe(d.dia);
  const here = cur && cur.dia === d.dia;
  return `<li class="station station--${est} ${k % 2 ? 'station--right' : 'station--left'} ${here ? 'is-current' : ''}">
    <a class="station__card" href="#/desafios/${d.dia}" aria-label="Día ${d.dia}: ${esc(d.titulo)}. Estado: ${ESTADOS[est]}${here ? '. Estás aquí' : ''}">
      <span class="station__node">${est === 'cumplido' ? icon('Check', { size: 22, stroke: 2.6 }) : `<span>${d.dia}</span>`}</span>
      <span class="station__body">
        <span class="station__day">Día ${d.dia}${here ? ' · <b>Estás aquí</b>' : ''}</span>
        <span class="station__title">${esc(corto(d.titulo))}</span>
        <span class="station__meta">${icon(d.icono, { size: 16 })} ${d.versiculo ? esc(d.versiculo) : 'Día de oración'}</span>
      </span>
      <span class="station__state">${ESTADOS[est]}</span>
    </a>
  </li>`;
}

function etapaView(e, cur) {
  const items = desafios.filter((d) => d.dia >= e.desde && d.dia <= e.hasta);
  const hechos = items.filter((d) => estadoDe(d.dia) === 'cumplido').length;
  const completa = hechos === items.length;
  return `<section class="etapa etapa--${e.n} ${completa ? 'is-complete' : ''}" aria-labelledby="etapa-${e.n}">
    <div class="etapa__banner">
      ${scene(e.escena, { className: 'etapa__scene', parallax: 0.18 })}
      <div class="etapa__shade" aria-hidden="true"></div>
      <div class="container etapa__head reveal">
        <p class="etapa__num">Etapa ${e.n} de ${etapas.length} · Días ${e.desde}–${e.hasta}</p>
        <h2 id="etapa-${e.n}" class="etapa__title">${e.nombre} <span>${e.tema}</span></h2>
        <p class="etapa__text">${e.texto}</p>
        <p class="etapa__count">${completa ? `${icon('Award', { size: 18 })} Etapa conquistada` : `${hechos} de ${items.length} estaciones`}</p>
      </div>
    </div>
    <div class="container estaciones-wrap">
      ${trailSvg(e.desde, e.hasta)}
      <ol class="estaciones" start="${e.desde}">${items.map((d, k) => stationItem(d, k, cur)).join('')}</ol>
    </div>
  </section>`;
}

function pathView() {
  const n = desafiosCumplidos();
  const cur = actual();
  const etapaActual = cur ? etapaDe(cur.dia) : etapas.at(-1);
  return `
  <header class="camino-hero">
    ${scene(etapaActual.escena, { className: 'camino-hero__scene', eager: true, parallax: 0.3 })}
    <div class="camino-hero__shade" aria-hidden="true"></div>
    ${ornaments()}
    <div class="container camino-hero__inner reveal">
      <p class="ph__eyebrow">Hombres de Pacto</p>
      <h1 id="page-title" class="camino-hero__title" tabindex="-1"><span class="sr-only">Desafíos de Pacto: </span>El Camino <span>de Pacto</span></h1>
      <p class="camino-hero__sub">25 días para transformar tu vida</p>
      <div class="camino-hero__intro">
        <p>Este apartado ha sido creado para que cada hombre tenga un desafío nuevo cada día.</p>
        <p>No serán simplemente frases motivacionales: serán acciones concretas que deberá llevar a la práctica para que su vida sea transformada y pueda avanzar en el propósito de Dios.</p>
        <p class="camino-hero__motto">25 días. 25 decisiones. Un compromiso de transformación.</p>
      </div>
    </div>
  </header>

  <section class="ascenso" aria-labelledby="mi-camino-titulo">
    <div class="container ascenso__inner">
      <div class="path-progress">
        <div class="ascenso__stat">
          <span class="ascenso__big" data-count="${n}">${n}</span><span class="ascenso__of">/ ${TOTAL}</span>
        </div>
        <div class="path-progress__text">
          <h2 id="mi-camino-titulo" class="path-progress__title">Mi camino de pacto</h2>
          <p class="path-progress__count" aria-live="polite"><strong>${n} de ${TOTAL}</strong> desafíos completados — <strong>${pct(n, TOTAL)} %</strong></p>
          <div class="ascenso__bar">
            ${progressBar(n, TOTAL, { label: 'Desafíos completados' })}
            <ol class="ascenso__ticks" aria-hidden="true">${etapas.map((e) => `<li class="${n >= e.hasta ? 'is-done' : cur && etapaDe(cur.dia).n === e.n ? 'is-here' : ''}"><span>${e.nombre}</span></li>`).join('')}</ol>
          </div>
        </div>
      </div>
      ${n === TOTAL
        ? `<a class="continue-card continue-card--summit" href="#/desafios/final"><span class="continue-card__label">${icon('Award', { size: 16 })} Cumbre alcanzada</span><span class="continue-card__title">Descarga tu reconocimiento personal</span><span class="continue-card__go">${icon('ArrowRight', { size: 20 })}</span></a>`
        : cur ? `<a class="continue-card" href="#/desafios/${cur.dia}">
            <span class="continue-card__label">${n ? 'Tu siguiente paso' : 'Comienza hoy'} · ${etapaDe(cur.dia).nombre}</span>
            <span class="continue-card__title">Día ${cur.dia} · ${esc(cur.titulo)}</span>
            <span class="continue-card__text">${esc(cur.accion)}</span>
            <span class="continue-card__go">${icon('ArrowRight', { size: 22 })}</span>
          </a>` : ''}
    </div>
  </section>

  <div class="camino" aria-label="Las 25 estaciones del camino">
    ${etapas.map((e) => etapaView(e, cur)).join('')}
    <section class="cima" aria-label="La cima">
      <div class="container cima__inner reveal">
        <span class="cima__flag">${icon('Award', { size: 34 })}</span>
        <p class="cima__title">${n === TOTAL ? '¡Has llegado a la cima!' : 'La cima te espera'}</p>
        <p>${n === TOTAL ? 'El verdadero pacto se vive cada día.' : `Te faltan ${TOTAL - n} ${TOTAL - n === 1 ? 'estación' : 'estaciones'}. Al completar las 25 recibirás tu reconocimiento personal.`}</p>
        ${n === TOTAL ? `<a class="btn btn--primary" href="#/desafios/final">${icon('Download', { size: 18 })} Mi reconocimiento</a>` : ''}
      </div>
    </section>
  </div>

  <section class="section section--sand camino-data">
    <div class="container data-actions">
      <p class="fine">${icon('Lock', { size: 14 })} Tu progreso se guarda automáticamente en este dispositivo y no se sincroniza con otros equipos. No necesitas cuenta.</p>
      <button type="button" class="btn btn--text btn--sm" data-reset>${icon('RotateCcw', { size: 16 })} Reiniciar mis desafíos</button>
    </div>
  </section>`;
}

/* ---------------- Experiencia del día ---------------- */
function detailView(d) {
  const reg = store.get().desafios[d.dia] ?? {};
  const est = reg.estado ?? 'pendiente';
  const prev = desafios.find((x) => x.dia === d.dia - 1);
  const next = desafios.find((x) => x.dia === d.dia + 1);
  const n = desafiosCumplidos();
  const e = etapaDe(d.dia);
  const fiesta = celebrar === d.dia && est === 'cumplido';
  let paso = 0;
  const num = () => String(++paso).padStart(2, '0');
  return `
  <header class="dia-hero">
    ${scene(e.escena, { className: 'dia-hero__scene', eager: true, parallax: 0.25 })}
    <div class="dia-hero__shade" aria-hidden="true"></div>
    <div class="container container--reading dia-hero__inner">
      <nav class="crumbs" aria-label="Ruta">
        <a href="#/desafios">${icon('ChevronLeft', { size: 18 })} El Camino de Pacto</a>
        <span class="crumbs__count">${n} de ${TOTAL} · ${pct(n, TOTAL)} %</span>
      </nav>
      ${progressBar(n, TOTAL, { label: 'Desafíos completados', className: 'progress--thin' })}
      <div class="dia-hero__title-wrap">
        <span class="dia-hero__num" aria-hidden="true">${String(d.dia).padStart(2, '0')}</span>
        <div>
          <p class="dia-hero__etapa">${icon(d.icono, { size: 18 })} Etapa ${e.n} · ${e.nombre} · Día ${d.dia} de ${TOTAL}</p>
          <h1 id="page-title" class="challenge__title" tabindex="-1">${esc(d.titulo)}</h1>
          <span class="status-pill status-pill--${est}">${ESTADOS[est]}</span>
        </div>
      </div>
    </div>
  </header>

  <section class="section section--ivory dia-body">
    <div class="container container--reading">
      ${fiesta ? `<div class="conquista" role="status">
        <span class="conquista__sparks" aria-hidden="true">${'<i></i>'.repeat(14)}</span>
        <span class="conquista__badge">${icon('Award', { size: 30 })}</span>
        <p class="conquista__title">¡Día ${d.dia} conquistado!</p>
        <p class="conquista__text">${n} de ${TOTAL} estaciones en tu camino de pacto.</p>
        ${next ? `<a class="btn btn--primary" href="#/desafios/${next.dia}">Siguiente: ${esc(corto(next.titulo))} ${icon('ArrowRight', { size: 18 })}</a>` : ''}
      </div>` : ''}

      <article class="challenge challenge--${est}" aria-labelledby="page-title">
        <span class="challenge__watermark" aria-hidden="true">${String(d.dia).padStart(2, '0')}</span>
        ${d.versiculo ? `<div class="challenge__block">
          <h2 class="challenge__label"><span class="step">${num()}</span> La Palabra</h2>
          <div class="bible-refs">${bibleLink(d.versiculo)}</div>
          <p class="fine">Abre la lectura en Reina-Valera 1960 y medítala antes de actuar.</p>
        </div>` : ''}
        <div class="challenge__block">
          <h2 class="challenge__label"><span class="step">${num()}</span> Acción del día</h2>
          <p class="challenge__action">${esc(d.accion)}</p>
          ${d.alternativa ? `<p class="challenge__alt">${esc(d.alternativa)}</p>` : ''}
        </div>
        <div class="challenge__block">
          <label class="challenge__label" for="nota"><span class="step">${num()}</span> Mi reflexión <span class="tag">Opcional</span></label>
          <textarea id="nota" class="journal" rows="5" placeholder="¿Qué aprendiste? ¿Qué cambió en ti o en tu familia al vivir este pacto?">${esc(reg.nota ?? '')}</textarea>
          <p class="save-state" aria-live="polite" data-save-state>${icon('Lock', { size: 14 })} Se guarda automáticamente solo en este dispositivo</p>
        </div>
        <div class="challenge__block challenge__block--prayer">
          <h2 class="challenge__label"><span class="step">${num()}</span> Oración <span class="tag">Apoyo editorial</span></h2>
          <p class="challenge__prayer">${esc(d.oracion)}</p>
        </div>
        <div class="challenge__actions">
          ${est === 'cumplido'
            ? `<p class="done-badge">${icon('CircleCheck', { size: 22 })} Desafío cumplido</p>
               <button type="button" class="btn btn--ghost" data-unmark>${icon('RotateCcw', { size: 18 })} Desmarcar</button>`
            : `<button type="button" class="btn btn--primary btn--lg" data-mark>${icon('Check', { size: 20 })} Marcar como cumplido</button>
               ${est === 'pendiente' ? `<button type="button" class="btn btn--ghost" data-start>${icon('CircleDot', { size: 18 })} Lo estoy haciendo</button>` : ''}`}
        </div>
      </article>
      <p class="editorial-note">${icon('Info', { size: 16 })} La oración es material de apoyo editorial; no es una cita bíblica ni una declaración oficial del ministerio.</p>

      <nav class="pager pager--rich" aria-label="Navegación entre desafíos">
        ${prev ? `<a class="pager__link" href="#/desafios/${prev.dia}">${icon('ChevronLeft', { size: 18 })}<span><small>Día ${prev.dia}</small>${esc(corto(prev.titulo))}</span></a>` : '<span></span>'}
        ${next ? `<a class="pager__link pager__link--next" href="#/desafios/${next.dia}"><span><small>Día ${next.dia}</small>${esc(corto(next.titulo))}</span>${icon('ChevronRight', { size: 18 })}</a>` : '<span></span>'}
      </nav>
    </div>
  </section>`;
}

/* ---------------- Cumbre: reconocimiento ---------------- */
function finalView() {
  const n = desafiosCumplidos();
  if (n < TOTAL) {
    return `<section class="section section--ivory"><div class="container container--reading finale">
      <h1 id="page-title" class="finale__title" tabindex="-1">Tu reconocimiento te espera</h1>
      <p>Llevas ${n} de ${TOTAL} desafíos. Cuando completes los 25, aquí podrás descargar tu reconocimiento personal.</p>
      <a class="btn btn--primary" href="#/desafios">Volver a mi camino</a></div></section>`;
  }
  return `<section class="celebration">
    ${scene('etapa-5-cumbre', { className: 'celebration__scene', eager: true })}
    <div class="celebration__glow" aria-hidden="true"></div>
    ${ornaments({ count: 22 })}
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
    // Lleva la estación actual a la vista si el usuario ya avanzó
    const cur = main.querySelector('.station.is-current');
    if (cur && desafiosCumplidos() > 0 && !ctx.keepScroll) {
      setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 650);
    }
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
  celebrar = null;
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
      celebrar = d.dia;
      ctx.rerender();
    }
    if (e.target.closest('[data-unmark]')) { setEstado('proceso'); toast(`Día ${d.dia} desmarcado.`); ctx.rerender(); }
    if (e.target.closest('[data-start]')) { setEstado('proceso'); toast('¡Adelante! Este desafío quedó en proceso.'); ctx.rerender(); }
  });
}
