import { useCallback, useState, useContext } from 'react'
import { userService, matchService } from '@services'
import { USER_USER_REQUIRED_FIELDS, USER_USER_OPTIONAL_FIELDS, isSpecialField } from '@schemas'
import AuthContext from '@contexts/AuthContext.jsx'
import { useError, useAsyncOperation } from '@hooks'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'
import { Logger } from '@utils/logger'
import { mapBackendUserToFrontend } from '@utils/userMapper.js'

const dedupeSuggestions = suggestions => {
  const seen = new Map()

  suggestions.forEach(suggestion => {
    // Usar user.user.id como clave única (estructura actualizada de la API)
    const key = suggestion.user?.user?.id ?? suggestion.user?.id ?? JSON.stringify(suggestion)

    if (!seen.has(key)) {
      seen.set(key, suggestion)
    }
  })

  return Array.from(seen.values())
}

const useUser = () => {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth debe ser utilizado dentro de AuthProvider')

  const { user, updateUser } = context
  const { handleApiResponse } = useError()
  const { loading, submitting, withLoading, withSubmitting } = useAsyncOperation()

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
      const result = await withLoading(async () => await userService.getCurrentUser(), 'obtener usuario actual')

      // Mapear la respuesta del backend a la estructura del frontend
      const mappedUser = mapBackendUserToFrontend(result.data)

      // Actualizar el contexto con el usuario mapeado
      updateUser(mappedUser)

      return handleApiResponse(result, 'Usuario obtenido correctamente.', { showNotifications })
    },
    [withLoading, updateUser, handleApiResponse]
  )

  /**
   * Obtener perfil público de usuario para match
   */
  const getUserPublicProfile = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        return await userService.getUserPublicProfile(email)
      }, 'obtener perfil público')

      return handleApiResponse(result, 'Perfil público obtenido.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener perfil de usuario por ID (primero busca en sugerencias, luego hace llamado API)
   */
  const getUserProfileById = useCallback(
    async (userId, includeLevel = 'public', showNotifications = false) => {
      // Primero intentar encontrar en sugerencias cargadas
      const foundUser = suggestions.find(
        suggestion =>
          suggestion?.user?.user?.id?.toString() === userId?.toString() || suggestion?.user?.id?.toString() === userId?.toString()
      )

      if (foundUser) {
        return { success: true, data: foundUser, fromCache: true }
      }

      // Si no está en sugerencias, hacer llamado a la API
      const result = await withLoading(async () => {
        return await userService.getUserProfileById(userId, includeLevel)
      }, 'obtener perfil de usuario por ID')

      return handleApiResponse(result, 'Perfil de usuario obtenido.', { showNotifications })
    },
    [suggestions, withLoading, handleApiResponse]
  )

  /**
   * Obtener perfil completo de usuario para match
   */
  const getUserCompleteProfile = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        return await userService.getUserCompleteProfile(email)
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
    async (page = 0, size = 3, includeLevel = 'public', showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.log('🌍 Fetching user suggestions - include:', includeLevel, 'page:', page, 'size:', size)
        const response = await userService.getUserSuggestions(includeLevel, page, size)

        Logger.log('📡 API Response received:', response)

        const buildSuggestion = item => {
          // Mantener la estructura original de la API
          return {
            ...item, // Mantener user, compatibility, favorite, etc.
            matchMetadata: {
              isFavorite: item?.favorite ?? false,
              hasPendingMatch: item?.hasPendingMatch ?? false,
              hasAcceptedMatch: item?.hasAcceptedMatch ?? false,
              isDismissed: item?.dismissed ?? false
            }
          }
        }

        let batch = []

        if (response.content && Array.isArray(response.content)) {
          Logger.log('📄 Processing paginated response with', response.content.length, 'users')
          batch = response.content.map(buildSuggestion)
          setSuggestionsPagination({
            page: response.number ?? page,
            size: response.size ?? size,
            totalPages: response.totalPages ?? 0,
            totalElements: response.totalElements ?? 0,
            hasNext: !response.last,
            hasPrevious: !response.first
          })
        } else {
          const normalized = Array.isArray(response) ? response : [response].filter(Boolean)

          batch = normalized.map(buildSuggestion)
          setSuggestionsPagination(prev => ({
            page,
            size,
            totalPages: prev.totalPages || (page > 0 ? prev.totalPages : 1),
            totalElements: (prev.totalElements || 0) + batch.length,
            hasNext: batch.length === size,
            hasPrevious: page > 0
          }))
        }

        setSuggestions(prev => {
          const merged = page === 0 ? batch : [...prev, ...batch]

          return dedupeSuggestions(merged)
        })

        return batch
      }, 'obtener sugerencias')

      return handleApiResponse(result, 'Sugerencias cargadas.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Actualizar perfil actual con imágenes
   * @param {Object} profileData - Datos del perfil a actualizar
   * @param {Array} profileImages - Array de imágenes (File objects) a subir
   * @param {boolean} replaceImages - Si es true, reemplaza todas las imágenes existentes; si es false, las agrega
   * @param {boolean} showNotifications - Si se deben mostrar notificaciones
   */
  const updateCurrentProfile = useCallback(
    async (profileData, profileImages = null, replaceImages = false, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        const updatedProfile = await userService.updateCurrentProfile(profileData, profileImages, replaceImages)

        // Mapear la respuesta del backend a la estructura del frontend
        const mappedUser = mapBackendUserToFrontend(updatedProfile)

        // Actualizar el contexto con el usuario mapeado
        updateUser(mappedUser)

        return mappedUser
      }, 'actualizar perfil')

      return handleApiResponse(result, 'Perfil actualizado exitosamente.', { showNotifications })
    },
    [withSubmitting, updateUser, handleApiResponse]
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
   * Obtener todos los usuarios (pageable) - SIN MAPPING
   */
  const getAllUsers = useCallback(
    async (page = 0, size = DEFAULT_ROWS_PER_PAGE, search = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        const response = await userService.getAllUsers(page, size, search)
        const directResponse = response

        // Actualizar estado
        setUsersByStatus(prev => ({ ...prev, all: directResponse.content || [] }))
        setUsersPagination(prev => ({
          ...prev,
          all: {
            page: directResponse.number || page,
            size: directResponse.size || size,
            totalPages: directResponse.totalPages || 0,
            totalElements: directResponse.totalElements || 0,
            hasNext: !directResponse.last,
            hasPrevious: !directResponse.first
          }
        }))

        return directResponse.content || []
      }, 'obtener todos los usuarios')

      return handleApiResponse(result, 'Usuarios cargados.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener usuario completo por email (admin) - SIN MAPPING
   */
  const getUserByEmail = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        const userData = await userService.getUserByEmail(email)

        return userData
      }, 'obtener usuario por email')

      return handleApiResponse(result, 'Usuario obtenido.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener usuarios por estatus (pageable) - SIN MAPPING
   */
  const getUsersByStatus = useCallback(
    async (backendStatus, frontendStatus, page = 0, size = DEFAULT_ROWS_PER_PAGE, search = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        const response = await userService.getUsersByStatus(backendStatus, page, size, search)

        // Usar respuesta directa sin mapping
        const directResponse = response

        // Actualizar estado usando el nombre del frontend para consistencia
        const statusKey = frontendStatus || backendStatus

        // Storing user data by status - usando estructura original del backend
        setUsersByStatus(prev => ({ ...prev, [statusKey]: directResponse.content || [] }))
        setUsersPagination(prev => ({
          ...prev,
          [statusKey]: {
            page: directResponse.number || page,
            size: directResponse.size || size,
            totalPages: directResponse.totalPages || 0,
            totalElements: directResponse.totalElements || 0,
            hasNext: !directResponse.last,
            hasPrevious: !directResponse.first
          }
        }))

        return directResponse.content || []
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
   * Obtener perfil (método de compatibilidad)
   */
  const fetchProfile = useCallback(
    async (forceRefresh = false, showNotifications = false) => {
      return user && !forceRefresh ? { success: true, data: user, fromCache: true } : await getCurrentUser(showNotifications)
    },
    [user, getCurrentUser]
  )

  /**
   * Obtener estadísticas del perfil
   */
  const getProfileStats = useCallback(() => {
    if (!user) return null

    // Usar profileCompleteness del backend si está disponible
    if (user.metrics?.profileCompleteness !== undefined) {
      return {
        completionPercentage: user.metrics.profileCompleteness,
        completedFieldsCount: 0,
        totalFieldsCount: 0,
        requiredFieldsCount: 0,
        optionalFieldsCount: 0,
        requiredCompleted: 0,
        optionalCompleted: 0,
        missingFieldsCount: 0,
        hasImages: user.user?.images?.length > 0,
        imageCount: user.user?.images?.length || 0,
        isVerified: user.status?.verified || false,
        hasProfileComplete: !!(user.status?.profileComplete && user.status?.configurationCompleted)
      }
    }

    // Fallback: calcular manualmente si no viene del backend
    const requiredFields = USER_USER_REQUIRED_FIELDS
    const optionalFields = USER_USER_OPTIONAL_FIELDS
    const userData = user.user || user

    const requiredComplete = requiredFields.filter(field => {
      const value = userData[field]

      return isSpecialField(field, value)
    }).length

    const optionalComplete = optionalFields.filter(field => {
      const value = userData[field]

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
      hasImages: userData.images?.length > 0,
      imageCount: userData.images?.length || 0,
      isVerified: user.status?.verified || user.verified || false,
      hasProfileComplete: !!(user.status?.profileComplete && user.status?.configurationCompleted)
    }
  }, [user])

  // ========================================
  // MÉTODOS DE MATCH
  // ========================================

  /**
   * Obtener estadísticas de matches del usuario actual
   */
  const getMatchStats = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        return await matchService.getMatchStats()
      }, 'obtener estadísticas de match')

      return handleApiResponse(result, 'Estadísticas de match obtenidas.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener intentos de match restantes
   */
  const getRemainingAttempts = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        return await matchService.getRemainingAttempts()
      }, 'obtener intentos restantes')

      return handleApiResponse(result, 'Intentos restantes obtenidos.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  /**
   * Obtener notificaciones de matches
   */
  const getMatchNotifications = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        return await matchService.getMatchNotifications()
      }, 'obtener notificaciones de match')

      return handleApiResponse(result, 'Notificaciones de match obtenidas.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados básicos
    loading,
    submitting,
    user,

    // Cliente endpoints
    getCurrentUser,
    getUserPublicProfile,
    getUserProfileById,
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

    // Métodos de match
    getMatchStats,
    getRemainingAttempts,
    getMatchNotifications,

    // Otros métodos que pueden existir en el contexto
    ...user // Spread del user para mantener compatibilidad
  }
}

export default useUser
