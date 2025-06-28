import api from '@services/api'
import authService from '@services/authService'

/**
 * Servicio para manejar el perfil del usuario
 */

/**
 * Completa el perfil del usuario con toda la información e imágenes
 * @param {Object} profileData - Datos completos del perfil
 * @returns {Promise<Object>} Perfil completado
 */
export const completeUserProfile = async profileData => {
  try {
    const token = authService.getToken()

    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
    }

    console.log('📤 Enviando datos del perfil completo:', profileData)

    // Preparar datos para el backend según el formato esperado
    const formattedData = {
      // Información básica
      document: profileData.document,
      phone: profileData.fullPhoneNumber || `${profileData.phoneCode}${profileData.phone}`,
      dateOfBirth: profileData.birthDate, // Backend espera 'dateOfBirth', no 'birthDate'

      // Ubicación
      country: profileData.country,
      city: profileData.city,
      department: profileData.department || profileData.state || '', // Mapear department
      locality: profileData.locality || '',

      // Categoría y campos específicos
      categoryInterest: profileData.categoryInterest,
      religionId: profileData.religionId || null,
      spiritualMoments: profileData.spiritualMoments || '',
      spiritualPractices: profileData.spiritualPractices || '',
      sexualRoleId: profileData.sexualRoleId || null,
      relationshipId: profileData.relationshipTypeId || null, // Backend espera 'relationshipId'

      // Características físicas y personales
      genderId: profileData.genderId,
      height: profileData.height,
      eyeColorId: profileData.eyeColorId,
      hairColorId: profileData.hairColorId,
      bodyTypeId: profileData.bodyTypeId,
      description: profileData.description,
      maritalStatusId: profileData.maritalStatusId,
      profession: profileData.profession || '',
      educationId: profileData.educationLevelId, // Backend espera 'educationId'
      tags: profileData.tags || [],

      // Preferencias
      agePreferenceMin: profileData.agePreferenceMin,
      agePreferenceMax: profileData.agePreferenceMax,
      locationPreferenceRadius: profileData.locationPreferenceRadius,

      // Configuración de privacidad
      allowNotifications: profileData.allowNotifications !== false // default true
    }

    // Si hay imágenes, usar FormData para envío multipart
    if (profileData.images && profileData.images.length > 0) {
      const formData = new FormData()

      // Agregar datos del perfil como JSON string
      formData.append('profileData', JSON.stringify(formattedData))

      // Agregar imágenes
      profileData.images.forEach(image => {
        if (image && image instanceof File) {
          formData.append('profileImages', image)
        }
      })

      console.log('📤 Enviando FormData con:', {
        profileData: formattedData,
        imageCount: profileData.images.length
      })

      const response = await api.post('/users/complete-profile', formData, {
        headers: {
          // No agregar Content-Type para FormData - Axios lo hace automáticamente
          Authorization: `Bearer ${token}`
        }
      })

      console.log('✅ Perfil completado correctamente:', response.data)
      return response.data
    } else {
      // Sin imágenes, enviar JSON normal
      const response = await api.post('/users/complete-profile', formattedData)

      console.log('✅ Perfil completado correctamente:', response.data)
      return response.data
    }
  } catch (error) {
    console.error('❌ Error completando perfil:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    // Crear error estructurado
    const structuredError = new Error(error.response?.data?.message || error.message || 'Error al completar el perfil')

    structuredError.response = error.response
    structuredError.errorType = error.response?.data?.type || 'COMPLETE_PROFILE_ERROR'

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
 * Función principal que reemplaza completeProfileWithImages
 * @param {Object} profileData - Datos completos del perfil incluyendo imágenes
 * @returns {Promise<Object>} Perfil completado
 */
export const completeProfileWithImages = async profileData => {
  // Esta función ahora simplemente llama a completeUserProfile
  // ya que maneja tanto datos como imágenes en una sola llamada
  return await completeUserProfile(profileData)
}

/**
 * Valida si el perfil está completo
 * @param {Object} profileData - Datos del perfil a validar
 * @returns {Object} Resultado de la validación
 */
export const validateCompleteProfile = profileData => {
  // Solo campos realmente obligatorios para completar el perfil
  const requiredFields = [
    'name',
    'lastName',
    'document',
    'phone',
    'birthDate',
    'country',
    'city',
    'categoryInterest',
    'genderId',
    'description'
  ]

  const missingFields = []
  const errors = {}

  // Validar campos requeridos
  requiredFields.forEach(field => {
    if (!profileData[field] || (typeof profileData[field] === 'string' && !profileData[field].trim())) {
      missingFields.push(field)
      errors[field] = `${field} es requerido`
    }
  })

  // Validaciones específicas por categoría - SOLO LAS CRÍTICAS
  if (profileData.categoryInterest === 'SPIRIT' && !profileData.religionId) {
    missingFields.push('religionId')
    errors.religionId = 'Religión es requerida para la categoría Spirit'
  }

  if (profileData.categoryInterest === 'ROUSE') {
    if (!profileData.sexualRoleId) {
      missingFields.push('sexualRoleId')
      errors.sexualRoleId = 'Rol sexual es requerido para la categoría Rouse'
    }

    if (!profileData.relationshipTypeId) {
      missingFields.push('relationshipTypeId')
      errors.relationshipTypeId = 'Tipo de relación es requerido para la categoría Rouse'
    }
  }

  const isComplete = missingFields.length === 0

  return {
    isComplete,
    missingFields,
    errors,
    completionPercentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  }
}
