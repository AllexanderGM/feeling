import { ServiceREST } from '@services/utils/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de usuario actualizado para UserController (/user)
 * Incluye todas las rutas según las especificaciones:
 * - Cliente: perfil actual, perfiles públicos, compatibilidad, sugerencias
 * - Admin: gestión completa de usuarios, operaciones en lote
 */
class UserService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE ENDPOINTS (AUTHENTICATED)
  // ========================================

  /**
   * GET /user - Obtener el usuario actual completo
   */
  async getCurrentUser() {
    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER.CURRENT)
      return ServiceREST.handleServiceResponse(result, 'obtener usuario actual')
    } catch (error) {
      this.logError('obtener usuario actual', error)
      throw error
    }
  }

  /**
   * GET /user/{email}/public - Obtener usuario público para match (sin teléfono)
   */
  async getUserPublicProfile(email) {
    try {
      const url = API_ENDPOINTS.USER.PUBLIC_PROFILE.replace('{email}', email)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, 'obtener perfil público')
    } catch (error) {
      this.logError('obtener perfil público', error)
      throw error
    }
  }

  /**
   * GET /user/{email}/complete - Obtener usuario completo para match (con teléfono)
   */
  async getUserCompleteProfile(email) {
    try {
      const url = API_ENDPOINTS.USER.COMPLETE_PROFILE.replace('{email}', email)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, 'obtener perfil completo')
    } catch (error) {
      this.logError('obtener perfil completo', error)
      throw error
    }
  }

  /**
   * GET /user/compatibility/{otherUserEmail} - Calcular compatibilidad
   */
  async calculateCompatibility(otherUserEmail) {
    try {
      const url = API_ENDPOINTS.USER.COMPATIBILITY.replace('{otherUserEmail}', otherUserEmail)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, 'calcular compatibilidad')
    } catch (error) {
      this.logError('calcular compatibilidad', error)
      throw error
    }
  }

  /**
   * GET /user/suggestions - Obtener sugerencias de usuarios (pageable)
   */
  async getUserSuggestions(page = 0, size = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })
      const result = await ServiceREST.get(`${API_ENDPOINTS.USER.SUGGESTIONS}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener sugerencias')
    } catch (error) {
      this.logError('obtener sugerencias', error)
      throw error
    }
  }

  /**
   * PUT /user - Modificar perfil actual con imágenes
   */
  async updateCurrentProfile(profileData, profileImages = null) {
    try {
      const formData = new FormData()
      formData.append('profileData', JSON.stringify(profileData))

      if (profileImages && profileImages.length > 0) {
        profileImages.forEach((image, index) => {
          formData.append('profileImages', image)
        })
      }

      const result = await ServiceREST.put(API_ENDPOINTS.USER.UPDATE_PROFILE, formData, {
        'Content-Type': 'multipart/form-data'
      })
      return ServiceREST.handleServiceResponse(result, 'actualizar perfil')
    } catch (error) {
      this.logError('actualizar perfil', error)
      throw error
    }
  }

  /**
   * PUT /user/deactivate - Desactivar perfil actual
   */
  async deactivateCurrentAccount(reason = null) {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      const result = await ServiceREST.put(`${API_ENDPOINTS.USER.DEACTIVATE}${params}`)
      return ServiceREST.handleServiceResponse(result, 'desactivar cuenta')
    } catch (error) {
      this.logError('desactivar cuenta', error)
      throw error
    }
  }

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * GET /user/all - Lista de todos los usuarios (pageable)
   */
  async getAllUsers(page = 0, size = 20, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (search && search.trim()) {
        params.append('search', search.trim())
      }

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER.ALL}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener todos los usuarios')
    } catch (error) {
      this.logError('obtener todos los usuarios', error)
      throw error
    }
  }

  /**
   * GET /user/{email} - Obtener usuario completo por email (admin)
   */
  async getUserByEmail(email) {
    try {
      const url = API_ENDPOINTS.USER.BY_EMAIL.replace('{email}', email)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, 'obtener usuario por email')
    } catch (error) {
      this.logError('obtener usuario por email', error)
      throw error
    }
  }

  /**
   * GET /user/{status} - Obtener usuarios por estatus (pageable)
   * status: active, pending-approval, unverified, non-approved, deactivated, incomplete-profiles
   */
  async getUsersByStatus(status, page = 0, size = 20, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (search && search.trim()) {
        params.append('search', search.trim())
      }

      const url = API_ENDPOINTS.USER.BY_STATUS.replace('{status}', status)
      const result = await ServiceREST.get(`${url}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener usuarios por estatus')
    } catch (error) {
      this.logError('obtener usuarios por estatus', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId} - Modificar perfil con imágenes (admin)
   */
  async updateUserProfileByAdmin(userId, profileData, profileImages = null) {
    try {
      const formData = new FormData()
      formData.append('profileData', JSON.stringify(profileData))

      if (profileImages && profileImages.length > 0) {
        profileImages.forEach((image, index) => {
          formData.append('profileImages', image)
        })
      }

      const url = API_ENDPOINTS.USER.UPDATE_BY_ADMIN.replace('{userId}', userId)
      const result = await ServiceREST.put(url, formData, {
        'Content-Type': 'multipart/form-data'
      })
      return ServiceREST.handleServiceResponse(result, 'actualizar perfil por admin')
    } catch (error) {
      this.logError('actualizar perfil por admin', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/approve - Aprobar usuario
   */
  async approveUser(userId) {
    try {
      const url = API_ENDPOINTS.USER.APPROVE.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'aprobar usuario')
    } catch (error) {
      this.logError('aprobar usuario', error)
      throw error
    }
  }

  /**
   * POST /user/approve-batch - Aprobar usuarios en lote
   */
  async approveUsersBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.APPROVE_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'aprobar usuarios en lote')
    } catch (error) {
      this.logError('aprobar usuarios en lote', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/reject - Rechazar usuario
   */
  async rejectUser(userId) {
    try {
      const url = API_ENDPOINTS.USER.REJECT.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'rechazar usuario')
    } catch (error) {
      this.logError('rechazar usuario', error)
      throw error
    }
  }

  /**
   * POST /user/reject-batch - Rechazar usuarios en lote
   */
  async rejectUsersBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.REJECT_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'rechazar usuarios en lote')
    } catch (error) {
      this.logError('rechazar usuarios en lote', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/pending - Resetear a pendiente
   */
  async resetUserToPending(userId) {
    try {
      const url = API_ENDPOINTS.USER.RESET_PENDING.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'resetear usuario a pendiente')
    } catch (error) {
      this.logError('resetear usuario a pendiente', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/assign-admin - Otorgar rol admin
   */
  async assignAdminRole(userId) {
    try {
      const url = API_ENDPOINTS.USER.ASSIGN_ADMIN.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'asignar rol admin')
    } catch (error) {
      this.logError('asignar rol admin', error)
      throw error
    }
  }

  /**
   * POST /user/assign-admin-batch - Otorgar rol admin en lote
   */
  async assignAdminRoleBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.ASSIGN_ADMIN_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'asignar rol admin en lote')
    } catch (error) {
      this.logError('asignar rol admin en lote', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/revoke-admin - Revocar rol admin
   */
  async revokeAdminRole(userId) {
    try {
      const url = API_ENDPOINTS.USER.REVOKE_ADMIN.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'revocar rol admin')
    } catch (error) {
      this.logError('revocar rol admin', error)
      throw error
    }
  }

  /**
   * POST /user/revoke-admin-batch - Revocar rol admin en lote
   */
  async revokeAdminRoleBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.REVOKE_ADMIN_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'revocar rol admin en lote')
    } catch (error) {
      this.logError('revocar rol admin en lote', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/deactivate - Desactivar cuenta (admin)
   */
  async deactivateUserAccount(userId, reason = null) {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      const url = API_ENDPOINTS.USER.ADMIN_DEACTIVATE.replace('{userId}', userId)
      const result = await ServiceREST.put(`${url}${params}`)
      return ServiceREST.handleServiceResponse(result, 'desactivar cuenta')
    } catch (error) {
      this.logError('desactivar cuenta', error)
      throw error
    }
  }

  /**
   * PUT /user/{userId}/reactivate - Reactivar cuenta
   */
  async reactivateUserAccount(userId) {
    try {
      const url = API_ENDPOINTS.USER.REACTIVATE.replace('{userId}', userId)
      const result = await ServiceREST.put(url)
      return ServiceREST.handleServiceResponse(result, 'reactivar cuenta')
    } catch (error) {
      this.logError('reactivar cuenta', error)
      throw error
    }
  }

  /**
   * POST /user/deactivate-batch - Desactivar cuentas en lote
   */
  async deactivateAccountsBatch(userIds, reason = null) {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ''
      const result = await ServiceREST.post(`${API_ENDPOINTS.USER.DEACTIVATE_BATCH}${params}`, userIds)
      return ServiceREST.handleServiceResponse(result, 'desactivar cuentas en lote')
    } catch (error) {
      this.logError('desactivar cuentas en lote', error)
      throw error
    }
  }

  /**
   * POST /user/reactivate-batch - Reactivar cuentas en lote
   */
  async reactivateAccountsBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.REACTIVATE_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'reactivar cuentas en lote')
    } catch (error) {
      this.logError('reactivar cuentas en lote', error)
      throw error
    }
  }

  /**
   * POST /user/{userId}/send-email - Enviar email
   */
  async sendEmailToUser(userId) {
    try {
      const url = API_ENDPOINTS.USER.SEND_EMAIL.replace('{userId}', userId)
      const result = await ServiceREST.post(url)
      return ServiceREST.handleServiceResponse(result, 'enviar email')
    } catch (error) {
      this.logError('enviar email', error)
      throw error
    }
  }

  /**
   * POST /user/send-email-batch - Enviar emails en lote
   */
  async sendEmailsBatch(userIds) {
    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER.SEND_EMAIL_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'enviar emails en lote')
    } catch (error) {
      this.logError('enviar emails en lote', error)
      throw error
    }
  }

  /**
   * DELETE /user/{userId} - Eliminar usuario
   */
  async deleteUser(userId) {
    try {
      const url = API_ENDPOINTS.USER.DELETE.replace('{userId}', userId)
      const result = await ServiceREST.delete(url)
      return ServiceREST.handleServiceResponse(result, 'eliminar usuario')
    } catch (error) {
      this.logError('eliminar usuario', error)
      throw error
    }
  }

  /**
   * DELETE /user/delete-batch - Eliminar usuarios en lote
   */
  async deleteUsersBatch(userIds) {
    try {
      const result = await ServiceREST.delete(API_ENDPOINTS.USER.DELETE_BATCH, userIds)
      return ServiceREST.handleServiceResponse(result, 'eliminar usuarios en lote')
    } catch (error) {
      this.logError('eliminar usuarios en lote', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    this.Logger.serviceError(operation, error, 'userService')
  }
}

// Exportar instancia única
export default new UserService()
