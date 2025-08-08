import { useCallback, useState } from 'react'
import { userService } from '@services'
import { USER_PROFILE_REQUIRED_FIELDS, USER_PROFILE_OPTIONAL_FIELDS, isSpecialField, formatProfileCompletionData } from '@schemas'

import { useAuth } from '@hooks/auth/useAuth.js'
import { useError } from '@hooks/utils/useError.js'
import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'
import { mapBackendUserToFrontend, mapBackendUsersToFrontend, mapBackendUsersPaginatedResponse } from '@utils/userMapper.js'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

const useUser = () => {
  const {
    user,
    updateUser: updateAuthUser,
    updateUserStatus,
    updateUserProfile: updateAuthUserProfile,
    updateUserMetrics,
    updateUserPrivacy,
    updateUserNotifications,
    updateUserAuth,
    updateUserAccount
  } = useAuth()
  const { handleApiResponse } = useError()

  // Hook centralizado para operaciones asíncronas
  const { loading, submitting, withLoading, withSubmitting } = useAsyncOperation()

  const profile = user

  // Estados para gestión paginada de usuarios (por estatus)
  const [usersByStatus, setUsersByStatus] = useState({})
  const [usersPagination, setUsersPagination] = useState({})

  // Estado para sugerencias de perfiles
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsPagination, setSuggestionsPagination] = useState({
    page: 0,
    size: 4,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

  // ========================================
  // CLIENTE ENDPOINTS
  // ========================================

  /**
   * Obtener usuario actual completo
   */
  const getCurrentUser = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        const userData = await userService.getCurrentUser()
        updateAuthUser(userData)
        return userData
      }, 'obtener usuario actual')

      return handleApiResponse(result, 'Usuario obtenido correctamente.', { showNotifications })
    },
    [withLoading, updateAuthUser, handleApiResponse]
  )

  /**
   * Obtener perfil público de usuario para match
   */
  const getUserPublicProfile = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        const userData = await userService.getUserPublicProfile(email)
        return mapBackendUserToFrontend(userData)
      }, 'obtener perfil público')

      return handleApiResponse(result, 'Perfil público obtenido.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener perfil completo de usuario para match
   */
  const getUserCompleteProfile = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        const userData = await userService.getUserCompleteProfile(email)
        return mapBackendUserToFrontend(userData)
      }, 'obtener perfil completo')

      return handleApiResponse(result, 'Perfil completo obtenido.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Calcular compatibilidad con otro usuario
   */
  const calculateCompatibility = useCallback(
    async (otherUserEmail, showNotifications = true) => {
      const result = await withLoading(async () => {
        return await userService.calculateCompatibility(otherUserEmail)
      }, 'calcular compatibilidad')

      return handleApiResponse(result, 'Compatibilidad calculada.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener sugerencias de usuarios (pageable)
   */
  const fetchUserSuggestions = useCallback(
    async (page = 0, size = 4, showNotifications = false) => {
      const result = await withLoading(async () => {
        const response = await userService.getUserSuggestions(page, size)

        // Manejar respuesta paginada
        if (response.content && Array.isArray(response.content)) {
          setSuggestions(response.content)
          setSuggestionsPagination({
            page: response.number || page,
            size: response.size || size,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            hasNext: !response.last,
            hasPrevious: !response.first
          })
          return response.content
        } else {
          // Fallback para respuesta no paginada
          const suggestions = Array.isArray(response) ? response : [response].filter(Boolean)
          setSuggestions(suggestions)
          setSuggestionsPagination({
            page: 0,
            size: suggestions.length,
            totalPages: 1,
            totalElements: suggestions.length,
            hasNext: false,
            hasPrevious: false
          })
          return suggestions
        }
      }, 'obtener sugerencias')

      return handleApiResponse(result, 'Sugerencias cargadas.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Actualizar perfil actual con imágenes
   */
  const updateCurrentProfile = useCallback(
    async (profileData, profileImages = null, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        const updatedProfile = await userService.updateCurrentProfile(profileData, profileImages)
        updateAuthUser(updatedProfile)
        return updatedProfile
      }, 'actualizar perfil')

      return handleApiResponse(result, 'Perfil actualizado exitosamente.', { showNotifications })
    },
    [withSubmitting, updateAuthUser, handleApiResponse]
  )

  /**
   * Desactivar perfil actual
   */
  const deactivateCurrentAccount = useCallback(
    async (reason = null, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.deactivateCurrentAccount(reason)
      }, 'desactivar cuenta')

      return handleApiResponse(result, 'Cuenta desactivada exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * Obtener todos los usuarios (pageable)
   */
  const getAllUsers = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, search = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        const response = await userService.getAllUsers(page, size, search)
        const mappedResponse = mapBackendUsersPaginatedResponse(response)

        // Actualizar estado
        setUsersByStatus(prev => ({ ...prev, all: mappedResponse.content || [] }))
        setUsersPagination(prev => ({
          ...prev,
          all: {
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          }
        }))

        return mappedResponse.content || []
      }, 'obtener todos los usuarios')

      return handleApiResponse(result, 'Usuarios cargados.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener usuario completo por email (admin)
   */
  const getUserByEmail = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        const userData = await userService.getUserByEmail(email)
        return mapBackendUserToFrontend(userData)
      }, 'obtener usuario por email')

      return handleApiResponse(result, 'Usuario obtenido.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener usuarios por estatus (pageable)
   */
  const getUsersByStatus = useCallback(
    async (backendStatus, frontendStatus, page = 0, size = DEFAULT_ROWS_PER_PAGE, search = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        const response = await userService.getUsersByStatus(backendStatus, page, size, search)
        const mappedResponse = mapBackendUsersPaginatedResponse(response)

        // Actualizar estado usando el nombre del frontend para consistencia
        const statusKey = frontendStatus || backendStatus

        // Storing user data by status

        setUsersByStatus(prev => ({ ...prev, [statusKey]: mappedResponse.content || [] }))
        setUsersPagination(prev => ({
          ...prev,
          [statusKey]: {
            page: mappedResponse.number || page,
            size: mappedResponse.size || size,
            totalPages: mappedResponse.totalPages || 0,
            totalElements: mappedResponse.totalElements || 0,
            hasNext: !mappedResponse.last,
            hasPrevious: !mappedResponse.first
          }
        }))

        return mappedResponse.content || []
      }, `obtener usuarios ${backendStatus}`)

      return handleApiResponse(result, `Usuarios ${backendStatus} cargados.`, { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Actualizar perfil por admin
   */
  const updateUserProfileByAdmin = useCallback(
    async (userId, profileData, profileImages = null, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.updateUserProfileByAdmin(userId, profileData, profileImages)
      }, 'actualizar perfil por admin')

      return handleApiResponse(result, 'Perfil actualizado por admin.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Aprobar usuario
   */
  const approveUser = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.approveUser(userId)
      }, 'aprobar usuario')

      return handleApiResponse(result, 'Usuario aprobado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Operaciones en lote - Aprobar usuarios
   */
  const approveUsersBatch = useCallback(
    async (userIds, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.approveUsersBatch(userIds)
      }, 'aprobar usuarios en lote')

      return handleApiResponse(result, 'Usuarios aprobados en lote.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Rechazar usuario
   */
  const rejectUser = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.rejectUser(userId)
      }, 'rechazar usuario')

      return handleApiResponse(result, 'Usuario rechazado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Resetear a pendiente
   */
  const resetUserToPending = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.resetUserToPending(userId)
      }, 'resetear a pendiente')

      return handleApiResponse(result, 'Usuario reseteado a pendiente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Asignar rol admin
   */
  const assignAdminRole = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.assignAdminRole(userId)
      }, 'asignar rol admin')

      return handleApiResponse(result, 'Rol admin asignado.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Revocar rol admin
   */
  const revokeAdminRole = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.revokeAdminRole(userId)
      }, 'revocar rol admin')

      return handleApiResponse(result, 'Rol admin revocado.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Desactivar cuenta por admin
   */
  const deactivateUserAccount = useCallback(
    async (userId, reason = null, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.deactivateUserAccount(userId, reason)
      }, 'desactivar cuenta')

      return handleApiResponse(result, 'Cuenta desactivada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Reactivar cuenta
   */
  const reactivateUserAccount = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.reactivateUserAccount(userId)
      }, 'reactivar cuenta')

      return handleApiResponse(result, 'Cuenta reactivada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Enviar email
   */
  const sendEmailToUser = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.sendEmailToUser(userId)
      }, 'enviar email')

      return handleApiResponse(result, 'Email enviado.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  /**
   * Eliminar usuario
   */
  const deleteUser = useCallback(
    async (userId, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        return await userService.deleteUser(userId)
      }, 'eliminar usuario')

      return handleApiResponse(result, 'Usuario eliminado.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // MÉTODOS DE UTILIDAD Y COMPATIBILIDAD
  // ========================================

  /**
   * Actualizar perfil (método de compatibilidad)
   */
  const updateUser = useCallback(
    async (formData, showNotifications = true) => {
      return await updateCurrentProfile(formData, formData.images, showNotifications)
    },
    [updateCurrentProfile]
  )

  /**
   * Obtener perfil (método de compatibilidad)
   */
  const fetchProfile = useCallback(
    async (forceRefresh = false, showNotifications = false) => {
      if (profile && !forceRefresh) {
        return { success: true, data: profile, fromCache: true }
      }
      return await getCurrentUser(showNotifications)
    },
    [profile, getCurrentUser]
  )

  /**
   * Obtener estadísticas del perfil
   */
  const getProfileStats = useCallback(() => {
    if (!profile) return null

    const requiredFields = USER_PROFILE_REQUIRED_FIELDS
    const optionalFields = USER_PROFILE_OPTIONAL_FIELDS

    const requiredComplete = requiredFields.filter(field => {
      const value = profile[field]
      return isSpecialField(field, value)
    }).length

    const optionalComplete = optionalFields.filter(field => {
      const value = profile[field]
      return isSpecialField(field, value)
    }).length

    const totalFields = requiredFields.length + optionalFields.length
    const completedFields = requiredComplete + optionalComplete
    const completionPercentage = Math.round((completedFields / totalFields) * 100)

    return {
      completionPercentage,
      completedFieldsCount: completedFields,
      totalFieldsCount: totalFields,
      requiredFieldsCount: requiredFields.length,
      optionalFieldsCount: optionalFields.length,
      requiredCompleted: requiredComplete,
      optionalCompleted: optionalComplete,
      missingFieldsCount: totalFields - completedFields,
      hasImages: profile.images?.length > 0,
      imageCount: profile.images?.length || 0,
      isVerified: profile.verified || false,
      hasProfileComplete: profile.profileComplete || false
    }
  }, [profile])

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados básicos
    loading,
    submitting,
    user,
    profile,

    // Cliente endpoints
    getCurrentUser,
    getUserPublicProfile,
    getUserCompleteProfile,
    calculateCompatibility,
    fetchUserSuggestions,
    updateCurrentProfile,
    deactivateCurrentAccount,

    // Admin endpoints
    getAllUsers,
    getUserByEmail,
    getUsersByStatus,
    updateUserProfileByAdmin,
    approveUser,
    approveUsersBatch,
    rejectUser,
    resetUserToPending,
    assignAdminRole,
    revokeAdminRole,
    deactivateUserAccount,
    reactivateUserAccount,
    sendEmailToUser,
    deleteUser,

    // Estados de usuarios por estatus
    usersByStatus,
    usersPagination,

    // Sugerencias
    suggestions,
    suggestionsPagination,

    // Métodos de compatibilidad
    updateUser,
    fetchProfile,
    getProfileStats,

    // Otros métodos que pueden existir en el contexto
    ...user // Spread del user para mantener compatibilidad
  }
}

export default useUser
