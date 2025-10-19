/**
 * UTILIDADES PARA CONVERSIÓN DE TIMESTAMPS Y FECHAS
 *
 * Funciones para convertir timestamps del backend que vienen en formato array
 * a diferentes formatos para uso en el frontend:
 * - ISO String (para almacenamiento y transmisión)
 * - CalendarDate (para DatePicker de HeroUI)
 * - Date objects (para manipulación en JavaScript)
 */
import { CalendarDate } from '@internationalized/date'

import { Logger } from './logger.js'

/**
 * Convertir timestamps del backend que vienen como arrays
 * El backend envía timestamps como [year, month, day, hour, minute, second, nano]
 *
 * @param {Array|string|Date|null} timestamp - Timestamp en formato array, string o Date
 * @returns {string|null} - Timestamp en formato ISO string o null
 *
 * @example
 * Array del backend
 * convertTimestamp([2024, 1, 15, 10, 30, 0, 0]) // "2024-01-15T10:30:00.000Z"
 *
 * String ISO
 * convertTimestamp("2024-01-15T10:30:00Z") // "2024-01-15T10:30:00.000Z"
 *
 * Date object
 * convertTimestamp(new Date()) // "2024-01-15T10:30:00.000Z"
 *
 * convertTimestamp(null) // null
 */
export const convertTimestamp = timestamp => {
  // Si es null o undefined, retornar null
  if (!timestamp) return null

  // Si es un array (formato del backend)
  if (Array.isArray(timestamp) && timestamp.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = timestamp

    // Crear fecha (month - 1 porque Date usa 0-11 para meses)
    const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000))

    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      Logger.warn(Logger.CATEGORIES.NETWORK, 'convertir timestamp', `Timestamp array inválido: ${JSON.stringify(timestamp)}`)

      return null
    }

    return date.toISOString()
  }

  // Si es string o Date, convertir a Date y luego a ISO
  try {
    const date = new Date(timestamp)

    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      Logger.warn(Logger.CATEGORIES.NETWORK, 'convertir timestamp', `Timestamp string inválido: ${timestamp}`)

      return null
    }

    return date.toISOString()
  } catch (error) {
    Logger.error(Logger.CATEGORIES.NETWORK, 'convertir timestamp', error, {
      context: { timestamp }
    })

    return null
  }
}

/**
 * Convertir múltiples timestamps en un objeto
 * Útil para procesar objetos que contienen varios campos de fecha
 *
 * @param {Object} obj - Objeto con campos de timestamp
 * @param {Array<string>} fields - Array con nombres de campos a convertir
 * @returns {Object} - Objeto con timestamps convertidos
 *
 * @example
 * const user = {
 *   createdAt: [2024, 1, 15, 10, 30, 0, 0],
 *   lastActive: [2024, 1, 16, 14, 20, 0, 0],
 *   name: "Juan"
 * }
 *
 * convertMultipleTimestamps(user, ['createdAt', 'lastActive'])
 * {
 *   createdAt: "2024-01-15T10:30:00.000Z",
 *   lastActive: "2024-01-16T14:20:00.000Z",
 *   name: "Juan"
 * }
 */
export const convertMultipleTimestamps = (obj, fields) => {
  if (!obj || !fields || !Array.isArray(fields)) return obj

  const converted = { ...obj }

  fields.forEach(field => {
    if (converted[field] !== undefined) {
      converted[field] = convertTimestamp(converted[field])
    }
  })

  return converted
}

/**
 * Verificar si un valor es un timestamp en formato array del backend
 *
 * @param {any} value - Valor a verificar
 * @returns {boolean} - true si es un timestamp array válido
 *
 * @example
 * isTimestampArray([2024, 1, 15, 10, 30, 0, 0]) // true
 * isTimestampArray([2024, 1, 15]) // true (mínimo año, mes, día)
 * isTimestampArray([2024, 1]) // false (incompleto)
 * isTimestampArray("2024-01-15") // false (es string)
 */
export const isTimestampArray = value => {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every(item => typeof item === 'number') &&
    value[0] > 1900 && // Año razonable
    value[1] >= 1 &&
    value[1] <= 12 && // Mes válido
    value[2] >= 1 &&
    value[2] <= 31
  ) // Día válido
}

