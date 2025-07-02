import { addToast } from '@heroui/react'

export const useNotification = () => {
  const showSuccess = (message, title = 'Éxito', duration = 5000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'success',
        variant: 'flat',
        timeout: duration
      })
    } catch (error) {
      console.error('Error al mostrar notificación de éxito:', error)
    }
  }

  const showError = (message, title = 'Error', duration = 7000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'danger',
        variant: 'flat',
        timeout: duration
      })
    } catch (error) {
      console.error('Error al mostrar notificación de error:', error)
    }
  }

  const showWarning = (message, title = 'Advertencia', duration = 6000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'warning',
        variant: 'flat',
        timeout: duration
      })
    } catch (error) {
      console.error('Error al mostrar notificación de advertencia:', error)
    }
  }

  const showInfo = (message, title = 'Información', duration = 5000) => {
    try {
      return addToast({
        title,
        description: message,
        color: 'default',
        variant: 'bordered',
        timeout: duration
      })
    } catch (error) {
      console.error('Error al mostrar notificación de información:', error)
    }
  }

  // Método genérico mejorado
  const addNotification = ({ type = 'info', message, title, duration = 5000 }) => {
    const notificationMap = {
      success: () => showSuccess(message, title || 'Éxito', duration),
      error: () => showError(message, title || 'Error', duration),
      warning: () => showWarning(message, title || 'Advertencia', duration),
      info: () => showInfo(message, title || 'Información', duration)
    }

    const handler = notificationMap[type] || notificationMap.info
    return handler()
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification
  }
}
