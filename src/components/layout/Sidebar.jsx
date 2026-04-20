import { SCREEN_META } from '../../constants/ui'

export function Sidebar({ activeScreen, onNavigate, currentUser, onLoadMe, onLogout }) {
  return (
    <aside className="sidebar">
      <h2>Flujo profesional</h2>
      {SCREEN_META.profesional.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}

      <h2>Flujo paciente</h2>
      {SCREEN_META.paciente.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}

      <div className="session-box">
        <p><strong>Sesión:</strong> {currentUser ? `${currentUser.displayName} (${currentUser.role})` : 'Sin login'}</p>
        <button className="ghost" onClick={onLoadMe}>/api/auth/me</button>
        <button className="ghost" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
