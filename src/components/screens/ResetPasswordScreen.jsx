import { useEffect, useState } from 'react'

/**
 * ResetPasswordScreen: Componente dedicado para el flujo de reset de contraseña
 * Permite solicitar un token via email y luego restablecer la contraseña con ese token
 */
export function ResetPasswordScreen({
  passwordReset = {},
  onSetPasswordResetField,
  onRequestPasswordReset,
  onConfirmPasswordReset,
  onGoBack,
  isLoading = false,
}) {
  const [step, setStep] = useState(passwordReset?.token ? 'token' : 'email') // 'email' | 'token'
  const [requestSent, setRequestSent] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (passwordReset?.token) {
      setStep('token')
    }
  }, [passwordReset?.token])

  // Solicitar token de reset
  async function handleRequestToken(e) {
    e.preventDefault()
    const email = String(passwordReset?.email || '').trim()
    
    if (!email) {
      return
    }

    const success = await onRequestPasswordReset(email)
    if (success) {
      setRequestSent(true)
      setStep('token')
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

  // Confirmar nueva contraseña con token
  async function handleConfirmPassword(e) {
    e.preventDefault()
    const success = await onConfirmPasswordReset({
      token: passwordReset?.token || '',
      newPassword: passwordReset?.newPassword || '',
      confirmPassword: passwordReset?.confirmPassword || '',
    })
    
    if (success) {
      // Reset y volver al login
      setTimeout(() => {
        setStep('email')
        setRequestSent(false)
        onSetPasswordResetField('email', '')
        onSetPasswordResetField('token', '')
        onSetPasswordResetField('newPassword', '')
        onSetPasswordResetField('confirmPassword', '')
        onGoBack?.()
      }, 1500)
    }
  }

  // Reenviar email con token
  async function handleResendEmail() {
    if (resendCountdown > 0) return
    
    const email = String(passwordReset?.email || '').trim()
    if (email) {
      const success = await onRequestPasswordReset(email)
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
  }

  return (
    <section className="screen active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card reset-password-card" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>Recuperar contraseña</h2>
          <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {step === 'email' ? 'Ingresa tu correo para recibir un token de recuperación' : 'Ingresa el token y tu nueva contraseña'}
          </p>
        </div>

        {/* PASO 1: SOLICITAR TOKEN */}
        {step === 'email' && (
          <form onSubmit={handleRequestToken} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="reset-email" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Correo electrónico
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={passwordReset?.email || ''}
                onChange={(e) => onSetPasswordResetField('email', e.target.value)}
                required
                disabled={isLoading || requestSent}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  opacity: isLoading || requestSent ? 0.6 : 1,
                  cursor: isLoading || requestSent ? 'not-allowed' : 'auto',
                }}
              />
            </div>

            <button
              type="submit"
              className="primary"
              disabled={isLoading || requestSent}
              style={{
                width: '100%',
                opacity: isLoading || requestSent ? 0.6 : 1,
                cursor: isLoading || requestSent ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar correo de recuperación'}
            </button>
          </form>
        )}

        {/* PASO 2: CONFIRMAR CON TOKEN */}
        {step === 'token' && (
          <form onSubmit={handleConfirmPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="reset-token" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Token de recuperación
              </label>
              <input
                id="reset-token"
                type="text"
                placeholder="Código de 6-10 caracteres"
                value={passwordReset?.token || ''}
                onChange={(e) => onSetPasswordResetField('token', e.target.value.toUpperCase())}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'auto',
                }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Revisa tu correo para obtener el token
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="reset-password" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Nueva contraseña
              </label>
              <input
                id="reset-password"
                type="password"
                placeholder="Al menos 8 caracteres"
                minLength={8}
                value={passwordReset?.newPassword || ''}
                onChange={(e) => onSetPasswordResetField('newPassword', e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'auto',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="reset-confirm-password" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Confirmar contraseña
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                placeholder="Repite tu nueva contraseña"
                minLength={8}
                value={passwordReset?.confirmPassword || ''}
                onChange={(e) => onSetPasswordResetField('confirmPassword', e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'auto',
                }}
              />
            </div>

            <button
              type="submit"
              className="primary"
              disabled={isLoading}
              style={{
                width: '100%',
                marginBottom: '12px',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>

            <div style={{ marginBottom: '12px' }}>
              <button
                type="button"
                className="ghost"
                onClick={handleResendEmail}
                disabled={resendCountdown > 0 || isLoading}
                style={{
                  width: '100%',
                  opacity: resendCountdown > 0 || isLoading ? 0.5 : 1,
                  cursor: resendCountdown > 0 || isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar correo'}
              </button>
            </div>
          </form>
        )}

        {/* BOTÓN VOLVER */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setStep('email')
              setRequestSent(false)
              setResendCountdown(0)
              onSetPasswordResetField('email', '')
              onSetPasswordResetField('token', '')
              onSetPasswordResetField('newPassword', '')
              onSetPasswordResetField('confirmPassword', '')
              onGoBack?.()
            }}
            style={{ width: '100%', padding: '10px' }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </section>
  )
}
