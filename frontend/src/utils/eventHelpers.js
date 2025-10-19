/**
 * UTILIDADES PARA MANEJO DE EVENTOS
 *
 * Funciones auxiliares para validar, formatear y procesar
 * datos relacionados con eventos.
 *
 * RESPONSABILIDAD:
 * - Validar estructura de eventos
 * - Formatear eventos para mostrar en UI
 * - Calcular disponibilidad de eventos
 * - Extraer información de errores de eventos
 */

import { ERROR_MESSAGES } from '../schemas/validation/validationConstants'

// ========================================
// VALIDACIÓN DE ESTRUCTURA
// ========================================

/**
 * Verificar si una respuesta es de evento válida
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si es un evento válido
 */
export const isValidEventResponse = response => {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.id === 'number' &&
    typeof response.title === 'string' &&
    typeof response.eventDate === 'string' &&
    typeof response.price === 'number' &&
    typeof response.category === 'string'
  )
}

/**
 * Verificar si una respuesta es de registro válida
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si es un registro válido
 */
export const isValidRegistrationResponse = response => {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.id === 'number' &&
    typeof response.eventId === 'number' &&
    typeof response.paymentStatus === 'string'
  )
}

/**
 * Verificar si una respuesta de pago es válida
 * @param {Object} response - Respuesta a validar
 * @returns {boolean} true si es un pago válido
 */
export const isValidPaymentResponse = response => {
  return (
    response && typeof response === 'object' && typeof response.paymentIntentId === 'string' && typeof response.clientSecret === 'string'
  )
}

// ========================================
// DISPONIBILIDAD DE EVENTOS
// ========================================

/**
 * Verificar si un evento está disponible para registro
 * @param {Object} event - Evento a verificar
 * @returns {boolean} true si está disponible
 */
export const isEventAvailableForRegistration = event => {
  if (!isValidEventResponse(event)) return false

  const eventDate = new Date(event.eventDate)
  const now = new Date()

  return event.isActive && !event.isFull && event.hasAvailableSpots && eventDate > now
}

/**
 * Obtener estado de disponibilidad de evento
 * @param {Object} event - Evento a evaluar
 * @returns {string} Estado: 'unknown', 'inactive', 'past', 'full', 'limited', 'available'
 */
export const getEventAvailabilityStatus = event => {
  if (!isValidEventResponse(event)) return 'unknown'

  if (!event.isActive) return 'inactive'

  const eventDate = new Date(event.eventDate)
  const now = new Date()

  if (eventDate <= now) return 'past'
  if (event.isFull) return 'full'
  if (event.availableSpots <= 5) return 'limited'

  return 'available'
}

// ========================================
// FORMATEO PARA UI
// ========================================

/**
 * Formatear evento para mostrar en UI
 * @param {Object} event - Evento a formatear
 * @returns {Object|null} Evento con campos formateados
 */
export const formatEventForDisplay = event => {
  if (!isValidEventResponse(event)) return null

  return {
    ...event,
    formattedDate: new Date(event.eventDate).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedPrice:
      event.price === 0
        ? 'Gratis'
        : new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(event.price),
    availabilityStatus: getEventAvailabilityStatus(event)
  }
}

/**
 * Formatear fecha de evento de forma corta
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatEventDateShort = dateString => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatear precio de evento
 * @param {number} price - Precio del evento
 * @returns {string} Precio formateado
 */
export const formatEventPrice = price => {
  if (price === 0) return 'Gratis'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

// ========================================
// EXTRACCIÓN DE ERRORES
// ========================================

/**
 * Extraer información de error específica de eventos
 * @param {Object} response - Respuesta de error
 * @returns {string} Mensaje de error
 */
export const extractEventErrorMessage = response => {
  if (!response || !response.error) return ERROR_MESSAGES.SERVER_ERROR

  const errorCode = response.error.code
  const eventErrorMessages = {
    EVENT_NOT_FOUND: ERROR_MESSAGES.EVENT_NOT_FOUND,
    EVENT_FULL: ERROR_MESSAGES.EVENT_FULL,
    EVENT_INACTIVE: ERROR_MESSAGES.EVENT_INACTIVE,
    ALREADY_REGISTERED: ERROR_MESSAGES.ALREADY_REGISTERED,
    PAYMENT_FAILED: ERROR_MESSAGES.PAYMENT_FAILED,
    REGISTRATION_CLOSED: ERROR_MESSAGES.REGISTRATION_CLOSED,
    EVENT_PAST: ERROR_MESSAGES.EVENT_PAST,
    CANCELLATION_NOT_ALLOWED: ERROR_MESSAGES.CANCELLATION_NOT_ALLOWED
  }

  return eventErrorMessages[errorCode] || response.error.message || ERROR_MESSAGES.SERVER_ERROR
}

// ========================================
// CÁLCULOS DE EVENTOS
// ========================================

/**
 * Calcular porcentaje de ocupación
 * @param {Object} event - Evento a calcular
 * @returns {number} Porcentaje de ocupación (0-100)
 */
export const calculateOccupancyPercentage = event => {
  if (!isValidEventResponse(event) || !event.maxCapacity) return 0

  return Math.round((event.currentAttendees / event.maxCapacity) * 100)
}

/**
 * Verificar si un evento está próximo a llenarse
 * @param {Object} event - Evento a verificar
 * @param {number} threshold - Umbral de porcentaje (default: 80)
 * @returns {boolean} true si está próximo a llenarse
 */
export const isEventNearlyFull = (event, threshold = 80) => {
  return calculateOccupancyPercentage(event) >= threshold
}

/**
 * Calcular días hasta el evento
 * @param {string} eventDate - Fecha del evento
 * @returns {number} Días hasta el evento (negativo si ya pasó)
 */
export const getDaysUntilEvent = eventDate => {
  const now = new Date()
  const event = new Date(eventDate)
  const diffTime = event - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Verificar si un evento está próximo (menos de 7 días)
 * @param {string} eventDate - Fecha del evento
 * @returns {boolean} true si está próximo
 */
export const isEventUpcoming = eventDate => {
  const days = getDaysUntilEvent(eventDate)

  return days > 0 && days <= 7
}
