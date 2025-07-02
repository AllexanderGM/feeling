import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useCookies } from '@hooks/useCookies'
import { registerAuthCallbacks } from '@services/api'

const AuthContext = createContext(null)

// Estructura completa del usuario
const createUserStructure = (userData = {}) => {
  // Convertir dateOfBirth array a Date
  let birthDate = null
  if (userData.dateOfBirth) {
    if (Array.isArray(userData.dateOfBirth) && userData.dateOfBirth.length >= 3) {
      const [year, month, day] = userData.dateOfBirth
      birthDate = new Date(year, month - 1, day)
    } else if (userData.dateOfBirth instanceof Date) {
      birthDate = userData.dateOfBirth
    } else if (typeof userData.dateOfBirth === 'string') {
      birthDate = new Date(userData.dateOfBirth)
    }
  }

  // Convertir timestamps del backend si vienen como arrays
  const convertTimestamp = timestamp => {
    if (Array.isArray(timestamp) && timestamp.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = timestamp
      return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000)).toISOString()
    }
    return timestamp ? new Date(timestamp).toISOString() : null
  }

  return {
    // DATOS BÁSICOS
    id: userData.id || null,
    name: userData.name || 'Usuario',
    lastName: userData.lastName || '',
    email: userData.email || '',
    verified: userData.verified || false,
    profileComplete: userData.profileComplete || false,
    createdAt: convertTimestamp(userData.createdAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    lastActive: convertTimestamp(userData.lastActive),
    role: userData.role || 'CLIENT',

    // DATOS PERSONALES BÁSICOS
    image: userData.images?.[0] || null,
    images: userData.images || [],
    document: userData.document || null,
    phone: userData.phone || null,
    dateOfBirth: birthDate,
    age: userData.age || null,
    description: userData.description || null,

    // UBICACIÓN GEOGRÁFICA
    country: userData.country || null,
    city: userData.city || null,
    department: userData.department || null,
    locality: userData.locality || null,

    // ATRIBUTOS PERSONALES
    categoryInterest: userData.categoryInterest || null,
    genderId: userData.genderId || null,
    maritalStatusId: userData.maritalStatusId || null,
    height: userData.height || null,
    eyeColorId: userData.eyeColorId || null,
    hairColorId: userData.hairColorId || null,
    bodyTypeId: userData.bodyTypeId || null,
    educationLevelId: userData.educationLevelId || null,
    profession: userData.profession || null,
    tags: userData.tags || [],

    // DATOS PARA SPIRIT
    church: userData.church || null,
    religionId: userData.religionId || null,
    spiritualMoments: userData.spiritualMoments || null,
    spiritualPractices: userData.spiritualPractices || null,

    // DATOS PARA ROUSE
    sexualRoleId: userData.sexualRoleId || null,
    relationshipTypeId: userData.relationshipTypeId || null,

    // PREFERENCIAS DE MATCHING
    agePreferenceMin: userData.agePreferenceMin || null,
    agePreferenceMax: userData.agePreferenceMax || null,
    locationPreferenceRadius: userData.locationPreferenceRadius || null,
    showMeInSearch: userData.showMeInSearch !== undefined ? userData.showMeInSearch : true,
    allowNotifications: userData.allowNotifications !== undefined ? userData.allowNotifications : true,

    // CONFIGURACIÓN DE PRIVACIDAD
    showAge: userData.showAge !== undefined ? userData.showAge : true,
    showLocation: userData.showLocation !== undefined ? userData.showLocation : true,
    showPhone: userData.showPhone !== undefined ? userData.showPhone : false,

    // MÉTRICAS SOCIALES Y GAMIFICACIÓN
    profileViews: userData.profileViews || 0,
    likesReceived: userData.likesReceived || 0,
    matchesCount: userData.matchesCount || 0,
    popularityScore: userData.popularityScore || 0.0,

    // SISTEMA DE INTENTOS/PINES
    availableAttempts: userData.availableAttempts || 0,
    totalAttemptsPurchased: userData.totalAttemptsPurchased || 0,
    attemptsExpiryDate: convertTimestamp(userData.attemptsExpiryDate),

    // AUTENTICACIÓN MÚLTIPLE
    userAuthProvider: userData.userAuthProvider || 'LOCAL',
    externalId: userData.externalId || null,
    externalAvatarUrl: userData.externalAvatarUrl || null,
    lastExternalSync: convertTimestamp(userData.lastExternalSync),

    // PREFERENCIAS LOCALES DEL FRONTEND
    preferences: {
      language: userData.preferences?.language || 'es',
      theme: userData.preferences?.theme || 'light',
      notifications: userData.preferences?.notifications !== undefined ? userData.preferences.notifications : userData.allowNotifications,
      newsletter: userData.preferences?.newsletter || false,
      ...userData.preferences
    },

    // METADATOS LOCALES DEL FRONTEND
    metadata: {
      lastLogin: userData.metadata?.lastLogin || convertTimestamp(userData.lastActive),
      loginCount: userData.metadata?.loginCount || 0,
      accountCreated: userData.metadata?.accountCreated || convertTimestamp(userData.createdAt),
      profileCompleteness: userData.metadata?.profileCompleteness || 0,
      lastSyncWithServer: new Date().toISOString(),
      ...userData.metadata
    }
  }
}

