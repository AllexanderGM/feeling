import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'
import { HTTP_STATUS } from '@schemas'

/**
 * Servicio de verificación de emails
 * Gestiona la verificación de cuentas y validación de emails
 */
class VerificationService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // VERIFICACIÓN DE EMAIL
  // ========================================

  async verifyEmail(email, code) {
    const context = 'Verificación de email'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.VERIFICATION.VERIFY_EMAIL, {
        email,
        code
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async resendCode(email) {
    const context = 'Reenvío de código de verificación'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.VERIFICATION.RESEND_CODE, { email })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // VALIDACIONES DE EMAIL
  // ========================================

  async checkEmailAvailability(email) {
    const context = 'Verificación de disponibilidad de email'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.VERIFICATION.CHECK_EMAIL}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getUserVerificationStatus(email) {
    const context = 'Estado de verificación del usuario'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.VERIFICATION.STATUS}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async validateCode(email, code) {
    const context = 'Validación de código de verificación'

    try {
      const result = await ServiceREST.get(
        `${API_ENDPOINTS.VERIFICATION.VALIDATE_CODE}?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
      )

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // LIMPIEZA (ADMIN)
  // ========================================

  async cleanupExpiredCodes(token) {
    const context = 'Limpieza de códigos expirados'

    try {
      const result = await ServiceREST.post(
        API_ENDPOINTS.VERIFICATION.CLEANUP_EXPIRED,
        {},
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
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    // Solo loguear errores específicos, otros ya se manejan en ServiceREST
    if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED || error?.response?.status === HTTP_STATUS.FORBIDDEN) {
      error.operation = operation
      Logger.authError(operation, error, 'verificationService')
    }
  }
}

// Crear instancia única
const verificationService = new VerificationService()

export default verificationService
