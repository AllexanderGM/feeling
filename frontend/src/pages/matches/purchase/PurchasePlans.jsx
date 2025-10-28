import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Chip } from '@heroui/react'
import { Package, Star, Check, CreditCard, ArrowLeft, Shield, Zap, Users, TrendingUp, Sparkles, Crown } from 'lucide-react'
import { useAuth } from '@hooks'
import { matchPlanService } from '@services'
import { APP_PATHS } from '@constants/paths'
import { getUserMatches } from '@schemas'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { Logger } from '@utils/logger.js'

const PurchasePlans = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get current attempts from user
  const currentAttempts = useMemo(() => {
    if (!user) return 0
    const matches = getUserMatches(user)

    return matches?.availableAttempts || 0
  }, [user])

  // Load available plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        setError(null)

        Logger.info(Logger.CATEGORIES.SERVICE, 'load_plans', 'Cargando paquetes de intentos disponibles')

        // handleServiceResponse ya retorna directamente los datos (array de planes)
        const plans = await matchPlanService.getAvailablePlans()

        Logger.info(Logger.CATEGORIES.SERVICE, 'load_plans', `${plans?.length || 0} paquetes cargados exitosamente`, { plans })

        if (Array.isArray(plans) && plans.length > 0) {
          setPlans(plans)
        } else {
          Logger.warn(Logger.CATEGORIES.SERVICE, 'load_plans', 'No hay paquetes disponibles', { plans })
          setPlans([])
        }
      } catch (err) {
        const errorMsg = err?.message || 'Error al cargar los paquetes de intentos'

        Logger.error(Logger.CATEGORIES.SERVICE, 'load_plans', 'Error cargando paquetes', { error: err, message: errorMsg })
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  const handlePurchasePlan = plan => {
    navigate(APP_PATHS.USER.PURCHASE_CHECKOUT, { state: { plan } })
  }

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.MY_MATCHES)
  }

  if (loading) return <LoadData>Cargando paquetes disponibles...</LoadData>
  if (error) return <LoadDataError message={error} />

  // Determinar cuál es el paquete más popular
  const popularPlan = plans.find(p => p.sortOrder === 2) || plans[1]

  return (
    <>
      <Helmet>
        <title>Paquetes de Intentos - Feeling</title>
        <meta content='Compra paquetes de intentos para seguir conectando con personas increíbles' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de compra de paquetes de intentos' className='gap-8 relative z-10 !pt-0'>
        {/* Header Premium */}
        <div className='space-y-6 w-full'>
          <Button
            className='text-gray-400 hover:text-gray-200 backdrop-blur-sm'
            size='sm'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='light'
            onPress={handleGoBack}>
            Volver
          </Button>

          <div className='text-center space-y-4'>
            {/* Icono principal con efecto premium */}
            <div className='relative inline-block'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 rounded-3xl blur-xl opacity-50 animate-pulse' />
              <div className='relative w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl'>
                <Crown className='w-10 h-10 text-white' />
                <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce'>
                  <Sparkles className='w-4 h-4 text-white' />
                </div>
              </div>
            </div>

            <div>
              <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3'>
                Paquetes de Intentos
              </h1>
              <p className='text-gray-300 text-lg max-w-2xl mx-auto'>
                Compra más intentos y sigue encontrando conexiones auténticas sin límites
              </p>
            </div>

            {/* Badge de intentos actuales con diseño premium */}
            <div className='inline-flex items-center gap-3 bg-gradient-to-r from-primary-900/40 via-purple-900/40 to-pink-900/40 border border-primary-500/30 rounded-full px-6 py-3 backdrop-blur-sm'>
              <div className='relative'>
                <Zap className='w-5 h-5 text-primary-400' />
                <div className='absolute -top-1 -right-1 w-2 h-2 bg-primary-400 rounded-full animate-ping' />
              </div>
              <span className='text-sm text-gray-200'>
                Tienes{' '}
                <span className='font-bold text-transparent bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text'>
                  {currentAttempts}
                </span>{' '}
                {currentAttempts === 1 ? 'intento disponible' : 'intentos disponibles'}
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Section con diseño mejorado */}
        <Card className='w-full bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-pink-900/30 border-purple-500/40 backdrop-blur-sm'>
          <CardBody className='p-8'>
            <h3 className='text-xl font-semibold text-gray-100 mb-6 text-center'>¿Por qué comprar más intentos?</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
              <div className='flex flex-col items-center text-center space-y-3 group'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/30'>
                  <Users className='w-8 h-8 text-blue-400' />
                </div>
                <h4 className='font-semibold text-gray-100'>Más Oportunidades</h4>
                <p className='text-sm text-gray-400'>Cada intento es una nueva oportunidad para encontrar conexiones significativas</p>
              </div>

              <div className='flex flex-col items-center text-center space-y-3 group'>
                <div className='w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-green-500/30'>
                  <TrendingUp className='w-8 h-8 text-green-400' />
                </div>
                <h4 className='font-semibold text-gray-100'>Flexibilidad Total</h4>
                <p className='text-sm text-gray-400'>Usa tus intentos cuando quieras, sin presiones ni compromisos</p>
              </div>

              <div className='flex flex-col items-center text-center space-y-3 group'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/30'>
                  <Shield className='w-8 h-8 text-purple-400' />
                </div>
                <h4 className='font-semibold text-gray-100'>Pago Único</h4>
                <p className='text-sm text-gray-400'>Sin suscripciones ni cargos recurrentes. Solo pagas por lo que necesitas</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Plans Grid con efecto premium */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
          {plans.map(plan => {
            const isPremium = plan.id === popularPlan?.id

            return (
              <Card
                key={plan.id}
                className={`border transition-all duration-300 hover:scale-105 ${
                  isPremium
                    ? 'border-primary-500/60 bg-gradient-to-br from-primary-900/40 via-purple-900/40 to-pink-900/40 shadow-2xl shadow-primary-500/20 md:scale-105 relative overflow-visible'
                    : 'border-gray-600/50 bg-gray-800/40 hover:border-primary-400/50 relative'
                } backdrop-blur-sm`}>
                {/* Badge de más popular */}
                {isPremium && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2 z-10'>
                    <Chip
                      className='bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white font-bold shadow-lg'
                      size='sm'
                      startContent={<Star className='w-3 h-3 fill-current animate-pulse' />}>
                      MÁS POPULAR
                    </Chip>
                  </div>
                )}

                <CardBody className='p-5 flex flex-col h-full'>
                  {/* Plan Header */}
                  <div className='text-center mb-4 mt-2'>
                    <h3 className='text-xl font-bold text-gray-100 mb-1'>{plan.name}</h3>
                    <p className='text-xs text-gray-400 leading-tight'>{plan.description}</p>
                  </div>

                  {/* Price con efecto premium */}
                  <div className='text-center mb-4 relative'>
                    {isPremium && <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-2xl' />}
                    <div className='relative'>
                      <div
                        className={`text-4xl font-bold mb-1 ${
                          isPremium
                            ? 'text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text'
                            : 'text-green-400'
                        }`}>
                        ${plan.price.toFixed(2)}
                      </div>
                      <div className='text-xs text-gray-400'>USD / paquete</div>
                    </div>
                  </div>

                  {/* Attempts Badge */}
                  <div
                    className={`rounded-lg p-3 mb-4 border ${
                      isPremium
                        ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/40'
                        : 'bg-gray-700/30 border-gray-600/50'
                    }`}>
                    <div className='text-center'>
                      <div
                        className={`text-2xl font-bold mb-0.5 ${
                          isPremium ? 'text-transparent bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text' : 'text-primary-400'
                        }`}>
                        {plan.attempts}
                      </div>
                      <div className='text-[10px] text-gray-400 uppercase tracking-wide'>
                        {plan.attempts === 1 ? 'Intento de Match' : 'Intentos de Match'}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className='space-y-2 mb-4 flex-grow'>
                    <div className='flex items-start gap-2'>
                      <Check className='w-4 h-4 text-green-400 flex-shrink-0 mt-0.5' />
                      <span className='text-xs text-gray-300'>
                        <span className='font-bold text-primary-400'>{plan.attempts}</span> {plan.attempts === 1 ? 'intento' : 'intentos'}{' '}
                        para conectar
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Check className='w-4 h-4 text-green-400 flex-shrink-0 mt-0.5' />
                      <span className='text-xs text-gray-300'>Válidos por 30 días</span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Check className='w-4 h-4 text-green-400 flex-shrink-0 mt-0.5' />
                      <span className='text-xs text-gray-300'>Soporte prioritario 24/7</span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Check className='w-4 h-4 text-green-400 flex-shrink-0 mt-0.5' />
                      <span className='text-xs text-gray-300'>Sin renovación automática</span>
                    </div>
                    {isPremium && (
                      <>
                        <div className='flex items-start gap-2'>
                          <Star className='w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5 fill-current' />
                          <span className='text-xs text-yellow-300 font-medium'>Mejor relación precio-valor</span>
                        </div>
                        <div className='flex items-start gap-2'>
                          <Crown className='w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5' />
                          <span className='text-xs text-yellow-300 font-medium'>Acceso premium a eventos</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Value per attempt */}
                  <div
                    className={`rounded-lg p-2 mb-3 ${isPremium ? 'bg-gradient-to-r from-gray-800/50 to-gray-700/50' : 'bg-gray-700/30'}`}>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-gray-400'>Precio por intento:</span>
                      <span className='text-gray-200 font-bold'>${(plan.price / plan.attempts).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full font-semibold ${
                      isPremium
                        ? 'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-primary-500/50'
                        : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
                    }`}
                    size='md'
                    startContent={isPremium ? <Crown className='w-4 h-4' /> : <CreditCard className='w-4 h-4' />}
                    onPress={() => handlePurchasePlan(plan)}>
                    {isPremium ? '¡Comprar Ahora!' : 'Comprar Paquete'}
                  </Button>
                </CardBody>
              </Card>
            )
          })}
        </div>

        {/* Empty state */}
        {plans.length === 0 && !loading && (
          <Card className='w-full bg-gray-800/40 border-gray-700/50 backdrop-blur-sm'>
            <CardBody className='p-8 text-center'>
              <Package className='w-16 h-16 text-gray-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-300 mb-2'>No hay paquetes disponibles</h3>
              <p className='text-gray-400 mb-4'>Por el momento no hay paquetes de intentos disponibles para comprar.</p>
              <Button color='primary' variant='light' onPress={handleGoBack}>
                Volver a Matches
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Security notice premium */}
        <Card className='w-full bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 border-green-500/30 backdrop-blur-sm'>
          <CardBody className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/40'>
                <Shield className='w-6 h-6 text-green-400' />
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-green-400 mb-2 text-lg flex items-center gap-2'>
                  Compra 100% Segura
                  <Check className='w-5 h-5' />
                </h3>
                <p className='text-sm text-green-100/80 mb-4 leading-relaxed'>
                  Todas las transacciones están protegidas con encriptación SSL de 256 bits mediante Wompi, nuestra pasarela de pagos
                  certificada. Tus datos financieros están completamente seguros y nunca son almacenados en nuestros servidores.
                </p>
                <div className='flex flex-wrap gap-4 text-xs text-green-300'>
                  <span className='inline-flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30'>
                    <Check className='w-3 h-3' />
                    Encriptación SSL 256-bit
                  </span>
                  <span className='inline-flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30'>
                    <Check className='w-3 h-3' />
                    Certificado PCI DSS
                  </span>
                  <span className='inline-flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30'>
                    <Check className='w-3 h-3' />
                    Sin cargos ocultos
                  </span>
                  <span className='inline-flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30'>
                    <Check className='w-3 h-3' />
                    Garantía 7 días
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* FAQ Section premium */}
        <Card className='w-full bg-gray-800/40 border-gray-700/50 backdrop-blur-sm'>
          <CardBody className='p-6'>
            <h3 className='text-xl font-bold text-gray-100 mb-6 flex items-center gap-2'>
              <Sparkles className='w-6 h-6 text-primary-400' />
              Preguntas Frecuentes
            </h3>
            <div className='space-y-5'>
              <div className='border-l-2 border-primary-500/50 pl-4'>
                <h4 className='font-semibold text-gray-100 mb-2'>¿Qué pasa si no uso todos mis intentos?</h4>
                <p className='text-sm text-gray-400 leading-relaxed'>
                  Tus intentos son válidos por 30 días desde la compra. Puedes usarlos cuando quieras dentro de este período.
                </p>
              </div>
              <div className='border-l-2 border-purple-500/50 pl-4'>
                <h4 className='font-semibold text-gray-100 mb-2'>¿Puedo obtener un reembolso?</h4>
                <p className='text-sm text-gray-400 leading-relaxed'>
                  Los intentos no utilizados pueden ser reembolsados dentro de los primeros 7 días de la compra sin preguntas.
                </p>
              </div>
              <div className='border-l-2 border-pink-500/50 pl-4'>
                <h4 className='font-semibold text-gray-100 mb-2'>¿Los precios incluyen impuestos?</h4>
                <p className='text-sm text-gray-400 leading-relaxed'>
                  Sí, todos nuestros precios son finales e incluyen IVA y cualquier otro impuesto aplicable en tu región.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </LiteContainer>
    </>
  )
}

export default PurchasePlans
