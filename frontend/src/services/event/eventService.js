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
        size: size.toString()
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
        size: size.toString()
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
        size: size.toString()
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
        size: size.toString()
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

  // ========================================
  // GESTIÓN DE ESTADOS DE EVENTOS
  // ========================================

  buildEventStateEndpoint(eventId, routeTemplate) {
    if (!eventId) {
      throw new Error('Se requiere un ID de evento válido para cambiar su estado.')
    }

    if (!routeTemplate || typeof routeTemplate !== 'string') {
      throw new Error('La ruta de estado del evento no es válida.')
    }

    const encodedId = encodeURIComponent(eventId)

    if (routeTemplate.includes('{id}')) {
      return routeTemplate.replace('{id}', encodedId)
    }

    return routeTemplate.endsWith('/') ? `${routeTemplate}${encodedId}` : `${routeTemplate}/${encodedId}`
  }

  async patchEventState(eventId, routeTemplate, context) {
    const endpoint = this.buildEventStateEndpoint(eventId, routeTemplate)

    try {
      const result = await ServiceREST.patch(endpoint)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async publishEvent(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.PUBLISH, 'publicar evento')
  }

  async pauseEvent(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.PAUSE, 'pausar evento')
  }

  async cancelEvent(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.CANCEL, 'cancelar evento')
  }

  async activateEvent(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.ACTIVATE, 'activar evento')
  }

  async finishEvent(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.FINISH, 'finalizar evento')
  }

  async backToEdition(eventId) {
    return this.patchEventState(eventId, API_ENDPOINTS.EVENTS.BACK_TO_EDITION, 'volver a edición')
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
        size: size.toString()
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
        size: size.toString()
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
        size: size.toString()
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
