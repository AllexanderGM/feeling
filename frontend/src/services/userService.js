import { BaseService } from './baseService.js'
import authService from './authService.js'

/**
 * Servicio unificado para manejar operaciones de usuario y perfil
 */
class UserService extends BaseService {
  constructor() {
    super()
    this.verboseLogging = false // Sin logs verbosos por defecto
  }

  // ========================================
  // OPERACIONES BÁSICAS DE USUARIO
  // ========================================

  /**
   * Obtiene la lista de todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAllUsers() {
    try {
      const result = await BaseService.get('/users')
      return BaseService.handleServiceResponse(result, 'obtener lista de usuarios')
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', {
        type: error.errorType,
        message: error.message,
        status: error.response?.status
      })
      throw error
    }
  }

  /**
   * Obtiene un usuario específico por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserByEmail(email) {
    try {
      const result = await BaseService.get(`/users/${encodeURIComponent(email)}`)
      return BaseService.handleServiceResponse(result, 'obtener usuario por email')
    } catch (error) {
      console.error('❌ Error obteniendo usuario por email:', {
        type: error.errorType,
        message: error.message,
        email
      })
      throw error
    }
  }

  /**
   * Elimina un usuario
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async deleteUser(email) {
    try {
      const result = await BaseService.delete(`/users/${encodeURIComponent(email)}`)
      return BaseService.handleServiceResponse(result, 'eliminar usuario')
    } catch (error) {
      console.error('❌ Error eliminando usuario:', {
        type: error.errorType,
        message: error.message,
        email
      })
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE PERFIL
  // ========================================

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  async getMyProfile() {
    try {
      const result = await BaseService.get('/users/profile')
      return BaseService.handleServiceResponse(result, 'obtener perfil del usuario')
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', {
        type: error.errorType,
        message: error.message
      })
      throw error
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Perfil actualizado
   */
  async updateProfile(profileData) {
    try {
      const result = await BaseService.put('/users/profile', profileData)
      return BaseService.handleServiceResponse(result, 'actualizar perfil del usuario')
    } catch (error) {
      console.error('❌ Error actualizando perfil:', {
        type: error.errorType,
        message: error.message,
        fieldErrors: error.fieldErrors
      })
      throw error
    }
  }

  /**
   * Completa el perfil del usuario con toda la información e imágenes
   * @param {Object} profileData - Datos completos del perfil
   * @returns {Promise<Object>} Perfil completado
   */
  async completeUserProfile(profileData) {
    try {
      const token = authService.getToken()

      if (!token) {
        throw new Error('No se encontró token de autenticación. Inicia sesión nuevamente.')
      }

      // Preparar datos para el backend
      const formattedData = this.formatProfileData(profileData)

      // Manejar envío con o sin imágenes
      if (profileData.images && profileData.images.length > 0) {
        return await this.submitProfileWithImages(formattedData, profileData.images, token)
      } else {
        return await this.submitProfileData(formattedData)
      }
    } catch (error) {
      console.error('❌ Error completando perfil:', {
        type: error.errorType,
        message: error.message,
        fieldErrors: error.fieldErrors
      })
      throw error
    }
  }

  /**
   * Completa el perfil del usuario (versión simple sin imágenes)
   * @param {Object} completeProfileData - Datos para completar el perfil
   * @returns {Promise<Object>} Perfil completado
   */
  async completeProfile(completeProfileData) {
    try {
      const result = await BaseService.post('/users/complete-profile', completeProfileData)
      return BaseService.handleServiceResponse(result, 'completar perfil del usuario')
    } catch (error) {
      console.error('❌ Error completando perfil:', {
        type: error.errorType,
        message: error.message,
        fieldErrors: error.fieldErrors
      })
      throw error
    }
  }

  /**
   * Alias para mantener compatibilidad con código existente
   * @param {Object} profileData - Datos completos del perfil incluyendo imágenes
   * @returns {Promise<Object>} Perfil completado
   */
  async completeProfileWithImages(profileData) {
    return await this.completeUserProfile(profileData)
  }

  // ========================================
  // OPERACIONES DE IMÁGENES
  // ========================================

