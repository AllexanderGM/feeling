import { API_URL } from '@config/config'

export const getUserAttributes = async () => {
  try {
    const response = await fetch(`${API_URL}/user-attributes`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error obteniendo atributos de usuario:', error)
    throw error
  }
}

export const getUserAttributesByType = async attributeType => {
  try {
    const response = await fetch(`${API_URL}/user-attributes/${attributeType}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error obteniendo atributos de tipo ${attributeType}:`, error)
    throw error
  }
}

// Nueva función para crear atributos con mejor manejo de errores
export const createUserAttribute = async (attributeType, attributeData) => {
  try {
    const response = await fetch(`${API_URL}/user-attributes/${attributeType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attributeData)
    })

    // Si la respuesta no es exitosa, extraer el mensaje de error del backend
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()

        // Diferentes tipos de errores del backend
        if (errorData.error === 'VALIDATION_ERROR' && errorData.details) {
          const validationErrors = Object.entries(errorData.details)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
          errorMessage = `Error de validación: ${validationErrors}`
        } else if (errorData.error === 'DUPLICATE_ATTRIBUTE') {
          errorMessage = 'Ya existe un atributo con ese nombre o código. Podrás añadirlo una vez sea aprobado.'
        } else if (errorData.error === 'INVALID_ATTRIBUTE_TYPE') {
          errorMessage = `Tipo de atributo no válido: ${attributeType}`
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (parseError) {
        // Si no se puede parsear el JSON, usar mensaje genérico
        console.warn('No se pudo parsear el error del servidor:', parseError)
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error creando atributo de tipo ${attributeType}:`, error)

    // Re-lanzar con mensaje más descriptivo si es un error de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }

    throw error
  }
}
