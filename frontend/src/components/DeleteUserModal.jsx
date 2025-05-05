import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useAuth } from '@context/AuthContext'
import { deleteUser } from '@services/userService'

const DeleteUserModal = ({ isOpen, onClose, onSuccess, userData }) => {
  const { user: currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Verificar si se puede eliminar el usuario
  const canDeleteUser = () => {
    // No permitir eliminar si:
    // 1. Es el mismo usuario intentando eliminarse a sí mismo
    if (currentUser?.email === userData?.email) {
      setError('No puedes eliminarte a ti mismo')
      return false
    }

    // 2. Un admin intentando eliminar a otro admin
    if (userData?.role === 'ADMIN' && !currentUser?.isSuperAdmin) {
      setError('No tienes permisos para eliminar a otros administradores')
      return false
    }

    return true
  }

  const handleDelete = async () => {
    if (!userData?.email || !canDeleteUser()) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await deleteUser(userData.email)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      let errorMessage = 'Error al eliminar el usuario'

      if (error.message.includes('foreign key constraint fails')) {
        errorMessage = 'No se puede eliminar el usuario porque tiene datos asociados. Por favor, inténtelo de nuevo.'
      } else if (error.message.includes('después de múltiples intentos')) {
        errorMessage = 'No se pudo eliminar el usuario. Por favor, inténtelo más tarde.'
      } else {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      classNames={{
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-800'
      }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Eliminar Usuario</ModalHeader>
        <ModalBody>
          <p>
            ¿Estás seguro que deseas eliminar al usuario{' '}
            <span className="font-semibold">
              {userData?.name} {userData?.lastName}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button color="danger" onPress={handleDelete} disabled={isLoading || !canDeleteUser()} isLoading={isLoading}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteUserModal
