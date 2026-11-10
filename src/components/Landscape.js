/**
 * Paisajes ilustrados en SVG (sin fotos de archivo ni personas generadas):
 * cordilleras en capas con luz dorada. Variantes:
 *  - 'dawn'  amanecer cálido (Inicio, Desafíos)
 *  - 'ember' resplandor de altar, ámbar profundo (Vuelve al Altar, Oración)
 *  - 'night' cielo nocturno con estrellas y alba lejana (Encuentros)
 */
let uid = 0;

const PALETTES = {
  dawn: {
    sky: ['#14233a', '#3b2a2a', '#8a5a2c', '#e0a64a'],
    sun: '#ffd98a', haze: '#f3c77a',
    layers: ['#6d4b36', '#3d2b22', '#211a16', '#0B0D10'],
  },
  ember: {
    sky: ['#0d0f14', '#22160f', '#5b3418', '#b5732f'],
    sun: '#ffc874', haze: '#e7a457',
    layers: ['#4a3122', '#2b1d15', '#17110d', '#0B0D10'],
  },
  night: {
    sky: ['#070a12', '#0f1a2e', '#1B2E4B', '#6b5a3a'],
    sun: '#f1d38f', haze: '#b9a47a',
    layers: ['#24344d', '#18233a', '#101724', '#0B0D10'],
  },
};

const RIDGES = [
  'M0 520 L90 470 L170 500 L260 420 L340 455 L430 360 L520 430 L600 380 L690 300 L760 350 L840 290 L930 370 L1010 330 L1100 400 L1190 350 L1290 420 L1370 390 L1440 430 V900 H0Z',
  'M0 600 L120 540 L210 575 L330 500 L420 545 L520 470 L640 560 L740 510 L860 580 L980 500 L1090 560 L1200 515 L1320 575 L1440 530 V900 H0Z',
  'M0 690 L140 640 L260 675 L400 610 L540 680 L690 630 L830 690 L980 640 L1120 700 L1270 645 L1440 690 V900 H0Z',
  'M0 790 L180 750 L360 785 L560 740 L760 795 L960 750 L1160 800 L1340 760 L1440 780 V900 H0Z',
];

export function landscape(variant = 'dawn', { className = '', sun = true, stars = variant === 'night', rays = variant !== 'night' } = {}) {
  const p = PALETTES[variant] ?? PALETTES.dawn;
  const id = `ls${++uid}`;
  const starField = stars
    ? Array.from({ length: 60 }, (_, i) => {
      const x = (i * 197) % 1440; const y = (i * 89) % 380; const r = (i % 5 === 0) ? 1.6 : 0.9;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#F1E6D8" opacity="${0.25 + (i % 4) * 0.15}"/>`;
    }).join('')
    : '';
  const rayPolys = rays
    ? [-38, -22, -8, 8, 22, 38].map((a, i) => `<polygon points="720,470 ${720 + Math.sin((a - 3) * Math.PI / 180) * 1600},${470 - Math.cos((a - 3) * Math.PI / 180) * 1600} ${720 + Math.sin((a + 3) * Math.PI / 180) * 1600},${470 - Math.cos((a + 3) * Math.PI / 180) * 1600}" fill="url(#${id}-ray)" opacity="${i % 2 ? 0.16 : 0.1}"/>`).join('')
    : '';
  return `<svg class="landscape landscape--${variant} ${className}" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".45" stop-color="${p.sky[1]}"/>
        <stop offset=".66" stop-color="${p.sky[2]}"/><stop offset=".8" stop-color="${p.sky[3]}"/>
      </linearGradient>
      <radialGradient id="${id}-sun" cx="50%" cy="52%" r="40%">
        <stop offset="0" stop-color="${p.sun}" stop-opacity=".95"/>
        <stop offset=".12" stop-color="${p.sun}" stop-opacity=".55"/>
        <stop offset=".45" stop-color="${p.haze}" stop-opacity=".18"/>
        <stop offset="1" stop-color="${p.haze}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-ray" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="${p.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}-mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.haze}" stop-opacity="0"/><stop offset=".6" stop-color="${p.haze}" stop-opacity=".22"/><stop offset="1" stop-color="${p.haze}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#D4AF37" stop-opacity="0"/><stop offset=".5" stop-color="#ffe3a0" stop-opacity=".95"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1440" height="900" fill="url(#${id}-sky)"/>
    ${starField}
    <g class="landscape__rays">${rayPolys}</g>
    ${sun ? `<rect class="landscape__sun" width="1440" height="900" fill="url(#${id}-sun)"/><circle cx="720" cy="470" r="46" fill="${p.sun}" opacity=".9"/>` : ''}
    <path d="${RIDGES[0]}" fill="${p.layers[0]}" opacity=".92"/>
    <path d="${RIDGES[0].split(' V')[0]}" fill="none" stroke="url(#${id}-rim)" stroke-width="2.2"/>
    <rect y="380" width="1440" height="240" fill="url(#${id}-mist)"/>
    <path d="${RIDGES[1]}" fill="${p.layers[1]}"/>
    <path d="${RIDGES[1].split(' V')[0]}" fill="none" stroke="url(#${id}-rim)" stroke-width="1.4" opacity=".55"/>
    <rect y="520" width="1440" height="200" fill="url(#${id}-mist)" opacity=".7"/>
    <path d="${RIDGES[2]}" fill="${p.layers[2]}"/>
    <path d="${RIDGES[3]}" fill="${p.layers[3]}"/>
  </svg>`;
}

/**
 * Escena pintada (imagen generada por tools/escenas.py) a sangre completa,
 * con parallax suave y zoom lento. Decorativa.
 *  nombre: 'amanecer' | 'resplandor' | 'crepusculo' | 'serenidad' | 'etapa-1-valle' … 'etapa-5-cumbre'
 */
export function scene(nombre, { className = '', parallax = 0.25, eager = false } = {}) {
  const base = import.meta.env.BASE_URL;
  const lg = `${base}images/escenas/${nombre}.webp`;
  const sm = `${base}images/escenas/${nombre}-sm.webp`;
  return `<div class="scene ${className}" aria-hidden="true" data-parallax="${parallax}">
    <img class="scene__img" src="${lg}" srcset="${sm} 900w, ${lg} 2000w" sizes="100vw" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
  </div>`;
}

export const SCENES = { dawn: 'amanecer', ember: 'resplandor', night: 'crepusculo', peace: 'serenidad' };
