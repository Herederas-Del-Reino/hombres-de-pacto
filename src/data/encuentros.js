/**
 * NUESTROS ENCUENTROS — definidos en hora de España peninsular (Europe/Madrid).
 * dias: 0 = domingo … 6 = sábado.
 * enlace: deja `null` hasta tener el enlace oficial de la reunión (por ejemplo, Zoom).
 * duracionMin: estimación usada solo para dejar de mostrar como "próximo" un encuentro ya iniciado.
 */
export const encuentros = [
  {
    id: 'devocional',
    nombre: 'Devocional de Madrugada',
    descripcion: 'Comenzamos el día en la presencia de Dios.',
    dias: [2],
    hora: 5,
    minuto: 0,
    duracionMin: 60,
    icono: 'BookOpen',
    enlace: null,
  },
  {
    id: 'salmos',
    nombre: 'Salmos',
    descripcion: 'Juntos en adoración a través de la Palabra.',
    dias: [1, 2, 3, 4, 5],
    hora: 20,
    minuto: 0,
    duracionMin: 60,
    icono: 'Crown',
    enlace: null,
  },
];

export const paises = [
  { id: 'ES', nombre: 'España', zona: 'Europe/Madrid', nota: 'Hora peninsular' },
  { id: 'CO', nombre: 'Colombia', zona: 'America/Bogota', nota: 'Hora de Colombia' },
  { id: 'AR', nombre: 'Argentina', zona: 'America/Argentina/Buenos_Aires', nota: 'Hora de Argentina' },
];
