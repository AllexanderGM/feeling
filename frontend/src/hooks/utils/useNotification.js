import { addToast } from '@heroui/react'
import { useCallback } from 'react'
import { Logger } from '@utils/logger.js'

export const useNotification = () => {
  // Función simplificada para crear toasts siguiendo la documentación oficial
  const createToast = useCallback(options => {
    try {
      return addToast(options)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error showing notification', error)
      return null
    }
  }, [])

  const showSuccess = useCallback(
    (message, title = 'Éxito', duration = 2000) => {
      return createToast({
        title,
        description: message,
        color: 'success',
        timeout: duration
      })
    },
    [createToast]
  )

  const showError = useCallback(
    (message, title = 'Error', duration = 3000) => {
      return createToast({
        title,
        description: message,
        color: 'danger',
        timeout: duration
      })
    },
    [createToast]
  )

  const showWarning = useCallback(
    (message, title = 'Advertencia', duration = 3000) => {
      return createToast({
        title,
        description: message,
        color: 'warning',
        timeout: duration
      })
    },
    [createToast]
  )

  const showInfo = useCallback(
    (message, title = 'Información', duration = 2000) => {
      return createToast({
        title,
        description: message,
        color: 'default',
        timeout: duration
      })
    },
    [createToast]
  )

  // Método genérico simplificado
  const addNotification = useCallback(
    ({ type = 'info', message, title, duration = 2000 }) => {
      const notificationMap = {
        success: () => showSuccess(message, title || 'Éxito', duration),
        error: () => showError(message, title || 'Error', duration),
        warning: () => showWarning(message, title || 'Advertencia', duration),
        info: () => showInfo(message, title || 'Información', duration)
      }

      const handler = notificationMap[type] || notificationMap.info
      return handler()
    },
    [showSuccess, showError, showWarning, showInfo]
  )

  // Método simplificado para limpiar notificaciones - dejamos que HeroUI lo maneje
  const clearAllNotifications = useCallback(() => {
    Logger.debug(Logger.CATEGORIES.SYSTEM, 'clearAllNotifications called - letting HeroUI handle cleanup', {})
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
