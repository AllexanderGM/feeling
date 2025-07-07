import { addToast } from '@heroui/react'
import { useCallback } from 'react'

export const useNotification = () => {
  // Función simplificada para crear toasts siguiendo la documentación oficial
  const createToast = useCallback(options => {
    try {
      return addToast(options)
    } catch (error) {
      console.error('Error al mostrar notificación:', error)
      return null
    }
  }, [])

  const showSuccess = useCallback(
    (message, title = 'Éxito', duration = 5000) => {
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
    (message, title = 'Error', duration = 7000) => {
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
    (message, title = 'Advertencia', duration = 6000) => {
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
    (message, title = 'Información', duration = 5000) => {
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
    ({ type = 'info', message, title, duration = 5000 }) => {
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
    console.log('clearAllNotifications called - letting HeroUI handle cleanup')
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
