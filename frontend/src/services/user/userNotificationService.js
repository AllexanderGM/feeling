import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de notificaciones de usuario - UserNotificationController
 * Gestiona el envío de emails y notificaciones a usuarios
 */
class UserNotificationService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ONBOARDING & PROFILE
  // ========================================

  /**
   * POST /user-notifications/{userId}/welcome - Enviar email de bienvenida
   */
  async sendWelcomeEmail(userId) {
    const context = 'enviar email de bienvenida'

    try {
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.WELCOME.replace('{userId}', userId)
      const result = await ServiceREST.post(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-notifications/{userId}/profile-reminder - Enviar recordatorio de perfil
   */
  async sendProfileReminder(userId) {
    const context = 'enviar recordatorio de perfil'

    try {
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.PROFILE_REMINDER.replace('{userId}', userId)
      const result = await ServiceREST.post(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // APPROVAL & MODERATION
  // ========================================

  /**
   * POST /user-notifications/{userId}/approval - Enviar email de aprobación
   */
  async sendApprovalEmail(userId) {
    const context = 'enviar email de aprobación'

    try {
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.APPROVAL.replace('{userId}', userId)
      const result = await ServiceREST.post(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-notifications/{userId}/rejection - Enviar email de rechazo
   */
  async sendRejectionEmail(userId, reason = '') {
    const context = 'enviar email de rechazo'

    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.REJECTION.replace('{userId}', userId)
      const result = await ServiceREST.post(`${url}${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ACCOUNT MANAGEMENT
  // ========================================

  /**
   * POST /user-notifications/{userId}/deactivation - Enviar email de desactivación
   */
  async sendDeactivationEmail(userId) {
    const context = 'enviar email de desactivación'

    try {
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.DEACTIVATION.replace('{userId}', userId)
      const result = await ServiceREST.post(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-notifications/{userId}/reactivation - Enviar email de reactivación
   */
  async sendReactivationEmail(userId) {
    const context = 'enviar email de reactivación'

    try {
      const url = API_ENDPOINTS.USER_NOTIFICATIONS.REACTIVATION.replace('{userId}', userId)
      const result = await ServiceREST.post(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * POST /user-notifications/profile-reminders-batch - Enviar recordatorios en lote
   */
  async sendProfileRemindersBatch(userIds) {
    const context = 'enviar recordatorios en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_NOTIFICATIONS.PROFILE_REMINDERS_BATCH, userIds)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-notifications/bulk-email - Enviar email masivo personalizado
   */
  async sendBulkEmail(emailData) {
    const context = 'enviar email masivo'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_NOTIFICATIONS.BULK_EMAIL, emailData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Obtener tipos de notificaciones disponibles
   */
  getNotificationTypes() {
    return [
      { key: 'WELCOME', label: 'Bienvenida', description: 'Email de bienvenida al registrarse' },
      { key: 'PROFILE_REMINDER', label: 'Recordatorio de perfil', description: 'Recordatorio para completar perfil' },
      { key: 'APPROVAL', label: 'Aprobación', description: 'Notificación de aprobación de cuenta' },
      { key: 'REJECTION', label: 'Rechazo', description: 'Notificación de rechazo de cuenta' },
      { key: 'DEACTIVATION', label: 'Desactivación', description: 'Notificación de desactivación de cuenta' },
      { key: 'REACTIVATION', label: 'Reactivación', description: 'Notificación de reactivación de cuenta' }
    ]
  }

  /**
   * Validar datos de email masivo
   */
  validateBulkEmailData(emailData) {
    if (!emailData.userIds || !Array.isArray(emailData.userIds) || emailData.userIds.length === 0) {
      return { valid: false, error: 'Se requiere al menos un usuario' }
    }

    if (!emailData.subject || emailData.subject.trim() === '') {
      return { valid: false, error: 'El asunto es requerido' }
    }

    if (!emailData.body || emailData.body.trim() === '') {
      return { valid: false, error: 'El cuerpo del email es requerido' }
    }

    return { valid: true }
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'userNotificationService')
  }
}

// Crear instancia única
const userNotificationService = new UserNotificationService()

export default userNotificationService
