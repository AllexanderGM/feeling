import { Card, CardBody, CardFooter, Chip, Image } from '@heroui/react'
import { CalendarDays, MapPin, Users, Ticket } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { parseJavaDate } from '@utils/dateUtils.js'

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
})

const CardEvent = ({ event, onSelect }) => {
  const {
    title,
    description,
    location,
    categoryDisplayName,
    statusDisplayName,
    eventDate,
    price,
    availableSpots,
    isFull,
    hasAvailableSpots,
    mainImage,
    images = []
  } = event

  const imageSource = useMemo(() => {
    return mainImage || images[0] || null
  }, [mainImage, images])

  const eventDateValue = useMemo(() => parseJavaDate(eventDate), [eventDate])

  const formattedDate = useMemo(() => {
    if (!eventDateValue) return 'Fecha por confirmar'

    return dateFormatter.format(eventDateValue)
  }, [eventDateValue])

  const formattedTime = useMemo(() => {
    if (!eventDateValue) return null

    return timeFormatter.format(eventDateValue)
  }, [eventDateValue])

  const formattedPrice = useMemo(() => {
    if (price === null || price === undefined || price === 0) return 'Gratis'

    try {
      return priceFormatter.format(price)
    } catch {
      return `${price} COP`
    }
  }, [price])

  const availabilityInfo = useMemo(() => {
    if (isFull) return { label: 'Lleno', color: 'danger' }
    if (hasAvailableSpots === false) return { label: 'Sin cupos', color: 'warning' }
    if (typeof availableSpots === 'number') {
      return { label: `${availableSpots} cupos`, color: 'success' }
    }

    return { label: 'Cupos limitados', color: 'default' }
  }, [availableSpots, hasAvailableSpots, isFull])

  const handleViewDetails = useCallback(() => {
    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }, [event, onSelect])

  const handleKeyboardPress = useCallback(
    keyboardEvent => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault()
        handleViewDetails()
      }
    },
    [handleViewDetails]
  )

  const truncatedDescription = useMemo(() => {
    if (!description) return 'Descubre esta experiencia única.'
    if (description.length <= 100) return description

    const truncated = description.substring(0, 97)

    return `${truncated}...`
  }, [description])

  return (
    <Card
      isPressable
      className='h-full border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
      onPress={handleViewDetails}>
      <CardBody className='p-0'>
        <div className='relative w-full h-48 sm:h-56 overflow-hidden'>
          {imageSource ? (
            <Image alt={title} className='w-full h-full object-cover' radius='none' src={imageSource} />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-900/60'>
              <CalendarDays className='text-gray-600' size={40} />
            </div>
          )}

          <div className='absolute top-2 left-2 right-2 flex flex-wrap gap-2'>
            {categoryDisplayName ? (
              <Chip className='bg-primary/90 text-white border-0 backdrop-blur-sm text-xs h-6' size='sm' variant='flat'>
                {categoryDisplayName}
              </Chip>
            ) : null}
            {statusDisplayName ? (
              <Chip className='bg-gray-900/80 text-gray-200 border-0 backdrop-blur-sm text-xs h-6' size='sm' variant='flat'>
                {statusDisplayName}
              </Chip>
            ) : null}
          </div>
        </div>

        <div className='p-3 space-y-2'>
          <h3 className='text-base font-bold text-gray-100 line-clamp-2 leading-tight'>{title}</h3>

          <p className='text-sm text-gray-400 line-clamp-2'>{truncatedDescription}</p>

          <div className='space-y-1.5'>
            <div className='flex items-center gap-2 text-xs'>
              <CalendarDays className='text-blue-400 flex-shrink-0' size={14} />
              <span className='text-gray-300'>
                {formattedDate}
                {formattedTime ? ` · ${formattedTime}` : ''}
              </span>
            </div>

            {location ? (
              <div className='flex items-center gap-2 text-xs'>
                <MapPin className='text-green-400 flex-shrink-0' size={14} />
                <span className='text-gray-300 truncate'>{location}</span>
              </div>
            ) : null}

            <div className='flex items-center gap-2 text-xs'>
              <Users className='text-purple-400 flex-shrink-0' size={14} />
              <span className='text-gray-300'>{availabilityInfo.label}</span>
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter className='p-3 pt-0 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Ticket className='text-primary-400' size={16} />
          <span className='text-base font-bold text-primary-400'>{formattedPrice}</span>
        </div>
        <div
          className='px-3 py-1.5 rounded-md bg-primary/30 text-primary-200 text-xs font-medium hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer transition-colors'
          role='button'
          tabIndex={0}
          onClick={handleViewDetails}
          onKeyDown={handleKeyboardPress}>
          Ver detalles
        </div>
      </CardFooter>
    </Card>
  )
}

export default memo(CardEvent)
