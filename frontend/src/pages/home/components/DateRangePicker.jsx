import { useState, useEffect, useRef } from 'react'
import { DateRangePicker as HeroDateRangePicker } from '@heroui/react'
import { useSearch } from '@context/SearchContext'
import { toISOString } from '@utils/dateUtils.js'

const DateRangePicker = () => {
  const { updateAdvancedSearchParams } = useSearch()
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  })

  // Referencia para controlar la clave de renderizado
  const [resetKey, setResetKey] = useState(0)
  // Referencia al componente para métodos imperativos
  const pickerRef = useRef(null)

  const handleDateChange = range => {
    console.log('DateRangePicker - Fecha seleccionada:', range)

    setDateRange(range)

    // Convertir fechas al formato que espera el backend (ISO)
    const formattedRange = {
      startDate: toISOString(range.start || range.startDate),
      endDate: toISOString(range.end || range.endDate),
      // Mantener también el formato original para compatibilidad
      start: range.start,
      end: range.end
    }

    console.log('DateRangePicker - Formato para backend:', formattedRange)

    updateAdvancedSearchParams({ dateRange: formattedRange })
  }

  useEffect(() => {
    const handleResetEvent = () => {
      console.log('Reset event received in DateRangePicker')

      setDateRange({
        startDate: null,
        endDate: null
      })

      updateAdvancedSearchParams({ dateRange: null })

      setResetKey(prev => prev + 1)

      if (pickerRef.current && typeof pickerRef.current.reset === 'function') {
        pickerRef.current.reset()
      }
    }

    window.addEventListener('reset-date-range', handleResetEvent)
    return () => {
      window.removeEventListener('reset-date-range', handleResetEvent)
    }
  }, [updateAdvancedSearchParams])

  // Obtener la fecha actual y añadir un año
  const today = new Date()
  today.setHours(12, 0, 0, 0) // Establecer al mediodía para evitar problemas con zonas horarias

  const maxDate = new Date(today)
  maxDate.setFullYear(today.getFullYear() + 1)

  return (
    <HeroDateRangePicker
      key={resetKey} // Esto fuerza la re-renderización cuando cambia
      ref={pickerRef}
      startDate={dateRange.startDate}
      endDate={dateRange.endDate}
      onChange={handleDateChange}
      minDate={today}
      maxDate={maxDate}
      size="lg"
      locale="es-ES" // Configurar la localización española
      firstDayOfWeek="mon" // Establecer lunes como primer día de la semana
      classNames={{
        trigger: [
          'bg-default-100',
          'hover:bg-default-200',
          'data-[focused=true]:bg-default-100',
          'data-[focused=true]:border-1',
          'data-[focused=true]:border-[#E86C6E]',
          'h-12'
        ]
      }}
    />
  )
}

export default DateRangePicker
