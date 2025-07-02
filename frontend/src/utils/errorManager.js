export class ErrorManager {
  static ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTHENTICATION_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    SERVER: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    PERMISSION: 'PERMISSION_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  }

  /**
   * Obtiene el tipo de error basado en la respuesta del servidor
   * @param {Error} error - Error original
   * @returns {string} Tipo de error
   * */
  static getErrorType(error) {
    if (!error.response) return this.ERROR_TYPES.NETWORK

    const status = error.response.status
    if (status === 401) return this.ERROR_TYPES.AUTH
    if (status === 403) return this.ERROR_TYPES.PERMISSION
    if (status === 404) return this.ERROR_TYPES.NOT_FOUND
    if (status >= 400 && status < 500) return this.ERROR_TYPES.VALIDATION
    if (status >= 500) return this.ERROR_TYPES.SERVER

    return this.ERROR_TYPES.UNKNOWN
  }

  /**
   * Formatea error preservando mensajes específicos del backend
   * @param {Error} error - Error original
   * @param {string} message - Mensaje específico del backend
   * @returns {Object} Error formateado
   */
  static formatError(error, message = null) {
    return {
      success: false,
      type: this.getErrorType(error),
      message: message || this.getErrorMessage(error) || 'Error desconocido',
      status: error.response?.status,
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

      // PRIORIDAD 1: Mensaje específico del backend en campo 'error'
      if (data?.error) return data.error

      // PRIORIDAD 2: Mensaje específico del backend en campo 'message'
      if (data?.message) return data.message

      // PRIORIDAD 3: Mensajes genéricos por código de estado
      const statusMessages = {
        400: 'Solicitud inválida. Verifica los datos enviados.',
        401: 'No estás autorizado. Inicia sesión nuevamente.',
        403: 'No tienes permisos para esta acción.',
        404: 'Recurso no encontrado.',
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
      // Buscar en orden de prioridad: error, message, msg
      return data.error || data.message || data.msg || null
    }
    return null
  }
}
