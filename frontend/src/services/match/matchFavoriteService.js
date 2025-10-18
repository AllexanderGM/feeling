import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de favoritos de matches
 * Corresponde a: MatchFavoriteController
 * Endpoints: /matches/favorites (POST, GET, DELETE)
 */
class MatchFavoriteService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CREACIÓN
  // ========================================

  /**
   * Add user to favorites
   * POST /matches/favorites
   * @param {number} favoriteUserId - ID del usuario a añadir a favoritos
   */
  async addFavorite(favoriteUserId) {
    const context = 'añadir a favoritos'

    try {
      const response = await ServiceREST.post(API_ENDPOINTS.MATCHES.FAVORITES, { favoriteUserId })

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Remove user from favorites
   * DELETE /matches/favorites/{favoriteUserId}
   * @param {number} favoriteUserId - ID del usuario a remover de favoritos
   */
  async removeFavorite(favoriteUserId) {
    const context = 'quitar de favoritos'

    try {
      const response = await ServiceREST.delete(`${API_ENDPOINTS.MATCHES.FAVORITES}/${encodeURIComponent(favoriteUserId)}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // LECTURAS
  // ========================================

  /**
   * Get user's favorites list
   * GET /matches/favorites?page=&size=
   */
  async getFavorites(page = 0, size = 10) {
    const context = 'obtener favoritos'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.FAVORITES}?${params}`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * Check if a user is in favorites
   * GET /matches/favorites/{userId}/check
   * @param {number} userId - ID del usuario a verificar
   */
  async checkIfFavorite(userId) {
    const context = 'verificar si es favorito'

    try {
      const response = await ServiceREST.get(`${API_ENDPOINTS.MATCHES.FAVORITES}/${encodeURIComponent(userId)}/check`)

      return ServiceREST.handleServiceResponse(response, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'matchFavoriteService')
  }
}

// Crear instancia única
const matchFavoriteService = new MatchFavoriteService()

export default matchFavoriteService
