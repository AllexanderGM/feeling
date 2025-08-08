import { memo } from 'react'
import { Card, CardBody, Progress, Chip } from '@heroui/react'
import { Calendar, Users, TrendingUp, BarChart3, CheckCircle, Clock, MapPin, Activity, DollarSign, Star } from 'lucide-react'

const EventStatsCards = memo(({ eventStats }) => {
  if (!eventStats) return null

  // Usar datos reales de eventStats
  const totalEvents = parseInt(eventStats.totalEvents) || 0
  const activeEvents = parseInt(eventStats.activeEvents) || 0
  const totalRegistrations = parseInt(eventStats.totalRegistrations) || 0
  const completedRegistrations = parseInt(eventStats.completedRegistrations) || 0
  const totalRevenue = parseFloat(eventStats.totalRevenue) || 0
  const avgAttendees = parseFloat(eventStats.averageAttendeesPerEvent) || 0
  const capacityUtilization = parseFloat(eventStats.eventCapacityUtilization) || 0

  // Métricas calculadas
  const inactiveEvents = totalEvents - activeEvents
  const activationRate = totalEvents > 0 ? ((activeEvents / totalEvents) * 100).toFixed(1) : 0
  const registrationRate = totalRegistrations > 0 ? ((completedRegistrations / totalRegistrations) * 100).toFixed(1) : 0
  const revenuePerEvent = activeEvents > 0 ? (totalRevenue / activeEvents).toFixed(2) : 0

  // Eventos que requieren atención
  const needsAttentionCount = inactiveEvents

  const statsConfig = [
    {
      value: totalEvents,
      label: 'Total Eventos',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: Calendar,
      description: 'Eventos totales en plataforma'
    },
    {
      value: `${activationRate}%`,
      label: 'Tasa de Activación',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: TrendingUp,
      description: 'Eventos activos vs total'
    },
    {
      value: `${registrationRate}%`,
      label: 'Tasa de Completado',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: CheckCircle,
      description: 'Inscripciones completadas'
    },
    {
      value: `$${totalRevenue.toLocaleString()}`,
      label: 'Ingresos Totales',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      icon: DollarSign,
      description: 'Ingresos generados por eventos'
    }
  ]

  return (
    <div className='space-y-4'>
      {/* Estadísticas básicas optimizadas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <Calendar className='w-4 h-4 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas de Eventos</h3>
              <p className='text-xs text-gray-400'>Resumen de eventos y participación</p>
            </div>
          </div>

          {/* Estadísticas principales compactas */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {statsConfig.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className='text-right'>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-200 mb-1'>{stat.label}</div>
                    <div className='text-xs text-gray-400'>{stat.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Métricas adicionales */}
          <div className='mt-6 pt-4 border-t border-gray-700/30'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {/* Eventos activos vs inactivos */}
              <div className='text-center'>
                <div className='text-lg font-bold text-green-400'>{activeEvents}</div>
                <div className='text-xs text-gray-400'>Eventos Activos</div>
                <div className='text-xs text-gray-500 mt-1'>{inactiveEvents} inactivos</div>
              </div>

              {/* Inscripciones totales */}
              <div className='text-center'>
                <div className='text-lg font-bold text-blue-400'>{totalRegistrations}</div>
                <div className='text-xs text-gray-400'>Inscripciones</div>
                <div className='text-xs text-gray-500 mt-1'>
                  {completedRegistrations} pagadas
                  {eventStats.eventsByCategory && Object.keys(eventStats.eventsByCategory).length > 0 && (
                    <span className='block'>{Object.keys(eventStats.eventsByCategory).length} categorías</span>
                  )}
                </div>
              </div>

              {/* Ocupación promedio */}
              <div className='text-center'>
                <div className='text-lg font-bold text-orange-400'>{(capacityUtilization * 100).toFixed(1)}%</div>
                <div className='text-xs text-gray-400'>Ocupación Media</div>
                <Progress
                  value={capacityUtilization * 100}
                  color='warning'
                  className='mt-2 max-w-full'
                  size='sm'
                  aria-label={`Ocupación media de eventos: ${(capacityUtilization * 100).toFixed(1)}%`}
                />
                <div className='text-xs text-gray-500 mt-1'>{avgAttendees.toFixed(1)} personas/evento</div>
              </div>

              {/* Estado general */}
              <div className='text-center'>
                <Chip
                  variant='flat'
                  color={needsAttentionCount === 0 ? 'success' : needsAttentionCount <= 5 ? 'warning' : 'danger'}
                  size='sm'>
                  {needsAttentionCount === 0 ? 'Todo activo' : needsAttentionCount <= 5 ? 'Pocos inactivos' : 'Revisar eventos'}
                </Chip>
                <div className='text-xs text-gray-400 mt-1'>Estado General</div>
                {eventStats.registrationsByStatus && Object.keys(eventStats.registrationsByStatus).length > 0 && (
                  <div className='text-xs text-gray-500 mt-1'>{Object.keys(eventStats.registrationsByStatus).length} tipos de registro</div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

EventStatsCards.displayName = 'EventStatsCards'

export default EventStatsCards
