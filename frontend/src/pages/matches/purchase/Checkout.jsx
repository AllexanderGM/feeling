import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Divider, Input, Checkbox, Spinner } from '@heroui/react'
import { ShoppingCart, ArrowLeft, CreditCard, Shield, AlertCircle, Package, Check } from 'lucide-react'
import { useAuth, useMatchPlans } from '@hooks'
import { APP_PATHS } from '@constants/paths'
import { getUserEmail, getUserName, getUserLastName } from '@schemas'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { plans, loading: plansLoading, fetchAvailablePlans } = useMatchPlans()

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Get planId from URL query parameter
  const planIdFromUrl = searchParams.get('planId')

  // Get plan from navigation state (legacy support)
  const planFromState = location.state?.plan

  // Find plan by ID if coming from URL
  const planFromId = useMemo(() => {
    if (!planIdFromUrl || !plans.length) return null

    return plans.find(p => p.id === parseInt(planIdFromUrl))
  }, [planIdFromUrl, plans])

  // Use plan from URL if available, otherwise from state
  const plan = planFromId || planFromState

  // User data
  const userEmail = useMemo(() => getUserEmail(user), [user])
  const userName = useMemo(() => getUserName(user), [user])
  const userLastName = useMemo(() => getUserLastName(user), [user])

  // Load plans if we have a planId but no plans loaded yet
  useEffect(() => {
    if (planIdFromUrl && plans.length === 0 && !plansLoading) {
      fetchAvailablePlans()
    }
  }, [planIdFromUrl, plans.length, plansLoading, fetchAvailablePlans])

  // Redirect if no plan after loading
  useEffect(() => {
    // Wait for plans to load if we have a planId
    if (planIdFromUrl && plansLoading) return

    // Redirect if no plan found
    if (!plan && !plansLoading) {
      navigate(APP_PATHS.USER.PURCHASE_PLANS)
    }
  }, [plan, planIdFromUrl, plansLoading, navigate])

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.PURCHASE_PLANS)
  }

  const handleProceedToPayment = () => {
    if (!acceptedTerms) return

    setProcessing(true)
    // Navigate to Wompi payment page with plan data
    navigate(APP_PATHS.USER.PURCHASE_PAYMENT, {
      state: {
        plan,
        userEmail,
        userName: `${userName} ${userLastName}`
      }
    })
  }

  // Tax calculations
  const subtotal = plan?.price || 0
  const taxRate = 0.19 // 19% IVA Colombia
  const tax = subtotal * taxRate
  const total = subtotal + tax

  // Show loading while fetching plans
  if (planIdFromUrl && plansLoading) {
    return (
      <LiteContainer ariaLabel='Cargando información del plan' className='gap-6 max-w-4xl'>
        <div className='flex flex-col items-center justify-center py-20'>
          <Spinner color='primary' size='lg' />
          <p className='text-gray-400 mt-4'>Cargando información del plan...</p>
        </div>
      </LiteContainer>
    )
  }

  if (!plan) {
    return <LoadDataError message='No se encontró información del plan seleccionado' />
  }

  return (
    <>
      <Helmet>
        <title>Resumen de Compra - Feeling</title>
        <meta content='Revisa y confirma tu compra de plan de match' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de checkout' className='gap-6 max-w-4xl'>
        {/* Header */}
        <div className='space-y-4'>
          <Button
            className='text-gray-400 hover:text-gray-200'
            size='sm'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='light'
            onPress={handleGoBack}>
            Volver a Planes
          </Button>

          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
              <ShoppingCart className='w-6 h-6 text-blue-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-100'>Resumen de Compra</h1>
              <p className='text-sm text-gray-400'>Revisa los detalles antes de proceder al pago</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Plan Details */}
            <Card className='bg-gray-800/40 border-gray-700/50'>
              <CardBody className='p-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                    <Package className='w-5 h-5 text-purple-400' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-100'>Plan Seleccionado</h2>
                    <p className='text-sm text-gray-400'>Detalles de tu compra</p>
                  </div>
                </div>

                <div className='bg-gray-700/30 rounded-lg p-4 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-gray-100'>{plan.name}</h3>
                      <p className='text-sm text-gray-400 mt-1'>{plan.description}</p>
                    </div>
                    <div className='text-right ml-4'>
                      <div className='text-2xl font-bold text-green-400'>
                        {plan.price.toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </div>
                    </div>
                  </div>

                  <Divider className='bg-gray-600' />

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Check className='w-4 h-4 text-green-400' />
                      <span className='text-gray-300'>
                        <span className='font-bold'>{plan.attempts}</span> {plan.attempts === 1 ? 'intento' : 'intentos'} de match
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Check className='w-4 h-4 text-green-400' />
                      <span className='text-gray-300'>Válido por 30 días</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Check className='w-4 h-4 text-green-400' />
                      <span className='text-gray-300'>Soporte 24/7</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Billing Information */}
            <Card className='bg-gray-800/40 border-gray-700/50'>
              <CardBody className='p-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                    <CreditCard className='w-5 h-5 text-blue-400' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-100'>Información de Facturación</h2>
                    <p className='text-sm text-gray-400'>Se usará para procesar el pago</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <Input
                    isReadOnly
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                    }}
                    label='Nombre completo'
                    labelPlacement='outside'
                    placeholder='Nombre'
                    value={`${userName} ${userLastName}`}
                    variant='bordered'
                  />
                  <Input
                    isReadOnly
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                    }}
                    label='Correo electrónico'
                    labelPlacement='outside'
                    placeholder='correo@ejemplo.com'
                    type='email'
                    value={userEmail}
                    variant='bordered'
                  />
                </div>
              </CardBody>
            </Card>

            {/* Terms and Conditions */}
            <Card className='bg-gray-800/40 border-gray-700/50'>
              <CardBody className='p-6'>
                <Checkbox
                  classNames={{
                    label: 'text-sm text-gray-300'
                  }}
                  isSelected={acceptedTerms}
                  onValueChange={setAcceptedTerms}>
                  Acepto los{' '}
                  <button
                    className='text-blue-400 hover:text-blue-300 underline'
                    type='button'
                    onClick={() => navigate(APP_PATHS.LEGAL.TERMS)}>
                    términos y condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    className='text-blue-400 hover:text-blue-300 underline'
                    type='button'
                    onClick={() => navigate(APP_PATHS.LEGAL.PRIVACY)}>
                    política de privacidad
                  </button>
                </Checkbox>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className='lg:col-span-1'>
            <Card className='bg-gray-800/40 border-gray-700/50 sticky top-4'>
              <CardBody className='p-6'>
                <h2 className='text-lg font-semibold text-gray-100 mb-4'>Resumen del Pedido</h2>

                <div className='space-y-3 mb-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Subtotal:</span>
                    <span className='text-gray-200 font-medium'>
                      {subtotal.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>IVA (19%):</span>
                    <span className='text-gray-200 font-medium'>
                      {tax.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>

                  <Divider className='bg-gray-600' />

                  <div className='flex items-center justify-between'>
                    <span className='text-base font-semibold text-gray-200'>Total:</span>
                    <span className='text-2xl font-bold text-green-400'>
                      {total.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>
                </div>

                <Button
                  className='w-full'
                  color='primary'
                  isDisabled={!acceptedTerms}
                  isLoading={processing}
                  size='lg'
                  startContent={!processing && <CreditCard className='w-5 h-5' />}
                  onPress={handleProceedToPayment}>
                  Proceder al Pago
                </Button>

                {!acceptedTerms && (
                  <div className='flex items-start gap-2 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
                    <AlertCircle className='w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0' />
                    <p className='text-xs text-yellow-300'>Debes aceptar los términos y condiciones para continuar</p>
                  </div>
                )}

                <div className='mt-6 pt-6 border-t border-gray-700'>
                  <div className='flex items-start gap-3'>
                    <Shield className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
                    <div>
                      <h3 className='text-sm font-semibold text-green-400 mb-1'>Pago 100% Seguro</h3>
                      <p className='text-xs text-gray-400'>
                        Tu información está protegida con encriptación de nivel bancario mediante Wompi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className='mt-4 space-y-2'>
                  <p className='text-xs text-gray-400 text-center'>Métodos de pago aceptados:</p>
                  <div className='flex flex-wrap justify-center gap-2'>
                    <div className='px-3 py-1 bg-gray-700/30 rounded text-xs text-gray-300'>Tarjeta de Crédito</div>
                    <div className='px-3 py-1 bg-gray-700/30 rounded text-xs text-gray-300'>Tarjeta Débito</div>
                    <div className='px-3 py-1 bg-gray-700/30 rounded text-xs text-gray-300'>PSE</div>
                    <div className='px-3 py-1 bg-gray-700/30 rounded text-xs text-gray-300'>Nequi</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Security Notice */}
        <Card className='bg-blue-500/5 border-blue-500/20'>
          <CardBody className='p-4'>
            <div className='flex items-center justify-center gap-4 text-xs text-blue-300'>
              <span className='inline-flex items-center gap-1'>
                <Check className='w-3 h-3' />
                Conexión segura SSL
              </span>
              <span className='inline-flex items-center gap-1'>
                <Check className='w-3 h-3' />
                Datos encriptados
              </span>
              <span className='inline-flex items-center gap-1'>
                <Check className='w-3 h-3' />
                Sin cargos ocultos
              </span>
            </div>
          </CardBody>
        </Card>
      </LiteContainer>
    </>
  )
}

export default Checkout
