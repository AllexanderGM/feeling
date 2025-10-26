import { ServiceREST } from '@services'
import { API_ENDPOINTS } from '@constants/apiRoutes'
import { Logger } from '@utils/logger.js'

/**
 * Servicio de inscripciones a eventos de Feeling
 * Maneja el registro de usuarios a eventos, pagos y gestión de inscripciones
 */
class EventRegistrationService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // INSCRIPCIONES A EVENTOS
  // ========================================

  /**
   * Inscribir usuario a un evento
   * @param {Object} registrationData - Datos de inscripción
   * @param {number} registrationData.eventId - ID del evento
   * @param {string} [registrationData.notes] - Notas adicionales
   * @returns {Promise<Object>} Respuesta de inscripción
   */
  async registerToEvent(registrationData) {
    const context = 'Inscripción a evento'

    try {
      this.validateRegistrationData(registrationData)

      const result = await ServiceREST.post(API_ENDPOINTS.EVENT_REGISTRATIONS.REGISTER, registrationData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Cancelar inscripción a un evento
   * @param {number} registrationId - ID de la inscripción
   * @returns {Promise<Object>} Respuesta de cancelación
   */
  async cancelEventRegistration(registrationId) {
    const context = 'Cancelar inscripción'

    try {
      if (!registrationId) {
        throw new Error('ID de inscripción requerido')
      }

      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BASE}/${registrationId}/cancel`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Obtener mis inscripciones
   * @param {Object} filters - Filtros opcionales
   * @param {string} [filters.status] - Estado de inscripción
   * @param {boolean} [filters.upcoming] - Solo eventos próximos
   * @returns {Promise<Object>} Lista de inscripciones
   */
  async getMyRegistrations(filters = {}) {
    const context = 'Obtener mis inscripciones'

    try {
      const params = this.buildQueryParams(filters)
      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENT_REGISTRATIONS.MY}${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Verificar si estoy inscrito a un evento
   * @param {number} eventId - ID del evento
   * @returns {Promise<Object>} Estado de inscripción
   */
  async isRegisteredToEvent(eventId) {
    const context = 'Verificar inscripción'

    try {
      if (!eventId) {
        throw new Error('ID del evento requerido')
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BY_EVENT}/${eventId}/is-registered`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Obtener mi inscripción específica para un evento
   * @param {number} eventId - ID del evento
   * @returns {Promise<Object>} Datos de la inscripción
   */
  async getMyRegistrationForEvent(eventId) {
    const context = 'Obtener mi inscripción'

    try {
      if (!eventId) {
        throw new Error('ID del evento requerido')
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BY_EVENT}/${eventId}/my-registration`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  // ========================================
  // PAGOS DE EVENTOS
  // ========================================

  /**
   * Crear intención de pago para evento
   * @param {number} eventId - ID del evento
   * @returns {Promise<Object>} Datos necesarios para inicializar el checkout de pagos
   */
  async createEventPaymentIntent(eventId) {
    const context = 'Crear intención de pago'

    try {
      this.validatePaymentData({ eventId })

      const result = await ServiceREST.post(API_ENDPOINTS.PAYMENTS.CREATE_INTENT, {
        eventId
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Confirmar pago de evento
   * @param {string} transactionId - ID de la transacción reportado por Wompi
   * @returns {Promise<Object>} Confirmación de pago
   */
  async confirmEventPayment(transactionId) {
    const context = 'Confirmar pago'

    try {
      if (!transactionId) {
        throw new Error('ID de transacción requerido')
      }

      const result = await ServiceREST.post(`${API_ENDPOINTS.PAYMENTS.CONFIRM}/${transactionId}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Liberar inscripción pendiente cuando el pago no pudo completarse
   * @param {number} eventId - ID del evento
   * @returns {Promise<void>}
   */
  async releasePendingRegistration(eventId) {
    const context = 'Liberar inscripción pendiente'

    try {
      if (!eventId) {
        throw new Error('ID del evento requerido')
      }

      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BY_EVENT}/${eventId}/release`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  // ========================================
  // GESTIÓN DE EVENTOS (Para creadores)
  // ========================================

  /**
   * Obtener asistentes de un evento (solo para creador)
   * @param {number} eventId - ID del evento
   * @returns {Promise<Object>} Lista de asistentes
   */
  async getEventAttendees(eventId) {
    const context = 'Obtener asistentes'

    try {
      if (!eventId) {
        throw new Error('ID del evento requerido')
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BY_EVENT}/${eventId}/attendees`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Obtener asistentes confirmados de un evento (solo para creador)
   * @param {number} eventId - ID del evento
   * @returns {Promise<Object>} Lista de asistentes confirmados
   */
  async getConfirmedAttendees(eventId) {
    const context = 'Obtener asistentes confirmados'

    try {
      if (!eventId) {
        throw new Error('ID del evento requerido')
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENT_REGISTRATIONS.BY_EVENT}/${eventId}/confirmed-attendees`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  // ========================================
  // VALIDACIONES PRIVADAS
  // ========================================

  /**
   * Valida datos de inscripción
   * @private
   */
  validateRegistrationData(data) {
    if (!data) {
      throw new Error('Datos de inscripción requeridos')
    }

    if (!data.eventId || typeof data.eventId !== 'number') {
      throw new Error('ID del evento requerido y debe ser un número')
    }

    // Validaciones adicionales pueden ir aquí
  }

  /**
   * Valida datos de pago
   * @private
   */
  validatePaymentData(data) {
    if (!data) {
      throw new Error('Datos de pago requeridos')
    }

    if (!data.eventId || typeof data.eventId !== 'number') {
      throw new Error('ID del evento requerido')
    }
  }

  /**
   * Construye parámetros de consulta
   * @private
   */
  buildQueryParams(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return ''
    }

    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value)
      }
    })

    return params.toString() ? `?${params.toString()}` : ''
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    Logger.serviceError(operation, error, 'EventRegistrationService')
  }
}

// Crear instancia única del servicio
const eventRegistrationService = new EventRegistrationService()

// Exportaciones
export default eventRegistrationService

// Exportaciones específicas para compatibilidad
export const {
  registerToEvent,
  cancelEventRegistration,
  getMyRegistrations,
  isRegisteredToEvent,
  getMyRegistrationForEvent,
  createEventPaymentIntent,
  confirmEventPayment,
  releasePendingRegistration,
  getEventAttendees,
  getConfirmedAttendees
} = eventRegistrationService
