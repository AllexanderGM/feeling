import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de matches simplificado - Solo comunicación con API
 */
class MatchService extends ServiceREST {
  constructor() {
    super()
  }

  // ===============================
  // MATCH PLANS MANAGEMENT
  // ===============================

  /**
   * Get available match plans
   */
  async getAvailablePlans() {
    const context = 'obtener planes de match'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.PLANS)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async createMatchPlanPaymentIntent(matchPlanId) {
    const context = 'crear intento de pago de plan de match'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.PAYMENT_INTENT, { matchPlanId })

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Purchase a match plan
   */
  async purchaseMatchPlan(payload) {
    return this.confirmMatchPlanPurchase(payload)
  }

  /**
   * Confirm a match plan purchase
   */
  async confirmMatchPlanPurchase(payload) {
    const context = 'confirmar compra de plan de match'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.PURCHASE_PLAN, payload)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get user's remaining attempts
   */
  async getRemainingAttempts() {
    const context = 'obtener intentos restantes'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.ATTEMPTS)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ===============================
  // MATCH OPERATIONS
  // ===============================

  /**
   * Send a match request to another user
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
   * Withdraw a sent match request
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

  /**
   * Get contact information for a matched user
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

  // ===============================
  // MATCH LISTS
  // ===============================

  /**
   * Get matches sent by current user
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

  /**
   * Get match history with filters
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
   * Get single match details by ID
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

  // ===============================
  // FAVORITES MANAGEMENT
  // ===============================

  /**
   * Add user to favorites
   * @param {number} favoriteUserId - ID del usuario a añadir a favoritos
   */
  async addToFavorites(favoriteUserId) {
    const context = 'añadir a favoritos'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.FAVORITES, { favoriteUserId })

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Remove user from favorites
   * @param {number} favoriteUserId - ID del usuario a remover de favoritos
   */
  async removeFromFavorites(favoriteUserId) {
    const context = 'quitar de favoritos'

    try {
      const response = await ServiceREST.delete(`${API_ENDPOINTS.MATCHES.FAVORITES}/${encodeURIComponent(favoriteUserId)}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get user's favorites list
   */
  async getFavorites(page = 0, size = 10) {
    const context = 'obtener favoritos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.FAVORITES}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Check if a user is in favorites
   * @param {number} userId - ID del usuario a verificar
   */
  async checkIfFavorite(userId) {
    const context = 'verificar si es favorito'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.FAVORITES}/${encodeURIComponent(userId)}/check`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ===============================
  // STATISTICS & NOTIFICATIONS
  // ===============================

  /**
   * Get match statistics for current user
   */
  async getMatchStats() {
    const context = 'obtener estadísticas de match'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.STATS)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get match notifications
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

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    const context = 'marcar notificación como leída'

    try {
      const response = await ServiceREST.patch(`${API_ENDPOINTS.MATCHES.NOTIFICATIONS}/${encodeURIComponent(notificationId)}/read`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ===============================
  // ADMIN ENDPOINTS (Plan Management)
  // ===============================

  /**
   * Get all match plans for admin (includes inactive plans)
   */
  async getAllPlansForAdmin() {
    const context = 'obtener planes de match para admin'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.ADMIN_ALL_PLANS)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get match plans statistics (admin only)
   */
  async getPlanStats() {
    const context = 'obtener estadísticas de planes'

    try {
      const response = await ServiceREST.get(API_ENDPOINTS.MATCHES.ADMIN_PLAN_STATS)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Create new match plan (admin only) - TO BE IMPLEMENTED
   */
  async createPlan(planData) {
    const context = 'crear plan de match'

    try {
      // TODO: Implement this endpoint in backend
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.ADMIN_CREATE_PLAN, planData)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Update match plan (admin only) - TO BE IMPLEMENTED
   */
  async updatePlan(planId, planData) {
    const context = 'actualizar plan de match'

    try {
      // TODO: Implement this endpoint in backend
      const url = API_ENDPOINTS.MATCHES.ADMIN_UPDATE_PLAN.replace('{planId}', encodeURIComponent(planId))
      const response = await ServiceREST.put(url, planData)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Delete match plan (admin only) - TO BE IMPLEMENTED
   */
  async deletePlan(planId) {
    const context = 'eliminar plan de match'

    try {
      // TODO: Implement this endpoint in backend
      const url = API_ENDPOINTS.MATCHES.ADMIN_DELETE_PLAN.replace('{planId}', encodeURIComponent(planId))
      const response = await ServiceREST.delete(url)

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
    Logger.serviceError(operation, error, 'matchService')
  }
}

// Crear instancia única
const matchService = new MatchService()

export default matchService
