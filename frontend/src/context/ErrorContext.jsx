import { createContext, useState } from 'react'
import { Logger } from '@utils/logger.js'

const ErrorContext = createContext()

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertType, setAlertType] = useState('modal')
  const [alerts, setAlerts] = useState([])

  // Función de utilidad para extraer mensajes seguros
  const getSafeErrorMessage = err => {
    if (typeof err === 'string') return err
    if (err instanceof Error) return err.message || 'Error desconocido'
    if (err && typeof err === 'object') {
      if (err.response && err.response.data) {
        return err.response.data.message || 'Error del servidor'
      }
      if (err.message && typeof err.message === 'string') return err.message
      try {
        return JSON.stringify(err)
      } catch {
        return 'Error desconocido'
      }
    }
    return String(err || 'Error desconocido')
  }

  const showErrorModal = (message, title = 'Error', details = null) => {
    // Asegurarse de que message sea siempre un string
    const safeMessage = getSafeErrorMessage(message)

    // Asegurarse de que title sea siempre un string
    const safeTitle = typeof title === 'string' ? title : 'Error'

    setError({
      message: safeMessage,
      title: safeTitle,
      details
    })

    setAlertType('modal')
    setIsModalOpen(true)
  }

  const showErrorAlert = (message, title = 'Error', details = null) => {
    // Asegurarse de que message sea siempre un string
    const safeMessage = getSafeErrorMessage(message)

    // Asegurarse de que title sea siempre un string
    const safeTitle = typeof title === 'string' ? title : 'Error'

    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Verificar si ya existe una alerta con el mismo mensaje
    const existingAlert = alerts.find(alert => alert.message === safeMessage)

    if (existingAlert) {
      // Si ya existe, actualizamos su timestamp para extender su duración
      setAlerts(prevAlerts => prevAlerts.map(alert => (alert.id === existingAlert.id ? { ...alert, timestamp: Date.now() } : alert)))
      return
    }

    // Si no existe, creamos una nueva
    const newAlert = {
      id,
      message: safeMessage,
      title: safeTitle,
      details,
      timestamp: Date.now()
    }

    setAlerts(prevAlerts => [...prevAlerts, newAlert])

    // Configurar el timeout para eliminar la alerta
    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id))
    }, 5000)
  }

  const handleError = (error, type = 'alert') => {
    Logger.error(Logger.CATEGORIES.SYSTEM, 'handleError', error, {
      context: { errorType: type, errorDetails: error }
    })

    let errorMessage = 'Ha ocurrido un error inesperado'
    let errorDetails = null

    if (typeof error === 'string') {
      errorMessage = error
    } else if (error instanceof Error) {
      errorMessage = error.message || 'Error sin mensaje'
      errorDetails = error.stack
    } else if (error && typeof error === 'object') {
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || 'Error del servidor'
        errorDetails = error.response.data
      } else if (error.message) {
        errorMessage = String(error.message)
      } else {
        try {
          errorMessage = JSON.stringify(error)
        } catch {
          errorMessage = 'Error no serializable'
        }
      }
    } else if (error === undefined || error === null) {
      errorMessage = 'Error desconocido'
    } else {
      errorMessage = String(error)
    }

    if (type === 'modal') {
      showErrorModal(errorMessage, 'Error', errorDetails)
    } else {
      showErrorAlert(errorMessage, 'Error', errorDetails)
    }
  }

  const closeErrorModal = () => {
    setIsModalOpen(false)
  }

  const closeAlert = id => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id))
  }

  const value = {
    error,
    isModalOpen,
    alertType,
    alerts,
    showErrorModal,
    showErrorAlert,
    handleError,
    closeErrorModal,
    closeAlert
  }

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

export default ErrorContext
