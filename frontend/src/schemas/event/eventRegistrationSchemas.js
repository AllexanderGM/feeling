import * as yup from 'yup'

/**
 * ESQUEMAS DE REGISTRO Y PAGOS DE EVENTOS
 *
 * Contiene todas las validaciones relacionadas con:
 * - Registro en eventos
 * - Procesamiento de pagos
 * - Cancelación de registros
 * - Confirmación de asistencia
 */

// ========================================
// VALIDACIONES PARA REGISTRO DE EVENTOS
// ========================================

const registrationValidations = {
  eventId: yup
    .number()
    .integer('El ID del evento debe ser un número entero')
    .positive('El ID del evento debe ser positivo')
    .required('El ID del evento es requerido'),

  paymentIntentId: yup.string().min(10, 'ID de pago inválido').required('El ID de pago es requerido'),

  amountPaid: yup.number().min(0, 'El monto no puede ser negativo').required('El monto pagado es requerido'),

  cancellationReason: yup
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres')
    .required('La razón de cancelación es requerida'),

  // Para búsqueda de registros
  registrationStatus: yup.string().oneOf(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], 'Estado de registro inválido'),

  // Para filtros de fecha de registro
  registrationStartDate: yup.string().test('valid-date', 'Fecha de inicio inválida', function (value) {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  }),

  registrationEndDate: yup
    .string()
    .test('valid-date', 'Fecha de fin inválida', function (value) {
      if (!value) return true
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('after-start', 'La fecha de fin debe ser posterior a la de inicio', function (value) {
      const { registrationStartDate } = this.parent
      if (!value || !registrationStartDate) return true
      return new Date(value) >= new Date(registrationStartDate)
    })
}

// ========================================
// ESQUEMAS PRINCIPALES DE REGISTRO
// ========================================

export const eventRegistrationSchema = yup.object().shape({
  eventId: registrationValidations.eventId
})

export const confirmPaymentSchema = yup.object().shape({
  paymentIntentId: registrationValidations.paymentIntentId,
  amountPaid: registrationValidations.amountPaid
})

export const cancelRegistrationSchema = yup.object().shape({
  cancellationReason: registrationValidations.cancellationReason
})

// ========================================
// ESQUEMAS DE PAGO
// ========================================

export const createPaymentIntentSchema = yup.object().shape({
  eventId: registrationValidations.eventId,
  amount: yup
    .number()
    .min(0, 'El monto no puede ser negativo')
    .max(10000000, 'El monto no puede exceder $10,000,000')
    .required('El monto es requerido'),
  currency: yup.string().oneOf(['COP', 'USD'], 'Moneda no soportada').default('COP'),
  description: yup.string().max(200, 'La descripción no puede exceder 200 caracteres')
})

export const processPaymentSchema = yup.object().shape({
  paymentMethodId: yup.string().required('El método de pago es requerido'),
  paymentIntentId: registrationValidations.paymentIntentId,
  savePaymentMethod: yup.boolean().default(false)
})

// ========================================
// ESQUEMAS DE BÚSQUEDA Y FILTRADO
// ========================================

export const registrationSearchSchema = yup.object().shape({
  eventTitle: yup.string().min(2, 'La búsqueda debe tener al menos 2 caracteres').max(100, 'La búsqueda no puede exceder 100 caracteres'),
  status: registrationValidations.registrationStatus,
  startDate: registrationValidations.registrationStartDate,
  endDate: registrationValidations.registrationEndDate,
  page: yup.number().integer().min(0, 'La página debe ser 0 o mayor'),
  size: yup.number().integer().min(1, 'El tamaño debe ser al menos 1').max(100, 'El tamaño máximo es 100')
})

export const registrationFilterSchema = yup.object().shape({
  statuses: yup.array().of(yup.string().oneOf(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])),
  dateRange: yup.object().shape({
    start: registrationValidations.registrationStartDate,
    end: registrationValidations.registrationEndDate
  }),
  amountRange: yup.object().shape({
    min: yup.number().min(0, 'El monto mínimo no puede ser negativo'),
    max: yup.number().min(0, 'El monto máximo no puede ser negativo')
  }),
  confirmed: yup.boolean()
})

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Valida si un usuario puede registrarse en un evento
 */
