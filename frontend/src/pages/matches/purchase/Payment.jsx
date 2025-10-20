import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Spinner } from '@heroui/react'
import { CreditCard, Shield, Lock } from 'lucide-react'
import { APP_PATHS } from '@constants/paths'
import { matchPlanService } from '@services'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { Logger } from '@utils/logger.js'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const wompiFormRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get plan and user data from navigation state
  const plan = location.state?.plan
  const userEmail = location.state?.userEmail
  const userName = location.state?.userName

  // Wompi configuration
  const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_YOUR_PUBLIC_KEY'
  const WOMPI_SCRIPT_URL = 'https://checkout.wompi.co/widget.js'

  useEffect(() => {
    // Redirect if no plan data
    if (!plan) {
      navigate(APP_PATHS.USER.PURCHASE_PLANS)

      return
    }

    // Load Wompi script
    const loadWompiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        if (document.querySelector(`script[src="${WOMPI_SCRIPT_URL}"]`)) {
          resolve()

          return
        }

        const script = document.createElement('script')

        script.src = WOMPI_SCRIPT_URL
        script.setAttribute('data-render', 'button')
        script.setAttribute('data-public-key', WOMPI_PUBLIC_KEY)
        script.setAttribute('data-currency', 'COP')
        script.setAttribute('data-amount-in-cents', (plan.price * 100).toString())
        script.setAttribute('data-reference', `PLAN-${plan.id}-${Date.now()}`)
        script.setAttribute('data-redirect-url', `${window.location.origin}${APP_PATHS.USER.PURCHASE_SUCCESS}`)

        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Error al cargar Wompi'))

        wompiFormRef.current?.appendChild(script)
      })
    }

    // Initialize Wompi
    const initializeWompi = async () => {
      try {
        setLoading(true)
        await loadWompiScript()

        // Initialize Wompi checkout
        if (window.WidgetCheckout) {
          const checkout = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents: plan.price * 100,
            reference: `PLAN-${plan.id}-${Date.now()}`,
            publicKey: WOMPI_PUBLIC_KEY,
            redirectUrl: `${window.location.origin}${APP_PATHS.USER.PURCHASE_SUCCESS}`,
            customerData: {
              email: userEmail,
              fullName: userName
            }
          })

          checkout.open(async result => {
            if (result.transaction?.status === 'APPROVED') {
              try {
                // Call backend to confirm purchase and add attempts to user account
                const response = await matchPlanService.purchaseMatchPlan(plan.id)

                if (response?.success) {
                  // Purchase confirmed successfully
                  navigate(APP_PATHS.USER.PURCHASE_SUCCESS, {
                    state: {
                      transaction: result.transaction,
                      plan,
                      purchaseConfirmed: true,
                      backendResponse: response.data
                    }
                  })
                } else {
                  // Backend rejected the purchase
                  Logger.error(Logger.CATEGORIES.SERVICE, 'confirm_purchase', 'Backend purchase confirmation failed', {
                    response
                  })
                  navigate(APP_PATHS.USER.PURCHASE_ERROR, {
                    state: {
                      transaction: result.transaction,
                      plan,
                      error: 'No se pudo confirmar la compra en nuestros servidores'
                    }
                  })
                }
              } catch (error) {
                Logger.error(Logger.CATEGORIES.SERVICE, 'confirm_purchase', 'Error al confirmar la compra', { error })
                navigate(APP_PATHS.USER.PURCHASE_ERROR, {
                  state: {
                    transaction: result.transaction,
                    plan,
                    error: error.message || 'Error al procesar la compra'
                  }
                })
              }
            } else if (result.transaction?.status === 'DECLINED' || result.transaction?.status === 'ERROR') {
              navigate(APP_PATHS.USER.PURCHASE_ERROR, {
                state: {
                  transaction: result.transaction,
                  plan
                }
              })
            }
          })
        }

        setLoading(false)
      } catch (err) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'initialize_wompi', 'Error inicializando Wompi', { error: err })
        setError('Error al cargar la pasarela de pago. Por favor, intenta nuevamente.')
        setLoading(false)
      }
    }

    initializeWompi()

    // Cleanup
    return () => {
      // Remove Wompi script on unmount
      const scripts = document.querySelectorAll(`script[src="${WOMPI_SCRIPT_URL}"]`)

      scripts.forEach(script => script.remove())
    }
  }, [plan, navigate, userEmail, userName])

  if (!plan) {
    return <LoadDataError message='No se encontró información del plan seleccionado' />
  }

  if (error) {
    return <LoadDataError message={error} />
  }

  return (
    <>
      <Helmet>
        <title>Procesar Pago - Feeling</title>
        <meta content='Completa tu pago de forma segura con Wompi' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de procesamiento de pago' className='gap-6 max-w-3xl'>
        {loading ? (
          <Card className='bg-gray-800/40 border-gray-700/50'>
            <CardBody className='p-12 text-center'>
              <div className='flex flex-col items-center gap-4'>
                <div className='w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center'>
                  <CreditCard className='w-8 h-8 text-blue-400 animate-pulse' />
                </div>
                <Spinner color='primary' size='lg' />
                <div>
                  <h2 className='text-xl font-semibold text-gray-100 mb-2'>Cargando Pasarela de Pago</h2>
                  <p className='text-gray-400'>Preparando el formulario de pago seguro...</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Header */}
            <div className='text-center space-y-3'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto'>
                <CreditCard className='w-8 h-8 text-blue-400' />
              </div>
              <h1 className='text-3xl font-bold text-gray-100'>Procesar Pago</h1>
              <p className='text-gray-400 max-w-xl mx-auto'>Completa tu pago de forma segura mediante nuestra pasarela de pagos Wompi</p>
            </div>

            {/* Plan Summary */}
            <Card className='bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-blue-500/30'>
              <CardBody className='p-6'>
                <div className='text-center space-y-3'>
                  <h3 className='text-lg font-semibold text-gray-100'>Resumen de tu compra</h3>
                  <div>
                    <div className='text-2xl font-bold text-gray-100'>{plan.name}</div>
                    <div className='text-sm text-gray-400'>{plan.description}</div>
                  </div>
                  <div className='text-4xl font-bold text-green-400'>
                    {plan.price.toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Wompi Payment Form */}
            <Card className='bg-gray-800/40 border-gray-700/50'>
              <CardBody className='p-8'>
                <div className='text-center mb-6'>
                  <h2 className='text-xl font-semibold text-gray-100 mb-2'>Selecciona tu método de pago</h2>
                  <p className='text-sm text-gray-400'>Elige la forma de pago que prefieras</p>
                </div>

                {/* Wompi widget container */}
                <div ref={wompiFormRef} className='min-h-[400px] flex items-center justify-center' id='wompi-payment-form'>
                  {/* Wompi script will be injected here */}
                </div>

                {/* Payment methods info */}
                <div className='mt-6 pt-6 border-t border-gray-700'>
                  <p className='text-xs text-gray-400 text-center mb-3'>Métodos de pago disponibles:</p>
                  <div className='flex flex-wrap justify-center gap-2'>
                    <div className='px-3 py-2 bg-gray-700/30 rounded-lg text-xs text-gray-300 font-medium'>Tarjeta de Crédito</div>
                    <div className='px-3 py-2 bg-gray-700/30 rounded-lg text-xs text-gray-300 font-medium'>Tarjeta Débito</div>
                    <div className='px-3 py-2 bg-gray-700/30 rounded-lg text-xs text-gray-300 font-medium'>PSE</div>
                    <div className='px-3 py-2 bg-gray-700/30 rounded-lg text-xs text-gray-300 font-medium'>Nequi</div>
                    <div className='px-3 py-2 bg-gray-700/30 rounded-lg text-xs text-gray-300 font-medium'>Bancolombia</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security notices */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='bg-green-500/5 border-green-500/20'>
                <CardBody className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Shield className='w-5 h-5 text-green-400' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-green-400 mb-1'>Pago 100% Seguro</h3>
                      <p className='text-xs text-green-300/80'>
                        Tus datos están protegidos con encriptación SSL de 256 bits y certificación PCI DSS
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className='bg-blue-500/5 border-blue-500/20'>
                <CardBody className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Lock className='w-5 h-5 text-blue-400' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-blue-400 mb-1'>Privacidad Garantizada</h3>
                      <p className='text-xs text-blue-300/80'>No almacenamos información de tarjetas de crédito en nuestros servidores</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Wompi badge */}
            <div className='text-center'>
              <p className='text-xs text-gray-500 mb-2'>Procesado de forma segura por</p>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-lg'>
                <img alt='Wompi Logo' className='h-6' src='https://wompi.co/assets/images/logo-wompi.svg' />
                <span className='text-xs text-gray-400'>Pasarela de pagos certificada</span>
              </div>
            </div>
          </>
        )}
      </LiteContainer>
    </>
  )
}

export default Payment
