import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PremiumMatchModal from '@components/ui/userSuggestionCards/components/PremiumMatchModal'
import { APP_PATHS } from '@constants/paths.js'

const MatchContext = createContext()

export const useMatch = () => {
  const context = useContext(MatchContext)

  if (!context) {
    throw new Error('useMatch debe usarse dentro de un MatchProvider')
  }

  return context
}

export const MatchProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  const showPremiumModal = () => {
    setIsPremiumModalOpen(true)
  }

  const hidePremiumModal = () => {
    setIsPremiumModalOpen(false)
  }

  const handlePurchasePlan = planId => {
    // Cerrar el modal
    setIsPremiumModalOpen(false)

    // Si no hay planId, navegar a la página de paquetes
    // Si hay planId, navegar directamente al checkout con ese plan
    if (!planId) {
      navigate(APP_PATHS.USER.PURCHASE_PLANS)
    } else {
      navigate(`${APP_PATHS.USER.PURCHASE_CHECKOUT}?planId=${planId}`)
    }
  }

  const value = {
    showPremiumModal,
    hidePremiumModal,
    isPremiumModalOpen
  }

  return (
    <MatchContext.Provider value={value}>
      {children}
      <PremiumMatchModal
        isOpen={isPremiumModalOpen}
        onClose={hidePremiumModal}
        onOpenChange={hidePremiumModal}
        onPurchasePlan={handlePurchasePlan}
      />
    </MatchContext.Provider>
  )
}

export default MatchContext
