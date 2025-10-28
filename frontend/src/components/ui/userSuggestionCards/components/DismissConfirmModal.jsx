import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react'
import { X, AlertTriangle } from 'lucide-react'

/**
 * Modal de confirmación para descartar usuario
 */
const DismissConfirmModal = ({ isOpen, onOpenChange, onConfirm, userName, userImage }) => {
  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-secondary-500/5',
        header: 'border-b border-gray-800',
        body: 'py-6',
        footer: 'border-t border-gray-800'
      }}
      isOpen={isOpen}
      placement='center'
      size='sm'
      onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
              {/* Avatar con badge de acción */}
              <div className='relative'>
                <Avatar
                  isBordered
                  className='w-20 h-20'
                  classNames={{
                    base: 'ring-4 ring-gray-700/30 grayscale'
                  }}
                  color='default'
                  name={userName}
                  src={userImage}
                />
                <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                  <X className='w-4 h-4 text-gray-300' strokeWidth={2.5} />
                </div>
              </div>
              {/* Título y subtítulo */}
              <div className='text-center'>
                <h3 className='text-xl font-bold text-white mb-1'>¿Descartar a {userName}?</h3>
                <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  Este perfil aparecerá menos en tus sugerencias.
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className='text-center space-y-2'>
                <p className='text-gray-300 text-sm'>
                  <span className='font-semibold text-white'>{userName}</span> será descartado de tus sugerencias de usuario. Aparecerá
                  menos en tu feed, pero podrás encontrar su perfil en la sección de búsqueda si cambias de opinión.
                </p>
              </div>
            </ModalBody>

            <ModalFooter className='justify-center gap-3 pb-6'>
              <Button className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]' radius='full' variant='flat' onPress={onClose}>
                Cancelar
              </Button>
              <Button
                className='bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold min-w-[120px]'
                radius='full'
                startContent={<X className='w-4 h-4' strokeWidth={2.5} />}
                onPress={() => {
                  try {
                    onConfirm()
                  } finally {
                    onClose()
                  }
                }}>
                Descartar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default DismissConfirmModal
