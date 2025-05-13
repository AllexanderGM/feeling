import { useState, useEffect, useRef } from 'react'
import { useCookies } from 'react-cookie'
import AuthContext from '@context/AuthContext'
import authService from '@services/authService'
import useError from '@hooks/useError'
import { COOKIE_OPTIONS } from '@config/config'

const AuthProvider = ({ children }) => {
  const { handleError } = useError()
  const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token', 'user'])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const cookieHandlerInitialized = useRef(false)

  // Inicializar cookie handler
  useEffect(() => {
    if (!cookieHandlerInitialized.current) {
      const cookieHandler = {
        get: name => cookies[name],
        set: (name, value, options) => setCookie(name, value, options || COOKIE_OPTIONS),
        remove: (name, options) => removeCookie(name, options || { path: '/' })
      }

      authService.setCookieHandler(cookieHandler)
      cookieHandlerInitialized.current = true
    }
  }, [cookies, setCookie, removeCookie])

  // Inicializar estado de autenticación después de configurar el cookie handler
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      if (!authService.hasCookieHandler()) {
        return
      }

      try {
        const currentUser = await authService.getCurrentUser()
        if (isMounted && currentUser) {
          setUser(currentUser)
        }
      } catch (err) {
        handleError(`Error al inicializar la autenticación: ${err}`)
      } finally {
        if (isMounted) {
          setLoading(false)
          setIsInitialized(true)
        }
      }
    }

    if (cookieHandlerInitialized.current) {
      initAuth()
    }

    return () => {
      isMounted = false
    }
  }, [cookieHandlerInitialized.current])

  const executeAuthAction = async (actionFn, ...args) => {
    setLoading(true)
    try {
      const boundAction = typeof actionFn === 'function' ? (...params) => actionFn.apply(authService, params) : actionFn

      const result = await boundAction(...args)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en acción de autenticación:', err)

      // Proporcionar información básica sobre el error para facilitar el manejo en componentes
      const errorInfo = {
        type: err.errorType || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido',
        status: err.response?.status,
        data: err.response?.data,
        fieldErrors: err.response?.data?.errors || {}
      }

      return { success: false, error: err, errorInfo }
    } finally {
      setLoading(false)
    }
  }

  // Login con email y contraseña
  const login = async (email, password) => {
    const result = await executeAuthAction(authService.login.bind(authService), email, password)
    if (result.success && result.data.user) setUser(result.data.user)
    return result
  }

  // Registro de usuario
  const register = async userData => await executeAuthAction(authService.register.bind(authService), userData)

  // Login con Google
  const loginWithGoogle = async tokenResponse => {
    const result = await executeAuthAction(authService.loginWithGoogle.bind(authService), tokenResponse)
    if (result.success && result.data.user) setUser(result.data.user)
    return result
  }

  // Cerrar sesión
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Recuperar contraseña
  const forgotPassword = async email => await executeAuthAction(authService.forgotPassword.bind(authService), email)

  // Restablecer contraseña
  const resetPassword = async (token, newPassword) =>
    await executeAuthAction(authService.resetPassword.bind(authService), token, newPassword)

  // Actualizar perfil
  const updateProfile = async userData => {
    const result = await executeAuthAction(authService.updateProfile.bind(authService), userData)
    if (result.success) setUser(prev => ({ ...(prev || {}), ...result.data }))
    return result
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isInitialized,
    login,
    register,
    loginWithGoogle,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
