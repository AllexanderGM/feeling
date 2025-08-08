import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de configuración del sistema - Solo comunicación con API
 */
class ConfigurationService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CONFIGURACIÓN BÁSICA DEL SITIO
  // ========================================

  async getBasicConfiguration() {
    const context = 'obtener configuración básica'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.BASIC)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateBasicConfiguration(configData) {
    const context = 'actualizar configuración básica'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.BASIC, configData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // REDES SOCIALES
  // ========================================

  async getSocialMediaConfiguration() {
    const context = 'obtener configuración de redes sociales'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.SOCIAL_MEDIA)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateSocialMediaConfiguration(socialData) {
    const context = 'actualizar configuración de redes sociales'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.SOCIAL_MEDIA, socialData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CONFIGURACIÓN DE EMAILS
  // ========================================

  async getEmailConfiguration() {
    const context = 'obtener configuración de email'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.EMAIL)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateEmailConfiguration(emailData) {
    const context = 'actualizar configuración de email'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.EMAIL, emailData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async sendMassEmail(emailData) {
    const context = 'enviar email masivo'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.ADMIN.CONFIGURATION.MASS_EMAIL, emailData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CONFIGURACIÓN AVANZADA DE CITAS Y EVENTOS
  // ========================================

  async getMatchingConfiguration() {
    const context = 'obtener configuración de matching'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.MATCHING)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateMatchingConfiguration(matchingData) {
    const context = 'actualizar configuración de matching'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.MATCHING, matchingData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getEventConfiguration() {
    const context = 'obtener configuración de eventos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.EVENTS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateEventConfiguration(eventData) {
    const context = 'actualizar configuración de eventos'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.EVENTS, eventData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // ========================================

  async getNotificationConfiguration() {
    const context = 'obtener configuración de notificaciones'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.NOTIFICATIONS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateNotificationConfiguration(notificationData) {
    const context = 'actualizar configuración de notificaciones'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.NOTIFICATIONS, notificationData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CONFIGURACIONES DEL SISTEMA
  // ========================================

  async getSystemConfiguration() {
    const context = 'obtener configuración del sistema'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.SYSTEM)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateSystemConfiguration(systemData) {
    const context = 'actualizar configuración del sistema'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.SYSTEM, systemData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // BACKUP Y MANTENIMIENTO
  // ========================================

  async createSystemBackup() {
    const context = 'crear backup del sistema'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.ADMIN.CONFIGURATION.BACKUP)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getMaintenanceMode() {
    const context = 'obtener estado de mantenimiento'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.ADMIN.CONFIGURATION.MAINTENANCE)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async toggleMaintenanceMode(enabled) {
    const context = 'cambiar modo de mantenimiento'

    try {
      const result = await ServiceREST.put(API_ENDPOINTS.ADMIN.CONFIGURATION.MAINTENANCE, { enabled })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'configurationService')
  }
}

// Crear instancia única
const configurationService = new ConfigurationService()

export default configurationService
