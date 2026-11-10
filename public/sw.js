/* Service worker de Hombres de Pacto.
 * - HTML: red primero (siempre recibe la última versión publicada; caché solo sin conexión).
 * - /assets/ con hash: caché primero (los nombres cambian en cada versión).
 * - Imágenes, iconos y fuentes: se sirven de caché y se actualizan en segundo plano.
 * La versión se inserta en cada compilación (vite.config.js).
 */
const VERSION = '__BUILD_VERSION__';
const CACHE = `hdp-${VERSION}`;
const SCOPE = self.registration.scope; // raíz del sitio (p. ej. https://hombres-de-pacto.github.io/)
const PRECACHE = ['', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'images/logo.webp', 'images/logo-sm.webp'].map((p) => new URL(p, SCOPE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('hdp-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameScope = req.url.startsWith(SCOPE);

  if (req.mode === 'navigate' && sameScope) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(new URL('index.html', SCOPE).href, copy));
        return res;
      }).catch(() => caches.match(new URL('index.html', SCOPE).href))
    );
    return;
  }

  if (sameScope && url.pathname.includes('/assets/')) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  if ((sameScope && url.pathname.endsWith('sw.js')) ) return;

  if (sameScope || FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
