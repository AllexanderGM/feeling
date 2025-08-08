import { ErrorManager } from '@utils/errorManager.js'
import { Logger } from '@utils/logger.js'
import api from './api.js'

/**
 * Servicio REST base con manejo estandarizado de errores y respuestas
 *
 * Proporciona métodos HTTP estándar (GET, POST, PUT, DELETE) con:
 * - Manejo automático de errores
 * - Formato consistente de respuestas
 * - Eventos de autenticación
 * - Soporte para FormData
 */
export class ServiceREST {
  // ========================================
  // MÉTODOS HTTP PRINCIPALES
  // ========================================

  /**
   * Petición GET
   * @param {string} url - URL del endpoint
   * @param {Object} config - Configuración adicional (headers, params, etc.)
   * @returns {Promise<Object>} Respuesta formateada
   */
  static async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url })
  }

  /**
   * Petición POST
   * @param {string} url - URL del endpoint
   * @param {*} data - Datos a enviar (JSON o FormData)
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} Respuesta formateada
   */
  static async post(url, data, config = {}) {
    if (data instanceof FormData) {
      return this.handleFormDataRequest('POST', url, data, config)
    }
    return this.request({ ...config, method: 'POST', url, data })
  }

  /**
   * Petición PUT
   * @param {string} url - URL del endpoint
   * @param {*} data - Datos a enviar (JSON o FormData)
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} Respuesta formateada
   */
  static async put(url, data, config = {}) {
    if (data instanceof FormData) {
      return this.handleFormDataRequest('PUT', url, data, config)
    }
    return this.request({ ...config, method: 'PUT', url, data })
  }

  /**
   * Petición DELETE
   * @param {string} url - URL del endpoint
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} Respuesta formateada
   */
  static async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url })
  }

  // ========================================
  // MÉTODOS INTERNOS
  // ========================================

  /**
   * Ejecuta petición HTTP con manejo de errores
   * @private
   * @param {Object} config - Configuración de axios
   * @returns {Promise<Object>} Respuesta con formato: { success, data, status, error? }
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
      return this.handleRequestError(error)
    }
  }

  /**
   * Maneja peticiones con FormData
   * @private
   * @param {string} method - Método HTTP
   * @param {string} url - URL del endpoint
   * @param {FormData} data - Datos FormData
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} Respuesta formateada
   */
  static async handleFormDataRequest(method, url, data, config) {
    const { headers = {}, ...restConfig } = config
    const cleanHeaders = { ...headers }

    // Limpiar Content-Type para que el browser lo maneje automáticamente
    delete cleanHeaders['Content-Type']
    delete cleanHeaders['content-type']

    return this.request({
      ...restConfig,
      method,
      url,
      data,
      headers: cleanHeaders
    })
  }

  /**
   * Procesa errores de peticiones HTTP
   * @private
   * @param {Error} error - Error capturado
   * @returns {Object} Respuesta de error formateada
   */
  static async handleRequestError(error) {
    const errorType = ErrorManager.getErrorType(error)

    // Logging especializado según el tipo de error usando Logger
    if (errorType === ErrorManager.ERROR_TYPES.AUTH) {
      Logger.authError('petición HTTP', error)
      if (!error._handledByInterceptor) {
        this.emitAuthError(error)
      }
    } else if (errorType === ErrorManager.ERROR_TYPES.NETWORK) {
      Logger.networkError('petición HTTP', error, error.config?.url)
    } else if (errorType === ErrorManager.ERROR_TYPES.VALIDATION) {
      Logger.validationError('petición HTTP', error, ErrorManager.getFieldErrors(error))
    } else {
      Logger.serviceError('petición HTTP', error, 'ServiceREST')
    }

    const backendMessage = ErrorManager.extractBackendMessage(error)
    const formattedError = ErrorManager.formatError(error, backendMessage)

    return {
      success: false,
      error: formattedError,
      status: error?.response?.status || formattedError.status,
      originalError: error
    }
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Maneja respuesta de servicio y lanza error si falló
   * @param {Object} result - Resultado del servicio
   * @param {string} operation - Descripción de la operación (para logs)
   * @returns {*} Data si fue exitosa
   * @throws {Error} Error formateado si falló
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

    // Emitir evento de auth si es necesario
    if (result.error.type === ErrorManager.ERROR_TYPES.AUTH && !error._handledByInterceptor) {
      this.emitAuthError(error)
    }

    throw error
  }

  /**
   * Emite evento de error de autenticación
   * @private
   * @param {Error} error - Error de autenticación
   */
  static emitAuthError(error) {
    Logger.authError('emitir evento de autenticación', error)
    const authErrorEvent = new CustomEvent('authError', { detail: error })
    window.dispatchEvent(authErrorEvent)
  }
}
