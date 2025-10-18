import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react'
import { Star, Bookmark } from 'lucide-react'

/**
 * Modal de confirmación cuando se agrega un usuario a favoritos
 */
const FavoriteSuccessModal = ({ isOpen, userName, userImage, onContinue, onOpenChange }) => {
  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-700',
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
                    base: 'ring-4 ring-blue-500/30 ring-offset-2 ring-offset-secondary-500/10'
                  }}
                  color='primary'
                  name={userName}
                  src={userImage}
                />
                <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg shadow-blue-500/50'>
                  <Bookmark className='w-4 h-4 text-white fill-current' />
                </div>
              </div>
              {/* Título y subtítulo */}
              <div className='text-center'>
                <h3 className='text-xl font-bold text-white mb-1'>¡Agregado a favoritos!</h3>
                <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                  <Star className='w-3 h-3 fill-current text-secondary-400' />
                  {userName} está guardado en tu lista
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className='text-center space-y-2'>
                <p className='text-gray-300 text-sm'>
                  Puedes consultar a <span className='font-semibold text-blue-400'>{userName}</span> desde tu panel de favoritos.
                </p>
              </div>
            </ModalBody>

            <ModalFooter className='justify-center pb-6'>
              <Button
                className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold min-w-[180px] shadow-lg shadow-blue-500/30 border border-secondary-500/20'
                radius='full'
                onPress={() => {
                  onContinue()
                  onClose()
                }}>
                Continuar explorando
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default FavoriteSuccessModal
