/**
 * Utilidades para el manejo de fechas en la aplicación
 */

/**
 * Convierte una fecha a formato ISO string manteniendo la zona horaria local
 * @param {Object|Date|String} date - Fecha en cualquier formato soportado
 * @returns {String|null} - Fecha en formato ISO o null si es inválida
 */
export const toISOString = date => {
  if (!date) return null

  try {
    let jsDate

    // Si es un objeto con propiedades day, month, year (formato de HeroUI)
    if (date.day && date.month && date.year) {
      // Crear la fecha en la zona horaria local
      jsDate = new Date(date.year, date.month - 1, date.day, 12, 0, 0)
    }
    // Si ya es un objeto Date
    else if (date instanceof Date) {
      jsDate = date
    }
    // Si es un string, intentar convertir a Date
    else {
      jsDate = new Date(date)
    }

    // Verificar que la fecha sea válida
    if (isNaN(jsDate.getTime())) {
      throw new Error('Fecha inválida')
    }

    // Ajustar la fecha para mantener el día correcto en la zona horaria local
    const offset = jsDate.getTimezoneOffset()
    jsDate = new Date(jsDate.getTime() - offset * 60 * 1000)
    return jsDate.toISOString()
  } catch (e) {
    console.error('Error convirtiendo fecha a ISO:', e)
    return null
  }
}

/**
 * Formatea una fecha para mostrar al usuario en español
 * @param {String|Date} dateString - Fecha como string ISO o objeto Date
 * @param {Object} options - Opciones de formato (ver toLocaleDateString)
 * @returns {String} - Fecha formateada para mostrar al usuario
 */
export const formatDateForDisplay = (dateString, options = {}) => {
  if (!dateString) return 'No disponible'

  try {
    const date = new Date(dateString)

    const defaultOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options
    }

    return date.toLocaleDateString('es-ES', defaultOptions)
  } catch (e) {
    console.error('Error formateando fecha:', e)
    return 'Fecha inválida'
  }
}

/**
 * Formatea la hora para mostrar al usuario
 * @param {String|Date} dateString - Fecha como string ISO o objeto Date
 * @returns {String} - Hora formateada (HH:MM)
 */
export const formatTimeForDisplay = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('Error formateando hora:', e)
    return ''
  }
}

/**
 * Obtiene fecha actual en formato ISO para inputs datetime-local
 * @returns {String} - Fecha actual en formato YYYY-MM-DDTHH:MM
 */
export const getCurrentDateTimeISO = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

/**
 * Obtiene fecha futura (en días) en formato ISO para inputs datetime-local
 * @param {Number} days - Número de días a añadir a la fecha actual
 * @returns {String} - Fecha futura en formato YYYY-MM-DDTHH:MM
 */
export const getFutureDateTimeISO = days => {
  const future = new Date()
  future.setDate(future.getDate() + days)
  future.setMinutes(future.getMinutes() - future.getTimezoneOffset())
  return future.toISOString().slice(0, 16)
}

/**
 * Normaliza un objeto de disponibilidad para asegurar que sea un array
 * @param {Array|Object} availability - Datos de disponibilidad del tour
 * @returns {Array} - Array normalizado de disponibilidades
 */
export const normalizeAvailability = availability => {
  if (!availability) return []

  // Si ya es un array, devolverlo
  if (Array.isArray(availability)) return availability

  // Si es un objeto, convertirlo a array de un elemento
  return [availability].filter(Boolean)
}

/**
 * Determina si una fecha está dentro de un rango
 * @param {Date} date - Fecha a comprobar
 * @param {Date} startDate - Fecha de inicio del rango
 * @param {Date} endDate - Fecha de fin del rango
 * @returns {Boolean} - true si la fecha está dentro del rango
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate) return false

  // Si no hay fecha de fin, comprobar solo con la de inicio
  if (!endDate) {
    return date.getTime() === startDate.getTime()
  }

  return date >= startDate && date <= endDate
}

/**
 * Crea una fecha en la zona horaria local
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @param {number} day - Día del mes
 * @returns {Date} - Objeto Date en la zona horaria local
 */
export const createLocalDate = (year, month, day) => {
  // Crear la fecha al mediodía para evitar problemas con cambios de hora
  return new Date(year, month - 1, day, 12, 0, 0)
}

/**
 * Normaliza una fecha para comparaciones, estableciendo la hora a medianoche en la zona horaria local
 * @param {Date} date - Fecha a normalizar
 * @returns {Date} - Fecha normalizada
 */
export const normalizeDate = date => {
  if (!date) return null
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}
