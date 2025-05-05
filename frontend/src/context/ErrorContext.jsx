import { createContext, useState } from 'react'

const ErrorContext = createContext()

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertType, setAlertType] = useState('modal')
  const [alerts, setAlerts] = useState([])

  const showErrorModal = (message, title = 'Error', details = null) => {
    setError({ message, title, details })
    setAlertType('modal')
    setIsModalOpen(true)
  }

  const showErrorAlert = (message, title = 'Error', details = null) => {
    const id = Date.now()

    const newAlert = { id, message, title, details }
    setAlerts(prevAlerts => [...prevAlerts, newAlert])

    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id))
    }, 5000)
  }

  const handleError = (error, type = 'alert') => {
    console.error('Error capturado:', error)

    let errorMessage = 'Ha ocurrido un error inesperado'
    let errorDetails = null

    if (typeof error === 'string') {
      errorMessage = error
    } else if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack
    } else if (error.response && error.response.data) {
      errorMessage = error.response.data.message || 'Error del servidor'
      errorDetails = error.response.data
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
