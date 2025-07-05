import { ServiceREST } from '@services/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'

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
    try {
      const result = await ServiceREST.post('/auth/register', userData)
      return ServiceREST.handleServiceResponse(result, 'registro de usuario')
    } catch (error) {
      this.logError('registro', error)
      throw error
    }
  }

  async login(email, password) {
    try {
      const result = await ServiceREST.post('/auth/login', { email, password })
      return ServiceREST.handleServiceResponse(result, 'inicio de sesión')
    } catch (error) {
      this.logError('login', error)
      throw error
    }
  }

  async loginWithGoogle(tokenResponse) {
    try {
      const result = await ServiceREST.post('/auth/google/login', {
        accessToken: tokenResponse.access_token
      })

      return ServiceREST.handleServiceResponse(result, 'login con Google')
    } catch (error) {
      this.logError('login con Google', error)
      throw error
    }
  }

  async registerWithGoogle(tokenResponse) {
    try {
      const result = await ServiceREST.post('/auth/google/register', {
        accessToken: tokenResponse.access_token
      })

      return ServiceREST.handleServiceResponse(result, 'registro con Google')
    } catch (error) {
      this.logError('registro con Google', error)
      throw error
    }
  }

  async verifyEmailCode(email, code) {
    try {
      const result = await ServiceREST.post('/auth/verify-email', { email, code })
      return ServiceREST.handleServiceResponse(result, 'verificación de email')
    } catch (error) {
      this.logError('verificación de email', error)
      throw error
    }
  }

  async resendVerificationCode(email) {
    try {
      const result = await ServiceREST.post('/auth/resend-verification', { email })
      return ServiceREST.handleServiceResponse(result, 'reenvío de código de verificación')
    } catch (error) {
      this.logError('reenvío de código', error)
      throw error
    }
  }

  async validateResetToken(token) {
    try {
      const result = await ServiceREST.get(`/auth/validate-reset-token/${encodeURIComponent(token)}`)
      return ServiceREST.handleServiceResponse(result, 'validación de token de recuperación')
    } catch (error) {
      this.logError('validación de token', error)
      throw error
    }
  }

  async forgotPassword(email) {
    try {
      const result = await ServiceREST.post('/auth/forgot-password', { email })
      return ServiceREST.handleServiceResponse(result, 'recuperación de contraseña')
    } catch (error) {
      this.logError('recuperación de contraseña', error)
      throw error
    }
  }

  async resetPassword(token, password, confirmPassword) {
    try {
      const payload = { token, password, confirmPassword }
      console.log('🔍 Datos enviados al backend:', payload)
      const result = await ServiceREST.post('/auth/reset-password', payload)
      return ServiceREST.handleServiceResponse(result, 'restablecimiento de contraseña')
    } catch (error) {
      this.logError('restablecimiento de contraseña', error)
      throw error
    }
  }

  async getCurrentUser(token) {
    try {
      const result = await ServiceREST.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return ServiceREST.handleServiceResponse(result, 'obtener usuario actual')
    } catch (error) {
      this.logError('obtener usuario actual', error)
      throw error
    }
  }

  async checkEmailAvailability(email) {
    try {
      const result = await ServiceREST.get(`/auth/check-email/${encodeURIComponent(email)}`)
      return ServiceREST.handleServiceResponse(result, 'verificación de disponibilidad de email')
    } catch (error) {
      this.logError('verificación de email', error)
      throw error
    }
  }

  async checkAuthMethod(email) {
    try {
      const result = await ServiceREST.get(`/auth/check-method/${encodeURIComponent(email)}`)
      return ServiceREST.handleServiceResponse(result, 'verificación de método de autenticación')
    } catch (error) {
      this.logError('verificación de método de autenticación', error)
      throw error
    }
  }

  async refreshToken(refreshToken) {
    try {
      const result = await ServiceREST.post('/auth/refresh-token', { refreshToken })
      return ServiceREST.handleServiceResponse(result, 'renovación de token')
    } catch (error) {
      this.logError('renovación de token', error)
      throw error
    }
  }

  async logout(token) {
    try {
      await ServiceREST.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
      return { success: true, message: 'Sesión cerrada exitosamente' }
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error.message)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    error.operation = operation
    console.error(`❌ Error en ${operation}:`, ErrorManager.formatError(error))
  }
}

// Crear instancia única
const authService = new AuthService()

export default authService
