import { useCallback, useState } from 'react'
import { eventService } from '@services'
import { Logger } from '@utils/logger.js'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import useEventOperations from './useEventOperations.js'

const createPaginationState = (size = DEFAULT_ROWS_PER_PAGE) => ({
  page: 0,
  size,
  totalPages: 0,
  totalElements: 0,
  hasNext: false,
  hasPrevious: false
})

const addEventToCollection = (collection, event) => {
  if (!event) return collection

  return [event, ...collection.filter(item => item.id !== event.id)]
}

const updateEventInCollection = (collection, eventId, updatedEvent) => {
  if (!eventId || !updatedEvent) return collection

  return collection.map(item => (item.id === eventId ? { ...item, ...updatedEvent } : item))
}

const removeEventFromCollection = (collection, eventId) => {
  if (!eventId) return collection

  return collection.filter(item => item.id !== eventId)
}

const buildPaginationFromResponse = (mappedResponse, fallbackPage = 0, fallbackSize = DEFAULT_ROWS_PER_PAGE, itemsLength = 0) => {
  const totalElements = mappedResponse.totalElements ?? itemsLength
  const totalPages = mappedResponse.totalPages ?? (itemsLength > 0 ? 1 : 0)
  const currentPage = mappedResponse.number ?? fallbackPage ?? 0
  const size = mappedResponse.size ?? fallbackSize
  const hasNext = mappedResponse.last !== undefined ? !mappedResponse.last : totalPages > 0 ? currentPage < totalPages - 1 : false
  const hasPrevious = mappedResponse.first !== undefined ? !mappedResponse.first : currentPage > 0

  return {
    page: currentPage,
    size,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious
  }
}

