import { createContext, useState, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import authService from '@services/authService'
import { useNotification } from '@hooks/useNotification'
import { COOKIE_OPTIONS } from '@config/config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { showError } = useNotification()
  const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token', 'user'])

  const [user, setUser] = useState(() => {
    const userCookie = cookies.user
    if (userCookie && userCookie !== 'undefined') {
      try {
        return typeof userCookie === 'string' ? JSON.parse(userCookie) : userCookie
      } catch {
        return null
      }
    }
    return null
  })

  const [loading, setLoading] = useState(!user)
  const [isInitialized, setIsInitialized] = useState(false)

  // Cookie handler para authService
  const cookieHandler = useMemo(
    () => ({
      get: name => {
        const value = cookies[name]
        if (value === undefined || value === 'undefined' || value === null) return null

        if (name === 'user' && typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            return parsed && typeof parsed === 'object' ? parsed : null
          } catch {
            console.warn(`Cookie corrupta detectada: ${name}`)
            return null
          }
        }
        return value
      },
      set: (name, value, options) => {
        const valueToSave = typeof value === 'object' ? JSON.stringify(value) : value
        setCookie(name, valueToSave, options || COOKIE_OPTIONS)
      },
      remove: (name, options) => removeCookie(name, options || { path: '/' })
    }),
    [cookies, setCookie, removeCookie]
  )

  useEffect(() => {
    authService.setCookieHandler(cookieHandler)
  }, [cookieHandler])

  // Inicialización de autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userCookie = cookies.user
        if (userCookie && userCookie !== 'undefined') {
          const userData = typeof userCookie === 'string' ? JSON.parse(userCookie) : userCookie

          if (userData && typeof userData === 'object' && userData.email) {
            setUser(userData)
          } else {
            removeCookie('user', { path: '/' })
          }
        } else if (cookies.access_token) {
          const currentUser = await authService.getCurrentUser()
          if (currentUser) setUser(currentUser)
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err)

        // Limpiar cookies corruptas
        removeCookie('user', { path: '/' })
        removeCookie('access_token', { path: '/' })
        removeCookie('refresh_token', { path: '/' })

        showError('Error al inicializar la autenticación', 'Error de inicialización')
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    if (authService.hasCookieHandler()) {
      initAuth()
    }
  }, [cookies.user, cookies.access_token, removeCookie, showError])

  // Procesar autenticación exitosa
  const processSuccessfulAuth = userData => {
    const user = {
      image: userData.image || null,
      email: userData.email,
      name: userData.name || 'Usuario',
      lastName: userData.lastName || '',
      role: userData.role || 'user',
      verified: userData.verified || false,
      completeProfile: userData.completeProfile || false
    }

    setUser(user)

    if (!cookies.user || JSON.stringify(cookies.user) !== JSON.stringify(user)) {
      setCookie('user', JSON.stringify(user), COOKIE_OPTIONS)
    }

    return user
  }

  // Crear respuesta de error estandarizada
  const createErrorResponse = (err, operation) => {
    console.error(`Error en ${operation}:`, err)

    return {
      success: false,
      error: err,
      errorInfo: {
        type: err.errorType || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido',
        status: err.response?.status,
        data: err.response?.data,
        fieldErrors: err.response?.data?.errors || err.fieldErrors || {}
      }
    }
  }

  // Wrapper para métodos asíncronos
  const withLoading = async (asyncFn, operation) => {
    if (!authService) {
      return createErrorResponse(new Error('Servicio de autenticación no disponible'), operation)
    }

    setLoading(true)
    try {
      const result = await asyncFn()
      return { success: true, data: result }
    } catch (err) {
      return createErrorResponse(err, operation)
    } finally {
      setLoading(false)
    }
  }

  // === MÉTODOS DE AUTENTICACIÓN ===

  const register = async userData => {
    return withLoading(() => authService.register(userData), 'registro')
  }

  const login = async (email, password) => {
    const result = await withLoading(() => authService.login(email, password), 'login')
    if (result.success) {
      const userData = processSuccessfulAuth(result.data)
      result.user = userData
    }
    return result
  }

  const loginWithGoogle = async tokenResponse => {
    const result = await withLoading(() => authService.loginWithGoogle(tokenResponse), 'login con Google')
    if (result.success) {
      const userData = processSuccessfulAuth(result.data)
      result.user = userData
    }
    return result
  }

  const registerWithGoogle = async tokenResponse => {
    const result = await withLoading(() => authService.registerWithGoogle(tokenResponse), 'registro con Google')
    if (result.success) {
      const userData = processSuccessfulAuth({
        ...result.data,
        verified: true,
        profileComplete: false
      })
      result.user = userData
    }
    return result
  }

  const verifyEmailCode = async (email, code) => {
    return withLoading(() => authService.verifyEmailCode(email, code), 'verificación de código')
  }

  const resendVerificationCode = async email => {
    return withLoading(() => authService.resendVerificationCode(email), 'reenvío de código')
  }

  // === RECUPERACIÓN DE CONTRASEÑA ===

  const forgotPassword = async email => {
    return withLoading(() => authService.forgotPassword(email), 'recuperación de contraseña')
  }

  const validateResetToken = async token => {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return createErrorResponse(new Error('Token requerido'), 'validación de token')
    }

    try {
      const result = await authService.validateResetToken(token)
      return { success: true, data: result }
    } catch (err) {
      return createErrorResponse(err, 'validación de token de recuperación')
    }
  }

  const resetPassword = async (token, newPassword, confirmPassword = null) => {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return createErrorResponse(new Error('Token de recuperación requerido'), 'restablecimiento de contraseña')
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return createErrorResponse(new Error('La contraseña debe tener al menos 6 caracteres'), 'restablecimiento de contraseña')
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return createErrorResponse(new Error('Las contraseñas no coinciden'), 'restablecimiento de contraseña')
    }

    setLoading(true)

    try {
      const result = await authService.resetPassword(token, newPassword, confirmPassword)
      setUser(null) // Limpiar usuario por seguridad
      return { success: true, data: result }
    } catch (err) {
      let errorMessage = err.message || 'Error desconocido'

      if (err.response?.status === 400) {
        errorMessage = 'El enlace de recuperación es inválido o ha expirado'
      } else if (err.response?.status === 404) {
        errorMessage = 'Usuario no encontrado'
      } else if (err.message?.includes('token') || err.message?.includes('expirado')) {
        errorMessage = 'El enlace de recuperación ha expirado'
      }

      const errorWithMessage = new Error(errorMessage)
      errorWithMessage.response = err.response
      errorWithMessage.errorType = err.errorType

      return createErrorResponse(errorWithMessage, 'restablecimiento de contraseña')
    } finally {
      setLoading(false)
    }
  }

  // === OTROS MÉTODOS ===

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateProfile = async userData => {
    const result = await withLoading(() => authService.updateProfile(userData), 'actualización de perfil')
    if (result.success) {
      setUser(prev => ({ ...(prev || {}), ...result.data }))
    }
    return result
  }

  const checkEmailAvailability = async email => {
    try {
      const result = await authService.checkEmailAvailability(email)
      return { success: true, data: result }
    } catch (err) {
      return createErrorResponse(err, 'verificación de email')
    }
  }

  const checkAuthMethod = async email => {
    try {
      const result = await authService.checkAuthMethod(email)
      return { success: true, data: result }
    } catch (err) {
      return createErrorResponse(err, 'verificación de método')
    }
  }

  const value = {
    // Estados
    user,
    loading,
    isAuthenticated: !!user,
    isInitialized,

    // Autenticación principal
    register,
    login,
    loginWithGoogle,
    registerWithGoogle,
    logout,

    // Verificación
    verifyEmailCode,
    resendVerificationCode,

    // Recuperación de contraseña
    forgotPassword,
    resetPassword,
    validateResetToken,

    // Perfil y utilidades
    updateProfile,
    checkEmailAvailability,
    checkAuthMethod
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
