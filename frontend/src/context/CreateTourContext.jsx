import { createContext, useContext, useState } from 'react'

const CreateTourContext = createContext()

export const CreateTourProvider = ({ children }) => {
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false)

  const openCreateTourModal = () => setIsCreateTourModalOpen(true)
  const closeCreateTourModal = () => setIsCreateTourModalOpen(false)

  return (
    <CreateTourContext.Provider value={{ isCreateTourModalOpen, openCreateTourModal, closeCreateTourModal }}>
      {children}
    </CreateTourContext.Provider>
  )
}

export const useCreateTour = () => {
  const context = useContext(CreateTourContext)
  if (!context) {
    throw new Error('useCreateTour debe ser usado dentro de un CreateTourProvider')
  }
  return context
}
