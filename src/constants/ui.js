export const SCREEN_META = {
  profesional: [
    { id: 'login-profesional', label: '1. Login profesional' },
    { id: 'dashboard', label: '2. Dashboard' },
    { id: 'perfil-profesional', label: '2.1 Perfil profesional' },
    { id: 'pacientes', label: '3. Selección/creación paciente' },
    { id: 'ficha', label: '4. Ficha paciente' },
    { id: 'agenda', label: '5. Agendar cita' },
  ],
  paciente: [
    { id: 'login-paciente', label: '1. Login paciente' },
    { id: 'portal-paciente', label: '2. Inicio' },
    { id: 'paciente-citas', label: '3. Mis citas' },
    { id: 'paciente-documentos', label: '4. Documentos' },
    { id: 'paciente-perfil', label: '5. Mi perfil' },
  ],
}

export const ESTADOS_CITA = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
export const ESTADO_CITA_LABEL = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

export function toEstadoCitaLabel(status) {
  return ESTADO_CITA_LABEL[status] || status || 'Sin estado'
}

export const TIPO_ATENCION = ['CONTROL', 'PRIMERA_CONSULTA', 'SEGUIMIENTO', 'URGENCIA']
export const TIPO_ATENCION_LABEL = {
  CONTROL: 'Control',
  PRIMERA_CONSULTA: 'Primera consulta',
  SEGUIMIENTO: 'Seguimiento',
  URGENCIA: 'Urgencia',
}

export function toTipoAtencionLabel(tipo) {
  return TIPO_ATENCION_LABEL[tipo] || tipo || 'Sin tipo'
}

export const MODALIDAD = ['PRESENCIAL', 'ONLINE']
export const MODALIDAD_LABEL = {
  PRESENCIAL: 'Presencial',
  ONLINE: 'Online',
}

export function toModalidadLabel(modalidad) {
  return MODALIDAD_LABEL[modalidad] || modalidad || 'Sin modalidad'
}
