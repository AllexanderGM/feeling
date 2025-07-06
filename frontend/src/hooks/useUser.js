import { useCallback, useState } from 'react'
import useAuth from '@hooks/useAuth'
import userService from '@services/userService.js'
import { useError } from '@hooks/useError'
import useAsyncOperation from '@hooks/useAsyncOperation'

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

  // ========================================
  // HELPERS INTERNOS
  // ========================================

  const formatFormDataToApi = useCallback(formData => {
    return {
      document: formData.document,
      phone: formData.phone,
      phoneCode: formData.phoneCode,
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
        setUsers(prevUsers => prevUsers.map(user => (user.email === email ? { ...user, ...updatedUser } : user)))

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
        setUsers(prevUsers => prevUsers.map(user => (user.email === email ? { ...user, ...updatedUser } : user)))

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
        setUsers(prevUsers => prevUsers.map(user => (user.email === email ? { ...user, ...updatedUser } : user)))

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
        setUsers(prevUsers => prevUsers.filter(user => user.email !== email))

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
        if (user.email === currentUser?.email) return false

        // Si es superadmin, ve a todos excepto a sí mismo
        if (currentUser?.isSuperAdmin) return true

        // Si es admin regular: Solo ve a clientes regulares
        if (currentUser?.isAdmin) {
          return user.role !== 'ADMIN' && user.email !== 'admin@admin.com'
        }

        return false
      })

      // Aplicar filtro de búsqueda si existe
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase()
        filteredUsers = filteredUsers.filter(
          user =>
            (`${user.name} ${user.lastName}`.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search) ||
            (user.role?.toLowerCase() || '').includes(search) ||
            (user.username?.toLowerCase() || '').includes(search)
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

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
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

    // Métodos principales (perfil personal)
    completeUser,
    updateUser,
    fetchProfile,
    uploadProfileImage,
    updateUserPreferences,

    // Validaciones y estadísticas (perfil personal)
    getProfileStats,
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

    // Utilidades
    formatFormDataToApi
  }
}

export default useUser
