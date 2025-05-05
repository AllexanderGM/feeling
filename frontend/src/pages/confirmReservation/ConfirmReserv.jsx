import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardFooter, Button, Input, DatePicker, Tooltip, Divider } from '@heroui/react'
// import { getLocalTimeZone } from '@internationalized/date'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
// import { useDateFormatter } from '@react-aria/i18n'
import { useAuth } from '@context/AuthContext.jsx'
import { Info, Clock, Users, Calendar, CheckCircle, AlertCircle, MapPin } from 'lucide-react'
import { createBooking, formatDateForBooking } from '@services/bookingService.js'
import { getAuthToken } from '@services/authService.js'

// Importamos nuestro componente de la ruta correcta
import ConfirmationDetails from './components/ConfirmationDetails.jsx'

function ConfirmReserv() {
  const location = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tour, availability } = location.state || {}

  // Scroll al inicio cuando el componente se monta
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [loading, setLoading] = useState(!tour && !!id)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [currentAvailability, setCurrentAvailability] = useState(availability)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Estado para almacenar datos de tour si se obtienen por separado
  const [tourData, setTourData] = useState(null)

  // Usar los datos de tour ya sea del estado o los datos obtenidos
  const tourInfo = tour || tourData

  // Validación de autenticación
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: `/tour/${id}/confirm`,
          message: 'Debes iniciar sesión para completar tu reserva'
        }
      })
    }
  }, [user, navigate, id])

  // Fetch tour data si no tenemos datos de tour en el estado
  useEffect(() => {
    const fetchTourData = async () => {
      if (!tour && id) {
        try {
          setLoading(true)
          setError(null)

          const URL = import.meta.env.VITE_URL_BACK
          const response = await fetch(`${URL}/tours/${id}`)

          if (!response.ok) {
            throw new Error(`Error fetching tour: ${response.status}`)
          }

          const tourData = await response.json()
          setTourData(tourData)
        } catch (error) {
          console.error('Error loading tour data:', error)
          setError(error.message || 'Failed to load tour data')
        } finally {
          setLoading(false)
        }
      }
    }

    if (!tour && id) {
      fetchTourData()
    }
  }, [id, tour])

  // Si no tenemos datos de availability y tenemos una fecha de salida, necesitamos obtener la disponibilidad
  useEffect(() => {
    const fetchAvailability = async () => {
      // Solo ejecutamos si tenemos la información del tour y datos de fecha de salida, pero no disponibilidad actual
      if (tourInfo?.id && (availability?.availableDate || availability?.departureTime) && !currentAvailability) {
        try {
          setIsCheckingAvailability(true)
          const URL = import.meta.env.VITE_URL_BACK
          const token = getAuthToken()

          console.log('Buscando disponibilidad para tour:', tourInfo.id)
          console.log('Token de autenticación:', token ? `Token encontrado: ${token.substring(0, 20)}...` : 'Sin token')

          const response = await fetch(`${URL}/api/availabilities/tour/${tourInfo.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : ''
            }
          })

          console.log('Status de respuesta:', response.status, response.statusText)

          if (!response.ok) {
            throw new Error(`Error fetching availability: ${response.status}`)
          }

          const availabilityData = await response.json()
          console.log('Disponibilidades encontradas:', availabilityData)

          if (availabilityData && availabilityData.length > 0) {
            // Primero intentamos encontrar por availableDate
            let matchingAvailability = null

            if (availability.availableDate) {
              const targetDate = new Date(availability.availableDate).toISOString().split('T')[0]
              matchingAvailability = availabilityData.find(a => {
                if (!a.availableDate) return false
                const availDate = new Date(a.availableDate).toISOString().split('T')[0]
                return availDate === targetDate
              })
            }

            // Si no encontramos por availableDate, intentamos por departureTime como fallback
            if (!matchingAvailability && availability.departureTime) {
              const targetDeparture = new Date(availability.departureTime).toISOString().split('T')[0]
              matchingAvailability = availabilityData.find(a => {
                if (!a.departureTime) return false
                const availDeparture = new Date(a.departureTime).toISOString().split('T')[0]
                return availDeparture === targetDeparture
              })
            }

            // Si aún no encontramos, usamos la primera disponibilidad
            matchingAvailability = matchingAvailability || availabilityData[0]

            // IMPORTANTE: Asegurarse de que availableDate siempre existe
            // Si no tiene availableDate pero tiene departureTime, copiamos el valor
            if (matchingAvailability && !matchingAvailability.availableDate && matchingAvailability.departureTime) {
              console.log('⚠️ La disponibilidad no tiene availableDate. Asignando departureTime como availableDate.')
              matchingAvailability = {
                ...matchingAvailability,
                availableDate: matchingAvailability.departureTime
              }
            }

            console.log('Disponibilidad seleccionada:', matchingAvailability)
            setCurrentAvailability(matchingAvailability)
          } else {
            setError('No hay disponibilidad para la fecha seleccionada')
          }
        } catch (error) {
          console.error('Error loading availability:', error)
          setApiError('Error al verificar disponibilidad. Por favor, intenta más tarde.')
        } finally {
          setIsCheckingAvailability(false)
        }
      }
    }

    fetchAvailability()
  }, [tourInfo, availability, currentAvailability])

  const [selectedAdults, setSelectedAdults] = useState(1)
  const [selectedChildren, setSelectedChildren] = useState(0)

  // Manejador para recibir datos del componente hijo
  const handlePeopleSelectionChange = useCallback(({ adults, children }) => {
    setSelectedAdults(adults || 1)
    setSelectedChildren(children || 0)
  }, [])

  // Dynamic Price Calculation (guard for null)
  const adultPrice = tourInfo?.adultPrice || 0
  const childPrice = tourInfo?.childPrice || 0

  const adultsCount = selectedAdults || 1
  const childrenCount = selectedChildren || 0
  const totalPrice = adultsCount * adultPrice + childrenCount * childPrice

  const totalSelected = adultsCount + childrenCount
  const rawSlots = currentAvailability?.availableSlots || availability?.availableSlots || 0
  const totalSlots = parseInt(rawSlots, 10) || 0
  const availableSlots = totalSlots
  const remainingAfterSelection = Math.max(0, availableSlots - totalSelected)
  const hasEnoughSlots = totalSelected <= totalSlots

  // Función para verificar la disponibilidad actualizada desde el servidor
  // Función actualizada para comprobar disponibilidad
  const checkLatestAvailability = async () => {
    if (!tourInfo?.id) {
      setApiError('Información del tour no disponible')
      return false
    }

    try {
      setIsCheckingAvailability(true)
      const URL = import.meta.env.VITE_URL_BACK
      const token = getAuthToken()

      console.log('Verificando disponibilidad para tour:', tourInfo.id)

      const response = await fetch(`${URL}/api/availabilities/tour/${tourInfo.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        }
      })

      if (!response.ok) {
        throw new Error(`Error verificando disponibilidad: ${response.status}`)
      }

      const availabilitiesData = await response.json()
      console.log('Disponibilidades recibidas:', availabilitiesData)

      if (!availabilitiesData || !Array.isArray(availabilitiesData) || availabilitiesData.length === 0) {
        setApiError('No hay disponibilidad para este tour')
        return false
      }

      // Buscar la availability específica que nos interesa
      let latestData = null

      // Primero intentamos por ID
      if (currentAvailability?.id) {
        latestData = availabilitiesData.find(a => a.id === currentAvailability.id)
      }

      // Si no encontramos por ID, intentamos buscar por availableDate
      if (!latestData && currentAvailability?.availableDate) {
        const targetDate = new Date(currentAvailability.availableDate).toISOString().split('T')[0]
        latestData = availabilitiesData.find(a => {
          if (!a.availableDate) return false
          const availDate = new Date(a.availableDate).toISOString().split('T')[0]
          return availDate === targetDate
        })
        console.log('Búsqueda por availableDate:', targetDate, latestData ? 'encontrado' : 'no encontrado')
      }

      // Solo como último recurso intentamos por departureTime
      if (!latestData && currentAvailability?.departureTime) {
        const targetDate = new Date(currentAvailability.departureTime).toISOString().split('T')[0]
        latestData = availabilitiesData.find(a => {
          if (!a.departureTime) return false
          const availDate = new Date(a.departureTime).toISOString().split('T')[0]
          return availDate === targetDate
        })
        console.log('Búsqueda por departureTime:', targetDate, latestData ? 'encontrado' : 'no encontrado')
      }

      if (!latestData) {
        console.error('No se encontró la disponibilidad para la fecha seleccionada')
        setApiError('No se encontró disponibilidad para la fecha seleccionada')
        return false
      }

      // IMPORTANTE: Asegurarse de que availableDate siempre existe
      // Si no tiene availableDate pero tiene departureTime, copiamos el valor
      if (!latestData.availableDate && latestData.departureTime) {
        console.log('⚠️ La disponibilidad no tiene availableDate. Asignando departureTime como availableDate.')
        latestData = {
          ...latestData,
          availableDate: latestData.departureTime
        }
      }

      // Actualizar el estado con los datos más recientes
      setCurrentAvailability(latestData)

      // Convertir explícitamente a número y verificar disponibilidad
      const availableSlots = parseInt(latestData?.availableSlots, 10) || 0
      console.log('Cupos disponibles:', availableSlots, 'Personas seleccionadas:', totalSelected)

      // Retornar true si hay suficientes cupos, false si no
      return availableSlots >= totalSelected
    } catch (error) {
      console.error('Error al verificar disponibilidad actualizada:', error)
      setApiError(`Error al verificar disponibilidad: ${error.message}`)
      return false
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleConfirmReservation = async () => {
    setApiError(null)

    // Validación de cupos disponibles
    if (!hasEnoughSlots) {
      setApiError(`Lo sentimos, no hay suficientes cupos disponibles. Solo hay ${availableSlots} cupos para este tour.`)
      return
    }

    setIsSubmitting(true)

    try {
      // Verificar disponibilidad primero
      const isAvailable = await checkLatestAvailability()

      if (!isAvailable) {
        setApiError(`La disponibilidad ha cambiado. Por favor, verifica los cupos disponibles e intenta nuevamente.`)
        setIsSubmitting(false)
        return
      }

      // * IMPORTANT::: Obtenemos la disponibilidad exacta desde la API para usar el valor original de availableDate

      console.log('Obteniendo disponibilidad exacta desde la API para usar availableDate original')
      const URL = import.meta.env.VITE_URL_BACK
      const token = getAuthToken()

      const response = await fetch(`${URL}/api/availabilities/tour/${tourInfo.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        }
      })

      if (!response.ok) {
        throw new Error(`Error obteniendo disponibilidades: ${response.status}`)
      }

      const availabilitiesData = await response.json()
      console.log('Disponibilidades obtenidas directamente de la API:', availabilitiesData)

      // Buscamos la disponibilidad que coincide con nuestro ID actual
      const exactAvailability = availabilitiesData.find(a => a.id === currentAvailability.id)

      // Obtenemos una copia local de la disponibilidad para trabajar con ella
      let startDateSource = null

      if (exactAvailability && exactAvailability.availableDate) {
        // IMPORTANTE: Usamos el valor exacto de availableDate tal como viene de la API
        // sin convertirlo a objeto Date para evitar cualquier modificación/formato
        startDateSource = exactAvailability.availableDate
        console.log('✅ Usando availableDate exacto de la API:', startDateSource)
      } else {
        // Si no encontramos la disponibilidad exacta, usamos el fallback anterior
        console.log('⚠️ No se encontró disponibilidad exacta, usando valores actuales')

        let availabilityForBooking = { ...currentAvailability }

        // Diagnóstico de disponibilidad
        console.log('Disponibilidad fallback:', {
          id: availabilityForBooking?.id,
          availableDate: availabilityForBooking?.availableDate,
          departureTime: availabilityForBooking?.departureTime
        })

        // Asegurar que availableDate existe
        if (!availabilityForBooking.availableDate && availabilityForBooking.departureTime) {
          console.log('⚠️ Forzando copia de departureTime a availableDate para la reserva')
          availabilityForBooking.availableDate = availabilityForBooking.departureTime
        }

        startDateSource = availabilityForBooking.availableDate
      }

      if (!startDateSource) {
        console.error('⚠️ ERROR CRÍTICO: No se pudo obtener una fecha válida para la reserva')
        throw new Error('No se encontró una fecha válida para la reserva')
      }

      console.log('Usando fecha para la reserva:', startDateSource)

      // Formatear la fecha en el formato exacto que el backend espera
      const formattedDate = formatDateForBooking(startDateSource)

      if (!formattedDate) {
        throw new Error('No se pudo formatear la fecha correctamente')
      }

      console.log('Fecha formateada para la reserva:', formattedDate)

      // Crear objeto de datos para la reserva
      const bookingData = {
        tourId: tourInfo?.id,
        startDate: formattedDate,
        adults: parseInt(adultsCount, 10) || 1,
        children: parseInt(childrenCount, 10) || 0
      }

      console.log('Datos de reserva:', bookingData)

      const bookingResponse = await createBooking(bookingData)

      if (bookingResponse.success) {
        console.log('✅ Reserva creada exitosamente:', bookingResponse.data)
        navigate('/', {
          state: {
            success: true,
            message: {
              prefix: '¡Genial! Tu próxima aventura:  ',
              highlight: tourInfo.name,
              suffix: ', ha sido confirmada'
            }
          }
        })
      } else {
        setApiError(`Error: ${bookingResponse.message || 'Error desconocido al procesar la reserva'}`)
        console.error('Reserva fallida:', bookingResponse)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error en el proceso de reserva:', error)
      setApiError(`Error: ${error.message || 'Error desconocido al procesar la reserva'}`)
      setIsSubmitting(false)
    }
  }

  // Efectos para inicializar con el usuario logueado
  useEffect(() => {
    if (user) {
      // Notificar el componente padre de las selecciones iniciales
      // Asegurarse de que los valores sean numéricos
      handlePeopleSelectionChange?.({
        adults: parseInt(selectedAdults, 10) || 1,
        children: parseInt(selectedChildren, 10) || 0
      })
    }
  }, [user, handlePeopleSelectionChange, selectedAdults, selectedChildren])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Cargando información del tour...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-red-500 mb-4">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-2xl text-red-600 mb-4">Error</h1>
        <p className="text-lg mb-4">{error}</p>
        <Button className="mt-2" onPress={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  // Show error if tour info is not available
  if (!tourInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl mb-4">Tour no encontrado</h1>
        <p className="text-lg mb-4">No se pudo encontrar la información del tour.</p>
        <Button className="mt-2" onPress={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Encabezado con información del tour */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <img
            src={tourInfo?.images?.[0] || 'https://via.placeholder.com/80x80'}
            alt={tourInfo?.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-800">{tourInfo?.name || 'Tour'}</h1>
            <p className="text-sm text-gray-600">
              {tourInfo?.destination?.city?.name && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {tourInfo.destination.city.name}, {tourInfo.destination.country}
                </span>
              )}
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Columna 1-2: Detalles del usuario y fechas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del usuario */}
          <ConfirmationDetails tourInfo={tourInfo} onSelectionChange={handlePeopleSelectionChange} />

          {/* Imagen grande del tour */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-xl font-semibold text-gray-800">Detalles del tour</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Imagen destacada */}
                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                  <img
                    src={tourInfo?.images?.[0] || 'https://via.placeholder.com/800x400?text=Imagen+del+tour'}
                    alt={tourInfo?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-lg font-medium">{tourInfo?.name}</h3>
                    {tourInfo?.destination?.city?.name && (
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <MapPin size={14} />
                        {tourInfo.destination.city.name}, {tourInfo.destination.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fechas de salida y regreso del tour */}
                {availability && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Fecha y hora de salida
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {new Date(availability.departureTime).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-sm text-primary font-medium flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(availability.departureTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Fecha y hora de regreso
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {new Date(availability.returnTime).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-sm text-primary font-medium flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(availability.returnTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Columna 3: Resumen y confirmación */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Resumen de reserva</h2>
            </CardHeader>
            <CardBody className="pb-2">
              <div className="space-y-4">
                {/* Resumen de personas */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-600" />
                    <span>
                      {adultsCount} {adultsCount === 1 ? 'adulto' : 'adultos'}
                    </span>
                  </div>
                  <span className="font-medium">${(adultsCount * adultPrice).toFixed(2)}</span>
                </div>
                {childrenCount > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-600" />
                      <span>
                        {childrenCount} {childrenCount === 1 ? 'niño' : 'niños'}
                      </span>
                    </div>
                    <span className="font-medium">${(childrenCount * childPrice).toFixed(2)}</span>
                  </div>
                )}

                {/* Cupos disponibles */}
                <div className="mt-2 text-sm text-gray-600 flex flex-col justify-center gap-1">
                  <span className="font-medium">
                    <Users size={14} className="text-primary inline-block" /> Cupos disponibles: {availableSlots}
                  </span>
                  {isCheckingAvailability ? (
                    <span className="text-gray-500 text-xs ml-1">Verificando...</span>
                  ) : (
                    <span>
                      <span className="text-xs text-gray-500 ml-1">
                        {totalSelected > 0 && `(${remainingAfterSelection} cupos después de tu reserva)`}
                      </span>
                    </span>
                  )}
                  {/* {!isCheckingAvailability && (
                    <button onClick={checkLatestAvailability} className="ml-2 text-xs text-primary hover:underline">
                      Actualizar
                    </button>
                  )} */}
                </div>

                {/* Mensaje de advertencia cuando quedan pocos cupos (≤ 3) */}
                {availableSlots <= 3 && availableSlots > 0 && hasEnoughSlots && (
                  <div className="bg-amber-50 p-3 rounded-lg text-amber-700 text-sm">
                    <p className="flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>¡Quedan pocos cupos! Solo hay {availableSlots} cupos disponibles para este tour.</span>
                    </p>
                  </div>
                )}

                {/* Mensaje de error cuando no hay suficientes cupos */}
                {!hasEnoughSlots && (
                  <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm">
                    <p className="flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>
                        Lo sentimos, has seleccionado {totalSelected} personas pero solo hay {totalSlots} cupos disponibles.
                      </span>
                    </p>
                  </div>
                )}

                {/* Información del viaje */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">
                      {availability
                        ? `${Math.ceil(
                            (new Date(availability.returnTime) - new Date(availability.departureTime)) / (1000 * 60 * 60 * 24)
                          )} días`
                        : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs text-gray-600">Fechas y horas pueden cambiar en casos especiales</span>
                  </div>
                </div>
                <Divider />
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <div className="w-full space-y-3">
                {apiError && (
                  <div className="bg-red-50 p-3 rounded-lg mb-4">
                    <p className="text-red-700 text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{apiError}</span>
                    </p>
                  </div>
                )}

                {/* Botón de confirmación */}
                <Button
                  className="w-full"
                  size="lg"
                  color="primary"
                  isLoading={isSubmitting}
                  onPress={handleConfirmReservation}
                  disabled={isSubmitting || !hasEnoughSlots}>
                  Confirmar Reserva
                </Button>

                <p className="text-xs text-center text-gray-600">Al confirmar aceptas los términos y condiciones del tour</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Información adicional */}
      <Card className="w-full">
        <CardHeader className="pb-2 flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Información importante</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600">Check-in desde 2:00 PM</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600">Check-out hasta 12:00 PM</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5" />
              <p className="text-sm text-gray-600">No se permite fumar</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5" />
              <p className="text-sm text-gray-600">No se admiten mascotas</p>
            </div>
          </div>
          <div className="mt-4 bg-amber-50 p-3 rounded-lg">
            <p className="text-amber-700 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>La cancelación dentro de las 48 horas previas a la fecha del tour puede generar cargos adicionales.</span>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ConfirmReserv
