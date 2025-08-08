import { Logger } from '@utils/logger.js'

/**
 * Clase base para servicios que no son HTTP
 * Proporciona funcionalidades comunes como manejo de errores, logging, etc.
 */
export class ServiceNoREST {
  constructor(serviceName) {
    this.serviceName = serviceName || this.constructor.name
    this.verboseLogging = false
    this.isInitialized = false
  }

  /**
   * Crea un error estandarizado del servicio
   * @param {string} type - Tipo de error
   * @param {string} message - Mensaje del error
   * @param {Object} context - Contexto adicional
   * @returns {Error} Error formateado
   */
  createServiceError(type, message, context = {}) {
    const error = new Error(message)
    error.errorType = type
    error.service = this.serviceName
    error.context = context
    error.timestamp = new Date().toISOString()

    if (this.verboseLogging) {
      Logger.error(`[${this.serviceName}] Error`, { type, message, context })
    }

    return error
  }

  /**
   * Log de información si está habilitado
   * @param {string} message - Mensaje a loggear
   * @param {...any} args - Argumentos adicionales
   */
  logInfo(message, ...args) {
    if (this.verboseLogging) {
      Logger.info(`[${this.serviceName}] ${message}`, { args })
    }
  }

  /**
   * Log de advertencia
   * @param {string} message - Mensaje a loggear
   * @param {...any} args - Argumentos adicionales
   */
  logWarn(message, ...args) {
    Logger.warn(`[${this.serviceName}] ${message}`, { args })
  }

  /**
   * Log de error
   * @param {string} message - Mensaje a loggear
   * @param {...any} args - Argumentos adicionales
   */
  logError(message, ...args) {
    Logger.error(`[${this.serviceName}] ${message}`, { args })
  }

  /**
   * Habilita/deshabilita logs detallados
   * @param {boolean} enabled - Si habilitar logs verbosos
   */
  setVerboseLogging(enabled) {
    this.verboseLogging = enabled
    this.logInfo(`Logs verbosos ${enabled ? 'habilitados' : 'deshabilitados'}`)
  }

  /**
   * Valida parámetros de entrada
   * @param {Object} params - Parámetros a validar
   * @param {Object} validations - Reglas de validación
   * @throws {Error} Si la validación falla
   */
  validateParams(params, validations) {
    for (const [key, rules] of Object.entries(validations)) {
      const value = params[key]

      if (rules.required && (value === undefined || value === null)) {
        throw this.createServiceError('VALIDATION_ERROR', `Parámetro requerido '${key}' no proporcionado`, { key, value, rules })
      }

      if (value !== undefined && rules.type && typeof value !== rules.type) {
        throw this.createServiceError(
          'VALIDATION_ERROR',
          `Parámetro '${key}' debe ser de tipo '${rules.type}', recibido '${typeof value}'`,
          { key, value, expectedType: rules.type, actualType: typeof value }
        )
      }

      if (rules.validator && typeof rules.validator === 'function') {
        const isValid = rules.validator(value)
        if (!isValid) {
          throw this.createServiceError('VALIDATION_ERROR', `Parámetro '${key}' no pasa la validación personalizada`, { key, value, rules })
        }
      }
    }
  }

  /**
   * Ejecuta una operación con manejo de errores
   * @param {Function} operation - Operación a ejecutar
   * @param {string} operationName - Nombre de la operación para logging
   * @returns {Promise<any>} Resultado de la operación
   */
  async executeWithErrorHandling(operation, operationName) {
    try {
      this.logInfo(`Ejecutando operación: ${operationName}`)
      const result = await operation()
      this.logInfo(`Operación '${operationName}' completada exitosamente`)
      return result
    } catch (error) {
      if (error.errorType) {
        // Re-lanzar errores de servicio ya formateados
        throw error
      }

      // Envolver errores no formateados
      throw this.createServiceError('OPERATION_ERROR', `Error en operación '${operationName}': ${error.message}`, {
        operationName,
        originalError: error
      })
    }
  }

  /**
   * Marca el servicio como inicializado
   */
  markAsInitialized() {
    this.isInitialized = true
    this.logInfo('Servicio inicializado correctamente')
  }

  /**
   * Verifica si el servicio está inicializado
   * @throws {Error} Si no está inicializado
   */
  checkInitialization() {
    if (!this.isInitialized) {
      throw this.createServiceError('SERVICE_NOT_INITIALIZED', `${this.serviceName} no ha sido inicializado`)
    }
  }

  /**
   * Obtiene información de debug del servicio
   * @returns {Object} Información de debug
   */
  getDebugInfo() {
    return {
      serviceName: this.serviceName,
      isInitialized: this.isInitialized,
      verboseLogging: this.verboseLogging,
      timestamp: new Date().toISOString()
    }
  }
}
