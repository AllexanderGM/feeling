import { useCallback, useState } from 'react'
import useAuth from '@hooks/useAuth'
import userService from '@services/userService.js'
import { useError } from '@hooks/useError'
import useAsyncOperation from '@hooks/useAsyncOperation'
import { USER_PROFILE_REQUIRED_FIELDS, USER_PROFILE_OPTIONAL_FIELDS, isSpecialField, formatFormDataToApi } from '@schemas'

const useUser = () => {
  const { user, updateUser: updateAuthUser } = useAuth()
  const { handleApiResponse } = useError()

  // Hook centralizado para operaciones asíncronas
  const { loading, submitting, withLoading, withSubmitting } = useAsyncOperation()

  const profile = user

  // Estado para gestión de múltiples usuarios (administración)
  const [users, setUsers] = useState([])
  const [usersPagination, setUsersPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  })

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
  const [rateLimitedUntil, setRateLimitedUntil] = useState(null)
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)

  // ========================================
  // HELPERS INTERNOS
  // ========================================

  // Usar función centralizada directamente (no necesita useCallback al ser una función pura importada)

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
    [withSubmitting, updateAuthUser, handleApiResponse]
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
    [withLoading, updateAuthUser, handleApiResponse]
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

  // Alias para updateUser que es más específico para el perfil
  const updateUserProfile = useCallback(
    async (profileData, showNotifications = true) => {
      return await updateUser(profileData, showNotifications)
    },
    [updateUser]
  )

  // ========================================
  // FUNCIONES DE SEGURIDAD
  // ========================================

  const changePassword = useCallback(
    async (passwordData, showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('🔐 Cambiando contraseña')
        const response = await userService.changePassword(passwordData)
        console.log('✅ Contraseña cambiada exitosamente')
        return response
      }, 'cambiar contraseña')

      return handleApiResponse(result, 'Contraseña cambiada exitosamente.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const enable2FA = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('🔐 Activando autenticación de dos factores')
        const response = await userService.enable2FA()
        updateAuthUser({ twoFactorAuth: { enabled: true } })
        console.log('✅ 2FA activado exitosamente')
        return response
      }, 'activar 2FA')

      return handleApiResponse(result, 'Autenticación de dos factores activada.', { showNotifications })
    },
    [withLoading, updateAuthUser, handleApiResponse]
  )

  const disable2FA = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('🔐 Desactivando autenticación de dos factores')
        const response = await userService.disable2FA()
        updateAuthUser({ twoFactorAuth: { enabled: false } })
        console.log('✅ 2FA desactivado exitosamente')
        return response
      }, 'desactivar 2FA')

      return handleApiResponse(result, 'Autenticación de dos factores desactivada.', { showNotifications })
    },
    [withLoading, updateAuthUser, handleApiResponse]
  )

  const deleteUserAccount = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('🗑️ Eliminando cuenta de usuario')
        const response = await userService.deleteUserAccount()
        console.log('✅ Cuenta eliminada exitosamente')
        return response
      }, 'eliminar cuenta')

      return handleApiResponse(result, 'Cuenta eliminada exitosamente.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const exportUserData = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log('📦 Exportando datos de usuario')
        const response = await userService.exportUserData()
        
        // Crear y descargar el archivo
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `feeling-data-${user?.email}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log('✅ Datos exportados exitosamente')
        return response
      }, 'exportar datos')

      return handleApiResponse(result, 'Datos exportados exitosamente.', { showNotifications })
    },
    [withLoading, user?.email, handleApiResponse]
  )

  // ========================================
  // GESTIÓN DE MÚLTIPLES USUARIOS (ADMINISTRACIÓN)
  // ========================================

  const fetchUsers = useCallback(
    async (page = 0, size = 10, searchTerm = '', showNotifications = false) => {
      const result = await withLoading(async () => {
        console.log('📥 Obteniendo lista de usuarios', { page, size, searchTerm })
        const response = await userService.getAllUsers(page, size, searchTerm)

        console.log('🔍 useUser: Raw API response:', response)
        console.log('🔍 useUser: Response type:', typeof response)

        // Manejar respuesta paginada del backend
        if (response.content && Array.isArray(response.content)) {
          setUsers(response.content)
          setUsersPagination({
            page: response.number || page,
            size: response.size || size,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            hasNext: !response.last,
            hasPrevious: !response.first
          })
          console.log('✅ Lista de usuarios paginada obtenida exitosamente', {
            users: response.content.length,
            totalElements: response.totalElements
          })
          return response.content
        } else {
          // Fallback para respuesta no paginada
          setUsers(response)
          setUsersPagination({
            page: 0,
            size: response.length,
            totalPages: 1,
            totalElements: response.length,
            hasNext: false,
            hasPrevious: false
          })
          console.log('✅ Lista de usuarios obtenida exitosamente (no paginada)')
          return response
        }
      }, 'obtener usuarios')

      if (showNotifications) {
        return handleApiResponse(result, 'Usuarios cargados correctamente.', { showNotifications: true })
      }

      return result
    },
    [withLoading, handleApiResponse]
  )

  const getUserByEmail = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(async () => {
        console.log(`📥 Obteniendo usuario por email: ${email}`)
        const userData = await userService.getUserByEmail(email)
        console.log('✅ Usuario obtenido exitosamente')
        return userData
      }, 'obtener usuario')

      return handleApiResponse(result, 'Usuario obtenido correctamente.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const createUser = useCallback(
    async (userData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        console.log('👤 Creando nuevo usuario:', userData.email)
        const newUser = await userService.createUser(userData)

        // Actualizar la lista local agregando el nuevo usuario
        setUsers(prevUsers => [...prevUsers, newUser])

        console.log('✅ Usuario creado exitosamente')
        return newUser
      }, 'crear usuario')

      return handleApiResponse(result, 'Usuario creado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const updateUserAdmin = useCallback(
    async (email, userData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        console.log(`🔄 Actualizando usuario: ${email}`)
        const updatedUser = await userService.updateUserAdmin(email, userData)

        // Actualizar la lista local
        setUsers(prevUsers => prevUsers.map(user => (user.profile?.email === email ? { ...user, ...updatedUser } : user)))

        console.log('✅ Usuario actualizado exitosamente')
        return updatedUser
      }, 'actualizar usuario')

      return handleApiResponse(result, 'Usuario actualizado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const assignAdminRole = useCallback(
    async (email, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        console.log(`👑 Asignando rol de administrador a: ${email}`)
        const updatedUser = await userService.assignAdminRole(email)

        // Actualizar la lista local
        setUsers(prevUsers => prevUsers.map(user => (user.profile?.email === email ? { ...user, ...updatedUser } : user)))

        console.log('✅ Rol de administrador asignado exitosamente')
        return updatedUser
      }, 'asignar rol de administrador')

      return handleApiResponse(result, 'Rol de administrador asignado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const revokeAdminRole = useCallback(
    async (email, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        console.log(`👤 Revocando rol de administrador a: ${email}`)
        const updatedUser = await userService.revokeAdminRole(email)

        // Actualizar la lista local
        setUsers(prevUsers => prevUsers.map(user => (user.profile?.email === email ? { ...user, ...updatedUser } : user)))

        console.log('✅ Rol de administrador revocado exitosamente')
        return updatedUser
      }, 'revocar rol de administrador')

      return handleApiResponse(result, 'Rol de administrador revocado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const deleteUser = useCallback(
    async (email, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        console.log(`🗑️ Eliminando usuario: ${email}`)
        await userService.deleteUser(email)

        // Actualizar la lista local eliminando el usuario
        setUsers(prevUsers => prevUsers.filter(user => user.profile?.email !== email))

        console.log('✅ Usuario eliminado exitosamente')
        return { email }
      }, 'eliminar usuario')

      return handleApiResponse(result, 'Usuario eliminado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const refreshUsers = useCallback(
    async (page, size, searchTerm) => {
      return await fetchUsers(page, size, searchTerm, false)
    },
    [fetchUsers]
  )

  const filterUsers = useCallback(
    (searchTerm = '', currentUser = null) => {
      if (!users.length) return []

      let filteredUsers = users.filter(user => {
        // El usuario actual nunca debe verse a sí mismo
        if (user.profile?.email === currentUser?.profile?.email) return false

        // Si es admin, ve a todos los clientes excepto a sí mismo

        // Si es admin regular: Solo ve a clientes regulares
        if (currentUser?.status?.role === 'ADMIN') {
          return user.status?.role !== 'ADMIN' && user.profile?.email !== 'admin@admin.com'
        }

        return false
      })

      // Aplicar filtro de búsqueda si existe
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase()
        filteredUsers = filteredUsers.filter(
          user =>
            (`${user.profile?.name} ${user.profile?.lastName}`.toLowerCase() || '').includes(search) ||
            (user.profile?.email?.toLowerCase() || '').includes(search) ||
            (user.status?.role?.toLowerCase() || '').includes(search) ||
            (user.profile?.username?.toLowerCase() || '').includes(search)
        )
      }

      return filteredUsers
    },
    [users]
  )

  const getUserStats = useCallback(() => {
    if (!users.length)
      return {
        total: 0,
        admins: 0,
        users: 0,
        verified: 0,
        unverified: 0
      }

    const stats = users.reduce(
      (acc, user) => {
        acc.total++

        if (user.status?.role === 'ADMIN') {
          acc.admins++
        } else {
          acc.users++
        }

        if (user.verified) {
          acc.verified++
        } else {
          acc.unverified++
        }

        return acc
      },
      {
        total: 0,
        admins: 0,
        users: 0,
        verified: 0,
        unverified: 0
      }
    )

    return stats
  }, [users])

  // ========================================
  // VALIDACIONES Y ESTADÍSTICAS DEL PERFIL PERSONAL
  // ========================================

  const getProfileStats = useCallback(() => {
    if (!profile) return null

    // Usar campos centralizados
    const requiredFields = USER_PROFILE_REQUIRED_FIELDS
    const optionalFields = USER_PROFILE_OPTIONAL_FIELDS

    // Contar campos requeridos completados
    const requiredComplete = requiredFields.filter(field => {
      const value = profile[field]
      return isSpecialField(field, value)
    }).length

    // Contar campos opcionales completados
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

  const isProfileComplete = useCallback(() => {
    if (!profile) return false
    const stats = getProfileStats()
    return stats ? stats.completionPercentage >= 80 : false
  }, [profile, getProfileStats])

  const needsProfileCompletion = useCallback(() => {
    if (!profile) return true
    // Priorizar el valor del backend si está disponible
    if (profile.profileComplete !== undefined) {
      return !profile.profileComplete
    }
    // Fallback al cálculo local si no hay valor del backend
    return !isProfileComplete()
  }, [profile, isProfileComplete])

  const getProfileCompleteness = useCallback(() => {
    const stats = getProfileStats()
    return stats?.completionPercentage || 0
  }, [getProfileStats])

  // ========================================
  // SUGERENCIAS DE PERFILES
  // ========================================

  const fetchUserSuggestions = useCallback(
    async (page = 0, size = 4, showNotifications = false) => {
      // Verificar si ya hay una petición en curso
      if (isFetchingSuggestions) {
        console.log('🔄 Ya hay una petición de sugerencias en curso, saltando...')
        return {
          success: false,
          message: 'Petición en curso',
          data: null
        }
      }

      // Verificar si estamos en rate limit
      if (rateLimitedUntil && Date.now() < rateLimitedUntil) {
        console.log('⏳ Aún en rate limit, saltando petición')
        return {
          success: false,
          message: 'Rate limit activo',
          data: null
        }
      }

      setIsFetchingSuggestions(true)

      try {
        const result = await withLoading(async () => {
          console.log('💖 Obteniendo sugerencias de perfiles', { page, size })
          const response = await userService.getUserSuggestions(page, size)

          console.log('🔍 useUser: Raw suggestions response:', response)
          console.log('🔍 useUser: Response type:', typeof response)

          // Manejar respuesta paginada del backend
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
            console.log('✅ Sugerencias de perfiles obtenidas exitosamente', {
              suggestions: response.content.length,
              totalElements: response.totalElements
            })
            return response.content
          } else {
            // Fallback para respuesta no paginada
            setSuggestions(response)
            setSuggestionsPagination({
              page: 0,
              size: response.length,
              totalPages: 1,
              totalElements: response.length,
              hasNext: false,
              hasPrevious: false
            })
            console.log('✅ Sugerencias de perfiles obtenidas exitosamente (no paginada)')
            return response
          }
        }, 'obtener sugerencias de perfiles')

        // Si hay error de rate limit, establecer un timeout
        if (!result.success && result.message === 'RATE_LIMIT_EXCEEDED') {
          const rateLimitTimeout = Date.now() + 60000 // 1 minuto
          setRateLimitedUntil(rateLimitTimeout)
          console.log('🛑 Rate limit detectado, pausando peticiones por 1 minuto')
        }

        if (showNotifications) {
          return handleApiResponse(result, 'Sugerencias cargadas correctamente.', { showNotifications: true })
        }

        return result
      } finally {
        setIsFetchingSuggestions(false)
      }
    },
    [withLoading, handleApiResponse, rateLimitedUntil, isFetchingSuggestions]
  )

  const refreshSuggestions = useCallback(
    async (page, size) => {
      return await fetchUserSuggestions(page, size, false)
    },
    [fetchUserSuggestions]
  )

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    submitting,
    user,

    // Métodos principales (perfil personal)
    completeUser,
    updateUser,
    updateUserProfile,
    fetchProfile,
    uploadProfileImage,
    updateUserPreferences,

    // Funciones de seguridad
    changePassword,
    enable2FA,
    disable2FA,
    deleteUserAccount,
    exportUserData,

    // Validaciones y estadísticas (perfil personal)
    getProfileStats,
    getProfileCompleteness,
    isProfileComplete,
    needsProfileCompletion,

    // Gestión de múltiples usuarios (administración)
    users,
    usersPagination,
    fetchUsers,
    getUserByEmail,
    createUser,
    updateUserAdmin,
    assignAdminRole,
    revokeAdminRole,
    deleteUser,
    refreshUsers,
    filterUsers,
    getUserStats,
    setUsers,

    // Sugerencias de perfiles para matching
    suggestions,
    suggestionsPagination,
    fetchUserSuggestions,
    refreshSuggestions
  }
}

export default useUser
