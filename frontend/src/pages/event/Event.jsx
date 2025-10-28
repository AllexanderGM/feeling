import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Input, Button, Spinner, Card, CardBody, Chip } from '@heroui/react'
import { Search, RefreshCw, CalendarDays, Sparkles } from 'lucide-react'
import { useEvents } from '@hooks'
import CardEvent from '@components/ui/cards/CardEvent.jsx'
import { parseJavaDate } from '@utils/dateUtils.js'
import { APP_PATHS } from '@constants/paths.js'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'

const applySearchFilter = (events, searchTerm) => {
  if (!Array.isArray(events) || !events.length) return []

  const normalized = searchTerm.trim().toLowerCase()

  if (!normalized) return events

  return events.filter(event => {
    const haystackParts = [
      event.title,
      event.description,
      event.location,
      event.categoryDisplayName,
      event.statusDisplayName,
      event.createdByName
    ].filter(Boolean)

    const parsedDate = parseJavaDate(event.eventDate)

    if (parsedDate) {
      haystackParts.push(parsedDate.toLocaleDateString('es-ES'))
      haystackParts.push(
        parsedDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      )
    }

    const haystack = haystackParts.join(' ').toLowerCase()

    return haystack.includes(normalized)
  })
}

const EventsPage = () => {
  const { loading, upcomingEvents, fetchUpcomingEvents, upcomingEventsPagination } = useEvents()
  const [searchTerm, setSearchTerm] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialError, setInitialError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadInitialEvents = async () => {
      setInitialLoading(true)
      setInitialError('')

      const result = await fetchUpcomingEvents(0, 12, '')

      if (!isMounted) {
        return
      }

      if (result?.success) {
        setInitialized(true)
        setInitialError('')
      } else {
        setInitialError(result?.message || 'No pudimos cargar los eventos. Intenta nuevamente.')
      }

      setInitialLoading(false)
    }

    loadInitialEvents()

    return () => {
      isMounted = false
    }
  }, [fetchUpcomingEvents])

  const handleRefresh = useCallback(() => {
    fetchUpcomingEvents(0, upcomingEventsPagination?.size || 12, searchTerm)
  }, [fetchUpcomingEvents, upcomingEventsPagination?.size, searchTerm])

  const handleInitialRetry = useCallback(async () => {
    setInitialLoading(true)
    setInitialError('')
    const result = await fetchUpcomingEvents(0, 12, '')

    if (result?.success) {
      setInitialized(true)
      setInitialError('')
    } else {
      setInitialError(result?.message || 'No pudimos cargar los eventos. Intenta nuevamente.')
    }
    setInitialLoading(false)
  }, [fetchUpcomingEvents])

  const handleSearchChange = useCallback(event => {
    setSearchTerm(event.target.value)
  }, [])

  const filteredEvents = useMemo(() => applySearchFilter(upcomingEvents, searchTerm), [upcomingEvents, searchTerm])

  const handleSelectEvent = useCallback(
    eventId => {
      if (!eventId) return

      navigate(APP_PATHS.USER.EVENT_DETAIL.replace(':eventId', String(eventId)))
    },
    [navigate]
  )

  const hasResults = filteredEvents.length > 0

  if (!initialized && initialLoading) {
    return <LoadData>Cargando próximos eventos...</LoadData>
  }

  if (!initialized && initialError) {
    return <LoadDataError message={initialError} retryAction={handleInitialRetry} />
  }

  return (
    <>
      <Helmet>
        <title>Próximos Eventos - Feeling</title>
        <meta content='Descubre los próximos eventos y experiencias organizadas por la comunidad Feeling.' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Próximos eventos disponibles' className='gap-4 !pt-0'>
        {/* Header */}
        <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                <CalendarDays className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <h1 className='text-lg font-semibold text-gray-200 mb-1'>Próximos Eventos</h1>
                <p className='text-sm text-gray-400'>
                  Participa en actividades diseñadas para crear conexiones auténticas. Filtra, explora y asegura tu cupo en los próximos
                  encuentros de la comunidad.
                </p>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <Input
                aria-label='Buscar eventos'
                className='flex-1'
                placeholder='Buscar por nombre, ubicación o categoría'
                startContent={<Search className='text-gray-500' size={18} />}
                value={searchTerm}
                onChange={handleSearchChange}
              />

              <Button
                color='primary'
                isDisabled={loading}
                isLoading={loading}
                startContent={!loading && <RefreshCw size={16} />}
                onPress={handleRefresh}>
                Actualizar lista
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Content */}
        <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex items-center gap-2'>
                <Sparkles className='text-primary-400' size={18} />
                <h2 className='text-sm font-semibold text-gray-200'>Eventos disponibles</h2>
              </div>
              <Chip className='bg-primary/15 text-primary-100' radius='sm' size='sm' variant='flat'>
                {filteredEvents.length}
              </Chip>
            </div>

            {loading ? (
              <div className='flex min-h-[40vh] items-center justify-center'>
                <Spinner color='primary' label='Cargando eventos...' size='lg' />
              </div>
            ) : hasResults ? (
              <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
                {filteredEvents.map(event => (
                  <CardEvent key={event.id} event={event} onSelect={() => handleSelectEvent(event.id)} />
                ))}
              </div>
            ) : (
              <Card className='bg-gray-800/30 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='flex flex-col items-center gap-3 py-12 text-center'>
                  <div className='w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center'>
                    <Sparkles className='w-6 h-6 text-primary-400' size={24} />
                  </div>
                  <h2 className='text-lg font-semibold text-gray-200'>No encontramos eventos para tu búsqueda</h2>
                  <p className='max-w-md text-sm text-gray-400'>
                    Intenta con otros términos o vuelve más tarde. Nuestro equipo trabaja para traer nuevas experiencias pronto.
                  </p>
                </CardBody>
              </Card>
            )}
          </CardBody>
        </Card>
      </LiteContainer>
    </>
  )
}

export default EventsPage
