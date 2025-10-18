import { useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip, Spinner } from '@heroui/react'
import { Zap, Sparkles, Crown, Star, Check, X } from 'lucide-react'
import { useMatchPlans } from '@hooks'

/**
 * Modal Premium para compra de intentos de match
 * Se muestra cuando el usuario no tiene intentos disponibles
 */
const PremiumMatchModal = ({ isOpen, onOpenChange, onClose, onPurchasePlan }) => {
  const { plans, loading, fetchAvailablePlans } = useMatchPlans()

  // Cargar planes cuando se abre el modal
  useEffect(() => {
    if (isOpen && plans.length === 0 && !loading) {
      fetchAvailablePlans()
    }
  }, [isOpen]) // Solo depender de isOpen para evitar re-renders innecesarios

  // Identificar el plan premium (precio promedio o marcado como popular)
  const getPremiumPlan = () => {
    if (!plans || plans.length === 0) return null

    // Primero buscar si hay uno marcado como popular
    const popularPlan = plans.find(plan => plan.popular === true)

    if (popularPlan) return popularPlan

    // Si no, buscar el que tenga el precio más cercano al promedio
    const averagePrice = plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length

    // Encontrar el plan con precio más cercano al promedio
    return plans.reduce((closest, current) => {
      const currentDiff = Math.abs(current.price - averagePrice)
      const closestDiff = Math.abs(closest.price - averagePrice)

      return currentDiff < closestDiff ? current : closest
    })
  }

  const premiumPlan = getPremiumPlan()

  const handlePurchase = planId => {
    if (onPurchasePlan) {
      onPurchasePlan(planId)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <Modal
      classNames={{
        base: 'bg-gray-800/86 backdrop-blur-2xl border border-gray-700/50 max-h-[calc(100%_-_0.5rem)]',
        header: 'border-b border-gray-700/50 px-4 py-3 md:px-6 md:py-4',
        body: 'overflow-y-auto px-4 py-4 md:px-6 md:py-6',
        footer: 'border-t border-gray-700/50 px-4 py-3 md:px-6 md:py-4',
        closeButton: 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
      }}
      isOpen={isOpen}
      scrollBehavior='inside'
      size='4xl'
      onOpenChange={onOpenChange}>
      <ModalContent>
        {onModalClose => (
          <>
            <ModalHeader>
              <div className='flex flex-col sm:flex-row items-center gap-3 w-full'>
                <div className='relative flex-shrink-0'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center'>
                    <Zap className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                  </div>
                  <div className='absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                    <Sparkles className='w-2 h-2 sm:w-3 sm:h-3 text-white' />
                  </div>
                </div>
                <div className='flex-1 text-center sm:text-left'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                    ¡Ups! Te has quedado sin intentos
                  </h2>
                  <p className='text-xs sm:text-sm text-gray-400 mt-1'>Elige un plan para seguir encontrando tu match perfecto</p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Mensaje motivacional */}
              <div className='mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-primary-900/30 via-purple-900/30 to-pink-900/30 rounded-lg border border-primary-500/30'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Crown className='w-4 h-4 md:w-5 md:h-5 text-white' />
                  </div>
                  <div>
                    <h3 className='text-base md:text-lg font-semibold text-gray-100 mb-1'>¡No te detengas ahora!</h3>
                    <p className='text-xs md:text-sm text-gray-300 leading-relaxed'>
                      Has usado todos tus intentos diarios. Obtén más para seguir conociendo personas increíbles y encontrar tu conexión
                      perfecta.
                    </p>
                  </div>
                </div>
              </div>

              {/* Planes de match */}
              {loading ? (
                <div className='flex justify-center items-center py-12'>
                  <Spinner color='primary' label='Cargando planes...' size='lg' />
                </div>
              ) : plans.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-gray-400'>No hay planes disponibles en este momento.</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6'>
                  {plans.map(plan => {
                    const isPremium = premiumPlan && plan.id === premiumPlan.id

                    return (
                      <Card
                        key={plan.id}
                        className={`${
                          isPremium
                            ? 'bg-gradient-to-br from-primary-900/40 via-purple-900/40 to-pink-900/40 border-2 border-primary-500/50 sm:transform sm:scale-105'
                            : 'bg-gray-800/50 border border-gray-700/50'
                        } transition-all duration-300 hover:scale-105 ${isPremium ? 'mt-5 sm:mt-4' : ''}`}>
                        <CardBody className='p-4 md:p-5'>
                          {/* Badge de popular/premium */}
                          {isPremium && (
                            <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 z-10'>
                              <Chip
                                className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold'
                                size='sm'
                                startContent={<Star className='w-3 h-3 fill-current' />}>
                                Más Popular
                              </Chip>
                            </div>
                          )}

                          {/* Nombre del plan */}
                          <div className={`text-center mb-3 md:mb-4 ${isPremium ? 'mt-3 md:mt-4' : 'mt-1 md:mt-2'}`}>
                            <h4 className='text-lg md:text-xl font-bold text-gray-100 mb-1'>{plan.name}</h4>
                            <div className='flex items-baseline justify-center gap-1'>
                              <span className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent'>
                                ${plan.price}
                              </span>
                              <span className='text-xs md:text-sm text-gray-400'>/mes</span>
                            </div>
                          </div>

                          {/* Intentos */}
                          <div className='mb-3 md:mb-4 p-2 md:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 text-center'>
                            <div className='text-xl md:text-2xl font-bold text-primary-400'>{plan.attempts}</div>
                            <div className='text-[10px] md:text-xs text-gray-400'>Intentos de match</div>
                          </div>

                          {/* Features */}
                          <ul className='space-y-1.5 md:space-y-2 mb-4 md:mb-6'>
                            {/* Intentos */}
                            <li className='flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-300'>
                              <Check className='w-3 h-3 md:w-4 md:h-4 text-primary-400 flex-shrink-0 mt-0.5' />
                              <span>{plan.attempts} intentos de match</span>
                            </li>
                            {/* Duración */}
                            {plan.duration && (
                              <li className='flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-300'>
                                <Check className='w-3 h-3 md:w-4 md:h-4 text-primary-400 flex-shrink-0 mt-0.5' />
                                <span>Válido por {plan.duration} días</span>
                              </li>
                            )}
                            {/* Descripción */}
                            {plan.description && (
                              <li className='flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-300'>
                                <Check className='w-3 h-3 md:w-4 md:h-4 text-primary-400 flex-shrink-0 mt-0.5' />
                                <span>{plan.description}</span>
                              </li>
                            )}
                            {/* Features adicionales si vienen del backend */}
                            {plan.features &&
                              Array.isArray(plan.features) &&
                              plan.features.map((feature, index) => (
                                <li key={index} className='flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-300'>
                                  <Check className='w-3 h-3 md:w-4 md:h-4 text-primary-400 flex-shrink-0 mt-0.5' />
                                  <span>{feature}</span>
                                </li>
                              ))}
                          </ul>

                          {/* Botón de compra */}
                          <Button
                            className={`w-full ${
                              isPremium
                                ? 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                            } text-white font-semibold`}
                            size='sm'
                            onPress={() => handlePurchase(plan.id)}>
                            {isPremium ? `¡Obtener ${plan.name}!` : 'Seleccionar Plan'}
                          </Button>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Info adicional */}
              <div className='mt-4 md:mt-6 text-center'>
                <p className='text-[10px] md:text-xs text-gray-400 leading-relaxed'>
                  Los intentos de match no se renuevan automáticamente. Adquiere un plan para continuar descubriendo conexiones especiales y
                  aumentar tus posibilidades de encontrar a esa persona perfecta.
                </p>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                className='text-gray-400 hover:text-white text-sm'
                size='sm'
                startContent={<X className='w-3 h-3 md:w-4 md:h-4' />}
                variant='light'
                onPress={onModalClose}>
                Cancelar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PremiumMatchModal