export const canRegisterForEvent = (event, userRegistrations = []) => {
  // Verificar si el evento está activo
  if (!event.isActive) {
    return { canRegister: false, reason: 'El evento no está activo' }
  }

  // Verificar si el evento no está lleno
  if (event.isFull || event.currentAttendees >= event.maxCapacity) {
    return { canRegister: false, reason: 'El evento está lleno' }
  }

  // Verificar si el evento no ha pasado
  const eventDate = new Date(event.eventDate)
  const now = new Date()
  if (eventDate <= now) {
    return { canRegister: false, reason: 'El evento ya pasó' }
  }

  // Verificar si el usuario ya está registrado
  const existingRegistration = userRegistrations.find(reg => reg.eventId === event.id && reg.paymentStatus !== 'CANCELLED')
  if (existingRegistration) {
    return { canRegister: false, reason: 'Ya estás registrado en este evento' }
  }

  return { canRegister: true }
}

/**
 * Valida si un registro puede ser cancelado
 */
export const canCancelRegistration = registration => {
  // No se puede cancelar si ya está cancelado
  if (registration.paymentStatus === 'CANCELLED') {
    return { canCancel: false, reason: 'El registro ya está cancelado' }
  }

  // No se puede cancelar si el pago falló
  if (registration.paymentStatus === 'FAILED') {
    return { canCancel: false, reason: 'No se puede cancelar un registro fallido' }
  }

  // Verificar si el evento no ha pasado (con margen de 1 hora)
  const eventDate = new Date(registration.eventDate)
  const now = new Date()
  const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000)

  if (now >= oneHourBefore) {
    return { canCancel: false, reason: 'No se puede cancelar menos de 1 hora antes del evento' }
  }

  return { canCancel: true }
}

/**
 * Calcula el tiempo límite para cancelar un registro
 */
export const getCancellationDeadline = eventDate => {
  const event = new Date(eventDate)
  return new Date(event.getTime() - 60 * 60 * 1000) // 1 hora antes
}

/**
 * Valida si un pago puede ser procesado
 */
export const canProcessPayment = (event, amount) => {
  // Verificar que el monto coincida con el precio del evento
  if (event.price > 0 && amount !== event.price) {
    return { canProcess: false, reason: 'El monto no coincide con el precio del evento' }
  }

  // Verificar que el evento tenga espacios disponibles
  if (event.isFull) {
    return { canProcess: false, reason: 'El evento está lleno' }
  }

  // Verificar que el evento esté activo
  if (!event.isActive) {
    return { canProcess: false, reason: 'El evento no está activo' }
  }

  return { canProcess: true }
}

/**
 * Genera descripción para el pago
 */
export const generatePaymentDescription = (event, userName) => {
  return `Registro de ${userName} para ${event.title} - ${new Date(event.eventDate).toLocaleDateString('es-CO')}`
}

/**
 * Valida estado de pago
 */
export const isPaymentCompleted = paymentStatus => {
  return paymentStatus === 'COMPLETED'
}

export const isPaymentPending = paymentStatus => {
  return paymentStatus === 'PENDING'
}

export const isPaymentFailed = paymentStatus => {
  return paymentStatus === 'FAILED'
}

export const isPaymentCancelled = paymentStatus => {
  return paymentStatus === 'CANCELLED'
}

/**
 * Obtiene el color del estado de pago para UI
 */
export const getPaymentStatusColor = paymentStatus => {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    CANCELLED: 'secondary'
  }
  return colors[paymentStatus] || 'default'
}

/**
 * Obtiene el texto del estado de pago en español
 */
export const getPaymentStatusText = paymentStatus => {
  const texts = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completado',
    FAILED: 'Fallido',
    CANCELLED: 'Cancelado'
  }
  return texts[paymentStatus] || paymentStatus
}

/**
 * Calcula estadísticas de registros
 */
export const calculateRegistrationStats = registrations => {
  const stats = {
    total: registrations.length,
    completed: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    totalAmount: 0
  }

  registrations.forEach(registration => {
    stats[registration.paymentStatus.toLowerCase()]++
    if (registration.paymentStatus === 'COMPLETED') {
      stats.totalAmount += registration.amountPaid || 0
    }
  })

  return stats
}
