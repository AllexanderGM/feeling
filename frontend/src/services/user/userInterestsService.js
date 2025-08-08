import { ServiceREST } from '@services/utils/serviceREST.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de intereses de usuario para UserInterestController (/user-interests)
 * Incluye endpoints de cliente y administrador según especificaciones
 * Nota: Las categorías de interés ya no tienen lógica de aprobación
 */
class UserInterestsService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE ENDPOINTS (AUTHENTICATED)
  // ========================================

  /**
   * GET /user-interests - Todas las categorías de interés
   */
  async getAllInterests() {
    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_INTERESTS.ALL)
      return ServiceREST.handleServiceResponse(result, 'obtener categorías de interés')
    } catch (error) {
      this.logError('obtener categorías de interés', error)
      throw error
    }
  }

  /**
   * GET /user-interests/{id} - Categoría de interés por ID
   */
  async getInterestById(interestId) {
    try {
      const url = API_ENDPOINTS.USER_INTERESTS.BY_ID.replace('{id}', interestId)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, `obtener interés ${interestId}`)
    } catch (error) {
      this.logError(`obtener interés ${interestId}`, error)
      throw error
    }
  }

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * POST /user-interests - Agregar nueva categoría de interés (admin)
   */
  async createInterest(interestData) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_INTERESTS.CREATE, interestData)
      return ServiceREST.handleServiceResponse(result, 'crear categoría de interés')
    } catch (error) {
      this.logError('crear categoría de interés', error)
      throw error
    }
  }

  /**
   * PUT /user-interests/{interestId} - Actualizar categoría de interés (admin)
   */
  async updateInterest(interestId, interestData) {
    try {
      const url = API_ENDPOINTS.USER_INTERESTS.UPDATE.replace('{interestId}', interestId)
      const result = await ServiceREST.put(url, interestData)
      return ServiceREST.handleServiceResponse(result, `actualizar interés ${interestId}`)
    } catch (error) {
      this.logError(`actualizar interés ${interestId}`, error)
      throw error
    }
  }

  /**
   * DELETE /user-interests/{interestId} - Eliminar categoría de interés (admin)
   */
  async deleteInterest(interestId) {
    try {
      const url = API_ENDPOINTS.USER_INTERESTS.DELETE.replace('{interestId}', interestId)
      const result = await ServiceREST.delete(url)
      return ServiceREST.handleServiceResponse(result, `eliminar interés ${interestId}`)
    } catch (error) {
      this.logError(`eliminar interés ${interestId}`, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Validar datos de interés antes de crear/actualizar
   */
  validateInterestData(interestData) {
    const required = ['name', 'description']
    const missing = required.filter(field => !interestData[field])

    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`)
    }

    return true
  }

  /**
   * Buscar intereses por nombre (búsqueda local)
   */
  async searchInterestsByName(searchTerm) {
    try {
      const allInterests = await this.getAllInterests()
      return allInterests.filter(
        interest =>
          interest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interest.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      this.logError('buscar intereses por nombre', error)
      throw error
    }
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    this.Logger.serviceError(operation, error, 'UserInterestsService')
  }
}

// Crear instancia única
const userInterestsService = new UserInterestsService()

// Exportar métodos individuales para compatibilidad con código existente
export const getUserInterests = () => userInterestsService.getAllInterests()
export const getUserInterestById = interestId => userInterestsService.getInterestById(interestId)
export const createUserInterest = interestData => userInterestsService.createInterest(interestData)
export const updateUserInterest = (interestId, interestData) => userInterestsService.updateInterest(interestId, interestData)
export const deleteUserInterest = interestId => userInterestsService.deleteInterest(interestId)
export const searchInterestsByName = searchTerm => userInterestsService.searchInterestsByName(searchTerm)

export default userInterestsService
