/**
 * NUESTROS ENCUENTROS — definidos en hora de España peninsular (Europe/Madrid).
 * dias: 0 = domingo … 6 = sábado.
 * enlace: deja `null` hasta tener el enlace oficial de la reunión (por ejemplo, Zoom).
 * duracionMin: estimación usada solo para dejar de mostrar como "próximo" un encuentro ya iniciado.
 */
export const encuentros = [
  {
    id: 'berea',
    nombre: 'Berea',
    descripcion: 'Un tiempo de enseñanza, reflexión y crecimiento en la Palabra.',
    dias: [1, 5],
    hora: 20,
    minuto: 0,
    duracionMin: 60,
    icono: 'BookOpen',
    enlace: null,
  },
  {
    id: 'valientes',
    nombre: 'Entre Valientes',
    descripcion: 'Un encuentro de hombres para fortalecer la fe, el carácter y el propósito.',
    dias: [2],
    hora: 20,
    minuto: 0,
    duracionMin: 60,
    icono: 'Sword',
    enlace: null,
  },
  {
    id: 'devocional',
    nombre: 'Devocional de Madrugada',
    descripcion: 'Comenzamos el día en la presencia de Dios.',
    dias: [2],
    hora: 5,
    minuto: 0,
    duracionMin: 60,
    icono: 'Sun',
    enlace: null,
  },
];

export const paises = [
  { id: 'ES', nombre: 'España', zona: 'Europe/Madrid', nota: 'Hora peninsular' },
  { id: 'CO', nombre: 'Colombia', zona: 'America/Bogota', nota: 'Hora de Colombia' },
  { id: 'AR', nombre: 'Argentina', zona: 'America/Argentina/Buenos_Aires', nota: 'Hora de Argentina' },
  { id: 'MX', nombre: 'México (CDMX)', zona: 'America/Mexico_City', nota: 'Hora del centro de México' },
  { id: 'PE', nombre: 'Perú', zona: 'America/Lima', nota: 'Hora de Perú' },
  { id: 'CL', nombre: 'Chile', zona: 'America/Santiago', nota: 'Hora de Chile' },
  { id: 'GB', nombre: 'Reino Unido', zona: 'Europe/London', nota: 'Hora del Reino Unido' },
  { id: 'EU', nombre: 'Alemania, Francia e Italia', zona: 'Europe/Berlin', nota: 'Hora de Europa central' },
];
