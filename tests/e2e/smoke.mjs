/**
 * Prueba de extremo a extremo con Playwright sobre la compilación de producción.
 * Uso:
 *   npm run build && npm run preview   (en otra terminal)
 *   npm run test:e2e                    (o BASE_URL=https://hombres-de-pacto.github.io/ npm run test:e2e)
 * Opcional: SHOTS=carpeta para guardar capturas de cada sección.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/hombres-de-pacto/';
const SHOTS = process.env.SHOTS;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const ROUTES = ['inicio', 'altar', 'desafios', 'encuentros', 'pastor', 'comunidad', 'recursos', 'oracion'];
const results = [];
const ok = (name) => { results.push(['✔', name]); console.log('✔', name); };

const browser = await chromium.launch();

async function newPage(viewport, { clock } = {}) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const page = await ctx.newPage();
  if (clock) await page.clock.install({ time: clock });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/docs\.google\.com|google|gstatic|ERR_|favicon/i.test(m.text())) errors.push(m.text()); });
  return { ctx, page, errors };
}

async function go(page, hash) {
  await page.goto(`${BASE}#/${hash}`);
  await page.waitForSelector('.view');
  await page.waitForTimeout(250);
}

try {
  /* 1. Las ocho secciones en móvil y escritorio: carga, título, sin desbordamiento horizontal */
  for (const [label, viewport] of [['móvil', { width: 375, height: 812 }], ['tableta', { width: 768, height: 1024 }], ['escritorio', { width: 1440, height: 900 }]]) {
    const { ctx, page, errors } = await newPage(viewport);
    for (const r of ROUTES) {
      await go(page, r);
      const h1 = await page.locator('main h1').first().textContent();
      assert.ok(h1 && h1.trim().length > 2, `${r}: falta h1`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 0, `${r} (${label}): desplazamiento horizontal de ${overflow}px`);
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('loading') !== 'lazy').map((i) => i.src));
      assert.deepEqual(broken, [], `${r}: imágenes rotas`);
      if (SHOTS) {
        await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')));
        await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); await new Promise((r) => setTimeout(r, 900)); });
        await page.screenshot({ path: `${SHOTS}/${label}-${r}.png`, fullPage: true });
      }
    }
    assert.deepEqual(errors, [], `errores de consola (${label})`);
    ok(`8 secciones cargan sin errores ni desbordamiento (${label})`);
    await ctx.close();
  }

  /* 2. Navegación desde el menú y la barra inferior */
  {
    const { ctx, page } = await newPage({ width: 375, height: 812 });
    await go(page, 'inicio');
    await page.click('.tabbar a[data-route="desafios"]');
    await page.waitForURL(/#\/desafios/);
    await page.click('.tabbar__more');
    await page.click('.drawer a[data-route="pastor"]');
    await page.waitForSelector('.view--pastor');
    assert.match(await page.locator('main h1').textContent(), /Oscar Amarales/);
    await go(page, 'ruta-inexistente');
    assert.match(page.url(), /#\/inicio$/);
    ok('navegación por barra inferior, menú lateral y ruta desconocida');
    await ctx.close();
  }

  /* 3. Desafíos: marcar, desmarcar, persistencia, 25 completados y PDF */
  {
    const { ctx, page } = await newPage({ width: 390, height: 844 });
    await go(page, 'desafios/1');
    await page.fill('#nota', 'Hoy pasé tiempo con Dios.');
    await page.click('[data-mark]');
    await page.waitForSelector('[data-unmark]');
    assert.match(await page.locator('.crumbs__count').textContent(), /1 de 25 · 4 %/);
    await page.reload(); await page.waitForSelector('.view');
    assert.equal(await page.inputValue('#nota'), 'Hoy pasé tiempo con Dios.');
    assert.ok(await page.locator('[data-unmark]').isVisible(), 'persistencia del cumplido');
    await page.click('[data-unmark]');
    await page.waitForSelector('[data-mark]');
    await go(page, 'desafios');
    assert.match(await page.locator('.path-progress__count').textContent(), /0 de 25.*0 %/);
    assert.equal(await page.locator('.station--proceso').count(), 1, 'día 1 queda en proceso');
    // Día 5 sin versículo
    await go(page, 'desafios/5');
    assert.equal(await page.locator('.bible-ref').count(), 0);
    // Recorre los 25 con «Marcar como cumplido» y el botón de siguiente
    for (let d = 1; d <= 25; d++) {
      await go(page, `desafios/${d}`);
      await page.click('[data-mark]');
      if (d < 25) {
        await page.waitForSelector('[data-unmark]');
        if (d === 12) assert.match(await page.locator('.crumbs__count').textContent(), /12 de 25 · 48 %/);
      }
    }
    await page.waitForSelector('.celebration');
    assert.match(await page.locator('main h1').textContent(), /25 Desafíos de Pacto/);
    await page.fill('#cert-nombre', 'Hermano de Prueba');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.cert-form button[type=submit]')]);
    const file = await dl.path();
    const head = readFileSync(file).subarray(0, 5).toString();
    assert.equal(head, '%PDF-');
    assert.ok(readFileSync(file).length > 50_000, 'PDF con imagen');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/movil-desafios-final.png`, fullPage: true });
    // Reinicio con confirmación
    await go(page, 'desafios');
    await page.click('[data-reset]');
    await page.click('.modal .btn--ghost'); // cancelar
    assert.match(await page.locator('.path-progress__count').textContent(), /25 de 25/);
    await page.click('[data-reset]');
    await page.click('.modal .btn--danger');
    await page.waitForTimeout(300);
    assert.match(await page.locator('.path-progress__count').textContent(), /0 de 25/);
    ok('25 desafíos: marcar, desmarcar, persistencia, 48 % a los 12, pantalla final, PDF y reinicio con confirmación');
    await ctx.close();
  }

  /* 4. Vuelve al Altar: diario, persistencia, completar 7, repetir, continuar donde quedó */
  {
    const { ctx, page } = await newPage({ width: 390, height: 844 });
    await go(page, 'altar/3');
    await page.fill('#diario', 'Señor, enséñame a amar.');
    await page.waitForTimeout(700);
    await go(page, 'altar');
    assert.match(await page.locator('#dia-titulo').textContent(), /Enséñame a amar/, 'continúa en el día 3');
    await page.reload(); await page.waitForSelector('#diario');
    assert.equal(await page.inputValue('#diario'), 'Señor, enséñame a amar.');
    for (let d = 1; d <= 7; d++) { await go(page, `altar/${d}`); await page.click('[data-complete]'); await page.waitForTimeout(150); }
    await go(page, 'altar/7');
    assert.ok(await page.locator('.finale').isVisible(), 'pantalla final del altar');
    await page.click('[data-repeat]');
    await page.waitForSelector('[data-complete]');
    assert.match(await page.locator('.journey-status__text strong').textContent(), /6 de 7/);
    assert.equal(await page.locator('.tag', { hasText: 'Apoyo editorial' }).count(), 3);
    ok('7 devocionales: diario, guardado, continuar, completar, final y repetir');
    await ctx.close();
  }

  /* 5. Horarios internacionales con fecha simulada (invierno y verano) */
  for (const [label, time, co, ar] of [
    ['invierno', new Date('2027-01-11T08:00:00Z'), ['Lunes', '11:00 p. m.', '2:00 p. m.'], ['Martes', '1:00 a. m.', '4:00 p. m.']],
    ['verano', new Date('2027-07-12T07:00:00Z'), ['Lunes', '10:00 p. m.', '1:00 p. m.'], ['Martes', '12:00 a. m.', '3:00 p. m.']],
  ]) {
    const { ctx, page } = await newPage({ width: 1280, height: 900 }, { clock: time });
    await go(page, 'encuentros');
    const table = await page.locator('.times-table tbody').innerText();
    for (const t of [...co, ...ar, '5:00 a. m.', '8:00 p. m.']) assert.ok(table.includes(t), `${label}: falta ${t} en la tabla`);
    await page.check('input[name="pais-encuentros"][value="CO"]', { force: true });
    const cards = await page.locator('[data-meetings]').innerText();
    assert.ok(cards.includes(co[1]) && cards.includes(co[2]), `${label}: tarjetas Colombia`);
    assert.ok((await page.locator('.dst-note').innerText()).includes(label));
    const next = await page.locator('[data-next]').innerText();
    assert.match(next, /Salmos/); // lunes por la mañana en España → Salmos
    await page.reload(); await page.waitForSelector('.view');
    assert.ok(await page.locator('input[value="CO"]').isChecked(), 'país guardado');
    ok(`horarios ${label}: España, Colombia y Argentina correctos; país persistente`);
    await ctx.close();
  }

  /* 6. Oración (Google Forms), redes sociales, PWA */
  {
    const { ctx, page } = await newPage({ width: 1280, height: 900 });
    await go(page, 'oracion');
    const src = await page.getAttribute('.form-frame iframe', 'src');
    assert.ok(src.includes('1FAIpQLSe14bnIrMDLimde8awo3ZLbLrm8GT-UBO13KpM5XiwsEsun5A') && src.includes('embedded=true'));
    const href = await page.getAttribute('.form-frame__fallback a', 'href');
    assert.equal(href, 'https://docs.google.com/forms/d/e/1FAIpQLSe14bnIrMDLimde8awo3ZLbLrm8GT-UBO13KpM5XiwsEsun5A/viewform?usp=dialog');
    assert.equal(await page.getAttribute('.form-frame__fallback a', 'target'), '_blank');
    await go(page, 'pastor');
    const links = await page.$$eval('.social-card', (a) => a.map((x) => x.href));
    assert.deepEqual(links, ['https://www.instagram.com/oscaramaralesoficial/', 'https://www.tiktok.com/@Pastoresamarales']);
    const manifest = await (await page.request.get(`${BASE}manifest.webmanifest`)).json();
    assert.equal(manifest.name, 'Hombres de Pacto');
    for (const i of manifest.icons) assert.equal((await page.request.get(new URL(i.src, BASE).href)).status(), 200);
    const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.active?.scriptURL; });
    assert.ok(sw.startsWith(BASE) && sw.endsWith('/sw.js'), `service worker fuera de la base: ${sw}`);
    // Funciona sin conexión tras la primera visita
    await page.reload(); await page.waitForTimeout(500);
    await ctx.setOffline(true);
    await page.reload(); await page.waitForSelector('.view', { timeout: 5000 });
    assert.match(await page.locator('main h1').first().textContent(), /Conoce al pastor/i);
    await ctx.setOffline(false);
    ok('Google Forms (iframe + botón), enlaces sociales, manifest, iconos, service worker y modo sin conexión');
    await ctx.close();
  }

  /* 7. Accesibilidad básica: imágenes con alt, botones con nombre, un h1 por vista, contraste del dorado */
  {
    const { ctx, page } = await newPage({ width: 1280, height: 900 });
    for (const r of ROUTES) {
      await go(page, r);
      const issues = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('img:not([alt])').forEach((i) => out.push(`img sin alt: ${i.src}`));
        document.querySelectorAll('button, a').forEach((b) => {
          const name = (b.getAttribute('aria-label') || b.textContent || '').trim();
          if (!name && b.offsetParent !== null) out.push(`control sin nombre: ${b.outerHTML.slice(0, 80)}`);
        });
        const h1 = document.querySelectorAll('main h1').length;
        if (h1 !== 1) out.push(`h1 en main: ${h1}`);
        document.querySelectorAll('textarea, input:not([type=radio]):not([type=file])').forEach((f) => {
          if (!f.id || !document.querySelector(`label[for="${f.id}"]`)) out.push(`campo sin etiqueta: ${f.outerHTML.slice(0, 60)}`);
        });
        return out;
      });
      assert.deepEqual(issues, [], `${r}: ${issues.join(' | ')}`);
    }
    ok('accesibilidad básica: alt, nombres accesibles, un h1 por vista, campos etiquetados');
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${results.length} comprobaciones superadas.`);
