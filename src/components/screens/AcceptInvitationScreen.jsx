export function AcceptInvitationScreen({ invitationForm, onSetInvitationForm, onSubmit, onGoLoginProfesional }) {
  return (
    <section className="screen active">
      <div className="card login-card">
        <h3>Aceptar invitación profesional</h3>
        <p>Define tu contraseña para activar el acceso.</p>
        <form onSubmit={onSubmit}>
          <label>Token de invitación</label>
          <input
            type="text"
            value={invitationForm.token}
            onChange={(e) => onSetInvitationForm('token', e.target.value)}
            required
          />
          <label>Nueva contraseña</label>
          <input
            type="password"
            minLength={8}
            value={invitationForm.newPassword}
            onChange={(e) => onSetInvitationForm('newPassword', e.target.value)}
            required
          />
          <label>Confirmar contraseña</label>
          <input
            type="password"
            minLength={8}
            value={invitationForm.confirmPassword}
            onChange={(e) => onSetInvitationForm('confirmPassword', e.target.value)}
            required
          />
          <button className="primary" type="submit">Activar cuenta</button>
        </form>
        <div className="login-switch">
          <span>¿Ya tienes acceso?</span>
          <button className="ghost" type="button" onClick={onGoLoginProfesional}>Ir al login profesional</button>
        </div>
      </div>
    </section>
  )
}
