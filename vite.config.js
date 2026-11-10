import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Sitio publicado en https://<usuario>.github.io/hombres-de-pacto/
const BASE = '/hombres-de-pacto/';

/** Inserta una versión única en el service worker en cada compilación. */
function swVersion() {
  return {
    name: 'hdp-sw-version',
    apply: 'build',
    closeBundle() {
      const file = resolve('dist/sw.js');
      const version = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      writeFileSync(file, readFileSync(file, 'utf8').replace('__BUILD_VERSION__', version));
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [swVersion()],
  build: { target: 'es2020', assetsInlineLimit: 2048, cssCodeSplit: false },
});
