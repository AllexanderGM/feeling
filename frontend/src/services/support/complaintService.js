import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de quejas y reclamos - ComplaintController
 * Gestiona quejas, denuncias y reportes de usuarios
 */
class ComplaintService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE - OPERACIONES
  // ========================================

  /**
   * Crear una nueva queja/reclamo
   */
  async createComplaint(complaintData) {
    const context = 'crear queja'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.COMPLAINTS.CREATE, complaintData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener mis quejas/reclamos
   */
  async getMyComplaints(page = 0, size = 20) {
    const context = 'obtener mis quejas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.MY_COMPLAINTS}?${params}`)

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
      const url = API_ENDPOINTS.COMPLAINTS.MY_COMPLAINT_BY_ID.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.get(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ADMIN - LISTADO Y FILTRADO
  // ========================================

  /**
   * Obtener estadísticas de quejas (admin)
   */
  async getComplaintStats() {
    const context = 'obtener estadísticas de quejas'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.COMPLAINTS.STATS)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

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

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.ALL}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas pendientes (admin)
   */
  async getPendingComplaints(page = 0, size = 20) {
    const context = 'obtener quejas pendientes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.PENDING}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas urgentes (admin)
   */
  async getUrgentComplaints(page = 0, size = 20) {
    const context = 'obtener quejas urgentes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.URGENT}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas atrasadas (+24h) (admin)
   */
  async getOverdueComplaints(page = 0, size = 20) {
    const context = 'obtener quejas atrasadas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.OVERDUE}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas resueltas (admin)
   */
  async getResolvedComplaints(page = 0, size = 20) {
    const context = 'obtener quejas resueltas'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.COMPLAINTS.RESOLVED}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas por tipo (admin)
   */
  async getComplaintsByType(complaintType, page = 0, size = 20) {
    const context = 'obtener quejas por tipo'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const url = API_ENDPOINTS.COMPLAINTS.BY_TYPE.replace('{complaintType}', encodeURIComponent(complaintType))
      const result = await ServiceREST.get(`${url}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Obtener quejas por prioridad (admin)
   */
  async getComplaintsByPriority(complaintPriority, page = 0, size = 20) {
    const context = 'obtener quejas por prioridad'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const url = API_ENDPOINTS.COMPLAINTS.BY_PRIORITY.replace('{complaintPriority}', encodeURIComponent(complaintPriority))
      const result = await ServiceREST.get(`${url}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ADMIN - GESTIÓN
  // ========================================

  /**
   * Actualizar estado de una queja (admin)
   */
  async updateComplaintStatus(complaintId, actionData) {
    const context = 'actualizar estado de queja'

    try {
      const url = API_ENDPOINTS.COMPLAINTS.UPDATE.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.put(url, actionData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Eliminar una queja (admin)
   */
  async deleteComplaint(complaintId) {
    const context = 'eliminar queja'

    try {
      const url = API_ENDPOINTS.COMPLAINTS.DELETE.replace('{complaintId}', encodeURIComponent(complaintId))
      const result = await ServiceREST.delete(url)

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
    Logger.serviceError(operation, error, 'complaintService')
  }
}

// Crear instancia única
const complaintService = new ComplaintService()

export default complaintService
