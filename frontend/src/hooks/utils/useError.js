import { useContext, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ErrorContext from '@context/ErrorContext.jsx'
import { useNotification } from '@hooks/utils/useNotification'
import { ErrorManager } from '@utils/errorManager'
import { APP_PATHS } from '@constants/paths'
import { Logger } from '@utils/logger.js'

/**
 * Hook unificado para manejo de errores
 * Combina ErrorContext, notificaciones Toast y manejo de autenticación
 */
export const useError = (authContext = null) => {
  const errorContext = useContext(ErrorContext)
  const { showError, showSuccess, showWarning, showInfo, clearAllNotifications } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  if (!errorContext) {
    throw new Error('useError debe ser usado dentro de ErrorProvider')
  }

  // ========================================
  // MANEJO DE ERRORES DE AUTENTICACIÓN
  // ========================================

  /**
   * Maneja errores de autenticación (401) con redirección automática
   * @param {Error|Object} error - Error de autenticación
   * @param {string} customMessage - Mensaje personalizado opcional
   */
  const handleAuthError = useCallback(
    (error, customMessage) => {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Authentication error', ErrorManager.formatError(error))

      // Limpiar autenticación si el contexto está disponible
      if (authContext?.clearAllAuth) {
        authContext.clearAllAuth()
      }

      // Guardar ruta actual para redirección post-login
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

      // Redirigir después de un breve delay
      setTimeout(() => navigate(APP_PATHS.AUTH.LOGIN), 2000)
    },
    [authContext, location, navigate, showError]
  )

  // ========================================
  // MANEJO GENERAL DE ERRORES
  // ========================================

  /**
   * Maneja cualquier tipo de error con lógica especializada
   * @param {Error|Object} error - Error a procesar
   * @param {Object} options - Opciones de manejo
   */
  const handleError = useCallback(
    (error, options = {}) => {
      const {
        showToast = true,
        showModal = false,
        customMessage = null,
        title = 'Error',
        onAuthError = null,
        includeFieldErrors = false
      } = options

      // Formatear error usando ErrorManager
      const formattedError = ErrorManager.formatError(error)
      const errorType = ErrorManager.getErrorType(error)

      // Manejo especial para errores de autenticación
      if (errorType === ErrorManager.ERROR_TYPES.AUTH) {
        if (onAuthError) {
          onAuthError(error)
        } else {
          handleAuthError(error, customMessage)
        }
        return formattedError
      }

      // Mensaje final a mostrar
      const finalMessage = customMessage || formattedError.message

      // Mostrar notificación
      if (showToast) {
        showError(finalMessage, title)
      }

      // Mostrar modal si se requiere
      if (showModal) {
        errorContext.showErrorModal(finalMessage, title)
      }

      // Incluir errores de campo si se solicita
      if (includeFieldErrors && formattedError.fieldErrors) {
        return {
          ...formattedError,
          fieldErrors: formattedError.fieldErrors
        }
      }

      Logger.error(Logger.CATEGORIES.SYSTEM, `Handled error [${errorType}]`, { errorType, error })
      return formattedError
    },
    [errorContext, handleAuthError, showError]
  )

  // ========================================
  // UTILIDADES ESPECIALIZADAS
  // ========================================

  /**
   * Extrae errores de campo para formularios
   * @param {Error|Object} error - Error del servidor
   * @returns {Object} Errores por campo
   */
  const extractFieldErrors = useCallback(error => {
    return ErrorManager.getFieldErrors(error)
  }, [])

  /**
   * Extrae mensaje de error de forma segura
   * @param {Error|Object} error - Error del que extraer mensaje
   * @returns {string} Mensaje del error
   */
  const extractErrorMessage = useCallback(error => {
    return ErrorManager.getErrorMessage(error)
  }, [])

  /**
   * Maneja éxito de operaciones
   * @param {string} message - Mensaje de éxito
   * @param {string} title - Título opcional
   */
  const handleSuccess = useCallback(
    (message, title = 'Éxito') => {
      showSuccess(message, title)
    },
    [showSuccess]
  )

  /**
   * Maneja advertencias
   * @param {string} message - Mensaje de advertencia
   * @param {string} title - Título opcional
   */
  const handleWarning = useCallback(
    (message, title = 'Advertencia') => {
      showWarning(message, title)
    },
    [showWarning]
  )

  /**
   * Maneja información general
   * @param {string} message - Mensaje informativo
   * @param {string} title - Título opcional
   */
  const handleInfo = useCallback(
    (message, title = 'Información') => {
      showInfo(message, title)
    },
    [showInfo]
  )

  /**
   * Limpia todas las notificaciones activas
   */
  const clearNotifications = useCallback(() => {
    clearAllNotifications()
  }, [clearAllNotifications])

  /**
   * Maneja respuestas de API con éxito y error
   * @param {*} result - Resultado de la operación (puede ser data o throw error)
   * @param {string} successMessage - Mensaje de éxito a mostrar
   * @param {Object} options - Opciones de manejo
   * @returns {*} El resultado original si es exitoso
   */
  const handleApiResponse = useCallback(
    (result, successMessage, options = {}) => {
      const { showNotifications = true } = options

      try {
        // Si llegamos aquí, la operación fue exitosa
        if (showNotifications && successMessage) {
          handleSuccess(successMessage)
        }
        return result
      } catch (error) {
        // En caso de error (aunque esto normalmente se manejaría antes)
        handleError(error, { showToast: showNotifications })
        throw error
      }
    },
    [handleSuccess, handleError]
  )

  // ========================================
  // UTILIDADES DEL CONTEXTO
  // ========================================

  /**
   * Muestra modal de error personalizado
   * @param {string} message - Mensaje del error
   * @param {string} title - Título del modal
   */
  const showErrorModal = useCallback(
    (message, title = 'Error') => {
      errorContext.showErrorModal(message, title)
    },
    [errorContext]
  )

  /**
   * Oculta modal de error activo
   */
  const hideErrorModal = useCallback(() => {
    errorContext.hideErrorModal()
  }, [errorContext])

  // ========================================
  // API PÚBLICA
  // ========================================

  return {
    // Funciones principales
    handleError,
    handleAuthError,
    handleSuccess,
    handleWarning,
    handleInfo,
    handleApiResponse,

    // Utilidades
    extractFieldErrors,
    extractErrorMessage,
    clearNotifications,

    // Modal del contexto
    showErrorModal,
    hideErrorModal,

    // Estado del contexto
    errorModalVisible: errorContext.errorModalVisible,
    currentError: errorContext.currentError,

    // Funciones del ErrorManager para casos avanzados
    ErrorManager
  }
}

export default useError
