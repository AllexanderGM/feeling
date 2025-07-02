import { ServiceREST } from '@services/serviceREST.js'

/**
 * Servicio para manejo de categorías de interés
 */
class CategoryInterestsService extends ServiceREST {
  /**
   * Obtiene todas las categorías de interés disponibles
   * @returns {Promise<Array>} Lista de categorías de interés
   */
  async getAllCategories() {
    try {
      const result = await ServiceREST.get('/category-interests')
      return ServiceREST.handleServiceResponse(result, 'obtener categorías de interés')
    } catch (error) {
      console.error('❌ Error obteniendo categorías de interés:', {
        type: error.errorType,
        message: error.message,
        operation: error.operation
      })
      throw error
    }
  }

  /**
   * Obtiene una categoría específica por su enum
   * @param {string} categoryEnum - El enum de la categoría (ESSENCE, ROUSE, SPIRIT)
   * @returns {Promise<Object>} Datos de la categoría
   */
  async getCategoryByEnum(categoryEnum) {
    try {
      const result = await ServiceREST.get(`/category-interests/${categoryEnum}`)
      return ServiceREST.handleServiceResponse(result, `obtener categoría ${categoryEnum}`)
    } catch (error) {
      console.error(`❌ Error obteniendo categoría ${categoryEnum}:`, {
        type: error.errorType,
        message: error.message,
        operation: error.operation
      })
      throw error
    }
  }

  /**
   * Obtiene categorías activas solamente
   * @returns {Promise<Array>} Lista de categorías activas
   */
  async getActiveCategories() {
    try {
      const result = await ServiceREST.get('/category-interests?active=true')
      return ServiceREST.handleServiceResponse(result, 'obtener categorías activas')
    } catch (error) {
      console.error('❌ Error obteniendo categorías activas:', {
        type: error.errorType,
        message: error.message,
        operation: error.operation
      })
      throw error
    }
  }
}

const categoryInterestsService = new CategoryInterestsService()

export const getCategoryInterests = () => categoryInterestsService.getAllCategories()
export const getCategoryInterestByEnum = categoryEnum => categoryInterestsService.getCategoryByEnum(categoryEnum)
export const getActiveCategoryInterests = () => categoryInterestsService.getActiveCategories()

export default categoryInterestsService
