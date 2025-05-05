import fetchData from '@utils/fetchData.js'
import { getAuthToken } from '@services/authService.js'

const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

/**
 * Formatea una fecha en el formato exacto que el backend espera: YYYY-MM-DDTHH:MM:SSZ
 * @param {String|Date} dateInput - Fecha en cualquier formato válido
 * @returns {String} - Fecha formateada en formato YYYY-MM-DDTHH:MM:SSZ sin milisegundos
 */
export const formatDateForBooking = dateInput => {
  try {
    if (!dateInput) {
      throw new Error('La fecha de inicio es obligatoria')
    }

    // Si ya es un string en el formato esperado: YYYY-MM-DDTHH:MM:SSZ, usarlo directamente
    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
      return dateInput
    }

    // Si es string con formato YYYY-MM-DD HH:MM:SS, convertirlo a ISO sin milisegundos
    if (typeof dateInput === 'string' && dateInput.includes(' ')) {
      return `${dateInput.replace(' ', 'T')}Z`
    }

    // Para cualquier otro caso, convertir a Date y formatear sin milisegundos
    let date

    // Si es un objeto Date o algo que se puede convertir a Date
    if (dateInput instanceof Date) {
      date = dateInput
    } else {
      date = new Date(dateInput)
    }

    // Validar que sea una fecha válida
    if (isNaN(date.getTime())) {
      throw new Error(`Formato de fecha inválido: ${dateInput}`)
    }

    // Formatear manualmente a YYYY-MM-DDTHH:MM:SSZ (sin milisegundos)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
  } catch (error) {
    console.error('Error formateando la fecha:', error)
    throw error
  }
}

/**
 * Crea una nueva reserva (booking) con manejo mejorado de fechas
 * @param {Object} bookingData - Datos de la reserva a crear
 * @returns {Promise<Object>} - Reserva creada o objeto con error
 */
export const createBooking = async bookingData => {
  try {
    const token = getAuthToken()
    console.log('Token de autenticación:', token ? 'Token encontrado' : 'Token no encontrado')

    if (!token) {
      return {
        error: true,
        message: 'No se encontró token de autenticación. Inicia sesión nuevamente.'
      }
    }

    let formattedDate
    try {
      formattedDate = formatDateForBooking(bookingData.startDate)
      console.log('Fecha formateada para backend:', formattedDate)
    } catch (error) {
      console.error('Error al procesar la fecha:', error)
      return {
        error: true,
        message: `Error en la fecha de inicio: ${error.message}`
      }
    }

    // Aseguramos que los campos tengan el formato correcto
    const requestData = {
      tourId: bookingData.tourId,
      startDate: formattedDate,
      adults: parseInt(bookingData.adults, 10) || 1,
      children: parseInt(bookingData.children, 10) || 0
    }

    console.log('Enviando solicitud de reserva:', JSON.stringify(requestData, null, 2))
    console.log('URL de la API:', `${URL}/bookings`)

    const response = await fetch(`${URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    })

    // Para depuración, obtenemos el texto completo de la respuesta
    const responseText = await response.text()
    console.log('Status de respuesta:', response.status, response.statusText)
    console.log('Respuesta completa:', responseText)

    if (!response.ok) {
      let errorMessage = responseText

      // Intentamos parsear la respuesta como JSON para obtener un mensaje más informativo
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorData.message || responseText
      } catch (e) {
        // Si no podemos parsear como JSON, usamos el texto completo
      }

      console.error(`Error ${response.status} al crear reserva:`, errorMessage)

      return {
        error: true,
        status: response.status,
        message: errorMessage
      }
    }

    // Intentamos parsear la respuesta exitosa
    try {
      // Verificar si la respuesta tiene contenido antes de intentar parsear
      if (responseText.trim()) {
        const data = JSON.parse(responseText)
        return { success: true, data }
      }
      return { success: true, message: 'Reserva creada exitosamente' }
    } catch (error) {
      console.warn('Respuesta no es JSON pero fue exitosa:', responseText)
      return { success: true, message: 'Reserva creada exitosamente' }
    }
  } catch (error) {
    console.error('Error al crear reserva:', error)
    return {
      error: true,
      message: error.message || 'Error de conexión al procesar la reserva'
    }
  }
}

/**
 * Obtiene las reservas del usuario actual
 * @returns {Promise<Object>} - Lista de reservas o objeto con error
 */
export const getUserBookings = async () => {
  const token = getAuthToken()

  if (!token) {
    return {
      error: true,
      message: 'No se encontró token de autenticación. Inicia sesión nuevamente.'
    }
  }

  try {
    return await fetchData(`${URL}/bookings/historic`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error)
    return {
      error: true,
      message: error.message || 'Error al obtener tus reservas'
    }
  }
}

/**
 * Obtiene los detalles de una reserva específica
 * @param {string|number} id - ID de la reserva
 * @returns {Promise<Object>} - Detalles de la reserva o objeto con error
 */
export const getBookingById = async id => {
  const token = getAuthToken()

  if (!token) {
    return {
      error: true,
      message: 'No se encontró token de autenticación. Inicia sesión nuevamente.'
    }
  }

  try {
    return await fetchData(`${URL}/bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  } catch (error) {
    console.error(`Error al obtener reserva con ID ${id}:`, error)
    return {
      error: true,
      message: error.message || 'Error al obtener detalles de la reserva'
    }
  }
}

/**
 * Cancela una reserva existente
 * @param {string|number} id - ID de la reserva a cancelar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const cancelBooking = async id => {
  const token = getAuthToken()

  if (!token) {
    return {
      error: true,
      message: 'No se encontró token de autenticación. Inicia sesión nuevamente.'
    }
  }

  try {
    const response = await fetch(`${URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        error: true,
        status: response.status,
        message: errorText || 'Error al cancelar la reserva'
      }
    }

    return { success: true, message: 'Reserva cancelada exitosamente' }
  } catch (error) {
    console.error('Error al cancelar reserva:', error)
    return {
      error: true,
      message: error.message || 'Error de conexión al cancelar la reserva'
    }
  }
}
