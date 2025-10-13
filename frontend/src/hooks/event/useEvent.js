import { useState, useEffect, useCallback } from 'react'
import { eventService } from '@services'
import { useError } from '@hooks/utils/useError.js'
import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'

/**
 * Hook para manejar eventos
 * Proporciona funcionalidades CRUD para eventos
 */
const useEvent = () => {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const { handleError, handleSuccess } = useError()
  const { loading } = useAsyncOperation()

  // ========================================
  // OBTENER EVENTOS
  // ========================================

  /**
   * Obtener todos los eventos (admin)
   */
  const fetchEvents = useCallback(
    async (page = 0, size = 10, searchTerm = '') => {
      setError(null)
      try {
        const response = await eventService.getAllEvents(page, size, searchTerm)

        if (response.success) {
          const eventsData = response.data?.content || response.data || []

          setEvents(eventsData)

          return eventsData
        } else {
          const errorMessage = response.error || 'Error al cargar eventos'

          setError(errorMessage)
          handleError(errorMessage)

          return []
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al cargar eventos'

        setError(errorMessage)
        handleError(errorMessage)

        return []
      }
    },
    [handleError]
  )

  /**
   * Refrescar lista de eventos
   */
  const refreshEvents = useCallback(() => {
    return fetchEvents()
  }, [fetchEvents])

  /**
   * Obtener evento por ID
   */
  const getEvent = useCallback(
    async eventId => {
      setError(null)
      try {
        const response = await eventService.getEventById(eventId)

        if (response.success) {
          return response.data
        } else {
          const errorMessage = response.error || 'Error al cargar evento'

          setError(errorMessage)
          handleError(errorMessage)

          return null
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al cargar evento'

        setError(errorMessage)
        handleError(errorMessage)

        return null
      }
    },
    [handleError]
  )

  // ========================================
  // CREAR EVENTO
  // ========================================

  /**
   * Crear nuevo evento
   */
  const addEvent = useCallback(
    async eventData => {
      setError(null)
      try {
        const response = await eventService.createEvent(eventData)

        if (response.success) {
          handleSuccess('Evento creado exitosamente')
          await fetchEvents() // Refrescar la lista

          return { success: true, data: response.data }
        } else {
          const errorMessage = response.message || 'Error al crear evento'

          setError(errorMessage)
          handleError(errorMessage)

          return { success: false, error: errorMessage }
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al crear evento'

        setError(errorMessage)
        handleError(errorMessage)

        return { success: false, error: errorMessage }
      }
    },
    [handleError, handleSuccess, fetchEvents]
  )

  // ========================================
  // ACTUALIZAR EVENTO
  // ========================================

  /**
   * Actualizar evento existente
   */
  const editEvent = useCallback(
    async (eventId, eventData) => {
      setError(null)
      try {
        const response = await eventService.updateEvent(eventId, eventData)

        if (response.success) {
          handleSuccess('Evento actualizado exitosamente')
          await fetchEvents() // Refrescar la lista

          return { success: true, data: response.data }
        } else {
          const errorMessage = response.message || 'Error al actualizar evento'

          setError(errorMessage)
          handleError(errorMessage)

          return { success: false, error: errorMessage }
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al actualizar evento'

        setError(errorMessage)
        handleError(errorMessage)

        return { success: false, error: errorMessage }
      }
    },
    [handleError, handleSuccess, fetchEvents]
  )

  // ========================================
  // ELIMINAR EVENTO
  // ========================================

  /**
   * Eliminar evento
   */
  const removeEvent = useCallback(
    async eventId => {
      setError(null)
      try {
        const response = await eventService.deleteEvent(eventId)

        if (response.success) {
          handleSuccess('Evento eliminado exitosamente')
          await fetchEvents() // Refrescar la lista

          return { success: true }
        } else {
          const errorMessage = response.message || 'Error al eliminar evento'

          setError(errorMessage)
          handleError(errorMessage)

          return { success: false, error: errorMessage }
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al eliminar evento'

        setError(errorMessage)
        handleError(errorMessage)

        return { success: false, error: errorMessage }
      }
    },
    [handleError, handleSuccess, fetchEvents]
  )

  // ========================================
  // BÚSQUEDA Y FILTRADO
  // ========================================

  /**
   * Buscar eventos por término
   */
  const searchEvents = useCallback(
    async searchTerm => {
      if (!searchTerm || searchTerm.trim() === '') {
        return events
      }

      const filteredEvents = events.filter(
        event =>
          event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      return filteredEvents
    },
    [events]
  )

  /**
   * Filtrar eventos por categoría
   */
  const filterEventsByCategory = useCallback(
    category => {
      if (!category) return events

      return events.filter(event => event.category?.toLowerCase() === category.toLowerCase())
    },
    [events]
  )

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ========================================
  // API PÚBLICA
  // ========================================

  return {
    // Estado
    events,
    loading,
    error,

    // Operaciones CRUD
    fetchEvents,
    refreshEvents,
    getEvent,
    addEvent,
    editEvent,
    removeEvent,

    // Búsqueda y filtrado
    searchEvents,
    filterEventsByCategory,

    // Alias para compatibilidad con useTour
    tours: events,
    refreshTours: refreshEvents,
    addTour: addEvent,
    editTour: editEvent,
    removeTour: removeEvent,
    getTour: getEvent,
    searchTours: searchEvents,
    filterToursByCategory: filterEventsByCategory
  }
}

export default useEvent
