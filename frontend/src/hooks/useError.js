import { useContext } from 'react'
import ErrorContext from '@context/ErrorContext.jsx'
import { useNotification } from '@hooks/useNotification'

/**
 * Hook unificado para manejo de errores que combina ErrorContext y sistema de Toast
 */
export const useErrorHandler = () => {
  const errorContext = useContext(ErrorContext)
  const { showError, showSuccess, showWarning, showInfo } = useNotification()

  if (!errorContext) {
    throw new Error('useErrorHandler debe ser usado dentro de ErrorProvider')
  }

  /**
   * Maneja errores con diferentes opciones de visualización
   * @param {Error|string} error - Error a manejar
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.showModal=false] - Mostrar modal de error
   * @param {boolean} [options.showToast=true] - Mostrar notificación toast
   * @param {boolean} [options.logError=true] - Registrar error en consola
   * @param {string} [options.customMessage=null] - Mensaje personalizado
   */
  const handleError = (error, options = {}) => {
    const { showModal = false, showToast = true, logError = true, customMessage = null } = options

    // Extraer mensaje del error
    let errorMessage = 'Ha ocurrido un error inesperado'

    if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.message) {
      errorMessage = error.message
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    const finalMessage = customMessage || errorMessage

    // Log del error si está habilitado
    if (logError) {
      console.error('Error capturado por useErrorHandler:', {
        error,
        message: finalMessage,
        errorType: error?.errorType,
        fieldErrors: error?.fieldErrors
      })
    }

    // Mostrar modal si se requiere
    if (showModal) {
      errorContext.showErrorModal(finalMessage, 'Error', error)
    }

    // Mostrar toast usando HeroUI Toast
    if (showToast) {
      showError(finalMessage, 'Error')
    }

    return {
      message: finalMessage,
      type: error?.errorType,
      fieldErrors: error?.fieldErrors
    }
  }

  /**
   * Maneja mensajes de éxito
   * @param {string} message - Mensaje de éxito
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.showToast=true] - Mostrar notificación toast
   * @param {number} [options.duration=3000] - Duración del toast
   */
  const handleSuccess = (message, options = {}) => {
    const { showToast = true, duration = 3000 } = options

    if (showToast) {
      showSuccess(message, 'Éxito', duration)
    }
  }

  /**
   * Maneja errores de validación de campos
   * @param {Object} fieldErrors - Objeto con errores por campo
   */
  const handleValidationErrors = fieldErrors => {
    if (!fieldErrors || typeof fieldErrors !== 'object') return

    Object.entries(fieldErrors).forEach(([field, message]) => {
      showError(`${field}: ${message}`, 'Error de validación')
    })
  }

  /**
   * Maneja mensajes de advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {Object} options - Opciones de configuración
   */
  const handleWarning = (message, options = {}) => {
    const { showToast = true, duration = 4000 } = options

    if (showToast) {
      showWarning(message, 'Advertencia', duration)
    }
  }

  /**
   * Maneja mensajes informativos
   * @param {string} message - Mensaje informativo
   * @param {Object} options - Opciones de configuración
   */
  const handleInfo = (message, options = {}) => {
    const { showToast = true, duration = 3000 } = options

    if (showToast) {
      showInfo(message, 'Información', duration)
    }
  }

  return {
    handleError,
    handleSuccess,
    handleValidationErrors,
    handleWarning,
    handleInfo,
    // Acceso directo a contextos si se necesita
    errorContext,
    showErrorModal: errorContext.showErrorModal,
    showErrorAlert: errorContext.showErrorAlert,
    // Acceso directo a métodos de toast
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}

// Export por defecto para compatibilidad
export default useErrorHandler
