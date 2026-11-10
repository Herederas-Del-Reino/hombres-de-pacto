/** Registro del service worker, avisos de actualización y guía de instalación. */
import { openModal, toast } from './Modal.js';
import { icon } from './Icons.js';
import { asset } from '../utils/dom.js';

let deferredPrompt = null;

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.documentElement.classList.add('can-install');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.documentElement.classList.remove('can-install');
    toast('Hombres de Pacto se instaló en tu dispositivo.');
  });

  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(asset('sw.js'), { scope: import.meta.env.BASE_URL, updateViaCache: 'none' });
      const offerUpdate = (worker) => {
        toast('Hay una nueva versión disponible.', {
          action: 'Actualizar',
          timeout: 0,
          onAction: () => worker.postMessage('SKIP_WAITING'),
        });
      };
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(w);
        });
      });
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });
      // Busca actualizaciones al volver a la app.
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    } catch (err) {
      console.warn('Service worker no registrado:', err);
    }
  });
}

export async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice.catch(() => ({}));
    deferredPrompt = null;
    document.documentElement.classList.remove('can-install');
    if (outcome === 'accepted') return;
  }
  showInstallGuide();
}

export function showInstallGuide() {
  const ios = isIOS();
  const installed = isStandalone();
  openModal({
    title: 'Instala Hombres de Pacto',
    size: 'md',
    className: 'install-modal',
    body: `
      <div class="install-intro">
        <img src="${asset('icons/icon-192.png')}" alt="" width="72" height="72" />
        <p>${installed ? 'Ya estás usando la aplicación instalada. ¡Bienvenido!' : 'Lleva los devocionales y tus 25 desafíos en la pantalla de inicio de tu teléfono, como una aplicación. No necesitas Play Store ni App Store.'}</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Sistema">
        <button role="tab" type="button" id="tab-android" aria-controls="panel-android" aria-selected="${!ios}" class="tab">Android</button>
        <button role="tab" type="button" id="tab-ios" aria-controls="panel-ios" aria-selected="${ios}" class="tab">iPhone</button>
      </div>
      <div role="tabpanel" id="panel-android" aria-labelledby="tab-android" ${ios ? 'hidden' : ''}>
        <ol class="steps">
          <li>${icon('Globe', { size: 20 })}<span>Abre esta página en <strong>Google Chrome</strong>.</span></li>
          <li>${icon('EllipsisVertical', { size: 20 })}<span>Si aparece el botón <strong>«Instalar»</strong>, púlsalo. Si no, toca el menú <strong>⋮</strong> (arriba a la derecha).</span></li>
          <li>${icon('Smartphone', { size: 20 })}<span>Elige <strong>«Instalar aplicación»</strong> o <strong>«Agregar a pantalla principal»</strong>.</span></li>
          <li>${icon('Check', { size: 20 })}<span>Confirma. El icono de Hombres de Pacto aparecerá en tu pantalla de inicio.</span></li>
        </ol>
        <button type="button" class="btn btn--primary btn--block install-now">${icon('Download', { size: 20 })} Instalar ahora</button>
      </div>
      <div role="tabpanel" id="panel-ios" aria-labelledby="tab-ios" ${ios ? '' : 'hidden'}>
        <ol class="steps">
          <li>${icon('Globe', { size: 20 })}<span>Abre esta página en <strong>Safari</strong>.</span></li>
          <li>${icon('Share', { size: 20 })}<span>Toca el botón <strong>Compartir</strong> (el cuadrado con una flecha hacia arriba).</span></li>
          <li>${icon('SquarePlus', { size: 20 })}<span>Desliza y elige <strong>«Agregar a pantalla de inicio»</strong>.</span></li>
          <li>${icon('Check', { size: 20 })}<span>Pulsa <strong>«Agregar»</strong>. Abre la app desde el nuevo icono.</span></li>
        </ol>
      </div>
      <p class="fine">Tu progreso se guarda en cada navegador o app por separado. Si ya avanzaste en el navegador, puedes exportar tus datos desde «Mis datos» e importarlos en la app.</p>`,
  });
  const root = document.querySelector('.install-modal');
  const now = root.querySelector('.install-now');
  now.hidden = !deferredPrompt;
  now.addEventListener('click', () => installApp());
  root.querySelectorAll('[role="tab"]').forEach((t) => t.addEventListener('click', () => {
    root.querySelectorAll('[role="tab"]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    root.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p.id !== t.getAttribute('aria-controls'); });
  }));
}
