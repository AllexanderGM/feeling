/**
 * Utilidades mejoradas para manejar el token de autenticación
 *
 * Este módulo proporciona funciones para obtener y manipular el token de
 * autenticación desde localStorage, sessionStorage o cookies, con
 * mejor manejo de errores y depuración.
 */

/**
 * Lista todas las claves en localStorage para ayudar en la depuración
 * @returns {Object} Objeto con todas las claves y valores en localStorage
 */
export const logAllLocalStorage = () => {
  const allItems = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    allItems[key] = localStorage.getItem(key)
  }
  console.log('Todos los items en localStorage:', allItems)
  return allItems
}

/**
 * Obtiene el token de autenticación con logging detallado
 * @param {boolean} verbose - Si es true, imprime información detallada de depuración
 * @returns {string|null} El token de autenticación o null si no se encuentra
 */
export const getAuthToken = (verbose = false) => {
  // Primero, buscamos en localStorage
  let token = localStorage.getItem('auth_token')

  if (verbose) {
    console.log('🔍 Buscando token en localStorage...')
    if (token) {
      console.log('✅ Token encontrado en localStorage:', `${token.substring(0, 10)}...`)
    } else {
      console.log('❌ Token no encontrado en localStorage')
      logAllLocalStorage()
    }
  }

  // Si no está en localStorage, intentamos en sessionStorage
  if (!token) {
    token = sessionStorage.getItem('auth_token')

    if (verbose) {
      if (token) {
        console.log('✅ Token encontrado en sessionStorage:', `${token.substring(0, 10)}...`)
      } else {
        console.log('❌ Token no encontrado en sessionStorage')
      }
    }
  }

  // Si aún no lo encontramos, buscamos en cookies
  if (!token) {
    // Buscamos tanto 'auth_token' como posiblemente 'token'
    const cookieMatch = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/) || document.cookie.match(/(?:^|;\s*)token=([^;]*)/)

    if (cookieMatch) {
      token = cookieMatch[1]
    }

    if (verbose) {
      if (token) {
        console.log('✅ Token encontrado en cookies:', `${token.substring(0, 10)}...`)
      } else {
        console.log('❌ Token no encontrado en cookies')
        console.log('📝 Cookies disponibles:', document.cookie)
      }
    }
  }

  return token || null
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si hay un token válido, false en caso contrario
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

/**
 * Añade el token de autenticación a los headers para hacer peticiones
 * @param {object} headers - Headers existentes o un objeto vacío
 * @param {boolean} verbose - Si es true, imprime información detallada de depuración
 * @returns {object} Headers con el token de autorización añadido si existe
 */
export const addAuthHeaders = (headers = {}, verbose = false) => {
  const token = getAuthToken(verbose)

  if (token) {
    if (verbose) {
      console.log('🔐 Añadiendo token a headers:', `${token.substring(0, 10)}...`)
    }

    return {
      ...headers,
      Authorization: `Bearer ${token}`
    }
  }

  if (verbose) {
    console.warn('⚠️ No se pudo añadir token a headers porque no se encontró ninguno')
  }

  return headers
}

/**
 * Función para realizar peticiones autenticadas con mejor manejo de errores
 * @param {string} url - URL para la petición
 * @param {object} options - Opciones para fetch (method, body, etc.)
 * @param {boolean} verbose - Si es true, imprime información detallada de depuración
 * @returns {Promise} Promesa con la respuesta
 */
export const authFetch = async (url, options = {}, verbose = false) => {
  if (verbose) {
    console.log(`🌐 Realizando petición autenticada a ${url}`)
  }

  // Añadir headers de autenticación
  const authOptions = {
    ...options,
    headers: addAuthHeaders(options.headers || {}, verbose)
  }

  try {
    const response = await fetch(url, authOptions)

    if (verbose) {
      console.log(`📩 Respuesta recibida: ${response.status} ${response.statusText}`)
    }

    // Manejo específico para diferentes errores
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('🚫 Sesión expirada o no autorizado')
        // Podríamos lanzar un evento personalizado para manejar esto globalmente
        document.dispatchEvent(new CustomEvent('auth:expired'))
      }

      // Intentamos extraer el mensaje de error del cuerpo
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.clone().json()
        if (errorData && errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // Si no podemos extraer el json, usamos el mensaje de error general
      }

      if (verbose) {
        console.error(`❌ Error en la petición: ${errorMessage}`)
      }

      throw new Error(errorMessage)
    }

    return response
  } catch (error) {
    if (verbose) {
      console.error('❌ Error en fetch autenticado:', error)
    }
    throw error
  }
}

/**
 * Guarda el token de autenticación en localStorage y opcionalmente en una cookie
 * @param {string} token - Token a almacenar
 * @param {boolean} rememberMe - Si se debe guardar también como cookie persistente
 */
export const saveAuthToken = (token, rememberMe = false) => {
  if (!token) {
    console.error('❌ Intentando guardar un token vacío o nulo')
    return
  }

  // Guardar en localStorage para acceso rápido
  localStorage.setItem('auth_token', token)
  console.log('💾 Token guardado en localStorage')

  // Si rememberMe está activado, guardar también como cookie con expiración
  if (rememberMe) {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 30) // 30 días

    document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
    console.log('🍪 Token guardado en cookies (duración: 30 días)')
  }
}

/**
 * Elimina el token de autenticación de todos los almacenamientos
 */
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_token')
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  console.log('🧹 Token de autenticación eliminado de todos los almacenamientos')
}

/**
 * Imprime información detallada del estado de autenticación actual
 */
export const debugAuthStatus = () => {
  console.group('📊 Estado de autenticación')

  const localStorageToken = localStorage.getItem('auth_token')
  console.log('localStorage:', localStorageToken ? `Token presente (${localStorageToken.substring(0, 10)}...)` : 'Token no encontrado')

  const sessionStorageToken = sessionStorage.getItem('auth_token')
  console.log(
    'sessionStorage:',
    sessionStorageToken ? `Token presente (${sessionStorageToken.substring(0, 10)}...)` : 'Token no encontrado'
  )

  const cookieToken = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/)
  console.log('cookies:', cookieToken ? `Token presente (${cookieToken[1].substring(0, 10)}...)` : 'Token no encontrado')

  console.log('¿Usuario autenticado?', isAuthenticated() ? 'Sí' : 'No')

  console.groupEnd()
}

export default {
  getAuthToken,
  isAuthenticated,
  addAuthHeaders,
  authFetch,
  saveAuthToken,
  clearAuthToken,
  debugAuthStatus,
  logAllLocalStorage
}
