import axios from 'axios'
import { ErrorManager } from '@utils/errorManager'

const API_URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8081'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
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

// Función para registrar callbacks del AuthContext
export const registerAuthCallbacks = callbacks => {
  authCallbacks = callbacks
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
    // Solo obtener token de cookies
    const token = getCookieValue('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar renovar el token usando solo cookies
        const refreshToken = getCookieValue('refresh_token')

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          })

          const newToken = response.data.accessToken || response.data.token

          if (newToken) {
            // Notificar al AuthContext para que actualice el token
            emitTokenUpdate(newToken)

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError)

        // Notificar al AuthContext sobre el error de autenticación
        const authError = new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        authError.errorType = 'AUTHENTICATION_ERROR'
        authError.status = 401
        authError.response = { status: 401 }

        emitAuthError(authError)
        return Promise.reject(authError)
      }

      // Si no hay refresh token, es error de autenticación
      const authError = new Error('No estás autorizado. Inicia sesión nuevamente.')
      authError.errorType = 'AUTHENTICATION_ERROR'
      authError.status = 401
      authError.response = { status: 401 }

      emitAuthError(authError)
      return Promise.reject(authError)
    }

    // Para otros errores 401, también notificar
    if (error.response?.status === 401) {
      error.errorType = 'AUTHENTICATION_ERROR'
      emitAuthError(error)
    }

    error.errorType = ErrorManager.getErrorType(error)
    error.formattedMessage = ErrorManager.getErrorMessage(error)

    return Promise.reject(error)
  }
)

export default api
