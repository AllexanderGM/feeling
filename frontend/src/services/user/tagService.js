import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'
import userAnalyticsService from './userAnalyticsService.js'

/**
 * Servicio de tags de compatibilidad - Migrado a usar ServiceREST
 * Nota: Muchas funciones nuevas están en userTagsService.js
 * Este servicio mantiene compatibilidad con código existente
 */
class TagService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ADMINISTRACIÓN DE TAGS
  // ========================================

  /**
   * Obtiene tags pendientes de aprobación
   */
  async getPendingTags() {
    const context = 'obtener tags pendientes'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_TAGS.PENDING_APPROVAL)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Aprueba un tag específico
   */
  async approveTag(tagId) {
    const context = 'aprobar tag'

    try {
      const url = API_ENDPOINTS.USER_TAGS.APPROVE.replace('{tagId}', encodeURIComponent(tagId))
      const result = await ServiceREST.post(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Rechaza un tag con una razón
   */
  async rejectTag(tagId, reason) {
    const context = 'rechazar tag'

    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      const url = API_ENDPOINTS.USER_TAGS.REJECT.replace('{tagId}', encodeURIComponent(tagId))
      const result = await ServiceREST.post(`${url}${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Aprueba múltiples tags en lote
   */
  async approveBatchTags(tagIds) {
    const context = 'aprobar tags en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.APPROVE_BATCH, tagIds)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de tags - Actualizado para usar UserAnalyticsController
   */
  async getTagStatistics() {
    const context = 'obtener estadísticas de tags'

    try {
      // Usar el nuevo endpoint de analytics en lugar del antiguo
      const result = await userAnalyticsService.getTagsStatistics()
      return result
    } catch (error) {
      this.logError(context, error)
      // Fallback a datos mock en caso de error
      return {
        totalTags: 0,
        approvedTags: 0,
        pendingTags: 0,
        rejectedTags: 0,
        mostPopularTags: [],
        recentlyCreated: 0,
        monthlyGrowth: 0
      }
    }
  }

  // ========================================
  // BÚSQUEDA Y SUGERENCIAS PÚBLICAS
  // ========================================

  /**
   * Busca tags aprobados
   */
  async searchApprovedTags(term, limit = 20) {
    const context = 'buscar tags aprobados'

    try {
      const params = new URLSearchParams({
        query: term,
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.SEARCH}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  /**
   * Obtiene tags populares aprobados
   */
  async getPopularApprovedTags(limit = 20) {
    const context = 'obtener tags populares'

    try {
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.POPULAR}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  /**
   * Obtiene tags en tendencia
   */
  async getTrendingTags(limit = 15) {
    const context = 'obtener tags en tendencia'

    try {
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.TRENDING}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  // ========================================
  // GESTIÓN PERSONAL DE TAGS
  // ========================================

  /**
   * Obtiene los tags del usuario autenticado
   */
  async getMyTags() {
    const context = 'obtener mis tags'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_TAGS.MY_TAGS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Añade un tag al perfil del usuario
   */
  async addTagToProfile(tagName) {
    const context = 'añadir tag al perfil'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.ADD_TAGS, {
        tags: [tagName]
      })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Remueve un tag del perfil del usuario
   */
  async removeTagFromProfile(tagId) {
    const context = 'remover tag del perfil'

    try {
      const result = await ServiceREST.delete(`${API_ENDPOINTS.USER_TAGS.MY_TAGS}/${encodeURIComponent(tagId)}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Reemplaza todos los tags del usuario
   */
  async updateMyTags(tags) {
    const context = 'actualizar mis tags'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.ADD_TAGS, {
        tags: tags
      })
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // SUGERENCIAS Y MATCHING
  // ========================================

  /**
   * Obtiene sugerencias de tags para el usuario
   */
  async getTagSuggestions(limit = 10) {
    const context = 'obtener sugerencias de tags'

    try {
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.SUGGESTIONS}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  /**
   * Obtiene sugerencias basadas en la categoría del usuario
   */
  async getCategorySuggestions() {
    const context = 'obtener sugerencias por categoría'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_TAGS.SUGGESTIONS)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  /**
   * Encuentra usuarios con tags similares
   */
  async findUsersWithSimilarTags(limit = 10) {
    const context = 'encontrar usuarios con tags similares'

    try {
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.USERS_WITH_TAGS}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  /**
   * Calcula compatibilidad con otro usuario
   */
  async calculateCompatibility(otherUserEmail) {
    const context = 'calcular compatibilidad'

    try {
      const url = API_ENDPOINTS.USER.COMPATIBILITY.replace('{otherUserEmail}', encodeURIComponent(otherUserEmail))
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      return { compatibility: 0 }
    }
  }

  /**
   * Obtiene recomendaciones de usuarios para matching
   */
  async getMatchRecommendations(limit = 20) {
    const context = 'obtener recomendaciones de match'

    try {
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER.SUGGESTIONS}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  // ========================================
  // ESTADÍSTICAS Y ANÁLISIS
  // ========================================

  /**
   * Obtiene tags populares por categoría
   */
  async getPopularTagsByCategory(categoryInterest, limit = 15) {
    const context = 'obtener tags populares por categoría'

    try {
      // Como fallback, obtener tags populares generales
      const params = new URLSearchParams({
        page: '0',
        size: limit.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.POPULAR}?${params}`)
      const data = ServiceREST.handleServiceResponse(result, context)
      return data?.content || data || []
    } catch (error) {
      this.logError(context, error)
      return []
    }
  }

  // ========================================
  // ADMINISTRACIÓN AVANZADA (Solo ADMIN)
  // ========================================

  /**
   * Limpieza manual de tags sin uso
   */
  async cleanupUnusedTags() {
    const context = 'limpiar tags sin uso'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.CLEANUP)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Método de compatibilidad - ya no existe endpoint específico
   */
  async updateTagMetrics() {
    const context = 'actualizar métricas de tags'

    try {
      this.Logger.warn('updateTagMetrics: Endpoint no disponible en la nueva estructura')
      return { message: 'Métricas actualizadas automáticamente' }
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'tagService')
  }
}

// Crear instancia única
const tagService = new TagService()

export default tagService
