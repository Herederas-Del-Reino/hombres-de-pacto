import { devocionales } from '../data/devocionales.js';
import { store, altarCompletados } from '../utils/storage.js';
import { esc, debounce } from '../utils/dom.js';
import { bibleLink } from '../utils/bible.js';
import { icon } from '../components/Icons.js';
import { pageHead } from '../components/Visuals.js';
import { progressBar } from '../components/ProgressBar.js';
import { confirmar, toast } from '../components/Modal.js';

export const meta = { title: 'Vuelve al Altar' };

const TOTAL = devocionales.length;

function dayTabs(actual) {
  const s = store.get();
  return `<div class="day-tabs" role="tablist" aria-label="Días del recorrido">
    ${devocionales.map((d) => {
      const done = s.altar[d.dia]?.completado;
      return `<a role="tab" href="#/altar/${d.dia}" class="day-tab ${done ? 'is-done' : ''}" aria-selected="${d.dia === actual}" ${d.dia === actual ? 'aria-current="step"' : ''}>
        <span class="day-tab__label">Día</span><span class="day-tab__num">${d.dia}</span>
        ${done ? `<span class="day-tab__check">${icon('Check', { size: 14, stroke: 3 })}<span class="sr-only"> completado</span></span>` : ''}
      </a>`;
    }).join('')}
  </div>`;
}

