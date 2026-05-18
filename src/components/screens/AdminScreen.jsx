export function AdminScreen({
  inviteForm,
  onSetInviteForm,
  onCreateInvitation,
  users,
  onReloadUsers,
  onToggleUser,
  onResetPassword,
}) {
  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Panel administrador</h3>
        <div className="inline-controls">
          <button className="primary" onClick={onReloadUsers}>Actualizar usuarios</button>
        </div>
      </div>

      <div className="card">
        <h4>Crear profesional (invitación)</h4>
        <form onSubmit={onCreateInvitation} className="form-grid">
          <label>
            Correo
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => onSetInviteForm('email', e.target.value)}
              required
            />
          </label>
          <label>
            Nombre
            <input
              value={inviteForm.displayName}
              onChange={(e) => onSetInviteForm('displayName', e.target.value)}
              required
            />
          </label>
          <label>
            RUT
            <input
              value={inviteForm.rut || ''}
              onChange={(e) => onSetInviteForm('rut', e.target.value)}
              required
            />
          </label>
          <label>
            Especialidad
            <input
              value={inviteForm.specialty}
              onChange={(e) => onSetInviteForm('specialty', e.target.value)}
            />
          </label>
          <button className="primary full" type="submit">Crear invitación</button>
        </form>
      </div>

      <div className="card">
        <h4>Usuarios</h4>
        <div className="appointments-list">
          {users.map((u) => (
            <div key={u.userId} className="appointment-item">
              <div className="apt-time">{u.role}</div>
              <div className="apt-info">
                <strong>{u.displayName}</strong>
                <p>{u.email}</p>
              </div>
              <div className="inline-controls">
                <button className="ghost" onClick={() => onToggleUser(u)}>
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
                <button className="ghost" onClick={() => onResetPassword(u.userId)}>
                  Reset password
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h4>Métricas (futuro)</h4>
        <p>Próxima iteración: indicadores operacionales y uso de plataforma.</p>
      </div>
    </section>
  )
}
