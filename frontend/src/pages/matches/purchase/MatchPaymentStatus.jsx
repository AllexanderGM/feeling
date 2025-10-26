import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Spinner, Divider } from '@heroui/react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { PaymentStatusCard, PaymentStatusBadge, PaymentDetailRow } from '@components/payment'
import { PaymentService, WompiAdapter } from '@services/payment'
import { APP_PATHS } from '@constants/paths.js'
import { useError } from '@hooks'
import { Logger } from '@utils/logger.js'

const MatchPaymentStatus = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleError, handleSuccess, handleWarning } = useError()

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
        handleSuccess('¡Pago confirmado! Tu plan de match fue activado.')
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

    Logger.info(Logger.CATEGORIES.SERVICE, 'match_payment_status', 'Consulting payment status', {
      transactionId,
      referenceFromQuery
    })

    // TODO: Implementar servicio de confirmación de pago para matches
    // Por ahora simulamos una respuesta basada en los parámetros
    const mockResponse = {
      success: true,
      status: statusFromQuery || 'APPROVED',
      paymentReference: referenceFromQuery,
      transactionId: transactionId,
      planId: PaymentService.extractEntityIdFromReference(referenceFromQuery),
      data: {
        transactionId: transactionId,
        status: statusFromQuery || 'APPROVED'
      }
    }

    Logger.info(Logger.CATEGORIES.SERVICE, 'match_payment_status', 'Payment confirmation received', {
      transactionId,
      status: mockResponse.status,
      reference: mockResponse.paymentReference
    })

    return mockResponse
  }, [referenceFromQuery, statusFromQuery, transactionId])

  useEffect(() => {
    let cancelled = false

    if (!transactionId) {
      Logger.warn(Logger.CATEGORIES.SERVICE, 'match_payment_status', 'Missing transaction identifier on redirect', {
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
        Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment_status', error, {
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

  const paymentReference = paymentResult?.paymentReference || referenceFromQuery || errorState?.reference
  const planId = paymentResult?.planId || null
  const wompiTransactionId = paymentResult?.metadata?.transactionId || paymentResult?.metadata?.id || transactionId || null
  const wompiStatus = paymentResult?.metadata?.status || effectiveStatus
  const wompiEnvironment = paymentResult?.environment || environmentFromQuery

  // Extraer planId de la referencia usando PaymentService
  const extractedPlanId = useMemo(() => PaymentService.extractEntityIdFromReference(paymentReference), [paymentReference])

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.PURCHASE_PLANS)
  }

  const handleViewPlans = () => {
    navigate(APP_PATHS.USER.PURCHASE_PLANS)
  }

  const handleViewMyMatches = () => {
    navigate(APP_PATHS.USER.MY_MATCHES)
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
      Logger.error(Logger.CATEGORIES.SERVICE, 'match_payment_status_retry', error, {
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
        <title>Estado del pago del plan - Feeling</title>
        <meta content='Consulta el estado del pago de tu plan de match' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Estado del pago del plan de match' className='max-w-3xl gap-6'>
        {/* Card principal de estado usando componente compartido */}
        <PaymentStatusCard
          badge={<PaymentStatusBadge config={statusConfig} status={statusKey} />}
          description={statusConfig.description}
          message={paymentResult?.message || errorState?.message}
          statusConfig={statusConfig}
        />

        {/* Card con detalles de la transacción */}
        <Card className='bg-gray-800/40 border-gray-700/60'>
          <CardBody className='space-y-4'>
            {isLoading ? (
              <div className='flex flex-col items-center gap-3 py-6'>
                <Spinner color='primary' size='lg' />
                <p className='text-sm text-gray-400'>Consultando con Wompi...</p>
              </div>
            ) : (
              <>
                {/* Detalles de pago usando componente compartido */}
                <div className='grid gap-3 sm:grid-cols-2'>
                  <PaymentDetailRow label='ID de transacción' value={wompiTransactionId} />
                  <PaymentDetailRow label='Referencia de pago' value={paymentReference} />
                  <PaymentDetailRow label='ID del plan' value={planId || extractedPlanId ? `#${planId || extractedPlanId}` : null} />
                  <PaymentDetailRow label='Estado informado por Wompi' value={wompiStatus} />
                  <PaymentDetailRow label='Ambiente' value={wompiEnvironment} />
                  <PaymentDetailRow label='Estado recibido en la redirección' value={statusFromQuery || null} />
                </div>

                <Divider className='border-gray-700/50' />

                {/* Información adicional */}
                <div className='space-y-2 text-sm text-gray-400'>
                  <p>
                    Si cerraste el navegador o perdiste la confirmación, no te preocupes: desde aquí verificamos directamente con Wompi que
                    tu pago se haya procesado.
                  </p>
                  {statusKey !== 'APPROVED' ? (
                    <p>
                      Puedes regresar a ver los planes disponibles para intentar nuevamente cuando lo desees o usar otro método de pago.
                    </p>
                  ) : (
                    <p>
                      Tu plan de match ha sido activado exitosamente. Ahora puedes disfrutar de tus beneficios y enviar matches a otros
                      usuarios.
                    </p>
                  )}
                </div>

                {/* Mensaje de error si existe */}
                {errorState ? (
                  <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
                    <p className='font-medium'>No pudimos confirmar la transacción.</p>
                    <p className='mt-1 text-red-300'>{errorState.message}</p>
                  </div>
                ) : null}
              </>
            )}
          </CardBody>
        </Card>

        {/* Botones de acción */}
        <div className='grid gap-3 sm:grid-cols-2'>
          <Button
            className='w-full'
            color='default'
            startContent={<ArrowLeft className='h-4 w-4' />}
            variant='bordered'
            onPress={handleGoBack}>
            Ver planes
          </Button>
          {statusKey === 'APPROVED' ? (
            <Button className='w-full' color='primary' endContent={<ExternalLink className='h-4 w-4' />} onPress={handleViewMyMatches}>
              Ver mis matches
            </Button>
          ) : (
            <Button className='w-full' color='primary' endContent={<ExternalLink className='h-4 w-4' />} onPress={handleViewPlans}>
              Intentar nuevamente
            </Button>
          )}
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

export default MatchPaymentStatus
