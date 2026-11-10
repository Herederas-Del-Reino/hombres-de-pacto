/**
 * «Mi camino de pacto»: sendero ilustrado que asciende una montaña con una
 * estación por desafío. Decorativo (la lista accesible está en la página).
 * estados: array de 'pendiente' | 'proceso' | 'cumplido' (índice 0 = día 1).
 */
export function trail(estados, { className = '' } = {}) {
  const total = estados.length;
  const pts = estados.map((_, i) => {
    const t = i / (total - 1);
    const y = 312 - t * 262;
    const half = ((y - 30) / 300) * 290; // media anchura de la montaña a esa altura
    return [300 + half * 0.78 * Math.sin(i * 1.1 + 0.6), y];
  });
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const doneIdx = estados.reduce((acc, e, i) => (e === 'cumplido' ? i : acc), -1);
  const doneLine = doneIdx >= 0 ? pts.slice(0, doneIdx + 1).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') : '';
  const next = estados.findIndex((e) => e !== 'cumplido');
  const allDone = next === -1;
  return `<svg class="trail ${className}" viewBox="0 -14 600 344" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="trail-mtn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#5a4130"/><stop offset=".55" stop-color="#2c2119"/><stop offset="1" stop-color="#121418"/>
      </linearGradient>
      <linearGradient id="trail-snow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F1E6D8" stop-opacity=".55"/><stop offset="1" stop-color="#F1E6D8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M-10 330 L300 26 L610 330Z" fill="url(#trail-mtn)"/>
    <path d="M-10 330 L300 26" stroke="#D4AF37" stroke-opacity=".5" stroke-width="1.5" fill="none"/>
    <path d="M300 26 L262 64 L282 60 L300 78 L320 58 L338 64Z" fill="url(#trail-snow)"/>
    <path class="trail__path" d="${line}" fill="none" stroke="#F1E6D8" stroke-opacity=".22" stroke-width="2" stroke-dasharray="3 6"/>
    ${doneLine ? `<path class="trail__done" d="${doneLine}" fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${pts.map(([x, y], i) => {
      const e = estados[i];
      const cls = e === 'cumplido' ? 'is-done' : e === 'proceso' ? 'is-progress' : '';
      return `<circle class="trail__dot ${cls} ${i === next ? 'is-next' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === next ? 7 : 5}"/>`;
    }).join('')}
    <g class="trail__flag ${allDone ? 'is-reached' : ''}" transform="translate(300 26)">
      <line x1="0" y1="0" x2="0" y2="-26" stroke="#D4AF37" stroke-width="2"/>
      <path d="M0 -26 L20 -20 L0 -14Z" fill="#D4AF37"/>
    </g>
  </svg>`;
}
