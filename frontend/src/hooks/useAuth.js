import { useContext, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '@context/AuthContext.jsx'
import authService from '@services/authService'
import { useError } from '@hooks/useError'
import useAsyncOperation from '@hooks/useAsyncOperation'

const useAuth = () => {
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
    updateUserPreferences,
    updateUserMetadata,
    clearUser,

    // Métodos de tokens
    updateAccessToken,
    updateRefreshToken,
    updateTokens,
    clearTokens,
    clearAllAuth
  } = context

  // Función para manejar redirección después del login
  const handlePostLoginRedirect = useCallback(() => {
    const redirectPath = localStorage.getItem('redirectAfterLogin')
    if (redirectPath && redirectPath !== '/login') {
      localStorage.removeItem('redirectAfterLogin')
      navigate(redirectPath, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [navigate])

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ========================================

  const register = useCallback(
    async (userData, showNotifications = true) => {
      const result = await withLoading(() => authService.register(userData), 'Registro')
      return handleApiResponse(result, '¡Registro exitoso! Revisa tu email para verificar tu cuenta.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const login = useCallback(
    async (email, password, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await authService.login(email, password)
        updateTokens(data.accessToken, data.refreshToken)
        updateUser(data)

        // Manejar redirección automática después del login exitoso
        setTimeout(() => {
          handlePostLoginRedirect()
        }, 100)

        return data
      }, 'Inicio de sesión')

      return handleApiResponse(result, '¡Inicio de sesión exitoso!', { showNotifications })
    },
    [withLoading, updateUser, updateTokens, handleApiResponse, handlePostLoginRedirect]
  )

  const loginWithGoogle = useCallback(
    async (tokenResponse, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await authService.loginWithGoogle(tokenResponse)
        updateTokens(data.accessToken, data.refreshToken)
        updateUser(data)

        // Manejar redirección automática después del login exitoso
        setTimeout(() => {
          handlePostLoginRedirect()
        }, 100)

        return data
      }, 'Inicio de sesión con Google')

      return handleApiResponse(result, '¡Inicio de sesión exitoso!', { showNotifications })
    },
    [withLoading, updateUser, handleApiResponse, updateTokens, handlePostLoginRedirect]
  )

  const registerWithGoogle = useCallback(
    async (tokenResponse, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await authService.registerWithGoogle(tokenResponse)
        updateTokens(data.accessToken, data.refreshToken)
        updateUser({
          ...data,
          verified: true,
          profileComplete: false
        })

        // Después del registro con Google, ir al completar perfil
        setTimeout(() => {
          navigate('/complete-profile', { replace: true })
        }, 100)

        return data
      }, 'Registro con Google')
      return handleApiResponse(result, '¡Registro exitoso con Google! Ya puedes usar todas las funcionalidades.', { showNotifications })
    },
    [withLoading, updateUser, handleApiResponse, updateTokens, navigate]
  )

  const verifyEmailCode = useCallback(
    async (email, code, showNotifications = true) => {
      const result = await withLoading(async () => await authService.verifyEmailCode(email, code), 'Verificación de email')
      return handleApiResponse(result, '¡Email verificado exitosamente! Ya puedes iniciar sesión.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const resendVerificationCode = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(() => authService.resendVerificationCode(email), 'Reenvío de código')
      return handleApiResponse(result, 'Código de verificación reenviado. Revisa tu email.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const forgotPassword = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(() => authService.forgotPassword(email), 'Recuperación de contraseña')
      return handleApiResponse(result, 'Enlace de recuperación enviado. Revisa tu email.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const resetPassword = useCallback(
    async (token, newPassword, confirmPassword, showNotifications = true) => {
      const result = await withLoading(
        () => authService.resetPassword(token, newPassword, confirmPassword),
        'Restablecimiento de contraseña'
      )
      if (result.success) clearAllAuth()
      return handleApiResponse(result, '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.', showNotifications)
    },
    [withLoading, handleApiResponse, clearAllAuth]
  )

  const validateResetToken = useCallback(
    async (token, showNotifications = false) => {
      const result = await withLoading(() => authService.validateResetToken(token), 'Validación de token de acceso')
      return handleApiResponse(result, 'Token válido', showNotifications)
    },
    [withLoading, handleApiResponse]
  )

  const refreshTokens = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        const data = await authService.refreshToken(refreshToken)
        if (data.success) {
          updateAccessToken(data.accessToken)
        } else {
          // Si falla el refresh, limpiar todo y manejar como error de auth
          clearAllAuth()
          throw new Error('Session expired')
        }
        return data
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
          console.warn('Error al hacer logout en el servidor:', error.message)
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

  const isTokenExpiringSoon = useCallback(() => {
    if (!accessToken) return true

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const now = Date.now() / 1000
      const timeLeft = payload.exp - now

      return timeLeft < 300 // 5 minutos
    } catch (error) {
      console.warn('⚠️ Error al verificar expiración del token:', error.message)
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

    // Métodos con notificaciones automáticas
    register,
    login,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    verifyEmailCode,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    validateResetToken,

    // Métodos de gestión de tokens
    refreshTokens,
    isTokenExpiringSoon,
    // Métodos de actualización de tokens
    updateAccessToken,
    updateRefreshToken,
    updateTokens,
    clearTokens,

    // Métodos de usuario
    updateUser,
    updateUserField,
    updateUserFields,
    updateUserPreferences,
    updateUserMetadata,
    clearUser,
    clearAllAuth,

    // Método para manejo de redirección
    handlePostLoginRedirect,

    // Método para forzar limpieza de auth en caso de error
    handleAuthError
  }
}

export default useAuth
