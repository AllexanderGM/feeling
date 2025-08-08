import { useState, useMemo } from 'react'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useError, useAuth, useUser } from '@hooks'
import { Logger } from '@utils/logger.js'

const DeleteUserModal = ({ isOpen, onClose, onSuccess, userData }) => {
  const { user: currentUser } = useAuth()
  const { deleteUser, submitting } = useUser()
  const { handleError, handleSuccess } = useError()
  const [error, setError] = useState(null)

  // Calcular validación sin side effects
  const deletionValidation = useMemo(() => {
    // Do not allow deletion if:
    // 1. It's the same user trying to delete themselves
    if (currentUser?.email === userData?.email) {
      return {
        canDelete: false,
        errorMessage: 'No puedes eliminarte a ti mismo'
      }
    }

    // 2. An admin trying to delete another admin
    if (userData?.role === 'ADMIN' && !currentUser?.isSuperAdmin) {
      return {
        canDelete: false,
        errorMessage: 'No tienes permisos para eliminar a otros administradores'
      }
    }

    return {
      canDelete: true,
      errorMessage: null
    }
  }, [currentUser?.email, currentUser?.isSuperAdmin, userData?.email, userData?.role])

  const handleDelete = async () => {
    if (!userData?.email || !deletionValidation.canDelete) {
      if (deletionValidation.errorMessage) {
        setError(deletionValidation.errorMessage)
      }
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
      Logger.error(Logger.CATEGORIES.USER, 'delete_user', 'Error al eliminar usuario', {
        error,
        userEmail: userData?.email,
        currentUserEmail: currentUser?.email
      })
      const errorMsg = error.message || 'Error al eliminar el usuario'
      setError(errorMsg)
      handleError(error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='sm'
      classNames={{
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-800'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Eliminar Usuario</ModalHeader>
        <ModalBody>
          <p>
            ¿Estás seguro que deseas eliminar al usuario{' '}
            <span className='font-semibold'>
              {userData?.name} {userData?.lastName}
            </span>
            ?
          </p>
          <p className='text-sm text-gray-500 mt-2'>Esta acción no se puede deshacer.</p>
          {(error || deletionValidation.errorMessage) && (
            <p className='text-danger text-sm mt-2'>{error || deletionValidation.errorMessage}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='default' variant='light' onPress={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button color='danger' onPress={handleDelete} disabled={submitting || !deletionValidation.canDelete} isLoading={submitting}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteUserModal
