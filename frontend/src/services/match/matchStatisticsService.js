import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de estadísticas de matches
 * Corresponde a: MatchStatisticsController
 * Endpoints: /matches/stats, /matches/notifications
 */
class MatchStatisticsService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Get match statistics for current user
   * GET /matches/stats?from=&to=
   * @param {string|null} from - Fecha inicio (formato: yyyy-MM-dd)
   * @param {string|null} to - Fecha fin (formato: yyyy-MM-dd)
   */
  async getMatchStats(from = null, to = null) {
    const context = 'obtener estadísticas de match'

    try {
      const params = new URLSearchParams()

      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const url = params.toString() ? `${API_ENDPOINTS.MATCHES.STATS}?${params}` : API_ENDPOINTS.MATCHES.STATS

      const response = await ServiceREST.get(url)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get match notifications
   * GET /matches/notifications
   */
  async getMatchNotifications() {
    const context = 'obtener notificaciones de match'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.NOTIFICATIONS)

      return ServiceREST.handleServiceResponse(response, context)
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
    Logger.serviceError(operation, error, 'matchStatisticsService')
  }
}

// Crear instancia única
const matchStatisticsService = new MatchStatisticsService()

export default matchStatisticsService