  /**
   * Sube una imagen de perfil
   * @param {File} imageFile - Archivo de imagen
   * @returns {Promise<Object>} URL de la imagen subida
   */
  async uploadProfileImage(imageFile) {
    try {
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error('Se requiere un archivo de imagen válido')
      }

      const formData = new FormData()
      formData.append('profileImage', imageFile)

      const result = await BaseService.post('/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return BaseService.handleServiceResponse(result, 'subir imagen de perfil')
    } catch (error) {
      console.error('❌ Error subiendo imagen de perfil:', {
        type: error.errorType,
        message: error.message
      })
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE PREFERENCIAS
  // ========================================

  /**
   * Obtiene las preferencias del usuario
   * @returns {Promise<Object>} Preferencias del usuario
   */
  async getUserPreferences() {
    try {
      const result = await BaseService.get('/users/preferences')
      return BaseService.handleServiceResponse(result, 'obtener preferencias del usuario')
    } catch (error) {
      console.error('❌ Error obteniendo preferencias:', {
        type: error.errorType,
        message: error.message
      })
      throw error
    }
  }

  /**
   * Actualiza las preferencias del usuario
   * @param {Object} preferences - Nuevas preferencias
   * @returns {Promise<Object>} Preferencias actualizadas
   */
  async updateUserPreferences(preferences) {
    try {
      const result = await BaseService.put('/users/preferences', preferences)
      return BaseService.handleServiceResponse(result, 'actualizar preferencias del usuario')
    } catch (error) {
      console.error('❌ Error actualizando preferencias:', {
        type: error.errorType,
        message: error.message,
        fieldErrors: error.fieldErrors
      })
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ========================================

  /**
   * Formatea los datos del perfil para el backend
   * @param {Object} profileData - Datos del perfil
   * @returns {Object} Datos formateados
   * @private
   */
  formatProfileData(profileData) {
    return {
      // Información básica
      document: profileData.document,
      phone: profileData.fullPhoneNumber || `${profileData.phoneCode}${profileData.phone}`,
      dateOfBirth: profileData.birthDate,

      // Ubicación
      country: profileData.country,
      city: profileData.city,
      department: profileData.department || profileData.state || '',
      locality: profileData.locality || '',

      // Categoría y campos específicos
      categoryInterest: profileData.categoryInterest,
      religionId: profileData.religionId || null,
      spiritualMoments: profileData.spiritualMoments || '',
      spiritualPractices: profileData.spiritualPractices || '',
      sexualRoleId: profileData.sexualRoleId || null,
      relationshipId: profileData.relationshipTypeId || null,

      // Características físicas y personales
      genderId: profileData.genderId,
      height: profileData.height,
      eyeColorId: profileData.eyeColorId,
      hairColorId: profileData.hairColorId,
      bodyTypeId: profileData.bodyTypeId,
      description: profileData.description,
      maritalStatusId: profileData.maritalStatusId,
      profession: profileData.profession || '',
      educationId: profileData.educationLevelId,
      tags: profileData.tags || [],

      // Preferencias
      agePreferenceMin: profileData.agePreferenceMin,
      agePreferenceMax: profileData.agePreferenceMax,
      locationPreferenceRadius: profileData.locationPreferenceRadius,

      // Configuración de privacidad
      allowNotifications: profileData.allowNotifications !== false
    }
  }

  /**
   * Envía perfil con imágenes usando FormData
   * @param {Object} formattedData - Datos formateados del perfil
   * @param {Array} images - Array de imágenes
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Respuesta del servidor
   * @private
   */
  async submitProfileWithImages(formattedData, images, token) {
    try {
      const formData = new FormData()

      // Agregar datos del perfil como JSON string
      formData.append('profileData', JSON.stringify(formattedData))

      // Agregar imágenes válidas
      const validImages = images.filter(image => image && image instanceof File)

      if (validImages.length === 0) {
        console.warn('⚠️ No se encontraron imágenes válidas')
        return await this.submitProfileData(formattedData)
      }

      validImages.forEach(image => {
        formData.append('profileImages', image)
      })

      const result = await BaseService.post('/users/complete-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`
          // No agregar Content-Type para FormData - Axios lo hace automáticamente
        }
      })

      return BaseService.handleServiceResponse(result, 'completar perfil con imágenes')
    } catch (error) {
      if (error.message?.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.')
      }
      throw error
    }
  }

  /**
   * Envía perfil sin imágenes
   * @param {Object} formattedData - Datos formateados del perfil
   * @returns {Promise<Object>} Respuesta del servidor
   * @private
   */
  async submitProfileData(formattedData) {
    const result = await BaseService.post('/users/complete-profile', formattedData)
    return BaseService.handleServiceResponse(result, 'completar perfil')
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Valida si el perfil está completo
   * @param {Object} profileData - Datos del perfil a validar
   * @returns {Object} Resultado de la validación
   */
  validateCompleteProfile(profileData) {
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

    const isComplete = missingFields.length === 0

    return {
      isComplete,
      isValid: isComplete,
      missingFields,
      errors,
      completionPercentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
    }
  }
}

// Crear instancia singleton
const userService = new UserService()

// ========================================
// EXPORTS PARA COMPATIBILIDAD
// ========================================

// Operaciones básicas de usuario
export const getAllUsers = () => userService.getAllUsers()
export const getUserByEmail = email => userService.getUserByEmail(email)
export const deleteUser = email => userService.deleteUser(email)

// Operaciones de perfil
export const getMyProfile = () => userService.getMyProfile()
export const updateProfile = profileData => userService.updateProfile(profileData)
export const completeUserProfile = profileData => userService.completeUserProfile(profileData)
export const completeProfile = completeProfileData => userService.completeProfile(completeProfileData)
export const completeProfileWithImages = profileData => userService.completeProfileWithImages(profileData)

// Operaciones de imágenes
export const uploadProfileImage = imageFile => userService.uploadProfileImage(imageFile)

// Operaciones de preferencias
export const getUserPreferences = () => userService.getUserPreferences()
export const updateUserPreferences = preferences => userService.updateUserPreferences(preferences)

// Validaciones
export const validateCompleteProfile = profileData => userService.validateCompleteProfile(profileData)

// Export default de la instancia
export { userService }
export default userService
