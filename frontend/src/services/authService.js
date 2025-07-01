import { BaseService } from '@services/baseService.js'
import { ErrorManager } from '@utils/errorManager.js'
import { COOKIE_OPTIONS } from '@config/config'

/**
 * Servicio de autenticación con manejo centralizado de errores
 */
class AuthService extends BaseService {
  constructor() {
    super()
    this.cookieHandler = null
  }

  // ========================================
  // CONFIGURACIÓN Y UTILIDADES
  // ========================================

  /**
   * Configurar el manejador de cookies
   * @param {Object} handler - Handler de cookies
   */
  setCookieHandler(handler) {
    this.cookieHandler = handler
  }

  /**
   * Verificar si tiene manejador de cookies
   * @returns {boolean} True si tiene handler
   */
  hasCookieHandler() {
    return this.cookieHandler !== null
  }

  /**
   * Obtener token de acceso
   * @returns {string|null} Token de acceso
   */
  getToken() {
    return this.cookieHandler?.get('access_token') || localStorage.getItem('token')
  }

  /**
   * Obtener refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return this.cookieHandler?.get('refresh_token') || localStorage.getItem('refreshToken')
  }

  /**
   * Guardar tokens de autenticación
   * @param {string} accessToken - Token de acceso
   * @param {string} refreshToken - Token de refresco
   */
  setTokens(accessToken, refreshToken) {
    try {
      if (this.cookieHandler) {
        this.cookieHandler.set('access_token', accessToken, COOKIE_OPTIONS)
        if (refreshToken) {
          this.cookieHandler.set('refresh_token', refreshToken, COOKIE_OPTIONS)
        }
      } else {
        localStorage.setItem('token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
      }
    } catch (error) {
      console.error('❌ Error guardando tokens:', error.message)
      throw new Error('Error al guardar tokens de autenticación')
    }
  }

  /**
   * Guardar datos de usuario
   * @param {Object} userData - Datos del usuario
   */
  setUser(userData) {
    try {
      if (this.cookieHandler) {
        this.cookieHandler.set('user', userData, COOKIE_OPTIONS)
      }
    } catch (error) {
      console.error('❌ Error guardando usuario:', error.message)
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuth() {
    try {
      if (this.cookieHandler) {
        this.cookieHandler.remove('access_token')
        this.cookieHandler.remove('refresh_token')
        this.cookieHandler.remove('user')
      }
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } catch (error) {
      console.error('❌ Error limpiando autenticación:', error.message)
    }
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ========================================

  /**
   * Registro de usuario
   * @param {Object} userData - Datos del usuario para registro
   * @returns {Promise<Object>} Datos de respuesta del registro
   */
  async register(userData) {
    try {
      const result = await BaseService.post('/auth/register', userData)
      return BaseService.handleServiceResponse(result, 'registro de usuario')
    } catch (error) {
      this.logError('registro', error)
      this.enrichAuthError(error, 'REGISTRATION_ERROR')
      throw error
    }
  }

  /**
   * Login con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Datos de respuesta del login
   */
  async login(email, password) {
    try {
      const result = await BaseService.post('/auth/login', { email, password })
      const data = BaseService.handleServiceResponse(result, 'inicio de sesión')
      // Procesar y guardar datos de autenticación
      this.processAuthResponse(data)
      return data
    } catch (error) {
      this.logError('login', error)
      this.enrichAuthError(error, 'LOGIN_ERROR')
      throw error
    }
  }

  /**
   * Login con Google
   * @param {Object} tokenResponse - Respuesta del token de Google
   * @returns {Promise<Object>} Datos de respuesta del login
   */
  async loginWithGoogle(tokenResponse) {
    try {
      const result = await BaseService.post('/auth/google/login', {
        accessToken: tokenResponse.access_token
      })

      const data = BaseService.handleServiceResponse(result, 'login con Google')
      // Procesar y guardar datos de autenticación
      this.processAuthResponse(data)
      return data
    } catch (error) {
      this.logError('login con Google', error)
      this.enrichAuthError(error, 'GOOGLE_LOGIN_ERROR')
      throw error
    }
  }

  /**
   * Registro con Google
   * @param {Object} tokenResponse - Respuesta del token de Google
   * @returns {Promise<Object>} Datos de respuesta del registro
   */
  async registerWithGoogle(tokenResponse) {
    try {
      const result = await BaseService.post('/auth/google/register', {
        accessToken: tokenResponse.access_token
      })

      const data = BaseService.handleServiceResponse(result, 'registro con Google')
      // Procesar y guardar datos de autenticación
      this.processAuthResponse(data)
      return data
    } catch (error) {
      this.logError('registro con Google', error)
      this.enrichAuthError(error, 'GOOGLE_REGISTER_ERROR')
      throw error
    }
  }

  /**
   * Verificar código de email
   * @param {string} email - Email del usuario
   * @param {string} code - Código de verificación
   * @returns {Promise<Object>} Datos de respuesta de la verificación
   */
  async verifyEmailCode(email, code) {
    try {
      const result = await BaseService.post('/auth/verify-email', {
        email: email.toLowerCase().trim(),
        code
      })
      const data = BaseService.handleServiceResponse(result, 'verificación de email')

      // Si la verificación incluye tokens, procesarlos
      if (data.accessToken) {
        this.processAuthResponse(data)
      }

      return data
    } catch (error) {
      this.logError('verificación de email', error)
      this.enrichAuthError(error, 'EMAIL_VERIFICATION_ERROR')
      throw error
    }
  }

  /**
   * Reenviar código de verificación
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Datos de respuesta del reenvío
   */
  async resendVerificationCode(email) {
    try {
      const result = await BaseService.post('/auth/resend-verification', {
        email: email.toLowerCase().trim()
      })
      const data = BaseService.handleServiceResponse(result, 'reenvío de código de verificación')
      return data
    } catch (error) {
      this.logError('reenvío de código', error)
      this.enrichAuthError(error, 'RESEND_CODE_ERROR')
      throw error
    }
  }

  /**
   * Validar token de recuperación de contraseña
   * @param {string} token - Token de recuperación
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validateResetToken(token) {
    try {
      const result = await BaseService.get(`/auth/validate-reset-token/${encodeURIComponent(token)}`)
      return BaseService.handleServiceResponse(result, 'validación de token de recuperación')
    } catch (error) {
      this.logError('validación de token', error)
      this.enrichAuthError(error, 'TOKEN_VALIDATION_ERROR')
      throw error
    }
  }

  /**
   * Recuperar contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Datos de respuesta de recuperación
   */
  async forgotPassword(email) {
    try {
      const result = await BaseService.post('/auth/forgot-password', {
        email: email.toLowerCase().trim()
      })
      const data = BaseService.handleServiceResponse(result, 'recuperación de contraseña')
      return data
    } catch (error) {
      this.logError('recuperación de contraseña', error)
      this.enrichAuthError(error, 'FORGOT_PASSWORD_ERROR')
      throw error
    }
  }

  /**
   * Restablecer contraseña (versión mejorada)
   * @param {string} token - Token de restablecimiento
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de contraseña (opcional)
   * @returns {Promise<Object>} Datos de respuesta del restablecimiento
   */
  async resetPassword(token, newPassword, confirmPassword = null) {
    try {
      // Preparar payload
      const payload = {
        token,
        password: newPassword
      }

      // Agregar confirmPassword si se proporciona (validación extra)
      if (confirmPassword) {
        payload.confirmPassword = confirmPassword
      }

      const result = await BaseService.post('/auth/reset-password', payload)
      const data = BaseService.handleServiceResponse(result, 'restablecimiento de contraseña')

      // Limpiar autenticación local si había tokens previos
      this.clearAuth()

      return data
    } catch (error) {
      this.logError('restablecimiento de contraseña', error)
      this.enrichAuthError(error, 'RESET_PASSWORD_ERROR')
      throw error
    }
  }

  /**
   * Obtener usuario actual
   * @returns {Promise<Object>} Datos del usuario actual
   */
  async getCurrentUser() {
    try {
      const token = this.getToken()
      if (!token) throw new Error('No hay token de acceso')
      const result = await BaseService.get('/auth/me')
      const data = BaseService.handleServiceResponse(result, 'obtener usuario actual')
      return data
    } catch (error) {
      // Si es 401, limpiar autenticación automáticamente
      if (error.response?.status === 401) {
        this.clearAuth()
      }

      this.logError('obtener usuario actual', error)
      this.enrichAuthError(error, 'GET_USER_ERROR')
      throw error
    }
  }

  /**
   * Actualizar perfil
   * @param {Object} userData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Datos del perfil actualizado
   */
  async updateProfile(userData) {
    try {
      const result = await BaseService.put('/users/profile', userData)
      const data = BaseService.handleServiceResponse(result, 'actualización de perfil')
      // Actualizar usuario en cookies
      this.setUser(data)
      return data
    } catch (error) {
      this.logError('actualización de perfil', error)
      this.enrichAuthError(error, 'UPDATE_PROFILE_ERROR')
      throw error
    }
  }

  /**
   * Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async checkEmailAvailability(email) {
    try {
      const result = await BaseService.get(`/auth/check-email/${encodeURIComponent(email.toLowerCase().trim())}`)
      return BaseService.handleServiceResponse(result, 'verificación de disponibilidad de email')
    } catch (error) {
      this.logError('verificación de email', error)
      this.enrichAuthError(error, 'EMAIL_CHECK_ERROR')
      throw error
    }
  }

  /**
   * Verificar método de autenticación
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Método de autenticación
   */
  async checkAuthMethod(email) {
    try {
      const result = await BaseService.get(`/auth/check-method/${encodeURIComponent(email.toLowerCase().trim())}`)
      return BaseService.handleServiceResponse(result, 'verificación de método de autenticación')
    } catch (error) {
      this.logError('verificación de método de autenticación', error)
      this.enrichAuthError(error, 'AUTH_METHOD_CHECK_ERROR')
      throw error
    }
  }

  /**
   * Refresh token
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const result = await BaseService.post('/auth/refresh-token', {
        refreshToken
      })

      const data = BaseService.handleServiceResponse(result, 'renovación de token')

      // Actualizar solo el access token, mantener refresh token
      this.setTokens(data.accessToken, refreshToken)
      return data
    } catch (error) {
      // Si falla el refresh, limpiar autenticación
      this.clearAuth()

      this.logError('renovación de token', error)
      this.enrichAuthError(error, 'REFRESH_TOKEN_ERROR')
      throw error
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const token = this.getToken()

      if (token) {
        // Intentar cerrar sesión en el servidor
        try {
          await BaseService.post('/auth/logout')
        } catch (error) {
          console.warn('⚠️ Error al cerrar sesión en el servidor:', error.message)
          // Continuar con logout local aunque falle el servidor
        }
      }

      // Limpiar autenticación local siempre
      this.clearAuth()
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error.message)
      // Siempre limpiar autenticación local aunque falle
      this.clearAuth()
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    const token = this.getToken()
    const user = this.cookieHandler?.get('user')
    return !!(token && user)
  }

  /**
   * Obtener usuario desde cookies
   * @returns {Object|null} Datos del usuario o null
   */
  getUserFromCookies() {
    return this.cookieHandler?.get('user') || null
  }

  /**
   * Verificar si el token está próximo a expirar
   * @returns {boolean} True si expira pronto
   */
  isTokenExpiringSoon() {
    const token = this.getToken()
    if (!token) return true

    try {
      // Decodificar JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      const timeLeft = payload.exp - now

      // Considerar que expira pronto si quedan menos de 5 minutos
      return timeLeft < 300
    } catch (error) {
      console.warn('⚠️ Error al verificar expiración del token:', error.message)
      return true
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ========================================

  /**
   * Procesar respuesta de autenticación y guardar datos
   * @param {Object} data - Datos de respuesta de autenticación
   * @private
   */
  processAuthResponse(data) {
    try {
      const { accessToken, refreshToken, image, email, name, lastName, role, verified, completeProfile } = data

      const user = {
        image,
        email,
        name,
        lastName,
        role,
        verified,
        completeProfile
      }

      // Guardar tokens y usuario
      this.setTokens(accessToken, refreshToken)
      this.setUser(user)
    } catch (error) {
      console.error('❌ Error procesando respuesta de autenticación:', error.message)
      throw new Error('Error procesando datos de autenticación')
    }
  }

  /**
   * Enriquecer error con información específica de autenticación
   * @param {Error} error - Error original
   * @param {string} defaultType - Tipo de error por defecto
   * @private
   */
  enrichAuthError(error, defaultType) {
    error.errorType = error.response?.data?.type || defaultType
    error.fieldErrors = ErrorManager.getFieldErrors(error)
    error.authContext = true
  }

  /**
   * Log de errores estructurado para autenticación
   * @param {string} operation - Operación que falló
   * @param {Error} error - Error ocurrido
   * @private
   */
  logError(operation, error) {
    console.error(`❌ Error en ${operation}:`, {
      type: error.errorType || ErrorManager.getErrorType(error),
      message: error.message,
      status: error.response?.status,
      operation
    })
  }
}

// Crear instancia única
const authService = new AuthService()

export default authService
