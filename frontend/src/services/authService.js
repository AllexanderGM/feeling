import api from '@services/api'
import { COOKIE_OPTIONS } from '@config/config'

class AuthService {
  constructor() {
    this.cookieHandler = null
  }

  // Configurar el manejador de cookies
  setCookieHandler(handler) {
    this.cookieHandler = handler
  }

  // Verificar si tiene manejador de cookies
  hasCookieHandler() {
    return this.cookieHandler !== null
  }

  // Métodos auxiliares para cookies
  getToken() {
    return this.cookieHandler?.get('access_token') || localStorage.getItem('token')
  }

  getRefreshToken() {
    return this.cookieHandler?.get('refresh_token') || localStorage.getItem('refreshToken')
  }

  setTokens(accessToken, refreshToken) {
    if (this.cookieHandler) {
      this.cookieHandler.set('access_token', accessToken, COOKIE_OPTIONS)
      if (refreshToken) {
        this.cookieHandler.set('refresh_token', refreshToken, COOKIE_OPTIONS)
      }
    } else {
      localStorage.setItem('token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
    }
  }

  setUser(userData) {
    if (this.cookieHandler) {
      this.cookieHandler.set('user', userData, COOKIE_OPTIONS)
    }
  }

  clearAuth() {
    if (this.cookieHandler) {
      this.cookieHandler.remove('access_token')
      this.cookieHandler.remove('refresh_token')
      this.cookieHandler.remove('user')
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ========================================

  /**
   * Registro de usuario
   */
  async register(userData) {
    try {
      console.log('🔄 Enviando solicitud de registro a:', '/auth/register')
      console.log('📤 Datos a enviar:', {
        ...userData,
        password: '***oculta***'
      })

      const response = await api.post('/auth/register', userData)

      console.log('✅ Respuesta del servidor:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error en registro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // Crear error estructurado
      const structuredError = new Error(error.response?.data?.message || error.message || 'Error en el registro')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'REGISTRATION_ERROR'

      throw structuredError
    }
  }

  /**
   * Login con email y contraseña
   */
  async login(email, password) {
    try {
      console.log('🔄 Enviando solicitud de login a:', '/auth/login')

      const response = await api.post('/auth/login', {
        email,
        password
      })

      const { accessToken, refreshToken, image, email: userEmail, name, lastName, role, verified, completeProfile } = response.data

      const user = {
        image,
        email: userEmail,
        name,
        lastName,
        role,
        verified,
        completeProfile
      }

      // Guardar tokens y usuario
      this.setTokens(accessToken, refreshToken)
      this.setUser(user)

      console.log('✅ Login exitoso para:', user.email)
      return response.data
    } catch (error) {
      console.error('❌ Error en login:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error en el inicio de sesión')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'LOGIN_ERROR'

      throw structuredError
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(tokenResponse) {
    try {
      console.log('🔄 Iniciando login con Google')

      const response = await api.post('/auth/google/login', {
        accessToken: tokenResponse.access_token // CORREGIDO: usar accessToken
      })

      // CORREGIDO: Usar la estructura correcta del response
      const { accessToken, refreshToken, image, email: userEmail, name, lastName, role, verified, completeProfile } = response.data

      const user = {
        image,
        email: userEmail,
        name,
        lastName,
        role,
        verified,
        completeProfile
      }

      // Guardar tokens y usuario
      this.setTokens(accessToken, refreshToken)
      this.setUser(user)

      console.log('✅ Login con Google exitoso para:', user.email)
      return response.data
    } catch (error) {
      console.error('❌ Error en login con Google:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error en el login con Google')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'GOOGLE_LOGIN_ERROR'

      throw structuredError
    }
  }

  /**
   * Registro con Google
   */
  async registerWithGoogle(tokenResponse) {
    try {
      console.log('🔄 Iniciando registro con Google')

      const response = await api.post('/auth/google/register', {
        accessToken: tokenResponse.access_token // CORREGIDO: usar accessToken
      })

      // CORREGIDO: Usar la estructura correcta del response
      const { accessToken, refreshToken, image, email: userEmail, name, lastName, role, verified, completeProfile } = response.data

      const user = {
        image,
        email: userEmail,
        name,
        lastName,
        role,
        verified,
        completeProfile
      }

      // Guardar tokens y usuario
      this.setTokens(accessToken, refreshToken)
      this.setUser(user)

      console.log('✅ Registro con Google exitoso para:', user.email)
      return response.data
    } catch (error) {
      console.error('❌ Error en registro con Google:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error en el registro con Google')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'GOOGLE_REGISTER_ERROR'

      throw structuredError
    }
  }

  /**
   * Verificar código de email
   */
  async verifyEmailCode(email, code) {
    try {
      console.log('🔄 Verificando código de email para:', email)

      const response = await api.post('/auth/verify-email', {
        email: email.toLowerCase().trim(),
        code
      })

      // Si la verificación incluye tokens, guardarlos
      if (response.data.accessToken) {
        const { accessToken, refreshToken, image, email: userEmail, name, lastName, role, verified, completeProfile } = response.data

        const user = {
          image,
          email: userEmail,
          name,
          lastName,
          role,
          verified,
          completeProfile
        }

        this.setTokens(accessToken, refreshToken)
        this.setUser(user)
      }

      console.log('✅ Verificación de email exitosa')
      return response.data
    } catch (error) {
      console.error('❌ Error en verificación de email:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error en la verificación del código')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'EMAIL_VERIFICATION_ERROR'

      throw structuredError
    }
  }

  /**
   * Reenviar código de verificación
   */
  async resendVerificationCode(email) {
    try {
      console.log('🔄 Reenviando código de verificación para:', email)

      const response = await api.post('/auth/resend-verification', {
        email: email.toLowerCase().trim()
      })

      console.log('✅ Código de verificación reenviado')
      return response.data
    } catch (error) {
      console.error('❌ Error al reenviar código:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al reenviar el código de verificación')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'RESEND_CODE_ERROR'

      throw structuredError
    }
  }

  /**
   * Recuperar contraseña
   */
  async forgotPassword(email) {
    try {
      console.log('🔄 Enviando solicitud de recuperación de contraseña para:', email)

      const response = await api.post('/auth/forgot-password', {
        email: email.toLowerCase().trim()
      })

      console.log('✅ Solicitud de recuperación enviada')
      return response.data
    } catch (error) {
      console.error('❌ Error en recuperación de contraseña:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al solicitar recuperación de contraseña')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'FORGOT_PASSWORD_ERROR'

      throw structuredError
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('🔄 Restableciendo contraseña con token')

      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      })

      console.log('✅ Contraseña restablecida exitosamente')
      return response.data
    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al restablecer la contraseña')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'RESET_PASSWORD_ERROR'

      throw structuredError
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('No hay token de acceso')
      }

      console.log('🔄 Obteniendo usuario actual')

      const response = await api.get('/auth/me')

      console.log('✅ Usuario actual obtenido')
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // Si es 401, limpiar autenticación
      if (error.response?.status === 401) {
        this.clearAuth()
      }

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al obtener datos del usuario')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'GET_USER_ERROR'

      throw structuredError
    }
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(userData) {
    try {
      console.log('🔄 Actualizando perfil del usuario')

      const response = await api.put('/users/profile', userData)

      // Actualizar usuario en cookies
      this.setUser(response.data)

      console.log('✅ Perfil actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al actualizar el perfil')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'UPDATE_PROFILE_ERROR'

      throw structuredError
    }
  }

  /**
   * Verificar disponibilidad de email
   */
  async checkEmailAvailability(email) {
    try {
      console.log('🔄 Verificando disponibilidad del email:', email)

      const response = await api.get(`/auth/check-email/${encodeURIComponent(email.toLowerCase().trim())}`)

      console.log('✅ Verificación de email completada')
      return response.data
    } catch (error) {
      console.error('❌ Error al verificar email:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al verificar disponibilidad del email')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'EMAIL_CHECK_ERROR'

      throw structuredError
    }
  }

  /**
   * Verificar método de autenticación
   */
  async checkAuthMethod(email) {
    try {
      console.log('🔄 Verificando método de autenticación para:', email)

      const response = await api.get(`/auth/check-method/${encodeURIComponent(email.toLowerCase().trim())}`)

      console.log('✅ Verificación de método completada')
      return response.data
    } catch (error) {
      console.error('❌ Error al verificar método de autenticación:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al verificar método de autenticación')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'AUTH_METHOD_CHECK_ERROR'

      throw structuredError
    }
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No hay refresh token')
      }

      console.log('🔄 Renovando token de acceso')

      const response = await api.post('/auth/refresh-token', {
        refreshToken: refreshToken // CORREGIDO: usar refreshToken en el body
      })

      const { accessToken } = response.data

      // CORREGIDO: Solo actualizar access token, mantener refresh token
      this.setTokens(accessToken, refreshToken)

      console.log('✅ Token renovado exitosamente')
      return response.data
    } catch (error) {
      console.error('❌ Error al renovar token:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // Si falla el refresh, limpiar autenticación
      this.clearAuth()

      const structuredError = new Error(error.response?.data?.message || error.message || 'Error al renovar token de acceso')

      structuredError.response = error.response
      structuredError.errorType = error.response?.data?.type || 'REFRESH_TOKEN_ERROR'

      throw structuredError
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      const token = this.getToken()

      if (token) {
        console.log('🔄 Cerrando sesión en el servidor')

        // Intentar cerrar sesión en el servidor
        try {
          await api.post('/auth/logout')
          console.log('✅ Sesión cerrada en el servidor')
        } catch (error) {
          console.warn('⚠️ Error al cerrar sesión en el servidor:', error.message)
          // Continuar con logout local aunque falle el servidor
        }
      }

      // Limpiar autenticación local
      this.clearAuth()
      console.log('✅ Sesión cerrada localmente')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      // Siempre limpiar autenticación local aunque falle
      this.clearAuth()
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = this.getToken()
    const user = this.cookieHandler?.get('user')
    return !!(token && user)
  }

  /**
   * Obtener usuario desde cookies
   */
  getUserFromCookies() {
    return this.cookieHandler?.get('user') || null
  }

  /**
   * Verificar si el token está próximo a expirar
   */
  isTokenExpiringSoon() {
    const token = this.getToken()
    if (!token) return true

    try {
      // Decodificar JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      const timeLeft = payload.exp - now

      // Considerar que expira pronto si quedan menos de 5 minutos
      return timeLeft < 300
    } catch (error) {
      console.warn('⚠️ Error al verificar expiración del token:', error)
      return true
    }
  }
}

// Crear instancia única
const authService = new AuthService()

export default authService
