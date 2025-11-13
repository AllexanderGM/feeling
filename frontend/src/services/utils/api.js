import axios from 'axios'
import { ErrorManager } from '@utils/errorManager'
import { Logger } from '@utils/logger.js'
import { isPublicRoute } from '@constants/apiRoutes'

const API_URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8081'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

// Función para obtener cookies
function getCookieValue(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) return parts.pop().split(';').shift()

  return null
}

// Variable para callbacks del AuthContext
let authCallbacks = null

// Variable para callback del RateLimitContext
let rateLimitCallback = null

// Variable para controlar el estado de renovación
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Función para registrar callbacks del AuthContext
export const registerAuthCallbacks = callbacks => {
  authCallbacks = callbacks
}

// Función para registrar callback del RateLimitContext
export const registerRateLimitCallback = callback => {
  rateLimitCallback = callback
}

// Función para emitir eventos de actualización de token
const emitTokenUpdate = newToken => {
  if (authCallbacks?.updateAccessToken) {
    authCallbacks.updateAccessToken(newToken)
  }

  // También emitir evento como fallback
  const event = new CustomEvent('tokenUpdated', {
    detail: { token: newToken }
  })

  window.dispatchEvent(event)
}

// Función para emitir eventos de error de autenticación
const emitAuthError = error => {
  if (authCallbacks?.clearAllAuth) {
    authCallbacks.clearAllAuth()
  }

  // También emitir evento como fallback
  const event = new CustomEvent('authError', {
    detail: error
  })

  window.dispatchEvent(event)
}

// Interceptor para requests
api.interceptors.request.use(
  config => {
    // Solo agregar token si NO es una ruta pública
    if (!isPublicRoute(config.url)) {
      const token = getCookieValue('access_token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Si es FormData, eliminar Content-Type para que el browser lo maneje automáticamente
    if (config.data instanceof FormData) {
      // Eliminar todas las variantes de Content-Type
      delete config.headers['Content-Type']
      delete config.headers['content-type']
      delete config.headers['Content-type']
      delete config.headers['CONTENT-TYPE']
    }

    return config
  },
  error => Promise.reject(error)
)

// Interceptor para responses
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // No intentar renovar token para rutas públicas
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicRoute(originalRequest.url)) {
      originalRequest._retry = true

      if (isRefreshing) {
        // Si ya se está renovando el token, agregar esta petición a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`

            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        // Intentar renovar el token usando solo cookies
        const refreshToken = getCookieValue('refresh_token')

        if (refreshToken) {
          Logger.debug(Logger.CATEGORIES.AUTH, 'renovar token automático', 'Intentando renovar token después de error 401', {
            context: { hasRefreshToken: !!refreshToken, refreshTokenLength: refreshToken?.length }
          })

          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          })

          // El backend devuelve los tokens dentro de un objeto "tokens"
          const accessToken = response.data.tokens?.accessToken || response.data.accessToken || response.data.token
          const refreshTokenNew = response.data.tokens?.refreshToken || response.data.refreshToken

          if (accessToken) {
            Logger.info('Tokens renovados exitosamente en interceptor')

            // Notificar al AuthContext para que actualice ambos tokens
            emitTokenUpdate(accessToken)

            // Si hay un nuevo refresh token, actualizar las cookies también
            if (refreshTokenNew && authCallbacks.updateRefreshToken) {
              authCallbacks.updateRefreshToken(refreshTokenNew)
            }

            // Procesar cola de peticiones pendientes
            processQueue(null, accessToken)

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`

            return api(originalRequest)
          } else {
            Logger.error('No se recibió nuevo token en la respuesta')
            throw new Error('No token received')
          }
        } else {
          // Debuggear todas las cookies disponibles
          const allCookies = document.cookie
          const cookieNames = allCookies.split(';').map(c => c.trim().split('=')[0])

          Logger.warn(Logger.CATEGORIES.AUTH, 'renovar token', 'No hay refresh token disponible', {
            context: {
              allCookieNames: cookieNames,
              hasAccessToken: !!getCookieValue('access_token'),
              fullCookieString: document.cookie
            }
          })
          throw new Error('No refresh token available')
        }
      } catch (refreshError) {
        Logger.authError('Error al renovar token', refreshError, 'api')

        // Procesar cola de peticiones con error
        processQueue(refreshError, null)

        // Notificar al AuthContext sobre el error de autenticación
        const authError = new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')

        authError.errorType = 'AUTHENTICATION_ERROR'
        authError.status = 401
        authError.response = { status: 401 }
        authError._handledByInterceptor = true

        emitAuthError(authError)

        return Promise.reject(authError)
      } finally {
        isRefreshing = false
      }
    }

    // Manejo mejorado de rate limiting (429)
    if (error.response?.status === 429) {
      Logger.warn('Rate limit alcanzado - mostrando modal informativo', {
        error: error.response?.data,
        url: originalRequest.url
      })

      // Formatear error específicamente para rate limiting
      const rateLimitError = ErrorManager.formatRateLimitError(error)

      // Mostrar modal de rate limiting si hay callback registrado
      if (rateLimitCallback) {
        rateLimitCallback(rateLimitError)
      }

      // Marcar como manejado y rechazar
      error.errorType = 'RATE_LIMIT_ERROR'
      error._handledByInterceptor = true
      error._showModal = true // Flag para evitar mostrar toast adicional

      return Promise.reject(rateLimitError)
    }

    // Para otros errores 401 en rutas NO públicas, también notificar
    if (error.response?.status === 401 && !isPublicRoute(error.config?.url)) {
      error.errorType = 'AUTHENTICATION_ERROR'
      error._handledByInterceptor = true // Marcar como manejado por interceptor
      emitAuthError(error)
    }

    error.errorType = ErrorManager.getErrorType(error)
    error.formattedMessage = ErrorManager.getErrorMessage(error)

    return Promise.reject(error)
  }
)

export default api
