import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button, Divider, Checkbox, Spinner } from '@heroui/react'
import { Calendar, ArrowLeft, CreditCard, Shield, AlertCircle, MapPin, Check, Users, Clock } from 'lucide-react'
import { useAuth, useError } from '@hooks'
import { APP_PATHS } from '@constants/paths'
import { getUserEmail, getUserName, getUserLastName, getUserPhone, getUserPhoneCode, getUserDocument } from '@schemas'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { eventService, bookingService } from '@services'
import { parseJavaDate } from '@utils/dateUtils.js'

const EventCheckout = () => {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const { user } = useAuth()
  const { handleError } = useError()

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [eventLoading, setEventLoading] = useState(true)
  const [eventError, setEventError] = useState(null)

  // User data
  const userEmail = useMemo(() => getUserEmail(user), [user])
  const userName = useMemo(() => getUserName(user), [user])
  const userLastName = useMemo(() => getUserLastName(user), [user])
  const userPhone = useMemo(() => getUserPhone(user), [user])
  const userPhoneCode = useMemo(() => getUserPhoneCode(user), [user])
  const userDocument = useMemo(() => getUserDocument(user), [user])

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

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setEventError('ID de evento no válido')
        setEventLoading(false)

        return
      }

      setEventLoading(true)
      setEventError(null)

      try {
        const response = await eventService.getEventById(parseInt(eventId))
        const data = unwrapResponse(response)

        setEventData(data)
      } catch (error) {
        handleError(error, {
          customMessage: 'No pudimos cargar la información del evento',
          showToast: true
        })
        setEventError('Error al cargar el evento')
      } finally {
        setEventLoading(false)
      }
    }

    loadEvent()
  }, [eventId, handleError, unwrapResponse])

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.EVENT_DETAIL.replace(':eventId', eventId))
  }

  const handleProceedToPayment = () => {
    if (!acceptedTerms) return

    setProcessing(true)

    // Para eventos pagos, EventPayment.jsx creará automáticamente el EventRegistration
    // al llamar a createEventPaymentIntent
    navigate(APP_PATHS.USER.EVENT_PAYMENT.replace(':eventId', eventId), {
      state: {
        event: eventData,
        userEmail,
        userName: `${userName} ${userLastName}`
      }
    })
  }

  // Price calculation - el precio del evento ya incluye IVA
  const total = eventData?.price || 0

  // Format event date
  const eventDate = useMemo(() => parseJavaDate(eventData?.eventDate), [eventData?.eventDate])
  const formattedEventDate = useMemo(() => {
    if (!eventDate) return 'Por definir'

    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(eventDate)
  }, [eventDate])

  const formattedEventTime = useMemo(() => {
    if (!eventDate) return null

    return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }).format(eventDate)
  }, [eventDate])

  // Show loading while fetching event
  if (eventLoading) {
    return (
      <LiteContainer ariaLabel='Cargando información del evento' className='gap-6 max-w-4xl !min-h-0 py-8'>
        <div className='flex flex-col items-center justify-center py-20'>
          <Spinner color='primary' size='lg' />
          <p className='text-gray-400 mt-4'>Cargando información del evento...</p>
        </div>
      </LiteContainer>
    )
  }

  if (eventError || !eventData) {
    return <LoadDataError message={eventError || 'No se encontró información del evento seleccionado'} retryAction={() => navigate(0)} />
  }

  return (
    <>
      <Helmet>
        <title>Resumen de Reserva - Feeling</title>
        <meta content='Revisa y confirma tu reserva de evento' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de checkout' className='gap-6 max-w-4xl !pt-0 !min-h-0 py-8'>
        {/* Header */}
        <div className='space-y-4 w-full'>
          <Button
            className='text-gray-400 hover:text-gray-200'
            size='sm'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='light'
            onPress={handleGoBack}>
            Volver al Evento
          </Button>

          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
              <Calendar className='w-6 h-6 text-blue-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-100'>Resumen de Reserva</h1>
              <p className='text-sm text-gray-400'>Revisa los detalles antes de proceder al pago</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Event Details */}
            <Card className='bg-gray-800/40 border-gray-700/50'>
              <CardBody className='p-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                    <Calendar className='w-5 h-5 text-purple-400' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-100'>Evento Seleccionado</h2>
                    <p className='text-sm text-gray-400'>Detalles de tu reserva</p>
                  </div>
                </div>

                <div className='bg-gray-700/30 rounded-lg p-4 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-gray-100'>{eventData.title}</h3>
                      {eventData.description && <p className='text-sm text-gray-400 mt-1 line-clamp-2'>{eventData.description}</p>}
                    </div>
                  </div>

                  <Divider className='bg-gray-600/50' />

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-blue-400' />
                      <div>
                        <p className='text-xs text-gray-500'>Fecha</p>
                        <p className='text-sm text-gray-200'>{formattedEventDate}</p>
                      </div>
                    </div>

                    {formattedEventTime && (
                      <div className='flex items-center gap-2'>
                        <Clock className='w-4 h-4 text-blue-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Hora</p>
                          <p className='text-sm text-gray-200'>{formattedEventTime}</p>
                        </div>
                      </div>
                    )}

                    {eventData.location && (
                      <div className='flex items-center gap-2'>
                        <MapPin className='w-4 h-4 text-green-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Ubicación</p>
                          <p className='text-sm text-gray-200'>{eventData.location}</p>
                        </div>
                      </div>
                    )}

                    {eventData.maxCapacity && (
                      <div className='flex items-center gap-2'>
                        <Users className='w-4 h-4 text-purple-400' />
                        <div>
                          <p className='text-xs text-gray-500'>Capacidad</p>
                          <p className='text-sm text-gray-200'>{eventData.maxCapacity} personas</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Billing Information */}
            <Card className='bg-blue-500/5 border-blue-500/20'>
              <CardBody className='p-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <CreditCard className='w-5 h-5 text-blue-400' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-sm font-semibold text-blue-400 mb-2'>Información de Facturación</h3>
                    <p className='text-xs text-gray-400 mb-3'>Los datos de tu perfil se usarán para procesar el pago:</p>
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>Nombre:</span>
                        <span className='text-sm text-gray-300 font-medium'>
                          {userName} {userLastName}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>Email:</span>
                        <span className='text-sm text-gray-300 font-medium'>{userEmail || 'No especificado'}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>Teléfono:</span>
                        <span className='text-sm text-gray-300 font-medium'>
                          {userPhoneCode && userPhone ? `+${userPhoneCode} ${userPhone}` : 'No especificado'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>Documento:</span>
                        <span className='text-sm text-gray-300 font-medium'>{userDocument || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security Badge */}
            <div className='flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg'>
              <Shield className='w-5 h-5 text-green-400 flex-shrink-0' />
              <div>
                <p className='text-sm font-medium text-green-400'>Pago 100% seguro</p>
                <p className='text-xs text-gray-400'>Procesado mediante Wompi, una plataforma de pagos segura y confiable</p>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className='lg:col-span-1'>
            <Card className='bg-gray-800/40 border-gray-700/50 sticky top-4'>
              <CardBody className='p-6'>
                <h2 className='text-lg font-semibold text-gray-100 mb-4'>Resumen del Pedido</h2>

                <div className='space-y-4 mb-4'>
                  <div className='bg-gray-700/30 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-gray-400'>{eventData.title}</span>
                      <span className='text-sm text-gray-300 font-medium'>1 entrada</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500'>Precio final (IVA incluido)</span>
                    </div>
                  </div>

                  <Divider className='bg-gray-600' />

                  <div className='flex items-center justify-between'>
                    <span className='text-base font-semibold text-gray-200'>Total a pagar:</span>
                    <span className='text-2xl font-bold text-green-400'>
                      {total === 0
                        ? 'Gratis'
                        : total.toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                    </span>
                  </div>
                </div>

                <Divider className='bg-gray-600 mb-4' />

                {/* Terms and Conditions */}
                <div className='space-y-4 mb-4'>
                  <Checkbox
                    classNames={{
                      label: 'text-sm text-gray-300'
                    }}
                    isSelected={acceptedTerms}
                    size='sm'
                    onValueChange={setAcceptedTerms}>
                    Acepto los{' '}
                    <a className='text-blue-400 hover:text-blue-300 underline' href='/terminos' rel='noreferrer' target='_blank'>
                      términos y condiciones
                    </a>
                  </Checkbox>

                  {!acceptedTerms && (
                    <div className='flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                      <AlertCircle className='w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5' />
                      <p className='text-xs text-amber-300'>Debes aceptar los términos y condiciones para continuar</p>
                    </div>
                  )}
                </div>

                {/* Proceed Button */}
                <Button
                  className='w-full'
                  color='primary'
                  isDisabled={!acceptedTerms || processing}
                  isLoading={processing}
                  size='lg'
                  startContent={!processing && <Check className='w-5 h-5' />}
                  onPress={handleProceedToPayment}>
                  {total === 0 ? 'Confirmar Reserva Gratuita' : 'Proceder al Pago'}
                </Button>

                <p className='text-xs text-gray-500 text-center mt-3'>Al proceder, serás redirigido a nuestra pasarela de pagos segura</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </LiteContainer>
    </>
  )
}

export default EventCheckout
