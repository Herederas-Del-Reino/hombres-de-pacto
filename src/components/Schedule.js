/** Selector de país y tarjeta de "próximo encuentro", compartidos por Inicio y Encuentros. */
import { encuentros, paises } from '../data/encuentros.js';
import { proximoEncuentro, formatear, zonaLocal, cuentaRegresiva, ZONA_BASE, hora12 } from '../utils/timezones.js';
import { store } from '../utils/storage.js';
import { flags } from './Visuals.js';
import { icon } from './Icons.js';
import { esc } from '../utils/dom.js';

export function opcionesPais() {
  const local = zonaLocal();
  const opts = paises.map((p) => ({ ...p }));
  if (!paises.some((p) => p.zona === local)) {
    opts.push({ id: 'LOCAL', nombre: 'Mi hora local', zona: local, nota: local.replace(/_/g, ' ') });
  }
  return opts;
}

/** País seleccionado (guardado) o detectado por la zona horaria del dispositivo. */
export function paisActual() {
  const opts = opcionesPais();
  const saved = store.get().pais;
  const found = opts.find((o) => o.id === saved);
  if (found) return found;
  const local = zonaLocal();
  return opts.find((o) => o.zona === local) ?? opts.find((o) => o.id === 'LOCAL') ?? opts[0];
}

export function countrySelector({ id = 'pais' } = {}) {
  const actual = paisActual();
  return `<fieldset class="country">
    <legend class="country__legend">${icon('Globe', { size: 18 })} Ver horarios en</legend>
    <div class="country__opts">
      ${opcionesPais().map((o) => `
        <label class="country__opt">
          <input type="radio" name="${id}" value="${o.id}" ${o.id === actual.id ? 'checked' : ''} />
          <span>${flags[o.id] ?? flags.LOCAL}<span class="country__name">${esc(o.nombre)}</span></span>
        </label>`).join('')}
    </div>
  </fieldset>`;
}

export function bindCountrySelector(root, onChange) {
  root.querySelectorAll('.country input').forEach((input) => input.addEventListener('change', () => {
    store.update((s) => { s.pais = input.value; });
    onChange?.(paisActual());
  }));
}

export function siguienteEncuentroInfo(now = new Date()) {
  const pais = paisActual();
  const next = proximoEncuentro(encuentros, now);
  if (!next) return null;
  const local = formatear(next.fecha, pais.zona);
  const espana = formatear(next.fecha, ZONA_BASE);
  const ms = next.fecha - now;
  const enCurso = ms <= 0;
  return { pais, next, local, espana, ms, enCurso };
}

function relativo(info, now = new Date()) {
  const { local, pais } = info;
  const hoy = formatear(now, pais.zona).parts;
  const manana = formatear(new Date(now.getTime() + 864e5), pais.zona).parts;
  const same = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day;
  if (same(local.parts, hoy)) return 'Hoy';
  if (same(local.parts, manana)) return 'Mañana';
  return local.dia.charAt(0).toUpperCase() + local.dia.slice(1);
}

export function countdownText(ms) {
  const c = cuentaRegresiva(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return c.d > 0 ? `${c.d} d ${pad(c.h)} h ${pad(c.m)} min` : `${pad(c.h)}:${pad(c.m)}:${pad(c.s)}`;
}

/** Tarjeta dinámica del próximo encuentro. */
export function nextMeetingCard({ compact = false } = {}) {
  const info = siguienteEncuentroInfo();
  if (!info) return '';
  const { next, local, espana, pais, enCurso } = info;
  const e = next.encuentro;
  return `<article class="next-card ${compact ? 'next-card--compact' : ''}" aria-labelledby="next-title">
    <div class="next-card__icon">${icon(e.icono, { size: 30 })}</div>
    <div class="next-card__body">
      <p class="next-card__eyebrow">${enCurso ? 'Encuentro programado ahora' : 'Próximo encuentro'}</p>
      <h3 id="next-title" class="next-card__title">${esc(e.nombre)}</h3>
      <p class="next-card__when"><strong>${relativo(info)}</strong> · ${esc(local.fecha)} · <strong>${local.hora}</strong></p>
      <p class="next-card__zone">${flags[pais.id] ?? flags.LOCAL} ${esc(pais.nombre)}${pais.id !== 'ES' ? ` · En España: ${espana.dia} ${espana.hora}` : ''}</p>
      ${enCurso ? '' : `<p class="next-card__count" aria-live="off">Comienza en <span data-countdown="${next.fecha.getTime()}">${countdownText(info.ms)}</span></p>`}
    </div>
    ${compact ? `<a class="btn btn--ghost btn--sm next-card__cta" href="#/encuentros">Ver horarios ${icon('ArrowRight', { size: 16 })}</a>` : ''}
  </article>`;
}

/** Actualiza cada segundo los contadores visibles. Devuelve función de limpieza. */
export function startCountdowns(root, onElapsed) {
  const timer = setInterval(() => {
    root.querySelectorAll('[data-countdown]').forEach((el) => {
      const ms = +el.dataset.countdown - Date.now();
      if (ms <= 0) { onElapsed?.(); return; }
      el.textContent = countdownText(ms);
    });
  }, 1000);
  return () => clearInterval(timer);
}

export const horaBase = (e) => hora12(e.hora, e.minuto);
