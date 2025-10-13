import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'
import { HTTP_STATUS } from '@schemas'

/**
 * Servicio de autenticación - AuthController
 * Gestiona registro, login, tokens y verificaciones de estado
 *
 * Nota: Verificación de emails → verificationService
 *       Gestión de contraseñas → passwordService
 *       OAuth (Google, Facebook, Apple) → oauthService
 */
class AuthService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // REGISTRO Y LOGIN
  // ========================================

  async register(userData) {
    const context = 'Registro de usuario'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.REGISTER, userData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  async login(email, password) {
    const context = 'Inicio de sesión'

    try {
      const loginData = { email, password }
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.LOGIN, loginData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  // ========================================
  // GESTIÓN DE TOKENS
  // ========================================

  async refreshToken(refreshToken) {
    const context = 'Renovación de token'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async logout(token) {
    const context = 'Cierre de sesión'

    try {
      await ServiceREST.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { headers: { Authorization: `Bearer ${token}` } })

      return { success: true, message: 'Sesión cerrada exitosamente' }
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // VERIFICACIONES Y ESTADO
  // ========================================

  async checkEmailAvailability(email) {
    const context = 'Verificación de disponibilidad de email'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.AUTH.CHECK_EMAIL}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async checkAuthMethod(email) {
    const context = 'Verificación de método de autenticación'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.AUTH.CHECK_METHOD}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getUserStatus(email) {
    const context = 'Estado del usuario'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.AUTH.STATUS}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    // Solo loguear errores de autenticación específicos, otros ya se manejan en ServiceREST
    if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED || error?.response?.status === HTTP_STATUS.FORBIDDEN) {
      error.operation = operation
      Logger.authError(operation, error, 'authService')
    }
  }
}

// Crear instancia única
const authService = new AuthService()

export default authService
