import { icon, brand } from '../components/Icons.js';
import { pageHead } from '../components/Visuals.js';
import { pastor } from '../data/pastor.js';

export const meta = { title: 'Oración y Contacto' };

const FORM_ID = '1FAIpQLSe14bnIrMDLimde8awo3ZLbLrm8GT-UBO13KpM5XiwsEsun5A';
export const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform?usp=dialog`;
const EMBED_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform?embedded=true`;

export function render(main) {
  main.innerHTML = `
    ${pageHead({
      eyebrow: 'Oración y contacto',
      title: 'No camines solo',
      subtitle: 'Queremos acompañarte en oración.',
      intro: `<p>Hay momentos en los que necesitamos que alguien nos escuche y nos acompañe en oración.</p>
              <p>En Hombres de Pacto creemos en el poder de la oración y en el valor de caminar juntos en la fe.</p>
              <p class="page-head__motto">Comparte tu petición con nosotros.</p>`,
    })}
    <section class="section section--tight">
      <div class="container prayer-grid">
        <div class="form-frame reveal">
          <div class="form-frame__head">
            ${icon('HandHeart', { size: 22 })}
            <h2 class="h3">Petición de oración</h2>
          </div>
          <div class="form-frame__body">
            <iframe src="${EMBED_URL}" title="Formulario oficial de petición de oración (Google Forms)" loading="lazy" referrerpolicy="no-referrer-when-downgrade">Cargando…</iframe>
          </div>
          <div class="form-frame__fallback">
            <p>¿No ves el formulario o prefieres una pantalla completa?</p>
            <a class="btn btn--primary btn--lg" href="${FORM_URL}" target="_blank" rel="noopener">${icon('ExternalLink', { size: 20 })} Enviar mi petición de oración<span class="sr-only"> (abre Google Forms en una pestaña nueva)</span></a>
          </div>
        </div>
        <aside class="prayer-aside reveal">
          <div class="note-card">
            <h2 class="h4">${icon('Info', { size: 18 })} Sobre tu petición</h2>
            <p>Tu petición se envía directamente a través de Google Forms, el formulario oficial del ministerio. Esta web no guarda ni ve lo que escribes allí.</p>
            <p>Revisa en el propio formulario qué datos se solicitan antes de enviarlo. La confirmación de envío la muestra Google Forms.</p>
          </div>
          <div class="note-card">
            <h2 class="h4">${icon('MessageCircleHeart', { size: 18 })} También puedes escribirnos</h2>
            <ul class="social-list">
              ${pastor.redes.map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener">${brand[r.red](20)} ${r.usuario}<span class="sr-only"> en ${r.red} (pestaña nueva)</span></a></li>`).join('')}
            </ul>
          </div>
          <blockquote class="verse-card">
            <p>«Pero yo y mi casa serviremos a Jehová».</p>
            <cite>Josué 24:15</cite>
          </blockquote>
        </aside>
      </div>
    </section>`;
}