/**
 * Formatear timestamp para mostrar en UI
 *
 * @param {string|Array|Date} timestamp - Timestamp a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} - Timestamp formateado para mostrar
 *
 * @example
 * formatTimestampForDisplay([2024, 1, 15, 10, 30, 0, 0])
 * "15/01/2024 10:30"
 *
 * formatTimestampForDisplay(timestamp, { dateOnly: true })
 * "15/01/2024"
 */
export const formatTimestampForDisplay = (timestamp, options = {}) => {
  const { dateOnly = false, locale = 'es-ES' } = options

  const isoString = convertTimestamp(timestamp)

  if (!isoString) return 'Fecha inválida'

  const date = new Date(isoString)

  if (dateOnly) {
    return date.toLocaleDateString(locale)
  }

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ========================================
// CONVERSIÓN A CALENDARDATE (HEROUI)
// ========================================

/**
 * Convertir timestamp a CalendarDate para DatePicker de HeroUI
 *
 * @param {Array|string|Date|null} timestamp - Timestamp en formato array, string o Date
 * @returns {CalendarDate|null} - CalendarDate object o null
 *
 * @example
 * Array del backend
 * toCalendarDate([2024, 1, 15]) // CalendarDate(2024, 1, 15)
 *
 * String ISO
 * toCalendarDate("2024-01-15") // CalendarDate(2024, 1, 15)
 *
 * Date object
 * toCalendarDate(new Date(2024, 0, 15)) // CalendarDate(2024, 1, 15)
 *
 * Null
 * toCalendarDate(null) // null
 */
export const toCalendarDate = timestamp => {
  if (!timestamp) return null

  try {
    // Si es un array [year, month, day]
    if (Array.isArray(timestamp) && timestamp.length >= 3) {
      const [year, month, day] = timestamp

      return new CalendarDate(parseInt(year), parseInt(month), parseInt(day))
    }

    // Si es string ISO "2024-01-15" o "2024-01-15T10:30:00Z"
    if (typeof timestamp === 'string') {
      const dateStr = timestamp.split('T')[0] // Tomar solo la parte de fecha
      const [year, month, day] = dateStr.split('-').map(Number)

      if (!year || !month || !day) {
        Logger.warn(Logger.CATEGORIES.NETWORK, 'convertir a CalendarDate', `String de fecha inválido: ${timestamp}`)

        return null
      }

      return new CalendarDate(year, month, day)
    }

    // Si es Date object
    if (timestamp instanceof Date) {
      if (isNaN(timestamp.getTime())) {
        Logger.warn(Logger.CATEGORIES.NETWORK, 'convertir a CalendarDate', 'Date object inválido')

        return null
      }

      return new CalendarDate(timestamp.getFullYear(), timestamp.getMonth() + 1, timestamp.getDate())
    }

    // Si ya es CalendarDate, retornarlo
    if (timestamp instanceof CalendarDate) {
      return timestamp
    }

    Logger.warn(Logger.CATEGORIES.NETWORK, 'convertir a CalendarDate', `Tipo de timestamp no soportado: ${typeof timestamp}`)

    return null
  } catch (error) {
    Logger.error(Logger.CATEGORIES.NETWORK, 'convertir a CalendarDate', error, {
      context: { timestamp }
    })

    return null
  }
}

/**
 * Convertir CalendarDate a array para el backend
 *
 * @param {CalendarDate|null} calendarDate - CalendarDate object
 * @returns {Array|null} - Array [year, month, day] o null
 *
 * @example
 * const date = new CalendarDate(2024, 1, 15)
 * fromCalendarDate(date) // [2024, 1, 15]
 */
export const fromCalendarDate = calendarDate => {
  if (!calendarDate || !(calendarDate instanceof CalendarDate)) {
    return null
  }

  return [calendarDate.year, calendarDate.month, calendarDate.day]
}

/**
 * Convertir CalendarDate a string ISO
 *
 * @param {CalendarDate|null} calendarDate - CalendarDate object
 * @returns {string|null} - String en formato "YYYY-MM-DD" o null
 *
 * @example
 * const date = new CalendarDate(2024, 1, 15)
 * calendarDateToISOString(date) // "2024-01-15"
 */
export const calendarDateToISOString = calendarDate => {
  if (!calendarDate || !(calendarDate instanceof CalendarDate)) {
    return null
  }

  const year = calendarDate.year
  const month = String(calendarDate.month).padStart(2, '0')
  const day = String(calendarDate.day).padStart(2, '0')

  return `${year}-${month}-${day}`
}
