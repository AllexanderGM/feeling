import { API_URL } from '@config/config'

import { getAuthToken } from './authService.js'

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
    const token = getAuthToken()

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

    // Crear FormData para envío multipart
    const formData = new FormData()

    // Agregar datos del perfil como JSON string
    formData.append('profileData', JSON.stringify(formattedData))

    // Agregar imágenes si existen
    if (profileData.images && profileData.images.length > 0) {
      profileData.images.forEach(image => {
        if (image && image instanceof File) {
          formData.append('profileImages', image)
        }
      })
    }

    console.log('📤 Enviando FormData con:', {
      profileData: formattedData,
      imageCount: profileData.images?.length || 0
    })

    const response = await fetch(`${API_URL}/users/complete-profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // No agregar Content-Type para FormData - el browser lo hace automáticamente
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Error al completar perfil: ${response.status}`)
    }

    const completedProfile = await response.json()
    console.log('✅ Perfil completado correctamente:', completedProfile)

    return completedProfile
  } catch (error) {
    console.error('❌ Error completando perfil:', error)
    throw error
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
 * Actualiza el perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async profileData => {
  try {
    const token = getAuthToken()

    if (!token) {
      throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
    }

    const response = await fetch(`${API_URL}/users/profile`, {
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
    console.log('✅ Perfil actualizado correctamente:', updatedProfile)
    return updatedProfile
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error)
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

    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener perfil: ${response.status}`)
    }

    const profileData = await response.json()
    console.log('✅ Perfil del usuario obtenido:', profileData)
    return profileData
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error)
    throw error
  }
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

  // Validar imagen principal
  if (!profileData.images || profileData.images.length === 0 || !profileData.images[0]) {
    missingFields.push('images')
    errors.images = 'Al menos una imagen de perfil es requerida'
  }

  // Validar tags/intereses
  if (!profileData.tags || profileData.tags.length === 0) {
    missingFields.push('tags')
    errors.tags = 'Al menos un interés es requerido'
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errors,
    completionPercentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  }
}

/**
 * Validación completa del perfil incluyendo campos opcionales
 * Para uso cuando se requiera una validación más estricta
 * @param {Object} profileData - Datos del perfil a validar
 * @returns {Object} Resultado de la validación extendida
 */
export const validateCompleteProfileExtended = profileData => {
  // Campos obligatorios + campos opcionales deseables
  const allFields = [
    'name',
    'lastName',
    'document',
    'phone',
    'birthDate',
    'country',
    'city',
    'categoryInterest',
    'genderId',
    'description',
    'maritalStatusId',
    'educationLevelId',
    'bodyTypeId',
    'height',
    'eyeColorId',
    'hairColorId'
  ]

  const missingFields = []
  const errors = {}
  let completedFields = 0

  // Validar todos los campos
  allFields.forEach(field => {
    if (profileData[field] && (typeof profileData[field] !== 'string' || profileData[field].trim())) {
      completedFields++
    } else {
      missingFields.push(field)
      // Solo marcar error para campos críticos
      const criticalFields = [
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
      if (criticalFields.includes(field)) {
        errors[field] = `${field} es requerido`
      }
    }
  })

  // Validaciones específicas por categoría
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

  // Validar imagen principal
  if (!profileData.images || profileData.images.length === 0 || !profileData.images[0]) {
    missingFields.push('images')
    errors.images = 'Al menos una imagen de perfil es requerida'
  }

  // Validar tags/intereses
  if (!profileData.tags || profileData.tags.length === 0) {
    missingFields.push('tags')
    errors.tags = 'Al menos un interés es requerido'
  }

  return {
    isValid: Object.keys(errors).length === 0, // Solo válido si no hay errores críticos
    isCompletelyFilled: missingFields.length === 0, // Si todos los campos están llenos
    missingFields,
    errors,
    completionPercentage: Math.round((completedFields / allFields.length) * 100)
  }
}
