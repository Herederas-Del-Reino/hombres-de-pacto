/** Elementos visuales de marca: montañas, divisores, banderas y encabezados de sección. */
import { esc, asset } from '../utils/dom.js';
import { scene as sceneImg, SCENES } from './Landscape.js';

/**
 * Partículas de luz flotando (polvo en el rayo de sol). Sustituye a los marcos
 * dorados: la luz destaca momentos, no encierra todo. Decorativo y muy ligero.
 */
export const ornaments = ({ count = 14 } = {}) => `<div class="dust" aria-hidden="true">${Array.from({ length: count }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${20 + ((i * 53) % 70)}%;--s:${2 + (i % 3)}px;--t:${9 + (i % 5) * 2}s;--dl:${-(i * 1.3).toFixed(1)}s"></i>`).join('')}</div>`;

/** Línea dorada con rombo central. */
export const goldRule = (cls = '') => `<div class="gold-rule ${cls}" aria-hidden="true"><span></span><b></b><span></span></div>`;

/** Cordillera en capas con luz dorada (vectorial, sin imágenes externas). */
export function mountains({ className = '', glow = true } = {}) {
  return `<svg class="mountains ${className}" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <radialGradient id="mg-sun" cx="50%" cy="62%" r="45%">
        <stop offset="0" stop-color="#D4AF37" stop-opacity=".55"/>
        <stop offset=".35" stop-color="#8B5E2B" stop-opacity=".25"/>
        <stop offset="1" stop-color="#0B0D10" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="mg-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a3f60"/><stop offset="1" stop-color="#1B2E4B"/>
      </linearGradient>
      <linearGradient id="mg-mid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1B2E4B"/><stop offset="1" stop-color="#111a29"/>
      </linearGradient>
      <linearGradient id="mg-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#121820"/><stop offset="1" stop-color="#0B0D10"/>
      </linearGradient>
      <linearGradient id="mg-rim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#D4AF37" stop-opacity="0"/>
        <stop offset=".5" stop-color="#D4AF37" stop-opacity=".9"/>
        <stop offset="1" stop-color="#D4AF37" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${glow ? '<rect class="mountains__glow" width="1440" height="560" fill="url(#mg-sun)"/>' : ''}
    <path fill="url(#mg-far)" opacity=".75" d="M0 330 L120 260 L210 300 L330 190 L420 250 L520 150 L600 210 L720 95 L820 200 L900 160 L1010 250 L1110 175 L1220 260 L1330 210 L1440 270 V560 H0Z"/>
    <path fill="none" stroke="url(#mg-rim)" stroke-width="2" opacity=".8" d="M520 150 L600 210 L720 95 L820 200 L900 160"/>
    <path fill="#e9dcc8" opacity=".14" d="M720 95 L688 132 L705 128 L720 142 L736 126 L752 134Z"/>
    <path fill="url(#mg-mid)" d="M0 400 L140 320 L260 380 L380 290 L500 360 L610 300 L720 370 L850 280 L980 360 L1090 300 L1210 370 L1330 320 L1440 360 V560 H0Z"/>
    <path fill="url(#mg-near)" d="M0 470 L160 410 L300 455 L470 395 L640 460 L800 420 L960 470 L1120 410 L1290 455 L1440 420 V560 H0Z"/>
  </svg>`;
}

export const divider = (className = '') => `<div class="divider ${className}" aria-hidden="true"><span></span><svg viewBox="0 0 40 20"><path d="M2 18 L14 6 L20 12 L26 4 L38 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span></div>`;

/** Encabezado editorial común a todas las secciones. */
/**
 * Encabezado de sección con personalidad propia.
 *  scene:  paisaje ilustrado ('dawn' | 'ember' | 'night')
 *  layout: 'center' (foto atenuada detrás) o 'split' (texto + fotografía enmarcada)
 *  index:  numeral editorial decorativo (I, II, III…)
 */
export function pageHead({ eyebrow = '', title, subtitle = '', intro = '', id = 'page-title', image = '', scene = 'dawn', layout = 'center', index = '' }) {
  const photo = image ? asset(`images/${image}.webp`) : '';
  return `<header class="ph ph--${layout} ph--${scene}">
    ${sceneImg(SCENES[scene] ?? scene, { className: 'ph__scene', eager: true })}
    ${photo && layout === 'center' ? `<div class="ph__photo" style="background-image:url('${photo}')" aria-hidden="true"></div>` : ''}
    <div class="ph__veil" aria-hidden="true"></div>
    ${ornaments()}
    <div class="container ph__inner">
      <div class="ph__text reveal">
        ${index ? `<span class="ph__index" aria-hidden="true">${index}</span>` : ''}
        ${eyebrow ? `<p class="ph__eyebrow">${esc(eyebrow)}</p>` : ''}
        <h1 id="${id}" class="page-head__title" tabindex="-1">${title}</h1>
        ${subtitle ? `<p class="page-head__subtitle">${subtitle}</p>` : ''}
        ${goldRule(layout === 'split' ? 'gold-rule--left' : '')}
        ${intro ? `<div class="page-head__intro">${intro}</div>` : ''}
      </div>
      ${photo && layout === 'split' ? `<figure class="ph__figure reveal" style="--d:120ms"><img src="${photo}" alt="" loading="eager" decoding="async" /></figure>` : ''}
    </div>
  </header>`;
}

/** Banderas simples en SVG (los emojis de bandera no se ven en Windows). */
export const flags = {
  ES: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/></svg>',
  CO: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#CE1126"/><rect width="30" height="15" fill="#003893"/><rect width="30" height="10" fill="#FCD116"/></svg>',
  AR: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#74ACDF"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2.2" fill="#F6B40E"/></svg>',
  LOCAL: '<svg class="flag flag--globe" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
};
