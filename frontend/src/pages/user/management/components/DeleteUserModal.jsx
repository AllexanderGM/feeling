import { useState, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, Chip } from '@heroui/react'
import { Trash2, AlertTriangle, User, Shield, UserIcon } from 'lucide-react'
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
    if (currentUser?.email === userData?.profile?.email) {
      return {
        canDelete: false,
        errorMessage: 'No puedes eliminarte a ti mismo'
      }
    }

    // 2. An admin trying to delete another admin
    if (userData?.status?.role === 'ADMIN' && !currentUser?.isSuperAdmin) {
      return {
        canDelete: false,
        errorMessage: 'No tienes permisos para eliminar a otros administradores'
      }
    }

    return {
      canDelete: true,
      errorMessage: null
    }
  }, [currentUser?.email, currentUser?.isSuperAdmin, userData?.profile?.email, userData?.status?.role])

  const handleDelete = async () => {
    if (!userData?.profile?.email || !deletionValidation.canDelete) {
      if (deletionValidation.errorMessage) {
        setError(deletionValidation.errorMessage)
      }

      return
    }

    try {
      setError(null)

      const result = await deleteUser(userData.user.email)

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
        userEmail: userData?.profile?.email,
        currentUserEmail: currentUser?.email
      })
      const errorMsg = error.message || 'Error al eliminar el usuario'

      setError(errorMsg)
      handleError(error)
    }
  }

  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-700',
        header: 'border-b border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-700'
      }}
      isOpen={isOpen}
      size='lg'
      onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center'>
              <Trash2 className='w-4 h-4 text-red-400' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-200'>Eliminar Usuario</h3>
              <p className='text-sm text-gray-400'>
                {userData?.profile?.name} {userData?.profile?.lastName}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className='space-y-4'>
          {/* Advertencia de acción irreversible */}
          <div className='bg-red-500/20 border border-red-500/40 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertTriangle className='w-4 h-4 text-red-400' />
              <span className='text-sm font-medium text-red-300'>Acción Irreversible</span>
            </div>
            <p className='text-xs text-red-200'>
              Esta acción eliminará permanentemente al usuario y todos sus datos. Esta acción NO se puede deshacer.
            </p>
          </div>

          {/* Información del usuario */}
          <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <User className='w-4 h-4 text-red-400' />
              <span className='text-sm font-medium text-gray-200'>Usuario a Eliminar</span>
            </div>
            <div className='flex items-center gap-3'>
              <Avatar
                className='w-12 h-12'
                icon={<UserIcon className='w-6 h-6 text-default-500' />}
                src={userData?.profile?.mainImage || userData?.profile?.image}
              />
              <div className='flex-1'>
                <p className='text-sm font-semibold text-gray-200'>
                  {userData?.profile?.name} {userData?.profile?.lastName}
                </p>
                <p className='text-xs text-gray-400'>{userData?.profile?.email}</p>
                <div className='flex items-center gap-2 mt-1'>
                  {userData?.status?.role && (
                    <Chip color={userData.status.role === 'ADMIN' ? 'warning' : 'default'} size='sm' variant='flat'>
                      {userData.status.role}
                    </Chip>
                  )}
                  {userData?.status?.active !== undefined && (
                    <Chip color={userData.status.active ? 'success' : 'danger'} size='sm' variant='dot'>
                      {userData.status.active ? 'Activo' : 'Inactivo'}
                    </Chip>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Validaciones y errores */}
          {!deletionValidation.canDelete && (
            <div className='bg-orange-500/20 border border-orange-500/40 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Shield className='w-4 h-4 text-orange-400' />
                <span className='text-sm font-medium text-orange-300'>Restricción de Eliminación</span>
              </div>
              <p className='text-xs text-orange-200'>{deletionValidation.errorMessage}</p>
            </div>
          )}

          {error && (
            <div className='bg-red-500/20 border border-red-500/40 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <AlertTriangle className='w-4 h-4 text-red-400' />
                <span className='text-sm font-medium text-red-300'>Error</span>
              </div>
              <p className='text-xs text-red-200'>{error}</p>
            </div>
          )}

          {/* Confirmación */}
          {deletionValidation.canDelete && (
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Trash2 className='w-4 h-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-300'>Confirmación de Eliminación</span>
              </div>
              <p className='text-xs text-gray-300'>
                ¿Confirmas que deseas eliminar permanentemente este usuario? Todos sus datos, matches y conversaciones serán eliminados
                definitivamente.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='default' isDisabled={submitting} variant='light' onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color='danger'
            isDisabled={submitting || !deletionValidation.canDelete}
            isLoading={submitting}
            startContent={<Trash2 className='w-4 h-4' />}
            onPress={handleDelete}>
            Eliminar Usuario
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteUserModal
