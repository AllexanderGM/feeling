import fetchData from '@utils/fetchData.js'
import { Cookies } from 'react-cookie'
import { Logger } from '@utils/logger.js'

const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'
const cookies = new Cookies()

// Mapeo de categorías en inglés (backend) a español (frontend)
const TAG_MAPPING = {
  BEACH: 'Playa',
  VACATION: 'Vacaciones',
  ADVENTURE: 'Aventura',
  ECOTOURISM: 'Ecoturismo',
  LUXURY: 'Lujo',
  CITY: 'Ciudad',
  MOUNTAIN: 'Montaña',
  CRUISE: 'Crucero',
  ADRENALIN: 'Adrenalina'
}

const getToken = () => {
  const token = cookies.get('auth_token')
  return token && typeof token === 'string' ? token : null
}

/**
 * @param {Object} filter - Optional filter parameters
 * @returns {Promise} - Promise with tours data
 */
export const getAllTours = async filter => {
  Logger.info('Obteniendo todos los tours', { filter })
  return await fetchData(`${URL}/tours`)
}

/**
 * @param {Object} filter - Optional filter parameters
 * @returns {Promise} - Promise with tours data
 */
export const toursAllRandom = async filter => {
  Logger.info('Obteniendo tours aleatorios', { filter })
  return await fetchData(`${URL}/tours/random`)
}

/**
 * Obtiene tours por categoría
 * @param {string} categoryTag - Tag de categoría (ej: "BEACH", "VACATION")
 * @returns {Promise} - Promise con los datos de tours filtrados
 */
export const getToursByCategory = async categoryTag => {
  try {
    const allTours = await getAllTours()

    if (!allTours.success || !Array.isArray(allTours.data)) {
      throw new Error('Error al obtener tours')
    }

    // Nombres de categoría en español (para comparar con lo que vemos en la UI)
    const spanishTag = TAG_MAPPING[categoryTag] || ''

    // Filtrar tours por el tag solicitado (tanto en inglés como en español)
    const filteredTours = allTours.data.filter(tour => {
      if (!tour.tags || !Array.isArray(tour.tags)) return false

      return tour.tags.some(tag => {
        if (!tag) return false
        const tagLower = String(tag).toLowerCase()
        return tagLower === categoryTag.toLowerCase() || tagLower === spanishTag.toLowerCase()
      })
    })

    return {
      success: true,
      data: filteredTours,
      total: filteredTours.length
    }
  } catch (error) {
    Logger.serviceError('obtener tours por categoría', error, 'tourService')
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

/**
 * Búsqueda de tours con criterios específicos
 * @param {string} searchTerm - Text to search for
 * @returns {Promise} - Promise with filtered tours data
 */
export const searchTours = async searchTerm => {
  Logger.info('Buscando tours', { searchTerm })
  return await toursAllRandom()
}

/**
 * Get tour by ID
 * @param {string|number} id - Tour ID
 * @returns {Promise} - Promise with tour data
 */
export const getTourById = async id => {
  return await fetchData(`${URL}/tours/${id}`)
}

/**
 * Crea un nuevo tour
 * @param {Object} tourData - Datos del tour a crear
 * @returns {Promise<Object>} - Tour creado o objeto con error
 */
export const createTour = async tourData => {
  try {
    const token = getToken()
    Logger.debug('Token verificado', { hasToken: !!token })

    Logger.debug('Datos del formulario recibidos', { tourData })
    Logger.debug('Estructura de destino', { destination: tourData.destination })

    // IMPORTANTE: En el backend, ILocationRepository.findByCountryAndCity tiene los parámetros invertidos
    // El método está definido como findByCountryAndCity(String city, String country)
    const countryIsoCode = tourData.destination?.country || ''
    const cityName = tourData.destination?.city || ''

    // Obtener el nombre completo del país a partir del código ISO
    let countryName = ''

    try {
      const countriesResponse = await fetch('/data/countries.json')
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        countryName = countriesData[countryIsoCode]?.name || countryIsoCode
      }
    } catch (error) {
      Logger.warn('Error obteniendo nombre del país', { error: error.message, countryIsoCode })
      countryName = countryIsoCode // Fallback: usar el código ISO si no podemos obtener el nombre
    }

    const requestData = {
      name: tourData.name,
      description: tourData.description,
      adultPrice: parseFloat(tourData.adultPrice) || 0,
      childPrice: parseFloat(tourData.childPrice) || 0,

      // Aseguramos que images sea un array de strings
      images: Array.isArray(tourData.images)
        ? tourData.images.filter(img => typeof img === 'string' && img.trim() !== '')
        : ['https://via.placeholder.com/800x600?text=Imagen+del+tour'],

      // Status debe ser un enum, enviamos el string directamente
      status: 'Disponible',

      tags: Array.isArray(tourData.tags) ? tourData.tags : [],

      includes: Array.isArray(tourData.includes) ? tourData.includes.map(item => (typeof item === 'string' ? item : item.type)) : [],

      destination: {
        // El backend espera los campos en el orden normal
        country: countryName, // Enviamos el nombre completo del país
        city: cityName // Enviamos el nombre de la ciudad
      },

      hotel: typeof tourData.hotel === 'number' ? tourData.hotel : typeof tourData.hotelStars === 'number' ? tourData.hotelStars : 4,

      availability: Array.isArray(tourData.availability)
        ? tourData.availability
        : [
            {
              availableDate: tourData.availability?.availableDate || '',
              availableSlots: parseInt(tourData.availability?.availableSlots || 10),
              departureTime: tourData.availability?.departureTime || '',
              returnTime: tourData.availability?.returnTime || ''
            }
          ]
    }

    Logger.debug('Datos preparados para backend', { requestData })

    const headers = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${URL}/tours`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    })

    // Obtener texto de respuesta para examinarlo
    const responseText = await response.text()
    Logger.debug('Respuesta del servidor', { responseText })

    if (!response.ok) {
      Logger.serviceError('crear tour', { status: response.status, responseText }, 'tourService')
      return {
        error: true,
        status: response.status,
        message: `Error al crear tour (${response.status}): ${responseText || response.statusText || 'Error desconocido'}`
      }
    }

    try {
      return JSON.parse(responseText)
    } catch (e) {
      Logger.warn('Respuesta no es JSON válido', { responseText })
      return { success: true, response: responseText }
    }
  } catch (error) {
    Logger.serviceError('crear tour', error, 'tourService')
    return { error: true, message: error.message }
  }
}

/**
 * Actualiza un tour existente
 * @param {string|number} id - ID del tour a actualizar
 * @param {Object} tourData - Datos actualizados
 * @returns {Promise<Object>} - Tour actualizado o objeto con error
 */
export const updateTour = async (id, tourData) => {
  try {
    const token = getToken()

    if (tourData.availability && !Array.isArray(tourData.availability)) {
      tourData.availability = [tourData.availability]
    }

    const response = await fetch(`${URL}/tours/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(tourData)
    })

    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        message: `Error al actualizar tour: ${response.statusText || response.status}`
      }
    }

    return await response.json()
  } catch (error) {
    Logger.serviceError('actualizar tour', error, 'tourService')
    return { error: true, message: error.message }
  }
}

/**
 * Elimina un tour
 * @param {string|number} id - ID del tour a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteTour = async id => {
  try {
    const token = getToken()

    const response = await fetch(`${URL}/tours/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    return response.ok
  } catch (error) {
    Logger.serviceError('eliminar tour', error, 'tourService')
    return false
  }
}
