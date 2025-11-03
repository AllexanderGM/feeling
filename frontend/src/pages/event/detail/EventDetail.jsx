import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Spinner,
  Tooltip
} from '@heroui/react'
import { ArrowLeft, CalendarDays, Clock, MapPin, Ticket, Users, AlertTriangle, Check, Sparkles, ShieldCheck, XCircle } from 'lucide-react'
import { bookingService, eventService } from '@services'
import { useAuth, useError } from '@hooks'
import { APP_PATHS } from '@constants/paths'
import { parseJavaDate } from '@utils/dateUtils.js'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { RichTextViewer } from '@components/ui/richtext'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { EventSEO } from '@components/seo'
import Breadcrumbs from '@components/ui/Breadcrumbs.jsx'

import ImageGallery from './components/ImageGallery.jsx'
import UserDataModal from './components/UserDataModal.jsx'

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long'
})

const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
})

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js'

const EventDetail = () => {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const numericEventId = Number(eventId)
  const { handleError, handleSuccess, handleWarning } = useError()
  const { user, isAuthenticated } = useAuth()

  const [eventData, setEventData] = useState(null)
  const [eventLoading, setEventLoading] = useState(true)
  const [eventError, setEventError] = useState('')

  const [registration, setRegistration] = useState(null)
  const [registrationLoading, setRegistrationLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [guestBooking, setGuestBooking] = useState(null)
  const [guestContactEmail, setGuestContactEmail] = useState('')

  const isFreeEvent = useMemo(() => (eventData?.price ?? 0) <= 0, [eventData?.price])

  const registrationView = useMemo(() => {
    if (!registration) return null

    const statusKey = registration.paymentStatus ? registration.paymentStatus.toUpperCase() : null
    const alreadyConfirmed =
      Boolean(registration.isPaid || registration.isConfirmed) ||
      ['COMPLETED', 'APPROVED', 'CONFIRMED', 'PAID', 'NOT_REQUIRED'].includes(statusKey || '')

    if (!isFreeEvent || alreadyConfirmed) {
      return registration
    }

    return {
      ...registration,
      paymentStatus: 'NOT_REQUIRED',
      paymentStatusDisplayName: registration.paymentStatusDisplayName || 'Reserva confirmada',
      isPending: false,
      isPaid: true,
      isConfirmed: true
    }
  }, [isFreeEvent, registration])

  const registrationStatus = registrationView?.paymentStatus || null
  const registrationStatusKey = registrationStatus ? registrationStatus.toUpperCase() : null
  const isRegistrationPaid = Boolean(
    registrationView?.isPaid ||
      registrationView?.isConfirmed ||
      ['COMPLETED', 'APPROVED', 'CONFIRMED', 'PAID', 'NOT_REQUIRED'].includes(registrationStatusKey || '')
  )
  const isRegistrationPending = Boolean(registrationView?.isPending || (!isRegistrationPaid && registrationStatusKey === 'PENDING'))
  const isRegistrationFailed = registrationStatusKey === 'FAILED'
  const hasConfirmedRegistration = Boolean(registrationView?.isConfirmed || isRegistrationPaid)

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

  const loadEvent = useCallback(async () => {
    if (!Number.isFinite(numericEventId)) {
      setEventError('Identificador de evento no válido')
      setEventLoading(false)

      return
    }

    setEventLoading(true)
    setEventError('')

    try {
      const response = await eventService.getEventById(numericEventId)
      const data = unwrapResponse(response)

      setEventData(data)
    } catch (error) {
      const status = error?.response?.status

      if (status === 404) {
        setEventError('El evento que buscas no existe o ya no está disponible.')
      } else {
        handleError(error, {
          customMessage: 'No pudimos cargar la información del evento. Inténtalo nuevamente.',
          showToast: true
        })
        setEventError('Ocurrió un problema al obtener la información del evento.')
      }

      setEventData(null)
    } finally {
      setEventLoading(false)
    }
  }, [handleError, isAuthenticated, numericEventId, unwrapResponse])

  const loadRegistrationState = useCallback(async () => {
    if (!Number.isFinite(numericEventId)) {
      setRegistrationLoading(false)
      setIsRegistered(false)
      setRegistration(null)

      return
    }

    if (!isAuthenticated) {
      setRegistrationLoading(false)
      setIsRegistered(false)
      setRegistration(null)

      return
    }

    setRegistrationLoading(true)

    try {
      const registeredResponse = await bookingService.isRegisteredToEvent(numericEventId)
      const registered = unwrapResponse(registeredResponse)

      if (registered) {
        try {
          const registrationResponse = await bookingService.getMyRegistrationForEvent(numericEventId)
          const registrationData = unwrapResponse(registrationResponse)

          setRegistration(registrationData)
        } catch (innerError) {
          const status = innerError?.response?.status

          if (status !== 404) {
            handleError(innerError, {
              showToast: true,
              customMessage: 'No pudimos recuperar tu reserva. Por favor intenta de nuevo.'
            })
          }

          setRegistration(null)
        }
      } else {
        setRegistration(null)
      }

      setIsRegistered(Boolean(registered))
    } catch (error) {
      handleError(error, {
        customMessage: 'No fue posible verificar tu reserva para el evento.',
        showToast: true
      })
      setIsRegistered(false)
      setRegistration(null)
    } finally {
      setRegistrationLoading(false)
    }
  }, [handleError, numericEventId, unwrapResponse])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      await loadEvent()
      if (isMounted) {
        await loadRegistrationState()
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [loadEvent, loadRegistrationState])

  useEffect(() => {
    setGuestBooking(null)
    setGuestContactEmail('')
  }, [numericEventId])

  useEffect(() => {
    if (isAuthenticated) {
      setGuestBooking(null)
      setGuestContactEmail('')
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (location.state?.booking) {
      setGuestBooking(location.state.booking)
      setGuestContactEmail(location.state.guestEmail || '')
      handleSuccess('Tu reserva gratuita fue registrada exitosamente.')

      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate, handleSuccess])

  useEffect(() => {
    if (!isAuthenticated || !isRegistrationPending) {
      return
    }

    const interval = setInterval(() => {
      loadRegistrationState()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, isRegistrationPending, loadRegistrationState])

  const eventDate = useMemo(() => parseJavaDate(eventData?.eventDate), [eventData?.eventDate])
  const createdAt = useMemo(() => parseJavaDate(eventData?.createdAt), [eventData?.createdAt])
  const updatedAt = useMemo(() => parseJavaDate(eventData?.updatedAt), [eventData?.updatedAt])

  const formattedEventDate = useMemo(() => {
    if (!eventDate) return 'Por definir'

    return dateFormatter.format(eventDate)
  }, [eventDate])

  const formattedEventTime = useMemo(() => {
    if (!eventDate) return null

    return timeFormatter.format(eventDate)
  }, [eventDate])

  const formattedPrice = useMemo(() => {
    if (eventData?.price === null || eventData?.price === undefined) {
      return 'Entrada gratuita'
    }

    try {
      return priceFormatter.format(eventData.price)
    } catch {
      return `${eventData.price} COP`
    }
  }, [eventData?.price])

  const availabilityLabel = useMemo(() => {
    if (!eventData) return 'Cupos por confirmar'

    if (eventData.isFull) return 'Aforo completo'
    if (eventData.hasAvailableSpots === false) return 'Sin cupos disponibles'
    if (typeof eventData.availableSpots === 'number') {
      return `${eventData.availableSpots} cupos disponibles`
    }

    if (typeof eventData.maxCapacity === 'number') {
      const reserved = eventData.currentAttendees ?? 0

      return `${reserved}/${eventData.maxCapacity} reservados`
    }

    return 'Cupos limitados'
  }, [eventData])

  const isEventOpenForRegistration = useMemo(() => {
    if (!eventData) return false
    if (eventData.isFull) return false
    if (eventData.hasAvailableSpots === false) return false
    if (eventData.isActive === false) return false
    if (eventData.isPublished === false) return false
    if (eventData.canAcceptRegistrations === false) return false

    return true
  }, [eventData])

  const canAttemptReservation = useMemo(() => {
    if (!isEventOpenForRegistration) return false

    if (isAuthenticated) {
      return !hasConfirmedRegistration
    }

    if (!guestBooking) {
      return true
    }

    if (eventData?.price > 0) {
      const status = guestBooking.paymentStatus?.toUpperCase() || ''

      return status !== 'CONFIRMED' && status !== 'COMPLETED'
    }

    return false
  }, [eventData?.price, guestBooking, hasConfirmedRegistration, isAuthenticated, isEventOpenForRegistration])

  const registrationNote = useMemo(() => {
    if (!eventData) {
      return { text: 'Información no disponible', tone: 'warning' }
    }

    if (!isAuthenticated) {
      if (guestBooking) {
        const status = guestBooking.paymentStatus?.toUpperCase() || ''

        if (status === 'PENDING') {
          return {
            text: 'Estamos validando tu pago. Te enviaremos un correo con la confirmación en los próximos minutos.',
            tone: 'warning'
          }
        }
        if (status === 'CONFIRMED' || status === 'COMPLETED' || status === 'APPROVED') {
          return {
            text: 'Tu reserva está confirmada. Revisa tu correo para más información.',
            tone: 'success'
          }
        }
        if (!status || status === 'NOT_REQUIRED') {
          return {
            text: 'Tu cupo ha sido registrado. Te contactaremos antes del evento para confirmar asistencia.',
            tone: 'success'
          }
        }

        return {
          text: 'Hemos recibido tus datos. Revisa tu correo para confirmar los detalles del evento.',
          tone: 'info'
        }
      }

      return {
        text: 'Completa tus datos básicos para reservar tu lugar.',
        tone: 'info'
      }
    }

    if (isRegistrationPaid) {
      return {
        text: 'Tu pago se registró correctamente. Te enviaremos recordatorios antes del evento.',
        tone: 'success'
      }
    }

    if (isRegistrationPending) {
      return {
        text: 'Tu pago está en revisión. Te avisaremos por correo cuando se confirme.',
        tone: 'warning'
      }
    }

    if (isRegistrationFailed) {
      return {
        text: 'No pudimos confirmar el pago. Revisa tu método de pago o vuelve a intentarlo.',
        tone: 'danger'
      }
    }

    if (eventData.isFull || eventData.hasAvailableSpots === false) {
      return { text: 'Los cupos están agotados', tone: 'danger' }
    }

    if (eventData.canAcceptRegistrations === false) {
      return { text: 'Las reservas abrirán pronto', tone: 'warning' }
    }

    return { text: 'Asegura tu cupo cuanto antes', tone: 'info' }
  }, [eventData, guestBooking, isAuthenticated, isRegistrationFailed, isRegistrationPaid, isRegistrationPending])

  const registrationDate = useMemo(() => parseJavaDate(registrationView?.registrationDate), [registrationView?.registrationDate])
  const paymentDate = useMemo(() => parseJavaDate(registrationView?.paymentDate), [registrationView?.paymentDate])

  const registrationCardConfig = useMemo(() => {
    if (!registrationView) {
      return null
    }

    if (isRegistrationPaid) {
      return {
        cardClass: 'bg-green-500/15 backdrop-blur-sm border-green-500/30',
        headerIconBg: 'bg-green-500/20',
        headerIconColor: 'text-green-400',
        chipClass: 'border border-green-400/40 bg-green-500/20 text-xs text-green-200',
        title: 'Tu reserva está confirmada',
        icon: Check,
        footnote:
          'Recibirás recordatorios por correo antes del evento. También puedes consultar tu correo para más detalles de la experiencia.'
      }
    }

    if (isRegistrationPending) {
      return {
        cardClass: 'bg-amber-500/15 backdrop-blur-sm border-amber-500/30',
        headerIconBg: 'bg-amber-500/20',
        headerIconColor: 'text-amber-400',
        chipClass: 'border border-amber-400/40 bg-amber-500/20 text-xs text-amber-100',
        title: 'Estamos procesando tu pago',
        icon: Clock,
        footnote: 'Tu pago está en revisión. Te avisaremos por correo cuando se confirme.'
      }
    }

    if (isRegistrationFailed) {
      return {
        cardClass: 'bg-red-500/15 backdrop-blur-sm border-red-500/30',
        headerIconBg: 'bg-red-500/20',
        headerIconColor: 'text-red-400',
        chipClass: 'border border-red-400/40 bg-red-500/20 text-xs text-red-100',
        title: 'No pudimos confirmar tu pago',
        icon: XCircle,
        footnote: 'Revisa tu método de pago o intenta nuevamente en unos minutos.'
      }
    }

    if (registrationStatusKey === 'CANCELLED') {
      return {
        cardClass: 'bg-gray-500/15 backdrop-blur-sm border-gray-500/30',
        headerIconBg: 'bg-gray-500/20',
        headerIconColor: 'text-gray-300',
        chipClass: 'border border-gray-400/40 bg-gray-500/20 text-xs text-gray-200',
        title: 'Tu reserva fue cancelada',
        icon: AlertTriangle,
        footnote: 'Si necesitas volver a participar, realiza una nueva reserva.'
      }
    }

    return {
      cardClass: 'bg-orange-500/15 backdrop-blur-sm border-orange-400/30',
      headerIconBg: 'bg-orange-500/20',
      headerIconColor: 'text-orange-400',
      chipClass: 'border border-orange-300/40 bg-orange-400/20 text-xs text-orange-100',
      title: 'Tu reserva fue registrada',
      icon: Check,
      footnote: 'En breve recibirás un correo con los pasos para finalizar tu pago.'
    }
  }, [registrationView, isRegistrationFailed, isRegistrationPaid, isRegistrationPending, registrationStatusKey])

  const ensureWompiScriptLoaded = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.WidgetCheckout) {
        // eslint-disable-next-line no-console
        console.info('[Wompi] widget ya disponible')
        resolve()

        return
      }

      let script = document.querySelector(`script[src="${WOMPI_WIDGET_URL}"]`)

      if (script) {
        const handleLoad = () => {
          // eslint-disable-next-line no-console
          console.info('[Wompi] widget cargado (script existente)')
          script.removeEventListener('load', handleLoad)
          script.removeEventListener('error', handleErrorEvent)
          resolve()
        }

        const handleErrorEvent = () => {
          // eslint-disable-next-line no-console
          console.error('[Wompi] fallo al cargar widget (script existente)')
          script.removeEventListener('load', handleLoad)
          script.removeEventListener('error', handleErrorEvent)
          reject(new Error('Error al cargar el widget de Wompi'))
        }

        script.addEventListener('load', handleLoad, { once: true })
        script.addEventListener('error', handleErrorEvent, { once: true })

        return
      }

      script = document.createElement('script')
      script.src = WOMPI_WIDGET_URL
      script.async = true
      script.onload = () => {
        // eslint-disable-next-line no-console
        console.info('[Wompi] widget cargado (script nuevo)')
        resolve()
      }
      script.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('[Wompi] error cargando widget (script nuevo)')
        reject(new Error('Error al cargar el widget de Wompi'))
      }
      // eslint-disable-next-line no-console
      console.info('[Wompi] insertando script del widget')
      document.body.appendChild(script)
    })
  }, [])

  const launchWompiCheckout = useCallback(
    async (paymentSource, options = {}) => {
      await ensureWompiScriptLoaded()

      if (typeof window === 'undefined' || !window.WidgetCheckout) {
        throw new Error('No fue posible inicializar el checkout de Wompi')
      }

      const wompiData = (() => {
        if (!paymentSource) return {}
        if (paymentSource.paymentMetadata) {
          return {
            ...paymentSource.paymentMetadata,
            signature: paymentSource.paymentClientSecret || paymentSource.paymentMetadata.signature,
            paymentReference: paymentSource.paymentMetadata.reference || paymentSource.paymentIntentId
          }
        }

        const data = paymentSource.data ?? paymentSource.metadata ?? paymentSource

        return {
          ...data,
          signature: data.signature || paymentSource.clientSecret,
          paymentReference: data.paymentReference || paymentSource.paymentReference || data.reference
        }
      })()

      const publicKey = wompiData?.publicKey || import.meta.env.VITE_WOMPI_PUBLIC_KEY
      const amountInCents = Number(wompiData?.amountInCents ?? wompiData?.amount ?? 0)
      const currency = wompiData?.currency || 'COP'
      const signature = wompiData?.signature
      const redirectUrl = wompiData?.redirectUrl || window.location.href
      const paymentReference = wompiData?.paymentReference

      if (!publicKey || !signature || !paymentReference) {
        // eslint-disable-next-line no-console
        console.error('[Wompi] datos incompletos', { publicKey, signature, reference: paymentReference })
        throw new Error('Datos de pago incompletos para iniciar Wompi')
      }

      const customerName =
        options.customerName || [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || wompiData?.customerName || ''
      const customerEmail = options.customerEmail || user?.email || wompiData?.email || ''
      const skipBackendConfirmation = Boolean(options.skipBackendConfirmation)

      // eslint-disable-next-line no-console
      console.info('[Wompi] inicializando checkout', {
        publicKey,
        amountInCents,
        currency,
        reference: paymentReference,
        redirectUrl,
        hasWidget: Boolean(window.WidgetCheckout)
      })
      // eslint-disable-next-line no-console
      console.debug('[Wompi] firma calculada', {
        reference: paymentReference,
        amountInCents,
        currency,
        signaturePreview: signature?.slice(0, 12)
      })

      return new Promise((resolve, reject) => {
        if (!window.WidgetCheckout) {
          // eslint-disable-next-line no-console
          console.error('[Wompi] WidgetCheckout no disponible en window')
        }

        const checkout = new window.WidgetCheckout({
          currency,
          amountInCents,
          reference: paymentReference,
          publicKey,
          redirectUrl,
          signature: {
            integrity: signature
          },
          customerData: {
            fullName: customerName,
            email: customerEmail
          }
        })

        checkout.open(async result => {
          try {
            // eslint-disable-next-line no-console
            console.info('[Wompi] checkout result', result)

            if (result?.error) {
              const wompiMessage = result.error?.reason || result.error?.message || result.error?.type || 'No fue posible iniciar el pago.'

              // eslint-disable-next-line no-console
              console.error('[Wompi] checkout error details', result.error)

              setPaymentError(wompiMessage)
              handleWarning(wompiMessage)
              reject(new Error(wompiMessage))

              return
            }

            const transactionStatus = result?.transaction?.status
            const transactionId = result?.transaction?.id

            if (transactionStatus === 'APPROVED' && transactionId) {
              if (skipBackendConfirmation) {
                handleSuccess('¡Pago reportado! Te enviaremos la confirmación definitiva en cuanto validemos la transacción.')
                resolve(result)
              } else {
                try {
                  await unwrapResponse(await bookingService.confirmEventPayment(transactionId))
                  handleSuccess('¡Pago confirmado! Tu lugar está reservado.')
                  await loadEvent()
                  await loadRegistrationState()
                  resolve(result)
                } catch (error) {
                  handleError(error, {
                    customMessage: 'No pudimos confirmar el pago con nuestro servidor.',
                    showToast: true
                  })
                  reject(error)
                }
              }

              return
            }

            if (transactionStatus === 'DECLINED' || transactionStatus === 'ERROR') {
              handleWarning('El pago fue rechazado. Puedes intentar nuevamente más tarde o con otro método de pago.')
              reject(new Error('Pago rechazado'))

              return
            }

            if (transactionStatus === 'PENDING') {
              handleWarning('El pago quedó en estado pendiente. Te notificaremos cuando se actualice su estado.')
              resolve(result)

              return
            }

            handleWarning('No completaste el proceso de pago. Puedes intentarlo nuevamente cuando lo desees.')
            resolve(result)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[Wompi] excepción durante checkout', error)
            reject(error)
          }
        })
      })
    },
    [
      ensureWompiScriptLoaded,
      handleError,
      handleSuccess,
      handleWarning,
      loadEvent,
      loadRegistrationState,
      unwrapResponse,
      user?.email,
      user?.lastName,
      user?.name
    ]
  )

  const handleGuestSubmit = useCallback(
    async formData => {
      if (!Number.isFinite(numericEventId)) return

      setActionLoading(true)
      setPaymentError('')

      try {
        const eventPrice = Number(eventData?.price ?? 0)

        const payload = {
          eventId: numericEventId,
          attendees: formData.attendees, // Siempre 1 para invitados
          bookingDate: eventData?.eventDate,
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          document: formData.document,
          phone: formData.phone,
          phoneCode: formData.phoneCode
        }

        setIsReserveModalOpen(false)

        if (eventPrice <= 0) {
          navigate(APP_PATHS.USER.EVENT_CHECKOUT.replace(':eventId', numericEventId), {
            state: {
              guestData: payload,
              guestEmail: formData.email.trim(),
              guestName: `${formData.name} ${formData.lastName}`.trim()
            }
          })

          return
        }

        try {
          const response = await bookingService.registerGuestToEvent(payload)
          const bookingCreated = unwrapResponse(response)

          setGuestBooking(bookingCreated)
          setGuestContactEmail(formData.email.trim())

          if (eventPrice > 0 && bookingCreated?.paymentMetadata?.integration === 'WOMPI') {
            setIsProcessingPayment(true)
            setIsReserveModalOpen(false)
            try {
              await launchWompiCheckout(bookingCreated, {
                customerName: `${formData.name} ${formData.lastName}`.trim(),
                customerEmail: formData.email
              })

              await loadEvent()
            } catch (error) {
              setPaymentError(error?.message || 'No fue posible iniciar el pago con Wompi.')
              handleError(error, {
                customMessage: 'No pudimos iniciar el proceso de pago. Puedes intentarlo nuevamente.',
                showToast: true
              })
            } finally {
              setIsProcessingPayment(false)
            }
          } else if (eventPrice > 0) {
            handleSuccess('Hemos recibido tu reserva. Te enviaremos un correo con todos los detalles.')
          }

          await loadEvent()
        } catch (error) {
          const backendMessage = (error?.response?.data?.message || error?.message || '').toLowerCase()

          if (backendMessage.includes('ya existe una reserva')) {
            handleSuccess('Ya registraste este evento con este correo. Revisa tu bandeja para los detalles.')
            setGuestContactEmail(formData.email.trim())
            setGuestBooking(prev => {
              if (prev) return prev

              return {
                eventTitle: eventData?.title,
                attendees: payload.attendees,
                paymentStatus: 'PENDING'
              }
            })
            await loadEvent()

            return
          }

          handleError(error, {
            customMessage: 'No pudimos completar tu reserva. Por favor intenta de nuevo.',
            showToast: true
          })
        }
      } catch (error) {
        handleError(error, {
          customMessage: 'No pudimos completar tu reserva. Por favor intenta de nuevo.',
          showToast: true
        })
      } finally {
        setActionLoading(false)
      }
    },
    [
      eventData?.eventDate,
      eventData?.price,
      handleError,
      handleSuccess,
      launchWompiCheckout,
      loadEvent,
      navigate,
      numericEventId,
      unwrapResponse
    ]
  )

  const handleRegister = useCallback(async () => {
    if (!Number.isFinite(numericEventId)) return

    setActionLoading(true)
    setPaymentError('')

    try {
      setIsReserveModalOpen(false)
      navigate(APP_PATHS.USER.EVENT_CHECKOUT.replace(':eventId', numericEventId))
    } finally {
      setActionLoading(false)
    }
  }, [navigate, numericEventId])

  const handleOpenReserveModal = useCallback(() => {
    if (actionLoading || isProcessingPayment) return
    if (!canAttemptReservation) return
    if (!isAuthenticated) {
      setIsReserveModalOpen(true)

      return
    }
    handleRegister()
  }, [actionLoading, canAttemptReservation, handleRegister, isAuthenticated, isProcessingPayment])

  const handleReleasePendingReservation = useCallback(async () => {
    if (!Number.isFinite(numericEventId)) return

    setActionLoading(true)

    try {
      const response = await bookingService.releasePendingRegistration(numericEventId)

      unwrapResponse(response)
      handleWarning('Liberamos la reserva pendiente. Puedes intentar nuevamente.')
      await loadRegistrationState()
    } catch (error) {
      handleError(error, {
        customMessage: 'No pudimos liberar la reserva pendiente. Intenta nuevamente.',
        showToast: true
      })
    } finally {
      setActionLoading(false)
    }
  }, [handleError, handleWarning, loadRegistrationState, numericEventId, unwrapResponse])

  const goBackToEvents = useCallback(() => {
    navigate(APP_PATHS.USER.EVENTS)
  }, [navigate])

  const handleGoBack = useCallback(() => {
    navigate(APP_PATHS.USER.EVENTS)
  }, [navigate])

  if (eventLoading && !eventData) {
    return <LoadData>Cargando información del evento...</LoadData>
  }

  if (!eventLoading && eventError && !eventData) {
    return <LoadDataError message={eventError} retryAction={loadEvent} />
  }

  const renderHeaderSection = () => {
    if (eventLoading) {
      return (
        <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6 flex flex-col gap-4'>
            <Skeleton className='h-10 w-2/3 rounded-lg bg-gray-700/60' />
            <Skeleton className='h-48 w-full rounded-xl bg-gray-700/40 sm:h-56 md:h-64' />
          </CardBody>
        </Card>
      )
    }

    if (eventError) {
      return (
        <Card className='w-full bg-amber-500/10 backdrop-blur-sm border-amber-500/30'>
          <CardBody className='p-4 sm:p-6 flex flex-col items-center gap-3 py-8 text-center'>
            <div className='w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center'>
              <AlertTriangle className='w-6 h-6 text-amber-400' />
            </div>
            <h2 className='text-lg font-semibold text-gray-200'>No pudimos mostrar el evento</h2>
            <p className='max-w-lg text-sm text-gray-400'>{eventError}</p>
            <div className='mt-2 flex flex-col gap-2 sm:flex-row'>
              <Button color='primary' size='sm' variant='bordered' onPress={goBackToEvents}>
                Volver a eventos
              </Button>
              <Button size='sm' variant='bordered' onPress={loadEvent}>
                Reintentar
              </Button>
            </div>
          </CardBody>
        </Card>
      )
    }

    if (!eventData) return null

    return (
      <div className='space-y-4 w-full'>
        {/* Galería de imágenes */}
        <ImageGallery images={eventData.images || []} mainImage={eventData.mainImage} title={eventData.title} />

        {/* Información del evento */}
        <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex flex-wrap items-center gap-2 mb-3'>
              {eventData.categoryDisplayName ? (
                <Chip className='bg-primary/15 text-primary-100' size='sm' startContent={<Sparkles size={14} />} variant='flat'>
                  {eventData.categoryDisplayName}
                </Chip>
              ) : null}
              {eventData.statusDisplayName ? (
                <Chip className='bg-secondary/15 text-secondary-100' size='sm' variant='flat'>
                  {eventData.statusDisplayName}
                </Chip>
              ) : null}
            </div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-200'>{eventData.title}</h1>
          </CardBody>
        </Card>
      </div>
    )
  }

  const renderMainContent = () => {
    if (eventLoading) {
      return (
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-24 rounded-xl bg-gray-800/40' />
          <Skeleton className='h-40 rounded-xl bg-gray-800/40' />
          <Skeleton className='h-32 rounded-xl bg-gray-800/40' />
        </div>
      )
    }

    if (!eventData) return null

    return (
      <div className='grid gap-4 lg:grid-cols-[2fr_1fr] lg:gap-4'>
        <div className='flex flex-col gap-4'>
          {/* Card de información básica - Fecha y Hora separados */}
          <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
            <CardBody className='p-4 sm:p-6 grid gap-4 sm:grid-cols-2'>
              {/* Fecha */}
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                  <CalendarDays className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>Fecha</p>
                  <p className='text-sm font-medium text-gray-200'>{formattedEventDate}</p>
                </div>
              </div>

              {/* Hora */}
              {formattedEventTime ? (
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Clock className='w-5 h-5 text-blue-400' />
                  </div>
                  <div>
                    <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>Hora</p>
                    <p className='text-sm font-medium text-gray-200'>{formattedEventTime}</p>
                  </div>
                </div>
              ) : null}

              {/* Ubicación */}
              {eventData.location ? (
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <MapPin className='w-5 h-5 text-blue-400' />
                  </div>
                  <div>
                    <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>Ubicación</p>
                    <p className='text-sm font-medium text-gray-200'>{eventData.location}</p>
                  </div>
                </div>
              ) : null}

              {/* Cupos */}
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Users className='w-5 h-5 text-purple-400' />
                </div>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>Cupos</p>
                  <p className='text-sm font-medium text-gray-200'>{availabilityLabel}</p>
                  {typeof eventData.maxCapacity === 'number' ? (
                    <ul className='list-disc space-y-1 pl-4 mt-1'>
                      <li className='text-xs text-gray-400'>Capacidad máxima: {eventData.maxCapacity} personas</li>
                    </ul>
                  ) : null}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card Premium - Valor de la entrada - Solo móvil */}
          <Card className='w-full bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-purple-900/20 border-primary-500/30 lg:hidden'>
            <CardBody className='p-4 sm:p-6'>
              <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Ticket className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                    </div>
                    <div className='absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                      <Sparkles className='w-2 h-2 sm:w-3 sm:h-3 text-white' />
                    </div>
                  </div>
                  <div className='text-center sm:text-left'>
                    <h3 className='text-sm sm:text-base font-bold text-gray-100 mb-1'>Valor de la Entrada</h3>
                  </div>
                </div>

                <div className='text-center sm:text-left'>
                  <div className='text-2xl font-bold text-primary-400'>{formattedPrice}</div>
                  {eventData.price === 0 ? <div className='text-xs text-gray-400 mt-1'>Evento gratuito</div> : null}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Descripción del evento */}
          {eventData.description ? (
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardHeader className='p-4 sm:p-6 pb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Clock className='w-5 h-5 text-orange-400' />
                  </div>
                  <span className='text-sm font-semibold text-gray-200'>¿Qué puedes esperar?</span>
                </div>
              </CardHeader>
              <Divider className='border-gray-700/50' />
              <CardBody className='p-4 sm:p-6 pt-4'>
                <RichTextViewer className='text-sm text-gray-300' content={eventData.description} />
              </CardBody>
            </Card>
          ) : null}

          {/* Fechas de publicación */}
          {createdAt || updatedAt ? (
            <Card className='bg-gray-800/30 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-4 flex items-center flex-row justify-center gap-4 text-xs text-gray-400'>
                {createdAt ? (
                  <span>
                    Publicado el{' '}
                    <strong className='font-medium text-gray-200'>
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(createdAt)}
                    </strong>
                  </span>
                ) : null}
                {updatedAt ? (
                  <>
                    <Divider className='hidden h-4 border-gray-800/60 sm:block' orientation='vertical' />
                    <span>
                      Actualizado el{' '}
                      <strong className='font-medium text-gray-200'>
                        {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(updatedAt)}
                      </strong>
                    </span>
                  </>
                ) : null}
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* Sidebar - Cards con mejor espaciado */}
        <aside className='flex flex-col gap-4'>
          {/* Card Premium - Valor de la entrada - Solo desktop */}
          <Card className='hidden lg:block w-full bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-purple-900/20 border-primary-500/30'>
            <CardBody className='p-5'>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <div className='w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Ticket className='w-7 h-7 text-white' />
                  </div>
                  <div className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                    <Sparkles className='w-3 h-3 text-white' />
                  </div>
                </div>
                <div className='flex-1'>
                  <h3 className='text-xs font-semibold text-gray-400 mb-1'>Valor de la Entrada</h3>
                  <div className='text-2xl font-bold text-primary-400'>{formattedPrice}</div>
                  {eventData.price === 0 ? <div className='text-xs text-gray-400 mt-0.5'>Evento gratuito</div> : null}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Loading de inscripción */}
          {registrationLoading ? (
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-5 sm:p-6 flex items-center justify-center'>
                <Spinner color='primary' label='Verificando tu inscripción...' size='sm' />
              </CardBody>
            </Card>
          ) : null}

          {/* Card de reserva AZUL - Solo cuando NO está registrado */}
          {!isRegistered && !registrationLoading ? (
            <Card className='bg-blue-500/15 backdrop-blur-sm border-blue-500/30'>
              <CardHeader className='p-5 sm:p-6 pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-11 h-11 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <ShieldCheck className='w-6 h-6 text-blue-400' />
                  </div>
                  <span className='text-sm font-semibold text-gray-200'>Asegura tu lugar</span>
                </div>
              </CardHeader>
              <Divider className='border-blue-500/20' />
              <CardBody className='p-5 sm:p-6 space-y-4'>
                {/* Información persuasiva */}
                <div className='space-y-2.5 text-sm'>
                  {/* Urgencia de cupos */}
                  {eventData.availableSpots > 0 && eventData.maxCapacity && (
                    <div className='flex items-start gap-2.5 text-gray-200'>
                      <span className='text-base'>⚡</span>
                      <span>
                        Solo quedan{' '}
                        <strong className='text-primary-400'>
                          {eventData.availableSpots} de {eventData.maxCapacity}
                        </strong>{' '}
                        cupos disponibles
                      </span>
                    </div>
                  )}

                  {/* Beneficios del proceso */}
                  <div className='flex items-start gap-2.5 text-gray-300'>
                    <span className='text-base'>✨</span>
                    <span>Confirma ahora</span>
                  </div>
                </div>

                <Tooltip
                  color='default'
                  content={
                    canAttemptReservation
                      ? 'Completa el proceso en menos de 2 minutos'
                      : hasConfirmedRegistration
                        ? 'Ya tienes una reserva confirmada para este evento.'
                        : 'Este evento no admite más reservas en este momento.'
                  }>
                  <div>
                    <Button
                      className='w-full'
                      color='primary'
                      isDisabled={!canAttemptReservation || actionLoading || isProcessingPayment}
                      isLoading={actionLoading || isProcessingPayment}
                      size='lg'
                      variant='shadow'
                      onPress={handleOpenReserveModal}>
                      {eventData.price > 0 ? 'Reservar y pagar' : 'Reservar ahora'}
                    </Button>
                  </div>
                </Tooltip>

                <p
                  className={`text-xs text-center ${
                    registrationNote.tone === 'danger'
                      ? 'text-red-300'
                      : registrationNote.tone === 'warning'
                        ? 'text-amber-300'
                        : registrationNote.tone === 'success'
                          ? 'text-green-300'
                          : 'text-gray-400'
                  }`}>
                  {registrationNote.text}
                </p>
                {isProcessingPayment ? (
                  <p className='text-xs text-primary-100 animate-pulse text-center'>Redirigiéndote a la pasarela de pago…</p>
                ) : null}
                {paymentError ? <p className='text-xs text-red-300 text-center'>{paymentError}</p> : null}
              </CardBody>
            </Card>
          ) : null}

          {/* Card de confirmación NARANJA - Solo cuando SÍ está registrado */}
          {isRegistered && registrationView && !registrationLoading ? (
            <Card className={registrationCardConfig?.cardClass ?? 'bg-orange-500/15 backdrop-blur-sm border-orange-400/30'}>
              <CardHeader className='p-5 sm:p-6 pb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${registrationCardConfig?.headerIconBg ?? 'bg-orange-500/20'}`}>
                    {(registrationCardConfig?.icon || Check) &&
                      (() => {
                        const IconComponent = registrationCardConfig?.icon || Check

                        return <IconComponent className={`w-6 h-6 ${registrationCardConfig?.headerIconColor ?? 'text-orange-400'}`} />
                      })()}
                  </div>
                  <span className='text-sm font-semibold text-gray-200'>
                    {registrationCardConfig?.title || 'Tu reserva fue registrada'}
                  </span>
                </div>
              </CardHeader>
              <Divider className='border-white/10' />
              <CardBody className='p-5 sm:p-6 space-y-3 text-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-gray-200/80'>Estado</span>
                  <Chip
                    className={registrationCardConfig?.chipClass ?? 'border border-orange-300/40 bg-orange-400/20 text-xs text-orange-100'}
                    startContent={(() => {
                      const IconComponent = registrationCardConfig?.icon || Check

                      return <IconComponent size={14} />
                    })()}
                    variant='flat'>
                    {registrationView.paymentStatusDisplayName || registrationView.paymentStatus || 'Registrado'}
                  </Chip>
                </div>
                {registrationDate ? (
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-gray-200/70'>Te registraste</span>
                    <span className='text-right text-gray-100'>
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(registrationDate)}
                    </span>
                  </div>
                ) : null}
                {paymentDate ? (
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-gray-200/70'>Pago confirmado</span>
                    <span className='text-right text-gray-100'>
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(paymentDate)}
                    </span>
                  </div>
                ) : null}

                {isRegistrationFailed ? (
                  <Button
                    className='w-full mt-2'
                    color='primary'
                    isDisabled={actionLoading || isProcessingPayment}
                    isLoading={actionLoading || isProcessingPayment}
                    variant='flat'
                    onPress={handleOpenReserveModal}>
                    Intentar el pago nuevamente
                  </Button>
                ) : null}
                {isRegistrationPending ? (
                  <Button
                    className='w-full mt-2'
                    color='warning'
                    isDisabled={actionLoading || isProcessingPayment}
                    isLoading={actionLoading}
                    variant='bordered'
                    onPress={handleReleasePendingReservation}>
                    Liberar reserva pendiente
                  </Button>
                ) : null}
              </CardBody>
              {!isRegistrationFailed && !isRegistrationPending && (
                <CardFooter className='p-5 sm:p-6 pt-3 flex-col items-start gap-2 text-xs text-gray-200/80'>
                  <div className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-green-400 mt-0.5 flex-shrink-0' />
                    <span>{registrationCardConfig?.footnote || 'Te enviaremos recordatorios y detalles importantes por correo.'}</span>
                  </div>
                  {eventData.price > 0 && (
                    <div className='flex items-start gap-2'>
                      <ShieldCheck className='w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0' />
                      <span>Tu pago está protegido. Para ajustes o reembolsos, contáctanos.</span>
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>
          ) : null}

          {!isAuthenticated && guestBooking ? (
            <Card className='bg-green-500/15 backdrop-blur-sm border-green-500/30'>
              <CardHeader className='p-5 sm:p-6 pb-3 flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-11 h-11 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Check className='w-6 h-6 text-green-400' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-gray-200'>¡Gracias por reservar!</p>
                    <p className='text-xs text-gray-400'>Te enviaremos un correo con los detalles del evento.</p>
                  </div>
                </div>
              </CardHeader>
              <Divider className='border-green-500/30' />
              <CardBody className='p-5 sm:p-6 space-y-3 text-sm text-gray-300'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-gray-200/80'>Evento</span>
                  <span className='text-right text-gray-100 font-medium'>{guestBooking.eventTitle}</span>
                </div>
                {guestBooking.totalPrice ? (
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-gray-200/80'>Valor</span>
                    <span className='text-right text-gray-100 font-medium'>
                      {Number(guestBooking.totalPrice).toLocaleString('es-CO', {
                        style: 'currency',
                        currency: guestBooking.currency || 'COP',
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>
                ) : null}
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-gray-200/80'>Asistentes</span>
                  <span className='text-right text-gray-100'>{guestBooking.attendees ?? 1}</span>
                </div>
                {guestBooking.paymentStatus ? (
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-gray-200/80'>Estado de pago</span>
                    <Chip className='bg-green-500/20 text-green-200 border-green-500/30' size='sm' variant='flat'>
                      {guestBooking.paymentStatus || 'Registrado'}
                    </Chip>
                  </div>
                ) : null}
                <p className='text-xs text-gray-400'>
                  Guarda este correo como referencia: {guestContactEmail || guestBooking.userEmail || 'revisa tu bandeja'}.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {/* Modal de datos de usuario para invitados */}
          {!isAuthenticated && (
            <UserDataModal
              eventPrice={eventData?.price || 0}
              isLoading={actionLoading || isProcessingPayment}
              isOpen={isReserveModalOpen}
              onClose={() => setIsReserveModalOpen(false)}
              onSubmit={handleGuestSubmit}
            />
          )}

          {/* Modal de confirmación para usuarios autenticados */}
          {isAuthenticated && (
            <Modal
              isDismissable={!actionLoading && !isProcessingPayment}
              isKeyboardDismissDisabled={actionLoading || isProcessingPayment}
              isOpen={isReserveModalOpen}
              onOpenChange={setIsReserveModalOpen}>
              <ModalContent>
                {onClose => (
                  <>
                    <ModalHeader className='flex flex-col gap-1 text-left'>Confirmar reserva</ModalHeader>
                    <ModalBody className='space-y-4 text-sm text-gray-300'>
                      <p>Estás a punto de reservar tu lugar en este evento.</p>
                      <p>
                        Ten en cuenta que las reservas no tienen reembolso automático. Si necesitas cancelar y solicitar un reembolso,
                        deberás comunicarte con el equipo de Feeling.
                      </p>
                      {eventData?.price > 0 ? (
                        <div className='bg-primary-500/10 border border-primary-500/40 rounded-lg p-3 text-xs text-primary-100'>
                          <p className='font-semibold text-sm'>Este evento requiere pago seguro en línea.</p>
                          <p>Serás redirigido a la pasarela de pagos de Wompi para completar la transacción.</p>
                        </div>
                      ) : null}
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        variant='flat'
                        onPress={() => {
                          if (!actionLoading && !isProcessingPayment) {
                            setIsReserveModalOpen(false)
                            onClose()
                          }
                        }}>
                        Cancelar
                      </Button>
                      <Button color='primary' isLoading={actionLoading || isProcessingPayment} onPress={handleRegister}>
                        Confirmar reserva
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          )}
        </aside>
      </div>
    )
  }

  // Breadcrumbs para navegación y SEO
  const breadcrumbItems = [
    { label: 'Inicio', href: APP_PATHS.ROOT, showHomeIcon: true },
    { label: 'Eventos', href: APP_PATHS.USER.EVENTS },
    { label: eventData?.title || 'Cargando...', href: null }
  ]

  return (
    <>
      {/* SEO Optimizado para el evento */}
      <EventSEO event={eventData} />

      <LiteContainer ariaLabel='Detalle del evento' className='gap-4 !pt-0'>
        <div className='flex align-items-center justify-between w-full'>
          <Button
            className='text-gray-400 hover:text-gray-200 backdrop-blur-sm'
            size='sm'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='light'
            onPress={handleGoBack}>
            Volver
          </Button>

          {/* Breadcrumbs para navegación */}
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {renderHeaderSection()}

        {renderMainContent()}
      </LiteContainer>
    </>
  )
}

export default EventDetail
