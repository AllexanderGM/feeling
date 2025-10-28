import { useState, useCallback } from 'react'
import { matchStatisticsService } from '@services'
import { useError } from '@hooks'

/**
 * Hook para estadísticas de matches
 * Corresponde a: MatchStatisticsController
 * - Obtener estadísticas de matches
 * - Obtener notificaciones de matches
 */
export const useMatchStatistics = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalMatches: 0,
    sentMatches: 0,
    receivedMatches: 0,
    acceptedMatches: 0,
    rejectedMatches: 0,
    favorites: 0,
    remainingAttempts: 0
  })
  const [notifications, setNotifications] = useState({
    pendingMatches: 0,
    acceptedMatches: 0,
    hasNotifications: false
  })
  const { handleError } = useError()

  // ===============================
  // FETCH OPERATIONS
  // ===============================

  /**
   * Get match statistics with optional date range
   * @param {string|null} from - Fecha inicio (formato: yyyy-MM-dd)
   * @param {string|null} to - Fecha fin (formato: yyyy-MM-dd)
   */
  const fetchMatchStats = useCallback(
    async (from = null, to = null) => {
      try {
        setLoading(true)
        const response = await matchStatisticsService.getMatchStats(from, to)

        setStats(response)

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar estadísticas de matches' })

        return {}
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Get match notifications
   */
  const fetchMatchNotifications = useCallback(async () => {
    try {
      const response = await matchStatisticsService.getMatchNotifications()

      setNotifications(response)

      return response
    } catch (error) {
      handleError(error, { customMessage: 'Error al cargar notificaciones' })

      return { pendingMatches: 0, acceptedMatches: 0, hasNotifications: false }
    }
  }, [handleError])

  /**
   * Refresh all statistics data
   */
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true)
      await Promise.all([fetchMatchStats(), fetchMatchNotifications()])
    } catch (error) {
      handleError(error, { customMessage: 'Error al actualizar estadísticas' })
    } finally {
      setLoading(false)
    }
  }, [fetchMatchStats, fetchMatchNotifications, handleError])

  return {
    // State
    stats,
    notifications,
    loading,

    // Fetch operations
    fetchMatchStats,
    fetchMatchNotifications,

    // Refresh
    refreshStats
  }
}

export default useMatchStatistics
