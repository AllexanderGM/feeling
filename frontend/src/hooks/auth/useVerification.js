import { useCallback } from 'react'
import { verificationService } from '@services'

import useAuthOperations from './useAuthOperations.js'

export const useVerification = () => {
  const { authContext, handleApiResponse, loading, withLoading } = useAuthOperations()

  if (!authContext) throw new Error('useVerification debe ser utilizado dentro de AuthProvider')

  const {
    // Estados principales
    accessToken
  } = authContext

  // ========================================
  // MÉTODOS DE VERIFICACIÓN DE EMAIL
  // ========================================

  const verifyEmail = useCallback(
    async (email, code, showNotifications = true) => {
      const result = await withLoading(() => verificationService.verifyEmail(email, code), 'Verificación de email')

      return handleApiResponse(result, '¡Email verificado exitosamente! Ya puedes iniciar sesión.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const resendCode = useCallback(
    async (email, showNotifications = true) => {
      const result = await withLoading(() => verificationService.resendCode(email), 'Reenvío de código')

      return handleApiResponse(result, 'Código de verificación reenviado. Revisa tu email.', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // MÉTODOS DE VALIDACIONES DE EMAIL
  // ========================================

  const checkEmailAvailability = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => verificationService.checkEmailAvailability(email), 'Verificación de disponibilidad de email')

      return handleApiResponse(result, 'Email verificado', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getUserVerificationStatus = useCallback(
    async (email, showNotifications = false) => {
      const result = await withLoading(() => verificationService.getUserVerificationStatus(email), 'Estado de verificación del usuario')

      return handleApiResponse(result, 'Estado obtenido', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const validateCode = useCallback(
    async (email, code, showNotifications = false) => {
      const result = await withLoading(() => verificationService.validateCode(email, code), 'Validación de código de verificación')

      return handleApiResponse(result, 'Código válido', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // MÉTODOS DE LIMPIEZA (ADMIN)
  // ========================================

  const cleanupExpiredCodes = useCallback(
    async (showNotifications = true) => {
      const result = await withLoading(() => verificationService.cleanupExpiredCodes(accessToken), 'Limpieza de códigos expirados')

      return handleApiResponse(result, 'Códigos expirados eliminados exitosamente', { showNotifications })
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

    // Verificación de email
    verifyEmail,
    resendCode,

    // Validaciones
    checkEmailAvailability,
    getUserVerificationStatus,
    validateCode,

    // Admin
    cleanupExpiredCodes
  }
}

export default useVerification
