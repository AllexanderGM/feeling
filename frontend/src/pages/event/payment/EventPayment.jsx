import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Spinner } from '@heroui/react'
import { CreditCard, Shield, Lock } from 'lucide-react'
import { APP_PATHS } from '@constants/paths'
import { bookingService } from '@services'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { Logger } from '@utils/logger.js'

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js'

const EventPayment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { eventId } = useParams()

  const event = location.state?.event
  const userEmail = location.state?.userEmail
  const userName = location.state?.userName

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(false)
  const hasInitializedRef = useRef(false)

  const unwrapResponse = useCallback(response => {
    if (!response) return null

    if (typeof response === 'object' && response !== null && 'success' in response) {
      if (!response.success) {
        const error = new Error(response.message || 'Error al procesar la respuesta del servicio.')

        error.response = response
        throw error
      }

      return response.data
    }

    return response
  }, [])

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

      navigate(`${APP_PATHS.USER.EVENT_PAYMENT_STATUS}?${params.toString()}`, {
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

        const redirectUrl = `${window.location.origin}${APP_PATHS.USER.EVENT_PAYMENT_STATUS}?reference=${encodeURIComponent(
          intentData.paymentReference
        )}`

        Logger.info(Logger.CATEGORIES.SERVICE, 'event_payment', 'Launching Wompi checkout', {
          reference: intentData.paymentReference,
          amountInCents: intentData.amountInCents,
          currency: intentData.currency,
          eventId
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

            Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment', 'Wompi returned an error', {
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
              const confirmation = await unwrapResponse(await bookingService.confirmEventPayment(transactionId))

              navigate(APP_PATHS.USER.EVENT_PAYMENT_SUCCESS, {
                replace: true,
                state: {
                  transaction: result.transaction,
                  event,
                  bookingConfirmed: true,
                  booking: confirmation
                }
              })
            } catch (confirmError) {
              Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment_confirm', 'Error confirming event payment', {
                error: confirmError
              })

              navigate(APP_PATHS.USER.EVENT_PAYMENT_ERROR, {
                replace: true,
                state: {
                  transaction: result.transaction,
                  event,
                  error: confirmError?.message || 'No se pudo confirmar la reserva con nuestro servidor.'
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
            navigate(APP_PATHS.USER.EVENT_PAYMENT_ERROR, {
              replace: true,
              state: {
                transaction: result.transaction,
                event,
                error: 'El pago fue rechazado por Wompi.'
              }
            })

            return
          }

          Logger.warn(Logger.CATEGORIES.SERVICE, 'event_payment', 'Unexpected payment status received from Wompi', {
            status: transactionStatus,
            transactionId
          })
        })
      } catch (err) {
        if (abortRef.current) return

        Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment', 'Unable to initialize Wompi checkout', {
          error: err
        })
        setError(err?.message || 'No fue posible inicializar la pasarela de pago.')
      }
    },
    [ensureWompiScriptLoaded, navigate, navigateToStatus, event, userEmail, userName, eventId, unwrapResponse]
  )

  const initializePayment = useCallback(async () => {
    if (!eventId) return

    abortRef.current = false

    if (hasInitializedRef.current) {
      return
    }

    setLoading(true)
    setProcessing(false)
    setError(null)

    try {
      const rawIntent = await unwrapResponse(await bookingService.createEventPaymentIntent(parseInt(eventId)))

      if (abortRef.current) return

      const normalizedIntent = {
        ...rawIntent,
        ...(rawIntent?.data || {})
      }

      if (!normalizedIntent?.publicKey || !normalizedIntent?.signature) {
        throw new Error('La configuración de la pasarela de pago es inválida.')
      }

      hasInitializedRef.current = true
      setLoading(false)

      await launchWompiCheckout(normalizedIntent)
    } catch (err) {
      if (abortRef.current) return

      hasInitializedRef.current = false

      Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment', 'Failed to prepare payment intent', {
        error: err,
        eventId
      })
      setError(err?.message || 'No pudimos iniciar el proceso de pago. Intenta nuevamente.')
      setLoading(false)
    }
  }, [launchWompiCheckout, eventId, unwrapResponse])

  useEffect(() => {
    hasInitializedRef.current = false
  }, [eventId])

  useEffect(() => {
    if (!event || !eventId) {
      navigate(APP_PATHS.USER.EVENTS)

      return undefined
    }

    const timeoutId = setTimeout(() => {
      initializePayment()
    }, 0)

    return () => {
      abortRef.current = true
      clearTimeout(timeoutId)
    }
  }, [initializePayment, navigate, event, eventId])

  if (!event) {
    return <LoadDataError message='No se encontró información del evento seleccionado' />
  }

  if (error) {
    return <LoadDataError message={error} retryAction={initializePayment} retryButtonText='Reintentar' />
  }

  return (
    <>
      <Helmet>
        <title>Procesar Pago - Feeling</title>
        <meta content='Completa tu pago de forma segura con Wompi' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de procesamiento de pago' className='gap-6 max-w-3xl !pt-0 !min-h-0 py-8'>
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
                  <h3 className='text-lg font-semibold text-gray-100'>Resumen de tu reserva</h3>
                  <div className='bg-gray-800/40 rounded-lg p-4'>
                    <p className='text-sm text-gray-400'>Evento</p>
                    <p className='text-lg font-bold text-gray-100'>{event.title}</p>
                    {event.price > 0 && (
                      <>
                        <p className='text-sm text-gray-400 mt-2'>Total a pagar</p>
                        <p className='text-2xl font-bold text-primary-400'>
                          {event.price.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                <Shield className='w-5 h-5 text-blue-400 flex-shrink-0' />
                <p className='text-sm text-gray-300'>Pago 100% seguro mediante plataforma certificada Wompi</p>
              </div>
              <div className='flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg'>
                <Lock className='w-5 h-5 text-green-400 flex-shrink-0' />
                <p className='text-sm text-gray-300'>Tus datos están protegidos con encriptación de última generación</p>
              </div>
            </div>

            {processing && (
              <Card className='bg-amber-500/10 border-amber-500/20'>
                <CardBody className='p-4'>
                  <div className='flex items-center gap-3'>
                    <Spinner color='warning' size='sm' />
                    <p className='text-sm text-amber-300'>Procesando tu pago, por favor espera...</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </LiteContainer>
    </>
  )
}

export default EventPayment
