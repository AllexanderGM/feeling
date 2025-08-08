import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useCookies } from '@hooks'
import { registerAuthCallbacks } from '@services'
import { getDefaultValuesForUser } from '@schemas'
import { COOKIE_KEYS } from '@constants/cookieKeys'
import { Logger } from '@utils/logger.js'

/**
 * Crear estructura de usuario usando los esquemas
 * Combina los datos del usuario con la estructura por defecto
 *
 * @param {Object} userData - Datos del usuario
 * @returns {Object|null} - Estructura de usuario completa o null
 */
const createUserStructure = (userData = {}) => {
  if (!userData) return null

  const userStructure = getDefaultValuesForUser(userData)

  userStructure._metadata = {
    lastLogin: new Date().toISOString(),
    loginCount: (userData._metadata?.loginCount || 0) + 1,
    lastSyncWithServer: new Date().toISOString(),
    ...userData._metadata
  }

  return userStructure
}

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Usar el hook de cookies
  const cookieHandler = useCookies()

  // Estados del usuario obtenido de cookies al inicializar
  const [user, setUser] = useState(() => {
    const userCookie = cookieHandler.get(COOKIE_KEYS.USER)
    return userCookie ? createUserStructure(userCookie) : null
  })

  // Estados de tokens obtenidos de cookies al inicializar
  const [accessToken, setAccessToken] = useState(() => {
    return cookieHandler.get(COOKIE_KEYS.ACCESS_TOKEN) || null
  })

  const [refreshToken, setRefreshToken] = useState(() => {
    return cookieHandler.get(COOKIE_KEYS.REFRESH_TOKEN) || null
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
        cookieHandler.remove(COOKIE_KEYS.ACCESS_TOKEN)
        return null
      }

      setAccessToken(token)
      cookieHandler.set(COOKIE_KEYS.ACCESS_TOKEN, token)
      return token
    },
    [cookieHandler]
  )

  const updateRefreshToken = useCallback(
    token => {
      if (!token) {
        setRefreshToken(null)
        cookieHandler.remove(COOKIE_KEYS.REFRESH_TOKEN)
        return null
      }

      setRefreshToken(token)
      cookieHandler.set(COOKIE_KEYS.REFRESH_TOKEN, token)
      return token
    },
    [cookieHandler]
  )

  const clearTokens = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    cookieHandler.remove(COOKIE_KEYS.ACCESS_TOKEN)
    cookieHandler.remove(COOKIE_KEYS.REFRESH_TOKEN)
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

  // ========================================
  // MÉTODOS DE GESTIÓN DEL USUARIO
  // ========================================

  const updateUser = useCallback(
    userData => {
      if (!userData) {
        setUser(null)
        cookieHandler.remove(COOKIE_KEYS.USER)
        return null
      }

      // Crear estructura combinando usuario actual con datos nuevos
      const combinedData = {
        ...user,
        ...userData,
        _metadata: {
          ...(user?._metadata || {}),
          ...(userData._metadata || {}),
          lastUpdated: new Date().toISOString()
        }
      }

      // Usar createUserStructure que ya utiliza los esquemas
      const updatedUser = createUserStructure(combinedData)

      setUser(updatedUser)
      cookieHandler.set(COOKIE_KEYS.USER, updatedUser)

      return updatedUser
    },
    [user, cookieHandler]
  )

  const updateUserField = useCallback(
    (section, field, value) => {
      if (!user) return null

      // Actualizar campo específico en la sección correspondiente
      const updatedUser = {
        ...user,
        [section]: {
          ...user[section],
          [field]: value
        },
        _metadata: {
          ...user._metadata,
          lastUpdated: new Date().toISOString()
        }
      }

      setUser(updatedUser)
      cookieHandler.set(COOKIE_KEYS.USER, updatedUser)
      return updatedUser
    },
    [user, cookieHandler]
  )

  const updateUserFields = useCallback(
    fields => {
      if (!user) return null

      // Crear estructura combinando usuario actual con campos nuevos
      const combinedData = {
        ...user,
        ...fields,
        _metadata: {
          ...(user._metadata || {}),
          ...(fields._metadata || {}),
          lastUpdated: new Date().toISOString()
        }
      }

      // Usar createUserStructure que ya utiliza los esquemas
      const updatedUser = createUserStructure(combinedData)

      setUser(updatedUser)
      cookieHandler.set(COOKIE_KEYS.USER, updatedUser)
      return updatedUser
    },
    [user, cookieHandler]
  )

  // ========================================
  // MÉTODOS ESPECÍFICOS POR SECCIÓN DE USUARIO
  // ========================================

  const updateUserStatus = useCallback(
    statusData => {
      if (!user) return null
      return updateUserFields({ status: statusData })
    },
    [user, updateUserFields]
  )

  const updateUserProfile = useCallback(
    profileData => {
      if (!user) return null
      return updateUserFields({ profile: profileData })
    },
    [user, updateUserFields]
  )

  const updateUserMetrics = useCallback(
    metricsData => {
      if (!user) return null
      return updateUserFields({ metrics: metricsData })
    },
    [user, updateUserFields]
  )

  const updateUserPrivacy = useCallback(
    privacyData => {
      if (!user) return null
      return updateUserFields({ privacy: privacyData })
    },
    [user, updateUserFields]
  )

  const updateUserNotifications = useCallback(
    notificationsData => {
      if (!user) return null
      return updateUserFields({ notifications: notificationsData })
    },
    [user, updateUserFields]
  )

  const updateUserAuth = useCallback(
    authData => {
      if (!user) return null
      return updateUserFields({ auth: authData })
    },
    [user, updateUserFields]
  )

  const updateUserAccount = useCallback(
    accountData => {
      if (!user) return null
      return updateUserFields({ account: accountData })
    },
    [user, updateUserFields]
  )

  const updateUserMetadata = useCallback(
    metadataData => {
      if (!user) return null
      return updateUserFields({ _metadata: metadataData })
    },
    [user, updateUserFields]
  )

  // Método para actualizar múltiples secciones a la vez
  const updateUserSections = useCallback(
    sectionsData => {
      if (!user) return null
      return updateUserFields(sectionsData)
    },
    [user, updateUserFields]
  )

  // Método de compatibilidad con componentes existentes (auto-organiza campos)
  const updateUserProfileLegacy = useCallback(
    profileData => {
      if (!user) return null

      // Organizar datos según la nueva estructura
      const organizedData = {}

      Object.keys(profileData).forEach(key => {
        // Determinar en qué sección va cada campo
        if (
          [
            'showAge',
            'showLocation',
            'showPhone',
            'publicAccount',
            'searchVisibility',
            'locationPublic',
            'showMeInSearch',
            'allowNotifications'
          ].includes(key)
        ) {
          if (!organizedData.privacy) organizedData.privacy = {}
          organizedData.privacy[key] = profileData[key]
        } else if (key.startsWith('notifications')) {
          if (!organizedData.notifications) organizedData.notifications = {}
          organizedData.notifications[key] = profileData[key]
        } else if (['verified', 'profileComplete', 'approved', 'role', 'availableAttempts'].includes(key)) {
          if (!organizedData.status) organizedData.status = {}
          organizedData.status[key] = profileData[key]
        } else if (['profileViews', 'likesReceived', 'matchesCount', 'popularityScore'].includes(key)) {
          if (!organizedData.metrics) organizedData.metrics = {}
          organizedData.metrics[key] = profileData[key]
        } else {
          // Todo lo demás va a profile
          if (!organizedData.profile) organizedData.profile = {}
          organizedData.profile[key] = profileData[key]
        }
      })

      return updateUserFields(organizedData)
    },
    [user, updateUserFields]
  )

  const clearUser = useCallback(() => {
    setUser(null)
    cookieHandler.remove(COOKIE_KEYS.USER)
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
    const handleAuthError = event => {
      // Verificar si realmente necesitamos limpiar todo
      // Si ya no tenemos tokens, no hacer nada más
      if (!accessToken && !refreshToken) {
        return
      }

      Logger.info(Logger.CATEGORIES.AUTH, 'clearAuth', 'Limpiando autenticación por error de sesión')
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
  // RENOVACIÓN AUTOMÁTICA DE TOKEN
  // ========================================

  // Función para verificar si el token está por expirar
  const isTokenExpiringSoon = useCallback((token, minutesBeforeExpiry = 5) => {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      const timeLeft = payload.exp - now
      return timeLeft < minutesBeforeExpiry * 60
    } catch (error) {
      Logger.warn(Logger.CATEGORIES.AUTH, 'tokenExpiration', 'Error al verificar expiración del token', { error })
      return true
    }
  }, [])

  // Función para renovar el token automáticamente
  const renewTokenIfNeeded = useCallback(async () => {
    if (!accessToken || !refreshToken) return false

    if (isTokenExpiringSoon(accessToken)) {
      try {
        // Usar directamente api para evitar dependencias circulares
        const response = await fetch(`${import.meta.env.VITE_URL_BACK || 'http://localhost:8081'}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        })

        if (response.ok) {
          const data = await response.json()
          const accessToken = data.accessToken || data.token
          const refreshTokenNew = data.refreshToken

          if (accessToken) {
            updateAccessToken(accessToken)
            // Si el backend retorna un nuevo refresh token, actualizarlo también
            if (refreshTokenNew) {
              updateRefreshToken(refreshTokenNew)
            }
            return true
          }
        } else {
          if (response.status === 401) {
            clearAllAuth()
          }
        }
      } catch (error) {
        clearAllAuth()
      }
    }
    return false
  }, [accessToken, refreshToken, isTokenExpiringSoon, updateAccessToken, clearAllAuth])

  // Effect para configurar renovación automática del token
  useEffect(() => {
    if (!accessToken || !refreshToken) return

    // Verificar inmediatamente si necesita renovación
    renewTokenIfNeeded()

    // Configurar interval para verificar cada 4 minutos
    const interval = setInterval(renewTokenIfNeeded, 4 * 60 * 1000)

    return () => clearInterval(interval)
  }, [accessToken, refreshToken, renewTokenIfNeeded])

  // ========================================
  // SINCRONIZACIÓN CON COOKIES
  // ========================================

  // Ejecutar al iniciar el contexto
  useEffect(() => {
    const initializeAuth = () => {
      const userCookie = cookieHandler.get(COOKIE_KEYS.USER)
      const accessTokenCookie = cookieHandler.get(COOKIE_KEYS.ACCESS_TOKEN)
      const refreshTokenCookie = cookieHandler.get(COOKIE_KEYS.REFRESH_TOKEN)

      // Verificación más robusta del usuario
      if (userCookie && (userCookie.email || userCookie.profile?.email)) {
        setUser(createUserStructure(userCookie))
      } else {
        if (userCookie) {
          cookieHandler.remove(COOKIE_KEYS.USER)
        }
        setUser(null)
      }

      if (accessTokenCookie) {
        setAccessToken(accessTokenCookie)
      } else {
        cookieHandler.remove(COOKIE_KEYS.ACCESS_TOKEN)
        setAccessToken(null)
      }

      if (refreshTokenCookie) {
        setRefreshToken(refreshTokenCookie)
      } else {
        cookieHandler.remove(COOKIE_KEYS.REFRESH_TOKEN)
        setRefreshToken(null)
      }

      setLoading(false)
      setIsInitialized(true)
    }

    if (!isInitialized) {
      initializeAuth()
    }
  }, [isInitialized, cookieHandler])

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
      clearUser,

      // Métodos específicos por sección
      updateUserStatus,
      updateUserProfile,
      updateUserMetrics,
      updateUserPrivacy,
      updateUserNotifications,
      updateUserAuth,
      updateUserAccount,
      updateUserMetadata,
      updateUserSections,

      // Método de compatibilidad
      updateUserProfileLegacy,

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
        hasUser: cookieHandler.exists(COOKIE_KEYS.USER),
        hasAccessToken: cookieHandler.exists(COOKIE_KEYS.ACCESS_TOKEN),
        hasRefreshToken: cookieHandler.exists(COOKIE_KEYS.REFRESH_TOKEN)
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
      clearUser,

      // Métodos específicos por sección
      updateUserStatus,
      updateUserProfile,
      updateUserMetrics,
      updateUserPrivacy,
      updateUserNotifications,
      updateUserAuth,
      updateUserAccount,
      updateUserMetadata,
      updateUserSections,

      // Método de compatibilidad
      updateUserProfileLegacy,
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
