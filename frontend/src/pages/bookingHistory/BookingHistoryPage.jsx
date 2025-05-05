import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Tabs, Tab, Chip, Spinner } from '@heroui/react'
import { useAuth } from '@context/AuthContext.jsx'
import { getUserBookings } from '@services/bookingService.js'
import { Helmet } from 'react-helmet-async'
import { normalizeDate } from '@utils/dateUtils.js'

import BookingCard from './components/BookingCard.jsx'

const BookingHistoryPage = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getUserBookings()

      if (response.error) {
        throw new Error(response.message || 'Error al cargar las reservas')
      }

      console.log('Reservas obtenidas:', response)
      setBookings(response.data || [])
    } catch (err) {
      console.error('Error cargando reservas:', err)
      setError(err.message || 'Error al cargar tus reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  // Función para manejar la cancelación de reservas
  const handleBookingCancelled = bookingId => {
    // Actualizar el estado local eliminando la reserva cancelada
    setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId))
  }

  // Separar las reservas en próximas y pasadas
  const currentDate = normalizeDate(new Date()) // Normalizar la fecha actual

  const upcomingBookings = bookings.filter(booking => {
    const tourDate = normalizeDate(new Date(booking.startDate))
    return tourDate >= currentDate
  })

  const pastBookings = bookings.filter(booking => {
    const tourDate = normalizeDate(new Date(booking.startDate))
    return tourDate < currentDate
  })

  // Ordenar reservas por fecha (más recientes primero para próximas, y más recientes primero para pasadas)
  upcomingBookings.sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateA - dateB // Orden ascendente para próximas (las más cercanas primero)
  })

  pastBookings.sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB - dateA // Orden descendente para pasadas (las más recientes primero)
  })

  // Determinar qué lista de reservas mostrar según la pestaña activa
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen mb-10">
      <Helmet>
        <title>Historial de Reservas | Glocal Tours</title>
        <meta name="description" content="Revisa el historial de tus reservas y viajes" />
      </Helmet>

      <Card className="w-full mb-8">
        <CardHeader className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mis Reservas</h1>
          <p className="text-gray-600">Visualiza tus aventuras; pasadas y futuras.</p>
        </CardHeader>
      </Card>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        color="primary"
        variant="underlined"
        className="mb-6"
        classNames={{
          tabList: 'gap-6',
          cursor: 'bg-primary'
        }}>
        <Tab
          key="upcoming"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">travel_explore</span>
              <span>Próximas Aventuras</span>
              {upcomingBookings.length > 0 && (
                <Chip color="primary" size="sm" variant="flat">
                  {upcomingBookings.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="past"
          title={
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">history</span>
              <span>Historial de Viajes</span>
              {pastBookings.length > 0 && (
                <Chip color="secondary" size="sm" variant="flat">
                  {pastBookings.length}
                </Chip>
              )}
            </div>
          }
        />
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="primary" size="lg" />
          <span className="ml-2 text-gray-600">Cargando tus reservas...</span>
        </div>
      ) : error ? (
        <Card className="w-full bg-red-50 mb-6">
          <CardBody className="flex items-center gap-2 text-red-600">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </CardBody>
          <CardFooter>
            <Button color="primary" variant="light" onPress={fetchBookings}>
              Intentar nuevamente
            </Button>
          </CardFooter>
        </Card>
      ) : displayBookings.length === 0 ? (
        <Card className="w-full bg-gray-50 mb-6">
          <CardBody className="flex flex-col items-center py-16 text-center">
            <div className="text-5xl text-gray-300 mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>
                {activeTab === 'upcoming' ? 'luggage' : 'travel_explore'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === 'upcoming' ? 'No tienes reservas próximas' : 'No tienes historial de viajes'}
            </h2>
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming'
                ? '¡Es el momento perfecto para planificar tu próxima aventura!'
                : '¡Anímate a vivir una experiencia inolvidable con nosotros!'}
            </p>
            <Button color="primary" size="lg" onPress={() => (window.location.href = '/')}>
              Descubrir Tours
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} isPast={activeTab === 'past'} onBookingCancelled={handleBookingCancelled} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingHistoryPage
