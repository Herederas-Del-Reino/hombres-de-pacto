/**
 * Conversión de horarios con zonas IANA usando Intl (sin dependencias).
 * Los encuentros se definen en hora de España peninsular (Europe/Madrid) y
 * se aplica automáticamente el horario de verano vigente en cada país.
 */
export const ZONA_BASE = 'Europe/Madrid';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const dtfCache = new Map();

function dtf(tz) {
  if (!dtfCache.has(tz)) {
    dtfCache.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  return dtfCache.get(tz);
}

/** Partes de fecha/hora de un instante en una zona. weekday: 0 = domingo … 6 = sábado. */
export function zonedParts(date, tz) {
  const p = Object.fromEntries(dtf(tz).formatToParts(date).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour % 24, minute: +p.minute, second: +p.second, weekday: WD[p.weekday] };
}

/** Diferencia (ms) entre la hora de reloj de la zona y UTC en ese instante. */
export function tzOffsetMs(tz, date) {
  const p = zonedParts(date, tz);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - Math.floor(date.getTime() / 1000) * 1000;
}

/** Instante que corresponde a una hora de reloj en una zona. */
export function zonedToUtc(y, m, d, h, mi, tz) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off1 = tzOffsetMs(tz, new Date(guess));
  let t = guess - off1;
  const off2 = tzOffsetMs(tz, new Date(t));
  if (off2 !== off1) t = guess - off2;
  return new Date(t);
}

/** Próximas ocurrencias de un encuentro (que aún no han terminado) a partir de `desde`. */
export function proximasOcurrencias(encuentro, desde = new Date(), cantidad = 1) {
  const base = zonedParts(desde, ZONA_BASE);
  const res = [];
  for (let i = -1; i < 40 && res.length < cantidad; i++) {
    const dia = new Date(Date.UTC(base.year, base.month - 1, base.day + i));
    if (!encuentro.dias.includes(dia.getUTCDay())) continue;
    const inst = zonedToUtc(dia.getUTCFullYear(), dia.getUTCMonth() + 1, dia.getUTCDate(), encuentro.hora, encuentro.minuto, ZONA_BASE);
    if (inst.getTime() + (encuentro.duracionMin ?? 0) * 60000 > desde.getTime()) res.push(inst);
  }
  return res;
}

/** El encuentro más cercano entre todos. */
export function proximoEncuentro(encuentros, desde = new Date()) {
  return encuentros
    .map((e) => ({ encuentro: e, fecha: proximasOcurrencias(e, desde, 1)[0] }))
    .filter((x) => x.fecha)
    .sort((a, b) => a.fecha - b.fecha)[0];
}

export function hora12(h, m) {
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** Formatea un instante en la zona indicada. */
export function formatear(date, tz) {
  const p = zonedParts(date, tz);
  return {
    dia: DIAS[p.weekday],
    hora: hora12(p.hour, p.minute),
    fecha: `${DIAS[p.weekday]} ${p.day} de ${MESES[p.month - 1]}`,
    weekday: p.weekday,
    parts: p,
  };
}

/**
 * Horario semanal de un encuentro convertido a otra zona, usando la semana
 * que comienza en `ref` (así se respeta el horario de verano vigente).
 */
export function horarioSemanal(encuentro, tz, ref = new Date()) {
  const ocurrencias = proximasOcurrencias({ ...encuentro, duracionMin: 0 }, ref, encuentro.dias.length);
  const convertidos = ocurrencias.map((d) => formatear(d, tz));
  const dias = [...new Set(convertidos.map((c) => c.weekday))].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const horas = [...new Set(convertidos.map((c) => c.hora))];
  return { dias, diasTexto: describirDias(dias), hora: horas[0] ?? '', horas };
}

export function describirDias(dias) {
  const key = dias.join(',');
  if (key === '1,2,3,4,5') return 'Lunes a viernes';
  if (key === '1,2,3,4,5,6,0') return 'Todos los días';
  if (key === '2,3,4,5,6') return 'Martes a sábado';
  if (key === '1,2,3,4,0') return 'Domingo a jueves';
  const nombres = dias.map((d) => DIAS[d]);
  const txt = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0] ?? '';
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** ¿Rige el horario de verano en España en esa fecha? */
export function esVeranoEspana(date = new Date()) {
  const enero = tzOffsetMs(ZONA_BASE, new Date(Date.UTC(date.getUTCFullYear(), 0, 15)));
  return tzOffsetMs(ZONA_BASE, date) > enero;
}

export function zonaLocal() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_BASE; } catch { return ZONA_BASE; }
}

export function cuentaRegresiva(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
