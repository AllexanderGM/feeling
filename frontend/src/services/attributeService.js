// services/attributeService.js
import { API_URL } from '@config/config'

/**
 * Obtiene el token de autenticación del localStorage o sessionStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
}

/**
 * Crea headers de autenticación estándar
 */
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

/**
 * Maneja respuestas de error de la API
 */
const handleApiError = async (response, operation) => {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`

    try {
      const errorData = await response.json()

      if (errorData.error === 'VALIDATION_ERROR' && errorData.details) {
        const validationErrors = Object.entries(errorData.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
        errorMessage = `Error de validación: ${validationErrors}`
      } else if (errorData.error === 'DUPLICATE_ATTRIBUTE') {
        errorMessage = 'Ya existe un atributo con ese nombre. Será añadido una vez sea aprobado.'
      } else if (errorData.error === 'INVALID_ATTRIBUTE_TYPE') {
        errorMessage = 'Tipo de atributo no válido'
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch (parseError) {
      console.warn('No se pudo parsear el error del servidor:', parseError)
    }

    throw new Error(errorMessage)
  }
}

/**
 * Obtiene todos los atributos de usuario agrupados por tipo
 */
export const getUserAttributes = async () => {
  try {
    const response = await fetch(`${API_URL}/user-attributes`, {
      headers: getAuthHeaders()
    })

    await handleApiError(response, 'obtener atributos')
    return await response.json()
  } catch (error) {
    console.error('Error obteniendo atributos de usuario:', error)
    throw error
  }
}

/**
 * Obtiene atributos de un tipo específico
 */
export const getUserAttributesByType = async attributeType => {
  try {
    const response = await fetch(`${API_URL}/user-attributes/${attributeType}`, {
      headers: getAuthHeaders()
    })

    await handleApiError(response, `obtener atributos de tipo ${attributeType}`)
    return await response.json()
  } catch (error) {
    console.error(`Error obteniendo atributos de tipo ${attributeType}:`, error)
    throw error
  }
}

/**
 * Crea un nuevo atributo de usuario
 * @param {string} attributeType - Tipo de atributo (EYE_COLOR, HAIR_COLOR, etc.)
 * @param {object} attributeData - Datos del atributo {name, detail}
 * @returns {Promise<object>} - Atributo creado
 */
export const createUserAttribute = async (attributeType, attributeData) => {
  try {
    const response = await fetch(`${API_URL}/user-attributes/${attributeType}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attributeData)
    })

    await handleApiError(response, `crear atributo de tipo ${attributeType}`)
    return await response.json()
  } catch (error) {
    console.error(`Error creando atributo de tipo ${attributeType}:`, error)

    // Error de conexión
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }

    throw error
  }
}

/**
 * Obtiene sugerencias de tags por categoría
 * @param {string} categoryInterest - Categoría de interés
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} - Array de tags sugeridos
 */
export const getCategorySuggestions = async (categoryInterest, limit = 15) => {
  const token = getAuthToken()

  if (!token || !categoryInterest) {
    return []
  }

  try {
    const response = await fetch(`${API_URL}/tags/popular/category/${categoryInterest}?limit=${limit}`, {
      headers: getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      return data || []
    }

    return []
  } catch (error) {
    console.error('Error fetching category suggestions:', error)
    return []
  }
}
