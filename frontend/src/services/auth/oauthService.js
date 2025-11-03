import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes'
import { HTTP_STATUS } from '@schemas'

/**
 * Servicio de autenticación OAuth
 * Gestiona login y registro con proveedores externos (Google, Facebook, Apple)
 */
class OAuthService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // GOOGLE OAUTH
  // ========================================

  async registerWithGoogle(accessToken, tokenType = 'Bearer', scope = '') {
    const context = 'Registro con Google'

    try {
      const result = await ServiceREST.post(
        API_ENDPOINTS.OAUTH.GOOGLE_REGISTER,
        {
          accessToken,
          tokenType,
          scope
        },
        {
          skipAuthRedirect: true
        }
      )

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async loginWithGoogle(accessToken, tokenType = 'Bearer', scope = '') {
    const context = 'Login con Google'

    try {
      const result = await ServiceREST.post(
        API_ENDPOINTS.OAUTH.GOOGLE_LOGIN,
        {
          accessToken,
          tokenType,
          scope
        },
        {
          skipAuthRedirect: true
        }
      )

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // FACEBOOK OAUTH (Preparado para futuro)
  // ========================================

  async registerWithFacebook(accessToken) {
    const context = 'Registro con Facebook'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.OAUTH.FACEBOOK_REGISTER, {
        accessToken
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async loginWithFacebook(accessToken) {
    const context = 'Login con Facebook'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.OAUTH.FACEBOOK_LOGIN, {
        accessToken
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // APPLE OAUTH (Preparado para futuro)
  // ========================================

  async registerWithApple(identityToken, authorizationCode) {
    const context = 'Registro con Apple'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.OAUTH.APPLE_REGISTER, {
        identityToken,
        authorizationCode
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async loginWithApple(identityToken, authorizationCode) {
    const context = 'Login con Apple'

    try {
      const result = await ServiceREST.post(API_ENDPOINTS.OAUTH.APPLE_LOGIN, {
        identityToken,
        authorizationCode
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // INFORMACIÓN Y GESTIÓN
  // ========================================

  async getAuthMethods(email) {
    const context = 'Obtener métodos de autenticación'

    try {
      const result = await ServiceREST.get(`${API_ENDPOINTS.OAUTH.METHODS}/${encodeURIComponent(email)}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async getAvailableProviders() {
    const context = 'Obtener proveedores OAuth disponibles'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.OAUTH.PROVIDERS)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  async unlinkProvider(provider, localPassword, confirmationText, token) {
    const context = `Desvincular proveedor ${provider}`

    try {
      const result = await ServiceREST.post(
        `${API_ENDPOINTS.OAUTH.UNLINK}/${encodeURIComponent(provider)}`,
        {
          localPassword,
          confirmationText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    // Solo loguear errores específicos, otros ya se manejan en ServiceREST
    if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED || error?.response?.status === HTTP_STATUS.FORBIDDEN) {
      error.operation = operation
      Logger.authError(operation, error, 'oauthService')
    }
  }
}

// Crear instancia única
const oauthService = new OAuthService()

export default oauthService
