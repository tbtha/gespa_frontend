export function Topbar({ currentUser, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <h1>GESPA</h1>
        <p>Gestión clínica profesional</p>
      </div>
      <div className="top-actions">
        {currentUser && <span className="user-pill">{currentUser.displayName}</span>}
        {currentUser && <button className="ghost" onClick={onLogout}>Cerrar sesión</button>}
      </div>
    </header>
  )
}
