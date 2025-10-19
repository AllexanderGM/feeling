/**
 * UTILIDADES PARA AUTENTICACIÓN
 *
 * Este archivo contiene utilidades relacionadas con autenticación que NO son
 * esquemas de validación de formularios.
 *
 * RESPONSABILIDADES:
 * - Validaciones de formato (tokens, emails)
 * - Feedback de fortaleza de contraseña (para UI)
 * - Utilidades de procesamiento de datos de auth
 */

// ========================================
// VALIDACIONES DE FORMATO
// ========================================

/**
 * Valida si un token JWT tiene el formato correcto
 * @param {string} token - Token a validar
 * @returns {boolean} true si el formato es válido
 */
export const validateTokenFormat = token => {
  if (!token || typeof token !== 'string') return false
  // JWT básico tiene 3 partes separadas por puntos
  const parts = token.split('.')

  return parts.length === 3
}

/**
 * Valida si un email tiene formato válido (sin usar yup)
 * Útil para validaciones rápidas fuera de formularios
 * @param {string} email - Email a validar
 * @returns {boolean} true si el formato es válido
 */
export const isValidEmailFormat = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(email)
}

// ========================================
// FEEDBACK DE CONTRASEÑA PARA UI
// ========================================

/**
 * Calcula la fortaleza de una contraseña y proporciona feedback
 * Útil para mostrar indicadores visuales en tiempo real
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} { score, strength, feedback }
 */
export const getPasswordStrength = password => {
  if (!password) return { score: 0, feedback: 'Ingresa una contraseña' }

  let score = 0
  const feedback = []

  if (password.length >= 8) score += 1
  else feedback.push('Mínimo 8 caracteres')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Al menos una minúscula')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Al menos una mayúscula')

  if (/\d/.test(password)) score += 1
  else feedback.push('Al menos un número')

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Considera agregar símbolos')

  return {
    score,
    strength: score < 2 ? 'débil' : score < 4 ? 'media' : 'fuerte',
    feedback: feedback.length > 0 ? feedback : ['¡Contraseña segura!']
  }
}
