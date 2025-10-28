import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react'
import { Sparkles, Crown, Heart } from 'lucide-react'

/**
 * Modal Premium para redirigir a compra de intentos de match
 * Se muestra cuando el usuario no tiene intentos disponibles
 */
const PremiumMatchModal = ({ isOpen, onOpenChange, onClose, onPurchasePlan, userName, userImage }) => {
  const handleViewPlans = () => {
    if (onPurchasePlan) {
      onPurchasePlan(null)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gradient-to-br from-primary-900/40 via-purple-900/40 to-pink-900/40 border border-primary-500/60 shadow-2xl shadow-primary-500/20',
        header: 'border-b border-gray-800',
        body: 'py-6',
        footer: 'border-t border-gray-800'
      }}
      isOpen={isOpen}
      placement='center'
      size='sm'
      onOpenChange={onOpenChange}>
      <ModalContent>
        {onModalClose => (
          <>
            <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
              {/* Avatar con badge premium */}
              <div className='relative'>
                <Avatar
                  isBordered
                  className='w-20 h-20'
                  classNames={{
                    base: 'ring-4 ring-primary-500/30 ring-offset-2 ring-offset-purple-500/10'
                  }}
                  color='primary'
                  name={userName}
                  src={userImage}
                />
                <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg shadow-yellow-500/50 animate-pulse'>
                  <Crown className='w-4 h-4 text-white' />
                </div>
              </div>
              {/* Título y subtítulo */}
              <div className='text-center'>
                <h3 className='text-xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1'>
                  ¡No te quedes con las ganas!
                </h3>
                <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                  <Sparkles className='w-3 h-3 text-primary-400' />
                  Sin intentos disponibles
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className='text-center space-y-3'>
                <p className='text-gray-300 text-sm'>
                  ¿Quieres conocer a <span className='font-semibold text-primary-400'>{userName}</span>?
                </p>
                <div className='bg-gradient-to-br from-primary-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-lg p-4 border border-primary-500/30'>
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center'>
                      <Heart className='w-5 h-5 text-white fill-current' />
                    </div>
                    <p className='text-xs text-gray-200 text-left'>
                      Consigue más intentos de match y sigue conectando con personas increíbles
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className='flex-col gap-2 pb-6'>
              <Button
                fullWidth
                className='bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-primary-500/50'
                radius='full'
                startContent={<Crown className='w-4 h-4' />}
                onPress={handleViewPlans}>
                Ver Paquetes Premium
              </Button>
              <Button fullWidth className='bg-gray-800 hover:bg-gray-700 text-gray-300' radius='full' variant='flat' onPress={onModalClose}>
                Ahora no
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PremiumMatchModal
