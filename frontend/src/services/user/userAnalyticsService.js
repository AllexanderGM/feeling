import { ServiceREST } from '@services/utils/serviceREST.js'
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
   * GET /user-analytics/overview - Resumen analítico general con conteos por estado
   * @returns {Promise<Object>} Objeto directo con contadores de usuarios:
   *   - total: número total de usuarios
   *   - active: usuarios activos (verificados + aprobados + perfil completo + no desactivados)
   *   - pending: usuarios pendientes de aprobación
   *   - incomplete: usuarios con perfil incompleto
   *   - unverified: usuarios sin verificar
   *   - rejected: usuarios no aprobados/rechazados
   *   - deactivated: usuarios desactivados
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
   * @returns {Promise<Object>} Objeto con 4 secciones principales:
   *   - userTabsCount: conteo de usuarios por estado (active, pending, incomplete, unverified, unapproved)
   *   - engagementStats: estadísticas de engagement de usuarios
   *   - growthStats: estadísticas de crecimiento temporal
   *   - geographicDistribution: distribución geográfica de usuarios
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
   * GET /user-analytics/metrics/{userId} - Métricas detalladas de un usuario específico
   * @param {string|number} userId - ID del usuario
   * @returns {Promise<UserMetricsDTO>} Objeto UserMetricsDTO con métricas detalladas del usuario
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
   * GET /user-analytics/top-users - Rankings de usuarios más populares y activos
   * @param {number} limit - Límite de usuarios a retornar (default: 10)
   * @returns {Promise<Object>} Map con rankings de usuarios más populares y activos
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
   * GET /user-analytics/attribute-statistics - Estadísticas de uso de atributos de usuario
   * @returns {Promise<Object>} Map con estadísticas comprehensivas sobre uso de atributos
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
   * GET /user-analytics/interests-statistics - Estadísticas de uso de intereses de usuario
   * @returns {Promise<Object>} Map con estadísticas comprehensivas sobre uso de intereses
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
   * GET /user-analytics/tags-statistics - Estadísticas del sistema de tags de usuario
   * @returns {Promise<UserTagStatisticsDTO>} Objeto UserTagStatisticsDTO con estadísticas del sistema de tags
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
   * Obtener resumen completo de todas las estadísticas disponibles
   * @returns {Promise<Object>} Objeto consolidado con todas las estadísticas:
   *   - overview: resumen general del sistema
   *   - userMetrics: métricas comprehensivas de usuarios
   *   - topUsers: rankings de usuarios
   *   - attributeStatistics: estadísticas de atributos
   *   - interestsStatistics: estadísticas de intereses
   *   - tagsStatistics: estadísticas de tags
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
   * Manejo de errores específico del servicio de analytics
   * @param {string} operation - Nombre de la operación que falló
   * @param {Error} error - Error capturado
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'userAnalyticsService')
  }
}

// Exportar instancia única
export default new UserAnalyticsService()
