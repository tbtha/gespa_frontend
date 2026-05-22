import gespaLogo from '../../assets/gespa-logo.png'

export function Topbar({ currentUser, onLogout, onSwitchToPatient, onSwitchToProfessional }) {
  const role = String(currentUser?.role || '').toUpperCase()

  return (
    <header className="topbar">
      <div className="logo-section">
        <img src={gespaLogo} alt="GESPA Logo" className="logo-image" />
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
