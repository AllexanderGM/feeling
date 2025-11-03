import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Input, Button, Spinner, Card, CardBody, Chip, Pagination } from '@heroui/react'
import { Search, RefreshCw, CalendarDays, Sparkles } from 'lucide-react'
import { useEvents } from '@hooks'
import CardEvent from '@components/ui/cards/CardEvent.jsx'
import { APP_PATHS } from '@constants/paths.js'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'

const EventsPage = () => {
  const { loading, upcomingEvents, fetchUpcomingEvents, upcomingEventsPagination } = useEvents()
  const rowsPerPage = 6
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialError, setInitialError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadEvents = async () => {
      if (!initialized) {
        setInitialLoading(true)
        setInitialError('')
      }

      try {
        await fetchUpcomingEvents(page - 1, rowsPerPage, searchTerm)

        if (isMounted) {
          setInitialized(true)
          setInitialError('')
        }
      } catch (error) {
        if (isMounted) {
          setInitialError(error?.message || 'No pudimos cargar los eventos. Intenta nuevamente.')
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      isMounted = false
    }
  }, [fetchUpcomingEvents, page, rowsPerPage, searchTerm, refreshToken, initialized])

  useEffect(() => {
    const totalPages = Math.max(1, upcomingEventsPagination.totalPages ?? 1)

    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [upcomingEventsPagination.totalPages, page])

  const handleRefresh = useCallback(() => {
    setPage(1)
    setSearchTerm(searchInput.trim())
    setRefreshToken(prev => prev + 1)
    setInitialError('')
  }, [searchInput])

  const handleInitialRetry = useCallback(() => {
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
    setRefreshToken(prev => prev + 1)
    setInitialLoading(true)
    setInitialError('')
  }, [])

  const handleSearchChange = useCallback(event => {
    setSearchInput(event.target.value)
  }, [])

  const handleSearchKeyDown = useCallback(
    event => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleRefresh()
      }
    },
    [handleRefresh]
  )

  const handlePageChange = useCallback(newPage => {
    setPage(newPage)
  }, [])

  const handleSelectEvent = useCallback(
    eventId => {
      if (!eventId) return

      navigate(APP_PATHS.USER.EVENT_DETAIL.replace(':eventId', String(eventId)))
    },
    [navigate]
  )

  const totalAvailable = upcomingEventsPagination.totalElements ?? upcomingEvents.length
  const hasResults = upcomingEvents.length > 0
  const totalPages = Math.max(1, upcomingEventsPagination.totalPages ?? 1)

  if (!initialized && initialLoading) {
    return <LoadData>Cargando próximos eventos...</LoadData>
  }

  if (!initialized && initialError) {
    return <LoadDataError message={initialError} retryAction={handleInitialRetry} />
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Próximos Eventos - Feeling | Descubre Experiencias para Conectar</title>
        <meta content='Próximos Eventos - Feeling | Descubre Experiencias para Conectar' name='title' />
        <meta
          content='Explora y reserva eventos exclusivos de Feeling. Experiencias diseñadas para crear conexiones auténticas con personas afines. Actividades sociales, networking y comunidad en Colombia.'
          name='description'
        />
        <meta
          content='eventos sociales colombia, eventos feeling, networking colombia, eventos para solteros, actividades sociales, conexiones significativas, eventos bogotá, comunidad social'
          name='keywords'
        />
        <link href='https://feeling.com.co/events' rel='canonical' />

        {/* Open Graph / Facebook */}
        <meta content='website' property='og:type' />
        <meta content='https://feeling.com.co/events' property='og:url' />
        <meta content='Feeling' property='og:site_name' />
        <meta content='Próximos Eventos - Feeling' property='og:title' />
        <meta
          content='Descubre eventos exclusivos para crear conexiones auténticas. Experiencias sociales diseñadas por Feeling.'
          property='og:description'
        />
        <meta content='https://feeling.com.co/images/feeling-social.jpg' property='og:image' />
        <meta content='1200' property='og:image:width' />
        <meta content='630' property='og:image:height' />
        <meta content='Próximos Eventos de Feeling' property='og:image:alt' />
        <meta content='es_CO' property='og:locale' />

        {/* Twitter Card */}
        <meta content='summary_large_image' name='twitter:card' />
        <meta content='https://feeling.com.co/events' name='twitter:url' />
        <meta content='Próximos Eventos - Feeling' name='twitter:title' />
        <meta content='Explora eventos exclusivos para crear conexiones auténticas. ¡Reserva tu lugar!' name='twitter:description' />
        <meta content='https://feeling.com.co/images/feeling-social.jpg' name='twitter:image' />
        <meta content='Próximos Eventos de Feeling' name='twitter:image:alt' />

        {/* Structured Data (JSON-LD) */}
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Próximos Eventos',
            description: 'Explora y reserva eventos exclusivos de Feeling para crear conexiones significativas',
            url: 'https://feeling.com.co/events',
            publisher: {
              '@type': 'Organization',
              name: 'Feeling',
              url: 'https://feeling.com.co',
              logo: {
                '@type': 'ImageObject',
                url: 'https://feeling.com.co/favicon.svg'
              }
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Inicio',
                  item: 'https://feeling.com.co'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Eventos',
                  item: 'https://feeling.com.co/events'
                }
              ]
            }
          })}
        </script>
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
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
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
                {totalAvailable}
              </Chip>
            </div>

            {loading ? (
              <div className='flex min-h-[40vh] items-center justify-center'>
                <Spinner color='primary' label='Cargando eventos...' size='lg' />
              </div>
            ) : hasResults ? (
              <>
                <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
                  {upcomingEvents.map(event => (
                    <CardEvent key={event.id} event={event} onSelect={() => handleSelectEvent(event.id)} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className='flex justify-end mt-6'>
                    <Pagination
                      showControls
                      color='primary'
                      isDisabled={loading}
                      page={page}
                      total={totalPages}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </>
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
