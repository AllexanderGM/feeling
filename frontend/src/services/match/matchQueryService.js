import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de consultas de matches
 * Corresponde a: MatchQueryController
 * Endpoints: /matches/history, /sent, /received, /received/pending, /accepted
 */
class MatchQueryService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // LECTURAS - LISTAS
  // ========================================

  /**
   * Get match history with filters
   * GET /matches/history?status=&from=&to=&page=&size=
   */
  async getMatchHistory(status = null, from = null, to = null, page = 0, size = 10) {
    const context = 'obtener historial de matches'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (status) params.append('status', status)
      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.HISTORY}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get matches sent by current user
   * GET /matches/sent?page=&size=
   */
  async getSentMatches(page = 0, size = 10) {
    const context = 'obtener matches enviados'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.SENT}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get matches received by current user
   * GET /matches/received?page=&size=
   */
  async getReceivedMatches(page = 0, size = 10) {
    const context = 'obtener matches recibidos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.RECEIVED}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get pending received matches (awaiting response)
   * GET /matches/received/pending?page=&size=
   */
  async getPendingReceivedMatches(page = 0, size = 10) {
    const context = 'obtener matches recibidos pendientes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.RECEIVED_PENDING}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get accepted matches (mutual matches)
   * GET /matches/accepted?page=&size=
   */
  async getAcceptedMatches(page = 0, size = 10) {
    const context = 'obtener matches aceptados'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.ACCEPTED}?${params}`)

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
    Logger.serviceError(operation, error, 'matchQueryService')
  }
}

// Crear instancia única
const matchQueryService = new MatchQueryService()

export default matchQueryService
