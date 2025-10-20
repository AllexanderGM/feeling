import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Chip } from '@heroui/react'
import { Package, Star, Check, CreditCard, ArrowLeft, Shield, Zap, Users, TrendingUp } from 'lucide-react'
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
        const response = await matchPlanService.getAvailablePlans()

        if (response?.success && response?.data) {
          setPlans(response.data)
        } else {
          setError('No se pudieron cargar los planes disponibles')
        }
      } catch (err) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'load_plans', 'Error cargando planes', { error: err })
        setError('Error al cargar los planes de match')
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
    navigate(APP_PATHS.USER.MATCHES)
  }

  if (loading) return <LoadData>Cargando planes disponibles...</LoadData>
  if (error) return <LoadDataError message={error} />

  return (
    <>
      <Helmet>
        <title>Comprar Planes de Match - Feeling</title>
        <meta content='Compra planes de match para seguir conectando con personas increíbles' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de compra de planes de match' className='gap-6'>
        {/* Header */}
        <div className='space-y-4'>
          <Button
            className='text-gray-400 hover:text-gray-200'
            size='sm'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='light'
            onPress={handleGoBack}>
            Volver a Matches
          </Button>

          <div className='text-center space-y-3'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto'>
              <Package className='w-8 h-8 text-blue-400' />
            </div>
            <h1 className='text-3xl font-bold text-gray-100'>Planes de Match</h1>
            <p className='text-gray-400 max-w-2xl mx-auto'>
              Elige el plan perfecto para ti y sigue conectando con personas increíbles. Todos nuestros planes incluyen soporte 24/7 y
              acceso completo a la plataforma.
            </p>

            {/* Current attempts badge */}
            <div className='inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2'>
              <Zap className='w-4 h-4 text-blue-400' />
              <span className='text-sm text-gray-300'>
                Tienes <span className='font-bold text-blue-400'>{currentAttempts}</span>{' '}
                {currentAttempts === 1 ? 'intento disponible' : 'intentos disponibles'}
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <Card className='w-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 border-purple-500/30'>
          <CardBody className='p-6'>
            <h3 className='text-lg font-semibold text-gray-100 mb-4 text-center'>¿Por qué comprar más intentos?</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='flex flex-col items-center text-center space-y-2'>
                <div className='w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <Users className='w-6 h-6 text-blue-400' />
                </div>
                <h4 className='font-medium text-gray-200'>Más Conexiones</h4>
                <p className='text-sm text-gray-400'>Aumenta tus posibilidades de encontrar a tu match perfecto</p>
              </div>

              <div className='flex flex-col items-center text-center space-y-2'>
                <div className='w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center'>
                  <TrendingUp className='w-6 h-6 text-green-400' />
                </div>
                <h4 className='font-medium text-gray-200'>Sin Límites</h4>
                <p className='text-sm text-gray-400'>Conéctate cuando quieras sin preocuparte por límites diarios</p>
              </div>

              <div className='flex flex-col items-center text-center space-y-2'>
                <div className='w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center'>
                  <Shield className='w-6 h-6 text-purple-400' />
                </div>
                <h4 className='font-medium text-gray-200'>Compra Segura</h4>
                <p className='text-sm text-gray-400'>Pago protegido con encriptación de nivel bancario</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Plans Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={`border transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-purple-900/30 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-800/40 hover:border-blue-400'
              }`}>
              <CardBody className='p-6 flex flex-col h-full'>
                {/* Plan Header */}
                <div className='text-center mb-6'>
                  {plan.popular && (
                    <Chip className='mb-3' color='primary' size='sm' startContent={<Star className='w-3 h-3' />} variant='flat'>
                      Más Popular
                    </Chip>
                  )}
                  <h3 className='text-xl font-bold text-gray-100 mb-2'>{plan.name}</h3>
                  <p className='text-sm text-gray-400'>{plan.description}</p>
                </div>

                {/* Price */}
                <div className='text-center mb-6'>
                  <div className='text-4xl font-bold text-green-400 mb-1'>
                    {plan.price.toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </div>
                  <div className='text-sm text-gray-400'>COP</div>
                </div>

                {/* Features */}
                <div className='space-y-3 mb-6 flex-grow'>
                  <div className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-400 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>
                      <span className='font-bold text-blue-400'>{plan.attempts}</span> {plan.attempts === 1 ? 'intento' : 'intentos'} de
                      match
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-400 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>Válido por 30 días</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-400 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>Soporte 24/7</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-400 flex-shrink-0' />
                    <span className='text-sm text-gray-300'>Sin compromisos a largo plazo</span>
                  </div>
                  {plan.popular && (
                    <div className='flex items-center gap-2'>
                      <Star className='w-4 h-4 text-yellow-400 flex-shrink-0' />
                      <span className='text-sm text-yellow-300 font-medium'>Mejor relación calidad-precio</span>
                    </div>
                  )}
                </div>

                {/* Value calculation */}
                <div className='bg-gray-700/30 rounded-lg p-3 mb-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Precio por intento:</span>
                    <span className='text-gray-200 font-medium'>
                      {(plan.price / plan.attempts).toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className='w-full'
                  color={plan.popular ? 'primary' : 'secondary'}
                  size='lg'
                  startContent={<CreditCard className='w-4 h-4' />}
                  variant={plan.popular ? 'solid' : 'bordered'}
                  onPress={() => handlePurchasePlan(plan)}>
                  Comprar Plan
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {plans.length === 0 && !loading && (
          <Card className='w-full bg-gray-800/40 border-gray-700/50'>
            <CardBody className='p-8 text-center'>
              <Package className='w-16 h-16 text-gray-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-300 mb-2'>No hay planes disponibles</h3>
              <p className='text-gray-400 mb-4'>Por el momento no hay planes de match disponibles para comprar.</p>
              <Button color='primary' variant='light' onPress={handleGoBack}>
                Volver a Matches
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Security notice */}
        <Card className='w-full bg-green-500/5 border-green-500/20'>
          <CardBody className='p-6'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Shield className='w-5 h-5 text-green-400' />
              </div>
              <div>
                <h3 className='font-semibold text-green-400 mb-2'>Compra 100% Segura</h3>
                <p className='text-sm text-green-300/80 mb-3'>
                  Todas las transacciones están protegidas con encriptación SSL de 256 bits mediante Wompi, nuestra pasarela de pagos de
                  confianza. Tus datos financieros están completamente seguros.
                </p>
                <div className='flex flex-wrap gap-4 text-xs text-green-300'>
                  <span className='inline-flex items-center gap-1'>
                    <Check className='w-3 h-3' />
                    Encriptación SSL
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Check className='w-3 h-3' />
                    Pago seguro
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Check className='w-3 h-3' />
                    Sin cargos ocultos
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Check className='w-3 h-3' />
                    Reembolso garantizado
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* FAQ Section */}
        <Card className='w-full bg-gray-800/40 border-gray-700/50'>
          <CardBody className='p-6'>
            <h3 className='text-lg font-semibold text-gray-100 mb-4'>Preguntas Frecuentes</h3>
            <div className='space-y-4'>
              <div>
                <h4 className='font-medium text-gray-200 mb-1'>¿Qué pasa si no uso todos mis intentos?</h4>
                <p className='text-sm text-gray-400'>
                  Tus intentos son válidos por 30 días desde la compra. Puedes usarlos cuando quieras.
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-200 mb-1'>¿Puedo cancelar mi plan?</h4>
                <p className='text-sm text-gray-400'>
                  Los intentos no utilizados pueden ser reembolsados dentro de los primeros 7 días de la compra.
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-200 mb-1'>¿Los precios incluyen impuestos?</h4>
                <p className='text-sm text-gray-400'>Sí, todos nuestros precios son finales e incluyen todos los impuestos aplicables.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </LiteContainer>
    </>
  )
}

export default PurchasePlans
