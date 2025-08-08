import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
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

  /**
   * Purchase a match plan
   */
  async purchaseMatchPlan(planId) {
    const context = 'comprar plan de match'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.PURCHASE_PLAN, { planId })
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

  // ===============================
  // FAVORITES MANAGEMENT
  // ===============================

  /**
   * Add user to favorites
   */
  async addToFavorites(userId) {
    const context = 'añadir a favoritos'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.FAVORITES, { userId })
      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Remove user from favorites
   */
  async removeFromFavorites(userId) {
    const context = 'quitar de favoritos'

    try {
      const response = await ServiceREST.delete(`${API_ENDPOINTS.MATCHES.FAVORITES}/${encodeURIComponent(userId)}`)
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
    this.Logger.serviceError(operation, error, 'matchService')
  }
}

// Crear instancia única
const matchService = new MatchService()

export default matchService
