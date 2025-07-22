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
  USER: 'user'
}

/**
 * Configuración de cookies por defecto
 */
export const COOKIE_CONFIG = {
  // Configuración para tokens (más segura)
  SECURE_TOKEN: {
    secure: true,
    sameSite: 'strict',
    httpOnly: false, // Debe ser false para acceso desde JS
    maxAge: 60 * 60 * 24 * 7 // 7 días
  },

  // Configuración para datos de usuario
  USER_DATA: {
    secure: true,
    sameSite: 'strict',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30 // 30 días
  },

  // Configuración para preferencias (persistente)
  PREFERENCES: {
    secure: false, // Menos restrictivo para preferencias
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365 // 1 año
  },

  // Configuración para sesión temporal
  SESSION: {
    secure: true,
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
  [COOKIE_KEYS.REFRESH_TOKEN]: COOKIE_CONFIG.SECURE_TOKEN,
  [COOKIE_KEYS.USER]: COOKIE_CONFIG.USER_DATA,
  [COOKIE_KEYS.THEME]: COOKIE_CONFIG.PREFERENCES,
  [COOKIE_KEYS.LANGUAGE]: COOKIE_CONFIG.PREFERENCES,
  [COOKIE_KEYS.SIDEBAR_COLLAPSED]: COOKIE_CONFIG.PREFERENCES,
  [COOKIE_KEYS.TABLE_PAGE_SIZE]: COOKIE_CONFIG.PREFERENCES,
  [COOKIE_KEYS.TERMS_ACCEPTED]: COOKIE_CONFIG.USER_DATA,
  [COOKIE_KEYS.PRIVACY_ACCEPTED]: COOKIE_CONFIG.USER_DATA,
  [COOKIE_KEYS.ONBOARDING_COMPLETED]: COOKIE_CONFIG.USER_DATA,
  [COOKIE_KEYS.FEATURE_TOUR_SEEN]: COOKIE_CONFIG.PREFERENCES,
  [COOKIE_KEYS.DEBUG_MODE]: COOKIE_CONFIG.SESSION,
  [COOKIE_KEYS.API_BASE_URL]: COOKIE_CONFIG.SESSION
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
