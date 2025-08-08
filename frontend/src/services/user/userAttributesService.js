import { ServiceREST } from '@services/utils/serviceREST.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de atributos de usuario para UserAttributeController (/user-attributes)
 * Incluye endpoints de cliente y administrador según especificaciones
 */
class UserAttributesService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE ENDPOINTS (AUTHENTICATED)
  // ========================================

  /**
   * GET /user-attributes - Todos los atributos agrupados por tipo
   */
  async getAllAttributesGrouped() {
    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ATTRIBUTES.ALL_GROUPED)
      return ServiceREST.handleServiceResponse(result, 'obtener atributos agrupados')
    } catch (error) {
      this.logError('obtener atributos agrupados', error)
      throw error
    }
  }

  /**
   * GET /user-attributes/types - Tipos de atributos disponibles
   */
  async getAttributeTypes() {
    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_ATTRIBUTES.TYPES)
      return ServiceREST.handleServiceResponse(result, 'obtener tipos de atributos')
    } catch (error) {
      this.logError('obtener tipos de atributos', error)
      throw error
    }
  }

  /**
   * GET /user-attributes/{attributeType} - Atributos por tipo específico
   */
  async getAttributesByType(attributeType) {
    try {
      const url = API_ENDPOINTS.USER_ATTRIBUTES.BY_TYPE.replace('{attributeType}', attributeType)
      const result = await ServiceREST.get(url)
      return ServiceREST.handleServiceResponse(result, `obtener atributos de tipo ${attributeType}`)
    } catch (error) {
      this.logError(`obtener atributos de tipo ${attributeType}`, error)
      throw error
    }
  }

  /**
   * GET /user-attributes/{attributeId}/users - Lista de usuarios filtrados por atributo (pageable)
   */
  async getUsersByAttribute(attributeId, page = 0, size = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const url = API_ENDPOINTS.USER_ATTRIBUTES.USERS_BY_ATTRIBUTE.replace('{attributeId}', attributeId)
      const result = await ServiceREST.get(`${url}?${params}`)
      return ServiceREST.handleServiceResponse(result, 'obtener usuarios por atributo')
    } catch (error) {
      this.logError('obtener usuarios por atributo', error)
      throw error
    }
  }

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * POST /user-attributes/{attributeType} - Agregar nuevo atributo por tipo
   */
  async createAttribute(attributeType, attributeData) {
    try {
      const url = API_ENDPOINTS.USER_ATTRIBUTES.CREATE.replace('{attributeType}', attributeType)
      const result = await ServiceREST.post(url, attributeData)
      return ServiceREST.handleServiceResponse(result, `crear atributo de tipo ${attributeType}`)
    } catch (error) {
      // Enriquecer mensaje de error para casos específicos
      if (error.errorType === 'VALIDATION_ERROR' && error.fieldErrors) {
        const validationMessages = Object.entries(error.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
        error.message = `Error de validación: ${validationMessages}`
      }

      this.logError(`crear atributo de tipo ${attributeType}`, error)
      throw error
    }
  }

  /**
   * PUT /user-attributes/{attributeId} - Modificar atributo
   */
  async updateAttribute(attributeId, attributeData) {
    try {
      const url = API_ENDPOINTS.USER_ATTRIBUTES.UPDATE.replace('{attributeId}', attributeId)
      const result = await ServiceREST.put(url, attributeData)
      return ServiceREST.handleServiceResponse(result, 'actualizar atributo')
    } catch (error) {
      this.logError('actualizar atributo', error)
      throw error
    }
  }

  /**
   * DELETE /user-attributes/{attributeId} - Eliminar atributo
   */
  async deleteAttribute(attributeId) {
    try {
      const url = API_ENDPOINTS.USER_ATTRIBUTES.DELETE.replace('{attributeId}', attributeId)
      const result = await ServiceREST.delete(url)
      return ServiceREST.handleServiceResponse(result, 'eliminar atributo')
    } catch (error) {
      this.logError('eliminar atributo', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Obtener atributos por múltiples tipos
   */
  async getAttributesByMultipleTypes(attributeTypes) {
    try {
      const results = await Promise.all(attributeTypes.map(type => this.getAttributesByType(type)))

      return attributeTypes.reduce((acc, type, index) => {
        acc[type] = results[index]
        return acc
      }, {})
    } catch (error) {
      this.logError('obtener atributos por múltiples tipos', error)
      throw error
    }
  }

  /**
   * Validar tipo de atributo antes de crear/actualizar
   */
  async validateAttributeType(attributeType) {
    try {
      const types = await this.getAttributeTypes()
      return types.includes(attributeType.toUpperCase())
    } catch (error) {
      this.logError('validar tipo de atributo', error)
      return false
    }
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    this.Logger.serviceError(operation, error, 'UserAttributesService')
  }
}

// Crear instancia única
const userAttributesService = new UserAttributesService()

// Exportar métodos individuales para compatibilidad con código existente
export const getUserAttributes = () => userAttributesService.getAllAttributesGrouped()
export const getUserAttributesByType = attributeType => userAttributesService.getAttributesByType(attributeType)
export const getAttributeTypes = () => userAttributesService.getAttributeTypes()
export const createUserAttribute = (attributeType, attributeData) => userAttributesService.createAttribute(attributeType, attributeData)
export const updateUserAttribute = (attributeId, attributeData) => userAttributesService.updateAttribute(attributeId, attributeData)
export const deleteUserAttribute = attributeId => userAttributesService.deleteAttribute(attributeId)
export const getUsersByAttribute = (attributeId, page, size) => userAttributesService.getUsersByAttribute(attributeId, page, size)

export default userAttributesService
