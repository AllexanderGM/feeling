import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'
import { HTTP_STATUS } from '@schemas'

/**
 * Servicio de gestión de contraseñas
 * Incluye recuperación, cambio y validación de contraseñas
 */
class PasswordService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ========================================

  async forgotPassword(email) {
    const context = 'Recuperación de contraseña'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.PASSWORD.FORGOT, { email })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async resetPassword(token, password, confirmPassword) {
    const context = 'Restablecimiento de contraseña'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.PASSWORD.RESET, {
        token,
        password,
        confirmPassword
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async validateResetToken(token) {
    const context = 'Validación de token de recuperación'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.PASSWORD.VALIDATE_RESET_TOKEN}/${encodeURIComponent(token)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CAMBIO DE CONTRASEÑA (AUTENTICADO)
  // ========================================

  async changePassword(currentPassword, newPassword, confirmPassword, token) {
    const context = 'Cambio de contraseña'

    try {
      const result = await ServiceREST.post(
        API_ENDPOINTS.PASSWORD.CHANGE,
        {
          currentPassword,
          newPassword,
          confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // VALIDACIÓN DE CONTRASEÑAS
  // ========================================

  async validatePassword(password, email = null) {
    const context = 'Validación de contraseña'

    try {
      const payload = { password }

      if (email) {
        payload.email = email
      }

      const result = await ServiceREST.post(API_ENDPOINTS.PASSWORD.VALIDATE, payload)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getPasswordSuggestions() {
    const context = 'Sugerencias de contraseñas'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.PASSWORD.SUGGESTIONS)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getPasswordPolicy() {
    const context = 'Política de contraseñas'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.PASSWORD.POLICY)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async checkCompromised(password) {
    const context = 'Verificación de contraseña comprometida'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.PASSWORD.CHECK_COMPROMISED, { password })

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
    // Solo loguear errores específicos, otros ya se manejan en ServiceREST
    if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED || error?.response?.status === HTTP_STATUS.FORBIDDEN) {
      error.operation = operation
      Logger.authError(operation, error, 'passwordService')
    }
  }
}

// Crear instancia única
const passwordService = new PasswordService()

export default passwordService
