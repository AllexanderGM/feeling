export const getErrorMessage = error => {
  // Error con respuesta HTTP (del servidor)
  if (error.response) {
    const { status, data } = error.response

    // Si el servidor envía un mensaje específico
    if (data && data.message) {
      return data.message
    }

    // Mensajes predeterminados basados en códigos de estado HTTP
    switch (status) {
      case 400:
        return 'La solicitud no pudo ser procesada. Verifica los datos enviados.'
      case 401:
        return 'No estás autorizado. Por favor, inicia sesión nuevamente.'
      case 403:
        return 'No tienes permiso para realizar esta acción.'
      case 404:
        return 'El recurso solicitado no existe.'
      case 409:
        return 'El recurso ya existe o hay un conflicto.'
      case 422:
        return 'Los datos proporcionados no son válidos.'
      case 429:
        return 'Has realizado demasiadas solicitudes. Inténtalo más tarde.'
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde.'
      default:
        return `Error del servidor (${status}).`
    }
  }

  // Error de red (conexión)
  if (
    error.message &&
    (error.message.includes('conexión') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('timeout'))
  ) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  }

  // Error general
  return error.message || 'Ha ocurrido un error inesperado.'
}

// Para errores de validación en campos específicos
export const getFieldErrors = error => {
  if (error.response && error.response.data && error.response.data.errors) {
    return error.response.data.errors // Suponiendo que el servidor devuelve un objeto con errores por campo
  }
  return {}
}
