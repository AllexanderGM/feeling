import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de planes de matches
 * Corresponde a: MatchPlanClientController
 * Endpoints: /matches/plans, /matches/plans/purchase, /matches/attempts
 */
class MatchPlanService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // LECTURAS
  // ========================================

  /**
   * Get all active match plans
   * GET /matches/plans
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
   * Get current user's match plans
   * GET /matches/plans/my
   */
  async getMyMatchPlans() {
    const context = 'obtener mis planes de match'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.PLANS}/my`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get current user's active match plans
   * GET /matches/plans/my/active
   */
  async getMyActiveMatchPlans() {
    const context = 'obtener mis planes activos'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.PLANS}/my/active`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Get user's remaining attempts
   * GET /matches/attempts
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

  // ========================================
  // CREACIÓN
  // ========================================

  /**
   * Create a Wompi payment intent for a match plan
   * POST /matches/plans/payment-intent
   */
  async createPaymentIntent(matchPlanId) {
    const context = 'crear intención de pago de plan de match'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.PAYMENT_INTENT, { matchPlanId })

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Confirm a match plan purchase after payment gateway approval
   * POST /matches/plans/purchase
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
   * Backwards compatible helper for legacy imports.
   * Delegates to confirmMatchPlanPurchase.
   */
  async purchaseMatchPlan(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('purchaseMatchPlan ahora requiere transactionId y paymentReference')
    }

    return this.confirmMatchPlanPurchase(payload)
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'matchPlanService')
  }
}

// Crear instancia única
const matchPlanService = new MatchPlanService()

export default matchPlanService
