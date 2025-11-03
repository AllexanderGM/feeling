import { HTTP_STATUS } from '@schemas'

export class ErrorManager {
  static ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTHENTICATION_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    CONFLICT: 'CONFLICT_ERROR',
    SERVER: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    PERMISSION: 'PERMISSION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    UNKNOWN: 'UNKNOWN_ERROR'
  }

  // Mensajes amigables por tipo de error
  static ERROR_TYPE_MESSAGES = {
    NETWORK_ERROR: 'Problema de conexión con el servidor',
    AUTHENTICATION_ERROR: 'Error de autenticación',
    VALIDATION_ERROR: 'Datos inválidos',
    CONFLICT_ERROR: 'El recurso ya existe o hay un conflicto',
    SERVER_ERROR: 'Error interno del servidor',
    NOT_FOUND_ERROR: 'No encontrado',
    PERMISSION_ERROR: 'Sin permisos',
    RATE_LIMIT_EXCEEDED: 'Límite de peticiones excedido',
    UNKNOWN_ERROR: 'Error desconocido'
  }

  /**
   * Obtiene el tipo de error basado en la respuesta del servidor
   * @param {Error} error - Error original
   * @returns {string} Tipo de error
   * */
  static getErrorType(error) {
    if (!error.response) return this.ERROR_TYPES.NETWORK

    const status = error.response.status

    if (status === HTTP_STATUS.UNAUTHORIZED) return this.ERROR_TYPES.AUTH
    if (status === HTTP_STATUS.FORBIDDEN) return this.ERROR_TYPES.PERMISSION
    if (status === HTTP_STATUS.NOT_FOUND) return this.ERROR_TYPES.NOT_FOUND
    if (status === HTTP_STATUS.CONFLICT) return this.ERROR_TYPES.CONFLICT
    if (status === 429) return this.ERROR_TYPES.RATE_LIMIT
    if (status >= HTTP_STATUS.BAD_REQUEST && status < HTTP_STATUS.INTERNAL_SERVER_ERROR) return this.ERROR_TYPES.VALIDATION
    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return this.ERROR_TYPES.SERVER

    return this.ERROR_TYPES.UNKNOWN
  }

  /**
   * Formatea error preservando mensajes específicos del backend
   * @param {Error} error - Error original
   * @param {string} message - Mensaje específico del backend
   * @returns {Object} Error formateado
   */
  static formatError(error, message = null) {
    const data = error.response?.data || {}
    const details = data.details || null
    const email = data.email || details?.email || null

    return {
      success: false,
      type: this.getErrorType(error),
      message: message || this.getErrorMessage(error) || 'Error desconocido',
      status: error.code || error.status || error.response?.status || 500,
      code: data.code || data.error || error.code || null,
      details,
      email,
      fieldErrors: this.getFieldErrors(error),
      operation: error.operation || 'operación'
    }
  }

  /**
   * Obtiene un mensaje de error genérico basado en el error recibido
   * @param {Error} error - Error original
   * @returns {string} Mensaje de error genérico
   */
  static getErrorMessage(error) {
    if (typeof error === 'string') return error

    // Errores de respuesta HTTP
    if (error.response) {
      const { status, data } = error.response

      // PRIORIDAD 1: Mensaje específico del backend en campo 'message'
      if (data?.message) return data.message

      // PRIORIDAD 2: Mensaje específico del backend en campo 'error'
      if (data?.error) return data.error

      // PRIORIDAD 3: Mensajes genéricos por código de estado
      const statusMessages = {
        400: 'Solicitud inválida. Verifica los datos enviados.',
        401: 'No estás autorizado. Inicia sesión nuevamente.',
        403: 'No tienes permisos para esta acción.',
        404: 'El servicio no está disponible o la ruta no existe. Verifica que el backend esté ejecutándose correctamente.',
        409: 'El recurso ya existe o hay un conflicto.',
        422: 'Datos no válidos.',
        429: 'Demasiadas solicitudes. Inténtalo más tarde.',
        500: 'Error interno del servidor.',
        502: 'Servidor no disponible.',
        503: 'Servicio temporalmente no disponible.'
      }

      return statusMessages[status] || `Error del servidor (${status})`
    }

    // Errores de red
    if (this.isNetworkError(error)) {
      return 'Sin conexión al servidor. Verifica tu internet.'
    }

    return error.message || 'Error inesperado'
  }

  /**
   * Extrae errores específicos de campo del error del servidor
   * @param {Error} error - Error original
   * @returns {Object} Objeto con errores de campo
   * */
  static getFieldErrors(error) {
    if (!error.response?.data) return {}

    // Errores específicos de campo del servidor
    if (error.response.data.errors) {
      return error.response.data.errors
    }

    // Inferir errores basados en el mensaje
    const fieldErrors = {}
    const message = error.response.data.message?.toLowerCase() || ''

    if (message.includes('email')) {
      fieldErrors.email = 'Email inválido'
    }
    if (message.includes('contraseña') || message.includes('password')) {
      fieldErrors.password = 'Contraseña incorrecta'
    }

    return fieldErrors
  }

  /**
   * Verifica si el error es de red (sin respuesta del servidor)
   * @param {Error} error - Error original
   * @returns {boolean} Verdadero si es un error de red
   */
  static isNetworkError(error) {
    return (
      !error.response &&
      (error.code === 'NETWORK_ERROR' ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('conexión'))
    )
  }

  /**
   * Método de utilidad para extraer mensaje del backend
   * @param {Error} error - Error original
   * @returns {string|null} Mensaje del backend o null
   */
  static extractBackendMessage(error) {
    if (error.response?.data) {
      const data = error.response.data

      return data.message || data.error || data.msg || null
    }

    return null
  }

  /**
   * Obtiene mensaje amigable por tipo de error
   * @param {string} errorType - Tipo de error
   * @returns {string} Mensaje amigable
   */
  static getFriendlyMessage(errorType) {
    return this.ERROR_TYPE_MESSAGES[errorType] || this.ERROR_TYPE_MESSAGES.UNKNOWN_ERROR
  }

  /**
   * Verifica si el error es de rate limiting (429)
   * @param {Error} error - Error original
   * @returns {boolean} Verdadero si es un error de rate limiting
   */
  static isRateLimitError(error) {
    return error.response?.status === 429 || error.code === '429' || error.response?.data?.error === 'RATE_LIMIT_EXCEEDED'
  }

  /**
   * Formatea error específicamente para rate limiting
   * @param {Error} error - Error original
   * @returns {Object} Error formateado para rate limiting
   */
  static formatRateLimitError(error) {
    const baseError = this.formatError(error)
    const data = error.response?.data || {}

    return {
      ...baseError,
      error: data.error || 'RATE_LIMIT_EXCEEDED',
      code: data.code || '429',
      message: data.message || 'Demasiadas peticiones. Intenta de nuevo en unos momentos.',
      timestamp: data.timestamp || new Date().toISOString(),
      retryAfter: this.extractRetryAfter(error),
      showModal: true, // Flag para mostrar el modal específico
      type: this.ERROR_TYPES.RATE_LIMIT
    }
  }

  /**
   * Extrae el tiempo de espera del header Retry-After o del mensaje
   * @param {Error} error - Error original
   * @returns {number} Segundos a esperar
   */
  static extractRetryAfter(error) {
    // Intentar obtener del header Retry-After
    const retryAfter = error.response?.headers?.['retry-after']

    if (retryAfter) {
      return parseInt(retryAfter, 10)
    }

    // Intentar extraer del mensaje
    const message = error.response?.data?.message || ''
    const minuteMatch = message.match(/(\d+)\s*minuto/i)

    if (minuteMatch) {
      return parseInt(minuteMatch[1]) * 60
    }

    const secondMatch = message.match(/(\d+)\s*segundo/i)

    if (secondMatch) {
      return parseInt(secondMatch[1])
    }

    // Default: 60 segundos
    return 60
  }

  /**
   * Verifica si debe mostrar el modal de rate limiting
   * @param {Error} error - Error original
   * @returns {boolean} Verdadero si debe mostrar el modal
   */
  static shouldShowRateLimitModal(error) {
    return this.isRateLimitError(error)
  }
}
