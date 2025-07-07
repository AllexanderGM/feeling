import { useState } from 'react'
import { useError } from '@hooks/useError.js'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'

const DeleteUserModal = ({ isOpen, onClose, onSuccess, userData }) => {
  const { user: currentUser } = useAuth()
  const { deleteUser, submitting } = useUser()
  const { handleError, handleSuccess } = useError()
  const [error, setError] = useState(null)

  // Verificar si se puede eliminar el usuario
  const canDeleteUser = () => {
    // Do not allow deletion if:
    // 1. It's the same user trying to delete themselves
    if (currentUser?.email === userData?.email) {
      setError('No puedes eliminarte a ti mismo')
      return false
    }

    // 2. An admin trying to delete another admin
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
      setError(null)

      const result = await deleteUser(userData.email)
      if (result.success) {
        handleSuccess('Usuario eliminado exitosamente')
        onSuccess?.()
        onClose()
      } else {
        const errorMsg = result.error || 'Error al eliminar el usuario'
        setError(errorMsg)
        handleError(errorMsg)
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      const errorMsg = error.message || 'Error al eliminar el usuario'
      setError(errorMsg)
      handleError(error)
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
          <Button color="default" variant="light" onPress={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button color="danger" onPress={handleDelete} disabled={submitting || !canDeleteUser()} isLoading={submitting}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteUserModal
