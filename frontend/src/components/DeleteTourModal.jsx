import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'

const DeleteTourModal = ({ isOpen, onClose, onConfirm, tourData, isLoading, error }) => {
  return (
    <Modal backdrop='blur' isOpen={isOpen} size='sm' onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Confirmar eliminación</ModalHeader>
        <ModalBody>
          {error && <p className='text-danger'>{error}</p>}
          <p>
            ¿Estás seguro que deseas eliminar el tour
            <span className='font-bold'> {tourData?.nombre}</span>?
          </p>
          <p className='text-small text-default-500'>Esta acción no se puede deshacer.</p>
        </ModalBody>
        <ModalFooter>
          <Button color='default' variant='flat' onPress={onClose}>
            Cancelar
          </Button>
          <Button color='danger' isLoading={isLoading} onPress={onConfirm}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteTourModal
