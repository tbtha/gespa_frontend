export function Topbar({ currentUser, onLogout, onSwitchToPatient, onSwitchToProfessional }) {
  const role = String(currentUser?.role || '').toUpperCase()
  return (
    <header className="topbar">
      <div>
        <h1>GESPA</h1>
        <p>Gestión clínica profesional</p>
      </div>
      <div className="top-actions">
        {currentUser && <span className="user-pill">{currentUser.displayName}</span>}
        {currentUser && role === 'PROFESSIONAL' && onSwitchToPatient ? (
          <button className="ghost" onClick={onSwitchToPatient}>Cambiar a paciente</button>
        ) : null}
        {currentUser && role === 'PATIENT' && onSwitchToProfessional ? (
          <button className="ghost" onClick={onSwitchToProfessional}>Cambiar a profesional</button>
        ) : null}
        {currentUser && <button className="ghost" onClick={onLogout}>Cerrar sesión</button>}
      </div>
    </header>
  )
}
