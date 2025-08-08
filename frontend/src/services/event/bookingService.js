import { ServiceREST } from '@services/utils/serviceREST.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'

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

      const result = await ServiceREST.post(API_ENDPOINTS.EVENTS.REGISTER, registrationData)
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

      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENTS.CANCEL_REGISTRATION}/${registrationId}/cancel`)
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
      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.MY_REGISTRATIONS}${params}`)
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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.IS_REGISTERED}/${eventId}/is-registered`)
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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.MY_REGISTRATION}/${eventId}/my-registration`)
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
   * @param {Object} paymentData - Datos de pago
   * @param {number} paymentData.eventId - ID del evento
   * @param {number} paymentData.amount - Monto a pagar
   * @param {string} [paymentData.currency] - Moneda (default: 'usd')
   * @returns {Promise<Object>} Intención de pago de Stripe
   */
  async createEventPaymentIntent(paymentData) {
    const context = 'Crear intención de pago'

    try {
      this.validatePaymentData(paymentData)

      const result = await ServiceREST.post(API_ENDPOINTS.PAYMENTS.CREATE_INTENT, {
        eventId: paymentData.eventId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'usd'
      })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error.response?.data || error)
      throw error
    }
  }

  /**
   * Confirmar pago de evento
   * @param {string} paymentIntentId - ID de la intención de pago
   * @returns {Promise<Object>} Confirmación de pago
   */
  async confirmEventPayment(paymentIntentId) {
    const context = 'Confirmar pago'

    try {
      if (!paymentIntentId) {
        throw new Error('ID de intención de pago requerido')
      }

      const result = await ServiceREST.post(`${API_ENDPOINTS.PAYMENTS.CONFIRM}/${paymentIntentId}`)
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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.ATTENDEES}/${eventId}/attendees`)
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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.CONFIRMED_ATTENDEES}/${eventId}/confirmed-attendees`)
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

    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Monto requerido y debe ser mayor a 0')
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
    this.Logger.serviceError(operation, error, 'EventRegistrationService')
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
  getEventAttendees,
  getConfirmedAttendees
} = eventRegistrationService
