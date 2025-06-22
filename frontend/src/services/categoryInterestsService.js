import { API_URL } from '@config/config'

/**
 * Servicio para manejo de categorías de interés
 */

/**
 * Obtiene todas las categorías de interés disponibles
 * @returns {Promise<Array>} Lista de categorías de interés
 */
export const getCategoryInterests = async () => {
  try {
    const response = await fetch(`${API_URL}/category-interests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error obteniendo categorías de interés:', error)
    throw error
  }
}

/**
 * Obtiene una categoría específica por su enum
 * @param {string} categoryEnum - El enum de la categoría (ESSENCE, ROUSE, SPIRIT)
 * @returns {Promise<Object>} Datos de la categoría
 */
export const getCategoryInterestByEnum = async categoryEnum => {
  try {
    const response = await fetch(`${API_URL}/category-interests/${categoryEnum}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error obteniendo categoría ${categoryEnum}:`, error)
    throw error
  }
}

/**
 * Obtiene categorías activas solamente
 * @returns {Promise<Array>} Lista de categorías activas
 */
export const getActiveCategoryInterests = async () => {
  try {
    const response = await fetch(`${API_URL}/category-interests?active=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error obteniendo categorías activas:', error)
    throw error
  }
}
