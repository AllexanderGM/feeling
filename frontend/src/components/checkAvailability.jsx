import { useState, useEffect } from 'react'
import { Logger } from '@utils/logger.js'

const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

const CheckAvailability = () => {
  const [availabilityData, setAvailabilityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoading(true)
        const response = await fetch(`${URL}/availability/tour/1`)

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const data = await response.json()
        setAvailabilityData(data)
        Logger.info('Datos de disponibilidad obtenidos', Logger.CATEGORIES.SERVICE, { tourId: 1, dataCount: data?.length || 0 })
      } catch (err) {
        setError(err.message)
        Logger.error('Error obteniendo disponibilidad', Logger.CATEGORIES.SERVICE, { tourId: 1, error: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [])

  if (loading) {
    return <div className='p-4 bg-blue-100 rounded'>Loading availability data...</div>
  }

  if (error) {
    return <div className='p-4 bg-red-100 rounded'>Error: {error}</div>
  }

  if (!availabilityData || availabilityData.length === 0) {
    return <div className='p-4 bg-yellow-100 rounded'>No availability data found for tour 1</div>
  }

  return (
    <div className='p-4 bg-green-100 rounded'>
      <h3 className='font-bold mb-2'>Tour 1 Availability Data</h3>
      <ul className='list-disc pl-5'>
        {availabilityData.map((item, index) => (
          <li key={index} className='mb-2'>
            <div>
              <strong>Available Date:</strong> {item.availableDate}
            </div>
            <div>
              <strong>Available Slots:</strong> {item.availableSlots}
            </div>
            <div>
              <strong>Departure Time:</strong> {item.departureTime}
            </div>
            <div>
              <strong>Return Time:</strong> {item.returnTime}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CheckAvailability
