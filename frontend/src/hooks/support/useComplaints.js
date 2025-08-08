import { useState, useCallback, useEffect } from 'react'
import { complaintService } from '@services'
import { Logger } from '@utils/logger.js'

const useComplaints = () => {
  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================

  // Estados generales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para diferentes tipos de quejas
  const [allComplaints, setAllComplaints] = useState([])
  const [allComplaintsPagination, setAllComplaintsPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  const [pendingComplaints, setPendingComplaints] = useState([])
  const [pendingComplaintsPagination, setPendingComplaintsPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  const [urgentComplaints, setUrgentComplaints] = useState([])
  const [overdueComplaints, setOverdueComplaints] = useState([])
  const [resolvedComplaints, setResolvedComplaints] = useState([])
  const [resolvedComplaintsPagination, setResolvedComplaintsPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 20,
    number: 0
  })

  // Estados para quejas del usuario
  const [myComplaints, setMyComplaints] = useState([])
  const [myComplaintsPagination, setMyComplaintsPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
  })

  // Estados para estadísticas
  const [complaintStats, setComplaintStats] = useState({})

  // Estados para quejas individuales
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  // Estados para paginación y búsqueda unificada
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })

  const [searchTerm, setSearchTerm] = useState('')

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const handleError = useCallback((error, customMessage = null) => {
    Logger.error(Logger.CATEGORIES.USER, 'manejo error quejas', error)
    const errorMessage = customMessage || error?.response?.data?.message || error.message || 'Error desconocido'
    setError(errorMessage)
    return { success: false, error: errorMessage }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ========================================
  // FUNCIONES PARA USUARIOS (CLIENT)
  // ========================================

  /**
   * Crear una nueva queja
   */
  const createComplaint = useCallback(
    async complaintData => {
      try {
        setLoading(true)
        clearError()

        const response = await complaintService.createComplaint(complaintData)

        // Actualizar lista de mis quejas si está cargada
        if (myComplaints.length > 0) {
          setMyComplaints(prev => [response, ...prev])
        }

        Logger.info(Logger.CATEGORIES.USER, 'crear queja', 'Queja creada exitosamente', { context: { complaintId: response.id } })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al crear la queja')
      } finally {
        setLoading(false)
      }
    },
    [myComplaints.length, handleError, clearError]
  )

  /**
   * Obtener mis quejas
   */
  const fetchMyComplaints = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar mis quejas', 'Iniciando carga de quejas del usuario')
        const response = await complaintService.getMyComplaints(page, size)

        setMyComplaints(response.content || [])
        setMyComplaintsPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        // También actualizar paginación unificada
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }))

        Logger.info(Logger.CATEGORIES.USER, 'cargar mis quejas', 'Quejas cargadas exitosamente', {
          context: {
            totalElements: response.totalElements,
            currentPage: page + 1
          }
        })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar tus quejas')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener una queja específica del usuario
   */
  const fetchMyComplaint = useCallback(
    async complaintId => {
      try {
        setLoading(true)
        clearError()

        const response = await complaintService.getMyComplaint(complaintId)
        setSelectedComplaint(response)

        Logger.info(Logger.CATEGORIES.USER, 'cargar queja específica', 'Queja cargada exitosamente', { context: { complaintId } })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar la queja')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  // ========================================
  // FUNCIONES ADMINISTRATIVAS (ADMIN)
  // ========================================

  /**
   * Obtener todas las quejas (admin)
   */
  const fetchAllComplaints = useCallback(
    async (page = 0, size = 20, search = '') => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar todas quejas', 'Iniciando carga administrativa de quejas')
        const response = await complaintService.getAllComplaints(page, size, search)

        setAllComplaints(response.content || [])
        setAllComplaintsPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        // También actualizar paginación unificada
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }))

        Logger.info(Logger.CATEGORIES.USER, 'cargar todas quejas', 'Quejas administrativas cargadas exitosamente', {
          context: {
            totalElements: response.totalElements,
            currentPage: page + 1
          }
        })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar las quejas')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener quejas pendientes
   */
  const fetchPendingComplaints = useCallback(
    async (page = 0, size = 20) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar quejas pendientes', 'Iniciando carga de quejas pendientes')
        const response = await complaintService.getPendingComplaints(page, size)

        setPendingComplaints(response.content || [])
        setPendingComplaintsPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        // También actualizar paginación unificada
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }))

        Logger.info(Logger.CATEGORIES.USER, 'cargar quejas pendientes', 'Quejas pendientes cargadas exitosamente', {
          context: { totalElements: response.totalElements }
        })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar quejas pendientes')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Obtener quejas urgentes
   */
  const fetchUrgentComplaints = useCallback(async () => {
    try {
      clearError()

      Logger.info(Logger.CATEGORIES.USER, 'cargar quejas urgentes', 'Iniciando carga de quejas urgentes')
      const response = await complaintService.getUrgentComplaints()
      setUrgentComplaints(response || [])

      Logger.info(Logger.CATEGORIES.USER, 'cargar quejas urgentes', 'Quejas urgentes cargadas exitosamente', {
        context: { totalCount: response?.length || 0 }
      })
      return { success: true, data: response }
    } catch (error) {
      return handleError(error, 'Error al cargar quejas urgentes')
    }
  }, [handleError, clearError])

  /**
   * Obtener quejas vencidas
   */
  const fetchOverdueComplaints = useCallback(async () => {
    try {
      clearError()

      Logger.info(Logger.CATEGORIES.USER, 'cargar quejas vencidas', 'Iniciando carga de quejas vencidas')
      const response = await complaintService.getOverdueComplaints()
      setOverdueComplaints(response || [])

      Logger.info(Logger.CATEGORIES.USER, 'cargar quejas vencidas', 'Quejas vencidas cargadas exitosamente', {
        context: { totalCount: response?.length || 0 }
      })
      return { success: true, data: response }
    } catch (error) {
      return handleError(error, 'Error al cargar quejas vencidas')
    }
  }, [handleError, clearError])

  /**
   * Obtener quejas resueltas
   */
  const fetchResolvedComplaints = useCallback(
    async (page = 0, size = 20) => {
      try {
        setLoading(true)
        clearError()

        Logger.info(Logger.CATEGORIES.USER, 'cargar quejas resueltas', 'Iniciando carga de quejas resueltas')
        const response = await complaintService.getResolvedComplaints(page, size)

        setResolvedComplaints(response.content || [])
        setResolvedComplaintsPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || size,
          number: response.number || page
        })

        // También actualizar paginación unificada
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }))

        Logger.info(Logger.CATEGORIES.USER, 'cargar quejas resueltas', 'Quejas resueltas cargadas exitosamente', {
          context: {
            totalElements: response.totalElements,
            currentPage: page + 1
          }
        })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al cargar quejas resueltas')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  /**
   * Actualizar estado de una queja
   */
  const updateComplaintStatus = useCallback(
    async (complaintId, actionData) => {
      try {
        setLoading(true)
        clearError()

        const response = await complaintService.updateComplaintStatus(complaintId, actionData)

        // Actualizar en todas las listas donde pueda estar
        const updateComplaintInList = (list, setList) => {
          setList(prev => prev.map(complaint => (complaint.id === complaintId ? response : complaint)))
        }

        updateComplaintInList(allComplaints, setAllComplaints)
        updateComplaintInList(pendingComplaints, setPendingComplaints)
        updateComplaintInList(urgentComplaints, setUrgentComplaints)
        updateComplaintInList(overdueComplaints, setOverdueComplaints)
        updateComplaintInList(resolvedComplaints, setResolvedComplaints)
        updateComplaintInList(myComplaints, setMyComplaints)

        // Actualizar queja seleccionada si coincide
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint(response)
        }

        Logger.info(Logger.CATEGORIES.USER, 'actualizar estado queja', 'Estado actualizado exitosamente', {
          context: { complaintId, newStatus: response.status }
        })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al actualizar la queja')
      } finally {
        setLoading(false)
      }
    },
    [
      allComplaints,
      pendingComplaints,
      urgentComplaints,
      overdueComplaints,
      resolvedComplaints,
      myComplaints,
      selectedComplaint,
      handleError,
      clearError
    ]
  )

  /**
   * Eliminar una queja
   */
  const deleteComplaint = useCallback(
    async complaintId => {
      try {
        setLoading(true)
        clearError()

        const response = await complaintService.deleteComplaint(complaintId)

        // Remover de todas las listas
        const removeFromList = (list, setList) => {
          setList(prev => prev.filter(complaint => complaint.id !== complaintId))
        }

        removeFromList(allComplaints, setAllComplaints)
        removeFromList(pendingComplaints, setPendingComplaints)
        removeFromList(urgentComplaints, setUrgentComplaints)
        removeFromList(overdueComplaints, setOverdueComplaints)
        removeFromList(resolvedComplaints, setResolvedComplaints)
        removeFromList(myComplaints, setMyComplaints)

        // Limpiar queja seleccionada si coincide
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint(null)
        }

        Logger.info(Logger.CATEGORIES.USER, 'eliminar queja', 'Queja eliminada exitosamente', { context: { complaintId } })
        return { success: true, data: response }
      } catch (error) {
        return handleError(error, 'Error al eliminar la queja')
      } finally {
        setLoading(false)
      }
    },
    [
      allComplaints,
      pendingComplaints,
      urgentComplaints,
      overdueComplaints,
      resolvedComplaints,
      myComplaints,
      selectedComplaint,
      handleError,
      clearError
    ]
  )

  /**
   * Obtener estadísticas de quejas
   */
  const fetchComplaintStats = useCallback(async () => {
    try {
      clearError()

      Logger.info(Logger.CATEGORIES.USER, 'cargar estadísticas quejas', 'Iniciando carga de estadísticas')
      const response = await complaintService.getComplaintStats()
      setComplaintStats(response || {})

      Logger.debug(Logger.CATEGORIES.USER, 'cargar estadísticas quejas', response)
      return { success: true, data: response }
    } catch (error) {
      return handleError(error, 'Error al cargar estadísticas')
    }
  }, [handleError, clearError])

  /**
   * Enviar mensaje a una queja (para el chat)
   */
  const sendMessage = useCallback(
    async (complaintId, message) => {
      try {
        setLoading(true)
        clearError()

        // Por ahora esto es mock - en el futuro sería un endpoint real
        Logger.info(Logger.CATEGORIES.USER, 'enviar mensaje queja', 'Enviando mensaje', {
          context: { complaintId, messageLength: message.length }
        })

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000))

        Logger.info(Logger.CATEGORIES.USER, 'enviar mensaje queja', 'Mensaje enviado correctamente')
        return { success: true, data: { message: 'Mensaje enviado' } }
      } catch (error) {
        return handleError(error, 'Error al enviar mensaje')
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError]
  )

  // ========================================
  // FUNCIONES DE REFRESH
  // ========================================

  const refreshAllComplaints = useCallback(
    (page, size, search) => {
      return fetchAllComplaints(page, size, search)
    },
    [fetchAllComplaints]
  )

  const refreshPendingComplaints = useCallback(
    (page, size) => {
      return fetchPendingComplaints(page, size)
    },
    [fetchPendingComplaints]
  )

  const refreshMyComplaints = useCallback(
    (page, size) => {
      return fetchMyComplaints(page, size)
    },
    [fetchMyComplaints]
  )

  // ========================================
  // EFECTOS
  // ========================================

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estados
    loading,
    error,

    // Quejas administrativas
    allComplaints,
    allComplaintsPagination,
    pendingComplaints,
    pendingComplaintsPagination,
    urgentComplaints,
    overdueComplaints,
    resolvedComplaints,
    resolvedComplaintsPagination,

    // Quejas del usuario
    myComplaints,
    myComplaintsPagination,

    // Estadísticas
    complaintStats,

    // Queja seleccionada
    selectedComplaint,
    setSelectedComplaint,

    // Estados de paginación y búsqueda
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,

    // Funciones para usuarios
    createComplaint,
    getMyComplaints: fetchMyComplaints,
    fetchMyComplaints,
    fetchMyComplaint,
    refreshMyComplaints,

    // Funciones administrativas
    getAllComplaints: fetchAllComplaints,
    getPendingComplaints: fetchPendingComplaints,
    getUrgentComplaints: fetchUrgentComplaints,
    getOverdueComplaints: fetchOverdueComplaints,
    getResolvedComplaints: fetchResolvedComplaints,
    getComplaintStats: fetchComplaintStats,
    fetchAllComplaints,
    fetchPendingComplaints,
    fetchUrgentComplaints,
    fetchOverdueComplaints,
    fetchResolvedComplaints,
    updateComplaintStatus,
    deleteComplaint,
    fetchComplaintStats,
    sendMessage,
    refreshAllComplaints,
    refreshPendingComplaints,

    // Utilidades
    clearError
  }
}

export default useComplaints
