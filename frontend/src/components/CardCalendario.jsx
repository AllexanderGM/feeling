import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Spinner } from '@heroui/react'
import { normalizeAvailability } from '@utils/dateUtils.js'

import DisponibilidadCalendario from './DisponibilidadCalendario.jsx'

const CardCalendario = ({ tour, tourToUse, onReservar }) => {
  const [loading, setLoading] = useState(false)
  const [disponibilidad, setDisponibilidad] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tour || !tour.id) return

    setLoading(true)
    try {
      console.log('Tour recibido en CardDetalle:', tour)
      console.log('Disponibilidad recibida en CardDetalle:', tour.availability)

      // Usar los datos de disponibilidad ya obtenidos en el tour
      if (tour.availability) {
        // Asegurarnos de que disponibilidad sea un array
        const availabilityArray = normalizeAvailability(tour.availability)

        console.log('Array de disponibilidad procesado en CardDetalle:', availabilityArray)

        // Ordenar las fechas de disponibilidad
        const availabilityOrdenada = [...availabilityArray].sort((a, b) => {
          const dateA = new Date(a.departureTime || a.availableDate || 0)
          const dateB = new Date(b.departureTime || b.availableDate || 0)
          return dateA - dateB
        })

        console.log('Disponibilidad ordenada en CardDetalle:', availabilityOrdenada)
        setDisponibilidad(availabilityOrdenada)
      } else {
        console.warn('No se encontraron datos de disponibilidad en el tour')
        setDisponibilidad([])
      }
    } catch (err) {
      console.error('Error procesando disponibilidad:', err)
      setError('No se pudo procesar la disponibilidad. Intente más tarde.')
    } finally {
      setLoading(false)
    }
  }, [tour])

  const handleDateSelected = dateInfo => {
    setSelectedDate(dateInfo)
    console.log('Fecha seleccionada en CardDetalle:', dateInfo)

    if (onReservar) {
      onReservar({
        tour,
        fechaSeleccionada: dateInfo
      })
    }
  }
  return (
    <Card>
      <CardHeader className="mb-2 flex flex-col items-center justify-center p-0 m-0">
        <div className="h-16 w-full bg-gray-100 p-10 flex justify-center items-center">
          <div className="font-semibold text-2xl text-gray-800">Fechas disponibles</div>
        </div>
      </CardHeader>

      <CardBody className="overflow-visible py-2 flex justify-center items-center">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner color="primary" size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p>{error}</p>
            <Button variant="flat" color="primary" size="sm" className="mt-2" onPress={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <DisponibilidadCalendario tour={{ ...tourToUse, availability: disponibilidad }} onSelectDate={handleDateSelected} />
          </div>
        )}
      </CardBody>

      {/* <CardFooter className="px-4 mt-2">
        <Button
          color="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-red-400 to-red-600 hover:opacity-90 transition-opacity"
          disabled={!selectedDate}
          onPress={() => handleDateSelected(selectedDate)}>
          <div className="text-lg">{selectedDate ? 'Iniciar reserva' : 'Selecciona una fecha'}</div>
        </Button>
      </CardFooter> */}
    </Card>
  )
}

export default CardCalendario
