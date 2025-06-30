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

  static formatError(error) {
    return {
      type: this.getErrorType(error),
      message: this.getErrorMessage(error),
      fieldErrors: this.getFieldErrors(error),
      status: error.response?.status,
      timestamp: new Date().toISOString()
    }
  }

  static getErrorMessage(error) {
    if (typeof error === 'string') return error

    // Errores de respuesta HTTP
    if (error.response) {
      const { status, data } = error.response

      // Si el servidor envía mensaje específico
      if (data?.message) return data.message

      // Mensajes por código de estado
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

  static isNetworkError(error) {
    return (
      !error.response &&
      (error.code === 'NETWORK_ERROR' ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('conexión'))
    )
  }
}
