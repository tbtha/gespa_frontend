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
  const [resetStep, setResetStep] = useState('email') // 'email' | 'token'
  const [resendCountdown, setResendCountdown] = useState(0)

  function toggleReset() {
    if (showReset) {
      // Cerrar reset
      setShowReset(false)
      setResetStep('email')
      setResendCountdown(0)
      onSetPasswordResetField('email', '')
      onSetPasswordResetField('token', '')
      onSetPasswordResetField('newPassword', '')
      onSetPasswordResetField('confirmPassword', '')
    } else {
      // Abrir reset
      setShowReset(true)
      if (!passwordReset?.email && auth?.email) {
        onSetPasswordResetField('email', auth.email)
      }
    }
  }

  async function handleRequestToken(e) {
    e.preventDefault()
    const success = await onRequestPasswordReset(passwordReset?.email || auth?.email)
    if (success) {
      setResetStep('token')
      // Iniciar countdown de 60 segundos para reenvío
      setResendCountdown(60)
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  async function handleConfirmPassword(e) {
    e.preventDefault()
    const success = await onConfirmPasswordReset({
      token: passwordReset?.token || '',
      newPassword: passwordReset?.newPassword || '',
      confirmPassword: passwordReset?.confirmPassword || '',
    })
    if (success) {
      setTimeout(() => {
        toggleReset()
      }, 1500)
    }
  }

  async function handleResendEmail(e) {
    e.preventDefault()
    if (resendCountdown > 0) return

    const success = await onRequestPasswordReset(passwordReset?.email)
    if (success) {
      setResendCountdown(60)
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  return (
    <section className="screen active">
      <div className="card login-card">
        {!showReset ? (
          <>
            <h3>Ingreso profesional</h3>
            <p>Acceso a su perfil y próximas citas.</p>
            <form onSubmit={onSubmit}>
              <label>Correo</label>
              <input 
                type="email" 
                value={auth.email} 
                onChange={(e) => setAuthState((p) => ({ ...p, email: e.target.value }))} 
                required 
              />
              <label>Contraseña</label>
              <input 
                type="password" 
                value={auth.password} 
                onChange={(e) => setAuthState((p) => ({ ...p, password: e.target.value }))} 
                required 
              />
              <button className="primary" type="submit">Ingresar</button>
              <button 
                className="text-link" 
                type="button" 
                onClick={toggleReset}
                style={{ marginTop: '8px' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
            <div style={{ margin: '18px 0 0 0', color: 'var(--text-muted)', fontSize: '0.98rem', textAlign: 'center' }}>
              ¿Quieres registrarte como profesional? <br />
              Comunícate con <a href="mailto:contacto@gespa.cl" style={{ color: 'var(--primary)', fontWeight: 500 }}>contacto@gespa.cl</a>
            </div>

            <div className="login-switch">
              <span>¿Tienes invitación profesional?</span>
              <button className="ghost" type="button" onClick={onGoAcceptInvitation}>Activar cuenta</button>
            </div>
            <div className="login-switch">
              <span>¿Eres paciente?</span>
              <button className="ghost" type="button" onClick={onGoPaciente}>Ingresar como paciente</button>
            </div>
          </>
        ) : (
          <>
            <h3>Recuperar contraseña</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {resetStep === 'email' 
                ? 'Ingresa tu correo para recibir un token de recuperación' 
                : 'Ingresa el token y establece una nueva contraseña'}
            </p>

            {/* PASO 1: SOLICITAR TOKEN */}
            {resetStep === 'email' && (
              <form onSubmit={handleRequestToken}>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={passwordReset?.email || ''}
                  onChange={(e) => onSetPasswordResetField('email', e.target.value)}
                  required
                />
                <button className="primary" type="submit">
                  📧 Enviar correo de recuperación
                </button>
                <button 
                  className="text-link" 
                  type="button" 
                  onClick={toggleReset}
                  style={{ marginTop: '8px' }}
                >
                  ← Volver
                </button>
              </form>
            )}

            {/* PASO 2: CONFIRMAR CON TOKEN */}
            {resetStep === 'token' && (
              <form onSubmit={handleConfirmPassword}>
                <label>Token de recuperación</label>
                <input
                  type="text"
                  placeholder="Código recibido por correo"
                  value={passwordReset?.token || ''}
                  onChange={(e) => onSetPasswordResetField('token', e.target.value.toUpperCase())}
                  required
                  style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                />

                <label>Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  value={passwordReset?.newPassword || ''}
                  onChange={(e) => onSetPasswordResetField('newPassword', e.target.value)}
                  required
                />

                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  minLength={8}
                  value={passwordReset?.confirmPassword || ''}
                  onChange={(e) => onSetPasswordResetField('confirmPassword', e.target.value)}
                  required
                />

                <button className="primary" type="submit">
                  ✓ Restablecer contraseña
                </button>

                <button 
                  className="ghost" 
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCountdown > 0}
                  style={{ 
                    marginTop: '8px',
                    opacity: resendCountdown > 0 ? 0.5 : 1,
                    cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resendCountdown > 0 ? `⏱️ Reenviar en ${resendCountdown}s` : '📧 Reenviar correo'}
                </button>

                <button 
                  className="text-link" 
                  type="button" 
                  onClick={() => {
                    setResetStep('email')
                    setResendCountdown(0)
                    onSetPasswordResetField('token', '')
                    onSetPasswordResetField('newPassword', '')
                    onSetPasswordResetField('confirmPassword', '')
                  }}
                  style={{ marginTop: '8px' }}
                >
                  ← Usar otro correo
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  )
}
