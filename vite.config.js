import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Ruta base del sitio. GitHub Actions la calcula a partir del nombre del repositorio:
//  - repositorio «hombres-de-pacto.github.io» (organización) → '/'  → https://hombres-de-pacto.github.io/
//  - repositorio «hombres-de-pacto» (cuenta personal)        → '/hombres-de-pacto/'
// En local se usa '/hombres-de-pacto/' salvo que se indique BASE_PATH.
const BASE = process.env.BASE_PATH || '/hombres-de-pacto/';

/** Inserta una versión única en el service worker en cada compilación. */
function swVersion() {
  return {
    name: 'hdp-sw-version',
    apply: 'build',
    closeBundle() {
      const file = resolve('dist/sw.js');
      const version = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      writeFileSync(file, readFileSync(file, 'utf8').replace('__BUILD_VERSION__', version));
      const notFound = resolve('dist/404.html');
      writeFileSync(notFound, readFileSync(notFound, 'utf8').replaceAll('__BASE__', BASE));
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [swVersion()],
  build: { target: 'es2020', assetsInlineLimit: 2048, cssCodeSplit: false },
});
