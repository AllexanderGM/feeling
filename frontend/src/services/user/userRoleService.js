import { ServiceREST } from '@services/utils/serviceREST.js'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de roles de usuario - UserRoleController
 * Gestiona roles (admin/client) de usuarios
 */
class UserRoleService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CONSULTAS DE ROLES
  // ========================================

  /**
   * GET /user-roles/admins - Listar administradores
   */
  async getAdmins(page = 0, size = 20) {
    const context = 'obtener administradores'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_ROLES.ADMINS}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-roles/clients - Listar clientes
   */
  async getClients(page = 0, size = 20) {
    const context = 'obtener clientes'

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_ROLES.CLIENTS}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-roles/count - Contar usuarios por rol
   */
  async countByRole(role) {
    const context = 'contar usuarios por rol'

    try {
      const params = new URLSearchParams({
        role: role
      })

      const result = await ServiceREST.get(`${API_ENDPOINTS.USER_ROLES.COUNT}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // GESTIÓN DE ROLES ADMIN
  // ========================================

  /**
   * PUT /user-roles/{userId}/grant-admin - Otorgar rol admin a usuario
   */
  async grantAdmin(userId) {
    const context = 'otorgar rol admin'

    try {
      const url = API_ENDPOINTS.USER_ROLES.GRANT_ADMIN.replace('{userId}', userId)
      const result = await ServiceREST.put(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-roles/grant-admin-batch - Otorgar rol admin en lote
   */
  async grantAdminBatch(userIds) {
    const context = 'otorgar rol admin en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_ROLES.GRANT_ADMIN_BATCH, userIds)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * PUT /user-roles/{userId}/revoke-admin - Revocar rol admin
   */
  async revokeAdmin(userId) {
    const context = 'revocar rol admin'

    try {
      const url = API_ENDPOINTS.USER_ROLES.REVOKE_ADMIN.replace('{userId}', userId)
      const result = await ServiceREST.put(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * POST /user-roles/revoke-admin-batch - Revocar rol admin en lote
   */
  async revokeAdminBatch(userIds) {
    const context = 'revocar rol admin en lote'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.USER_ROLES.REVOKE_ADMIN_BATCH, userIds)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Obtener lista de roles disponibles
   */
  getRolesList() {
    return [
      { key: 'ADMIN', label: 'Administrador' },
      { key: 'CLIENT', label: 'Cliente' }
    ]
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'userRoleService')
  }
}

// Crear instancia única
const userRoleService = new UserRoleService()

export default userRoleService
