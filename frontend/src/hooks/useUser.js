import { useState, useCallback, useRef } from 'react'
import { completeUserProfile, updateProfile, getMyProfile, validateCompleteProfile } from '@services/profileService.js'

/**
 * Hook personalizado para la administración del usuario
 * Proporciona funcionalidades para completar, actualizar y obtener perfil del usuario
 */
const useUser = () => {
  // Estados
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  // Ref para cancelar operaciones si el componente se desmonta
  const abortControllerRef = useRef(null)

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  /**
   * Resetea el estado de error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Maneja errores de forma consistente
   */
  const handleError = useCallback((error, customMessage) => {
    console.error('❌ Error en useUser:', error)
    const errorMessage = customMessage || error?.message || 'Error desconocido'
    setError(errorMessage)
    return { success: false, error: errorMessage }
  }, [])

  /**
   * Cancela operaciones en curso
   */
  const cancelOperations = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // ========================================
  // COMPLETAR PERFIL
  // ========================================

  /**
   * Completa el perfil del usuario con datos e imágenes
   * @param {Object} profileData - Datos completos del perfil
   * @returns {Promise<Object>} Resultado de la operación
   */
  const completeProfile = useCallback(
    async profileData => {
      try {
        setSubmitting(true)
        setError(null)

        // Validar datos antes de enviar
        const validation = validateCompleteProfile(profileData)
        if (!validation.isValid) {
          throw new Error(`Datos incompletos: ${validation.missingFields.join(', ')}`)
        }

        console.log('🚀 Iniciando completar perfil:', {
          hasImages: profileData.images?.length > 0,
          imageCount: profileData.images?.length || 0,
          category: profileData.categoryInterest
        })

        // Crear AbortController para cancelar si es necesario
        abortControllerRef.current = new AbortController()

        const result = await completeUserProfile(profileData)

        // Actualizar estado local con el perfil completado
        setProfile(result)

        console.log('✅ Perfil completado exitosamente')

        return {
          success: true,
          data: result,
          message: 'Perfil completado exitosamente'
        }
      } catch (error) {
        // Si fue cancelado, no mostrar error
        if (error.name === 'AbortError') {
          return { success: false, cancelled: true }
        }

        return handleError(error, 'Error al completar el perfil')
      } finally {
        setSubmitting(false)
        abortControllerRef.current = null
      }
    },
    [handleError]
  )

  // ========================================
  // ACTUALIZAR PERFIL
  // ========================================

  /**
   * Actualiza el perfil existente del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateUserProfile = useCallback(
    async updateData => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Actualizando perfil:', updateData)

        const updatedProfile = await updateProfile(updateData)

        // Actualizar estado local
        setProfile(prevProfile => ({
          ...prevProfile,
          ...updatedProfile
        }))

        console.log('✅ Perfil actualizado exitosamente')

        return {
          success: true,
          data: updatedProfile,
          message: 'Perfil actualizado exitosamente'
        }
      } catch (error) {
        return handleError(error, 'Error al actualizar el perfil')
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // ========================================
  // OBTENER PERFIL
  // ========================================

  /**
   * Obtiene el perfil actual del usuario
   * @param {boolean} forceRefresh - Forzar recarga desde servidor
   * @returns {Promise<Object>} Resultado de la operación
   */
  const fetchProfile = useCallback(
    async (forceRefresh = false) => {
      // Si ya tenemos el perfil y no se fuerza refresh, devolver el cached
      if (profile && !forceRefresh) {
        return {
          success: true,
          data: profile,
          fromCache: true
        }
      }

      try {
        setLoading(true)
        setError(null)

        console.log('📥 Obteniendo perfil del usuario')

        const profileData = await getMyProfile()
        setProfile(profileData)

        console.log('✅ Perfil obtenido exitosamente')

        return {
          success: true,
          data: profileData,
          fromCache: false
        }
      } catch (error) {
        return handleError(error, 'Error al obtener el perfil')
      } finally {
        setLoading(false)
      }
    },
    [profile, handleError]
  )

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Valida si el perfil actual está completo
   * @param {Object} profileData - Datos del perfil a validar (opcional, usa el estado si no se proporciona)
   * @returns {Object} Resultado de la validación
   */
  const validateProfile = useCallback(
    (profileData = profile) => {
      if (!profileData) {
        return {
          isValid: false,
          missingFields: ['profile'],
          errors: { profile: 'No hay datos de perfil disponibles' },
          completionPercentage: 0
        }
      }

      return validateCompleteProfile(profileData)
    },
    [profile]
  )

  /**
   * Verifica si el perfil está completo
   * @returns {boolean}
   */
  const isProfileComplete = useCallback(() => {
    const validation = validateProfile()
    return validation.isValid
  }, [validateProfile])

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Resetea todo el estado del hook
   */
  const resetState = useCallback(() => {
    setProfile(null)
    setError(null)
    setLoading(false)
    setSubmitting(false)
    cancelOperations()
  }, [cancelOperations])

  /**
   * Obtiene estadísticas del perfil
   */
  const getProfileStats = useCallback(() => {
    if (!profile) return null

    const validation = validateProfile()

    return {
      completionPercentage: validation.completionPercentage,
      missingFieldsCount: validation.missingFields.length,
      isComplete: validation.isValid,
      hasImages: profile.images?.length > 0,
      imageCount: profile.images?.length || 0
    }
  }, [profile, validateProfile])

  // ========================================
  // RETURN DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    submitting,
    profile,
    error,

    // Funciones principales
    completeProfile,
    updateUserProfile,
    fetchProfile,

    // Validaciones
    validateProfile,
    isProfileComplete,
    getProfileStats,

    // Utilidades
    clearError,
    resetState,
    cancelOperations
  }
}

export default useUser