export const AuthProvider = ({ children }) => {
  // Usar el hook de cookies
  const cookieHandler = useCookies()

  // Estados del usuario obtenido de cookies al inicializar
  const [user, setUser] = useState(() => {
    const userCookie = cookieHandler.get('user')
    return userCookie ? createUserStructure(userCookie) : null
  })

  // Estados de tokens obtenidos de cookies al inicializar
  const [accessToken, setAccessToken] = useState(() => {
    return cookieHandler.get('access_token') || null
  })

  const [refreshToken, setRefreshToken] = useState(() => {
    return cookieHandler.get('refresh_token') || null
  })

  const [loading, setLoading] = useState(!user)
  const [isInitialized, setIsInitialized] = useState(false)

  // ========================================
  // MÉTODOS DE GESTIÓN DE TOKENS
  // ========================================

  const updateAccessToken = useCallback(
    token => {
      if (!token) {
        setAccessToken(null)
        cookieHandler.remove('access_token')
        return null
      }

      setAccessToken(token)
      cookieHandler.set('access_token', token)
      return token
    },
    [cookieHandler]
  )

  const updateRefreshToken = useCallback(
    token => {
      if (!token) {
        setRefreshToken(null)
        cookieHandler.remove('refresh_token')
        return null
      }

      setRefreshToken(token)
      cookieHandler.set('refresh_token', token)
      return token
    },
    [cookieHandler]
  )

  const clearTokens = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    cookieHandler.remove('access_token')
    cookieHandler.remove('refresh_token')
  }, [cookieHandler])

  const updateTokens = useCallback(
    (accessTokenValue, refreshTokenValue) => {
      if (!accessTokenValue && !refreshTokenValue) {
        clearTokens()
        return
      }

      updateAccessToken(accessTokenValue)
      updateRefreshToken(refreshTokenValue)
    },
    [updateAccessToken, updateRefreshToken, clearTokens]
  )

  // Calcular completitud del perfil
  const calculateProfileCompleteness = useCallback(userData => {
    const basicRequiredFields = ['name', 'lastName', 'email', 'phone', 'document', 'dateOfBirth', 'city', 'country']
    const categoryRequiredFields = ['categoryInterest']
    const profileFields = ['description', 'gender', 'images', 'profession']
    const optionalFields = ['department', 'locality', 'height', 'education', 'tags']

    const checkField = (field, value) => {
      if (field === 'dateOfBirth') {
        return value && (value instanceof Date || Array.isArray(value) || value.toString().trim() !== '')
      }
      if (field === 'tags') {
        return Array.isArray(value) && value.length > 0
      }
      if (field === 'images') {
        return Array.isArray(value) && value.length > 0
      }
      if (field === 'categoryInterest') {
        return value && value.toString().trim() !== ''
      }
      return value && value.toString().trim() !== ''
    }

    const basicCompleted = basicRequiredFields.filter(field => checkField(field, userData[field])).length
    const categoryCompleted = categoryRequiredFields.filter(field => checkField(field, userData[field])).length
    const profileCompleted = profileFields.filter(field => checkField(field, userData[field])).length
    const optionalCompleted = optionalFields.filter(field => checkField(field, userData[field])).length

    const basicScore = (basicCompleted / basicRequiredFields.length) * 50
    const categoryScore = (categoryCompleted / categoryRequiredFields.length) * 20
    const profileScore = (profileCompleted / profileFields.length) * 20
    const optionalScore = (optionalCompleted / optionalFields.length) * 10

    return Math.round(basicScore + categoryScore + profileScore + optionalScore)
  }, [])

  // ========================================
  // MÉTODOS DE GESTIÓN DEL USUARIO
  // ========================================

  const updateUser = useCallback(
    userData => {
      if (!userData) {
        setUser(null)
        cookieHandler.remove('user')
        return null
      }

      const updatedUser = createUserStructure({
        ...(user || {}),
        ...userData,
        metadata: {
          ...(user?.metadata || {}),
          ...userData.metadata,
          lastUpdated: new Date().toISOString()
        }
      })

      // Recalcular completitud del perfil
      const profileCompleteness = calculateProfileCompleteness(updatedUser)
      updatedUser.metadata.profileCompleteness = profileCompleteness
      updatedUser.profileComplete = userData.profileComplete !== undefined ? userData.profileComplete : profileCompleteness >= 80

      setUser(updatedUser)
      cookieHandler.set('user', updatedUser)

      return updatedUser
    },
    [user, cookieHandler, calculateProfileCompleteness]
  )

  const updateUserField = useCallback(
    (field, value) => {
      if (!user) return null

      const updatedUser = {
        ...user,
        [field]: value,
        metadata: {
          ...user.metadata,
          lastUpdated: new Date().toISOString()
        }
      }

      setUser(updatedUser)
      cookieHandler.set('user', updatedUser)
      return updatedUser
    },
    [user, cookieHandler]
  )

  const updateUserFields = useCallback(
    fields => {
      if (!user) return null

      const updatedUser = createUserStructure({
        ...user,
        ...fields,
        metadata: {
          ...user.metadata,
          ...fields.metadata,
          lastUpdated: new Date().toISOString()
        }
      })

      const profileCompleteness = calculateProfileCompleteness(updatedUser)
      updatedUser.metadata.profileCompleteness = profileCompleteness

      setUser(updatedUser)
      cookieHandler.set('user', updatedUser)
      return updatedUser
    },
    [user, cookieHandler, calculateProfileCompleteness]
  )

  const updateUserPreferences = useCallback(
    newPreferences => {
      if (!user) return null

      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...newPreferences
        },
        metadata: {
          ...user.metadata,
          lastUpdated: new Date().toISOString()
        }
      }

      setUser(updatedUser)
      cookieHandler.set('user', updatedUser)
      return updatedUser
    },
    [user, cookieHandler]
  )

  const updateUserMetadata = useCallback(
    newMetadata => {
      if (!user) return null

      const updatedUser = {
        ...user,
        metadata: {
          ...user.metadata,
          ...newMetadata,
          lastUpdated: new Date().toISOString()
        }
      }

      setUser(updatedUser)
      cookieHandler.set('user', updatedUser)
      return updatedUser
    },
    [user, cookieHandler]
  )

  const clearUser = useCallback(() => {
    setUser(null)
    cookieHandler.remove('user')
  }, [cookieHandler])

  const clearAllAuth = useCallback(() => {
    clearUser()
    clearTokens()
  }, [clearUser, clearTokens])

  // ========================================
  // INTEGRACIÓN CON API.JS
  // ========================================

  // Registrar callbacks para que api.js pueda actualizar el estado
  useEffect(() => {
    const callbacks = {
      updateAccessToken,
      updateRefreshToken,
      updateTokens,
      clearAllAuth,
      updateUser
    }

    // Registrar callbacks en api.js
    registerAuthCallbacks(callbacks)

    // Escuchar eventos de actualización de token
    const handleTokenUpdate = event => {
      const { token } = event.detail
      if (token) {
        updateAccessToken(token)
      }
    }

    // Escuchar eventos de error de autenticación
    const handleAuthError = () => {
      console.log('🔄 Evento de error de autenticación recibido en AuthContext')
      clearAllAuth()
    }

    window.addEventListener('tokenUpdated', handleTokenUpdate)
    window.addEventListener('authError', handleAuthError)

    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate)
      window.removeEventListener('authError', handleAuthError)
    }
  }, [updateAccessToken, updateRefreshToken, updateTokens, clearAllAuth, updateUser])

  // ========================================
  // SINCRONIZACIÓN CON COOKIES
  // ========================================

  // Ejecutar al iniciar el contexto
  useEffect(() => {
    const initializeAuth = () => {
      const userCookie = cookieHandler.get('user')
      const accessTokenCookie = cookieHandler.get('access_token')
      const refreshTokenCookie = cookieHandler.get('refresh_token')

      if (userCookie && userCookie.email) {
        setUser(createUserStructure(userCookie))
      } else {
        cookieHandler.remove('user')
        setUser(null)
      }

      if (accessTokenCookie) {
        setAccessToken(accessTokenCookie)
      } else {
        cookieHandler.remove('access_token')
        setAccessToken(null)
      }

      if (refreshTokenCookie) {
        setRefreshToken(refreshTokenCookie)
      } else {
        cookieHandler.remove('refresh_token')
        setRefreshToken(null)
      }

      setLoading(false)
      setIsInitialized(true)
    }

    if (cookieHandler.isInitialized && !isInitialized) {
      initializeAuth()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      // Estados básicos
      user,
      loading,
      isAuthenticated: !!(user && accessToken),
      isInitialized,

      // Estados de tokens
      accessToken,
      refreshToken,

      // Métodos de actualización de usuario
      updateUser,
      updateUserField,
      updateUserFields,
      updateUserPreferences,
      updateUserMetadata,
      clearUser,

      // Métodos de gestión de tokens
      updateAccessToken,
      updateRefreshToken,
      updateTokens,
      clearTokens,

      // Método de limpieza completa
      clearAllAuth,
      setLoading,

      // Acceso al cookieHandler para casos especiales
      cookieHandler,

      // Valores reactivos de cookies observadas
      allCookies: cookieHandler.allCookies,
      cookieStatus: {
        hasUser: cookieHandler.exists('user'),
        hasAccessToken: cookieHandler.exists('access_token'),
        hasRefreshToken: cookieHandler.exists('refresh_token')
      }
    }),
    [
      user,
      loading,
      isInitialized,
      accessToken,
      refreshToken,
      updateUser,
      updateUserField,
      updateUserFields,
      updateUserPreferences,
      updateUserMetadata,
      clearUser,
      updateAccessToken,
      updateRefreshToken,
      updateTokens,
      clearTokens,
      clearAllAuth,
      cookieHandler
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
