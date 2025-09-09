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
 * - Deduplicación automática de peticiones
 */
export class ServiceREST {
  // Caché de peticiones pendientes para evitar duplicados
  static pendingRequests = new Map()

  // Tiempo de expiración del caché (30 segundos)
  static CACHE_EXPIRY = 30000

  // Flag para habilitar/deshabilitar deduplicación
  static deduplicationEnabled = true
  // ========================================
  // MÉTODOS DE DEDUPLICACIÓN
  // ========================================

  /**
   * Genera una clave única para la petición basada en método, URL y datos
   * @private
   * @param {Object} config - Configuración de la petición
   * @returns {string} Clave única de la petición
   */
  static generateRequestKey(config) {
    const { method = 'GET', url, data, params } = config
    const key = JSON.stringify({
      method: method.toUpperCase(),
      url,
      data: data || null,
      params: params || null
    })
    return btoa(key) // Encode en base64 para hacer la clave más compacta
  }

  /**
   * Verifica si una petición está pendiente y la retorna, o crea una nueva
   * @private
   * @param {Object} config - Configuración de la petición
   * @returns {Promise|null} Promise pendiente o null si no existe
   */
  static checkPendingRequest(config) {
    // Verificar si la deduplicación está habilitada
    if (!this.deduplicationEnabled) {
      return null
    }

    // Solo deduplicar peticiones GET para ser conservadores
    if (config.method && config.method.toUpperCase() !== 'GET') {
      return null
    }

    const key = this.generateRequestKey(config)
    const now = Date.now()

    // Limpiar peticiones expiradas
    for (const [k, entry] of this.pendingRequests.entries()) {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        this.pendingRequests.delete(k)
      }
    }

    // Verificar si la petición ya está pendiente
    if (this.pendingRequests.has(key)) {
      const entry = this.pendingRequests.get(key)
      return entry.promise
    }

    return null
  }

  /**
   * Registra una petición como pendiente
   * @private
   * @param {Object} config - Configuración de la petición
   * @param {Promise} promise - Promise de la petición
   */
  static registerPendingRequest(config, promise) {
    if (config.method && config.method.toUpperCase() !== 'GET') {
      return // Solo registrar GETs
    }

    const key = this.generateRequestKey(config)
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    // Limpiar del caché cuando la petición termine (exitosa o con error)
    promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  /**
   * Limpia el caché de peticiones pendientes
   * @public
   */
  static clearPendingRequests() {
    Logger.log('DEDUPLICATION', 'cache_clear', 'Limpiando caché de peticiones pendientes')
    this.pendingRequests.clear()
  }

  /**
   * Configura la deduplicación de peticiones
   * @public
   * @param {boolean} enabled - Habilitar o deshabilitar deduplicación
   */
  static setDeduplicationEnabled(enabled) {
    this.deduplicationEnabled = enabled
    Logger.log('DEDUPLICATION', 'config_change', `Deduplicación ${enabled ? 'habilitada' : 'deshabilitada'}`)
    if (!enabled) {
      this.clearPendingRequests()
    }
  }

  /**
   * Obtiene estadísticas del caché de peticiones pendientes
   * @public
   * @returns {Object} Estadísticas del caché
   */
  static getCacheStats() {
    const now = Date.now()
    const stats = {
      totalPending: this.pendingRequests.size,
      expired: 0,
      valid: 0
    }

    for (const [, entry] of this.pendingRequests.entries()) {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        stats.expired++
      } else {
        stats.valid++
      }
    }

    return stats
  }

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
   * Ejecuta petición HTTP con manejo de errores y deduplicación automática
   * @private
   * @param {Object} config - Configuración de axios
   * @returns {Promise<Object>} Respuesta con formato: { success, data, status, error? }
   */
  static async request(config) {
    // Verificar si hay una petición pendiente idéntica
    const pendingRequest = this.checkPendingRequest(config)
    if (pendingRequest) {
      return pendingRequest
    }

    // Crear la nueva petición
    const requestPromise = this.executeRequest(config)

    // Registrar la petición como pendiente
    this.registerPendingRequest(config, requestPromise)

    return requestPromise
  }

  /**
   * Ejecuta la petición HTTP real
   * @private
   * @param {Object} config - Configuración de axios
   * @returns {Promise<Object>} Respuesta con formato: { success, data, status, error? }
   */
  static async executeRequest(config) {
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
    } else if (errorType === ErrorManager.ERROR_TYPES.CONFLICT) {
      const backendMessage = ErrorManager.extractBackendMessage(error)
      Logger.warn(Logger.CATEGORIES.SERVICE, 'conflicto de recurso', backendMessage || 'El recurso ya existe', {
        context: {
          endpoint: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          statusCode: error.response?.status
        }
      })
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
