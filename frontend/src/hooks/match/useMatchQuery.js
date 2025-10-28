import { useState, useCallback } from 'react'
import { matchQueryService } from '@services'
import { useError } from '@hooks'

/**
 * Hook para consultas de matches
 * Corresponde a: MatchQueryController
 * - Obtener listas de matches (enviados, recibidos, aceptados, pendientes)
 * - Obtener historial con filtros
 */
export const useMatchQuery = () => {
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState({
    sent: [],
    received: [],
    receivedPending: [],
    accepted: [],
    history: []
  })
  const { handleError } = useError()

  // ===============================
  // FETCH OPERATIONS
  // ===============================

  /**
   * Get match history with filters
   */
  const fetchMatchHistory = useCallback(
    async (status = null, from = null, to = null, page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getMatchHistory(status, from, to, page, size)

        setMatches(prev => ({ ...prev, history: response.content || response }))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar historial de matches' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Get sent matches
   */
  const fetchSentMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getSentMatches(page, size)

        setMatches(prev => ({ ...prev, sent: response.content || response }))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar matches enviados' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Get received matches
   */
  const fetchReceivedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getReceivedMatches(page, size)

        setMatches(prev => ({ ...prev, received: response.content || response }))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar matches recibidos' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Get pending received matches
   */
  const fetchPendingReceivedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getPendingReceivedMatches(page, size)

        setMatches(prev => ({ ...prev, receivedPending: response.content || response }))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar matches recibidos pendientes' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Get accepted matches
   */
  const fetchAcceptedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getAcceptedMatches(page, size)

        setMatches(prev => ({ ...prev, accepted: response.content || response }))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar matches aceptados' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Refresh all match lists
   */
  const refreshAllMatches = useCallback(async () => {
    try {
      setLoading(true)
      await Promise.all([fetchSentMatches(), fetchReceivedMatches(), fetchPendingReceivedMatches(), fetchAcceptedMatches()])
    } catch (error) {
      handleError(error, { customMessage: 'Error al actualizar matches' })
    } finally {
      setLoading(false)
    }
  }, [fetchSentMatches, fetchReceivedMatches, fetchPendingReceivedMatches, fetchAcceptedMatches, handleError])

  return {
    // State
    matches,
    loading,

    // Fetch operations
    fetchMatchHistory,
    fetchSentMatches,
    fetchReceivedMatches,
    fetchPendingReceivedMatches,
    fetchAcceptedMatches,

    // Refresh
    refreshAllMatches
  }
}

export default useMatchQuery
