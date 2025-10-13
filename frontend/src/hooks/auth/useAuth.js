import { useContext, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@services'
import { Logger } from '@utils/logger.js'
import AuthContext from '@context/AuthContext.jsx'
import { useError } from '@hooks/utils/useError.js'
import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'

/**
 * Hook de autenticación - AuthController
 * Gestiona registro, login, tokens y verificaciones de estado
 *
 * Para otras funcionalidades usar:
 * - useVerification() → Verificación de emails y códigos
 * - usePassword() → Gestión y recuperación de contraseñas
 * - useOAuth() → Autenticación con Google, Facebook, Apple
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  const navigate = useNavigate()

  // Pasar el contexto de auth al hook de error para usar clearAllAuth
  const { handleApiResponse, handleAuthError } = useError(context)

  // Hook centralizado para operaciones asíncronas con configuración estable
  const asyncOptions = useMemo(
    () => ({
      authContext: context,
      showNotifications: true,
      autoHandleAuth: true
    }),
    [context]
  )

  const { loading, withLoading } = useAsyncOperation(asyncOptions)

  if (!context) throw new Error('useAuth debe ser utilizado dentro de AuthProvider')

  const {
    // Estados principales
    user,
    isAuthenticated,
    isInitialized,
    accessToken,
    refreshToken,

    // Métodos de usuario
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

    // Métodos de tokens
    updateAccessToken,
    updateRefreshToken,
    updateTokens,
    clearTokens,
    clearAllAuth
  } = context

  // ========================================
  // REGISTRO Y LOGIN
  // ========================================

  const register = useCallback(
    async (userData, showNotifications = true) => {
      const result = await withLoading(() => authService.register(userData), 'Registro')

      if (result?.status === 422) return result
      if (result?.status === 409) return result

      return handleApiResponse(result, '¡Registro exitoso! Revisa tu email para verificar tu cuenta.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const login = useCallback(
    async (email, password, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await authService.login(email, password)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Inicio de sesión')

      return handleApiResponse(result, '¡Inicio de sesión exitoso!', { showNotifications })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  // ========================================
  // GESTIÓN DE TOKENS
  // ========================================

  const refreshTokens = useCallback(
    async (showNotifications = false) => {
      if (!refreshToken) {
        Logger.warn(Logger.CATEGORIES.AUTH, 'renovar tokens', 'No hay refresh token disponible')
        clearAllAuth()

        return { success: false, message: 'No hay refresh token disponible' }
      }

      const result = await withLoading(async () => {
        try {
          Logger.info(Logger.CATEGORIES.AUTH, 'renovar tokens', 'Iniciando renovación manual de token')
          const data = await authService.refreshToken(refreshToken)

          if (data.success && data.accessToken) {
            Logger.authSuccess('renovar tokens', null, { manual: true })
            updateAccessToken(data.accessToken)

            return data
          } else {
            Logger.authError('renovar tokens', new Error('Respuesta inválida del refresh token'), null)
            clearAllAuth()
            throw new Error('Sesión expirada')
          }
        } catch (error) {
          Logger.authError('renovar tokens', error)
          clearAllAuth()
          throw error
        }
      }, 'Renovación de token')

      return handleApiResponse(result, 'Token renovado correctamente', { showNotifications })
    },
    [withLoading, updateAccessToken, clearAllAuth, handleApiResponse, refreshToken]
  )

  const logout = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(async () => {
        try {
          // Intentar hacer logout en el servidor
          const data = await authService.logout(accessToken)

          return data
        } catch (error) {
          // Aunque falle el logout del servidor, limpiar localmente
          Logger.warn(Logger.CATEGORIES.AUTH, 'logout servidor', `Error al hacer logout en el servidor: ${error.message}`)

          return { success: true, message: 'Sesión cerrada localmente' }
        } finally {
          // Siempre limpiar el estado local
          clearAllAuth()

          // Limpiar cualquier redirección pendiente
          localStorage.removeItem('redirectAfterLogin')

          // Redirigir al login después del logout
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 100)
        }
      }, 'Cierre de sesión')

      return handleApiResponse(result, 'Sesión cerrada correctamente.', { showNotifications })
    },
    [withLoading, clearAllAuth, handleApiResponse, accessToken, navigate]
  )

  // ========================================
  // VERIFICACIONES Y UTILIDADES
  // ========================================

  const checkEmailAvailability = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => authService.checkEmailAvailability(email), 'Verificación de email')

      return handleApiResponse(result, 'Email verificado', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const checkAuthMethod = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => authService.checkAuthMethod(email), 'Verificación de método')

      return handleApiResponse(result, 'Método verificado', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getUserStatus = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => authService.getUserStatus(email), 'Estado del usuario')

      return handleApiResponse(result, 'Estado obtenido', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const isTokenExpiringSoon = useCallback(() => {
    if (!accessToken) return true

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const now = Date.now() / 1000
      const timeLeft = payload.exp - now

      return timeLeft < 300 // 5 minutos
    } catch (error) {
      Logger.warn(Logger.CATEGORIES.AUTH, 'verificar expiración token', `Error al verificar expiración: ${error.message}`)

      return true
    }
  }, [accessToken])

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados principales
    user,
    loading,
    isAuthenticated,
    isInitialized,

    // Estados de tokens
    accessToken,
    refreshToken,

    // Registro y Login
    register,
    login,
    logout,

    // Gestión de tokens
    refreshTokens,
    isTokenExpiringSoon,
    updateAccessToken,
    updateRefreshToken,
    updateTokens,
    clearTokens,

    // Verificaciones y estado
    checkEmailAvailability,
    checkAuthMethod,
    getUserStatus,

    // Métodos de usuario
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
    clearAllAuth,

    // Método para forzar limpieza de auth en caso de error
    handleAuthError
  }
}

export default useAuth
