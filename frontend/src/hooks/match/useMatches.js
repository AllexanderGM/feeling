import { useState, useEffect, useCallback } from 'react'
import { matchService } from '@services'

import { useError } from '@hooks/utils/useError.js'

export const useMatches = () => {
  const [matches, setMatches] = useState({
    sent: [],
    received: [],
    accepted: [],
    favorites: []
  })
  const [matchStats, setMatchStats] = useState({
    totalMatches: 0,
    pendingMatches: 0,
    acceptedMatches: 0,
    availableAttempts: 0
  })
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { handleError } = useError()

  // ===============================
  // FETCH OPERATIONS
  // ===============================

  const fetchSentMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchService.getSentMatches(page, size)
        setMatches(prev => ({ ...prev, sent: response.content || response }))
        return response
      } catch (error) {
        handleError('Error al cargar matches enviados', error)
        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const fetchReceivedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchService.getReceivedMatches(page, size)
        setMatches(prev => ({ ...prev, received: response.content || response }))
        return response
      } catch (error) {
        handleError('Error al cargar matches recibidos', error)
        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const fetchAcceptedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchService.getAcceptedMatches(page, size)
        setMatches(prev => ({ ...prev, accepted: response.content || response }))
        return response
      } catch (error) {
        handleError('Error al cargar matches aceptados', error)
        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const fetchFavorites = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchService.getFavorites(page, size)
        setMatches(prev => ({ ...prev, favorites: response.content || response }))
        return response
      } catch (error) {
        handleError('Error al cargar favoritos', error)
        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const fetchMatchStats = useCallback(async () => {
    try {
      const response = await matchService.getMatchStats()
      setMatchStats(response)
      return response
    } catch (error) {
      handleError('Error al cargar estadísticas de matches', error)
      return {}
    }
  }, [handleError])

  const fetchRemainingAttempts = useCallback(async () => {
    try {
      const response = await matchService.getRemainingAttempts()
      setMatchStats(prev => ({ ...prev, availableAttempts: response.remainingAttempts || 0 }))
      return response
    } catch (error) {
      handleError('Error al cargar intentos disponibles', error)
      return { remainingAttempts: 0 }
    }
  }, [handleError])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await matchService.getMatchNotifications()
      setNotifications(response)
      return response
    } catch (error) {
      handleError('Error al cargar notificaciones', error)
      return []
    }
  }, [handleError])

  // ===============================
  // MATCH OPERATIONS
  // ===============================

  const sendMatch = useCallback(
    async targetUserId => {
      try {
        setLoading(true)
        const response = await matchService.sendMatch(targetUserId)

        // Refresh sent matches and remaining attempts
        await Promise.all([fetchSentMatches(), fetchRemainingAttempts()])

        return response
      } catch (error) {
        handleError('Error al enviar match', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchSentMatches, fetchRemainingAttempts]
  )

  const acceptMatch = useCallback(
    async matchId => {
      try {
        setLoading(true)
        const response = await matchService.acceptMatch(matchId)

        // Refresh received and accepted matches, and remaining attempts
        await Promise.all([fetchReceivedMatches(), fetchAcceptedMatches(), fetchRemainingAttempts()])

        return response
      } catch (error) {
        handleError('Error al aceptar match', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchReceivedMatches, fetchAcceptedMatches, fetchRemainingAttempts]
  )

  const rejectMatch = useCallback(
    async matchId => {
      try {
        setLoading(true)
        const response = await matchService.rejectMatch(matchId)

        // Refresh received matches
        await fetchReceivedMatches()

        return response
      } catch (error) {
        handleError('Error al rechazar match', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchReceivedMatches]
  )

  const getMatchContact = useCallback(
    async matchId => {
      try {
        const response = await matchService.getMatchContact(matchId)
        return response
      } catch (error) {
        handleError('Error al obtener información de contacto', error)
        throw error
      }
    },
    [handleError]
  )

  // ===============================
  // FAVORITES OPERATIONS
  // ===============================

  const addToFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchService.addToFavorites(userId)

        // Refresh favorites
        await fetchFavorites()

        return response
      } catch (error) {
        handleError('Error al agregar a favoritos', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchFavorites]
  )

  const removeFromFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchService.removeFromFavorites(userId)

        // Refresh favorites
        await fetchFavorites()

        return response
      } catch (error) {
        handleError('Error al remover de favoritos', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchFavorites]
  )

  // ===============================
  // REFRESH ALL DATA
  // ===============================

  const refreshAllMatches = useCallback(async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchSentMatches(),
        fetchReceivedMatches(),
        fetchAcceptedMatches(),
        fetchFavorites(),
        fetchMatchStats(),
        fetchRemainingAttempts(),
        fetchNotifications()
      ])
    } catch (error) {
      handleError('Error al actualizar datos de matches', error)
    } finally {
      setLoading(false)
    }
  }, [
    fetchSentMatches,
    fetchReceivedMatches,
    fetchAcceptedMatches,
    fetchFavorites,
    fetchMatchStats,
    fetchRemainingAttempts,
    fetchNotifications,
    handleError
  ])

  // ===============================
  // NOTIFICATIONS
  // ===============================

  const markNotificationAsRead = useCallback(
    async notificationId => {
      try {
        const response = await matchService.markNotificationAsRead(notificationId)

        // Update local notifications
        setNotifications(prev => prev.map(notif => (notif.id === notificationId ? { ...notif, read: true } : notif)))

        return response
      } catch (error) {
        handleError('Error al marcar notificación como leída', error)
        throw error
      }
    },
    [handleError]
  )

  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(() => {
    refreshAllMatches()
  }, []) // Only run on mount

  return {
    // Data
    matches,
    matchStats,
    notifications,
    loading,

    // Fetch operations
    fetchSentMatches,
    fetchReceivedMatches,
    fetchAcceptedMatches,
    fetchFavorites,
    fetchMatchStats,
    fetchRemainingAttempts,
    fetchNotifications,

    // Match operations
    sendMatch,
    acceptMatch,
    rejectMatch,
    getMatchContact,

    // Favorites operations
    addToFavorites,
    removeFromFavorites,

    // Notifications
    markNotificationAsRead,

    // Refresh
    refreshAllMatches
  }
}

export default useMatches
