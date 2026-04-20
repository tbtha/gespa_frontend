import { SCREEN_META } from '../../constants/ui'

const ROLE_SCREENS = {
  PROFESSIONAL: SCREEN_META.profesional.filter((item) => item.id !== 'login-profesional'),
  PATIENT: SCREEN_META.paciente.filter((item) => item.id !== 'login-paciente'),
  guest: [
    { id: 'login-profesional', label: 'Ingreso profesional' },
    { id: 'login-paciente', label: 'Ingreso paciente' },
  ],
}

export function WorkspaceNav({ currentUser, activeScreen, onNavigate }) {
  const items = currentUser?.role
    ? ROLE_SCREENS[currentUser.role] || ROLE_SCREENS.PROFESSIONAL
    : ROLE_SCREENS.guest

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
