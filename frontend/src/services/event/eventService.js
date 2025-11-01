import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.BY_STATUS}/PUBLICADO?${params.toString()}`)
      const response = ServiceREST.handleServiceResponse(result, context)

      const filterFutureEvents = events => {
        if (!Array.isArray(events)) return events

        const now = Date.now()

        return events.filter(event => {
          if (!event?.eventDate) return false

          const eventTime = new Date(event.eventDate).getTime()

          return Number.isFinite(eventTime) && eventTime >= now
        })
      }

      if (Array.isArray(response)) {
        return filterFutureEvents(response)
      }

      if (response && Array.isArray(response.content)) {
        return {
          ...response,
          content: filterFutureEvents(response.content)
        }
      }

      return response
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

  async uploadEventMainImage(eventId, imageFile) {
    const context = 'subir imagen principal del evento'

    try {
      const formData = new FormData()

      formData.append('image', imageFile)

      const result = await ServiceREST.post(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/images/main`, formData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async uploadEventGalleryImages(eventId, imageFiles = []) {
    const context = 'subir imágenes de galería del evento'

    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      return ServiceREST.handleServiceResponse({ success: true, data: [] }, context)
    }

    try {
      const formData = new FormData()

      imageFiles.forEach(file => {
        if (file) {
          formData.append('images', file)
        }
      })

      const result = await ServiceREST.post(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/images/gallery`, formData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async updateEventMainImage(eventId, imageFile) {
    const context = 'actualizar imagen principal del evento'

    try {
      const formData = new FormData()

      formData.append('image', imageFile)

      const result = await ServiceREST.put(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/images/main`, formData)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async deleteEventMainImage(eventId) {
    const context = 'eliminar imagen principal del evento'

    try {
      const result = await ServiceREST.delete(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/images/main`)

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

      const result = await ServiceREST.get(`${API_ENDPOINTS.EVENTS.COUNT_BY_CATEGORY}?${params.toString()}`)

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
      const result = await ServiceREST.get(API_ENDPOINTS.EVENTS.CATEGORY_STATS)

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
    Logger.serviceError(operation, error, 'eventService')
  }
}

// Crear instancia única
const eventService = new EventService()

export default eventService
