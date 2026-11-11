import { asset, picture, esc } from '../utils/dom.js';
import { icon } from '../components/Icons.js';
import { ornaments, goldRule } from '../components/Visuals.js';
import { scene } from '../components/Landscape.js';
import { nextMeetingCard, countrySelector, bindCountrySelector, startCountdowns } from '../components/Schedule.js';
import { store, desafiosCumplidos, altarCompletados } from '../utils/storage.js';
import { devocionales } from '../data/devocionales.js';
import { pastor } from '../data/pastor.js';

export const meta = { title: 'Inicio' };

function progresoPersonal() {
  const s = store.get();
  const d = desafiosCumplidos(s);
  const a = altarCompletados(s);
  if (!d && !a) return '';
  return `<section class="resume" aria-labelledby="mi-camino">
    <div class="container resume__inner">
      <h2 id="mi-camino" class="resume__title">Tu camino continúa</h2>
      <a class="resume__item" href="#/altar"><span class="resume__num">${a}<small>/7</small></span><span>Encuentros en<br/>Vuelve al Altar</span></a>
      <a class="resume__item" href="#/desafios"><span class="resume__num">${d}<small>/25</small></span><span>Desafíos de<br/>Pacto cumplidos</span></a>
    </div>
  </section>`;
}

export function render(main) {
  const s = store.get();
  const hecho = desafiosCumplidos(s);
  const sigAltar = devocionales.find((d) => !s.altar[d.dia]?.completado) ?? devocionales[0];

  main.innerHTML = `
  <section class="hero3" aria-labelledby="page-title">
    ${scene('amanecer', { className: 'hero3__scene', eager: true, parallax: 0.35 })}
    <div class="hero3__veil" aria-hidden="true"></div>
    ${ornaments()}
    <div class="container hero3__grid">
      <div class="hero3__mark">
        <img class="hero3__logo" src="${asset('images/logo.webp')}" alt="Logo oficial de Hombres de Pacto: yelmo, espada, montañas, escudo y Biblia abierta" width="670" height="705" fetchpriority="high" />
      </div>
      <div class="hero3__copy">
        <p class="hero3__kicker"><span></span>Comunidad de hombres de fe</p>
        <h1 id="page-title" class="hero3__title" tabindex="-1"><span class="hero3__pre">Hombres de</span> Pacto</h1>
        <p class="hero3__lema">Hombres restaurados, comprometidos con Dios y sus familias.</p>
        <p class="hero3__frase">No solamente lo declaramos. <em>Lo vivimos.</em></p>
        <div class="hero3__ctas">
          <a class="btn btn--primary btn--lg" href="#/altar">${icon('Flame', { size: 20 })} Comienza tu encuentro con Dios</a>
          <a class="btn btn--outline btn--lg" href="#/desafios">${icon('Mountain', { size: 20 })} Inicia tus 25 desafíos</a>
          <a class="link-arrow" href="#/comunidad">Conoce nuestra comunidad ${icon('ArrowRight', { size: 18 })}</a>
        </div>
      </div>
    </div>
    <blockquote class="hero3__verse">
      <p>«Pero yo y mi casa serviremos a Jehová».</p>
      <cite>Josué 24:15</cite>
    </blockquote>
    <a class="hero3__scroll" href="#bienvenida" aria-label="Ir a la bienvenida">${icon('ChevronRight', { size: 22 })}</a>
  </section>

  ${progresoPersonal()}

  <section class="section section--ivory welcome3" aria-labelledby="bienvenida">
    <div class="container welcome3__grid">
      <div class="welcome3__text">
        <p class="kicker reveal">Bienvenida oficial</p>
        <h2 id="bienvenida" class="display reveal">Bienvenido a <span>Hombres de Pacto</span></h2>
        <p class="lead dropcap reveal">No estás aquí por casualidad. Estás aquí porque creemos que Dios sigue levantando hombres dispuestos a ser transformados desde adentro.</p>
        <div class="columns reveal">
          <p>Hombres que entienden que la verdadera fortaleza no está en imponer su autoridad, sino en aprender a amar, servir, proteger, cuidar y permanecer fieles a Dios.</p>
          <p>Esta comunidad nace con una convicción: necesitamos hombres que vuelvan al altar, que restauren su relación con Dios, que asuman su responsabilidad en el hogar y que comprendan el valor de su llamado.</p>
        </div>
        <blockquote class="quote-xl reveal"><p>Aquí no buscamos hombres perfectos, buscamos hombres dispuestos a rendir su corazón a Dios y permitir que Él transforme su carácter.</p></blockquote>
        <div class="columns reveal">
          <p>Queremos verte crecer como hijo de Dios, como esposo, como padre, como hermano y como hombre de propósito.</p>
          <p>Nuestro compromiso es vivir lo que creemos, amar como Cristo nos enseñó y dejar una herencia de fe a las próximas generaciones.</p>
        </div>
        <p class="welcome3__family reveal">Bienvenido a esta familia.</p>
        <p class="welcome3__sign reveal"><strong>Somos Hombres de Pacto.</strong> No solamente lo declaramos, lo vivimos.</p>
      </div>
      <div class="collage reveal" aria-label="Fotografías del ministerio">
        <figure class="collage__a">${picture('adoracion', 'Hombres y mujeres en adoración durante un servicio', { sizes: '(max-width: 900px) 80vw, 30vw' })}</figure>
        <figure class="collage__b">${picture('oracion-equipo', 'El equipo ora por dos jóvenes sentados frente a un local', { sizes: '(max-width: 900px) 60vw, 22vw' })}</figure>
        <p class="collage__caption">Fe que se vive en comunidad</p>
      </div>
    </div>
  </section>

  <section class="section paths" aria-labelledby="caminos">
    <div class="container">
      <div class="paths__head">
        <p class="kicker reveal">Tu camino comienza aquí</p>
        <h2 id="caminos" class="display display--light reveal">Cuatro puertas para<br/><span>caminar con Dios</span></h2>
      </div>
      <div class="bento">
        <a class="tile tile--altar reveal" href="#/altar">
          ${picture('predicando-escenario-2', '', { className: 'tile__img', sizes: '(max-width: 760px) 100vw, 40vw' })}
          <span class="tile__shade" aria-hidden="true"></span>
          <span class="tile__body">
            <span class="tile__tag">${icon('Flame', { size: 16 })} 7 encuentros</span>
            <span class="tile__title">Vuelve al Altar</span>
            <span class="tile__text">Un encuentro diario con Dios. Hoy te espera: <em>${esc(sigAltar.tema)}</em>.</span>
            <span class="tile__go">Entrar ${icon('ArrowRight', { size: 16 })}</span>
          </span>
        </a>
        <a class="tile tile--desafios reveal" href="#/desafios" style="--d:80ms">
          ${scene('etapa-3-ladera', { className: 'tile__scene', parallax: 0.12 })}
          <span class="tile__shade" aria-hidden="true"></span>
          <span class="tile__body">
            <span class="tile__tag">${icon('Mountain', { size: 16 })} 25 días · 5 etapas</span>
            <span class="tile__title">El Camino de Pacto</span>
            <span class="tile__text">${hecho ? `Llevas <strong>${hecho} de 25</strong> estaciones. Sigue subiendo.` : 'Del valle a la cumbre: 25 desafíos para transformar tu vida.'}</span>
            <span class="tile__meter" aria-hidden="true"><span style="width:${Math.round((hecho / 25) * 100)}%"></span></span>
            <span class="tile__go">${hecho ? 'Continuar mi camino' : 'Iniciar el camino'} ${icon('ArrowRight', { size: 16 })}</span>
          </span>
        </a>
        <a class="tile tile--encuentros reveal" href="#/encuentros" style="--d:160ms">
          ${scene('crepusculo', { className: 'tile__scene', parallax: 0.12 })}
          <span class="tile__body">
            <span class="tile__tag">${icon('Calendar', { size: 16 })} Cada semana</span>
            <span class="tile__title">Nuestros Encuentros</span>
            <span class="tile__times"><b>5:00</b> a. m. <i>Martes · Devocional de Madrugada</i> <b>8:00</b> p. m. <i>Martes · Entre Valientes</i> <b>8:00</b> p. m. <i>Lunes a viernes · Salmos</i></span>
            <span class="tile__text">Hora de España · se adapta a tu país.</span>
          </span>
        </a>
        <a class="tile tile--pastor reveal" href="#/pastor" style="--d:240ms">
          ${picture('pastor-retrato', '', { className: 'tile__img', sizes: '(max-width: 760px) 100vw, 25vw' })}
          <span class="tile__shade" aria-hidden="true"></span>
          <span class="tile__body">
            <span class="tile__tag">${icon('BookOpen', { size: 16 })} Conoce al pastor</span>
            <span class="tile__title">Oscar Amarales</span>
            <span class="tile__text">Una vida de fe, familia y servicio a Dios.</span>
          </span>
        </a>
      </div>
    </div>
  </section>

  <section class="motto-band" aria-label="Nuestra convicción">
    <div class="motto-band__img" aria-hidden="true" style="background-image:url('${asset('images/ministracion-oracion.webp')}')"></div>
    <div class="container motto-band__inner reveal">
      ${goldRule()}
      <p class="motto-band__text">No solamente lo declaramos.<br /><span>Lo vivimos.</span></p>
      ${goldRule()}
    </div>
  </section>

  <section class="section section--bronze" aria-labelledby="proximo">
    <div class="container next3">
      <div class="next3__intro reveal">
        <p class="kicker kicker--light">Nuestros encuentros</p>
        <h2 id="proximo" class="display display--light">Te esperamos en el <span>próximo encuentro</span></h2>
        <p>Calculado automáticamente según tu país, incluido el horario de verano de España.</p>
        <div data-country>${countrySelector({ id: 'pais-inicio' })}</div>
      </div>
      <div class="reveal" data-next style="--d:100ms">${nextMeetingCard({ compact: true })}</div>
    </div>
  </section>

  <section class="section section--stone pastor-teaser" aria-labelledby="pastor-teaser">
    <div class="container pastor-teaser__grid">
      <figure class="pastor-teaser__photo reveal">${picture('pastor-retrato', pastor.retrato.alt, { sizes: '(max-width: 760px) 80vw, 30vw' })}</figure>
      <div class="pastor-teaser__text reveal" style="--d:100ms">
        <p class="kicker">Nuestro pastor</p>
        <h2 id="pastor-teaser" class="display">Oscar <span>Amarales</span></h2>
        <p class="lead">${esc(pastor.biografia[3])}</p>
        <p>${esc(pastor.biografia[5])}</p>
        <a class="btn btn--dark" href="#/pastor">Conoce su historia ${icon('ArrowRight', { size: 18 })}</a>
      </div>
    </div>
  </section>

  <section class="prayer-cta" aria-labelledby="cta-oracion">
    ${scene('serenidad', { className: 'prayer-cta__scene', parallax: 0.2 })}
    <div class="container prayer-cta__inner reveal">
      <p class="kicker kicker--light">Oración</p>
      <h2 id="cta-oracion" class="display display--light">No camines <span>solo</span></h2>
      <p>Queremos acompañarte en oración. Comparte tu petición con nosotros.</p>
      <a class="btn btn--primary btn--lg" href="#/oracion">${icon('HandHeart', { size: 20 })} Enviar mi petición</a>
    </div>
  </section>`;

  main.querySelector('.hero3__scroll').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('bienvenida')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const refresh = () => { main.querySelector('[data-next]').innerHTML = nextMeetingCard({ compact: true }); };
  bindCountrySelector(main, refresh);
  return startCountdowns(main, refresh);
}
