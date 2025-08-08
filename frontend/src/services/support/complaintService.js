import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de soporte - Solo comunicación con API
 */
class ComplaintService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // ENDPOINTS PARA USUARIOS (CLIENT)
  // ========================================

  /**
   * Crear una nueva queja/reclamo
   */
  async createComplaint(complaintData) {
    const context = 'crear queja'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.SUPPORT.COMPLAINTS, complaintData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener mis quejas/reclamos
   */
  async getMyComplaints(page = 0, size = 10) {
    const context = 'obtener mis quejas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.SUPPORT.MY_COMPLAINTS}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener una queja específica del usuario
   */
  async getMyComplaint(complaintId) {
    const context = 'obtener queja específica'

    try {
      const url = API_ENDPOINTS.SUPPORT.COMPLAINT_BY_ID.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ENDPOINTS ADMINISTRATIVOS (ADMIN)
  // ========================================

  /**
   * Obtener todas las quejas (admin)
   */
  async getAllComplaints(page = 0, size = 20, search = '') {
    const context = 'obtener todas las quejas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (search && search.trim()) {
        params.append('search', search.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.SUPPORT.COMPLAINTS}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas pendientes
   */
  async getPendingComplaints(page = 0, size = 20) {
    const context = 'obtener quejas pendientes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.SUPPORT.PENDING_COMPLAINTS}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas urgentes
   */
  async getUrgentComplaints() {
    const context = 'obtener quejas urgentes'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.SUPPORT.URGENT_COMPLAINTS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas vencidas (+24h)
   */
  async getOverdueComplaints() {
    const context = 'obtener quejas vencidas'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.SUPPORT.OVERDUE_COMPLAINTS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas resueltas (administradores)
   */
  async getResolvedComplaints(page = 0, size = 20) {
    const context = 'obtener quejas resueltas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.SUPPORT.RESOLVED_COMPLAINTS}?${params}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Actualizar estado de una queja
   */
  async updateComplaintStatus(complaintId, actionData) {
    const context = 'actualizar estado de queja'

    try {
      const url = API_ENDPOINTS.SUPPORT.UPDATE_COMPLAINT.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.put(url, actionData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Eliminar una queja
   */
  async deleteComplaint(complaintId) {
    const context = 'eliminar queja'

    try {
      const url = API_ENDPOINTS.SUPPORT.DELETE_COMPLAINT.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.delete(url)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de quejas
   */
  async getComplaintStats() {
    const context = 'obtener estadísticas de quejas'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.SUPPORT.COMPLAINT_STATS)
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
   * Obtener tipos de quejas disponibles
   */
  getComplaintTypes() {
    return [
      { key: 'GENERAL', label: 'Consulta general' },
      { key: 'TECHNICAL_ISSUE', label: 'Problema técnico' },
      { key: 'ACCOUNT_ISSUE', label: 'Problema de cuenta' },
      { key: 'PAYMENT_ISSUE', label: 'Problema de pago' },
      { key: 'USER_REPORT', label: 'Reporte de usuario' },
      { key: 'EVENT_ISSUE', label: 'Problema con evento' },
      { key: 'BOOKING_ISSUE', label: 'Problema con reserva' },
      { key: 'PRIVACY_CONCERN', label: 'Preocupación de privacidad' },
      { key: 'FEATURE_REQUEST', label: 'Solicitud de funcionalidad' },
      { key: 'BUG_REPORT', label: 'Reporte de error' },
      { key: 'ABUSE_REPORT', label: 'Reporte de abuso' },
      { key: 'REFUND_REQUEST', label: 'Solicitud de reembolso' }
    ]
  }

  /**
   * Obtener niveles de prioridad
   */
  getPriorityLevels() {
    return [
      { key: 'LOW', label: 'Baja' },
      { key: 'MEDIUM', label: 'Media' },
      { key: 'HIGH', label: 'Alta' },
      { key: 'URGENT', label: 'Urgente' }
    ]
  }

  /**
   * Obtener estados de quejas
   */
  getComplaintStatuses() {
    return [
      { key: 'OPEN', label: 'Abierto' },
      { key: 'IN_PROGRESS', label: 'En progreso' },
      { key: 'WAITING_USER', label: 'Esperando usuario' },
      { key: 'RESOLVED', label: 'Resuelto' },
      { key: 'CLOSED', label: 'Cerrado' },
      { key: 'ESCALATED', label: 'Escalado' }
    ]
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtener color según prioridad
   */
  getPriorityColor(priority) {
    const colors = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'danger',
      URGENT: 'danger'
    }
    return colors[priority] || 'default'
  }

  /**
   * Obtener color según estado
   */
  getStatusColor(status) {
    const colors = {
      OPEN: 'primary',
      IN_PROGRESS: 'warning',
      WAITING_USER: 'secondary',
      RESOLVED: 'success',
      CLOSED: 'default',
      ESCALATED: 'danger'
    }
    return colors[status] || 'default'
  }

  /**
   * Verificar si una queja está vencida
   */
  isOverdue(createdAt, status) {
    if (!createdAt || ['RESOLVED', 'CLOSED'].includes(status)) return false

    const created = new Date(createdAt)
    const now = new Date()
    const hoursDiff = (now - created) / (1000 * 60 * 60)

    return hoursDiff > 24
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'complaintService')
  }
}

// Crear instancia única
const complaintService = new ComplaintService()

export default complaintService
