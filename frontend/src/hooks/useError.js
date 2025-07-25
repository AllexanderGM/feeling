import { useContext, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ErrorContext from '@context/ErrorContext.jsx'
import { useNotification } from '@hooks/useNotification'
import { ErrorManager } from '@utils/errorManager'
import { APP_PATHS } from '@constants/paths'

/**
 * Hook unificado para manejo de errores que combina ErrorContext y sistema de Toast
 */
export const useError = (authContext = null) => {
  const errorContext = useContext(ErrorContext)
  const { showError, showSuccess, showWarning, showInfo, clearAllNotifications } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  if (!errorContext) {
    throw new Error('useError debe ser usado dentro de ErrorProvider')
  }

  /**
   * Maneja errores de autenticación (401) con redirección automática
   * @param {Error|Object} error - Error de autenticación
   * @param {string} customMessage - Mensaje personalizado opcional
   */
  const handleAuthError = useCallback(
    (error, customMessage) => {
      console.error('Error de autenticación:', ErrorManager.formatError(error))

      // Si se pasó un contexto de auth, usar su método clearAllAuth
      if (authContext?.clearAllAuth) authContext.clearAllAuth()

      // Guardar ruta actual para redireccionar después del login
      const currentPath = location.pathname + location.search
      const authPaths = [
        APP_PATHS.AUTH.LOGIN,
        APP_PATHS.AUTH.REGISTER,
        APP_PATHS.AUTH.VERIFY_EMAIL,
        APP_PATHS.AUTH.FORGOT_PASSWORD,
        APP_PATHS.AUTH.RESET_PASSWORD
      ]

      if (!authPaths.some(path => currentPath.includes(path))) {
        localStorage.setItem('redirectAfterLogin', currentPath)
      }

      const message = customMessage || error?.message || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      showError(message, 'Sesión expirada')

      // Limpiar notificaciones antes de redirigir
      setTimeout(() => {
        clearAllNotifications()
      }, 1000)

      // Redirigir al login después de un pequeño delay
      setTimeout(() => {
        navigate(APP_PATHS.AUTH.LOGIN, {
          replace: true,
          state: {
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            from: currentPath
          }
        })
      }, 1500)
    },
    [navigate, location, showError, authContext, clearAllNotifications]
  )

  /**
   * Verifica si un error es de tipo autenticación
   * @param {Error|Object} error - Error a verificar
   * @returns {boolean} True si es error de autenticación
   */
  const isAuthenticationError = useCallback(error => {
    return (
      error?.response?.status === 401 ||
      error?.status === 401 ||
      error?.errorType === 'AUTHENTICATION_ERROR' ||
      error?.type === 'AUTHENTICATION_ERROR'
    )
  }, [])

  /**
   * Extrae mensaje de error de diferentes tipos de objeto error
   * @param {Error|string|Object} error - Error a procesar
   * @returns {string} Mensaje de error extraído
   */
  const extractErrorMessage = useCallback(
    error => {
      if (typeof error === 'string') {
        return error
      }

      if (error?.message) {
        return error.message
      }

      // Para errores de axios/fetch
      if (error?.response?.data?.message) {
        return error.response.data.message
      }

      // Para errores de axios con campo error
      if (error?.response?.data?.error) {
        return error.response.data.error
      }

      // Para errores de network
      if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
        return 'Error de conexión. Verifica tu internet.'
      }

      // Para errores de timeout
      if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
        return 'La operación tardó demasiado. Inténtalo de nuevo.'
      }

      // Para errores de autenticación específicos
      if (isAuthenticationError(error)) {
        return 'Tu sesión ha expirado. Serás redirigido al login.'
      }

      return 'Ha ocurrido un error inesperado'
    },
    [isAuthenticationError]
  )

  /**
   * Extrae errores de validación de campo
   * @param {Error|Object} error - Error que puede contener errores de campo
   * @returns {Object} Objeto con errores por campo
   */
  const extractFieldErrors = useCallback(error => {
    // Errores directos de validación
    if (error?.fieldErrors && typeof error.fieldErrors === 'object') {
      return error.fieldErrors
    }

    // Errores de axios con estructura errors
    if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
      return error.response.data.errors
    }

    // Errores de validación en formato Laravel/similar
    if (error?.response?.data?.fieldErrors && typeof error.response.data.fieldErrors === 'object') {
      return error.response.data.fieldErrors
    }

    return null
  }, [])

  /**
   * Maneja errores con diferentes opciones de visualización
   * @param {Error|string} error - Error a manejar
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.showModal=false] - Mostrar modal de error
   * @param {boolean} [options.showToast=true] - Mostrar notificación toast
   * @param {boolean} [options.logError=true] - Registrar error en consola
   * @param {string} [options.customMessage=null] - Mensaje personalizado
   * @param {string} [options.customTitle='Error'] - Título personalizado
   * @param {boolean} [options.autoRedirectAuth=true] - Redirigir automáticamente en errores 401
   */
  const handleError = useCallback(
    (error, options = {}) => {
      const {
        showModal = false,
        showToast = true,
        logError = true,
        customMessage = null,
        customTitle = 'Error',
        autoRedirectAuth = true
      } = options

      // Verificar si es error de autenticación PRIMERO
      if (isAuthenticationError(error) && autoRedirectAuth) {
        handleAuthError(error, customMessage)
        return {
          message: customMessage || extractErrorMessage(error),
          type: 'AUTHENTICATION_ERROR',
          status: error?.response?.status || error?.status || 401,
          fieldErrors: null,
          handled: true,
          redirected: true
        }
      }

      const errorMessage = customMessage || extractErrorMessage(error)
      const fieldErrors = extractFieldErrors(error)

      // Log del error si está habilitado
      if (logError) {
        console.error('Error capturado por useError:', ErrorManager.formatError(error, errorMessage))
      }

      // Mostrar modal si se requiere
      if (showModal) {
        errorContext.showErrorModal(errorMessage, customTitle, error)
      }

      // Mostrar toast
      if (showToast) {
        showError(errorMessage, customTitle)
      }

      return {
        message: errorMessage,
        type: error?.errorType || error?.type,
        status: error?.response?.status || error?.status,
        fieldErrors,
        handled: true
      }
    },
    [extractErrorMessage, extractFieldErrors, errorContext, showError, isAuthenticationError, handleAuthError]
  )

  /**
   * Maneja mensajes de éxito
   * @param {string} message - Mensaje de éxito
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.showToast=true] - Mostrar notificación toast
   * @param {number} [options.duration=5000] - Duración del toast
   * @param {string} [options.title='Éxito'] - Título personalizado
   */
  const handleSuccess = useCallback(
    (message, options = {}) => {
      const { showToast = true, duration = 5000, title = 'Éxito' } = options

      if (showToast) {
        showSuccess(message, title, duration)
      }

      return { message, type: 'success', handled: true }
    },
    [showSuccess]
  )

  /**
   * Maneja errores de validación de campos de forma mejorada
   * @param {Object} fieldErrors - Objeto con errores por campo
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.showToast=true] - Mostrar notificaciones toast
   * @param {boolean} [options.groupedMessage=false] - Agrupar errores en un solo mensaje
   * @param {string} [options.title='Error de validación'] - Título personalizado
   */
  const handleValidationErrors = useCallback(
    (fieldErrors, options = {}) => {
      if (!fieldErrors || typeof fieldErrors !== 'object') return

      const { showToast = true, groupedMessage = false, title = 'Error de validación' } = options
      const errors = Object.entries(fieldErrors)

      if (!errors.length) return

      if (!showToast) return

      if (groupedMessage) {
        // Mostrar un solo toast con todos los errores
        const errorList = errors.map(([field, message]) => `• ${field}: ${message}`).join('\n')
        showError(errorList, title)
      } else {
        // Mostrar toast individual para cada error (máximo 3 para evitar spam)
        const maxErrors = 3
        errors.slice(0, maxErrors).forEach(([field, message]) => {
          showError(`${field}: ${message}`, title)
        })

        // Si hay más errores, mostrar un mensaje indicativo
        if (errors.length > maxErrors) {
          showWarning(`Y ${errors.length - maxErrors} errores más...`, 'Errores adicionales')
        }
      }

      return { fieldErrors, count: errors.length, handled: true }
    },
    [showError, showWarning]
  )

  /**
   * Maneja mensajes de advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {Object} options - Opciones de configuración
   */
  const handleWarning = useCallback(
    (message, options = {}) => {
      const { showToast = true, duration = 6000, title = 'Advertencia' } = options

      if (showToast) {
        showWarning(message, title, duration)
      }

      return { message, type: 'warning', handled: true }
    },
    [showWarning]
  )

  /**
   * Maneja mensajes informativos
   * @param {string} message - Mensaje informativo
   * @param {Object} options - Opciones de configuración
   */
  const handleInfo = useCallback(
    (message, options = {}) => {
      const { showToast = true, duration = 5000, title = 'Información' } = options

      if (showToast) {
        showInfo(message, title, duration)
      }

      return { message, type: 'info', handled: true }
    },
    [showInfo]
  )

  /**
   * Método conveniente para manejar respuestas de API
   * @param {Object} response - Respuesta de la API
   * @param {string} successMessage - Mensaje de éxito
   * @param {Object} options - Opciones adicionales
   */
  const handleApiResponse = useCallback(
    (response, successMessage, options = {}) => {
      const { showNotifications = true } = options

      if (!showNotifications) return response

      if (response?.success) {
        if (successMessage) handleSuccess(successMessage)
      } else {
        const fieldErrors = extractFieldErrors(response?.error || response)
        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          handleValidationErrors(fieldErrors)
        }
      }

      return response
    },
    [handleSuccess, handleError, handleValidationErrors, extractFieldErrors]
  )

  return {
    handleError,
    handleSuccess,
    handleValidationErrors,
    handleWarning,
    handleInfo,
    handleApiResponse,

    // Nuevos métodos para autenticación
    handleAuthError,
    isAuthenticationError,

    // Utilidades de extracción
    extractErrorMessage,
    extractFieldErrors,

    // Acceso directo a contextos si se necesita
    errorContext,
    showErrorModal: errorContext.showErrorModal,
    showErrorAlert: errorContext.showErrorAlert,

    // Acceso directo a métodos de toast (para casos especiales)
    showError,
    showSuccess,
    showWarning,
    showInfo,

    // Método para limpiar notificaciones
    clearAllNotifications
  }
}

export default useError