function dayView(d) {
  const reg = store.get().altar[d.dia] ?? {};
  const prev = d.dia > 1 ? d.dia - 1 : null;
  const next = d.dia < TOTAL ? d.dia + 1 : null;
  return `<article class="altar-day" aria-labelledby="dia-titulo">
    <header class="altar-day__head">
      <p class="eyebrow">Día ${d.dia} de ${TOTAL}</p>
      <h2 id="dia-titulo" class="altar-day__title" tabindex="-1">${esc(d.tema)}</h2>
      ${d.frase ? `<p class="altar-day__frase">${esc(d.frase)}</p>` : ''}
    </header>

    <section class="altar-part" aria-labelledby="parte1">
      <h3 id="parte1" class="altar-part__title"><span>Parte 1</span> Mi encuentro con Dios</h3>
      <div class="altar-block">
        <h4 class="altar-block__label">${icon('BookOpen', { size: 18 })} Lecturas bíblicas</h4>
        <div class="bible-refs">${d.lecturas.map((r) => bibleLink(r)).join('')}</div>
        <p class="fine">Las lecturas se abren en Reina-Valera 1960.</p>
      </div>
      <div class="altar-block altar-block--reflection">
        <h4 class="altar-block__label">${icon('Flame', { size: 18 })} Reflexión</h4>
        <p class="reflection">${esc(d.reflexion)}</p>
      </div>
      <div class="altar-block">
        <h4 class="altar-block__label">${icon('Compass', { size: 18 })} Examen personal <span class="tag">Apoyo editorial</span></h4>
        <p class="question">${esc(d.pregunta)}</p>
      </div>
    </section>

    <section class="altar-part" aria-labelledby="parte2">
      <h3 id="parte2" class="altar-part__title"><span>Parte 2</span> Mi respuesta a Dios</h3>
      <div class="altar-block">
        <h4 class="altar-block__label">${icon('Footprints', { size: 18 })} Acción práctica <span class="tag">Apoyo editorial</span></h4>
        <p>${esc(d.accion)}</p>
      </div>
      <div class="altar-block altar-block--prayer">
        <h4 class="altar-block__label">${icon('HandHeart', { size: 18 })} Oración sugerida <span class="tag">Apoyo editorial</span></h4>
        <p class="prayer">${esc(d.oracion)}</p>
      </div>
      <div class="altar-block">
        <label class="altar-block__label" for="diario">${icon('PenLine', { size: 18 })} Mi diario personal</label>
        <textarea id="diario" class="journal" rows="6" placeholder="Escribe lo que Dios habló a tu corazón, lo que decides hacer o tu propia oración…">${esc(reg.diario ?? '')}</textarea>
        <p class="save-state" aria-live="polite" data-save-state>${reg.diario ? `${icon('Lock', { size: 14 })} Guardado en este dispositivo` : `${icon('Lock', { size: 14 })} Se guarda automáticamente solo en este dispositivo`}</p>
      </div>
      <div class="altar-complete">
        ${reg.completado
          ? `<p class="done-badge">${icon('CircleCheck', { size: 22 })} Encuentro completado</p>
             <button type="button" class="btn btn--ghost" data-repeat>${icon('RotateCcw', { size: 18 })} Repetir este encuentro</button>`
          : `<button type="button" class="btn btn--primary btn--lg" data-complete>${icon('Check', { size: 20 })} He completado mi encuentro</button>`}
      </div>
    </section>

    <p class="editorial-note">${icon('Info', { size: 16 })} Las preguntas, acciones y oraciones marcadas como «Apoyo editorial» son material complementario. No son citas bíblicas ni declaraciones oficiales del ministerio.</p>

    <nav class="pager" aria-label="Navegación entre días">
      ${prev ? `<a class="btn btn--ghost" href="#/altar/${prev}">${icon('ChevronLeft', { size: 18 })} Día ${prev}</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--ghost" href="#/altar/${next}">Día ${next} ${icon('ChevronRight', { size: 18 })}</a>` : `<a class="btn btn--ghost" href="#/desafios">Desafíos de Pacto ${icon('ChevronRight', { size: 18 })}</a>`}
    </nav>
  </article>`;
}

function finale() {
  return `<section class="finale reveal" aria-labelledby="fin-altar">
    <div class="finale__icon">${icon('Flame', { size: 40 })}</div>
    <h2 id="fin-altar" class="finale__title">Has completado los siete encuentros</h2>
    <p>Has vuelto al altar. Que este no sea un final, sino el comienzo de un hábito diario de buscar a Dios primero.</p>
    <p class="finale__strong">Antes de ser padre, esposo o líder, eres hijo de Dios.</p>
    <div class="finale__actions">
      <a class="btn btn--primary" href="#/desafios">${icon('Mountain', { size: 20 })} Continúa con los 25 Desafíos de Pacto</a>
      <button type="button" class="btn btn--ghost" data-reset-altar>${icon('RotateCcw', { size: 18 })} Comenzar de nuevo</button>
    </div>
  </section>`;
}

export function render(main, params, ctx) {
  const s = store.get();
  let dia = parseInt(params[0], 10);
  if (!(dia >= 1 && dia <= TOTAL)) dia = null;
  const actual = dia ?? s.altarUltimoDia ?? 1;
  const completados = altarCompletados(s);
  const d = devocionales.find((x) => x.dia === actual) ?? devocionales[0];
  store.update((st) => { st.altarUltimoDia = d.dia; });

  main.innerHTML = `
    ${pageHead({
      image: 'predicando-escenario-2',
      eyebrow: 'Hombres de Pacto',
      title: 'Vuelve al Altar',
      subtitle: 'Un encuentro diario con Dios',
      intro: `<p>Antes de ser padre, esposo o líder, eres hijo de Dios.</p><p>Aquí comienza un recorrido para fortalecer tus raíces espirituales y permitir que la Palabra transforme tu corazón.</p>`,
    })}
    <section class="section section--tight">
      <div class="container container--reading">
        <div class="journey-status">
          <div class="journey-status__text">
            <strong>${completados} de ${TOTAL} encuentros completados</strong>
            <span>${completados < TOTAL && !dia && s.altarUltimoDia > 1 ? 'Continúas donde lo dejaste.' : 'Puedes abrir cualquier día cuando quieras.'}</span>
          </div>
          ${progressBar(completados, TOTAL, { label: 'Encuentros completados' })}
        </div>
        ${dayTabs(d.dia)}
        ${completados === TOTAL ? finale() : ''}
        ${dayView(d)}
        <div class="data-actions">
          <button type="button" class="btn btn--text btn--sm" data-reset-altar>${icon('RotateCcw', { size: 16 })} Reiniciar mi recorrido del altar</button>
        </div>
      </div>
    </section>`;

  // Desplaza la pestaña activa a la vista en móvil
  main.querySelector('.day-tab[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  const ta = main.querySelector('#diario');
  const stateEl = main.querySelector('[data-save-state]');
  const save = debounce(() => {
    store.update((st) => {
      st.altar[d.dia] = { ...(st.altar[d.dia] ?? {}), diario: ta.value, fecha: new Date().toISOString() };
    });
    stateEl.innerHTML = `${icon('Lock', { size: 14 })} Guardado en este dispositivo`;
  }, 500);
  ta.addEventListener('input', () => { stateEl.textContent = 'Guardando…'; save(); });
  ta.addEventListener('blur', () => save.flush());

  main.addEventListener('click', async (e) => {
    if (e.target.closest('[data-complete]')) {
      save.flush();
      store.update((st) => { st.altar[d.dia] = { ...(st.altar[d.dia] ?? {}), completado: true, fecha: new Date().toISOString() }; });
      const total = altarCompletados();
      toast(total === TOTAL ? '¡Completaste los siete encuentros!' : `Día ${d.dia} completado. ¡Sigue adelante!`);
      const nextPending = devocionales.find((x) => !store.get().altar[x.dia]?.completado);
      ctx.go(total === TOTAL || !nextPending ? `#/altar/${d.dia}` : `#/altar/${nextPending.dia}`);
    }
    if (e.target.closest('[data-repeat]')) {
      store.update((st) => { st.altar[d.dia] = { ...(st.altar[d.dia] ?? {}), completado: false }; });
      toast('Puedes vivir este encuentro de nuevo. Tu diario se conserva.');
      ctx.go(`#/altar/${d.dia}`);
    }
    if (e.target.closest('[data-reset-altar]')) {
      const ok = await confirmar({
        title: '¿Reiniciar Vuelve al Altar?',
        text: 'Se borrarán de este dispositivo los encuentros marcados y lo escrito en tu diario. Esta acción no se puede deshacer.',
        confirmLabel: 'Sí, reiniciar', danger: true,
      });
      if (ok) { store.resetAltar(); toast('Tu recorrido del altar se reinició.'); ctx.go('#/altar/1'); }
    }
  });
}
