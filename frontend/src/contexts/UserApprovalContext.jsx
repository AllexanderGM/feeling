import { createContext, useContext } from 'react'
import { useDisclosure } from '@heroui/react'
import UserNotApprovedModal from '@components/ui/userSuggestionCards/components/UserNotApprovedModal'

const UserApprovalContext = createContext()

export const useUserApproval = () => {
  const context = useContext(UserApprovalContext)

  // No lanzar error, retornar un objeto por defecto si no está disponible
  if (!context) {
    return { showNotApprovedModal: () => {} }
  }

  return context
}

export const UserApprovalProvider = ({ children }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  /**
   * Muestra el modal de usuario no aprobado
   * Se llama cuando se captura el error USER_NOT_APPROVED del backend
   */
  const showNotApprovedModal = () => {
    onOpen()
  }

  return (
    <UserApprovalContext.Provider value={{ showNotApprovedModal }}>
      {children}
      <UserNotApprovedModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </UserApprovalContext.Provider>
  )
}
