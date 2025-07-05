import { useState, useCallback } from 'react'
import { useError } from '@hooks/useError'

/**
 * Hook centralizado para manejar operaciones asíncronas con loading y manejo de errores
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.authContext - Contexto de autenticación para manejar errores 401
 * @param {boolean} options.showNotifications - Si mostrar notificaciones automáticamente
 * @param {boolean} options.autoHandleAuth - Si manejar automáticamente errores de autenticación
 * @returns {Object} Estados y funciones para manejar operaciones asíncronas
 */
const useAsyncOperation = (options = {}) => {
  const { authContext = null, showNotifications = true, autoHandleAuth = true } = options

  // Estados independientes para diferentes tipos de operaciones
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Hook de error - usar directamente sin memoización adicional
  const { handleError, handleSuccess, handleApiResponse, extractErrorMessage } = useError(authContext)

  /**
   * Ejecuta una operación asíncrona con manejo de loading y errores
   * @param {Function} asyncFn - Función asíncrona a ejecutar
   * @param {Object} config - Configuración de la operación
   * @param {string} config.operation - Nombre de la operación para logs
   * @param {string} config.loadingType - Tipo de loading ('loading' | 'submitting')
   * @param {boolean} config.clearError - Si limpiar errores previos
   * @returns {Promise<Object>} Resultado de la operación
   */
  const executeOperation = useCallback(
    async (asyncFn, config = {}) => {
      const {
        operation = 'operación',
        loadingType = 'loading',
        handleErrors = true,
        showErrorNotifications = showNotifications,
        successMessage = null
      } = config

      // Determinar qué setter de loading usar
      const setLoadingState = loadingType === 'submitting' ? setSubmitting : setLoading

      setLoadingState(true)

      try {
        const result = await asyncFn()

        // Manejar mensaje de éxito si se proporciona
        if (successMessage && showNotifications) {
          handleSuccess(successMessage)
        }

        return {
          success: true,
          data: result,
          message: successMessage,
          errors: null
        }
      } catch (error) {
        // Manejar error automáticamente si está habilitado
        if (handleErrors) {
          const errorResult = handleError(error, {
            showToast: showErrorNotifications,
            autoRedirectAuth: autoHandleAuth,
            logError: true
          })

          return {
            success: false,
            data: null,
            message: errorResult.message,
            errors: errorResult.fieldErrors,
            errorType: errorResult.type,
            operation
          }
        }

        // Si no se maneja automáticamente, solo formatear el error
        const errorMessage = extractErrorMessage(error)
        return {
          success: false,
          data: null,
          message: errorMessage,
          errors: null,
          error,
          operation
        }
      } finally {
        setLoadingState(false)
      }
    },
    [handleError, handleSuccess, extractErrorMessage, showNotifications, autoHandleAuth]
  )

  /**
   * Wrapper específico para operaciones de carga (loading)
   */
  const withLoading = useCallback(
    async (asyncFn, operation = 'operación') => {
      return executeOperation(asyncFn, { operation, loadingType: 'loading' })
    },
    [executeOperation]
  )

  /**
   * Wrapper específico para operaciones de envío (submitting)
   */
  const withSubmitting = useCallback(
    async (asyncFn, operation = 'operación') => {
      return executeOperation(asyncFn, { operation, loadingType: 'submitting' })
    },
    [executeOperation]
  )

  /**
   * Limpia todos los estados de loading
   */
  const clearLoadingStates = useCallback(() => {
    setLoading(false)
    setSubmitting(false)
  }, [])

  /**
   * Wrapper para operaciones que también usan handleApiResponse
   * @param {Function} asyncFn - Función asíncrona
   * @param {string} successMessage - Mensaje de éxito
   * @param {Object} options - Opciones adicionales
   */
  const withApiResponse = useCallback(
    async (asyncFn, successMessage, options = {}) => {
      const result = await executeOperation(asyncFn, {
        operation: options.operation || 'operación API',
        loadingType: options.loadingType || 'loading',
        handleErrors: false // No manejar errores automáticamente
      })

      // Usar handleApiResponse para el manejo completo
      return handleApiResponse(result, successMessage, options)
    },
    [executeOperation, handleApiResponse]
  )

  return {
    // Estados
    loading,
    submitting,

    // Funciones principales
    executeOperation,
    withLoading,
    withSubmitting,
    withApiResponse,

    // Utilidades
    clearLoadingStates,

    // Acceso directo a funciones de useError
    handleError,
    handleSuccess,
    handleApiResponse,

    // Getters de conveniencia
    isLoading: loading,
    isSubmitting: submitting,
    isIdle: !loading && !submitting
  }
}

export default useAsyncOperation
