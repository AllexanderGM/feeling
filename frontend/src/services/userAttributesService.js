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
