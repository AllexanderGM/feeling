/**
 * Sistema de logging unificado para la aplicación
 *
 * Proporciona logging consistente y estructurado para:
 * - Errores de diferentes tipos
 * - Información general
 * - Debugging
 * - Tracking de eventos
 */
export class Logger {
  // Niveles de logging
  static LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  }

  // Categorías de logging para mejor organización
  static CATEGORIES = {
    AUTH: 'AUTH',
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    SERVICE: 'SERVICE',
    UI: 'UI',
    SYSTEM: 'SYSTEM',
    USER: 'USER'
  }

  // ========================================
  // LOGGING PRINCIPAL
  // ========================================

  /**
   * Log genérico con formato estructurado
   * @param {string} level - Nivel del log
   * @param {string} category - Categoría del log
   * @param {string} operation - Operación que se está logueando
   * @param {string|Object} message - Mensaje o datos
   * @param {Object} options - Opciones adicionales
   */
  static log(level, category, operation, message, options = {}) {
    const { error = null, context = null, userId = null, includeStack = false, timestamp = true } = options

    const logData = {
      level,
      category,
      operation,
      message: typeof message === 'string' ? message : 'Ver datos en objeto adjunto',
      timestamp: timestamp ? new Date().toISOString() : undefined,
      userId: userId || this.getCurrentUserId(),
      context
    }

    // Agregar datos del objeto si message no es string
    if (typeof message === 'object') {
      logData.data = message
    }

    // Agregar información del error si existe
    if (error) {
      logData.error = {
        message: error.message,
        status: error?.response?.status,
        code: error.code || error.name,
        stack: includeStack ? error.stack : undefined
      }

      // Datos del response si existen
      if (error.response?.data) {
        logData.error.responseData = error.response.data
      }
    }

    // Verificar si debe loguear según el nivel configurado
    if (!this.shouldLog(level)) {
      return logData
    }

    // Hacer el log con formato mixto: texto para metadatos, objetos para data
    const { logMessage, dataToShow } = this.formatMixedLog(level, category, operation, logData)

    switch (level) {
      case this.LEVELS.ERROR:
        console.error(...logMessage)
        if (dataToShow) console.error('%c📦 Data:', 'color: #6c757d; font-weight: bold;', dataToShow)
        break
      case this.LEVELS.WARN:
        console.warn(...logMessage)
        if (dataToShow) console.warn('%c📦 Data:', 'color: #6c757d; font-weight: bold;', dataToShow)
        break
      case this.LEVELS.INFO:
        console.info(...logMessage)
        if (dataToShow) console.info('%c📦 Data:', 'color: #6c757d; font-weight: bold;', dataToShow)
        break
      case this.LEVELS.DEBUG:
        console.log(...logMessage)
        if (dataToShow) console.log('%c📦 Data:', 'color: #6c757d; font-weight: bold;', dataToShow)
        break
      default:
        console.log(...logMessage)
        if (dataToShow) console.log('%c📦 Data:', 'color: #6c757d; font-weight: bold;', dataToShow)
    }

    return logData
  }

  // ========================================
  // MÉTODOS DE CONVENIENCIA POR NIVEL
  // ========================================

  /**
   * Log de error
   * @param {string} category - Categoría
   * @param {string} operation - Operación
   * @param {Error} error - Error a loguear
   * @param {Object} options - Opciones adicionales
   */
  static error(category, operation, error, options = {}) {
    return this.log(this.LEVELS.ERROR, category, operation, error.message, {
      error,
      includeStack: true,
      ...options
    })
  }

  /**
   * Log de advertencia
   * @param {string} category - Categoría
   * @param {string} operation - Operación
   * @param {string} message - Mensaje
   * @param {Object} options - Opciones adicionales
   */
  static warn(category, operation, message, options = {}) {
    return this.log(this.LEVELS.WARN, category, operation, message, options)
  }

  /**
   * Log informativo
   * @param {string} category - Categoría
   * @param {string} operation - Operación
   * @param {string|Object} message - Mensaje o datos
   * @param {Object} options - Opciones adicionales
   */
  static info(category, operation, message, options = {}) {
    return this.log(this.LEVELS.INFO, category, operation, message, options)
  }

  /**
   * Log de debug
   * @param {string} category - Categoría
   * @param {string} operation - Operación
   * @param {string|Object} message - Mensaje o datos
   * @param {Object} options - Opciones adicionales
   */
  static debug(category, operation, message, options = {}) {
    // Solo loguear debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return this.log(this.LEVELS.DEBUG, category, operation, message, options)
    }
  }

  // ========================================
  // MÉTODOS ESPECIALIZADOS POR CATEGORÍA
  // ========================================

  /**
   * Log especializado para errores de autenticación
   * @param {string} operation - Operación de auth
   * @param {Error} error - Error de autenticación
   * @param {string} currentPath - Ruta actual
   */
  static authError(operation, error, currentPath = null) {
    return this.error(this.CATEGORIES.AUTH, operation, error, {
      context: {
        currentPath,
        willRedirect: true,
        sessionExpired: error?.response?.status === 401
      }
    })
  }

  /**
   * Log especializado para operaciones de autenticación exitosas
   * @param {string} operation - Operación de auth
   * @param {string} userId - ID del usuario
   * @param {Object} context - Contexto adicional
   */
  static authSuccess(operation, userId = null, context = null) {
    return this.info(this.CATEGORIES.AUTH, operation, 'Operación de autenticación exitosa', {
      userId,
      context
    })
  }

  /**
   * Log especializado para errores de red
   * @param {string} operation - Operación de red
   * @param {Error} error - Error de red
   * @param {string} url - URL que falló
   */
  static networkError(operation, error, url = null) {
    return this.error(this.CATEGORIES.NETWORK, operation, error, {
      context: {
        url,
        networkError: true,
        userAgent: navigator?.userAgent,
        online: navigator?.onLine
      }
    })
  }

  /**
   * Log especializado para errores de validación
   * @param {string} operation - Operación de validación
   * @param {Error} error - Error de validación
   * @param {Object} fieldErrors - Errores específicos de campos
   */
  static validationError(operation, error, fieldErrors = null) {
    return this.warn(this.CATEGORIES.VALIDATION, operation, error.message, {
      error,
      context: {
        fieldErrors,
        validationError: true
      }
    })
  }

  /**
   * Log especializado para operaciones de servicios
   * @param {string} operation - Operación del servicio
   * @param {Error} error - Error del servicio
   * @param {string} service - Nombre del servicio
   */
  static serviceError(operation, error, service = 'unknown') {
    return this.error(this.CATEGORIES.SERVICE, operation, error, {
      context: {
        service,
        endpoint: error?.config?.url,
        method: error?.config?.method
      }
    })
  }

  /**
   * Log especializado para eventos de UI
   * @param {string} operation - Operación de UI
   * @param {string} message - Mensaje del evento
   * @param {Object} context - Contexto de UI
   */
  static uiEvent(operation, message, context = null) {
    return this.debug(this.CATEGORIES.UI, operation, message, { context })
  }

  /**
   * Log especializado para acciones de usuario
   * @param {string} operation - Acción del usuario
   * @param {string} message - Descripción de la acción
   * @param {Object} context - Contexto adicional
   */
  static userAction(operation, message, context = null) {
    return this.info(this.CATEGORIES.USER, operation, message, { context })
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Obtiene el ID del usuario actual si está disponible
   * @private
   * @returns {string|null} ID del usuario o null
   */
  static getCurrentUserId() {
    try {
      // Intentar obtener del localStorage o contexto
      const userString = localStorage.getItem('user')
      if (userString) {
        const user = JSON.parse(userString)
        return user.id || user.userId || null
      }
    } catch (e) {
      // Si falla, no es crítico
    }
    return null
  }

  /**
   * Configura el nivel mínimo de logging
   * @param {string} level - Nivel mínimo (error, warn, info, debug)
   */
  static setLogLevel(level) {
    this.logLevel = level
  }

  /**
   * Formatea el log con colores y formato mixto (texto + objetos)
   * @private
   * @param {string} level - Nivel del log
   * @param {string} category - Categoría del log
   * @param {string} operation - Operación
   * @param {Object} logData - Datos del log
   * @returns {Object} {logMessage: string, dataToShow: Object|null}
   */
  static formatMixedLog(level, category, operation, logData) {
    const timestamp = new Date().toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const levelIcon = this.getLevelIcon(level)
    const userId = logData.userId ? ` (User: ${logData.userId})` : ''
    const colors = this.getLevelColors(level)

    // Línea principal con colores
    let logMessage = `%c${levelIcon} [${timestamp}] %c[${category}] %c${operation}: %c${logData.message}${userId}`

    // Agregar metadatos como texto
    const textDetails = []

    if (logData.context) {
      textDetails.push(`Context: ${this.objectToText(logData.context)}`)
    }

    if (logData.error) {
      const errorDetails = []
      errorDetails.push(`Message: "${logData.error.message}"`)
      if (logData.error.status) errorDetails.push(`Status: ${logData.error.status}`)
      if (logData.error.code) errorDetails.push(`Code: ${logData.error.code}`)
      if (logData.error.responseData) {
        errorDetails.push(`ResponseData: ${this.objectToText(logData.error.responseData)}`)
      }
      textDetails.push(`Error: {${errorDetails.join(', ')}}`)
    }

    if (textDetails.length > 0) {
      logMessage += `\n%c  ${textDetails.join('\n  ')}`
    }

    // Preparar los estilos CSS para colores
    const styles = [
      colors.icon, // Para el ícono y timestamp
      colors.category, // Para la categoría
      colors.operation, // Para la operación
      colors.message // Para el mensaje
    ]

    // Agregar estilo para los detalles si existen
    if (textDetails.length > 0) {
      styles.push(colors.details)
    }

    // Devolver el mensaje con estilos y los datos como objeto separado
    return {
      logMessage: [logMessage, ...styles],
      dataToShow: logData.data || null
    }
  }

  /**
   * Convierte un objeto a texto legible
   * @private
   * @param {*} obj - Objeto a convertir
   * @returns {string} Representación textual del objeto
   */
  static objectToText(obj) {
    if (obj === null || obj === undefined) return 'null'
    if (typeof obj === 'string') return `"${obj}"`
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      const items = obj.map(item => this.objectToText(item))
      return `[${items.join(', ')}]`
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'

      const pairs = entries.map(([key, value]) => `${key}: ${this.objectToText(value)}`)
      return `{${pairs.join(', ')}}`
    }

    return String(obj)
  }

  /**
   * Obtiene el icono para cada nivel de log
   * @private
   * @param {string} level - Nivel del log
   * @returns {string} Icono del nivel
   */
  static getLevelIcon(level) {
    const icons = {
      [this.LEVELS.ERROR]: '❌',
      [this.LEVELS.WARN]: '⚠️',
      [this.LEVELS.INFO]: 'ℹ️',
      [this.LEVELS.DEBUG]: '🐛'
    }
    return icons[level] || 'ℹ️'
  }

  /**
   * Obtiene los colores CSS para cada nivel de log
   * @private
   * @param {string} level - Nivel del log
   * @returns {Object} Estilos CSS para cada parte del log
   */
  static getLevelColors(level) {
    const baseStyles = {
      [this.LEVELS.ERROR]: {
        icon: 'color: #dc3545; font-weight: bold;',
        category: 'color: #ffffff; font-weight: bold; background: #dc3545; padding: 2px 8px; border-radius: 4px;',
        operation: 'color: #dc3545; font-weight: bold;',
        message: 'color: #333333; font-weight: 500;',
        details: 'color: #666666; font-style: italic;'
      },
      [this.LEVELS.WARN]: {
        icon: 'color: #ff8c00; font-weight: bold;',
        category: 'color: #ffffff; font-weight: bold; background: #ff8c00; padding: 2px 8px; border-radius: 4px;',
        operation: 'color: #ff8c00; font-weight: bold;',
        message: 'color: #333333; font-weight: 500;',
        details: 'color: #666666; font-style: italic;'
      },
      [this.LEVELS.INFO]: {
        icon: 'color: #007acc; font-weight: bold;',
        category: 'color: #ffffff; font-weight: bold; background: #007acc; padding: 2px 8px; border-radius: 4px;',
        operation: 'color: #007acc; font-weight: bold;',
        message: 'color: #333333; font-weight: 500;',
        details: 'color: #666666; font-style: italic;'
      },
      [this.LEVELS.DEBUG]: {
        icon: 'color: #8e44ad; font-weight: bold;',
        category: 'color: #ffffff; font-weight: bold; background: #8e44ad; padding: 2px 8px; border-radius: 4px;',
        operation: 'color: #8e44ad; font-weight: bold;',
        message: 'color: #333333; font-weight: 500;',
        details: 'color: #666666; font-style: italic;'
      }
    }

    return baseStyles[level] || baseStyles[this.LEVELS.INFO]
  }

  /**
   * Verifica si debe loguear según el nivel configurado
   * @private
   * @param {string} level - Nivel del log
   * @returns {boolean} Si debe loguear
   */
  static shouldLog(level) {
    if (!this.logLevel) return true

    const levels = ['debug', 'info', 'warn', 'error']
    const currentIndex = levels.indexOf(this.logLevel)
    const messageIndex = levels.indexOf(level)

    return messageIndex >= currentIndex
  }

  /**
   * Limpia logs antiguos (para uso futuro con almacenamiento)
   */
  static clearOldLogs() {
    // Implementación futura si se almacenan logs localmente
    console.info('[LOGGER] Limpieza de logs ejecutada')
  }
}
