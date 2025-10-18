import { useState, useCallback } from 'react'
import { matchFavoriteService } from '@services'
import { useError } from '@hooks'

/**
 * Hook para manejar favoritos de matches
 * Corresponde a: MatchFavoriteController
 * - Añadir/remover favoritos
 * - Listar favoritos
 * - Verificar si un usuario es favorito
 */
export const useMatchFavorites = () => {
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState([])
  const { handleError } = useError()

  // ===============================
  // FETCH OPERATIONS
  // ===============================

  /**
   * Get user's favorites list
   */
  const fetchFavorites = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.getFavorites(page, size)

        setFavorites(response.content || response)

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

  /**
   * Check if a user is in favorites
   */
  const checkIfFavorite = useCallback(
    async userId => {
      try {
        const response = await matchFavoriteService.checkIfFavorite(userId)

        return response.isFavorite || false
      } catch (error) {
        handleError('Error al verificar favorito', error)

        return false
      }
    },
    [handleError]
  )

  // ===============================
  // ACTIONS
  // ===============================

  /**
   * Add user to favorites
   */
  const addToFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.addFavorite(userId)

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

  /**
   * Remove user from favorites
   */
  const removeFromFavorites = useCallback(
    async userId => {
      try {
        setLoading(true)
        const response = await matchFavoriteService.removeFavorite(userId)

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

  /**
   * Toggle favorite status (without refetching the full list)
   */
  const toggleFavorite = useCallback(
    async userId => {
      try {
        setLoading(true)
        const isFavorite = await checkIfFavorite(userId)

        if (isFavorite) {
          await matchFavoriteService.removeFavorite(userId)

          return false
        } else {
          await matchFavoriteService.addFavorite(userId)

          return true
        }
      } catch (error) {
        handleError('Error al cambiar estado de favorito', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [checkIfFavorite, handleError]
  )

  return {
    // State
    favorites,
    loading,

    // Fetch
    fetchFavorites,
    checkIfFavorite,

    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  }
}

export default useMatchFavorites
