import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de administración de matches - MatchAdminMatchController
 * Endpoints administrativos para monitorear y auditar matches
 */
class MatchAdminService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ADMIN - LISTADO Y FILTRADO
  // ========================================

  /**
   * Obtener todos los matches con filtros (admin)
   * GET /admin/matches?status=&initiatorUserId=&targetUserId=&from=&to=&page=&size=
   */
  async getAllMatches(filters = {}, page = 0, size = 20) {
    const context = 'obtener todos los matches'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.initiatorUserId) params.append('initiatorUserId', filters.initiatorUserId)
      if (filters.targetUserId) params.append('targetUserId', filters.targetUserId)
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)

      const result = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ADMIN_ALL_MATCHES}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener matches por estado (admin)
   */
  async getMatchesByStatus(status, page = 0, size = 20) {
    const context = `obtener matches ${status.toLowerCase()}`

    try {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ADMIN_ALL_MATCHES}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ADMIN - ESTADÍSTICAS
  // ========================================

  /**
   * Obtener resumen estadístico de matches (admin)
   * GET /admin/matches/summary?from=&to=
   */
  async getMatchSummary(from = null, to = null) {
    const context = 'obtener resumen de matches'

    try {
      const params = new URLSearchParams()

      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const result = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ADMIN_MATCH_SUMMARY}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener top usuarios que inician matches (admin)
   * GET /admin/matches/top-initiators?limit=&from=&to=
   */
  async getTopInitiators(limit = 5, from = null, to = null) {
    const context = 'obtener top iniciadores de matches'

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })

      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const result = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ADMIN_TOP_INITIATORS}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener top usuarios que reciben matches (admin)
   * GET /admin/matches/top-receivers?limit=&from=&to=
   */
  async getTopReceivers(limit = 5, from = null, to = null) {
    const context = 'obtener top receptores de matches'

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })

      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const result = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ADMIN_TOP_RECEIVERS}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
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
    Logger.serviceError(operation, error, 'matchAdminService')
  }
}

// Crear instancia única
const matchAdminService = new MatchAdminService()

export default matchAdminService
