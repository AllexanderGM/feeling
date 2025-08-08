import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de eventos simplificado - Solo comunicación con API
 */
class EventService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // OPERACIONES BÁSICAS DE EVENTOS
  // ========================================

  async getAllEvents(page = 0, size = 10, searchTerm = '') {
    const context = 'obtener lista de eventos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.ALL_ADMIN}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getActiveEvents(page = 0, size = 20, searchTerm = '') {
    const context = 'obtener eventos activos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BASE}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getUpcomingEvents(page = 0, size = 20, searchTerm = '') {
    const context = 'obtener eventos próximos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.UPCOMING}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getEventsByCategory(category, page = 0, size = 20, searchTerm = '') {
    const context = 'obtener eventos por categoría'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BY_CATEGORY}/${encodeURIComponent(category)}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getEventById(eventId) {
    const context = 'obtener evento por ID'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async createEvent(eventData) {
    const context = 'crear evento'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.EVENTS.BASE, eventData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateEvent(eventId, eventData) {
    const context = 'actualizar evento'

    try {
      const result = await ServiceREST.put(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}`, eventData)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async deleteEvent(eventId) {
    const context = 'eliminar evento'

    try {
      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async toggleEventStatus(eventId) {
    const context = 'cambiar estado del evento'

    try {
      const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/admin-toggle-status`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async forceDeleteEvent(eventId) {
    const context = 'eliminar evento forzado'

    try {
      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/force-delete`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // EVENTOS POR ESTADO
  // ========================================

  async getEventsByStatus(status, page = 0, size = 20, searchTerm = '') {
    const context = `obtener eventos con estado ${status}`

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      if (searchTerm && searchTerm.trim()) {
        params.append('q', searchTerm.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BY_STATUS}/${encodeURIComponent(status)}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ESTADÍSTICAS Y MÉTRICAS
  // ========================================

  async getEventDashboardStats() {
    const context = 'obtener estadísticas del dashboard de eventos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.EVENTS.STATS)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getEventCount() {
    const context = 'obtener conteo de eventos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.EVENTS.COUNT)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getEventCountByCategory(category) {
    const context = 'obtener conteo de eventos por categoría'

    try {
      const params = new URLSearchParams({
        category: category
      })

      const result = await ServiceREST.get(`/events/stats/count-by-category?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getRevenueStats() {
    const context = 'obtener estadísticas de ingresos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.EVENTS.REVENUE)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getCategoryStats() {
    const context = 'obtener estadísticas por categoría'

    try {
      const result = await ServiceREST.get('/events/stats/category')
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE GESTIÓN POR USUARIO
  // ========================================

  async getEventsByUser(userId, page = 0, size = 10) {
    const context = 'obtener eventos por usuario'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BY_USER}/${encodeURIComponent(userId)}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getMyEvents(page = 0, size = 10) {
    const context = 'obtener mis eventos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.MY_EVENTS}?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // CATEGORÍAS Y METADATOS
  // ========================================

  async getEventCategories() {
    const context = 'obtener categorías de eventos'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.EVENTS.CATEGORIES)
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
    this.Logger.serviceError(operation, error, 'eventService')
  }
}

// Crear instancia única
const eventService = new EventService()

export default eventService
