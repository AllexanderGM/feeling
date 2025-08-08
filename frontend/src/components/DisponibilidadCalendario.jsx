import { useState, useEffect } from 'react'
import { Calendar, Card, CardBody, Button } from '@heroui/react'
import { Clock, Users } from 'lucide-react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { useNavigate } from 'react-router-dom'
import { formatDateForDisplay, formatTimeForDisplay, normalizeAvailability } from '@utils/dateUtils.js'
import { useAuth } from '@context/AuthContext.jsx'
import { Logger } from '@utils/logger.js'

const DisponibilidadCalendario = ({ tour, onSelectDate }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [availabilities, setAvailabilities] = useState([])
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [selectedAvailability, setSelectedAvailability] = useState(null)
  const [focusedDate, setFocusedDate] = useState(null)

  useEffect(() => {
    if (tour?.availability) {
      const availabilityArray = normalizeAvailability(tour.availability)

      const processedAvailabilities = availabilityArray
        .map(avail => {
          try {
            // Crear objetos Date directamente desde las fechas ISO completas
            const departureDateTime = avail.departureTime ? new Date(avail.departureTime) : null
            const returnDateTime = avail.returnTime ? new Date(avail.returnTime) : null

            if (!departureDateTime || isNaN(departureDateTime.getTime()) || !returnDateTime || isNaN(returnDateTime.getTime())) {
              Logger.warn('Fechas inválidas en disponibilidad de tour', Logger.CATEGORIES.SYSTEM, { availId: avail.id, tourId: tour?.id })
              return null
            }

            // Crear fechas UTC sin hora para comparaciones de calendario
            const departureDate = new Date(
              Date.UTC(departureDateTime.getFullYear(), departureDateTime.getMonth(), departureDateTime.getDate())
            )

            const returnDate = new Date(Date.UTC(returnDateTime.getFullYear(), returnDateTime.getMonth(), returnDateTime.getDate()))

            return {
              id: avail.id,
              departureDate: departureDate,
              returnDate: returnDate,
              departureTime: departureDateTime,
              returnTime: returnDateTime,
              availableSlots: avail.availableSlots || 0,
              bookUntilDate: avail.availableDate ? new Date(avail.availableDate) : null,
              originalData: avail
            }
          } catch (error) {
            Logger.error('Error procesando fecha de disponibilidad', Logger.CATEGORIES.SYSTEM, { error: error.message, tourId: tour?.id })
            return null
          }
        })
        .filter(Boolean)

      setAvailabilities(processedAvailabilities)

      // Solo establecer el focusedDate inicial si no hay uno ya establecido
      if (!focusedDate && processedAvailabilities.length > 0) {
        const todayDate = new Date()
        const todayDateUtc = new Date(Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()))

        const futureDates = processedAvailabilities
          .filter(avail => avail.departureDate >= todayDateUtc)
          .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime())

        if (futureDates.length > 0) {
          const firstDate = futureDates[0].departureDate

          // Establecer el mes enfocado como el mes de la primera fecha disponible
          const calendarDate = new CalendarDate(
            firstDate.getFullYear(),
            firstDate.getMonth() + 1, // Los meses en CalendarDate son 1-indexed
            1 // Primer día del mes
          )
          setFocusedDate(calendarDate)
        }
      }
    }
  }, [tour, focusedDate])

  const getAvailabilityForDate = dateObj => {
    const date = new Date(Date.UTC(dateObj.year, dateObj.month - 1, dateObj.day))

    return availabilities.find(avail => date >= avail.departureDate && date <= avail.returnDate)
  }

  const isDateUnavailable = dateObj => {
    const date = new Date(Date.UTC(dateObj.year, dateObj.month - 1, dateObj.day))

    // Normalizar fecha actual a UTC sin hora para comparación justa
    const nowDate = new Date()
    const nowDateUtc = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()))

    // Las fechas pasadas no están disponibles (excepto el día actual)
    if (date < nowDateUtc) {
      return true
    }

    // Buscar la disponibilidad para esta fecha
    const availability = availabilities.find(avail => {
      const isInRange = date >= avail.departureDate && date <= avail.returnDate
      return isInRange
    })

    // Si no hay disponibilidad o los cupos son 0, la fecha no está disponible
    if (!availability || availability.availableSlots <= 0) {
      return true
    }

    return false
  }

  const handleDateSelect = dateObj => {
    const availability = getAvailabilityForDate(dateObj)

    if (availability) {
      const selectedDate = new Date(dateObj.year, dateObj.month - 1, dateObj.day)
      setSelectedDateRange({
        start: availability.departureDate,
        end: availability.returnDate
      })
      setSelectedAvailability(availability)

      onSelectDate?.({
        availability,
        selectedDate,
        range: {
          start: availability.departureDate,
          end: availability.returnDate
        }
      })
    }
  }

  const handleReserveClick = () => {
    if (!user) {
      // Si no hay usuario autenticado, redirigir a la página de login
      navigate('/login', {
        state: {
          from: `/tour/${tour.id}`,
          message: 'Debes iniciar sesión para reservar este tour'
        }
      })
    } else {
      // Si el usuario está autenticado, continuar con el proceso normal
      if (onSelectDate) {
        onSelectDate({
          availability: selectedAvailability,
          selectedDate: new Date(),
          range: selectedDateRange
        })
      }
      // Navegación a la página de confirmación de reserva
      navigate(`/tour/${tour.id}/confirm`, {
        state: {
          tour: tour,
          availability: selectedAvailability
        }
      })
    }
  }

  // Valor por defecto para el calendario en caso de que no haya fechas disponibles
  const defaultCalendarValue = today(getLocalTimeZone())

  return (
    <Card className='mb-4 overflow-hidden shadow-sm'>
      <CardBody className='p-4'>
        {/* Calendario con foco en el primer mes con disponibilidad */}
        <div className='mb-4 flex justify-center'>
          <Calendar
            aria-label='Calendario de disponibilidad'
            isDateUnavailable={isDateUnavailable}
            onChange={handleDateSelect}
            focusedValue={focusedDate || defaultCalendarValue}
            onFocusChange={setFocusedDate}
            calendarWidth={340}
            visibleMonths={1}
            locale='es-ES'
            firstDayOfWeek='mon'
            renderCell={date => {
              const isAvailable = !isDateUnavailable(date)
              const availability = isAvailable ? getAvailabilityForDate(date) : null
              const cellDate = new Date(Date.UTC(date.year, date.month - 1, date.day))

              // Verificar inicio y fin comparando fechas completas con getTime()
              const isStart = availability && cellDate.getTime() === availability.departureDate.getTime()
              const isEnd = availability && cellDate.getTime() === availability.returnDate.getTime()

              // Destacar fechas de inicio y fin con colores diferentes
              let cellStyle = ''
              if (isStart) cellStyle = 'bg-red-500 text-white rounded-l-full'
              else if (isEnd) cellStyle = 'bg-red-500 text-white rounded-r-full'
              else if (isAvailable) cellStyle = 'bg-red-100'

              return <div className={`w-10 h-10 flex items-center justify-center ${cellStyle}`}>{date.day}</div>
            }}
          />
        </div>

        {/* Mensaje cuando no hay fecha seleccionada */}
        {!selectedAvailability && (
          <div className='text-center p-6 bg-gray-50 rounded-lg border border-gray-200'>
            <span className='material-symbols-outlined text-4xl text-gray-400 mb-3'>calendar_month</span>
            <p className='text-gray-600 font-medium'>Selecciona una fecha disponible</p>
            <p className='text-gray-500 text-sm mt-2'>
              Podrás ver los detalles de disponibilidad de este tour, y continuar el proceso de reserva
            </p>
          </div>
        )}

        {/* Panel de detalles cuando hay fecha seleccionada */}
        {selectedAvailability && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <h4 className='font-medium text-lg text-primary mb-3'>Detalles de la fecha</h4>
            <div className='space-y-3'>
              {/* Fecha de salida */}
              <div className='flex items-center'>
                <span className='material-symbols-outlined mr-2 text-gray-500'>event</span>
                <div>
                  <span className='font-medium'>Salida:</span> {formatDateForDisplay(selectedAvailability.departureTime)}{' '}
                  <span className='text-primary font-medium'>{formatTimeForDisplay(selectedAvailability.departureTime)}</span>
                </div>
              </div>

              {/* Fecha de regreso */}
              <div className='flex items-center'>
                <span className='material-symbols-outlined mr-2 text-gray-500'>today</span>
                <div>
                  <span className='font-medium'>Regreso:</span> {formatDateForDisplay(selectedAvailability.returnTime)}{' '}
                  <span className='text-primary font-medium'>{formatTimeForDisplay(selectedAvailability.returnTime)}</span>
                </div>
              </div>

              {/* Cupos disponibles */}
              <div className='flex items-center'>
                <Users className='h-5 w-5 mr-2 text-gray-500' />
                <div>
                  <span className='font-medium'>Cupos disponibles:</span>{' '}
                  <span className='text-primary font-medium'>{selectedAvailability.availableSlots}</span>
                </div>
              </div>

              {/* Fecha límite de reserva */}
              {selectedAvailability.bookUntilDate && (
                <div className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2 text-gray-500' />
                  <div>
                    <span className='font-medium'>Reservas hasta:</span>{' '}
                    <span className='font-medium'>{formatDateForDisplay(selectedAvailability.bookUntilDate)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de reserva modificado */}
            <Button
              className='w-full mt-4 bg-[#E86C6E] hover:bg-red-600 text-white text-md font-medium py-3 rounded-lg shadow-sm transition-colors'
              onPress={handleReserveClick}>
              {user ? 'Iniciar reserva' : 'Iniciar sesión para reservar'}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default DisponibilidadCalendario
