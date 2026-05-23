import gespaLogo from '../../assets/gespa-logo.png'

export function Topbar({ currentUser, onLogout, onSwitchToPatient, onSwitchToProfessional }) {
  const role = String(currentUser?.role || '').toUpperCase()

  // Navegación al home: si hay función de setActiveScreen, úsala
  function goHome(e) {
    e.preventDefault()
    if (typeof window !== 'undefined' && window.setActiveScreen) {
      window.setActiveScreen('home')
    } else if (window.location) {
      window.location.reload()
    }
  }

  return (
    <header className="topbar">
      <div className="logo-section">
        <a href="#" onClick={goHome} style={{ display: 'inline-block' }}>
          <img src={gespaLogo} alt="GESPA Logo" className="logo-image" style={{ cursor: 'pointer' }} />
        </a>
      </div>
      <div className="top-actions">
        {currentUser && role === 'PROFESSIONAL' && onSwitchToPatient ? (
          <button className="ghost" onClick={onSwitchToPatient}>Cambiar perfil</button>
        ) : null}
        {currentUser && role === 'PATIENT' && onSwitchToProfessional ? (
          <button className="ghost" onClick={onSwitchToProfessional}>Cambiar perfil</button>
        ) : null}
        {currentUser ? <button className="ghost" onClick={onLogout}>Cerrar sesión</button> : null}
      </div>
    </header>
  )
}
