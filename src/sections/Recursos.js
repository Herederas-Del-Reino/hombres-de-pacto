import { categorias, tipos, recursos } from '../data/recursos.js';
import { esc } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { pageHead } from '../components/Visuals.js';

export const meta = { title: 'Recursos y Enseñanzas' };

const tipoDe = (id) => tipos.find((t) => t.id === id) ?? tipos[0];

function resourceCard(r) {
  const t = tipoDe(r.tipo);
  return `<a class="resource" href="${esc(r.url)}" target="_blank" rel="noopener">
    <span class="resource__type">${icon(t.icono, { size: 18 })} ${esc(t.nombre)}</span>
    <span class="resource__title">${esc(r.titulo)}</span>
    ${r.descripcion ? `<span class="resource__desc">${esc(r.descripcion)}</span>` : ''}
    ${r.autor ? `<span class="resource__meta">${esc(r.autor)}</span>` : ''}
  </a>`;
}

function grid(filtro) {
  const cats = filtro === 'todas' ? categorias : categorias.filter((c) => c.id === filtro);
  return cats.map((c) => {
    const items = recursos.filter((r) => r.categoria === c.id);
    return `<article class="category reveal is-in">
      <header class="category__head">
        <span class="category__icon">${icon(c.icono, { size: 26 })}</span>
        <div><h3 class="category__title">${esc(c.nombre)}</h3><p class="category__text">${esc(c.texto)}</p></div>
      </header>
      ${items.length
        ? `<div class="resource-list">${items.map(resourceCard).join('')}</div>`
        : `<p class="soon soon--block">${icon('Clock', { size: 16 })} Próximamente</p>`}
    </article>`;
  }).join('');
}

export function render(main) {
  main.innerHTML = `
    ${pageHead({
      image: 'predicando-iglesia',
      eyebrow: 'Biblioteca digital',
      title: 'Recursos y Enseñanzas',
      subtitle: 'Material para crecer en la fe, en el hogar y en el carácter.',
    })}
    <section class="section section--tight">
      <div class="container">
        ${recursos.length ? '' : `<div class="banner">${icon('Library', { size: 24 })}<p><strong>Estamos preparando la biblioteca.</strong> Muy pronto encontrarás aquí recursos oficiales del ministerio.</p></div>`}
        <div class="types" aria-label="Tipos de recursos">
          ${tipos.map((t) => `<span class="type-chip">${icon(t.icono, { size: 18 })} ${esc(t.nombre)}</span>`).join('')}
        </div>
        <div class="filters" role="group" aria-label="Filtrar por categoría">
          <button type="button" class="chip is-active" data-filter="todas" aria-pressed="true">Todas</button>
          ${categorias.map((c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="false">${esc(c.nombre)}</button>`).join('')}
        </div>
        <div class="categories" data-grid aria-live="polite">${grid('todas')}</div>
      </div>
    </section>`;

  main.querySelector('.filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    main.querySelectorAll('[data-filter]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
    main.querySelector('[data-grid]').innerHTML = grid(b.dataset.filter);
  });
}