const useEvents = () => {
  const { handleApiResponse, loading, submitting, withLoading, withSubmitting } = useEventOperations()

  // Estado para eventos activos
  const [activeEvents, setActiveEvents] = useState([])
  const [activeEventsPagination, setActiveEventsPagination] = useState(createPaginationState())

  // Estado para eventos próximos
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [upcomingEventsPagination, setUpcomingEventsPagination] = useState(createPaginationState())

  // Estado para todos los eventos (admin)
  const [allEvents, setAllEvents] = useState([])
  const [allEventsPagination, setAllEventsPagination] = useState(createPaginationState())

  // Estado para eventos por categoría
  const [eventsByCategory, setEventsByCategory] = useState([])
  const [eventsByCategoryPagination, setEventsByCategoryPagination] = useState(createPaginationState())

  // Estado para estadísticas
  const [eventStats, setEventStats] = useState(null)

  // Estados para eventos por estado específico
  const [eventsByStatus, setEventsByStatus] = useState({})
  const [eventsByStatusPagination, setEventsByStatusPagination] = useState({})

  // ========================================
  // HELPERS INTERNOS
  // ========================================

  const unwrapServiceResponse = useCallback(response => {
    if (!response) return null

    if (typeof response === 'object' && response !== null && 'success' in response) {
      if (!response.success) {
        const error = new Error(response.message || 'Error al procesar la respuesta del servicio.')

        error.response = response
        throw error
      }

      return response.data
    }

    return response
  }, [])

  const mapBackendEventsPaginatedResponse = useCallback(
    (rawResponse, fallbackPage = 0, fallbackSize = DEFAULT_ROWS_PER_PAGE) => {
      const data = unwrapServiceResponse(rawResponse)

      if (!data) {
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: fallbackPage,
          size: fallbackSize,
          first: true,
          last: true
        }
      }

      if (Array.isArray(data.content)) {
        return {
          ...data,
          content: data.content,
          totalElements: data.totalElements ?? data.content.length,
          totalPages: data.totalPages ?? (data.content.length > 0 ? 1 : 0),
          number: data.number ?? fallbackPage,
          size: data.size ?? fallbackSize,
          first: data.first ?? (data.number ?? fallbackPage ?? 0) === 0,
          last: data.last ?? (data.number ?? fallbackPage ?? 0) >= (data.totalPages ?? (data.content.length > 0 ? 1 : 0)) - 1
        }
      }

      if (Array.isArray(data)) {
        return {
          content: data,
          totalElements: data.length,
          totalPages: data.length > 0 ? 1 : 0,
          number: fallbackPage,
          size: fallbackSize,
          first: true,
          last: true
        }
      }

      return {
        content: [data],
        totalElements: 1,
        totalPages: 1,
        number: fallbackPage,
        size: fallbackSize,
        first: true,
        last: true
      }
    },
    [unwrapServiceResponse]
  )

  // ========================================
  // MÉTODOS PRINCIPALES
  // ========================================

  const fetchActiveEvents = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', 'Iniciando carga', { context: { page, size, searchTerm } })
        const response = await eventService.getActiveEvents(page, size, searchTerm)

        // Mapear respuesta usando el helper
        const mappedResponse = mapBackendEventsPaginatedResponse(response, page, size)
        const items = Array.isArray(mappedResponse.content) ? mappedResponse.content : []

        setActiveEvents(items)
        setActiveEventsPagination(buildPaginationFromResponse(mappedResponse, page, size, items.length))
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', 'Eventos cargados exitosamente', {
          context: {
            events: items.length,
            totalElements: mappedResponse.totalElements ?? items.length
          }
        })

        return items
      }, 'obtener eventos activos')

      if (showNotifications) {
        return handleApiResponse(result, 'Eventos activos cargados correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse, mapBackendEventsPaginatedResponse]
  )

  const fetchUpcomingEvents = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos próximos', 'Iniciando carga', { context: { page, size, searchTerm } })
        const response = await eventService.getUpcomingEvents(page, size, searchTerm)

        const mappedResponse = mapBackendEventsPaginatedResponse(response, page, size)
        const items = Array.isArray(mappedResponse.content) ? mappedResponse.content : []

        setUpcomingEvents(items)
        setUpcomingEventsPagination(buildPaginationFromResponse(mappedResponse, page, size, items.length))

        return items
      }, 'obtener eventos próximos')

      if (showNotifications) {
        return handleApiResponse(result, 'Eventos próximos cargados correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse, mapBackendEventsPaginatedResponse]
  )

  const fetchAllEvents = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener todos eventos', 'Iniciando carga', { context: { page, size, searchTerm } })
        const response = await eventService.getAllEvents(page, size, searchTerm)

        const mappedResponse = mapBackendEventsPaginatedResponse(response, page, size)
        const items = Array.isArray(mappedResponse.content) ? mappedResponse.content : []

        setAllEvents(items)
        setAllEventsPagination(buildPaginationFromResponse(mappedResponse, page, size, items.length))

        return items
      }, 'obtener todos los eventos')

      if (showNotifications) {
        return handleApiResponse(result, 'Todos los eventos cargados correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse, mapBackendEventsPaginatedResponse]
  )

  const fetchEventsByCategory = useCallback(
    async (category, page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos por categoría', 'Iniciando carga', {
          context: { category, page, size, searchTerm }
        })
        const response = await eventService.getEventsByCategory(category, page, size, searchTerm)

        const mappedResponse = mapBackendEventsPaginatedResponse(response, page, size)
        const items = Array.isArray(mappedResponse.content) ? mappedResponse.content : []

        setEventsByCategory(items)
        setEventsByCategoryPagination(buildPaginationFromResponse(mappedResponse, page, size, items.length))

        return items
      }, 'obtener eventos por categoría')

      if (showNotifications) {
        return handleApiResponse(result, 'Eventos por categoría cargados correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse, mapBackendEventsPaginatedResponse]
  )

  const getEventById = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener evento por ID', `Cargando evento: ${eventId}`)
        const response = await eventService.getEventById(eventId)
        const eventData = unwrapServiceResponse(response)

        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener evento por ID', 'Evento obtenido exitosamente')

        return eventData
      }, 'obtener evento')

      return handleApiResponse(result, 'Evento obtenido correctamente.', { showNotifications })
    },
    [withLoading, handleApiResponse, unwrapServiceResponse]
  )

  const createEvent = useCallback(
    async (eventData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'crear evento', `Creando evento: ${eventData.name}`)
        const response = await eventService.createEvent(eventData)
        const newEvent = unwrapServiceResponse(response)

        // Actualizar las listas locales agregando el nuevo evento
        setActiveEvents(prevEvents => addEventToCollection(prevEvents, newEvent))
        setAllEvents(prevEvents => addEventToCollection(prevEvents, newEvent))
        setUpcomingEvents(prevEvents => addEventToCollection(prevEvents, newEvent))
        setEventsByCategory(prevEvents => addEventToCollection(prevEvents, newEvent))

        Logger.info(Logger.CATEGORIES.SERVICE, 'crear evento', 'Evento creado exitosamente', { context: { eventId: newEvent.id } })

        return newEvent
      }, 'crear evento')

      return handleApiResponse(result, 'Evento creado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse, unwrapServiceResponse]
  )

  const updateEvent = useCallback(
    async (eventId, eventData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'actualizar evento', `Actualizando evento: ${eventId}`)
        const response = await eventService.updateEvent(eventId, eventData)
        const updatedEvent = unwrapServiceResponse(response)

        // Actualizar las listas locales
        setActiveEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setAllEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setUpcomingEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setEventsByCategory(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))

        Logger.info(Logger.CATEGORIES.SERVICE, 'actualizar evento', 'Evento actualizado exitosamente', { context: { eventId } })

        return updatedEvent
      }, 'actualizar evento')

      return handleApiResponse(result, 'Evento actualizado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse, unwrapServiceResponse]
  )

  const deleteEvent = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento', `Eliminando evento: ${eventId}`)
        await eventService.deleteEvent(eventId)

        // Actualizar las listas locales eliminando el evento
        setActiveEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setAllEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setUpcomingEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setEventsByCategory(prevEvents => removeEventFromCollection(prevEvents, eventId))

        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento', 'Evento eliminado exitosamente', { context: { eventId } })

        return { eventId }
      }, 'eliminar evento')

      return handleApiResponse(result, 'Evento eliminado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const toggleEventStatus = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'cambiar estado evento', `Cambiando estado: ${eventId}`)
        const response = await eventService.toggleEventStatus(eventId)
        const updatedEvent = unwrapServiceResponse(response)

        // Actualizar las listas locales
        setActiveEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setAllEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setUpcomingEvents(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))
        setEventsByCategory(prevEvents => updateEventInCollection(prevEvents, eventId, updatedEvent))

        Logger.info(Logger.CATEGORIES.SERVICE, 'cambiar estado evento', 'Estado cambiado exitosamente', {
          context: { eventId, newStatus: updatedEvent.status }
        })

        return updatedEvent
      }, 'cambiar estado del evento')

      return handleApiResponse(result, 'Estado del evento cambiado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse, unwrapServiceResponse]
  )

  const forceDeleteEvent = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento forzado', `Eliminación forzada: ${eventId}`)
        await eventService.forceDeleteEvent(eventId)

        // Actualizar las listas locales eliminando el evento
        setActiveEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setAllEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setUpcomingEvents(prevEvents => removeEventFromCollection(prevEvents, eventId))
        setEventsByCategory(prevEvents => removeEventFromCollection(prevEvents, eventId))

        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento forzado', 'Evento eliminado forzadamente exitosamente', {
          context: { eventId }
        })

        return { eventId }
      }, 'eliminar evento forzado')

      return handleApiResponse(result, 'Evento eliminado forzadamente exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // EVENTOS POR ESTADO
  // ========================================

  const fetchEventsByStatus = useCallback(
    async (status, page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos por estado', 'Iniciando carga', {
          context: { status, page, size, searchTerm }
        })
        const response = await eventService.getEventsByStatus(status, page, size, searchTerm)

        const mappedResponse = mapBackendEventsPaginatedResponse(response, page, size)
        const items = Array.isArray(mappedResponse.content) ? mappedResponse.content : []

        setEventsByStatus(prev => ({
          ...prev,
          [status]: items
        }))
        setEventsByStatusPagination(prev => ({
          ...prev,
          [status]: buildPaginationFromResponse(mappedResponse, page, size, items.length)
        }))
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos por estado', 'Eventos cargados exitosamente', {
          context: {
            status,
            events: items.length,
            totalElements: mappedResponse.totalElements ?? items.length
          }
        })

        return items
      }, `obtener eventos con estado ${status}`)

      return handleApiResponse(result, `Eventos con estado ${status} cargados correctamente.`, { showNotifications })
    },
    [withLoading, handleApiResponse, mapBackendEventsPaginatedResponse]
  )

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const fetchEventStats = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener estadísticas eventos', 'Iniciando carga')
        const response = await eventService.getEventDashboardStats()
        const stats = unwrapServiceResponse(response)

        setEventStats(stats)
        Logger.debug(Logger.CATEGORIES.SERVICE, 'obtener estadísticas eventos', stats)

        return stats
      }, 'obtener estadísticas de eventos')

      if (showNotifications) {
        return handleApiResponse(result, 'Estadísticas de eventos cargadas correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse, unwrapServiceResponse]
  )

  // ========================================
  // MÉTODOS DE REFRESH
  // ========================================

  const refreshActiveEvents = useCallback(
    async (page, size, searchTerm) => {
      return await fetchActiveEvents(page, size, searchTerm, false)
    },
    [fetchActiveEvents]
  )

  const refreshUpcomingEvents = useCallback(
    async (page, size, searchTerm) => {
      return await fetchUpcomingEvents(page, size, searchTerm, false)
    },
    [fetchUpcomingEvents]
  )

  const refreshAllEvents = useCallback(
    async (page, size, searchTerm) => {
      return await fetchAllEvents(page, size, searchTerm, false)
    },
    [fetchAllEvents]
  )

  const refreshEventsByCategory = useCallback(
    async (category, page, size, searchTerm) => {
      return await fetchEventsByCategory(category, page, size, searchTerm, false)
    },
    [fetchEventsByCategory]
  )

  const refreshEventsByStatus = useCallback(
    async (status, page, size, searchTerm) => {
      return await fetchEventsByStatus(status, page, size, searchTerm, false)
    },
    [fetchEventsByStatus]
  )

  const refreshEventStats = useCallback(async () => {
    return await fetchEventStats(false)
  }, [fetchEventStats])

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    submitting,

    // Eventos activos
    activeEvents,
    activeEventsPagination,
    fetchActiveEvents,
    refreshActiveEvents,

    // Eventos próximos
    upcomingEvents,
    upcomingEventsPagination,
    fetchUpcomingEvents,
    refreshUpcomingEvents,

    // Todos los eventos (admin)
    allEvents,
    allEventsPagination,
    fetchAllEvents,
    refreshAllEvents,

    // Eventos por categoría
    eventsByCategory,
    eventsByCategoryPagination,
    fetchEventsByCategory,
    refreshEventsByCategory,

    // Eventos por estado
    eventsByStatus,
    eventsByStatusPagination,
    fetchEventsByStatus,
    refreshEventsByStatus,

    // Operaciones CRUD
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    forceDeleteEvent,

    // Estadísticas
    eventStats,
    fetchEventStats,
    refreshEventStats
  }
}

export default useEvents
