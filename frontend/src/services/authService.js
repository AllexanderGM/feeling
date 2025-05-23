import { API_URL, COOKIE_OPTIONS } from '@config/config'

class AuthService {
  constructor() {
    this.cookieHandler = null
    this.apiUrl = API_URL
  }

  setCookieHandler(cookieHandler) {
    this.cookieHandler = cookieHandler
  }

  hasCookieHandler() {
    return this.cookieHandler !== null
  }

  // Métodos principales de autenticación
  async login(email, password) {
    return this._request('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  }

  async register(userData) {
    return this._request('/auth/register', {
      method: 'POST',
      body: userData
    })
  }

  async loginWithGoogle(tokenResponse) {
    try {
      // Obtener datos del usuario de Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      })

      if (!userInfoResponse.ok) {
        throw new Error('Error al obtener la información del usuario de Google')
      }

      const userData = await userInfoResponse.json()

      // Enviar datos a nuestro backend
      const data = await this._request('/auth/google', {
        method: 'POST',
        body: {
          accessToken: tokenResponse.access_token,
          userData
        }
      })

      return data
    } catch (error) {
      console.error('Error en loginWithGoogle:', error)
      throw error
    }
  }

  logout() {
    if (!this.cookieHandler) {
      console.error('Cookie handler no inicializado')
      return
    }

    this.cookieHandler.remove('access_token', { path: '/' })
    this.cookieHandler.remove('refresh_token', { path: '/' })
    this.cookieHandler.remove('user', { path: '/' })

    if (typeof window !== 'undefined' && window.onLogout) {
      window.onLogout()
    }
  }

  async forgotPassword(email) {
    return this._request('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    })
  }

  async resetPassword(token, newPassword) {
    return this._request('/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password: newPassword
      }
    })
  }

  async verifyEmail(token) {
    return this._request('/auth/verify-email', {
      method: 'POST',
      body: { token }
    })
  }

  async updateProfile(userData) {
    const data = await this._request('/users/profile', {
      method: 'PUT',
      body: userData
    })

    // Actualizar usuario en cookies
    this._updateUserInCookies(data)

    return data
  }

  // Métodos auxiliares
  getCurrentUser() {
    if (!this.cookieHandler) {
      console.error('Cookie handler no inicializado')
      return null
    }

    return this.cookieHandler.get('user') || null
  }

  isAuthenticated() {
    if (!this.cookieHandler) {
      console.error('Cookie handler no inicializado')
      return false
    }

    return !!this.cookieHandler.get('access_token')
  }

  // Métodos privados
  async _request(endpoint, options = {}) {
    this._validateCookieHandler()

    const token = this.cookieHandler.get('access_token')
    const defaultHeaders = { 'Content-Type': 'application/json' }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, config)

      if (!response.ok) {
        // Manejar error 401 (token expirado)
        if (response.status === 401 && token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
          const refreshed = await this._refreshToken()
          if (refreshed) return this._retryRequestWithNewToken(endpoint, options)
        }

        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.message || response.statusText)
        error.response = {
          status: response.status,
          data: errorData
        }
        throw error
      }

      if (response.status !== 204) {
        const data = await response.json()

        // Manejar tokens y usuario en respuestas de autenticación
        if (data.accessToken || data.refreshToken || data.user) {
          this._handleAuthResponse(data)
        }

        return data
      }

      return null
    } catch (error) {
      // Formatear errores de red
      if (!error.response) {
        const networkError = new Error('No se pudo establecer conexión con el servidor')
        networkError.response = {
          status: 0,
          data: { message: 'Error de conexión' },
          errorType: 'NETWORK_ERROR' // Añadir tipos estandarizados
        }
        throw networkError
      }

      // Añadir información útil al error
      if (error.response) {
        // Categorizar tipos de errores comunes
        if (error.response.status === 401) {
          error.errorType = 'AUTHENTICATION_ERROR'
        } else if (error.response.status === 403) {
          error.errorType = 'AUTHORIZATION_ERROR'
        } else if (error.response.status === 400) {
          error.errorType = 'VALIDATION_ERROR'
        } else if (error.response.status === 404) {
          error.errorType = 'NOT_FOUND_ERROR'
        } else if (error.response.status >= 500) {
          error.errorType = 'SERVER_ERROR'
        }
      }

      throw error // Re-lanzar el error enriquecido
    }
  }

  async _refreshToken() {
    try {
      const refreshToken = this.cookieHandler.get('refresh_token')
      if (!refreshToken) return false

      this.cookieHandler.remove('access_token', { path: '/' })

      const response = await fetch(`${this.apiUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (!response.ok) {
        this.logout()
        return false
      }

      const data = await response.json()
      this.cookieHandler.set('access_token', data.accessToken, COOKIE_OPTIONS)
      return true
    } catch {
      this.logout()
      return false
    }
  }

  async _retryRequestWithNewToken(endpoint, options) {
    const newToken = this.cookieHandler.get('access_token')
    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`
    }

    return this._request(endpoint, {
      ...options,
      headers: newHeaders
    })
  }

  _handleAuthResponse(data) {
    const { accessToken, refreshToken, user } = data

    if (accessToken) {
      this.cookieHandler.set('access_token', accessToken, COOKIE_OPTIONS)
    }

    if (refreshToken) {
      this.cookieHandler.set('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 // 30 días
      })
    }

    if (user) {
      this.cookieHandler.set('user', user, COOKIE_OPTIONS)
    }
  }

  _updateUserInCookies(userData) {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      this.cookieHandler.set('user', updatedUser, COOKIE_OPTIONS)
    }
  }

  _validateCookieHandler() {
    if (!this.cookieHandler) {
      throw new Error('Cookie handler no inicializado. Asegúrate de llamar a setCookieHandler primero.')
    }
  }
}

export default new AuthService()
