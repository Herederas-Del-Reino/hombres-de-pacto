/** Enlace para leer el pasaje en Reina-Valera 1960 (BibleGateway). */
export const bibleUrl = (ref) => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=RVR1960`;

/** Botón de lectura bíblica que abre en una pestaña nueva. */
export const bibleLink = (ref, cls = 'bible-ref') =>
  `<a class="${cls}" href="${bibleUrl(ref)}" target="_blank" rel="noopener">${ref}<span class="sr-only"> (abre la lectura en una pestaña nueva)</span></a>`;
