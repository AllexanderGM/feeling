import { getAuthToken } from '@services/authService.js'

const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

export const getTourAvailabilities = async tourId => {
  try {
    const token = getAuthToken()
    const endpoint = `${URL}/api/availabilities/tour/${tourId}`
    console.log(`Consultando endpoint: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    // Log the raw response before parsing
    const rawText = await response.text()
    console.log('Raw response:', rawText)

    if (!response.ok) {
      console.error(`Error ${response.status} obteniendo disponibilidades para tour ${tourId}`)
      return []
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON:', rawText)
      return []
    }

    return JSON.parse(rawText)
  } catch (error) {
    console.error(`Error consultando disponibilidades para tour ${tourId}:`, error)
    return []
  }
}

/**
 * Obtiene las disponibilidades para un tour y busca la que corresponde a la fecha de reserva
 * @param {number} tourId - ID del tour
 * @param {string} bookingDate - Fecha de reserva (startDate del booking)
 * @returns {Promise<Object|null>} - Disponibilidad correspondiente o null si no se encuentra
 */
export const getAvailabilityForBooking = async (tourId, bookingDate) => {
  try {
    // 1. Obtenemos todas las disponibilidades para el tour
    const availabilities = await getTourAvailabilities(tourId)

    if (!availabilities || availabilities.length === 0) {
      console.warn(`No se encontraron disponibilidades para el tour ${tourId}`)
      return null
    }

    // 2. Normalizamos la fecha de reserva para comparación
    const bookingDateStr = new Date(bookingDate).toISOString().split('T')[0] // 'YYYY-MM-DD'

    // 3. Buscamos la disponibilidad que coincida con la fecha de reserva
    const matchingAvailability = availabilities.find(avail => {
      // Comparamos solo la parte de fecha (sin hora)
      const availDateStr = new Date(avail.availableDate).toISOString().split('T')[0]
      return availDateStr === bookingDateStr
    })

    return matchingAvailability || null
  } catch (error) {
    console.error('Error obteniendo disponibilidad para reserva:', error)
    return null
  }
}
