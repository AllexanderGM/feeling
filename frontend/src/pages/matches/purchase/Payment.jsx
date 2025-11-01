import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Spinner, Button } from '@heroui/react'
import { CreditCard, Shield, Lock, RotateCcw } from 'lucide-react'
import { APP_PATHS } from '@constants/paths'
import { matchPlanService } from '@services'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { Logger } from '@utils/logger.js'

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const plan = location.state?.plan
  const userEmail = location.state?.userEmail
  const userName = location.state?.userName

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [paymentIntent, setPaymentIntent] = useState(null)

  const abortRef = useRef(false)

  const ensureWompiScriptLoaded = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.WidgetCheckout) {
        resolve()

        return
      }

      const handleReady = () => resolve()
      const handleError = () => reject(new Error('Error al cargar el widget de Wompi'))

      let script = document.querySelector(`script[src="${WOMPI_WIDGET_URL}"]`)

      if (script) {
        script.addEventListener('load', handleReady, { once: true })
        script.addEventListener('error', handleError, { once: true })

        return
      }

      script = document.createElement('script')
      script.src = WOMPI_WIDGET_URL
      script.async = true
      script.onload = handleReady
      script.onerror = handleError
      document.body.appendChild(script)
    })
  }, [])

  const navigateToStatus = useCallback(
    (transactionId, reference, status) => {
      const params = new URLSearchParams({
        id: transactionId,
        reference,
        status
      })

      navigate(`${APP_PATHS.USER.PURCHASE_PAYMENT_STATUS}?${params.toString()}`, {
        replace: true
      })
    },
    [navigate]
  )

  const launchWompiCheckout = useCallback(
    async intentData => {
      if (!intentData) return

      try {
        await ensureWompiScriptLoaded()

        if (typeof window === 'undefined' || !window.WidgetCheckout) {
          throw new Error('Widget de Wompi no disponible en el navegador')
        }

        const redirectUrl = `${window.location.origin}${APP_PATHS.USER.PURCHASE_PAYMENT_STATUS}?reference=${encodeURIComponent(
          intentData.paymentReference
        )}`

        Logger.info(Logger.CATEGORIES.SERVICE, 'match_payment', 'Launching Wompi checkout', {
          reference: intentData.paymentReference,
          amountInCents: intentData.amountInCents,
          currency: intentData.currency
        })

        const checkout = new window.WidgetCheckout({
          currency: intentData.currency,
          amountInCents: intentData.amountInCents,
          reference: intentData.paymentReference,
          publicKey: intentData.publicKey,
          redirectUrl,
          signature: {
            integrity: intentData.signature
          },
          customerData: {
            email: userEmail,
            fullName: userName
          }
        })

        checkout.open(async result => {
          if (abortRef.current) return

          if (result?.error) {
            const wompiMessage = result.error?.reason || result.error?.message || 'No fue posible iniciar el pago.'

            Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment', 'Wompi returned an error', {
              error: result.error
            })
            setError(wompiMessage)

            return
          }

          const transactionStatus = result?.transaction?.status?.toUpperCase?.() || 'UNKNOWN'
          const transactionId = result?.transaction?.id

          if (transactionStatus === 'APPROVED' && transactionId) {
            setProcessing(true)

            try {
              const confirmation = await matchPlanService.confirmMatchPlanPurchase({
                transactionId,
                paymentReference: intentData.paymentReference
              })

              navigate(APP_PATHS.USER.PURCHASE_SUCCESS, {
                replace: true,
                state: {
                  transaction: result.transaction,
                  plan,
                  purchaseConfirmed: confirmation?.status === 'APPROVED',
                  purchase: confirmation
                }
              })
            } catch (confirmError) {
              Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment_confirm', 'Error confirming match plan purchase', {
                error: confirmError
              })

              navigate(APP_PATHS.USER.PURCHASE_ERROR, {
                replace: true,
                state: {
                  transaction: result.transaction,
                  plan,
                  error: confirmError?.message || 'No se pudo confirmar la compra con nuestro servidor.'
                }
              })
            } finally {
              setProcessing(false)
            }

            return
          }

          if (transactionStatus === 'PENDING' && transactionId) {
            navigateToStatus(transactionId, intentData.paymentReference, transactionStatus)

            return
          }

          if (transactionStatus === 'DECLINED' || transactionStatus === 'ERROR') {
            navigate(APP_PATHS.USER.PURCHASE_ERROR, {
              replace: true,
              state: {
                transaction: result.transaction,
                plan,
                error: 'El pago fue rechazado por Wompi.'
              }
            })

            return
          }

          Logger.warn(Logger.CATEGORIES.SERVICE, 'match_payment', 'Unexpected payment status received from Wompi', {
            status: transactionStatus,
            transactionId
          })
        })
      } catch (err) {
        if (abortRef.current) return

        Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment', 'Unable to initialize Wompi checkout', {
          error: err
        })
        setError(err?.message || 'No fue posible inicializar la pasarela de pago.')
      }
    },
    [ensureWompiScriptLoaded, navigate, navigateToStatus, plan, userEmail, userName]
  )

  const initializePayment = useCallback(async () => {
    if (!plan?.id) return

    abortRef.current = false
    setLoading(true)
    setProcessing(false)
    setError(null)
    setPaymentIntent(null)

    try {
      const intentResponse = await matchPlanService.createPaymentIntent(plan.id)

      if (abortRef.current) return

      if (!intentResponse?.publicKey || !intentResponse?.signature) {
        throw new Error('La configuración de la pasarela de pago es inválida.')
      }

      setPaymentIntent(intentResponse)
      setLoading(false)

      await launchWompiCheckout(intentResponse)
    } catch (err) {
      if (abortRef.current) return

      Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment', 'Failed to prepare payment intent', {
        error: err
      })
      setError(err?.message || 'No pudimos iniciar el proceso de pago. Intenta nuevamente.')
      setLoading(false)
    }
  }, [launchWompiCheckout, plan?.id])

  useEffect(() => {
    if (!plan) {
      navigate(APP_PATHS.USER.PURCHASE_PLANS)

      return undefined
    }

    initializePayment()

    return () => {
      abortRef.current = true
    }
  }, [initializePayment, navigate, plan])

  if (!plan) {
    return <LoadDataError message='No se encontró información del plan seleccionado' />
  }

  if (error) {
    return (
      <LoadDataError
        action={{
          label: 'Reintentar',
          onPress: initializePayment
        }}
        message={error}
      />
    )
  }

  return (
    <>
      <Helmet>
        <title>Procesar Pago - Feeling</title>
        <meta content='Completa tu pago de forma segura con Wompi' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de procesamiento de pago' className='gap-6 max-w-3xl !pt-0'>
        {loading ? (
          <Card className='bg-gray-800/40 border-gray-700/50 w-full'>
            <CardBody className='p-12 text-center'>
              <div className='flex flex-col items-center gap-4'>
                <div className='w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center'>
                  <CreditCard className='w-8 h-8 text-blue-400 animate-pulse' />
                </div>
                <Spinner color='primary' size='lg' />
                <div>
                  <h2 className='text-xl font-semibold text-gray-100 mb-2'>Cargando pasarela de pago</h2>
                  <p className='text-gray-400'>Preparando el formulario de pago seguro...</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className='text-center space-y-3 w-full'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto'>
                <CreditCard className='w-8 h-8 text-blue-400' />
              </div>
              <h1 className='text-3xl font-bold text-gray-100'>Procesar Pago</h1>
              <p className='text-gray-400 max-w-xl mx-auto'>Completa tu pago de forma segura mediante nuestra pasarela de pagos Wompi</p>
            </div>

            <Card className='bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-blue-500/30 w-full'>
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

                  {paymentIntent?.paymentReference && (
                    <p className='text-xs text-gray-400'>
                      Referencia de pago: <span className='font-mono text-gray-300'>{paymentIntent.paymentReference}</span>
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card className='bg-gray-800/40 border-gray-700/50 w-full'>
              <CardBody className='p-8 space-y-6'>
                <div className='text-center'>
                  <h2 className='text-xl font-semibold text-gray-100 mb-2'>Selecciona tu método de pago</h2>
                  <p className='text-sm text-gray-400'>El formulario seguro de Wompi se abrirá en una ventana modal</p>
                </div>

                <div className='flex justify-center'>
                  <Button
                    color='primary'
                    isLoading={processing}
                    size='lg'
                    startContent={<RotateCcw className='w-4 h-4' />}
                    onPress={initializePayment}>
                    Reintentar pago
                  </Button>
                </div>

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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
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

            <div className='text-center w-full'>
              <p className='text-xs text-gray-500 mb-2'>Procesado de forma segura por</p>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-lg'>
                <img alt='Wompi Logo' className='h-6' src='https://public-assets.wompi.com/brand_wompi/icons/favicon.ico' />
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
