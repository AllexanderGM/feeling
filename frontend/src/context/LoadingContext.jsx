import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext(null)

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const startLoading = (customMessage = 'Cargando...') => {
    setMessage(customMessage)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setMessage('')
  }

  const value = {
    isLoading,
    message,
    startLoading,
    stopLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4'></div>
            <p className='text-white'>{message}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading debe ser usado dentro de LoadingProvider')
  }
  return context
}
