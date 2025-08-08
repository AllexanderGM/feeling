/**
 * UTILIDADES PARA CONVERSIÓN DE TIMESTAMPS
 *
 * Funciones para convertir timestamps del backend que vienen en formato array
 * a formato ISO string para uso en el frontend
 */
import { Logger } from './logger.js'

/**
 * Convertir timestamps del backend que vienen como arrays
 * El backend envía timestamps como [year, month, day, hour, minute, second, nano]
 *
 * @param {Array|string|Date|null} timestamp - Timestamp en formato array, string o Date
 * @returns {string|null} - Timestamp en formato ISO string o null
 *
 * @example
 * // Array del backend
 * convertTimestamp([2024, 1, 15, 10, 30, 0, 0]) // "2024-01-15T10:30:00.000Z"
 *
 * // String ISO
 * convertTimestamp("2024-01-15T10:30:00Z") // "2024-01-15T10:30:00.000Z"
 *
 * // Date object
 * convertTimestamp(new Date()) // "2024-01-15T10:30:00.000Z"
 *
 * // Null o undefined
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
 * // {
 * //   createdAt: "2024-01-15T10:30:00.000Z",
 * //   lastActive: "2024-01-16T14:20:00.000Z",
 * //   name: "Juan"
 * // }
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
 * // "15/01/2024 10:30"
 *
 * formatTimestampForDisplay(timestamp, { dateOnly: true })
 * // "15/01/2024"
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
