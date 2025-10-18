import React, { createContext, useContext, useState } from 'react'
import PremiumMatchModal from '@components/ui/userSuggestionCards/components/PremiumMatchModal'

const MatchContext = createContext()

export const useMatch = () => {
  const context = useContext(MatchContext)

  if (!context) {
    throw new Error('useMatch debe usarse dentro de un MatchProvider')
  }

  return context
}

export const MatchProvider = ({ children }) => {
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  const showPremiumModal = () => {
    setIsPremiumModalOpen(true)
  }

  const hidePremiumModal = () => {
    setIsPremiumModalOpen(false)
  }

  const value = {
    showPremiumModal,
    hidePremiumModal,
    isPremiumModalOpen
  }

  return (
    <MatchContext.Provider value={value}>
      {children}
      <PremiumMatchModal isOpen={isPremiumModalOpen} onOpenChange={hidePremiumModal} />
    </MatchContext.Provider>
  )
}

export default MatchContext
