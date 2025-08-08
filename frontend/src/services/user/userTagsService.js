import { ServiceREST } from '@services/utils/serviceREST.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de tags de usuario para UserTagController (/user-tags)
 * Incluye todas las rutas según especificaciones:
 * - Cliente: gestión personal de tags, búsqueda, descubrimiento
 * - Admin: gestión administrativa de tags, aprobaciones, limpiezas
 */
class UserTagsService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE ENDPOINTS - PERSONAL TAG MANAGEMENT
  // ========================================

  /**
   * GET /user-tags/me - Las etiquetas del usuario actual
   */
  async getMyTags() {
    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_TAGS.MY_TAGS)
      return ServiceREST.handleServiceResponse(result, 'obtener mis tags')
    } catch (error) {
      this.logError('obtener mis tags', error)
      throw error
    }
  }

  /**
   * POST /user-tags/me - Añadir etiquetas al usuario actual
   */
  async addTagsToUser(tags) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.ADD_TAGS, { tags })
      return ServiceREST.handleServiceResponse(result, 'agregar tags')
    } catch (error) {
      this.logError('agregar tags', error)
      throw error
    }
  }

  /**
   * PUT /user-tags/me/{tagsId} - Reemplazar las etiquetas del usuario actual
   */
  async replaceUserTags(tagId, newTags) {
    try {
      const url = API_ENDPOINTS.USER_TAGS.REPLACE_TAGS.replace('{tagId}', tagId)
      const result = await ServiceREST.put(url, { tags: newTags })
      return ServiceREST.handleServiceResponse(result, 'reemplazar tags')
    } catch (error) {
      this.logError('reemplazar tags', error)
      throw error
    }
  }

  /**
   * DELETE /user-tags/me/{tagsId} - Remover etiqueta del usuario actual
   */
  async removeTagFromUser(tagId) {
    try {
      const url = API_ENDPOINTS.USER_TAGS.REMOVE_TAG.replace('{tagId}', tagId)
      const result = await ServiceREST.delete(url)
      return ServiceREST.handleServiceResponse(result, 'remover tag')
    } catch (error) {
      this.logError('remover tag', error)
      throw error
    }
  }

  // ========================================
  // CLIENTE ENDPOINTS - SEARCH AND DISCOVERY
  // ========================================

  /**
   * GET /user-tags/search - Buscar etiquetas (pageable)
   */
  async searchTags(query = '', page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (query && query.trim()) {
        params.append('query', query.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.SEARCH}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'buscar tags')
    } catch (error) {
      this.logError('buscar tags', error)
      throw error
    }
  }

  /**
   * GET /user-tags/popular - Etiquetas populares (pageable)
   */
  async getPopularTags(page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.POPULAR}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener tags populares')
    } catch (error) {
      this.logError('obtener tags populares', error)
      throw error
    }
  }

  /**
   * GET /user-tags/trending - Etiquetas en tendencia (pageable)
   */
  async getTrendingTags(page = 0, size = 15) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.TRENDING}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener tags en tendencia')
    } catch (error) {
      this.logError('obtener tags en tendencia', error)
      throw error
    }
  }

  /**
   * GET /user-tags/suggestions - Sugerencias personalizadas (pageable)
   */
  async getTagSuggestions(page = 0, size = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.SUGGESTIONS}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener sugerencias de tags')
    } catch (error) {
      this.logError('obtener sugerencias de tags', error)
      throw error
    }
  }

  /**
   * GET /user-tags/users - Lista de usuarios filtrados por tags (pageable)
   */
  async getUsersByTags(tags, page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (tags && tags.length > 0) {
        tags.forEach(tag => params.append('tags', tag))
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.USERS_BY_TAGS}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener usuarios por tags')
    } catch (error) {
      this.logError('obtener usuarios por tags', error)
      throw error
    }
  }

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * GET /user-tags/pending-approval - Etiquetas pendientes (pageable, admin)
   */
  async getPendingApprovalTags(page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_TAGS.PENDING_APPROVAL}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener tags pendientes')
    } catch (error) {
      this.logError('obtener tags pendientes', error)
      throw error
    }
  }

  /**
   * POST /user-tags - Crear nueva tag (admin)
   */
  async createTag(tagData) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.CREATE, tagData)
      return ServiceREST.handleServiceResponse(result, 'crear tag')
    } catch (error) {
      this.logError('crear tag', error)
      throw error
    }
  }

  /**
   * PUT /user-tags/{tagsId} - Modificar tag (admin)
   */
  async updateTag(tagId, tagData) {
    try {
      const url = API_ENDPOINTS.USER_TAGS.UPDATE.replace('{tagId}', tagId)
      const result = await ServiceREST.put(url, tagData)
      return ServiceREST.handleServiceResponse(result, 'actualizar tag')
    } catch (error) {
      this.logError('actualizar tag', error)
      throw error
    }
  }

  /**
   * POST /user-tags/cleanup - Limpiar etiquetas sin uso (admin)
   */
  async cleanupUnusedTags() {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.CLEANUP)
      return ServiceREST.handleServiceResponse(result, 'limpiar tags sin uso')
    } catch (error) {
      this.logError('limpiar tags sin uso', error)
      throw error
    }
  }

  /**
   * POST /user-tags/{tagId}/approve - Aprobar etiqueta (admin)
   */
  async approveTag(tagId) {
    try {
      const url = API_ENDPOINTS.USER_TAGS.APPROVE.replace('{tagId}', tagId)
      const result = await ServiceREST.post(url)
      return ServiceREST.handleServiceResponse(result, 'aprobar tag')
    } catch (error) {
      this.logError('aprobar tag', error)
      throw error
    }
  }

  /**
   * POST /user-tags/{tagId}/reject - Rechazar etiqueta (admin)
   */
  async rejectTag(tagId) {
    try {
      const url = API_ENDPOINTS.USER_TAGS.REJECT.replace('{tagId}', tagId)
      const result = await ServiceREST.post(url)
      return ServiceREST.handleServiceResponse(result, 'rechazar tag')
    } catch (error) {
      this.logError('rechazar tag', error)
      throw error
    }
  }

  /**
   * POST /user-tags/approve-batch - Aprobar en lote (admin)
   */
  async approveTagsBatch(tagIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_TAGS.APPROVE_BATCH, tagIds)
      return ServiceREST.handleServiceResponse(result, 'aprobar tags en lote')
    } catch (error) {
      this.logError('aprobar tags en lote', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD Y COMPATIBILIDAD
  // ========================================

  /**
   * Método de compatibilidad para agregar un solo tag
   */
  async addTagToMyProfile(tagName) {
    return this.addTagsToUser([tagName])
  }

  /**
   * Método de compatibilidad para buscar sin paginación
   */
  async searchTagsLegacy(query, limit = 20) {
    const result = await this.searchTags(query, 0, limit)
    return result.content || result
  }

  /**
   * Método de compatibilidad para tags populares sin paginación
   */
  async getPopularTagsLegacy(limit = 20) {
    const result = await this.getPopularTags(0, limit)
    return result.content || result
  }

  /**
   * Método de compatibilidad para tags en tendencia sin paginación
   */
  async getTrendingTagsLegacy(limit = 15) {
    const result = await this.getTrendingTags(0, limit)
    return result.content || result
  }

  /**
   * Método de compatibilidad para sugerencias sin paginación
   */
  async getTagSuggestionsLegacy(limit = 10) {
    const result = await this.getTagSuggestions(0, limit)
    return result.content || result
  }

  /**
   * Validar datos de tag antes de crear/actualizar
   */
  validateTagData(tagData) {
    const required = ['name']
    const missing = required.filter(field => !tagData[field])

    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`)
    }

    // Validar longitud del nombre
    if (tagData.name.length < 2 || tagData.name.length > 50) {
      throw new Error('El nombre del tag debe tener entre 2 y 50 caracteres')
    }

    return true
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    this.Logger.serviceError(operation, error, 'UserTagsService')
  }
}

// Crear instancia única
const userTagsService = new UserTagsService()

// Exportar métodos individuales para compatibilidad con código existente
export const getMyTags = () => userTagsService.getMyTags()
export const addTagToMyProfile = tagName => userTagsService.addTagToMyProfile(tagName)
export const addTagsToUser = tags => userTagsService.addTagsToUser(tags)
export const removeTagFromUser = tagId => userTagsService.removeTagFromUser(tagId)
export const replaceUserTags = (tagId, newTags) => userTagsService.replaceUserTags(tagId, newTags)

// Búsqueda y descubrimiento
export const searchTags = (query, page, size) => userTagsService.searchTags(query, page, size)
export const getPopularTags = (page, size) => userTagsService.getPopularTags(page, size)
export const getTrendingTags = (page, size) => userTagsService.getTrendingTags(page, size)
export const getTagSuggestions = (page, size) => userTagsService.getTagSuggestions(page, size)
export const getUsersByTags = (tags, page, size) => userTagsService.getUsersByTags(tags, page, size)

// Admin
export const getPendingApprovalTags = (page, size) => userTagsService.getPendingApprovalTags(page, size)
export const createTag = tagData => userTagsService.createTag(tagData)
export const updateTag = (tagId, tagData) => userTagsService.updateTag(tagId, tagData)
export const cleanupUnusedTags = () => userTagsService.cleanupUnusedTags()
export const approveTag = tagId => userTagsService.approveTag(tagId)
export const rejectTag = tagId => userTagsService.rejectTag(tagId)
export const approveTagsBatch = tagIds => userTagsService.approveTagsBatch(tagIds)

// Métodos legacy para compatibilidad
export const searchTagsLegacy = (query, limit) => userTagsService.searchTagsLegacy(query, limit)
export const getPopularTagsLegacy = limit => userTagsService.getPopularTagsLegacy(limit)
export const getTrendingTagsLegacy = limit => userTagsService.getTrendingTagsLegacy(limit)
export const getTagSuggestionsLegacy = limit => userTagsService.getTagSuggestionsLegacy(limit)

export default userTagsService
