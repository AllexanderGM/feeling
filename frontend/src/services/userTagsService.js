import { ServiceREST } from '@services/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'

/**
 * Servicio de tags de usuario - Manejo de tags e intereses de usuario
 */
class UserTagsService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // GESTIÓN DE TAGS PERSONAL
  // ========================================

  /**
   * Obtiene todos los tags del usuario autenticado
   * @returns {Promise<Array>} Lista de tags del usuario
   */
  async getMyTags() {
    try {
      const result = await ServiceREST.get('/tags/my-tags')
      return ServiceREST.handleServiceResponse(result, 'obtener mis tags')
    } catch (error) {
      this.logError('obtener mis tags', error)
      throw error
    }
  }

  /**
   * A�ade un nuevo tag al perfil del usuario
   * @param {string} tagName - Nombre del tag a agregar
   * @returns {Promise<Object>} Tag agregado
   */
  async addTagToMyProfile(tagName) {
    try {
      const result = await ServiceREST.post('/tags/my-tags', { name: tagName })
      return ServiceREST.handleServiceResponse(result, 'agregar tag a mi perfil')
    } catch (error) {
      this.logError('agregar tag', error)
      throw error
    }
  }

  /**
   * Remueve un tag del perfil del usuario
   * @param {string} tagName - Nombre del tag a remover
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async removeTagFromMyProfile(tagName) {
    try {
      const result = await ServiceREST.delete(`/tags/my-tags/${encodeURIComponent(tagName)}`)
      return ServiceREST.handleServiceResponse(result, 'remover tag de mi perfil')
    } catch (error) {
      this.logError('remover tag', error)
      throw error
    }
  }

  /**
   * Reemplaza todos los tags del usuario con una nueva lista
   * @param {Array<string>} tags - Lista de tags a establecer
   * @returns {Promise<Array>} Lista de tags actualizada
   */
  async updateMyTags(tags) {
    try {
      const result = await ServiceREST.put('/tags/my-tags', { tags })
      return ServiceREST.handleServiceResponse(result, 'actualizar mis tags')
    } catch (error) {
      this.logError('actualizar tags', error)
      throw error
    }
  }

  // ========================================
  // BÚSQUEDA Y DESCUBRIMIENTO
  // ========================================

  /**
   * Busca tags por nombre
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados (default: 20)
   * @returns {Promise<Array>} Lista de tags encontrados
   */
  async searchTags(query, limit = 20) {
    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      params.append('limit', limit.toString())

      const result = await ServiceREST.get(`/tags/search?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, 'buscar tags')
    } catch (error) {
      this.logError('buscar tags', error)
      throw error
    }
  }

  /**
   * Obtiene los tags más populares del sistema
   * @param {number} limit - Límite de resultados (default: 20)
   * @returns {Promise<Array>} Lista de tags populares
   */
  async getPopularTags(limit = 20) {
    try {
      const result = await ServiceREST.get(`/tags/popular?limit=${limit}`)
      return ServiceREST.handleServiceResponse(result, 'obtener tags populares')
    } catch (error) {
      this.logError('obtener tags populares', error)
      throw error
    }
  }

  /**
   * Obtiene los tags en tendencia
   * @param {number} limit - Límite de resultados (default: 15)
   * @returns {Promise<Array>} Lista de tags en tendencia
   */
  async getTrendingTags(limit = 15) {
    try {
      const result = await ServiceREST.get(`/tags/trending?limit=${limit}`)
      return ServiceREST.handleServiceResponse(result, 'obtener tags en tendencia')
    } catch (error) {
      this.logError('obtener tags en tendencia', error)
      throw error
    }
  }

  /**
   * Obtiene sugerencias de tags para el usuario autenticado
   * @param {number} limit - Límite de resultados (default: 10)
   * @returns {Promise<Array>} Lista de sugerencias de tags
   */
  async getTagSuggestions(limit = 10) {
    try {
      const result = await ServiceREST.get(`/tags/suggestions?limit=${limit}`)
      return ServiceREST.handleServiceResponse(result, 'obtener sugerencias de tags')
    } catch (error) {
      this.logError('obtener sugerencias de tags', error)
      throw error
    }
  }

  /**
   * Obtiene sugerencias de tags basadas en la categoría del usuario
   * @returns {Promise<Array>} Lista de sugerencias por categoría
   */
  async getCategorySuggestions() {
    try {
      const result = await ServiceREST.get('/tags/suggestions/category')
      return ServiceREST.handleServiceResponse(result, 'obtener sugerencias por categoría')
    } catch (error) {
      this.logError('obtener sugerencias por categoría', error)
      throw error
    }
  }

  /**
   * Obtiene tags populares por categoría de inters
   * @param {string} categoryInterest - Categoría de inters
   * @param {number} limit - Límite de resultados (default: 15)
   * @returns {Promise<Array>} Lista de tags populares por categoría
   */
  async getPopularTagsByCategory(categoryInterest, limit = 15) {
    try {
      if (!categoryInterest) {
        console.warn('� No se proporción categoría de inters')
        return []
      }

      const result = await ServiceREST.get(`/tags/popular/category/${categoryInterest}?limit=${limit}`)

      if (!result.success) {
        console.warn('� No se pudieron obtener tags por categoría:', result.error?.message)
        return []
      }

      return result.data || []
    } catch (error) {
      console.error('L Error obteniendo tags por categoría:', {
        type: error.errorType,
        message: error.message,
        categoryInterest
      })
      // Para este caso específico, devolver array vacío en lugar de lanzar error
      return []
    }
  }

  // ========================================
  // MATCHING Y COMPATIBILIDAD
  // ========================================

  /**
   * Encuentra usuarios con tags similares para matching
   * @param {number} limit - Límite de resultados (default: 10)
   * @returns {Promise<Array>} Lista de usuarios con tags similares
   */
  async findUsersWithSimilarTags(limit = 10) {
    try {
      const result = await ServiceREST.get(`/tags/similar-users?limit=${limit}`)
      return ServiceREST.handleServiceResponse(result, 'encontrar usuarios con tags similares')
    } catch (error) {
      this.logError('encontrar usuarios similares', error)
      throw error
    }
  }

  /**
   * Calcula la compatibilidad con otro usuario basada en tags
   * @param {string} otherUserEmail - Email del otro usuario
   * @returns {Promise<number>} Porcentaje de compatibilidad
   */
  async calculateCompatibility(otherUserEmail) {
    try {
      const result = await ServiceREST.get(`/tags/compatibility/${encodeURIComponent(otherUserEmail)}`)
      return ServiceREST.handleServiceResponse(result, 'calcular compatibilidad por tags')
    } catch (error) {
      this.logError('calcular compatibilidad', error)
      throw error
    }
  }

  /**
   * Obtiene recomendaciones de usuarios para matching basadas en tags
   * @param {number} limit - Límite de resultados (default: 20)
   * @returns {Promise<Array>} Lista de recomendaciones de usuarios
   */
  async getMatchRecommendations(limit = 20) {
    try {
      const result = await ServiceREST.get(`/tags/match-recommendations?limit=${limit}`)
      return ServiceREST.handleServiceResponse(result, 'obtener recomendaciones de matching')
    } catch (error) {
      this.logError('obtener recomendaciones de matching', error)
      throw error
    }
  }

  // ========================================
  // ESTADÍSTICAS Y ANÁLISIS
  // ========================================

  /**
   * Obtiene estadísticas generales del sistema de tags
   * @returns {Promise<Object>} Estadísticas del sistema de tags
   */
  async getTagStatistics() {
    try {
      const result = await ServiceREST.get('/tags/statistics')
      return ServiceREST.handleServiceResponse(result, 'obtener estadísticas de tags')
    } catch (error) {
      this.logError('obtener estadísticas de tags', error)
      throw error
    }
  }

  // ========================================
  // ADMINISTRACIÓN (Solo para ADMIN)
  // ========================================

  /**
   * Limpieza manual de tags sin uso (solo administradores)
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async cleanupUnusedTags() {
    try {
      const result = await ServiceREST.post('/tags/admin/cleanup')
      return ServiceREST.handleServiceResponse(result, 'limpieza de tags sin uso')
    } catch (error) {
      this.logError('limpieza de tags', error)
      throw error
    }
  }

  /**
   * Fuerza la actualización de métricas de tags (solo administradores)
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async updateTagMetrics() {
    try {
      const result = await ServiceREST.post('/tags/admin/update-metrics')
      return ServiceREST.handleServiceResponse(result, 'actualizar métricas de tags')
    } catch (error) {
      this.logError('actualizar métricas de tags', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Registra errores con información contextual
   * @param {string} operation - Operación que falló
   * @param {Error} error - Error ocurrido
   */
  logError(operation, error) {
    error.operation = operation
    console.error(`L Error en ${operation}:`, ErrorManager.formatError(error))
  }
}

// Crear instancia única
const userTagsService = new UserTagsService()

// Exportar métodos individuales para mayor flexibilidad
export const getMyTags = () => userTagsService.getMyTags()
export const addTagToMyProfile = tagName => userTagsService.addTagToMyProfile(tagName)
export const removeTagFromMyProfile = tagName => userTagsService.removeTagFromMyProfile(tagName)
export const updateMyTags = tags => userTagsService.updateMyTags(tags)
export const searchTags = (query, limit) => userTagsService.searchTags(query, limit)
export const getPopularTags = limit => userTagsService.getPopularTags(limit)
export const getTrendingTags = limit => userTagsService.getTrendingTags(limit)
export const getTagSuggestions = limit => userTagsService.getTagSuggestions(limit)
export const getCategorySuggestions = () => userTagsService.getCategorySuggestions()
export const getPopularTagsByCategory = (categoryInterest, limit) => userTagsService.getPopularTagsByCategory(categoryInterest, limit)
export const findUsersWithSimilarTags = limit => userTagsService.findUsersWithSimilarTags(limit)
export const calculateCompatibility = otherUserEmail => userTagsService.calculateCompatibility(otherUserEmail)
export const getMatchRecommendations = limit => userTagsService.getMatchRecommendations(limit)
export const getTagStatistics = () => userTagsService.getTagStatistics()
export const cleanupUnusedTags = () => userTagsService.cleanupUnusedTags()
export const updateTagMetrics = () => userTagsService.updateTagMetrics()

export default userTagsService
