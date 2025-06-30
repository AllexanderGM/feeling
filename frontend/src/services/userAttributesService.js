import { BaseService } from '@services/baseService.js'

/**
 * Servicio para manejo de atributos de usuario
 */
class UserAttributesService extends BaseService {
  /**
   * Obtiene todos los atributos de usuario agrupados por tipo
   * @returns {Promise<Object>} Atributos agrupados por tipo
   */
  async getAllAttributes() {
    try {
      const result = await BaseService.get('/user-attributes')
      return BaseService.handleServiceResponse(result, 'obtener atributos de usuario')
    } catch (error) {
      console.error('❌ Error obteniendo atributos de usuario:', {
        type: error.errorType,
        message: error.message,
        operation: error.operation
      })
      throw error
    }
  }

  /**
   * Obtiene atributos de un tipo específico
   * @param {string} attributeType - Tipo de atributo
   * @returns {Promise<Array>} Lista de atributos del tipo especificado
   */
  async getAttributesByType(attributeType) {
    try {
      const result = await BaseService.get(`/user-attributes/${attributeType}`)
      return BaseService.handleServiceResponse(result, `obtener atributos de tipo ${attributeType}`)
    } catch (error) {
      console.error(`❌ Error obteniendo atributos de tipo ${attributeType}:`, {
        type: error.errorType,
        message: error.message,
        operation: error.operation
      })
      throw error
    }
  }

  /**
   * Crea un nuevo atributo de usuario
   * @param {string} attributeType - Tipo de atributo (EYE_COLOR, HAIR_COLOR, etc.)
   * @param {Object} attributeData - Datos del atributo {name, detail}
   * @returns {Promise<Object>} Atributo creado
   */
  async createAttribute(attributeType, attributeData) {
    try {
      const result = await BaseService.post(`/user-attributes/${attributeType}`, attributeData)
      return BaseService.handleServiceResponse(result, `crear atributo de tipo ${attributeType}`)
    } catch (error) {
      console.error(`❌ Error creando atributo de tipo ${attributeType}:`, {
        type: error.errorType,
        message: error.message,
        operation: error.operation,
        fieldErrors: error.fieldErrors
      })

      // Enriquecer mensaje de error para casos específicos
      if (error.errorType === 'VALIDATION_ERROR' && error.fieldErrors) {
        const validationMessages = Object.entries(error.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
        error.message = `Error de validación: ${validationMessages}`
      }

      throw error
    }
  }

  /**
   * Obtiene sugerencias de tags por categoría
   * @param {string} categoryInterest - Categoría de interés
   * @param {number} limit - Límite de resultados (default: 15)
   * @returns {Promise<Array>} Array de tags sugeridos
   */
  async getCategorySuggestions(categoryInterest, limit = 15) {
    try {
      if (!categoryInterest) {
        console.warn('⚠️ No se proporcionó categoría de interés')
        return []
      }

      const result = await BaseService.get(`/tags/popular/category/${categoryInterest}?limit=${limit}`)

      if (!result.success) {
        console.warn('⚠️ No se pudieron obtener sugerencias:', result.error.message)
        return []
      }

      return result.data || []
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias de categoría:', {
        type: error.errorType,
        message: error.message,
        categoryInterest
      })
      // Para este caso específico, devolver array vacío en lugar de lanzar error
      return []
    }
  }
}

// Crear instancia y exportar métodos
const userAttributesService = new UserAttributesService()

export const getUserAttributes = () => userAttributesService.getAllAttributes()
export const getUserAttributesByType = attributeType => userAttributesService.getAttributesByType(attributeType)
export const createUserAttribute = (attributeType, attributeData) => userAttributesService.createAttribute(attributeType, attributeData)
export const getCategorySuggestions = (categoryInterest, limit) => userAttributesService.getCategorySuggestions(categoryInterest, limit)

export default userAttributesService
