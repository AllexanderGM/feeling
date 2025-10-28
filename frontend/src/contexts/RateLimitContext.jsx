import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import RateLimitModal from '@components/common/feedback/RateLimitModal.jsx'

const RateLimitContext = createContext()

export const useRateLimit = () => {
  const context = useContext(RateLimitContext)

  if (!context) {
    throw new Error('useRateLimit debe usarse dentro de un RateLimitProvider')
  }

  return context
}

export const RateLimitProvider = ({ children }) => {
  const [rateLimitError, setRateLimitError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showRateLimitModal = useCallback(error => {
    setRateLimitError(error)
    setIsModalOpen(true)
  }, [])

  const hideRateLimitModal = useCallback(() => {
    setIsModalOpen(false)
    setRateLimitError(null)
  }, [])

  const value = useMemo(
    () => ({
      showRateLimitModal,
      hideRateLimitModal,
      isModalOpen,
      rateLimitError
    }),
    [showRateLimitModal, hideRateLimitModal, isModalOpen, rateLimitError]
  )

  return (
    <RateLimitContext.Provider value={value}>
      {children}
      <RateLimitModal error={rateLimitError} isOpen={isModalOpen} onClose={hideRateLimitModal} />
    </RateLimitContext.Provider>
  )
}

export default RateLimitContext
