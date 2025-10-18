import { useContext, useCallback, useMemo } from 'react'
import { passwordService } from '@services'
import AuthContext from '@contexts/AuthContext.jsx'
import { useError, useAsyncOperation } from '@hooks'

export const usePassword = () => {
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

  if (!context) throw new Error('usePassword debe ser utilizado dentro de AuthProvider')

  const {
    // Estados principales
    accessToken,

    // Métodos de limpieza
    clearAllAuth
  } = context

  // ========================================
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ========================================

  const forgotPassword = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(() => passwordService.forgotPassword(email), 'Recuperación de contraseña')

      return handleApiResponse(result, 'Enlace de recuperación enviado. Revisa tu email.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const resetPassword = useCallback(
    async (token, password, confirmPassword, showNotifications = true) => {
      const result = await withLoading(
        () => passwordService.resetPassword(token, password, confirmPassword),
        'Restablecimiento de contraseña'
      )

      if (result.success) clearAllAuth()

      return handleApiResponse(result, '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.', {
        showNotifications
      })
    },
    [withLoading, handleApiResponse, clearAllAuth]
  )

  const validateResetToken = useCallback(
    async (token, showNotifications = false) => {
      const result = await withLoading(() => passwordService.validateResetToken(token), 'Validación de token de recuperación')

      return handleApiResponse(result, 'Token válido', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // MÉTODOS DE CAMBIO DE CONTRASEÑA (AUTENTICADO)
  // ========================================

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword, showNotifications = true) => {
      const result = await withLoading(
        () => passwordService.changePassword(currentPassword, newPassword, confirmPassword, accessToken),
        'Cambio de contraseña'
      )

      return handleApiResponse(result, '¡Contraseña cambiada exitosamente!', { showNotifications })
    },
    [withLoading, handleApiResponse, accessToken]
  )

  // ========================================
  // MÉTODOS DE VALIDACIÓN DE CONTRASEÑAS
  // ========================================

  const validatePassword = useCallback(
    async (password, email = null, showNotifications = false) => {
      const result = await withLoading(() => passwordService.validatePassword(password, email), 'Validación de contraseña')

      return handleApiResponse(result, 'Contraseña válida', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getPasswordSuggestions = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(() => passwordService.getPasswordSuggestions(), 'Sugerencias de contraseñas')

      return handleApiResponse(result, 'Sugerencias obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getPasswordPolicy = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(() => passwordService.getPasswordPolicy(), 'Política de contraseñas')

      return handleApiResponse(result, 'Política obtenida', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const checkCompromised = useCallback(
    async (password, showNotifications = true) => {
      const result = await withLoading(() => passwordService.checkCompromised(password), 'Verificación de contraseña comprometida')

      return handleApiResponse(result, 'Contraseña verificada', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados
    loading,
    accessToken,

    // Recuperación de contraseña
    forgotPassword,
    resetPassword,
    validateResetToken,

    // Cambio de contraseña
    changePassword,

    // Validación
    validatePassword,
    getPasswordSuggestions,
    getPasswordPolicy,
    checkCompromised
  }
}

export default usePassword
