import { useState, useCallback } from 'react'
import { matchAdminService } from '@services/match'
import { Logger } from '@utils/logger.js'

const useAdminMatches = () => {
  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================

  // Estados generales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para diferentes tipos de matches
  const [allMatches, setAllMatches] = useState([])
  const [allMatchesPagination, setAllMatchesPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  const [pendingMatches, setPendingMatches] = useState([])
  const [pendingMatchesPagination, setPendingMatchesPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  const [acceptedMatches, setAcceptedMatches] = useState([])
  const [acceptedMatchesPagination, setAcceptedMatchesPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  const [rejectedMatches, setRejectedMatches] = useState([])
  const [rejectedMatchesPagination, setRejectedMatchesPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  // Estados para estadísticas
  const [matchSummary, setMatchSummary] = useState({})
  const [topInitiators, setTopInitiators] = useState([])
  const [topReceivers, setTopReceivers] = useState([])

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const handleError = useCallback((error, customMessage = null) => {
    Logger.error(Logger.CATEGORIES.USER, 'manejo error matches admin', error)
    const errorMessage = customMessage || error?.response?.data?.message || error.message || 'Error desconocido'

    setError(errorMessage)

    return { success: false, error: errorMessage }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ========================================
  // FUNCIONES PARA ADMIN - LISTADO
  // ========================================

  /**
   * Obtener todos los matches con filtros
   */
  const getAllMatches = useCallback(
    async (page = 0, size = 20, filters = {}) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar todos los matches', 'Iniciando carga de matches (admin)')
        const response = await matchAdminService.getAllMatches(filters, page, size)

        setAllMatches(response.content || [])
        setAllMatchesPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        Logger.info(Logger.CATEGORIES.USER, 'cargar todos los matches', 'Matches cargados exitosamente', {
          context: { total: response.totalElements }
        })

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar todos los matches')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener matches pendientes
   */
  const getPendingMatches = useCallback(
    async (page = 0, size = 20) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches pendientes', 'Iniciando carga')
        const response = await matchAdminService.getMatchesByStatus('PENDING', page, size)

        setPendingMatches(response.content || [])
        setPendingMatchesPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches pendientes', 'Matches pendientes cargados exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar matches pendientes')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener matches aceptados
   */
  const getAcceptedMatches = useCallback(
    async (page = 0, size = 20) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches aceptados', 'Iniciando carga')
        const response = await matchAdminService.getMatchesByStatus('ACCEPTED', page, size)

        setAcceptedMatches(response.content || [])
        setAcceptedMatchesPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches aceptados', 'Matches aceptados cargados exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar matches aceptados')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener matches rechazados
   */
  const getRejectedMatches = useCallback(
    async (page = 0, size = 20) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches rechazados', 'Iniciando carga')
        const response = await matchAdminService.getMatchesByStatus('REJECTED', page, size)

        setRejectedMatches(response.content || [])
        setRejectedMatchesPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        Logger.info(Logger.CATEGORIES.USER, 'cargar matches rechazados', 'Matches rechazados cargados exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar matches rechazados')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  // ========================================
  // FUNCIONES PARA ADMIN - ESTADÍSTICAS
  // ========================================

  /**
   * Obtener resumen estadístico de matches
   */
  const fetchMatchSummary = useCallback(
    async (from = null, to = null) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar resumen matches', 'Iniciando carga de resumen')
        const response = await matchAdminService.getMatchSummary(from, to)

        setMatchSummary(response || {})

        Logger.info(Logger.CATEGORIES.USER, 'cargar resumen matches', 'Resumen cargado exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar resumen de matches')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener top usuarios que inician matches
   */
  const fetchTopInitiators = useCallback(
    async (limit = 5, from = null, to = null) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar top iniciadores', 'Iniciando carga')
        const response = await matchAdminService.getTopInitiators(limit, from, to)

        setTopInitiators(response || [])

        Logger.info(Logger.CATEGORIES.USER, 'cargar top iniciadores', 'Top iniciadores cargados exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar top iniciadores')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener top usuarios que reciben matches
   */
  const fetchTopReceivers = useCallback(
    async (limit = 5, from = null, to = null) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar top receptores', 'Iniciando carga')
        const response = await matchAdminService.getTopReceivers(limit, from, to)

        setTopReceivers(response || [])

        Logger.info(Logger.CATEGORIES.USER, 'cargar top receptores', 'Top receptores cargados exitosamente')

        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar top receptores')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  // ========================================
  // RETORNO DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    error,

    // Matches por tipo
    allMatches,
    allMatchesPagination,
    pendingMatches,
    pendingMatchesPagination,
    acceptedMatches,
    acceptedMatchesPagination,
    rejectedMatches,
    rejectedMatchesPagination,

    // Estadísticas
    matchSummary,
    topInitiators,
    topReceivers,

    // Funciones
    getAllMatches,
    getPendingMatches,
    getAcceptedMatches,
    getRejectedMatches,
    fetchMatchSummary,
    fetchTopInitiators,
    fetchTopReceivers,
    clearError
  }
}

export default useAdminMatches
