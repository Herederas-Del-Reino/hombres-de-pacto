/**
 * Persistencia local (solo en este dispositivo). Nada se envía a servidores.
 * Estructura:
 * {
 *   desafios: { [dia]: { estado: 'proceso'|'cumplido', nota: string, fecha: ISO } },
 *   altar:    { [dia]: { completado: bool, diario: string, fecha: ISO } },
 *   altarUltimoDia: number,
 *   pais: 'ES'|'CO'|'AR'|'LOCAL'|null,
 *   nombre: string,
 * }
 */
const KEY = 'hombres-de-pacto:v1';
const listeners = new Set();
const empty = () => ({ desafios: {}, altar: {}, altarUltimoDia: 1, pais: null, nombre: '' });

let memory = null; // respaldo en memoria si localStorage no está disponible

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return memory ? structuredClone(memory) : empty();
  }
}

let state = read();

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { memory = structuredClone(state); }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  update(fn) { fn(state); write(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  available() {
    try { localStorage.setItem(`${KEY}:t`, '1'); localStorage.removeItem(`${KEY}:t`); return true; } catch { return false; }
  },
  resetDesafios() { state.desafios = {}; write(); },
  resetAltar() { state.altar = {}; state.altarUltimoDia = 1; write(); },
  resetAll() { state = empty(); write(); },
  export() {
    return JSON.stringify({ app: 'hombres-de-pacto', version: 1, exportado: new Date().toISOString(), datos: state }, null, 2);
  },
  import(json) {
    const parsed = JSON.parse(json);
    const datos = parsed?.datos ?? parsed;
    if (typeof datos !== 'object' || !datos || (!datos.desafios && !datos.altar)) throw new Error('Archivo no válido');
    state = { ...empty(), ...datos };
    write();
  },
};

// Mantiene sincronizadas varias pestañas abiertas.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) { state = read(); listeners.forEach((fn) => fn(state)); }
});

export const desafiosCumplidos = (s = state) => Object.values(s.desafios).filter((d) => d.estado === 'cumplido').length;
export const altarCompletados = (s = state) => Object.values(s.altar).filter((d) => d.completado).length;
