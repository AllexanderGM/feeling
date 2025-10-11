import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de aprobación de usuarios - UserApprovalController
 * Gestiona el proceso de aprobación/rechazo de nuevos usuarios
 */
class UserApprovalService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CONSULTAS
  // ========================================

  /**
   * GET /user-approval/pending - Usuarios pendientes de aprobación
   */
  async getPendingUsers(page = 0, size = 20, searchTerm = '') {
    const context = 'obtener usuarios pendientes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('searchTerm', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_APPROVAL.PENDING}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-approval/rejected - Usuarios rechazados
   */
  async getRejectedUsers(page = 0, size = 20, searchTerm = '') {
    const context = 'obtener usuarios rechazados'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('searchTerm', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_APPROVAL.REJECTED}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // GESTIÓN INDIVIDUAL
  // ========================================

  /**
   * PUT /user-approval/{userId}/approve - Aprobar usuario
   */
  async approveUser(userId) {
    const context = 'aprobar usuario'

    try {
      const url = API_ENDPOINTS.USER_APPROVAL.APPROVE.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * PUT /user-approval/{userId}/reject - Rechazar usuario
   */
  async rejectUser(userId) {
    const context = 'rechazar usuario'

    try {
      const url = API_ENDPOINTS.USER_APPROVAL.REJECT.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * PUT /user-approval/{userId}/pending - Resetear usuario a estado pendiente
   */
  async resetToPending(userId) {
    const context = 'resetear a pendiente'

    try {
      const url = API_ENDPOINTS.USER_APPROVAL.RESET_PENDING.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // OPERACIONES EN LOTE
  // ========================================

  /**
   * POST /user-approval/approve-batch - Aprobar usuarios en lote
   */
  async approveUsersBatch(userIds) {
    const context = 'aprobar usuarios en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_APPROVAL.APPROVE_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-approval/reject-batch - Rechazar usuarios en lote
   */
  async rejectUsersBatch(userIds) {
    const context = 'rechazar usuarios en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_APPROVAL.REJECT_BATCH, userIds)
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
   * Obtener estados de aprobación disponibles
   */
  getApprovalStatuses() {
    return [
      { key: 'PENDING', label: 'Pendiente', color: 'warning' },
      { key: 'APPROVED', label: 'Aprobado', color: 'success' },
      { key: 'REJECTED', label: 'Rechazado', color: 'danger' }
    ]
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'userApprovalService')
  }
}

// Crear instancia única
const userApprovalService = new UserApprovalService()

export default userApprovalService
