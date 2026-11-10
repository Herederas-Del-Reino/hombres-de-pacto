/**
 * RECURSOS Y ENSEÑANZAS — biblioteca preparada para crecer.
 *
 * Para publicar un recurso, añade un objeto a `recursos`:
 * {
 *   id: 'fe-001',
 *   titulo: 'Título del recurso',
 *   categoria: 'fe',            // id de `categorias`
 *   tipo: 'video',              // id de `tipos`
 *   descripcion: 'Breve descripción.',
 *   url: 'https://…',           // enlace (YouTube, PDF en /public/recursos, etc.)
 *   autor: 'Nombre',            // opcional
 *   fecha: '2026-01-15',        // opcional
 * }
 * Solo publicar recursos oficiales. No atribuir enseñanzas al pastor sin confirmación.
 */
export const categorias = [
  { id: 'fe', nombre: 'Fe', icono: 'Cross', texto: 'Fundamentos para una relación personal con Dios.' },
  { id: 'familia', nombre: 'Familia', icono: 'Users', texto: 'Amar, escuchar, cuidar y acompañar a los tuyos.' },
  { id: 'matrimonio', nombre: 'Matrimonio', icono: 'HeartHandshake', texto: 'Un pacto de amor, respeto y fidelidad.' },
  { id: 'caracter', nombre: 'Carácter', icono: 'Anchor', texto: 'Dominio propio, humildad y madurez.' },
  { id: 'integridad', nombre: 'Integridad', icono: 'Scale', texto: 'Coherencia en público y en privado.' },
  { id: 'crecimiento', nombre: 'Crecimiento espiritual', icono: 'Sprout', texto: 'Oración, Palabra y disciplinas espirituales.' },
  { id: 'servicio', nombre: 'Servicio', icono: 'HandHelping', texto: 'Seguir el ejemplo de Jesucristo.' },
  { id: 'proposito', nombre: 'Propósito', icono: 'Compass', texto: 'Caminar en el llamado de Dios.' },
];

export const tipos = [
  { id: 'video', nombre: 'Videos', icono: 'Video' },
  { id: 'ensenanza', nombre: 'Enseñanzas', icono: 'BookMarked' },
  { id: 'pdf', nombre: 'Documentos PDF', icono: 'FileText' },
  { id: 'descargable', nombre: 'Recursos descargables', icono: 'Download' },
  { id: 'reflexion', nombre: 'Reflexiones', icono: 'Lightbulb' },
  { id: 'estudio', nombre: 'Material de estudio', icono: 'Library' },
];

export const recursos = [];
