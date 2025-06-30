import { addToast } from '@heroui/react'

export const useNotification = () => {
  const showSuccess = (message, title = 'Éxito', duration = 5000) => {
    return addToast({
      title,
      description: message,
      color: 'success',
      variant: 'flat',
      timeout: duration
    })
  }

  const showError = (message, title = 'Error', duration = 7000) => {
    return addToast({
      title,
      description: message,
      color: 'danger',
      variant: 'flat',
      timeout: duration
    })
  }

  const showWarning = (message, title = 'Advertencia', duration = 6000) => {
    return addToast({
      title,
      description: message,
      color: 'warning',
      variant: 'flat',
      timeout: duration
    })
  }

  const showInfo = (message, title = 'Información', duration = 5000) => {
    return addToast({
      title,
      description: message,
      color: 'primary',
      variant: 'flat',
      timeout: duration
    })
  }

  // Método para compatibilidad con tu código existente
  const addNotification = ({ type = 'info', message, title, duration = 5000 }) => {
    switch (type) {
      case 'success':
        return showSuccess(message, title || 'Éxito', duration)
      case 'error':
        return showError(message, title || 'Error', duration)
      case 'warning':
        return showWarning(message, title || 'Advertencia', duration)
      case 'info':
      default:
        return showInfo(message, title || 'Información', duration)
    }
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification
  }
}
