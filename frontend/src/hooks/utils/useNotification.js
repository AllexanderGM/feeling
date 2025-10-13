import { addToast, closeAll } from '@heroui/toast'
import { useCallback } from 'react'
import { Logger } from '@utils/logger.js'

/**
 * Hook simplificado para notificaciones usando HeroUI Toast
 * Basado en la documentación oficial de HeroUI
 */
export const useNotification = () => {
  /**
   * Muestra notificación de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título opcional
   * @param {number} duration - Duración en ms (default: 3000)
   */
  const showSuccess = useCallback((message, title = 'Éxito', duration = 3000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'success',
        timeout: duration
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error showing success toast', error)

      return null
    }
  }, [])

  /**
   * Muestra notificación de error
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título opcional
   * @param {number} duration - Duración en ms (default: 4000)
   */
  const showError = useCallback((message, title = 'Error', duration = 4000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'danger',
        timeout: duration
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error showing error toast', error)

      return null
    }
  }, [])

  /**
   * Muestra notificación de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título opcional
   * @param {number} duration - Duración en ms (default: 3000)
   */
  const showWarning = useCallback((message, title = 'Advertencia', duration = 3000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'warning',
        timeout: duration
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error showing warning toast', error)

      return null
    }
  }, [])

  /**
   * Muestra notificación informativa
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título opcional
   * @param {number} duration - Duración en ms (default: 3000)
   */
  const showInfo = useCallback((message, title = 'Información', duration = 3000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'default',
        timeout: duration
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error showing info toast', error)

      return null
    }
  }, [])

  /**
   * Método genérico para agregar notificaciones
   * @param {Object} options - Opciones de la notificación
   * @param {string} options.type - Tipo: 'success' | 'error' | 'warning' | 'info'
   * @param {string} options.message - Mensaje a mostrar
   * @param {string} options.title - Título opcional
   * @param {number} options.duration - Duración en ms
   */
  const addNotification = useCallback(
    ({ type = 'info', message, title, duration = 3000 }) => {
      const notificationMap = {
        success: () => showSuccess(message, title, duration),
        error: () => showError(message, title, duration),
        warning: () => showWarning(message, title, duration),
        info: () => showInfo(message, title, duration)
      }

      const handler = notificationMap[type] || notificationMap.info

      return handler()
    },
    [showSuccess, showError, showWarning, showInfo]
  )

  /**
   * Limpia todas las notificaciones activas
   */
  const clearAllNotifications = useCallback(() => {
    try {
      closeAll()
      Logger.debug(Logger.CATEGORIES.SYSTEM, 'All notifications cleared', {})
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error clearing notifications', error)
    }
  }, [])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification,
    clearAllNotifications
  }
}

export default useNotification
