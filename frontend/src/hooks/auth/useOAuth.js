import { useContext, useCallback, useMemo } from 'react'
import { oauthService } from '@services'
import AuthContext from '@context/AuthContext.jsx'
import { useError } from '@hooks/utils/useError.js'
import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'

export const useOAuth = () => {
  const context = useContext(AuthContext)

  // Pasar el contexto de auth al hook de error para usar clearAllAuth
  const { handleApiResponse } = useError(context)

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

  if (!context) throw new Error('useOAuth debe ser utilizado dentro de AuthProvider')

  const {
    // Estados principales
    accessToken,

    // Métodos de usuario y tokens
    updateUser,
    updateTokens
  } = context

  // ========================================
  // GOOGLE OAUTH
  // ========================================

  const registerWithGoogle = useCallback(
    async (accessTokenGoogle, tokenType = 'Bearer', scope = '', showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.registerWithGoogle(accessTokenGoogle, tokenType, scope)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Registro con Google')

      if (result?.status === 409) return result
      if (result?.status === 422) return result

      return handleApiResponse(result, '¡Registro exitoso con Google! Ya puedes usar todas las funcionalidades.', {
        showNotifications
      })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  const loginWithGoogle = useCallback(
    async (accessTokenGoogle, tokenType = 'Bearer', scope = '', showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.loginWithGoogle(accessTokenGoogle, tokenType, scope)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Inicio de sesión con Google')

      return handleApiResponse(result, '¡Inicio de sesión exitoso con Google!', { showNotifications })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  // ========================================
  // FACEBOOK OAUTH (Preparado para futuro)
  // ========================================

  const registerWithFacebook = useCallback(
    async (accessTokenFacebook, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.registerWithFacebook(accessTokenFacebook)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Registro con Facebook')

      if (result?.status === 409) return result
      if (result?.status === 422) return result

      return handleApiResponse(result, '¡Registro exitoso con Facebook! Ya puedes usar todas las funcionalidades.', {
        showNotifications
      })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  const loginWithFacebook = useCallback(
    async (accessTokenFacebook, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.loginWithFacebook(accessTokenFacebook)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Inicio de sesión con Facebook')

      return handleApiResponse(result, '¡Inicio de sesión exitoso con Facebook!', { showNotifications })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  // ========================================
  // APPLE OAUTH (Preparado para futuro)
  // ========================================

  const registerWithApple = useCallback(
    async (identityToken, authorizationCode, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.registerWithApple(identityToken, authorizationCode)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Registro con Apple')

      if (result?.status === 409) return result
      if (result?.status === 422) return result

      return handleApiResponse(result, '¡Registro exitoso con Apple! Ya puedes usar todas las funcionalidades.', {
        showNotifications
      })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  const loginWithApple = useCallback(
    async (identityToken, authorizationCode, showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.loginWithApple(identityToken, authorizationCode)

        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)
        updateUser(data)

        return data
      }, 'Inicio de sesión con Apple')

      return handleApiResponse(result, '¡Inicio de sesión exitoso con Apple!', { showNotifications })
    },
    [withLoading, handleApiResponse, updateTokens, updateUser]
  )

  // ========================================
  // INFORMACIÓN Y GESTIÓN
  // ========================================

  const getAuthMethods = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => oauthService.getAuthMethods(email), 'Obtener métodos de autenticación')

      return handleApiResponse(result, 'Métodos de autenticación obtenidos', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getAvailableProviders = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(() => oauthService.getAvailableProviders(), 'Obtener proveedores OAuth disponibles')

      return handleApiResponse(result, 'Proveedores obtenidos', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const unlinkProvider = useCallback(
    async (provider, localPassword, confirmationText, showNotifications = true) => {
      const result = await withLoading(
        () => oauthService.unlinkProvider(provider, localPassword, confirmationText, accessToken),
        `Desvincular proveedor ${provider}`
      )

      return handleApiResponse(result, `Proveedor ${provider} desvinculado exitosamente`, { showNotifications })
    },
    [withLoading, handleApiResponse, accessToken]
  )

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    accessToken,

    // Google OAuth
    registerWithGoogle,
    loginWithGoogle,

    // Facebook OAuth
    registerWithFacebook,
    loginWithFacebook,

    // Apple OAuth
    registerWithApple,
    loginWithApple,

    // Información y gestión
    getAuthMethods,
    getAvailableProviders,
    unlinkProvider
  }
}

export default useOAuth
