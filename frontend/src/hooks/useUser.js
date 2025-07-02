import { useState, useCallback } from 'react'
import useAuth from '@hooks/useAuth'
import userService from '@services/userService.js'
import { useError } from '@hooks/useError'
import { ErrorManager } from '@utils/errorManager'

const useUser = () => {
  const { user, updateUser: updateAuthUser } = useAuth()
  const { handleApiResponse } = useError()

  // Estados locales
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const profile = user

  // ========================================
  // HELPERS INTERNOS
  // ========================================

  const withLoading = useCallback(async (asyncFn, operation = 'operación') => {
    setLoading(true)
    try {
      const result = await asyncFn()
      return {
        success: true,
        data: result,
        message: null
      }
    } catch (error) {
      console.error(`❌ Error en ${operation}:`, error)
      return {
        success: false,
        ...ErrorManager.formatError(error),
        message: error.message || 'Error desconocido',
        operation
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const withSubmitting = useCallback(async (asyncFn, operation = 'operación') => {
    setSubmitting(true)
    try {
      const result = await asyncFn()
      return {
        success: true,
        data: result,
        message: null
      }
    } catch (error) {
      console.error(`❌ Error en ${operation}:`, error)
      return {
        success: false,
        error,
        message: error.message || 'Error desconocido',
        operation
      }
    } finally {
      setSubmitting(false)
    }
  }, [])

  const formatFormDataToApi = useCallback(formData => {
    return {
      document: formData.document,
      phone: formData.phoneCode && formData.phone ? `${formData.phoneCode}${formData.phone}` : formData.phone,
      dateOfBirth: formData.birthDate,
      description: formData.description,
      country: formData.country,
      city: formData.city,
      department: formData.department || '',
      locality: formData.locality || '',
      categoryInterest: formData.categoryInterest,
      religionId: formData.religionId ? parseInt(formData.religionId) : null,
      spiritualMoments: formData.spiritualMoments || '',
      spiritualPractices: formData.spiritualPractices || '',
      sexualRoleId: formData.sexualRoleId ? parseInt(formData.sexualRoleId) : null,
      relationshipId: formData.relationshipTypeId ? parseInt(formData.relationshipTypeId) : null,
      genderId: formData.genderId ? parseInt(formData.genderId) : null,
      height: formData.height ? parseInt(formData.height) : null,
      eyeColorId: formData.eyeColorId ? parseInt(formData.eyeColorId) : null,
      hairColorId: formData.hairColorId ? parseInt(formData.hairColorId) : null,
      bodyTypeId: formData.bodyTypeId ? parseInt(formData.bodyTypeId) : null,
      maritalStatusId: formData.maritalStatusId ? parseInt(formData.maritalStatusId) : null,
      profession: formData.profession || '',
      educationId: formData.educationLevelId ? parseInt(formData.educationLevelId) : null,
      tags: formData.tags || [],
      agePreferenceMin: formData.agePreferenceMin ? parseInt(formData.agePreferenceMin) : 18,
      agePreferenceMax: formData.agePreferenceMax ? parseInt(formData.agePreferenceMax) : 50,
      locationPreferenceRadius: formData.locationPreferenceRadius ? parseInt(formData.locationPreferenceRadius) : 50,
      allowNotifications: formData.allowNotifications !== false,
      showAge: formData.showAge !== false,
      showLocation: formData.showLocation !== false,
      showMeInSearch: formData.showMeInSearch !== false
    }
  }, [])

  // ========================================
  // MÉTODOS PRINCIPALES
  // ========================================

  const completeUser = useCallback(
    async (formData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        if (!formData) throw new Error('Los datos del perfil son requeridos')

        const images = formData.images ? formData.images.filter(img => img instanceof File) : []
        const userFormData = formatFormDataToApi(formData)
        const data = await userService.completeUser(userFormData, images)
        updateAuthUser(data)

        return data
      }, 'Completar perfil')

      return handleApiResponse(result, '¡Perfil completado exitosamente! Ya puedes usar todas las funciones.', { showNotifications })
    },
    [withSubmitting, updateAuthUser, formatFormDataToApi, handleApiResponse]
  )

  const updateUser = useCallback(
    async (formData, showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('🔄 Actualizando perfil:', formData)

        let images = []
        let updateData = formData

        if (formData.images) {
          images = formData.images.filter(img => img instanceof File)
          updateData = formatFormDataToApi(formData)
        }

        let updatedProfile

        if (images && images.length > 0) {
          const formDataToSend = new FormData()
          formDataToSend.append('profileData', JSON.stringify(updateData))
          images.forEach(image => {
            formDataToSend.append('profileImages', image)
          })
          updatedProfile = await userService.updateUser(formDataToSend)
        } else {
          updatedProfile = await userService.updateUser(updateData)
        }

        updateAuthUser(updatedProfile)
        console.log('✅ Perfil actualizado exitosamente')
        return updatedProfile
      }, 'actualizar perfil')

      return handleApiResponse(result, 'Perfil actualizado exitosamente.', { showNotifications })
    },
    [withLoading, updateAuthUser, formatFormDataToApi, handleApiResponse]
  )

  const fetchProfile = useCallback(
    async (forceRefresh = false, showNotifications = false) => {
      if (profile && !forceRefresh) {
        return {
          success: true,
          data: profile,
          fromCache: true
        }
      }

      const result = await withLoading(async () => {
        console.log('📥 Obteniendo perfil del usuario desde servidor')
        const profileData = await userService.getMyUser()
        updateAuthUser(profileData)
        console.log('✅ Perfil obtenido y sincronizado exitosamente')
        return profileData
      }, 'obtener perfil')

      if (showNotifications) {
        return handleApiResponse(result, 'Perfil sincronizado correctamente.', { showNotifications: true })
      }

      return result
    },
    [profile, withLoading, updateAuthUser, handleApiResponse]
  )

  const uploadProfileImage = useCallback(
    async (imageFile, showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('📤 Subiendo imagen de perfil')
        const uploadResult = await userService.uploadProfileImage(imageFile)

        if (uploadResult && uploadResult.imageUrl) {
          updateAuthUser({
            image: uploadResult.imageUrl,
            images: [...(profile?.images || []), uploadResult.imageUrl]
          })
        }

        console.log('✅ Imagen subida exitosamente')
        return uploadResult
      }, 'subir imagen')

      return handleApiResponse(result, 'Imagen subida exitosamente.', { showNotifications })
    },
    [withLoading, updateAuthUser, profile?.images, handleApiResponse]
  )

  const updateUserPreferences = useCallback(
    async (preferences, showNotifications = true) => {
      const result = await withLoading(async () => {
        const updatedPreferences = await userService.updateUserPreferences(preferences)
        updateAuthUser({ preferences: updatedPreferences })
        return updatedPreferences
      }, 'actualizar preferencias')

      return handleApiResponse(result, 'Preferencias actualizadas exitosamente.', { showNotifications })
    },
    [withLoading, updateAuthUser, handleApiResponse]
  )

  // ========================================
  // VALIDACIONES Y ESTADÍSTICAS
  // ========================================

  const getProfileStats = useCallback(() => {
    if (!profile) return null

    const requiredFields = [
      'name',
      'lastName',
      'email',
      'phone',
      'document',
      'dateOfBirth',
      'city',
      'country',
      'categoryInterest',
      'description'
    ]

    const completedFields = requiredFields.filter(field => {
      const value = profile[field]
      return value && value.toString().trim() !== ''
    })

    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100)

    return {
      completionPercentage,
      completedFieldsCount: completedFields.length,
      totalFieldsCount: requiredFields.length,
      missingFieldsCount: requiredFields.length - completedFields.length,
      hasImages: profile.images?.length > 0,
      imageCount: profile.images?.length || 0,
      isVerified: profile.verified || false,
      hasCompleteProfile: profile.profileComplete || false
    }
  }, [profile])

  const isProfileComplete = useCallback(() => {
    if (!profile) return false
    const stats = getProfileStats()
    return stats ? stats.completionPercentage >= 80 : false
  }, [profile, getProfileStats])

  const needsProfileCompletion = useCallback(() => {
    if (!profile) return true
    return !profile.profileComplete || !isProfileComplete()
  }, [profile, isProfileComplete])

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    submitting,
    user,

    // Métodos principales
    completeUser,
    updateUser,
    fetchProfile,
    uploadProfileImage,
    updateUserPreferences,

    // Validaciones y estadísticas
    getProfileStats,
    isProfileComplete,
    needsProfileCompletion,

    // Utilidades
    formatFormDataToApi
  }
}

export default useUser
