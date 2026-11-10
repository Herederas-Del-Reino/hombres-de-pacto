import { categorias, tipos, recursos } from '../data/recursos.js';
import { devocionales } from '../data/devocionales.js';
import { desafios } from '../data/desafios.js';
import { store, desafiosCumplidos, altarCompletados } from '../utils/storage.js';
import { esc } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { pageHead } from '../components/Visuals.js';

export const meta = { title: 'Recursos y Enseñanzas' };

const tipoDe = (id) => tipos.find((t) => t.id === id) ?? tipos[0];
// Tonos de portada (alternan bronce, azul profundo, piedra y carbón)
const TONOS = ['bronce', 'azul', 'piedra', 'carbon'];

function resourceCard(r) {
  const t = tipoDe(r.tipo);
  return `<a class="resource" href="${esc(r.url)}" target="_blank" rel="noopener">
    <span class="resource__type">${icon(t.icono, { size: 18 })} ${esc(t.nombre)}</span>
    <span class="resource__title">${esc(r.titulo)}</span>
    ${r.descripcion ? `<span class="resource__desc">${esc(r.descripcion)}</span>` : ''}
    ${r.autor ? `<span class="resource__meta">${esc(r.autor)}</span>` : ''}
  </a>`;
}

/** Portada de libro por categoría; muestra sus recursos o un estado «Próximamente». */
function grid(filtro) {
  const cats = filtro === 'todas' ? categorias : categorias.filter((c) => c.id === filtro);
  return cats.map((c) => {
    const items = recursos.filter((r) => r.categoria === c.id);
    const tono = TONOS[categorias.indexOf(c) % TONOS.length];
    return `<article class="category book book--${tono} reveal is-in">
      <div class="book__cover">
        <span class="book__spine" aria-hidden="true"></span>
        <span class="category__icon">${icon(c.icono, { size: 28 })}</span>
        <h3 class="category__title">${esc(c.nombre)}</h3>
        <p class="category__text">${esc(c.texto)}</p>
        ${items.length ? `<span class="book__count">${items.length} ${items.length === 1 ? 'recurso' : 'recursos'}</span>` : '<span class="book__ribbon">Próximamente</span>'}
      </div>
      ${items.length ? `<div class="resource-list">${items.map(resourceCard).join('')}</div>` : ''}
    </article>`;
  }).join('');
}

function disponibles() {
  const s = store.get();
  const a = altarCompletados(s);
  const d = desafiosCumplidos(s);
  return `<section class="section section--ivory shelf-now" aria-labelledby="ya-disponible">
    <div class="container">
      <div class="split-head">
        <div>
          <p class="kicker reveal">Disponible ahora</p>
          <h2 id="ya-disponible" class="display reveal">Empieza a leer <span>hoy</span></h2>
        </div>
        <p class="split-head__aside reveal">Material de Hombres de Pacto que ya puedes recorrer, gratis y sin registro. Tu avance se guarda en este dispositivo.</p>
      </div>
      <div class="featured">
        <a class="feature feature--altar reveal" href="#/altar">
          <span class="feature__kicker">${icon('Flame', { size: 16 })} Devocional · 7 días</span>
          <span class="feature__title">Vuelve al Altar</span>
          <span class="feature__text">Un encuentro diario con Dios: lecturas, reflexión, oración y diario personal.</span>
          <span class="feature__meta">${a ? `${a} de 7 completados` : 'Comienza por el día 1'} ${icon('ArrowRight', { size: 16 })}</span>
        </a>
        <a class="feature feature--desafios reveal" href="#/desafios" style="--d:80ms">
          <span class="feature__kicker">${icon('Mountain', { size: 16 })} Plan práctico · 25 días</span>
          <span class="feature__title">El Camino de Pacto</span>
          <span class="feature__text">25 acciones concretas para transformar tu vida, con reconocimiento al finalizar.</span>
          <span class="feature__meta">${d ? `${d} de 25 cumplidos` : 'Empieza tu camino'} ${icon('ArrowRight', { size: 16 })}</span>
        </a>
      </div>
      <h3 class="shelf-title reveal">Lecturas de Vuelve al Altar</h3>
      <ol class="readings" aria-label="Los siete encuentros">
        ${devocionales.map((v) => `<li class="reveal" style="--d:${v.dia * 40}ms">
          <a class="reading-card ${s.altar[v.dia]?.completado ? 'is-done' : ''}" href="#/altar/${v.dia}">
            <span class="reading-card__num">${String(v.dia).padStart(2, '0')}</span>
            <span class="reading-card__title">${esc(v.tema)}</span>
            <span class="reading-card__refs">${esc(v.lecturas.join(' · '))}</span>
            ${s.altar[v.dia]?.completado ? `<span class="reading-card__done">${icon('Check', { size: 14 })} Leído</span>` : ''}
          </a>
        </li>`).join('')}
      </ol>
      <p class="fine reveal">${icon('Info', { size: 14 })} ${desafios.length} desafíos y ${devocionales.length} encuentros disponibles.</p>
    </div>
  </section>`;
}

export function render(main) {
  main.innerHTML = `
    ${pageHead({
      image: 'predicando-iglesia',
      scene: 'ember',
      index: 'VI',
      eyebrow: 'Biblioteca digital',
      title: 'Recursos y Enseñanzas',
      subtitle: 'Material para crecer en la fe, en el hogar y en el carácter.',
    })}
    ${disponibles()}
    <section class="section library" aria-labelledby="estanteria">
      <div class="container">
        <div class="split-head">
          <div>
            <p class="kicker reveal">La biblioteca</p>
            <h2 id="estanteria" class="display display--light reveal">Una estantería <span>en preparación</span></h2>
          </div>
          <p class="split-head__aside reveal">${recursos.length ? 'Explora los recursos oficiales por categoría.' : 'Aquí se publicarán los recursos oficiales del ministerio: enseñanzas, videos, documentos y material de estudio.'}</p>
        </div>
        <div class="types" aria-label="Tipos de recursos">
          ${tipos.map((t) => `<span class="type-chip">${icon(t.icono, { size: 18 })} ${esc(t.nombre)}</span>`).join('')}
        </div>
        <div class="filters" role="group" aria-label="Filtrar por categoría">
          <button type="button" class="chip is-active" data-filter="todas" aria-pressed="true">Todas</button>
          ${categorias.map((c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="false">${esc(c.nombre)}</button>`).join('')}
        </div>
        <div class="categories shelf" data-grid aria-live="polite">${grid('todas')}</div>
      </div>
    </section>`;

  main.querySelector('.filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    main.querySelectorAll('[data-filter]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
    main.querySelector('[data-grid]').innerHTML = grid(b.dataset.filter);
  });
}
