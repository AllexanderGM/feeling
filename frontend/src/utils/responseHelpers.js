/**
 * UTILIDADES PARA MANEJO DE RESPUESTAS DEL BACKEND
 *
 * Funciones auxiliares para validar, extraer y procesar
 * respuestas del backend de forma consistente.
 *
 * RESPONSABILIDAD:
 * - Validar estructura de respuestas
 * - Extraer datos de respuestas
 * - Manejar errores de respuestas
 */

// ========================================
// VALIDACIÓN DE ESTRUCTURA DE RESPUESTAS
// ========================================

/**
 * Verificar si un objeto tiene la estructura de usuario esperada
 * @param {Object} user - Usuario a validar
 * @returns {boolean} true si la estructura es válida
 */
export const isValidUserStructure = user => {
  return (
    user &&
    typeof user === 'object' &&
    user.status &&
    user.user &&
    typeof user.status === 'object' &&
    typeof user.user === 'object' &&
    typeof user.user.id === 'number'
  )
}

/**
 * Verificar si un objeto tiene la estructura de respuesta de login esperada
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si la estructura es válida
 */
export const isValidLoginResponse = response => {
  return (
    response &&
    typeof response === 'object' &&
    response.tokens &&
    typeof response.tokens === 'object' &&
    typeof response.tokens.accessToken === 'string' &&
    typeof response.tokens.refreshToken === 'string' &&
    response.status &&
    response.user &&
    typeof response.status === 'object' &&
    typeof response.user === 'object' &&
    typeof response.user.id === 'number'
  )
}

/**
 * Verificar si una respuesta es de error
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si es una respuesta de error
 */
export const isErrorResponse = response => {
  return response && typeof response === 'object' && response.success === false && response.error && typeof response.error === 'object'
}

/**
 * Verificar si una respuesta es de éxito
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si es una respuesta de éxito
 */
export const isSuccessResponse = response => {
  return response && typeof response === 'object' && response.success === true
}

// ========================================
// EXTRACCIÓN DE DATOS
// ========================================

/**
 * Extraer mensaje de error de una respuesta
 * @param {Object} response - Respuesta del backend
 * @returns {string} Mensaje de error
 */
export const extractErrorMessage = response => {
  if (!isErrorResponse(response)) return 'Error desconocido'

  if (response.error.validationErrors) {
    // Si hay errores de validación, tomar el primero
    const firstError = Object.values(response.error.validationErrors)[0]

    return Array.isArray(firstError) ? firstError[0] : firstError
  }

  return response.error.message || 'Error del servidor'
}

/**
 * Extraer datos de una respuesta exitosa
 * @param {Object} response - Respuesta del backend
 * @returns {any} Datos extraídos o null
 */
export const extractResponseData = response => {
  if (!isSuccessResponse(response)) return null

  return response.data || response
}

/**
 * Extraer tokens de una respuesta de autenticación
 * @param {Object} response - Respuesta de login/refresh
 * @returns {Object|null} { accessToken, refreshToken } o null
 */
export const extractTokens = response => {
  if (!response || !response.tokens) return null

  return {
    accessToken: response.tokens.accessToken || null,
    refreshToken: response.tokens.refreshToken || null
  }
}

/**
 * Extraer usuario de una respuesta de autenticación
 * @param {Object} response - Respuesta que contiene usuario
 * @returns {Object|null} Usuario completo o null
 */
export const extractUser = response => {
  if (!isValidUserStructure(response)) return null

  return response
}

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Verificar si un usuario está completamente autenticado
 * @param {Object} user - Usuario a verificar
 * @returns {boolean} true si está autenticado
 */
export const isUserAuthenticated = user => {
  return isValidUserStructure(user) && user.status.verified === true
}

/**
 * Verificar si un usuario tiene perfil completo
 * @param {Object} user - Usuario a verificar
 * @returns {boolean} true si el perfil está completo
 */
export const isUserProfileComplete = user => {
  return isValidUserStructure(user) && user.status.profileComplete === true
}

/**
 * Verificar si un usuario está aprobado
 * @param {Object} user - Usuario a verificar
 * @returns {boolean} true si está aprobado
 */
export const isUserApproved = user => {
  return isValidUserStructure(user) && user.status.approved === true
}

/**
 * Verificar si un usuario es admin
 * @param {Object} user - Usuario a verificar
 * @returns {boolean} true si es admin
 */
export const isUserAdmin = user => {
  return isValidUserStructure(user) && user.status.role === 'ADMIN'
}
