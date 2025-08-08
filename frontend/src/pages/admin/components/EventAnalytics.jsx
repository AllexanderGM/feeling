import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner, Progress, Badge } from '@heroui/react'
import { Calendar, TrendingUp, MapPin, Users, DollarSign, RefreshCw, Clock, Star, Activity } from 'lucide-react'
import { useError, useEvents } from '@hooks'

const EventAnalytics = () => {
  const { handleSuccess, handleError } = useError()
  const { allEvents, allEventsPagination, eventsByStatus, loading, fetchAllEvents, fetchEventsByStatus } = useEvents()

  const [refreshing, setRefreshing] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchAllEvents && fetchAllEvents(),
          fetchEventsByStatus && fetchEventsByStatus('PUBLICADO'),
          fetchEventsByStatus && fetchEventsByStatus('EN_EDICION')
        ])
      } catch (error) {
        handleError('Error al cargar estadísticas de eventos')
      }
    }

    loadInitialData()
  }, [fetchAllEvents, fetchEventsByStatus, handleError])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchAllEvents && fetchAllEvents(),
        fetchEventsByStatus && fetchEventsByStatus('PUBLICADO'),
        fetchEventsByStatus && fetchEventsByStatus('EN_EDICION')
      ])
      handleSuccess('Estadísticas de eventos actualizadas')
    } catch (error) {
      handleError('Error al actualizar estadísticas')
    } finally {
      setRefreshing(false)
    }
  }

  // Crear datos adaptados del hook para compatibilidad con el UI existente
  const eventStats = {
    totals: {
      events: allEvents.length || 0,
      activeEvents: eventsByStatus.PUBLICADO?.length || 0,
      completedEvents: eventsByStatus.TERMINADO?.length || 0,
      totalParticipants: allEvents.reduce((total, event) => total + (event.currentAttendees || 0), 0),
      totalRevenue: allEvents.reduce((total, event) => total + (event.price || 0) * (event.currentAttendees || 0), 0)
    },
    categories: {
      'Eventos Culturales': { count: 15, participants: 189 },
      'Deportes y Recreación': { count: 12, participants: 156 },
      'Talleres y Clases': { count: 21, participants: 279 },
      Otros: { count: 10, participants: 120 }
    },
    locations: {
      Bogotá: allEvents.filter(e => e.location?.includes('Bogotá')).length || 0,
      Medellín: allEvents.filter(e => e.location?.includes('Medellín')).length || 0,
      Cali: allEvents.filter(e => e.location?.includes('Cali')).length || 0,
      Otras: allEvents.filter(e => !e.location?.match(/(Bogotá|Medellín|Cali)/)).length || 0
    },
    recent: {
      today: 0,
      thisWeek: 0,
      thisMonth: allEvents.length || 0,
      avgParticipants:
        allEvents.length > 0
          ? Math.round(allEvents.reduce((total, event) => total + (event.currentAttendees || 0), 0) / allEvents.length)
          : 0
    },
    performance: {
      occupancyRate: 75,
      cancellationRate: 10,
      satisfactionScore: 4.2,
      repeatAttendance: 30
    },
    upcoming: allEvents
      .filter(e => e.status === 'PUBLICADO')
      .slice(0, 3)
      .map(event => ({
        name: event.title || event.name || 'Evento sin título',
        date: event.eventDate || new Date().toISOString().split('T')[0],
        participants: event.currentAttendees || 0,
        capacity: event.maxCapacity || 0
      }))
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spinner size='lg' color='primary' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-foreground mb-1'>Estadísticas de Eventos</h2>
          <p className='text-sm text-default-500'>Análisis de eventos y participación</p>
        </div>
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          onPress={handleRefresh}
          isLoading={refreshing}
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          aria-label='Actualizar estadísticas de eventos'>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Métricas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Calendar className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{eventStats.totals.events}</p>
                <p className='text-xs text-default-500'>Total Eventos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                <Activity className='w-4 h-4 text-green-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{eventStats.totals.activeEvents}</p>
                <p className='text-xs text-default-500'>Eventos Activos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-purple-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{eventStats.totals.totalParticipants.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Participantes</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center'>
                <DollarSign className='w-4 h-4 text-yellow-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>${eventStats.totals.totalRevenue.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Ingresos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
                <Star className='w-4 h-4 text-pink-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{eventStats.performance.satisfactionScore}</p>
                <p className='text-xs text-default-500'>Satisfacción</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Categorías de eventos */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-blue-400' />
            <h3 className='text-lg font-semibold text-foreground'>Categorías de Eventos</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Object.entries(eventStats.categories).map(([category, data]) => (
              <div key={category} className='p-4 bg-gray-700/30 rounded-lg'>
                <h4 className='font-medium text-foreground mb-2'>{category}</h4>
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-default-500'>Eventos:</span>
                    <span className='text-foreground font-medium'>{data.count}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-default-500'>Participantes:</span>
                    <span className='text-purple-400 font-medium'>{data.participants}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Actividad reciente y rendimiento */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-green-400' />
              <h3 className='text-lg font-semibold text-foreground'>Actividad Reciente</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-400'>{eventStats.recent.today}</p>
                <p className='text-sm text-default-500'>Hoy</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-400'>{eventStats.recent.thisWeek}</p>
                <p className='text-sm text-default-500'>Esta Semana</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-400'>{eventStats.recent.thisMonth}</p>
                <p className='text-sm text-default-500'>Este Mes</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-pink-400'>{eventStats.recent.avgParticipants}</p>
                <p className='text-sm text-default-500'>Promedio/Evento</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Rendimiento</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Ocupación</span>
                  <span className='text-sm text-default-500'>{eventStats.performance.occupancyRate}%</span>
                </div>
                <Progress
                  value={eventStats.performance.occupancyRate}
                  color='success'
                  className='max-w-full'
                  aria-label={`Tasa de ocupación: ${eventStats.performance.occupancyRate}%`}
                />
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Cancelaciones</span>
                  <span className='text-sm text-default-500'>{eventStats.performance.cancellationRate}%</span>
                </div>
                <Progress
                  value={eventStats.performance.cancellationRate}
                  color='warning'
                  className='max-w-full'
                  aria-label={`Tasa de cancelación: ${eventStats.performance.cancellationRate}%`}
                />
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Repetición</span>
                  <span className='text-sm text-default-500'>{eventStats.performance.repeatAttendance}%</span>
                </div>
                <Progress
                  value={eventStats.performance.repeatAttendance}
                  color='primary'
                  className='max-w-full'
                  aria-label={`Tasa de repetición: ${eventStats.performance.repeatAttendance}%`}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Ubicaciones y próximos eventos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-red-400' />
              <h3 className='text-lg font-semibold text-foreground'>Eventos por Ubicación</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(eventStats.locations).map(([location, count]) => (
                <div key={location} className='flex justify-between items-center'>
                  <span className='text-sm text-foreground'>{location}</span>
                  <Badge variant='flat' color='primary'>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-orange-400' />
              <h3 className='text-lg font-semibold text-foreground'>Próximos Eventos</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {eventStats.upcoming.map((event, index) => (
                <div key={index} className='p-3 bg-gray-700/30 rounded-lg'>
                  <h4 className='text-sm font-medium text-foreground mb-1'>{event.name}</h4>
                  <div className='flex justify-between text-xs text-default-500'>
                    <span>{event.date}</span>
                    <span>
                      {event.participants}/{event.capacity} participantes
                    </span>
                  </div>
                  <Progress
                    value={(event.participants / event.capacity) * 100}
                    color='primary'
                    className='max-w-full mt-2'
                    size='sm'
                    aria-label={`Participantes del evento ${event.name}: ${event.participants} de ${event.capacity} (${((event.participants / event.capacity) * 100).toFixed(0)}%)`}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default EventAnalytics
