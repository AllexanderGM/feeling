import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de interacciones con sugerencias
 * Corresponde a: MatchSuggestionController
 * Endpoint principal: POST /matches/suggestions/{userId}/dismiss
 */
class MatchSuggestionService extends ServiceREST {
  constructor() {
    super()
  }

  /**
   * Registrar que un usuario descartó una sugerencia (acción "X")
   */
  async dismissSuggestion(targetUserId) {
    const context = 'descartar sugerencia'

    try {
      const endpoint = API_ENDPOINTS.MATCHES.DISMISS_SUGGESTION.replace('{userId}', encodeURIComponent(targetUserId))
      const response = await ServiceREST.post(endpoint)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'matchSuggestionService')
  }
}

const matchSuggestionService = new MatchSuggestionService()

export default matchSuggestionService
