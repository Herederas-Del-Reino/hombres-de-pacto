import { asset, picture } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { mountains, divider } from '../components/Visuals.js';
import { nextMeetingCard, countrySelector, bindCountrySelector, startCountdowns } from '../components/Schedule.js';
import { store, desafiosCumplidos, altarCompletados } from '../utils/storage.js';
import { progressBar } from '../components/ProgressBar.js';

export const meta = { title: 'Inicio' };

const accesos = [
  { href: '#/altar', titulo: 'Vuelve al Altar', texto: 'Un encuentro diario con Dios en siete días.', img: 'predicando-escenario-2', icono: 'Flame' },
  { href: '#/desafios', titulo: 'Desafíos de Pacto', texto: '25 días. 25 decisiones. Un compromiso de transformación.', img: 'evangelismo-calle', icono: 'Mountain' },
  { href: '#/encuentros', titulo: 'Nuestros Encuentros', texto: 'Devocional de madrugada y Salmos, en tu hora local.', img: 'adoracion', icono: 'Calendar' },
  { href: '#/pastor', titulo: 'Conoce al Pastor', texto: 'Oscar Amarales: una vida de fe, familia y servicio.', img: 'pastor-retrato', icono: 'BookOpen' },
];

function progresoPersonal() {
  const s = store.get();
  const d = desafiosCumplidos(s);
  const a = altarCompletados(s);
  if (!d && !a) return '';
  return `<section class="section section--tight" aria-labelledby="mi-camino">
    <div class="container">
      <div class="my-progress reveal">
        <h2 id="mi-camino" class="h3">Tu camino continúa</h2>
        <div class="my-progress__grid">
          <a class="my-progress__item" href="#/altar">
            <span>${icon('Flame', { size: 20 })} Vuelve al Altar</span>
            <strong>${a} de 7 encuentros</strong>
            ${progressBar(a, 7, { label: 'Encuentros completados' })}
          </a>
          <a class="my-progress__item" href="#/desafios">
            <span>${icon('Mountain', { size: 20 })} Desafíos de Pacto</span>
            <strong>${d} de 25 desafíos</strong>
            ${progressBar(d, 25, { label: 'Desafíos completados' })}
          </a>
        </div>
      </div>
    </div>
  </section>`;
}

export function render(main) {
  main.innerHTML = `
  <section class="hero" aria-labelledby="page-title">
    <div class="hero__sky" aria-hidden="true"></div>
    ${mountains({ className: 'hero__mountains' })}
    <div class="hero__inner container">
      <img class="hero__logo" src="${asset('images/logo.webp')}" alt="Logo oficial de Hombres de Pacto: yelmo, espada, montañas, escudo y Biblia abierta" width="670" height="705" fetchpriority="high" />
      <h1 id="page-title" class="hero__title" tabindex="-1"><span>Hombres de</span> Pacto</h1>
      <p class="hero__lema">Hombres restaurados, comprometidos con Dios y sus familias.</p>
      <p class="hero__frase">No solamente lo declaramos. <em>Lo vivimos.</em></p>
      <div class="hero__ctas">
        <a class="btn btn--primary btn--lg" href="#/altar">${icon('Flame', { size: 20 })} Comienza tu encuentro con Dios</a>
        <a class="btn btn--outline btn--lg" href="#/desafios">${icon('Mountain', { size: 20 })} Inicia tus 25 desafíos</a>
        <a class="btn btn--text btn--lg" href="#/comunidad">Conoce nuestra comunidad ${icon('ArrowRight', { size: 18 })}</a>
      </div>
      <blockquote class="hero__verse">
        <p>«Pero yo y mi casa serviremos a Jehová».</p>
        <cite>Josué 24:15</cite>
      </blockquote>
    </div>
  </section>

  ${progresoPersonal()}

  <section class="section welcome" aria-labelledby="bienvenida">
    <div class="container welcome__grid">
      <div class="welcome__head reveal">
        <p class="eyebrow">Bienvenida oficial</p>
        <h2 id="bienvenida" class="h2">Bienvenido a Hombres de Pacto</h2>
        ${divider('divider--left')}
        <p class="lead">No estás aquí por casualidad. Estás aquí porque creemos que Dios sigue levantando hombres dispuestos a ser transformados desde adentro.</p>
      </div>
      <div class="welcome__body reading">
        <p class="reveal">Hombres que entienden que la verdadera fortaleza no está en imponer su autoridad, sino en aprender a amar, servir, proteger, cuidar y permanecer fieles a Dios.</p>
        <p class="reveal">Esta comunidad nace con una convicción: necesitamos hombres que vuelvan al altar, que restauren su relación con Dios, que asuman su responsabilidad en el hogar y que comprendan el valor de su llamado.</p>
        <p class="pullquote reveal">Aquí no buscamos hombres perfectos, buscamos hombres dispuestos a rendir su corazón a Dios y permitir que Él transforme su carácter.</p>
        <p class="reveal">Queremos verte crecer como hijo de Dios, como esposo, como padre, como hermano y como hombre de propósito.</p>
        <p class="reveal">Nuestro compromiso es vivir lo que creemos, amar como Cristo nos enseñó y dejar una herencia de fe a las próximas generaciones.</p>
        <p class="welcome__family reveal">Bienvenido a esta familia.</p>
        <p class="welcome__sign reveal"><strong>Somos Hombres de Pacto.</strong> No solamente lo declaramos, lo vivimos.</p>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="accesos">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Tu camino comienza aquí</p>
        <h2 id="accesos" class="h2">Accesos principales</h2>
      </div>
      <div class="access-grid">
        ${accesos.map((a) => `
          <a class="access-card reveal" href="${a.href}">
            ${picture(a.img, '', { className: 'access-card__img', sizes: '(max-width: 700px) 100vw, 25vw' })}
            <span class="access-card__shade" aria-hidden="true"></span>
            <span class="access-card__content">
              <span class="access-card__icon">${icon(a.icono, { size: 22 })}</span>
              <span class="access-card__title">${a.titulo}</span>
              <span class="access-card__text">${a.texto}</span>
              <span class="access-card__go">Entrar ${icon('ArrowRight', { size: 16 })}</span>
            </span>
          </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="proximo">
    <div class="container next-wrap">
      <div class="reveal">
        <p class="eyebrow">Nuestros encuentros</p>
        <h2 id="proximo" class="h2">Te esperamos en el próximo encuentro</h2>
        <p class="muted">Calculado automáticamente según tu país, incluido el horario de verano de España.</p>
        <div data-country>${countrySelector({ id: 'pais-inicio' })}</div>
      </div>
      <div class="reveal" data-next>${nextMeetingCard({ compact: true })}</div>
    </div>
  </section>

  <section class="section section--cta" aria-labelledby="cta-oracion">
    <div class="container cta-band reveal">
      <div>
        <h2 id="cta-oracion" class="h3">No camines solo</h2>
        <p>Queremos acompañarte en oración. Comparte tu petición con nosotros.</p>
      </div>
      <a class="btn btn--primary" href="#/oracion">${icon('HandHeart', { size: 20 })} Enviar mi petición</a>
    </div>
  </section>`;

  const refresh = () => { main.querySelector('[data-next]').innerHTML = nextMeetingCard({ compact: true }); };
  bindCountrySelector(main, refresh);
  return startCountdowns(main, refresh);
}
