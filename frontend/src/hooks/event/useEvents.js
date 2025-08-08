import { useCallback, useState } from 'react'
import { eventService } from '@services'
import { Logger } from '@utils/logger.js'

import { useError } from '@hooks/utils/useError.js'
import useAsyncOperation from '@hooks/utils/useAsyncOperation.js'

import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

const useEvents = () => {
  const { handleApiResponse } = useError()

  // Hook centralizado para operaciones asíncronas
  const { loading, submitting, withLoading, withSubmitting } = useAsyncOperation()

  // Estado para eventos activos
  const [activeEvents, setActiveEvents] = useState([])
  const [activeEventsPagination, setActiveEventsPagination] = useState({
    page: 0,
    size: DEFAULT_ROWS_PER_PAGE,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

  // Estado para eventos próximos
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [upcomingEventsPagination, setUpcomingEventsPagination] = useState({
    page: 0,
    size: DEFAULT_ROWS_PER_PAGE,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

  // Estado para todos los eventos (admin)
  const [allEvents, setAllEvents] = useState([])
  const [allEventsPagination, setAllEventsPagination] = useState({
    page: 0,
    size: DEFAULT_ROWS_PER_PAGE,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

  // Estado para eventos por categoría
  const [eventsByCategory, setEventsByCategory] = useState([])
  const [eventsByCategoryPagination, setEventsByCategoryPagination] = useState({
    page: 0,
    size: DEFAULT_ROWS_PER_PAGE,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

  // Estado para estadísticas
  const [eventStats, setEventStats] = useState(null)

  // Estados para eventos por estado específico
  const [eventsByStatus, setEventsByStatus] = useState({})
  const [eventsByStatusPagination, setEventsByStatusPagination] = useState({})

  // ========================================
  // HELPERS INTERNOS
  // ========================================

  const mapBackendEventsPaginatedResponse = useCallback(response => {
    if (!response) return { content: [], totalElements: 0, totalPages: 0 }

    // Si la respuesta ya tiene content, es paginada
    if (response.content && Array.isArray(response.content)) {
      return response
    }

    // Si la respuesta es un array directo, no es paginada
    if (Array.isArray(response)) {
      return {
        content: response,
        totalElements: response.length,
        totalPages: 1,
        number: 0,
        size: response.length,
        first: true,
        last: true
      }
    }

    // Si la respuesta es un objeto único, envolver en array
    return {
      content: [response],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 1,
      first: true,
      last: true
    }
  }, [])

  // ========================================
  // MÉTODOS PRINCIPALES
  // ========================================

  const fetchActiveEvents = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', 'Iniciando carga', { context: { page, size, searchTerm } })
        const response = await eventService.getActiveEvents(page, size, searchTerm)

        Logger.debug(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', { rawResponse: response, responseType: typeof response })

        // Mapear respuesta usando el helper
        const mappedResponse = mapBackendEventsPaginatedResponse(response)

        // Manejar respuesta paginada del backend
        if (mappedResponse.content && Array.isArray(mappedResponse.content)) {
          setActiveEvents(mappedResponse.content)
          setActiveEventsPagination({
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          })
          Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', 'Eventos cargados exitosamente', {
            context: {
              events: mappedResponse.content.length,
              totalElements: mappedResponse.totalElements
            }
          })
          return mappedResponse.content
        } else {
          // Fallback para respuesta no paginada
          const mappedEvents = Array.isArray(mappedResponse) ? mappedResponse : [mappedResponse].filter(Boolean)
          setActiveEvents(mappedEvents)
          setActiveEventsPagination({
            page: 0,
            size: mappedEvents.length,
            totalPages: 1,
            totalElements: mappedEvents.length,
            hasNext: false,
            hasPrevious: false
          })
          Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos activos', 'Eventos cargados exitosamente (respuesta no paginada)')
          return mappedEvents
        }
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

        const mappedResponse = mapBackendEventsPaginatedResponse(response)

        if (mappedResponse.content && Array.isArray(mappedResponse.content)) {
          setUpcomingEvents(mappedResponse.content)
          setUpcomingEventsPagination({
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          })
          return mappedResponse.content
        } else {
          const mappedEvents = Array.isArray(mappedResponse) ? mappedResponse : [mappedResponse].filter(Boolean)
          setUpcomingEvents(mappedEvents)
          setUpcomingEventsPagination({
            page: 0,
            size: mappedEvents.length,
            totalPages: 1,
            totalElements: mappedEvents.length,
            hasNext: false,
            hasPrevious: false
          })
          return mappedEvents
        }
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

        const mappedResponse = mapBackendEventsPaginatedResponse(response)

        if (mappedResponse.content && Array.isArray(mappedResponse.content)) {
          setAllEvents(mappedResponse.content)
          setAllEventsPagination({
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          })
          return mappedResponse.content
        } else {
          const mappedEvents = Array.isArray(mappedResponse) ? mappedResponse : [mappedResponse].filter(Boolean)
          setAllEvents(mappedEvents)
          setAllEventsPagination({
            page: 0,
            size: mappedEvents.length,
            totalPages: 1,
            totalElements: mappedEvents.length,
            hasNext: false,
            hasPrevious: false
          })
          return mappedEvents
        }
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

        const mappedResponse = mapBackendEventsPaginatedResponse(response)

        if (mappedResponse.content && Array.isArray(mappedResponse.content)) {
          setEventsByCategory(mappedResponse.content)
          setEventsByCategoryPagination({
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          })
          return mappedResponse.content
        } else {
          const mappedEvents = Array.isArray(mappedResponse) ? mappedResponse : [mappedResponse].filter(Boolean)
          setEventsByCategory(mappedEvents)
          setEventsByCategoryPagination({
            page: 0,
            size: mappedEvents.length,
            totalPages: 1,
            totalElements: mappedEvents.length,
            hasNext: false,
            hasPrevious: false
          })
          return mappedEvents
        }
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
        const eventData = await eventService.getEventById(eventId)
        Logger.info(Logger.CATEGORIES.SERVICE, 'obtener evento por ID', 'Evento obtenido exitosamente')
        return eventData
      }, 'obtener evento')

      return handleApiResponse(result, 'Evento obtenido correctamente.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const createEvent = useCallback(
    async (eventData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'crear evento', `Creando evento: ${eventData.name}`)
        const newEvent = await eventService.createEvent(eventData)

        // Actualizar las listas locales agregando el nuevo evento
        setActiveEvents(prevEvents => [newEvent, ...prevEvents])
        setAllEvents(prevEvents => [newEvent, ...prevEvents])

        Logger.info(Logger.CATEGORIES.SERVICE, 'crear evento', 'Evento creado exitosamente', { context: { eventId: newEvent.id } })
        return newEvent
      }, 'crear evento')

      return handleApiResponse(result, 'Evento creado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const updateEvent = useCallback(
    async (eventId, eventData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'actualizar evento', `Actualizando evento: ${eventId}`)
        const updatedEvent = await eventService.updateEvent(eventId, eventData)

        // Actualizar las listas locales
        const updateEventInList = prevEvents => prevEvents.map(event => (event.id === eventId ? { ...event, ...updatedEvent } : event))

        setActiveEvents(updateEventInList)
        setAllEvents(updateEventInList)
        setUpcomingEvents(updateEventInList)
        setEventsByCategory(updateEventInList)

        Logger.info(Logger.CATEGORIES.SERVICE, 'actualizar evento', 'Evento actualizado exitosamente', { context: { eventId } })
        return updatedEvent
      }, 'actualizar evento')

      return handleApiResponse(result, 'Evento actualizado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const deleteEvent = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento', `Eliminando evento: ${eventId}`)
        await eventService.deleteEvent(eventId)

        // Actualizar las listas locales eliminando el evento
        const removeEventFromList = prevEvents => prevEvents.filter(event => event.id !== eventId)

        setActiveEvents(removeEventFromList)
        setAllEvents(removeEventFromList)
        setUpcomingEvents(removeEventFromList)
        setEventsByCategory(removeEventFromList)

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
        const updatedEvent = await eventService.toggleEventStatus(eventId)

        // Actualizar las listas locales
        const updateEventInList = prevEvents => prevEvents.map(event => (event.id === eventId ? { ...event, ...updatedEvent } : event))

        setActiveEvents(updateEventInList)
        setAllEvents(updateEventInList)
        setUpcomingEvents(updateEventInList)
        setEventsByCategory(updateEventInList)

        Logger.info(Logger.CATEGORIES.SERVICE, 'cambiar estado evento', 'Estado cambiado exitosamente', {
          context: { eventId, newStatus: updatedEvent.status }
        })
        return updatedEvent
      }, 'cambiar estado del evento')

      return handleApiResponse(result, 'Estado del evento cambiado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const forceDeleteEvent = useCallback(
    async (eventId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SERVICE, 'eliminar evento forzado', `Eliminación forzada: ${eventId}`)
        await eventService.forceDeleteEvent(eventId)

        // Actualizar las listas locales eliminando el evento
        const removeEventFromList = prevEvents => prevEvents.filter(event => event.id !== eventId)

        setActiveEvents(removeEventFromList)
        setAllEvents(removeEventFromList)
        setUpcomingEvents(removeEventFromList)
        setEventsByCategory(removeEventFromList)

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

        const mappedResponse = mapBackendEventsPaginatedResponse(response)

        if (mappedResponse.content && Array.isArray(mappedResponse.content)) {
          setEventsByStatus(prev => ({
            ...prev,
            [status]: mappedResponse.content
          }))
          setEventsByStatusPagination(prev => ({
            ...prev,
            [status]: {
              page: mappedResponse.number || page,
              size: mappedResponse.size || size,
              totalPages: mappedResponse.totalPages || 0,
              totalElements: mappedResponse.totalElements || 0,
              hasNext: !mappedResponse.last,
              hasPrevious: !mappedResponse.first
            }
          }))
          Logger.info(Logger.CATEGORIES.SERVICE, 'obtener eventos por estado', 'Eventos cargados exitosamente', {
            context: {
              status,
              events: mappedResponse.content.length,
              totalElements: mappedResponse.totalElements
            }
          })
          return mappedResponse.content
        } else {
          Logger.serviceError('obtener eventos por estado', new Error('Formato de respuesta inválido del servidor'), 'EventService')
          throw new Error('Formato de respuesta inválido del servidor')
        }
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
        const stats = await eventService.getEventDashboardStats()
        setEventStats(stats)
        Logger.debug(Logger.CATEGORIES.SERVICE, 'obtener estadísticas eventos', stats)
        return stats
      }, 'obtener estadísticas de eventos')

      if (showNotifications) {
        return handleApiResponse(result, 'Estadísticas de eventos cargadas correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse]
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
