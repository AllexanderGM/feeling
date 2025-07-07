import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useCookies } from '@hooks/useCookies'
import { registerAuthCallbacks } from '@services/api'
import { USER_DEFAULT_VALUES, USER_REQUIRED_FIELDS, USER_OPTIONAL_FIELDS, isSpecialField } from '@constants/userSchema.js'

const AuthContext = createContext(null)

// Convertir timestamps del backend si vienen como arrays
const convertTimestamp = timestamp => {
  if (Array.isArray(timestamp) && timestamp.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = timestamp
    return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000)).toISOString()
  }
  return timestamp ? new Date(timestamp).toISOString() : null
}

// Convertir dateOfBirth array a Date string
const convertDateOfBirth = dateOfBirth => {
  if (!dateOfBirth) return null

  if (Array.isArray(dateOfBirth) && dateOfBirth.length >= 3) {
    const [year, month, day] = dateOfBirth
    return new Date(year, month - 1, day).toISOString().split('T')[0] // YYYY-MM-DD
  }

  if (dateOfBirth instanceof Date) {
    return dateOfBirth.toISOString().split('T')[0]
  }

  if (typeof dateOfBirth === 'string') {
    return new Date(dateOfBirth).toISOString().split('T')[0]
  }

  return null
}

// Estructura completa del usuario usando esquemas centralizados
const createUserStructure = (userData = {}) => {
  // Usar valores por defecto centralizados como base
  const baseStructure = { ...USER_DEFAULT_VALUES }

  // Mapear datos del usuario con manejo especial para campos específicos
  const mappedData = {
    ...baseStructure,
    ...userData,

    // Campos que requieren procesamiento especial
    birthDate: convertDateOfBirth(userData.dateOfBirth || userData.birthDate),
    // Priorizar imágenes subidas por el usuario sobre imagen externa (Google, etc.)
    image: userData.images?.[0] || userData.externalAvatarUrl || null,
    createdAt: convertTimestamp(userData.createdAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    lastActive: convertTimestamp(userData.lastActive),
    attemptsExpiryDate: convertTimestamp(userData.attemptsExpiryDate),
    lastExternalSync: convertTimestamp(userData.lastExternalSync),

    // Campos con valores por defecto específicos para AuthContext
    id: userData.id || null,
    name: userData.name || 'Usuario',
    email: userData.email || '',
    verified: userData.verified || false,
    profileComplete: userData.profileComplete || false,
    role: userData.role || 'CLIENT',
    age: userData.age || null,

    // Métricas sociales
    profileViews: userData.profileViews || 0,
    likesReceived: userData.likesReceived || 0,
    matchesCount: userData.matchesCount || 0,
    popularityScore: userData.popularityScore || 0.0,

    // Sistema de intentos
    availableAttempts: userData.availableAttempts || 0,
    totalAttemptsPurchased: userData.totalAttemptsPurchased || 0,

    // Autenticación
    userAuthProvider: userData.userAuthProvider || 'LOCAL',
    externalId: userData.externalId || null,
    externalAvatarUrl: userData.externalAvatarUrl || null,

    // Configuración adicional no incluida en esquemas base
    showPhone: userData.showPhone !== undefined ? userData.showPhone : false,

    // Preferencias locales del frontend
    preferences: {
      language: userData.preferences?.language || 'es',
      theme: userData.preferences?.theme || 'light',
      notifications:
        userData.preferences?.notifications !== undefined
          ? userData.preferences.notifications
          : userData.allowNotifications !== undefined
            ? userData.allowNotifications
            : true,
      newsletter: userData.preferences?.newsletter || false,
      ...userData.preferences
    },

    // Metadatos locales del frontend
    metadata: {
      lastLogin: userData.metadata?.lastLogin || convertTimestamp(userData.lastActive),
      loginCount: userData.metadata?.loginCount || 0,
      accountCreated: userData.metadata?.accountCreated || convertTimestamp(userData.createdAt),
      profileCompleteness: userData.metadata?.profileCompleteness || 0,
      lastSyncWithServer: new Date().toISOString(),
      ...userData.metadata
    }
  }

  return mappedData
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

  // Calcular completitud del perfil usando esquemas centralizados
  const calculateProfileCompleteness = useCallback(userData => {
    if (!userData) return 0

    // Usar campos centralizados
    const requiredFields = USER_REQUIRED_FIELDS
    const optionalFields = USER_OPTIONAL_FIELDS

    // Contar campos requeridos completados
    const requiredComplete = requiredFields.filter(field => {
      // Mapear birthDate a dateOfBirth para compatibilidad con backend
      const value = field === 'birthDate' ? userData.dateOfBirth || userData.birthDate : userData[field]
      return isSpecialField(field, value)
    }).length

    // Contar campos opcionales completados
    const optionalComplete = optionalFields.filter(field => {
      const value = userData[field]
      return isSpecialField(field, value)
    }).length

    const totalFields = requiredFields.length + optionalFields.length
    const completedFields = requiredComplete + optionalComplete

    return Math.round((completedFields / totalFields) * 100)
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

      // Usar profileComplete del backend si está disponible, sino calcular localmente
      const profileCompleteness = calculateProfileCompleteness(updatedUser)
      updatedUser.metadata.profileCompleteness = profileCompleteness
      // Priorizar el valor del backend, solo calcular localmente si no viene del servidor
      if (userData.profileComplete !== undefined) {
        updatedUser.profileComplete = userData.profileComplete
      } else {
        updatedUser.profileComplete = profileCompleteness >= 80
      }

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
