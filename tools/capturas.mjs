// Capturas de revisión visual: node tools/capturas.mjs <carpeta> [base]
import { chromium } from 'playwright';
const out = process.argv[2];
const BASE = process.argv[3] || 'http://localhost:4173/hombres-de-pacto/';
const b = await chromium.launch();
const seed = () => { const s = { desafios: {}, altar: { 1: { completado: true }, 2: { completado: true } }, altarUltimoDia: 3 }; for (let i = 1; i <= 7; i++) s.desafios[i] = { estado: 'cumplido' }; s.desafios[8] = { estado: 'proceso' }; localStorage.setItem('hombres-de-pacto:v1', JSON.stringify(s)); };
const shot = async (vp, hash, name, { prep = seed, full = true } = {}) => {
  const p = await b.newPage({ viewport: vp });
  await p.goto(BASE + '#/inicio');
  if (prep) await p.evaluate(prep);
  await p.goto(BASE + hash); await p.reload();
  await p.waitForTimeout(900);
  await p.evaluate(async () => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')); for (const i of document.images) i.loading = 'eager'; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); window.scrollTo(0, 0); });
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await p.close();
};
const M = { width: 390, height: 844 }, D = { width: 1440, height: 900 }, T = { width: 820, height: 1180 };
const which = (process.argv[4] ?? 'all').split(',');
const jobs = [
  ['m-desafios', M, '#/desafios'], ['d-desafios', D, '#/desafios'], ['m-dia8', M, '#/desafios/8'], ['d-dia3', D, '#/desafios/3'],
  ['m-inicio', M, '#/inicio'], ['d-inicio', D, '#/inicio'], ['d-pastor', D, '#/pastor'], ['m-pastor', M, '#/pastor'],
  ['d-altar', D, '#/altar'], ['d-oracion', D, '#/oracion'], ['m-oracion', M, '#/oracion'], ['d-recursos', D, '#/recursos'],
  ['d-encuentros', D, '#/encuentros'], ['m-encuentros', M, '#/encuentros'], ['t-comunidad', T, '#/comunidad'], ['t-desafios', T, '#/desafios'],
];
for (const [n, vp, h] of jobs) if (which.includes('all') || which.includes(n)) await shot(vp, h, n);
await b.close();
