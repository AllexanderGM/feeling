/**
 * Interceptor global para peticiones fetch
 *
 * Este módulo reemplaza la función global fetch con una versión
 * que automáticamente añade el token de autenticación a todas las peticiones
 * que coincidan con la URL de la API
 */

// Funciones auxiliares para el manejo de tokens
const getAuthToken = () => {
  return (
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, '$1')
  )
}

/**
 * Inicializa el interceptor de fetch para añadir automáticamente el token a las peticiones
 * @param {string} apiUrl - URL base de la API (se añadirá el token solo a peticiones que la contengan)
 */
export const initializeAuthInterceptor = (apiUrl = '') => {
  console.log('🔄 Inicializando interceptor de autenticación para peticiones fetch')

  // Guardamos la implementación original de fetch
  const originalFetch = window.fetch

  // Reemplazamos con nuestra versión que añade el token
  window.fetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input.url

    // Solo interceptamos peticiones a nuestra API
    if (apiUrl && url.includes(apiUrl)) {
      const token = getAuthToken()

      if (token) {
        console.log(`🔐 Interceptando petición a ${url.substring(0, 30)}... y añadiendo token`)

        // Crear un nuevo objeto de configuración con los headers de autorización
        const modifiedInit = {
          ...init,
          headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${token}`
          }
        }

        // Usar la implementación original de fetch con nuestros headers modificados
        return originalFetch.call(this, input, modifiedInit)
      } else {
        console.warn(`⚠️ Petición a ${url.substring(0, 30)}... sin token de autenticación`)
      }
    }

    // Para otras URLs, usar la implementación original sin modificar
    return originalFetch.call(this, input, init)
  }

  console.log('✅ Interceptor de autenticación inicializado correctamente')
}

/**
 * Restaura la implementación original de fetch
 */
export const removeAuthInterceptor = () => {
  if (window._originalFetch) {
    window.fetch = window._originalFetch
    console.log('🔙 Restaurada implementación original de fetch')
  }
}

// Exportamos un objeto con nuestras funciones
export default {
  initializeAuthInterceptor,
  removeAuthInterceptor
}
