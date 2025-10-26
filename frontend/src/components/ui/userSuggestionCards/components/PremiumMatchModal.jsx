import { Modal, ModalContent, ModalBody, Button } from '@heroui/react'
import { Sparkles, Crown, ArrowRight, Zap } from 'lucide-react'

/**
 * Modal Premium para redirigir a compra de intentos de match
 * Se muestra cuando el usuario no tiene intentos disponibles
 * Diseño mobile first premium acorde con la página de paquetes
 * Usa correctamente las props y estructura de Hero UI
 */
const PremiumMatchModal = ({ isOpen, onOpenChange, onClose, onPurchasePlan }) => {
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
      backdrop='blur'
      classNames={{
        backdrop: 'bg-gray-900/80',
        base: 'bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border border-gray-700/50',
        closeButton: 'text-white/60 hover:text-white hover:bg-white/10'
      }}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        }
      }}
      scrollBehavior='inside'
      size='2xl'
      onOpenChange={onOpenChange}>
      <ModalContent>
        {onModalClose => (
          <>
            <ModalBody className='py-6 px-5 sm:py-8 sm:px-8 md:py-10 md:px-10'>
              <div className='space-y-5 sm:space-y-7 md:space-y-8'>
                {/* Header con icono y título - mobile first */}
                <div className='text-center space-y-3 sm:space-y-4 md:space-y-5'>
                  {/* Icono principal con efecto premium */}
                  <div className='relative inline-block'>
                    <div className='absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-50 sm:opacity-60 animate-pulse' />
                    <div className='relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl'>
                      <Zap className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                      <div className='absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg'>
                        <Sparkles className='w-3 h-3 sm:w-4 sm:h-4 text-white' />
                      </div>
                    </div>
                  </div>

                  {/* Título y subtítulo - tamaños estándar */}
                  <div className='space-y-2 sm:space-y-3'>
                    <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight'>
                      ¡Ups! Sin intentos disponibles
                    </h2>
                    <p className='text-sm sm:text-base text-gray-300 max-w-md mx-auto leading-relaxed'>
                      ¿Quieres seguir haciendo match? Conoce nuestros paquetes y continúa conectando
                    </p>
                  </div>
                </div>

                {/* Contenido principal - mobile first */}
                <div className='space-y-4 sm:space-y-5 md:space-y-6'>
                  {/* Card de beneficios principal - ajustado para mobile */}
                  <div className='bg-gradient-to-br from-primary-900/40 via-purple-900/40 to-pink-900/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-primary-500/30 shadow-xl'>
                    <div className='flex items-start gap-3 sm:gap-4'>
                      <div className='flex-shrink-0'>
                        <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg'>
                          <Crown className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
                        </div>
                      </div>
                      <div className='flex-1 space-y-1 sm:space-y-2'>
                        <h3 className='text-base sm:text-lg font-bold text-white'>¡No te detengas ahora!</h3>
                        <p className='text-sm text-gray-200 leading-relaxed'>
                          Cada intento es una oportunidad para encontrar a esa persona especial. Compra más intentos cuando los necesites,
                          sin compromisos.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info adicional - mobile first */}
                  <div className='text-center pt-1 sm:pt-2'>
                    <p className='text-xs sm:text-sm text-gray-400 leading-relaxed'>Sin suscripciones • Válidos 30 días • Soporte 24/7</p>
                  </div>
                </div>

                {/* Botones de acción - mobile first */}
                <div className='space-y-2 sm:space-y-3 pt-1 sm:pt-2'>
                  <Button
                    fullWidth
                    className='bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-2xl shadow-primary-500/50'
                    endContent={<ArrowRight className='w-4 h-4 sm:w-5 sm:h-5' />}
                    radius='lg'
                    size='lg'
                    startContent={<Crown className='w-4 h-4 sm:w-5 sm:h-5' />}
                    onPress={handleViewPlans}>
                    Ver Paquetes de Intentos
                  </Button>

                  <Button fullWidth className='text-gray-400 hover:text-white' radius='lg' size='md' variant='light' onPress={onModalClose}>
                    Ahora no, gracias
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PremiumMatchModal
