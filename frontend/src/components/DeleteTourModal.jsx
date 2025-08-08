import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'

const DeleteTourModal = ({ isOpen, onClose, onConfirm, tourData, isLoading, error }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop='blur' size='sm'>
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
          <Button variant='flat' color='default' onPress={onClose}>
            Cancelar
          </Button>
          <Button color='danger' onPress={onConfirm} isLoading={isLoading}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteTourModal
