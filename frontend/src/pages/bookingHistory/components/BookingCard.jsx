import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner
} from '@heroui/react'
import { Link } from 'react-router-dom'
import { cancelBooking } from '@services/bookingService.js'
import { getAvailabilityForBooking } from '@services/availabilityService.js'
import { getTourById } from '@services/tourService.js'

const BookingCard = ({ booking, isPast, onBookingCancelled }) => {
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [tourData, setTourData] = useState(null)
  const [loadingTour, setLoadingTour] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Cargar los datos completos del tour
  useEffect(() => {
    const fetchTourData = async () => {
      if (!booking.tourId) return

      setLoadingTour(true)
      try {
        const response = await getTourById(booking.tourId)
        if (!response.error && response.data) {
          setTourData(response.data)
          console.log('Tour data obtenido:', response.data)
        }
      } catch (error) {
        console.error('Error obteniendo datos del tour:', error)
      } finally {
        setLoadingTour(false)
      }
    }

    fetchTourData()
  }, [booking.tourId])

  // Cargar la disponibilidad del tour para obtener las fechas correctas
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!booking.tourId || !booking.startDate) return

      setLoadingAvailability(true)
      try {
        const availabilityData = await getAvailabilityForBooking(booking.tourId, booking.startDate)
        setAvailability(availabilityData)
        console.log('Disponibilidad obtenida:', availabilityData)
      } catch (error) {
        console.error('Error obteniendo disponibilidad:', error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [booking.tourId, booking.startDate])

  // Datos de la reserva
  const tourId = booking.tourId
  const tourName = booking.tourName

  // Usar departureTime si está disponible, sino usar startDate como fallback
  const departureDate = availability?.departureTime ? new Date(availability.departureTime) : new Date(booking.startDate)

  const returnDate = availability?.returnTime ? new Date(availability.returnTime) : new Date(booking.endDate)

  const formattedDepartureDate = departureDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const formattedDepartureTime = departureDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  // Calcular duración del tour en días
  const durationDays = Math.ceil((returnDate - departureDate) / (1000 * 60 * 60 * 24))

  // Datos de participantes
  const adults = booking.adults || 1
  const children = booking.children || 0
  const totalPeople = adults + children

  // Datos de precio total
  const totalPrice = booking.price || 0

  // Primera imagen del tour (usar de tourData si está disponible, placeholder si no)
  const tourImage =
    tourData && tourData.images && tourData.images.length > 0 ? tourData.images[0] : 'https://via.placeholder.com/300x200?text=Tour'

  // Status de la reserva (por ahora asumimos que todas están confirmadas)
  const status = 'CONFIRMED'
  const statusMap = {
    CONFIRMED: { label: 'Confirmada', color: 'success', icon: 'check_circle' },
    PENDING: { label: 'Pendiente', color: 'warning', icon: 'pending' },
    CANCELLED: { label: 'Cancelada', color: 'danger', icon: 'cancel' },
    COMPLETED: { label: 'Completada', color: 'secondary', icon: 'verified' }
  }

  const statusInfo = statusMap[status] || statusMap['CONFIRMED']

  // Manejar la cancelación de reserva
  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true)
      setCancelError(null)

      const response = await cancelBooking(booking.id)

      if (response.error) {
        throw new Error(response.message || 'Error al cancelar la reserva')
      }

      // Cerrar modal
      onClose()

      // Notificar al componente padre que la reserva ha sido cancelada
      if (onBookingCancelled) {
        onBookingCancelled(booking.id)
      }
    } catch (err) {
      console.error('Error cancelando reserva:', err)
      setCancelError(err.message || 'Error al cancelar la reserva')
    } finally {
      setCancelLoading(false)
    }
  }

  // Calcular si se puede cancelar (48 horas antes)
  const now = new Date()
  const cancellationDeadline = new Date(departureDate)
  cancellationDeadline.setHours(cancellationDeadline.getHours() - 48)
  const canCancel = !isPast && status !== 'CANCELLED' && now < cancellationDeadline

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-col items-start p-0 overflow-hidden">
          <Link to={`/tour/${tourId}`} className="relative w-full h-56 cursor-pointer block">
            {loadingTour ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <img
                src={tourImage}
                alt={tourName}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-xl line-clamp-2 mb-1">{tourName}</h3>
              {tourData?.destination?.country && (
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {tourData.destination.city?.name && `${tourData.destination.city.name}, `}
                  {tourData.destination.country}
                </p>
              )}
            </div>
            <span className="absolute top-3 right-3 shadow-md material-symbols-outlined text-md text-green-600 bg-gray-50 opacity-90 rounded-full p-0 w-4 h-4 flex items-center justify-center">
              {statusInfo.icon}
            </span>
            {isPast && status !== 'CANCELLED' && (
              <Chip className="absolute top-3 left-3 shadow-md" color="secondary" variant="flat">
                Completado
              </Chip>
            )}
          </Link>
        </CardHeader>
        <CardBody className="py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fecha de salida</div>
                <div className="font-medium">
                  {loadingAvailability ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="text-gray-400">Cargando fecha...</span>
                    </span>
                  ) : (
                    formattedDepartureDate
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hora y duración</div>
                <div className="font-medium">
                  {loadingAvailability ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="text-gray-400">Cargando hora...</span>
                    </span>
                  ) : (
                    <>
                      {formattedDepartureTime} · {durationDays} {durationDays === 1 ? 'día' : 'días'}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div>
                <div className="text-xs text-gray-500">Viajeros</div>
                <div className="font-medium">
                  {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
                  <span className="text-gray-500 text-sm ml-1">
                    ({adults} {adults === 1 ? 'adulto' : 'adultos'}
                    {children > 0 ? `, ${children} ${children === 1 ? 'niño' : 'niños'}` : ''})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          <div className="flex justify-between items-center">
            <div className="text-gray-800 font-medium">Total pagado:</div>
            <div className="text-primary font-bold text-xl">${totalPrice.toFixed(2)}</div>
          </div>
        </CardBody>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex justify-between w-full gap-2">
            <Button
              as={Link}
              to={`/tour/${tourId}`}
              color="primary"
              variant="solid"
              fullWidth
              startContent={<span className="material-symbols-outlined">travel_explore</span>}
              className="bg-primary hover:bg-primary-600 transition-colors">
              Ver Tour
            </Button>

            {canCancel ? (
              <Tooltip content="Puedes cancelar hasta 48 horas antes de la salida">
                <Button
                  color="default"
                  variant="light"
                  fullWidth
                  onPress={onOpen}
                  startContent={<span className="material-symbols-outlined">close</span>}
                  className="text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors">
                  Cancelar
                </Button>
              </Tooltip>
            ) : !isPast && status !== 'CANCELLED' ? (
              <Tooltip content="No se puede cancelar 48 horas antes de la salida">
                <Button
                  color="default"
                  variant="light"
                  fullWidth
                  isDisabled
                  startContent={<span className="material-symbols-outlined">close</span>}
                  className="text-gray-400 border border-gray-200">
                  Cancelar
                </Button>
              </Tooltip>
            ) : null}
          </div>

          {status === 'CANCELLED' && (
            <div className="bg-red-50 p-2 rounded-md text-sm text-red-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">info</span>
              Esta reserva ha sido cancelada
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Modal de confirmación para cancelación */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Cancelar Reserva</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas cancelar tu reserva para <strong>{tourName}</strong>?
            </p>
            <p className="mt-2 text-sm">
              Fecha de salida: <span className="font-medium">{formattedDepartureDate}</span>
            </p>
            {cancelError && <div className="mt-2 bg-red-50 p-3 rounded-md text-red-600 text-sm">{cancelError}</div>}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleCancelBooking} isLoading={cancelLoading}>
              Confirmar Cancelación
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BookingCard
