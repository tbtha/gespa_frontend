const PROFESSIONAL_SCREENS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'perfil-profesional', label: 'Mi perfil' },
]

const PATIENT_SCREENS = [
  { id: 'portal-paciente', label: 'Inicio' },
  { id: 'paciente-citas', label: 'Mis citas' },
  { id: 'paciente-perfil', label: 'Mi perfil' },
]

const GUEST_SCREENS = [
  { id: 'login-profesional', label: 'Ingreso profesional' },
  { id: 'login-paciente', label: 'Ingreso paciente' },
]

export function WorkspaceNav({ currentUser, activeScreen, onNavigate }) {
  const role = String(currentUser?.role || '').toUpperCase()
  const items = role === 'PROFESSIONAL' ? PROFESSIONAL_SCREENS : role === 'PATIENT' ? PATIENT_SCREENS : GUEST_SCREENS

  return (
    <nav className="workspace-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <button
          key={item.id}
          className={`workspace-link ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
