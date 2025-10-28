import { useCallback } from 'react'
import { oauthService } from '@services'

import useAuthOperations from './useAuthOperations.js'

export const useOAuth = () => {
  const { authContext, handleApiResponse, loading, withLoading } = useAuthOperations()

  if (!authContext) throw new Error('useOAuth debe ser utilizado dentro de AuthProvider')

  const {
    // Estados principales
    accessToken,

    // Métodos de usuario y tokens
    updateUser,
    updateTokens
  } = authContext

  // ========================================
  // GOOGLE OAUTH
  // ========================================

  const registerWithGoogle = useCallback(
    async (accessTokenGoogle, tokenType = 'Bearer', scope = '', showNotifications = true) => {
      const result = await withLoading(async () => {
        const data = await oauthService.registerWithGoogle(accessTokenGoogle, tokenType, scope)

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens para guardar en localStorage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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

        // Actualizar tokens
        updateTokens(data.tokens.accessToken, data.tokens.refreshToken)

        // Extraer datos del usuario sin los tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tokens, ...userDataWithoutTokens } = data

        updateUser(userDataWithoutTokens)

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
