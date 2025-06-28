import api from '@services/api'
import authService from '@services/authService'

/**
 * Servicio para manejar operaciones de usuario
 */

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsers = async () => {
  try {
    console.log('🔄 Obteniendo lista de todos los usuarios')

    const response = await api.get('/users')

    console.log('✅ Lista de usuarios obtenida:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al obtener la lista de usuarios')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'GET_USERS_ERROR'

    throw structuredError
  }
}

/**
 * Obtiene un usuario específico por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserByEmail = async email => {
  try {
    console.log('🔄 Obteniendo usuario con email:', email)

    const response = await api.get(`/users/${encodeURIComponent(email)}`)

    console.log('✅ Usuario obtenido:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error obteniendo usuario por email:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al obtener el usuario')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'GET_USER_ERROR'

    throw structuredError
  }
}

/**
 * Actualiza el perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async profileData => {
  try {
    console.log('🔄 Actualizando perfil del usuario')

    const response = await api.put('/users/profile', profileData)

    console.log('✅ Perfil actualizado correctamente:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error actualizando perfil:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al actualizar el perfil')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'UPDATE_PROFILE_ERROR'

    throw structuredError
  }
}

/**
 * Completa el perfil del usuario autenticado (para el flujo inicial de registro)
 * @param {Object} completeProfileData - Datos para completar el perfil
 * @returns {Promise<Object>} Perfil completado
 */
export const completeProfile = async completeProfileData => {
  try {
    console.log('🔄 Completando perfil del usuario')

    const response = await api.post('/users/complete-profile', completeProfileData)

    console.log('✅ Perfil completado correctamente:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error completando perfil:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al completar el perfil')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'COMPLETE_PROFILE_ERROR'

    throw structuredError
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
export const getMyProfile = async () => {
  try {
    console.log('🔄 Obteniendo perfil del usuario')

    const response = await api.get('/users/profile')

    console.log('✅ Perfil del usuario obtenido:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al obtener el perfil')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'GET_PROFILE_ERROR'

    throw structuredError
  }
}

/**
 * Elimina un usuario
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const deleteUser = async email => {
  try {
    console.log('🔄 Eliminando usuario:', email)

    const response = await api.delete(`/users/${encodeURIComponent(email)}`)

    console.log('✅ Usuario eliminado correctamente:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error eliminando usuario:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al eliminar el usuario')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'DELETE_USER_ERROR'

    throw structuredError
  }
}

/**
 * Sube una imagen de perfil
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<Object>} URL de la imagen subida
 */
export const uploadProfileImage = async imageFile => {
  try {
    console.log('🔄 Subiendo imagen de perfil')

    const formData = new FormData()
    formData.append('profileImage', imageFile)

    const response = await api.post('/users/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('✅ Imagen de perfil subida:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error subiendo imagen de perfil:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al subir la imagen de perfil')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'UPLOAD_IMAGE_ERROR'

    throw structuredError
  }
}

/**
 * Obtiene las preferencias del usuario
 * @returns {Promise<Object>} Preferencias del usuario
 */
export const getUserPreferences = async () => {
  try {
    console.log('🔄 Obteniendo preferencias del usuario')

    const response = await api.get('/users/preferences')

    console.log('✅ Preferencias obtenidas:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error obteniendo preferencias:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al obtener las preferencias')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'GET_PREFERENCES_ERROR'

    throw structuredError
  }
}

/**
 * Actualiza las preferencias del usuario
 * @param {Object} preferences - Nuevas preferencias
 * @returns {Promise<Object>} Preferencias actualizadas
 */
export const updateUserPreferences = async preferences => {
  try {
    console.log('🔄 Actualizando preferencias del usuario')

    const response = await api.put('/users/preferences', preferences)

    console.log('✅ Preferencias actualizadas:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error actualizando preferencias:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al actualizar las preferencias')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'UPDATE_PREFERENCES_ERROR'

    throw structuredError
  }
}
