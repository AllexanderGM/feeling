import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de analíticas de usuario para UserAnalyticsController (/user-analytics)
 * Solo endpoints de administrador para obtener estadísticas y métricas detalladas
 */
class UserAnalyticsService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ADMIN ENDPOINTS - ANALYTICS
  // ========================================

  /**
   * GET /user-analytics/overview - Resumen analítico
   */
  async getAnalyticsOverview() {
    const context = 'obtener resumen analítico'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ANALYTICS.OVERVIEW)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/user-metrics - Métricas comprehensivas de usuarios
   * Incluye: conteo por estatus + engagement + crecimiento + distribución geográfica
   */
  async getUserMetrics() {
    const context = 'obtener métricas de usuarios'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ANALYTICS.USER_METRICS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/metrics/{userId} - Métricas detalladas por usuario
   */
  async getUserDetailedMetrics(userId) {
    const context = 'obtener métricas detalladas del usuario'

    try {
      const url = API_ENDPOINTS.USER_ANALYTICS.USER_DETAILED_METRICS.replace('{userId}', encodeURIComponent(userId))
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/top-users - Top usuarios
   */
  async getTopUsers(limit = 10) {
    const context = 'obtener top usuarios'

    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_ANALYTICS.TOP_USERS}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/attribute-statistics - Estadísticas generales de atributos
   */
  async getAttributeStatistics() {
    const context = 'obtener estadísticas de atributos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ANALYTICS.ATTRIBUTE_STATISTICS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/interests-statistics - Estadísticas generales de intereses
   */
  async getInterestsStatistics() {
    const context = 'obtener estadísticas de intereses'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ANALYTICS.INTERESTS_STATISTICS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-analytics/tags-statistics - Estadísticas generales de tags
   */
  async getTagsStatistics() {
    const context = 'obtener estadísticas de tags'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ANALYTICS.TAGS_STATISTICS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Obtener resumen completo de todas las estadísticas
   */
  async getCompleteAnalytics() {
    const context = 'obtener analytics completas'

    try {
      const [overview, userMetrics, topUsers, attributeStats, interestsStats, tagsStats] = await Promise.all([
        this.getAnalyticsOverview(),
        this.getUserMetrics(),
        this.getTopUsers(),
        this.getAttributeStatistics(),
        this.getInterestsStatistics(),
        this.getTagsStatistics()
      ])

      return {
        overview,
        userMetrics,
        topUsers,
        attributeStatistics: attributeStats,
        interestsStatistics: interestsStats,
        tagsStatistics: tagsStats
      }
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'userAnalyticsService')
  }
}

// Exportar instancia única
export default new UserAnalyticsService()
