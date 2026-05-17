import { useState } from 'react'

export function LoginProfesionalScreen({
  auth,
  setAuthState,
  passwordReset,
  onSetPasswordResetField,
  onRequestPasswordReset,
  onConfirmPasswordReset,
  onSubmit,
  onGoPaciente,
  onGoAcceptInvitation,
}) {
  const [showReset, setShowReset] = useState(false)

  function toggleReset() {
    setShowReset((prev) => !prev)
    if (!passwordReset?.email && auth?.email) {
      onSetPasswordResetField('email', auth.email)
    }
  }

  return (
    <section className="screen active">
      <div className="card login-card">
        <h3>Ingreso profesional</h3>
        <p>Acceso seguro para profesionales de salud.</p>
        <form onSubmit={onSubmit}>
          <label>Correo</label>
          <input type="email" value={auth.email} onChange={(e) => setAuthState((p) => ({ ...p, email: e.target.value }))} required />
          <label>Contraseña</label>
          <input type="password" value={auth.password} onChange={(e) => setAuthState((p) => ({ ...p, password: e.target.value }))} required />
          <button className="primary" type="submit">Ingresar</button>
          <button className="text-link" type="button" onClick={toggleReset}>
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        {showReset && (
          <div className="reset-panel">
            <h4>Recuperar contraseña</h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              onRequestPasswordReset(passwordReset?.email || auth?.email)
            }}>
              <label>Correo de la cuenta</label>
              <input
                type="email"
                value={passwordReset?.email || ''}
                onChange={(e) => onSetPasswordResetField('email', e.target.value)}
                required
              />
              <button className="ghost" type="submit">Solicitar token</button>
            </form>

            <form onSubmit={(e) => {
              e.preventDefault()
              onConfirmPasswordReset(passwordReset || {})
            }}>
              <label>Token de recuperación</label>
              <input
                type="text"
                value={passwordReset?.token || ''}
                onChange={(e) => onSetPasswordResetField('token', e.target.value)}
                required
              />

              <label>Nueva contraseña</label>
              <input
                type="password"
                minLength={8}
                value={passwordReset?.newPassword || ''}
                onChange={(e) => onSetPasswordResetField('newPassword', e.target.value)}
                required
              />

              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                minLength={8}
                value={passwordReset?.confirmPassword || ''}
                onChange={(e) => onSetPasswordResetField('confirmPassword', e.target.value)}
                required
              />

              <button className="primary" type="submit">Restablecer contraseña</button>
            </form>
          </div>
        )}

        <div className="login-switch">
          <span>¿Eres paciente?</span>
          <button className="ghost" type="button" onClick={onGoPaciente}>Ingresar como paciente</button>
        </div>
        <div className="login-switch">
          <span>¿Tienes invitación profesional?</span>
          <button className="ghost" type="button" onClick={onGoAcceptInvitation}>Activar cuenta</button>
        </div>
      </div>
    </section>
  )
}
