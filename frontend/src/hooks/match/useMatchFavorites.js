import { useState, useCallback, useMemo } from 'react'
import { matchFavoriteService } from '@services'
import { useError } from '@hooks'

const normalizeId = value => {
  if (value == null) return null

  return String(value)
}

const extractFavoriteId = favorite => {
  if (!favorite) return null

  return (
    normalizeId(favorite.userId) ||
    normalizeId(favorite.favoriteUserId) ||
    normalizeId(favorite.targetUserId) ||
    normalizeId(favorite.user?.id) ||
    normalizeId(favorite.user?.user?.id) ||
    normalizeId(favorite.id)
  )
}

export const useMatchFavorites = () => {
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(() => new Set())
  const { handleError } = useError()

  const addFavoriteId = useCallback(id => {
    const normalizedId = normalizeId(id)

    if (!normalizedId) return

    setFavoriteIds(prev => {
      const next = new Set(prev)

      next.add(normalizedId)

      return next
    })
  }, [])

  const removeFavoriteId = useCallback(id => {
    const normalizedId = normalizeId(id)

    if (!normalizedId) return

    setFavoriteIds(prev => {
      const next = new Set(prev)

      next.delete(normalizedId)

      return next
    })
  }, [])

  const updateFavoritesState = useCallback(list => {
    const safeList = Array.isArray(list) ? list : []
    const ids = new Set()

    safeList.forEach(item => {
      const id = extractFavoriteId(item)

      if (id) {
        ids.add(id)
      }
    })

    setFavorites(safeList)
    setFavoriteIds(ids)
  }, [])

  const isFavoriteLocally = useCallback(
    userId => {
      if (!userId) return false

      return favoriteIds.has(normalizeId(userId))
    },
    [favoriteIds]
  )

  const fetchFavorites = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.getFavorites(page, size)
        const items = response?.content ?? response ?? []

        updateFavoritesState(items)

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar favoritos' })
        updateFavoritesState([])

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError, updateFavoritesState]
  )

  const checkIfFavorite = useCallback(
    async userId => {
      if (isFavoriteLocally(userId)) return true

      try {
        const response = await matchFavoriteService.checkIfFavorite(userId)

        return response.isFavorite || false
      } catch (error) {
        handleError(error, { customMessage: 'Error al verificar favorito' })

        return false
      }
    },
    [handleError, isFavoriteLocally]
  )

  const addToFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.addFavorite(userId)

        addFavoriteId(userId)

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al agregar a favoritos' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [addFavoriteId, handleError]
  )

  const removeFromFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.removeFavorite(userId)
        const normalizedId = normalizeId(userId)

        removeFavoriteId(normalizedId)
        setFavorites(prev => prev.filter(item => extractFavoriteId(item) !== normalizedId))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al remover de favoritos' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, removeFavoriteId]
  )

  const toggleFavorite = useCallback(
    async (userId, options = {}) => {
      const normalizedId = normalizeId(userId)
      const currentlyFavorite = options.isFavorite ?? favoriteIds.has(normalizedId)

      if (currentlyFavorite) {
        removeFavoriteId(normalizedId)
      } else {
        addFavoriteId(normalizedId)
      }

      try {
        setLoading(true)

        if (currentlyFavorite) {
          await matchFavoriteService.removeFavorite(userId)
          setFavorites(prev => prev.filter(item => extractFavoriteId(item) !== normalizedId))

          return false
        }

        const response = await matchFavoriteService.addFavorite(userId)

        if (response) {
          const appended = response?.content ?? response

          if (Array.isArray(appended) && appended.length > 0) {
            updateFavoritesState(appended)
          }
        }

        return true
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || ''
        const status = error?.response?.status

        const handled = (() => {
          if (!currentlyFavorite && status === 400 && message.toLowerCase().includes('ya está en tus favoritos')) {
            addFavoriteId(normalizedId)

            return true
          }

          if (currentlyFavorite && status === 404) {
            removeFavoriteId(normalizedId)
            setFavorites(prev => prev.filter(item => extractFavoriteId(item) !== normalizedId))

            return true
          }

          return false
        })()

        if (handled) {
          return !currentlyFavorite
        }

        if (currentlyFavorite) {
          addFavoriteId(normalizedId)
        } else {
          removeFavoriteId(normalizedId)
        }

        handleError(error, { customMessage: 'Error al cambiar estado de favorito' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [addFavoriteId, favoriteIds, handleError, removeFavoriteId, updateFavoritesState]
  )

  return {
    favorites,
    favoriteIds: useMemo(() => new Set(favoriteIds), [favoriteIds]),
    loading,
    fetchFavorites,
    checkIfFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  }
}

export default useMatchFavorites
