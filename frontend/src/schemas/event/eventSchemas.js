import * as yup from 'yup'
import { baseValidations } from '../validation/baseValidations'

/**
 * ESQUEMAS DE VALIDACIÓN PARA EVENTOS
 *
 * Contiene todas las validaciones relacionadas con:
 * - Creación de eventos
 * - Edición de eventos
 * - Búsqueda y filtrado
 * - Gestión de eventos
 */

// ========================================
// VALIDACIONES ESPECÍFICAS PARA EVENTOS
// ========================================

const eventValidations = {
  title: yup
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .required('El título es requerido'),

  description: yup
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .required('La descripción es requerida'),

  eventDate: yup
    .string()
    .required('La fecha del evento es requerida')
    .test('valid-date', 'Ingresa una fecha válida', function (value) {
      if (!value) return false
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('future-date', 'La fecha debe ser en el futuro', function (value) {
      if (!value) return false
      const eventDate = new Date(value)
      const now = new Date()
      return eventDate > now
    })
    .test('reasonable-future', 'La fecha no puede ser más de 2 años en el futuro', function (value) {
      if (!value) return false
      const eventDate = new Date(value)
      const twoYearsFromNow = new Date()
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
      return eventDate <= twoYearsFromNow
    }),

  price: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio no puede exceder $10,000,000')
    .required('El precio es requerido')
    .test('decimal-places', 'El precio no puede tener más de 2 decimales', function (value) {
      if (value === null || value === undefined) return true
      return Number.isInteger(value * 100)
    }),

  maxCapacity: yup
    .number()
    .integer('La capacidad debe ser un número entero')
    .min(1, 'La capacidad mínima es 1 persona')
    .max(10000, 'La capacidad máxima es 10,000 personas')
    .required('La capacidad máxima es requerida'),

  category: yup
    .string()
    .oneOf(['CULTURAL', 'DEPORTIVO', 'MUSICAL', 'SOCIAL'], 'Selecciona una categoría válida')
    .required('La categoría es requerida'),

  mainImage: yup.string().url('Debe ser una URL válida').nullable(),

  // Para búsquedas
  searchQuery: yup.string().min(2, 'La búsqueda debe tener al menos 2 caracteres').max(100, 'La búsqueda no puede exceder 100 caracteres'),

  // Para filtros de fecha
  startDate: yup.string().test('valid-date', 'Fecha de inicio inválida', function (value) {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  }),

  endDate: yup
    .string()
    .test('valid-date', 'Fecha de fin inválida', function (value) {
      if (!value) return true
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('after-start', 'La fecha de fin debe ser posterior a la de inicio', function (value) {
      const { startDate } = this.parent
      if (!value || !startDate) return true
      return new Date(value) >= new Date(startDate)
    }),

  // Para filtros de precio
  minPrice: yup.number().min(0, 'El precio mínimo no puede ser negativo'),

  maxPrice: yup
    .number()
    .min(0, 'El precio máximo no puede ser negativo')
    .test('greater-than-min', 'El precio máximo debe ser mayor al mínimo', function (value) {
      const { minPrice } = this.parent
      if (value === null || value === undefined || minPrice === null || minPrice === undefined) return true
      return value >= minPrice
    })
}

// ========================================
// ESQUEMAS PRINCIPALES DE EVENTOS
// ========================================

export const createEventSchema = yup.object().shape({
  title: eventValidations.title,
  description: eventValidations.description,
  eventDate: eventValidations.eventDate,
  price: eventValidations.price,
  maxCapacity: eventValidations.maxCapacity,
  category: eventValidations.category,
  mainImage: eventValidations.mainImage
})

export const editEventSchema = yup.object().shape({
  title: eventValidations.title,
  description: eventValidations.description,
  eventDate: eventValidations.eventDate,
  price: eventValidations.price,
  maxCapacity: eventValidations.maxCapacity,
  category: eventValidations.category,
  mainImage: eventValidations.mainImage
})

export const quickEventCreateSchema = yup.object().shape({
  title: eventValidations.title,
  eventDate: eventValidations.eventDate,
  category: eventValidations.category
})

// ========================================
// ESQUEMAS DE BÚSQUEDA Y FILTRADO
// ========================================

export const eventSearchSchema = yup.object().shape({
  query: eventValidations.searchQuery,
  category: yup.string().oneOf(['CULTURAL', 'DEPORTIVO', 'MUSICAL', 'SOCIAL', ''], 'Categoría inválida'),
  startDate: eventValidations.startDate,
  endDate: eventValidations.endDate,
  minPrice: eventValidations.minPrice,
  maxPrice: eventValidations.maxPrice,
  page: yup.number().integer().min(0, 'La página debe ser 0 o mayor'),
  size: yup.number().integer().min(1, 'El tamaño debe ser al menos 1').max(100, 'El tamaño máximo es 100')
})

export const eventFilterSchema = yup.object().shape({
  categories: yup.array().of(yup.string().oneOf(['CULTURAL', 'DEPORTIVO', 'MUSICAL', 'SOCIAL'])),
  priceRange: yup.object().shape({
    min: eventValidations.minPrice,
    max: eventValidations.maxPrice
  }),
  dateRange: yup.object().shape({
    start: eventValidations.startDate,
    end: eventValidations.endDate
  }),
  availability: yup.string().oneOf(['available', 'full', 'all'], 'Estado de disponibilidad inválido')
})

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Valida si una fecha de evento es válida para edición
 * (permite eventos que ya comenzaron si aún no terminaron)
 */
export const validateEventDateForEdit = (eventDate, originalDate) => {
  const event = new Date(eventDate)
  const original = new Date(originalDate)
  const now = new Date()

  // Si es la fecha original y ya pasó, permitir (evento en curso)
  if (event.getTime() === original.getTime() && event > now.setHours(now.getHours() - 24)) {
    return true
  }

  // Para fechas nuevas, debe ser en el futuro
  return event > new Date()
}

/**
 * Calcula el tiempo restante hasta un evento
 */
export const getTimeUntilEvent = eventDate => {
  const event = new Date(eventDate)
  const now = new Date()
  const diff = event.getTime() - now.getTime()

  if (diff <= 0) return { expired: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, expired: false }
}

/**
 * Valida si un evento tiene espacios disponibles
 */
export const hasAvailableSpots = (currentAttendees, maxCapacity) => {
  return currentAttendees < maxCapacity
}

/**
 * Calcula espacios disponibles
 */
export const getAvailableSpots = (currentAttendees, maxCapacity) => {
  return Math.max(0, maxCapacity - currentAttendees)
}

/**
 * Valida si un precio es gratuito
 */
export const isFreeEvent = price => {
  return price === 0 || price === '0'
}

/**
 * Formatea precio para mostrar
 */
export const formatEventPrice = price => {
  if (isFreeEvent(price)) return 'Gratis'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Valida capacidad al editar (no puede ser menor a asistentes actuales)
 */
export const validateCapacityForEdit = (newCapacity, currentAttendees) => {
  return newCapacity >= currentAttendees
}

/**
 * Crea esquema dinámico para editar evento basado en estado actual
 */
export const createEditEventSchema = currentEvent => {
  return yup.object().shape({
    title: eventValidations.title,
    description: eventValidations.description,
    eventDate: yup
      .string()
      .required('La fecha del evento es requerida')
      .test('valid-edit-date', 'Fecha inválida para edición', function (value) {
        return validateEventDateForEdit(value, currentEvent.eventDate)
      }),
    price: eventValidations.price,
    maxCapacity: yup
      .number()
      .integer('La capacidad debe ser un número entero')
      .min(currentEvent.currentAttendees || 1, `La capacidad no puede ser menor a ${currentEvent.currentAttendees} (asistentes actuales)`)
      .max(10000, 'La capacidad máxima es 10,000 personas')
      .required('La capacidad máxima es requerida'),
    category: eventValidations.category,
    mainImage: eventValidations.mainImage
  })
}
