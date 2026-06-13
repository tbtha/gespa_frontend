/**
 * passwordResetService.js
 * Servicio para manejar la lógica de reset de contraseña
 * Centraliza validaciones y llamadas API
 */

import { authApi } from './gespaApi'

/**
 * Valida un email
 * @param {string} email
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateEmail(email) {
  const trimmed = String(email || '').trim()
  
  if (!trimmed) {
    return { valid: false, error: 'El correo es requerido' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Formato de correo inválido' }
  }
  
  return { valid: true }
}

/**
 * Valida un token
 * @param {string} token
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateToken(token) {
  const trimmed = String(token || '').trim()
  
  if (!trimmed) {
    return { valid: false, error: 'El token es requerido' }
  }
  
  if (trimmed.length < 4) {
    return { valid: false, error: 'El token debe tener al menos 4 caracteres' }
  }
  
  return { valid: true }
}

/**
 * Valida una contraseña
 * @param {string} password
 * @returns {object} { valid: boolean, error?: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  
  return { valid: true }
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password1
 * @param {string} password2
 * @returns {object} { valid: boolean, error?: string }
 */
export function validatePasswordMatch(password1, password2) {
  if (password1 !== password2) {
    return { valid: false, error: 'Las contraseñas no coinciden' }
  }
  
  return { valid: true }
}

/**
 * Solicita un token de reset de contraseña
 * @param {string} email
 * @returns {Promise<object>}
 */
export async function requestPasswordReset(email) {
  const validation = validateEmail(email)
  
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  try {
    const response = await authApi.requestPasswordReset({ email: email.trim() })
    return response
  } catch (error) {
    throw new Error(
      error?.message || 'No se pudo enviar el email de recuperación. Intenta más tarde.'
    )
  }
}

/**
 * Confirma el reset de contraseña con un token
 * @param {string} token
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {Promise<object>}
 */
export async function confirmPasswordReset(token, newPassword, confirmPassword) {
  // Validar token
  const tokenValidation = validateToken(token)
  if (!tokenValidation.valid) {
    throw new Error(tokenValidation.error)
  }
  
  // Validar contraseña
  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error)
  }
  
  // Validar coincidencia
  const matchValidation = validatePasswordMatch(newPassword, confirmPassword)
  if (!matchValidation.valid) {
    throw new Error(matchValidation.error)
  }
  
  try {
    const response = await authApi.confirmPasswordReset({
      token: token.trim().toUpperCase(),
      newPassword,
    })
    return response
  } catch (error) {
    throw new Error(
      error?.message || 'No se pudo restablecer la contraseña. Verifica que el token sea válido.'
    )
  }
}

/**
 * Hook para manejar el estado del reset de contraseña
 * @param {function} setStatusMsg - Función para mostrar mensajes de estado
 * @returns {object} Hook API
 */
export function usePasswordReset(setStatusMsg) {
  const [passwordReset, setPasswordReset] = React.useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [isLoading, setIsLoading] = React.useState(false)
  
  const handleSetField = (field, value) => {
    setPasswordReset((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  
  const handleRequestReset = async (email) => {
    setIsLoading(true)
    try {
      const result = await requestPasswordReset(email)
      setStatusMsg(`✅ ${result?.message || 'Email de recuperación enviado'}`)
      return true
    } catch (error) {
      setStatusMsg(`❌ ${error.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConfirmReset = async (token, newPassword, confirmPassword) => {
    setIsLoading(true)
    try {
      await confirmPasswordReset(token, newPassword, confirmPassword)
      setStatusMsg('✅ Contraseña restablecida correctamente')
      // Limpiar estado
      setPasswordReset({
        email: '',
        token: '',
        newPassword: '',
        confirmPassword: '',
      })
      return true
    } catch (error) {
      setStatusMsg(`❌ ${error.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    passwordReset,
    isLoading,
    setField: handleSetField,
    requestReset: handleRequestReset,
    confirmReset: handleConfirmReset,
  }
}
