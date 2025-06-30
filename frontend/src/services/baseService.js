import { ErrorManager } from '@utils/errorManager.js'

import api from './api.js'

/**
 * Servicio base con manejo estandarizado de errores
 */
export class BaseService {
  /**
   * Realiza petición HTTP con manejo de errores estándar
   * @param {Object} config - Configuración de la petición
   * @returns {Promise<Object>} Respuesta con formato estándar
   */
  static async request(config) {
    try {
      const response = await api(config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      const formattedError = ErrorManager.formatError(error)
      return {
        success: false,
        error: formattedError,
        originalError: error
      }
    }
  }

  static async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url })
  }

  static async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data })
  }

  static async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  static async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url })
  }

  /**
   * Maneja la respuesta del servicio y lanza error si no fue exitosa
   * @param {Object} result - Resultado del servicio
   * @param {string} operation - Descripción de la operación
   * @returns {*} Data si fue exitosa
   * @throws {Error} Error formateado si no fue exitosa
   */
  static handleServiceResponse(result, operation = 'operación') {
    if (result.success) {
      return result.data
    }

    const error = new Error(result.error.message)
    error.response = result.originalError?.response
    error.errorType = result.error.type
    error.fieldErrors = result.error.fieldErrors
    error.operation = operation

    throw error
  }
}
