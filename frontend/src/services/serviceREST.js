import { ErrorManager } from '@utils/errorManager.js'

import api from './api.js'

/**
 * Servicio base con manejo estandarizado de errores
 */
export class ServiceREST {
  /**
   * Emite evento personalizado para errores de autenticación
   * @param {Error} error - Error de autenticación
   */
  static emitAuthError(error) {
    const authErrorEvent = new CustomEvent('authError', {
      detail: error
    })
    window.dispatchEvent(authErrorEvent)
  }

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
      // Si es error de autenticación, emitir evento
      if (error?.errorType === 'AUTHENTICATION_ERROR' || error?.response?.status === 401) {
        this.emitAuthError(error)
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
  }

  static async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url })
  }

  static async post(url, data, config = {}) {
    // Si data es FormData, no establecer Content-Type para que el browser lo maneje
    if (data instanceof FormData) {
      const { headers = {}, ...restConfig } = config
      const cleanHeaders = { ...headers }
      
      // Eliminar todas las variantes de Content-Type
      delete cleanHeaders['Content-Type']
      delete cleanHeaders['content-type']
      delete cleanHeaders['Content-type']
      delete cleanHeaders['CONTENT-TYPE']

      return this.request({
        ...restConfig,
        method: 'POST',
        url,
        data,
        headers: cleanHeaders
      })
    }

    return this.request({ ...config, method: 'POST', url, data })
  }

  static async put(url, data, config = {}) {
    // Si data es FormData, no establecer Content-Type para que el browser lo maneje
    if (data instanceof FormData) {
      const { headers = {}, ...restConfig } = config
      const cleanHeaders = { ...headers }
      
      // Eliminar todas las variantes de Content-Type
      delete cleanHeaders['Content-Type']
      delete cleanHeaders['content-type']
      delete cleanHeaders['Content-type']
      delete cleanHeaders['CONTENT-TYPE']

      return this.request({
        ...restConfig,
        method: 'PUT',
        url,
        data,
        headers: cleanHeaders
      })
    }

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

    // Si es error de autenticación, emitir evento también aquí
    if (error.errorType === 'AUTHENTICATION_ERROR' || error.response?.status === 401) {
      this.emitAuthError(error)
    }

    throw error
  }
}
