/**
 * KEYS DE COOKIES CENTRALIZADAS
 *
 * Define todas las claves de cookies utilizadas en la aplicación
 * para mantener consistencia y facilitar el mantenimiento
 */

export const COOKIE_KEYS = {
  // Autenticación
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  // Usuario - almacenado en localStorage (useLocalStorage hook)
  USER: 'current_user'
}

/**
 * KEYS DE LOCALSTORAGE CENTRALIZADAS
 *
 * Define todas las claves de localStorage utilizadas en la aplicación.
 * IMPORTANTE: Estas claves se pueden hacer específicas por usuario usando makeUserSpecificKey()
 */
export const STORAGE_KEYS = {
  // Datos del usuario actual (no necesita ser user-specific porque solo hay un usuario activo)
  USER: COOKIE_KEYS.USER,

  // Datos temporales que DEBEN ser user-specific
  PROFILE_COMPLETION_DRAFT: 'profile_completion_draft',
  USER_PREFERENCES: 'user_preferences',
  CACHED_FILTERS: 'cached_filters'
}

/**
 * Convierte una clave de localStorage en una clave específica por usuario
 *
 * @param {string} baseKey - Clave base
 * @param {string|number} userId - ID del usuario
 * @returns {string} - Clave específica del usuario (ej: 'profile_completion_draft_123')
 */
export const makeUserSpecificKey = (baseKey, userId) => {
  if (!userId) {
    // Si no hay userId, retornar la clave base (útil para desarrollo/debugging)
    return baseKey
  }

  return `${baseKey}_${userId}`
}

/**
 * Obtiene todas las claves de localStorage que son user-specific
 *
 * @returns {string[]} - Array de claves base que necesitan ser user-specific
 */
export const getUserSpecificKeys = () => {
  return [STORAGE_KEYS.PROFILE_COMPLETION_DRAFT, STORAGE_KEYS.USER_PREFERENCES, STORAGE_KEYS.CACHED_FILTERS]
}

/**
 * Limpia todos los datos user-specific de un usuario específico
 *
 * @param {string|number} userId - ID del usuario
 * @param {Object} localStorageApi - API de useLocalStorage hook
 * @returns {number} - Cantidad de items eliminados
 */
export const clearUserSpecificData = (userId, localStorageApi) => {
  if (!userId || !localStorageApi) return 0

  const userKeys = getUserSpecificKeys()
  let removed = 0

  userKeys.forEach(baseKey => {
    const userKey = makeUserSpecificKey(baseKey, userId)

    if (localStorageApi.remove(userKey)) {
      removed++
    }
  })

  return removed
}

/**
 * Determinar si estamos en producción
 * secure debe ser true solo en producción (HTTPS), false en desarrollo (HTTP)
 */
const forceSecureEnv = import.meta.env.VITE_FORCE_SECURE_COOKIES
const normalizedForceSecure = typeof forceSecureEnv === 'string' ? forceSecureEnv.trim().toLowerCase() : 'auto'

const runtimeProtocol = typeof window !== 'undefined' ? window.location?.protocol : undefined
const isHttpsRuntime = runtimeProtocol === 'https:'

const shouldUseSecureCookies = normalizedForceSecure === 'true' ? true : normalizedForceSecure === 'false' ? false : isHttpsRuntime

/**
 * Configuración de cookies por defecto
 */
export const COOKIE_CONFIG = {
  // Configuración para tokens (más segura)
  SECURE_TOKEN: {
    secure: shouldUseSecureCookies,
    sameSite: 'strict',
    httpOnly: false, // Debe ser false para acceso desde JS
    maxAge: 60 * 60 * 24 * 7 // 7 días
  },

  // Configuración para sesión temporal
  SESSION: {
    secure: shouldUseSecureCookies,
    sameSite: 'strict',
    httpOnly: false
    // Sin maxAge = cookie de sesión
  }
}

/**
 * Mapeo de keys a configuraciones
 */
export const COOKIE_KEY_CONFIG = {
  [COOKIE_KEYS.ACCESS_TOKEN]: COOKIE_CONFIG.SECURE_TOKEN,
  [COOKIE_KEYS.REFRESH_TOKEN]: COOKIE_CONFIG.SECURE_TOKEN
}

/**
 * Obtener configuración para una key específica
 *
 * @param {string} key - Key de la cookie
 * @returns {Object} - Configuración de la cookie
 */
export const getCookieConfig = key => {
  return COOKIE_KEY_CONFIG[key] || COOKIE_CONFIG.SESSION
}

/**
 * Validar que una key existe
 *
 * @param {string} key - Key a validar
 * @returns {boolean} - true si la key existe
 */
export const isValidCookieKey = key => {
  return Object.values(COOKIE_KEYS).includes(key)
}
