import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Spinner, Divider } from '@heroui/react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { PaymentStatusCard, PaymentStatusBadge } from '@components/payment'
import { PaymentService, WompiAdapter } from '@services/payment'
import { APP_PATHS } from '@constants/paths.js'
import { bookingService } from '@services'
import { useError } from '@hooks'
import { Logger } from '@utils/logger.js'
import confetti from 'canvas-confetti'

const EventPaymentStatus = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleError, handleSuccess, handleWarning } = useError()

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

  // Extraer parámetros de la URL usando WompiAdapter
  const params = useMemo(() => WompiAdapter.extractAllParams(searchParams), [searchParams])
  const { transactionId, reference: referenceFromQuery, status: statusFromQuery, environment: environmentFromQuery } = params

  const [isLoading, setIsLoading] = useState(Boolean(transactionId))
  const [paymentResult, setPaymentResult] = useState(null)
  const [errorState, setErrorState] = useState(null)

  const applySuccess = useCallback(
    response => {
      const normalizedStatus = PaymentService.normalizeStatus(response?.status)

      setPaymentResult({
        ...response,
        status: normalizedStatus,
        metadata: response?.data || {},
        environment: environmentFromQuery
      })
      setErrorState(null)
      setIsLoading(false)

      if (PaymentService.isSuccessStatus(normalizedStatus)) {
        handleSuccess('¡Pago confirmado! Tu lugar quedó reservado.')
      } else if (PaymentService.isPendingStatus(normalizedStatus)) {
        handleWarning('El pago quedó pendiente. Te avisaremos cuando cambie el estado.')
      } else if (PaymentService.isFailureStatus(normalizedStatus)) {
        handleWarning('El pago fue rechazado por Wompi.')
      }
    },
    [environmentFromQuery, handleSuccess, handleWarning]
  )

  const applyFailure = useCallback(
    (error, { customMessage } = {}) => {
      const fallbackMessage = customMessage || 'No pudimos verificar el estado del pago.'

      handleError(error, {
        customMessage: fallbackMessage,
        showToast: true
      })

      setPaymentResult(null)
      setErrorState({
        message: error?.message || fallbackMessage,
        status: statusFromQuery || 'ERROR',
        reference: referenceFromQuery
      })
      setIsLoading(false)
    },
    [handleError, referenceFromQuery, statusFromQuery]
  )

  const fetchPaymentStatus = useCallback(async () => {
    if (!transactionId) {
      throw new Error('Missing transaction identifier')
    }

    Logger.info(Logger.CATEGORIES.SERVICE, 'event_payment_status', 'Consulting payment status', {
      transactionId,
      referenceFromQuery
    })
    const response = await bookingService.confirmEventPayment(transactionId)
    const payload = unwrapResponse(response)

    Logger.info(Logger.CATEGORIES.SERVICE, 'event_payment_status', 'Payment confirmation received', {
      transactionId,
      status: payload?.status,
      reference: payload?.paymentReference
    })

    return payload
  }, [referenceFromQuery, transactionId, unwrapResponse])

  useEffect(() => {
    let cancelled = false

    if (!transactionId) {
      Logger.warn(Logger.CATEGORIES.SERVICE, 'event_payment_status', 'Missing transaction identifier on redirect', {
        context: {
          referenceFromQuery,
          statusFromQuery,
          environmentFromQuery
        }
      })
      setIsLoading(false)
      setErrorState({
        message: 'No recibimos el identificador de la transacción desde Wompi.',
        status: statusFromQuery,
        reference: referenceFromQuery
      })
      handleWarning('No pudimos validar tu pago porque no recibimos la transacción desde Wompi.')

      return undefined
    }

    const run = async () => {
      setIsLoading(true)
      setErrorState(null)

      try {
        const response = await fetchPaymentStatus()

        if (cancelled) return
        applySuccess(response)
      } catch (error) {
        if (cancelled) return
        Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment_status', error, {
          context: {
            transactionId,
            referenceFromQuery,
            statusFromQuery
          }
        })
        applyFailure(error)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [
    applyFailure,
    applySuccess,
    environmentFromQuery,
    fetchPaymentStatus,
    handleWarning,
    referenceFromQuery,
    statusFromQuery,
    transactionId
  ])

  // Calcular estado efectivo y configuración usando PaymentService
  const effectiveStatus = paymentResult?.status || errorState?.status || statusFromQuery || 'UNKNOWN'
  const statusKey = PaymentService.normalizeStatus(effectiveStatus)
  const statusConfig = PaymentService.getStatusConfig(statusKey)

  // Trigger confetti animation on successful payment
  useEffect(() => {
    if (statusKey === 'APPROVED' && !isLoading) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)

          return
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [statusKey, isLoading])

  const paymentReference = paymentResult?.paymentReference || referenceFromQuery || errorState?.reference
  const registrationId = paymentResult?.registrationId || null
  const wompiTransactionId = paymentResult?.metadata?.transactionId || paymentResult?.metadata?.id || transactionId || null
  const wompiStatus = paymentResult?.metadata?.status || effectiveStatus
  const wompiEnvironment = paymentResult?.environment || environmentFromQuery

  // Extraer eventId de la referencia usando PaymentService
  const eventId = useMemo(() => PaymentService.extractEntityIdFromReference(paymentReference), [paymentReference])

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.EVENTS)
  }

  const handleViewEvent = () => {
    if (eventId) {
      navigate(APP_PATHS.USER.EVENT_DETAIL.replace(':eventId', eventId))
    } else {
      handleGoBack()
    }
  }

  const handleRetryConfirmation = async () => {
    if (!transactionId) return
    setIsLoading(true)
    setPaymentResult(null)
    setErrorState(null)

    try {
      const response = await fetchPaymentStatus()

      applySuccess(response)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'event_payment_status_retry', error, {
        context: {
          transactionId,
          referenceFromQuery
        }
      })
      applyFailure(error, { customMessage: 'No pudimos verificar el estado del pago al reintentar.' })
    }
  }

  return (
    <>
      <Helmet>
        <title>Estado del pago del evento - Feeling</title>
        <meta content='Consulta el estado del pago de tu inscripción al evento' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Estado del pago de evento' className='max-w-3xl gap-6'>
        {/* Card principal de estado usando componente compartido */}
        <PaymentStatusCard
          badge={<PaymentStatusBadge config={statusConfig} status={statusKey} />}
          description={statusConfig.description}
          message={paymentResult?.message || errorState?.message}
          statusConfig={statusConfig}
        />

        {/* Card destacado con número de inscripción - Solo si está aprobado */}
        {registrationId && statusKey === 'APPROVED' && !isLoading && (
          <Card className='bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20'>
            <CardBody className='p-6'>
              <div className='text-center space-y-3'>
                <p className='text-sm text-gray-400'>Tu número de inscripción es</p>
                <p className='text-4xl sm:text-5xl font-bold text-green-400'>#{registrationId}</p>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full'>
                  <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                  <span className='text-sm text-green-300 font-medium'>Confirmado</span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Card con detalles de la transacción - Layout vertical mobile-first */}
        <Card className='bg-gray-800/40 border-gray-700/50'>
          <CardBody className='space-y-6 p-4 sm:p-6'>
            {isLoading ? (
              <div className='flex flex-col items-center gap-3 py-6'>
                <Spinner color='primary' size='lg' />
                <p className='text-sm text-gray-400'>Consultando con Wompi...</p>
              </div>
            ) : (
              <>
                {/* Información principal del pago */}
                <div className='space-y-4'>
                  {/* Referencia de pago */}
                  {paymentReference && (
                    <div className='space-y-2'>
                      <p className='text-xs text-gray-500'>Referencia de pago</p>
                      <p className='text-base text-gray-300 font-mono break-all'>{paymentReference}</p>
                    </div>
                  )}

                  {/* ID de inscripción - Solo si no es APPROVED (si es APPROVED ya está arriba) */}
                  {registrationId && statusKey !== 'APPROVED' && (
                    <div className='space-y-2'>
                      <p className='text-xs text-gray-500'>Número de inscripción</p>
                      <p className='text-2xl font-bold text-blue-400'>#{registrationId}</p>
                    </div>
                  )}

                  {/* Divider si hay información técnica */}
                  {(wompiTransactionId || wompiStatus || wompiEnvironment) && <Divider className='border-gray-700/50' />}

                  {/* Detalles técnicos - formato vertical */}
                  <div className='space-y-3'>
                    {wompiTransactionId && (
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4'>
                        <span className='text-xs text-gray-500'>ID de transacción</span>
                        <span className='text-sm text-gray-300 font-mono break-all'>{wompiTransactionId}</span>
                      </div>
                    )}

                    {wompiStatus && (
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4'>
                        <span className='text-xs text-gray-500'>Estado en Wompi</span>
                        <span className='text-sm text-gray-300'>{wompiStatus}</span>
                      </div>
                    )}

                    {wompiEnvironment && (
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4'>
                        <span className='text-xs text-gray-500'>Ambiente</span>
                        <span className='text-sm text-gray-300 capitalize'>{wompiEnvironment}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Divider className='border-gray-700/50' />

                {/* Información adicional - Más concisa */}
                <div className='space-y-3'>
                  {statusKey === 'APPROVED' ? (
                    <>
                      <div className='flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg'>
                        <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <ExternalLink className='w-4 h-4 text-blue-400' />
                        </div>
                        <div>
                          <p className='text-sm text-gray-300'>
                            Encontrarás tu inscripción en la sección de eventos reservados. Te enviaremos un correo con los detalles.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className='p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg'>
                      <p className='text-sm text-gray-400'>
                        Puedes regresar al detalle del evento para intentar nuevamente o usar otro método de pago.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mensaje de error si existe */}
                {errorState && (
                  <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4'>
                    <p className='text-sm font-medium text-red-200'>No pudimos confirmar la transacción</p>
                    <p className='mt-1 text-sm text-red-300'>{errorState.message}</p>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* Botones de acción - Estilo consistente */}
        <div className='grid gap-3 sm:grid-cols-2'>
          <Button
            className='w-full'
            color='primary'
            endContent={<ExternalLink className='h-4 w-4' />}
            isDisabled={!eventId}
            onPress={handleViewEvent}>
            {eventId ? 'Volver al evento' : 'Regresar'}
          </Button>
          <Button
            className='w-full'
            color='default'
            startContent={<ArrowLeft className='h-4 w-4' />}
            variant='bordered'
            onPress={handleGoBack}>
            Ver más eventos
          </Button>
        </div>

        {/* Botón de reintentar si hay error */}
        {errorState ? (
          <Button
            className='w-full'
            color='secondary'
            isDisabled={isLoading || !transactionId}
            variant='flat'
            onPress={handleRetryConfirmation}>
            Reintentar verificación
          </Button>
        ) : null}
      </LiteContainer>
    </>
  )
}

export default EventPaymentStatus
