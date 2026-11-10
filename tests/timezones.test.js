import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  horarioSemanal, proximasOcurrencias, proximoEncuentro, formatear, esVeranoEspana, zonedToUtc,
} from '../src/utils/timezones.js';
import { encuentros } from '../src/data/encuentros.js';

const devocional = encuentros.find((e) => e.id === 'devocional');
const salmos = encuentros.find((e) => e.id === 'salmos');
const CO = 'America/Bogota';
const AR = 'America/Argentina/Buenos_Aires';
const ES = 'Europe/Madrid';

// Referencia de invierno: lunes 11 de enero de 2027, 09:00 hora de Madrid.
const INVIERNO = zonedToUtc(2027, 1, 11, 9, 0, ES);
// Referencia de verano: lunes 12 de julio de 2027, 09:00 hora de Madrid.
const VERANO = zonedToUtc(2027, 7, 12, 9, 0, ES);

test('detecta horario de invierno y de verano en España', () => {
  assert.equal(esVeranoEspana(INVIERNO), false);
  assert.equal(esVeranoEspana(VERANO), true);
});

test('tabla de invierno español', () => {
  assert.deepEqual(pick(horarioSemanal(devocional, ES, INVIERNO)), ['Martes', '5:00 a. m.']);
  assert.deepEqual(pick(horarioSemanal(devocional, CO, INVIERNO)), ['Lunes', '11:00 p. m.']);
  assert.deepEqual(pick(horarioSemanal(devocional, AR, INVIERNO)), ['Martes', '1:00 a. m.']);
  assert.deepEqual(pick(horarioSemanal(salmos, ES, INVIERNO)), ['Lunes a viernes', '8:00 p. m.']);
  assert.deepEqual(pick(horarioSemanal(salmos, CO, INVIERNO)), ['Lunes a viernes', '2:00 p. m.']);
  assert.deepEqual(pick(horarioSemanal(salmos, AR, INVIERNO)), ['Lunes a viernes', '4:00 p. m.']);
});

test('tabla de verano español', () => {
  assert.deepEqual(pick(horarioSemanal(devocional, ES, VERANO)), ['Martes', '5:00 a. m.']);
  assert.deepEqual(pick(horarioSemanal(devocional, CO, VERANO)), ['Lunes', '10:00 p. m.']);
  assert.deepEqual(pick(horarioSemanal(devocional, AR, VERANO)), ['Martes', '12:00 a. m.']);
  assert.deepEqual(pick(horarioSemanal(salmos, CO, VERANO)), ['Lunes a viernes', '1:00 p. m.']);
  assert.deepEqual(pick(horarioSemanal(salmos, AR, VERANO)), ['Lunes a viernes', '3:00 p. m.']);
});

test('cambio de hora de marzo de 2027 (domingo 28): el martes siguiente ya usa verano', () => {
  const antes = zonedToUtc(2027, 3, 22, 9, 0, ES); // lunes 22 (invierno)
  const despues = zonedToUtc(2027, 3, 29, 9, 0, ES); // lunes 29 (verano)
  assert.equal(formatear(proximasOcurrencias(devocional, antes)[0], CO).hora, '11:00 p. m.');
  assert.equal(formatear(proximasOcurrencias(devocional, despues)[0], CO).hora, '10:00 p. m.');
});

test('cambio de hora de octubre de 2026 (domingo 25): vuelve a invierno', () => {
  const antes = zonedToUtc(2026, 10, 19, 9, 0, ES);
  const despues = zonedToUtc(2026, 10, 26, 9, 0, ES);
  assert.equal(formatear(proximasOcurrencias(salmos, antes)[0], AR).hora, '3:00 p. m.');
  assert.equal(formatear(proximasOcurrencias(salmos, despues)[0], AR).hora, '4:00 p. m.');
});

test('próximo encuentro: lunes por la mañana → Salmos del lunes a las 20:00', () => {
  const n = proximoEncuentro(encuentros, INVIERNO);
  assert.equal(n.encuentro.id, 'salmos');
  const f = formatear(n.fecha, ES);
  assert.equal(f.dia, 'lunes');
  assert.equal(f.hora, '8:00 p. m.');
});

test('próximo encuentro: lunes 21:30 (tras empezar Salmos y pasada su hora) → devocional del martes', () => {
  const n = proximoEncuentro(encuentros, zonedToUtc(2027, 1, 11, 21, 30, ES));
  assert.equal(n.encuentro.id, 'devocional');
  assert.equal(formatear(n.fecha, ES).dia, 'martes');
});

test('próximo encuentro: viernes 22:00 → Salmos del lunes (fin de semana sin encuentros)', () => {
  const n = proximoEncuentro(encuentros, zonedToUtc(2027, 1, 15, 22, 0, ES));
  assert.equal(n.encuentro.id, 'salmos');
  assert.equal(formatear(n.fecha, ES).dia, 'lunes');
});

function pick(h) { return [h.diasTexto, h.hora]; }
