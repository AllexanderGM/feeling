import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react'
import { Heart, Sparkles } from 'lucide-react'

/**
 * Modal de confirmación para enviar match
 */
const MatchConfirmModal = ({ isOpen, onOpenChange, onConfirm, userName, userImage }) => {
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
                    base: 'ring-4 ring-pink-500/30'
                  }}
                  color='danger'
                  name={userName}
                  src={userImage}
                />
                <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                  <Heart className='w-4 h-4 text-white fill-current' />
                </div>
              </div>
              {/* Título y subtítulo */}
              <div className='text-center'>
                <h3 className='text-xl font-bold text-white mb-1'>¿Hacer match con {userName}?</h3>
                <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                  <Sparkles className='w-3 h-3 text-secondary-400' />
                  Confirma para enviar tu like
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className='text-center space-y-2'>
                <p className='text-gray-300 text-sm'>
                  Si <span className='font-semibold text-pink-400'>{userName}</span> también te da like, ¡será un match!
                </p>
              </div>
            </ModalBody>

            <ModalFooter className='justify-center gap-3 pb-6'>
              <Button className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]' radius='full' variant='flat' onPress={onClose}>
                Cancelar
              </Button>
              <Button
                className='bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold min-w-[140px]'
                radius='full'
                startContent={<Heart className='w-4 h-4 fill-current' />}
                onPress={() => {
                  try {
                    onConfirm()
                  } finally {
                    onClose()
                  }
                }}>
                Confirmar Match
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default MatchConfirmModal
