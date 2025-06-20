import { createContext, useState, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import authService from '@services/authService'
import useError from '@hooks/useError'
import { COOKIE_OPTIONS } from '@config/config'

// Crear el contexto
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { handleError } = useError()
  const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token', 'user'])
  const [user, setUser] = useState(() => {
    const userCookie = cookies.user
    if (userCookie) {
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

  // Crear cookieHandler con useMemo para que esté disponible inmediatamente
  const cookieHandler = useMemo(
    () => ({
      get: name => {
        const value = cookies[name]
        // Si es la cookie 'user' y es string, parsearlo
        if (name === 'user' && typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return value
          }
        }
        return value
      },
      set: (name, value, options) => {
        // Si es un objeto, convertir a string antes de guardar
        const valueToSave = typeof value === 'object' ? JSON.stringify(value) : value
        setCookie(name, valueToSave, options || COOKIE_OPTIONS)
      },
      remove: (name, options) => removeCookie(name, options || { path: '/' })
    }),
    [cookies, setCookie, removeCookie]
  )

  // Configurar authService inmediatamente cuando el cookieHandler esté listo
  useEffect(() => {
    authService.setCookieHandler(cookieHandler)
  }, [cookieHandler])

  // Inicializar usuario desde cookies al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Primero intentar obtener el usuario directamente de las cookies
        const userCookie = cookies.user
        if (userCookie) {
          const userData = typeof userCookie === 'string' ? JSON.parse(userCookie) : userCookie
          setUser(userData)
        } else if (cookies.access_token) {
          const currentUser = await authService.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          }
        }
      } catch (err) {
        console.error('❌ Error al inicializar autenticación:', err)
        handleError(`Error al inicializar la autenticación: ${err.message}`)
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    // Solo ejecutar cuando las cookies estén disponibles
    if (authService.hasCookieHandler()) {
      initAuth()
    }
  }, [cookies.user, cookies.access_token, handleError]) // Dependencias específicas

  // Registro de usuario
  const register = async userData => {
    console.log('🔄 Iniciando registro desde AuthProvider')

    if (!authService) {
      console.error('❌ authService no está disponible')
      return {
        success: false,
        error: new Error('Servicio de autenticación no disponible'),
        errorInfo: { message: 'Servicio no disponible' }
      }
    }

    if (typeof authService.register !== 'function') {
      console.error(
        '❌ authService.register no es una función. Métodos disponibles:',
        Object.getOwnPropertyNames(Object.getPrototypeOf(authService))
      )
      return {
        success: false,
        error: new Error('Método de registro no disponible'),
        errorInfo: { message: 'Método no disponible' }
      }
    }

    setLoading(true)
    try {
      console.log('🔄 Llamando a authService.register')
      const result = await authService.register(userData)
      console.log('✅ Registro exitoso:', result)
      return { success: true, data: result }
    } catch (err) {
      console.error('❌ Error en registro:', err)
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
    setLoading(true)
    try {
      const result = await authService.login(email, password)

      // Extraer datos del usuario de la respuesta
      const userData = {
        image: result.image || null,
        email: result.email,
        name: result.name || 'Usuario',
        lastName: result.lastName || '',
        role: result.role || 'user',
        verified: result.verified || false,
        completeProfile: result.completeProfile || false
      }

      setUser(userData)

      // Guardar en cookies - el authService ya debe manejar los tokens
      // Solo guardamos el usuario aquí si el authService no lo hace
      if (!cookies.user || JSON.stringify(cookies.user) !== JSON.stringify(userData)) {
        setCookie('user', JSON.stringify(userData), COOKIE_OPTIONS)
      }

      return { success: true, data: result }
    } catch (err) {
      console.error('Error en login:', err)
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

  // Login con Google
  const loginWithGoogle = async tokenResponse => {
    setLoading(true)
    try {
      const result = await authService.loginWithGoogle(tokenResponse)

      // Extraer datos del usuario de la respuesta
      const userData = {
        image: result.image || null,
        email: result.email,
        name: result.name || 'Usuario',
        lastName: result.lastName || '',
        role: result.role || 'user',
        token: result.token || null,
        verified: result.verified || false,
        completeProfile: result.completeProfile || false
      }

      setUser(userData)

      // Guardar usuario en cookies si no se guardó automáticamente
      if (!cookies.user || JSON.stringify(cookies.user) !== JSON.stringify(userData)) {
        setCookie('user', JSON.stringify(userData), COOKIE_OPTIONS)
      }

      return { success: true, data: result }
    } catch (err) {
      console.error('Error en login con Google:', err)
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

  // Registro con Google
  const registerWithGoogle = async tokenResponse => {
    setLoading(true)
    try {
      const result = await authService.registerWithGoogle(tokenResponse)

      // Para registro, establecer usuario inmediatamente ya que Google verifica el email
      const userData = {
        email: result.email,
        name: result.name,
        lastName: result.lastName,
        role: result.role,
        image: result.image,
        verified: true, // Google ya verificó el email
        profileComplete: false // Necesita completar perfil
      }
      setUser(userData)

      // Guardar en cookies
      setCookie('user', JSON.stringify(userData), COOKIE_OPTIONS)

      return { success: true, data: result }
    } catch (err) {
      console.error('Error en registro con Google:', err)
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

  // Verificar código de email
  const verifyEmailCode = async (email, code) => {
    setLoading(true)
    try {
      const result = await authService.verifyEmailCode(email, code)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en verificación de código:', err)
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

  // Reenviar código de verificación
  const resendVerificationCode = async email => {
    setLoading(true)
    try {
      const result = await authService.resendVerificationCode(email)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en reenvío de código:', err)
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

  // Cerrar sesión
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Recuperar contraseña
  const forgotPassword = async email => {
    setLoading(true)
    try {
      const result = await authService.forgotPassword(email)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en recuperación de contraseña:', err)
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

  // Restablecer contraseña
  const resetPassword = async (token, newPassword) => {
    setLoading(true)
    try {
      const result = await authService.resetPassword(token, newPassword)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en reset de contraseña:', err)
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

  // Actualizar perfil
  const updateProfile = async userData => {
    setLoading(true)
    try {
      const result = await authService.updateProfile(userData)
      setUser(prev => ({ ...(prev || {}), ...result }))
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en actualización de perfil:', err)
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

  // Verificar disponibilidad de email
  const checkEmailAvailability = async email => {
    try {
      const result = await authService.checkEmailAvailability(email)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en verificación de email:', err)
      const errorInfo = {
        type: err.errorType || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido',
        status: err.response?.status,
        data: err.response?.data,
        fieldErrors: err.response?.data?.errors || {}
      }
      return { success: false, error: err, errorInfo }
    }
  }

  // Verificar método de autenticación
  const checkAuthMethod = async email => {
    try {
      const result = await authService.checkAuthMethod(email)
      return { success: true, data: result }
    } catch (err) {
      console.error('Error en verificación de método:', err)
      const errorInfo = {
        type: err.errorType || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido',
        status: err.response?.status,
        data: err.response?.data,
        fieldErrors: err.response?.data?.errors || {}
      }
      return { success: false, error: err, errorInfo }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isInitialized,
    // Métodos de autenticación principales
    register,
    login,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    // Métodos de verificación
    verifyEmailCode,
    resendVerificationCode,
    // Métodos de recuperación de contraseña
    forgotPassword,
    resetPassword,
    // Métodos de perfil
    updateProfile,
    // Métodos de utilidad
    checkEmailAvailability,
    checkAuthMethod
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
