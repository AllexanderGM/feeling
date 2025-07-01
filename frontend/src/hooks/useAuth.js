import { useContext } from 'react'
import AuthContext from '@context/AuthContext.jsx'
import { useNotification } from '@hooks/useNotification'
import { useError } from '@hooks/useError'

const useAuth = () => {
  const context = useContext(AuthContext)
  const { showInfo } = useNotification()
  const { handleError, handleSuccess, handleValidationErrors } = useError()

  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de AuthProvider')
  }

  const {
    user,
    loading,
    isAuthenticated,
    isInitialized,
    register: contextRegister,
    login: contextLogin,
    loginWithGoogle: contextLoginWithGoogle,
    registerWithGoogle: contextRegisterWithGoogle,
    logout: contextLogout,
    verifyEmailCode: contextVerifyEmailCode,
    resendVerificationCode: contextResendVerificationCode,
    forgotPassword: contextForgotPassword,
    resetPassword: contextResetPassword,
    validateResetToken: contextValidateResetToken,
    updateProfile: contextUpdateProfile,
    checkEmailAvailability,
    checkAuthMethod
  } = context

  // Helper para procesar respuestas con notificaciones
  const processResponse = (result, successMessage, showNotifications = true) => {
    if (!showNotifications) return result

    if (result.success) {
      handleSuccess(successMessage)
    } else {
      if (result.errorInfo?.fieldErrors && Object.keys(result.errorInfo.fieldErrors).length > 0) {
        handleValidationErrors(result.errorInfo.fieldErrors)
      } else {
        handleError(result.error, {
          customMessage: result.errorInfo?.message || 'Error desconocido'
        })
      }
    }

    return result
  }

  // === MÉTODOS CON NOTIFICACIONES AUTOMÁTICAS ===

  const register = async (userData, showNotifications = true) => {
    const result = await contextRegister(userData)
    return processResponse(result, '¡Registro exitoso! Revisa tu email para verificar tu cuenta.', showNotifications)
  }

  const login = async (email, password, showNotifications = true) => {
    const result = await contextLogin(email, password)
    const successMessage = `¡Bienvenido${result.user?.name ? ` ${result.user.name}` : ''}!`
    return processResponse(result, successMessage, showNotifications)
  }

  const loginWithGoogle = async (tokenResponse, showNotifications = true) => {
    const result = await contextLoginWithGoogle(tokenResponse)
    const successMessage = `¡Bienvenido${result.user?.name ? ` ${result.user.name}` : ''}!`
    return processResponse(result, successMessage, showNotifications)
  }

  const registerWithGoogle = async (tokenResponse, showNotifications = true) => {
    const result = await contextRegisterWithGoogle(tokenResponse)
    return processResponse(result, '¡Registro exitoso con Google! Ya puedes usar todas las funcionalidades.', showNotifications)
  }

  const verifyEmailCode = async (email, code, showNotifications = true) => {
    const result = await contextVerifyEmailCode(email, code)
    return processResponse(result, '¡Email verificado exitosamente! Ya puedes iniciar sesión.', showNotifications)
  }

  const resendVerificationCode = async (email, showNotifications = true) => {
    const result = await contextResendVerificationCode(email)
    if (result.success && showNotifications) {
      showInfo('Código de verificación reenviado. Revisa tu email.')
    } else if (!result.success && showNotifications) {
      handleError(result.error, {
        customMessage: result.errorInfo?.message || 'Error al reenviar código'
      })
    }
    return result
  }

  const forgotPassword = async (email, showNotifications = true) => {
    const result = await contextForgotPassword(email)
    return processResponse(result, 'Enlace de recuperación enviado. Revisa tu email.', showNotifications)
  }

  const resetPassword = async (token, newPassword, confirmPassword = null, showNotifications = true) => {
    const result = await contextResetPassword(token, newPassword, confirmPassword)
    return processResponse(result, '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.', showNotifications)
  }

  const validateResetToken = async (token, showNotifications = false) => {
    const result = await contextValidateResetToken(token)
    if (!result.success && showNotifications) {
      handleError(result.error, {
        customMessage: result.errorInfo?.message || 'Token de recuperación inválido'
      })
    }
    return result
  }

  const updateProfile = async (userData, showNotifications = true) => {
    const result = await contextUpdateProfile(userData)
    return processResponse(result, 'Perfil actualizado exitosamente.', showNotifications)
  }

  const logout = (showNotifications = true) => {
    contextLogout()
    if (showNotifications) {
      showInfo('Sesión cerrada correctamente.')
    }
  }

  // === ESTADOS DERIVADOS ===

  const userEmail = user?.email || null
  const userName = user?.name || null
  const userFullName = user ? `${user.name} ${user.lastName || ''}`.trim() : null
  const userImage = user?.image || null
  const userRole = user?.role || null
  const isVerified = user?.verified || false
  const isProfileComplete = user?.completeProfile || false

  const needsEmailVerification = isAuthenticated && !isVerified
  const needsProfileCompletion = isAuthenticated && isVerified && !isProfileComplete
  const canUseApp = isAuthenticated && isVerified && isProfileComplete

  // === HELPERS ===

  const hasRole = role => {
    if (!user?.role) return false
    return user.role === role || user.role === 'ADMIN'
  }

  const getOnboardingStep = () => {
    if (!isAuthenticated) return 'login'
    if (!isVerified) return 'verify-email'
    if (!isProfileComplete) return 'complete-profile'
    return 'completed'
  }

  const getUserDisplayInfo = () => {
    if (!user) return null

    return {
      name: userFullName || userEmail,
      email: userEmail,
      image: userImage,
      initials: getUserInitials(),
      verified: isVerified,
      profileComplete: isProfileComplete
    }
  }

  const getUserInitials = () => {
    if (!user) return ''

    const firstName = user.name || ''
    const lastName = user.lastName || ''
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName.charAt(0).toUpperCase()

    return `${firstInitial}${lastInitial}` || userEmail?.charAt(0).toUpperCase() || '?'
  }

  const needsAction = () => needsEmailVerification || needsProfileCompletion

  const getNextRequiredAction = () => {
    if (needsEmailVerification) {
      return {
        action: 'verify-email',
        message: 'Verifica tu correo electrónico para continuar',
        path: '/app/verify-email'
      }
    }

    if (needsProfileCompletion) {
      return {
        action: 'complete-profile',
        message: 'Completa tu perfil para usar todas las funciones',
        path: '/app/complete-profile'
      }
    }

    return null
  }

  return {
    // Estados principales
    user,
    loading,
    isAuthenticated,
    isInitialized,

    // Estados derivados
    userEmail,
    userName,
    userFullName,
    userImage,
    userRole,
    isVerified,
    isProfileComplete,
    needsEmailVerification,
    needsProfileCompletion,
    canUseApp,

    // Métodos con notificaciones automáticas
    register,
    login,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    verifyEmailCode,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    validateResetToken,
    updateProfile,

    // Métodos sin notificaciones automáticas
    checkEmailAvailability,
    checkAuthMethod,
    hasRole,
    getOnboardingStep,
    getUserDisplayInfo,
    getUserInitials,
    needsAction,
    getNextRequiredAction,

    // Acceso directo a métodos sin notificaciones
    registerRaw: contextRegister,
    loginRaw: contextLogin,
    loginWithGoogleRaw: contextLoginWithGoogle,
    registerWithGoogleRaw: contextRegisterWithGoogle,
    verifyEmailCodeRaw: contextVerifyEmailCode,
    resendVerificationCodeRaw: contextResendVerificationCode,
    forgotPasswordRaw: contextForgotPassword,
    resetPasswordRaw: contextResetPassword,
    validateResetTokenRaw: contextValidateResetToken,
    updateProfileRaw: contextUpdateProfile
  }
}

export default useAuth
