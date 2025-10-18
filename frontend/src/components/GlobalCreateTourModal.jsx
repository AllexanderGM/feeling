import { useCreateTour } from '@contexts/CreateTourContext.jsx'

import CrearTourForm from './CrearTourForm.jsx'

const GlobalCreateTourModal = () => {
  const { isCreateTourModalOpen, closeCreateTourModal } = useCreateTour()

  return (
    <CrearTourForm
      isOpen={isCreateTourModalOpen}
      onClose={closeCreateTourModal}
      onSuccess={() => {
        // Solo cerramos el modal - la actualización la maneja el evento
        closeCreateTourModal()
      }}
    />
  )
}

export default GlobalCreateTourModal
