import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de interacciones de matches
 * Corresponde a: MatchInteractionController
 * Endpoints: /matches (POST /send, /accept, /reject, GET /{id}, /contact)
 */
class MatchInteractionService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CREACIÓN / ACCIONES
  // ========================================

  /**
   * Send a match request to another user
   * POST /matches/send
   */
  async sendMatch(targetUserId) {
    const context = 'enviar match'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.SEND, { targetUserId })

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Accept a received match
   * POST /matches/{matchId}/accept
   */
  async acceptMatch(matchId) {
    const context = 'aceptar match'

    try {
      const response = await ServiceREST.post(`${API_ENDPOINTS.MATCHES.BASE}/${encodeURIComponent(matchId)}/accept`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Reject a received match
   * POST /matches/{matchId}/reject
   */
  async rejectMatch(matchId) {
    const context = 'rechazar match'

    try {
      const response = await ServiceREST.post(`${API_ENDPOINTS.MATCHES.BASE}/${encodeURIComponent(matchId)}/reject`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Withdraw a sent match before it is accepted/rejected
   * POST /matches/{matchId}/withdraw
   */
  async withdrawMatch(matchId) {
    const context = 'retirar match'

    try {
      const response = await ServiceREST.post(`${API_ENDPOINTS.MATCHES.BASE}/${encodeURIComponent(matchId)}/withdraw`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // LECTURAS DETALLE
  // ========================================

  /**
   * Get single match details by ID
   * GET /matches/{matchId}
   */
  async getMatchById(matchId) {
    const context = 'obtener detalle de match'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.BASE}/${encodeURIComponent(matchId)}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get contact information for a matched user
   * GET /matches/{matchId}/contact
   */
  async getMatchContact(matchId) {
    const context = 'obtener contacto de match'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.BASE}/${encodeURIComponent(matchId)}/contact`)

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
    Logger.serviceError(operation, error, 'matchInteractionService')
  }
}

// Crear instancia única
const matchInteractionService = new MatchInteractionService()

export default matchInteractionService
