import { test } from 'node:test';
import assert from 'node:assert/strict';
import { desafios } from '../src/data/desafios.js';
import { devocionales } from '../src/data/devocionales.js';
import { encuentros, paises } from '../src/data/encuentros.js';
import { categorias, tipos } from '../src/data/recursos.js';

test('hay 25 desafíos numerados del 1 al 25 con título y acción', () => {
  assert.equal(desafios.length, 25);
  desafios.forEach((d, i) => {
    assert.equal(d.dia, i + 1);
    assert.ok(d.titulo.startsWith('El pacto'));
    assert.ok(d.accion.length > 20);
    assert.ok(d.icono);
  });
});

test('el día 5 no tiene versículo y los demás sí', () => {
  desafios.forEach((d) => {
    if (d.dia === 5) assert.equal(d.versiculo, null);
    else assert.ok(typeof d.versiculo === 'string' && d.versiculo.length > 3, `día ${d.dia}`);
  });
});

test('hay 7 devocionales completos con dos partes', () => {
  assert.equal(devocionales.length, 7);
  devocionales.forEach((d, i) => {
    assert.equal(d.dia, i + 1);
    for (const k of ['tema', 'reflexion', 'pregunta', 'accion', 'oracion']) assert.ok(d[k], `día ${d.dia}: ${k}`);
    assert.equal(d.lecturas.length, 2);
  });
});

test('encuentros y países usan zonas IANA válidas y no inventan enlaces', () => {
  assert.equal(encuentros.length, 3);
  assert.deepEqual(encuentros.map((e) => e.id), ['berea', 'valientes', 'devocional']);
  encuentros.forEach((e) => assert.equal(e.enlace, null));
  paises.forEach((p) => assert.doesNotThrow(() => new Intl.DateTimeFormat('es', { timeZone: p.zona })));
  assert.deepEqual(paises.slice(0, 3).map((p) => p.zona), ['Europe/Madrid', 'America/Bogota', 'America/Argentina/Buenos_Aires']);
  assert.equal(paises.length, 8);
});

test('la biblioteca tiene las 8 categorías y 6 tipos', () => {
  assert.equal(categorias.length, 8);
  assert.equal(tipos.length, 6);
});
