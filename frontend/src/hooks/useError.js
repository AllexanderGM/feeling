import { useContext } from 'react'
import ErrorContext from '@context/ErrorContext'

const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError debe ser usado dentro de un ErrorProvider')
  }
  return context
}

export default useError
