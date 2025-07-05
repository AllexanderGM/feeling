import { ServiceREST } from '@services/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'

/**
 * Servicio para manejo de atributos de usuario
 */
class UserAttributesService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // OPERACIONES PRINCIPALES DE ATRIBUTOS
  // ========================================

  /**
   * Obtiene todos los atributos de usuario agrupados por tipo
   * @returns {Promise<Object>} Atributos agrupados por tipo
   */
  async getAllAttributes() {
    try {
      const result = await ServiceREST.get('/user-attributes')
      return ServiceREST.handleServiceResponse(result, 'obtener atributos de usuario')
    } catch (error) {
      this.logError('obtener atributos de usuario', error)
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
      const result = await ServiceREST.get(`/user-attributes/${attributeType}`)
      return ServiceREST.handleServiceResponse(result, `obtener atributos de tipo ${attributeType}`)
    } catch (error) {
      this.logError(`obtener atributos de tipo ${attributeType}`, error)
      throw error
    }
  }

  /**
   * Obtiene solo los tipos de atributos disponibles
   * @returns {Promise<Array>} Lista de tipos de atributos
   */
  async getAttributeTypes() {
    try {
      const result = await ServiceREST.get('/user-attributes/types')
      return ServiceREST.handleServiceResponse(result, 'obtener tipos de atributos')
    } catch (error) {
      this.logError('obtener tipos de atributos', error)
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
      const result = await ServiceREST.post(`/user-attributes/${attributeType}`, attributeData)
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

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Registra errores con información contextual
   * @param {string} operation - Operación que falló
   * @param {Error} error - Error ocurrido
   */
  logError(operation, error) {
    error.operation = operation
    console.error(`❌ Error en ${operation}:`, ErrorManager.formatError(error))
  }
}

// Crear instancia única
const userAttributesService = new UserAttributesService()

// Exportar métodos individuales para mayor flexibilidad
export const getUserAttributes = () => userAttributesService.getAllAttributes()
export const getUserAttributesByType = attributeType => userAttributesService.getAttributesByType(attributeType)
export const getAttributeTypes = () => userAttributesService.getAttributeTypes()
export const createUserAttribute = (attributeType, attributeData) => userAttributesService.createAttribute(attributeType, attributeData)

export default userAttributesService
