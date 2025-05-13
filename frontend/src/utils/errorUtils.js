export const getErrorMessage = error => {
  if (typeof error === 'string') return error

  // Errores de respuesta HTTP
  if (error.response) {
    const { status, data } = error.response

    // Errores de validación
    if (status === 400 && data.message) {
      return data.message
    }

    // Errores de autenticación
    if (status === 401) {
      return 'No estás autorizado para acceder. Por favor, inicia sesión nuevamente.'
    }

    // Otros códigos de estado
    return data.message || `Error ${status}: ${data.error || 'Error del servidor'}`
  }

  // Errores de red
  if (error.message && error.message.includes('conexión')) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  }

  // Error genérico
  return error.message || 'Ha ocurrido un error inesperado'
}

export const getFieldErrors = error => {
  if (!error.response || !error.response.data) return {}

  // Errores específicos de campo del servidor
  if (error.response.data.errors) {
    return error.response.data.errors
  }

  // Inferir errores de campo basados en el mensaje
  const fieldErrors = {}
  const errorMessage = error.response.data.message || ''

  if (errorMessage.toLowerCase().includes('email')) {
    fieldErrors.email = 'Email inválido o no registrado'
  }

  if (errorMessage.toLowerCase().includes('contraseña') || errorMessage.toLowerCase().includes('password')) {
    fieldErrors.password = 'Contraseña incorrecta'
  }

  return fieldErrors
}

// Mapeo de tipos de error a mensajes amigables
export const errorTypeMessages = {
  NETWORK_ERROR: 'Problema de conexión con el servidor',
  AUTHENTICATION_ERROR: 'Error de autenticación',
  VALIDATION_ERROR: 'Datos inválidos',
  SERVER_ERROR: 'Error interno del servidor',
  NOT_FOUND_ERROR: 'No encontrado',
  UNKNOWN_ERROR: 'Error desconocido'
}
