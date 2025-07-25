import { ServiceREST } from '@services/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'

/**
 * Servicio de autenticación simplificado - Solo comunicación con API
 */
class AuthService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
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

  async loginWithGoogle(tokenResponse) {
    const context = 'Login con Google'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        accessToken: tokenResponse.access_token
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  async registerWithGoogle(tokenResponse) {
    const context = 'Registro con Google'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.GOOGLE_REGISTER, {
        accessToken: tokenResponse.access_token
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  async verifyEmailCode(email, code) {
    const context = 'Verificación de email'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, code })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async resendVerificationCode(email) {
    const context = 'Reenvío de código de verificación'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async validateResetToken(token) {
    const context = 'Validación de token de recuperación'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN}/${encodeURIComponent(token)}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async forgotPassword(email) {
    const context = 'Recuperación de contraseña'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async resetPassword(token, password, confirmPassword) {
    const context = 'Restablecimiento de contraseña'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password, confirmPassword })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

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
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    error.operation = operation
    console.error(`Error en authService - ${operation}:`, ErrorManager.formatError(error))
  }
}

// Crear instancia única
const authService = new AuthService()

export default authService
