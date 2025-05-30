import { getAuthToken } from './authService.js'

const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsers = async () => {
  try {
    const token = getAuthToken()
    const response = await fetch(`${URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    throw error
  }
}

/**
 * Obtiene un usuario específico por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserByEmail = async email => {
  try {
    const token = getAuthToken()
    console.log('Obteniendo usuario con email:', email)
    const response = await fetch(`${URL}/users/${email}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener usuario: ${response.status}`)
    }

    const userData = await response.json()
    console.log('Respuesta del servidor (getUserByEmail):', userData)
    return userData
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    throw error
  }
}

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createUser = async userData => {
  try {
    const response = await fetch(`${URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: userData.image || '',
        name: userData.name,
        lastName: userData.lastName,
        document: userData.document,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        email: userData.email,
        password: userData.password,
        address: userData.address || '',
        city: userData.city || ''
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Error al crear usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creando usuario:', error)
    throw error
  }
}

/**
 * Actualiza un usuario existente
 * @param {string} email - Email del usuario
 * @param {Object} userData - Datos actualizados
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (email, userData) => {
  try {
    const token = getAuthToken()
    const response = await fetch(`${URL}/users/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Error al actualizar usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    throw error
  }
}

/**
 * Actualiza el perfil del usuario autenticado
 * Esta función es específica para completar/actualizar el perfil del usuario logueado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async profileData => {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
    }

    const response = await fetch(`${URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Error al actualizar perfil: ${response.status}`)
    }

    const updatedProfile = await response.json()
    console.log('Perfil actualizado correctamente:', updatedProfile)
    return updatedProfile
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    throw error
  }
}

/**
 * Completa el perfil del usuario autenticado (para el flujo inicial de registro)
 * @param {Object} completeProfileData - Datos para completar el perfil
 * @returns {Promise<Object>} Perfil completado
 */
export const completeProfile = async completeProfileData => {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
    }

    const response = await fetch(`${URL}/users/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(completeProfileData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Error al completar perfil: ${response.status}`)
    }

    const completedProfile = await response.json()
    console.log('Perfil completado correctamente:', completedProfile)
    return completedProfile
  } catch (error) {
    console.error('Error completando perfil:', error)
    throw error
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
export const getMyProfile = async () => {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
    }

    const response = await fetch(`${URL}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener perfil: ${response.status}`)
    }

    const profileData = await response.json()
    console.log('Perfil del usuario obtenido:', profileData)
    return profileData
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    throw error
  }
}

/**
 * Elimina un usuario
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const deleteUser = async email => {
  try {
    const token = getAuthToken()
    console.log('Intentando eliminar usuario:', email)

    // 1. Primero revocar/eliminar los tokens del usuario
    const revokeResponse = await fetch(`${URL}/users/${email}/revoke-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!revokeResponse.ok) {
      const revokeText = await revokeResponse.text()
      console.warn('Error al revocar tokens:', revokeText)
      // Continuamos con la eliminación aunque falle la revocación
    }

    // 2. Luego intentar eliminar el usuario
    const deleteResponse = await fetch(`${URL}/users/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    const responseText = await deleteResponse.text()
    console.log('Respuesta completa del servidor:', responseText)

    if (!deleteResponse.ok) {
      // Intentar parsear como JSON si es posible
      try {
        const errorData = JSON.parse(responseText)
        throw new Error(errorData.message || errorData.error || `Error al eliminar usuario: ${deleteResponse.status}`)
      } catch {
        throw new Error(`Error al eliminar usuario: ${deleteResponse.status} - ${responseText}`)
      }
    }

    return { success: true, message: 'Usuario eliminado exitosamente' }
  } catch (error) {
    console.error('Error completo al eliminar usuario:', error)
    throw error
  }
}

/**
 * Asigna el rol de ADMIN a un usuario
 * @param {string} userId - ID del usuario
 * @param {string} superAdminEmail - Email del superadmin
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const assignAdminRole = async (userId, superAdminEmail) => {
  try {
    const token = getAuthToken()

    console.log('Asignando rol ADMIN al usuario ID:', userId)
    console.log('Super admin email:', superAdminEmail)
    console.log('Token de autorización:', token ? 'Presente' : 'Ausente')

    const response = await fetch(`${URL}/users/${userId}/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Super-Admin-Email': superAdminEmail,
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    const responseText = await response.text()
    console.log('Respuesta completa del servidor (asignar rol ADMIN):', responseText)

    if (!response.ok) {
      throw new Error(`Error al asignar rol ADMIN: ${response.status} - ${responseText}`)
    }

    try {
      return responseText ? JSON.parse(responseText) : { message: 'Rol ADMIN asignado correctamente' }
    } catch {
      return { message: responseText || 'Rol ADMIN asignado correctamente' }
    }
  } catch (error) {
    console.error('Error asignando rol ADMIN:', error)
    throw error
  }
}

/**
 * Revoca el rol de ADMIN de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} superAdminEmail - Email del superadmin
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const revokeAdminRole = async (userId, superAdminEmail) => {
  try {
    const token = getAuthToken()
    console.log('Revocando rol ADMIN al usuario ID:', userId)
    console.log('Super admin email:', superAdminEmail)
    console.log('Token de autorización:', token ? 'Presente' : 'Ausente')

    const response = await fetch(`${URL}/users/${userId}/admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Super-Admin-Email': superAdminEmail,
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    const responseText = await response.text()
    console.log('Respuesta completa del servidor (revocar rol ADMIN):', responseText)

    if (!response.ok) {
      throw new Error(`Error al revocar rol ADMIN: ${response.status} - ${responseText}`)
    }

    try {
      return responseText ? JSON.parse(responseText) : { message: 'Rol ADMIN revocado correctamente' }
    } catch {
      return { message: responseText || 'Rol ADMIN revocado correctamente' }
    }
  } catch (error) {
    console.error('Error revocando rol ADMIN:', error)
    throw error
  }
}
