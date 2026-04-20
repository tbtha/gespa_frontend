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
    { id: 'portal-paciente', label: '2. Portal/ficha paciente' },
  ],
}

export const ESTADOS_CITA = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
export const TIPO_ATENCION = ['CONTROL', 'PRIMERA_CONSULTA', 'SEGUIMIENTO', 'URGENCIA']
export const MODALIDAD = ['PRESENCIAL', 'ONLINE']
export const TIPO_INDICADOR = ['PESO', 'PRESION_SISTOLICA', 'GLICEMIA', 'OTRO']
