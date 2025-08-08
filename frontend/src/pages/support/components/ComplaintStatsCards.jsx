import { memo } from 'react'
import { Card, CardBody, Progress, Chip, Skeleton } from '@heroui/react'
import { MessageCircle, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users, Timer } from 'lucide-react'

const ComplaintStatsCards = memo(({ stats = {}, loading = false }) => {
  if (!stats && !loading) return null

  const defaultStats = {
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    overdueComplaints: 0,
    urgentComplaints: 0,
    averageResolutionTime: 0,
    totalUsers: 0,
    ...stats
  }

  // Calcular métricas derivadas
  const pendingComplaints = defaultStats.openComplaints + defaultStats.inProgressComplaints
  const resolutionRate =
    defaultStats.totalComplaints > 0 ? ((defaultStats.resolvedComplaints / defaultStats.totalComplaints) * 100).toFixed(1) : 0
  const urgencyRate =
    defaultStats.totalComplaints > 0 ? ((defaultStats.urgentComplaints / defaultStats.totalComplaints) * 100).toFixed(1) : 0

  const statsConfig = [
    {
      value: defaultStats.totalComplaints,
      label: 'Total de Quejas',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: MessageCircle,
      description: 'Quejas registradas'
    },
    {
      value: pendingComplaints,
      label: 'Pendientes',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      icon: Clock,
      description: 'Requieren atención'
    },
    {
      value: defaultStats.resolvedComplaints,
      label: 'Resueltas',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: CheckCircle,
      description: 'Completadas exitosamente'
    },
    {
      value: defaultStats.urgentComplaints,
      label: 'Urgentes',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: AlertTriangle,
      description: 'Prioridad alta'
    }
  ]

  return (
    <div className='space-y-4'>
      {/* Estadísticas básicas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <MessageCircle className='w-4 h-4 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas de Soporte</h3>
              <p className='text-xs text-gray-400'>Resumen de quejas y reclamos</p>
            </div>
          </div>

          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[1, 2, 3, 4].map(index => (
                <div key={index} className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
                  <div className='space-y-3'>
                    <Skeleton className='w-10 h-10 rounded-full bg-gray-700/50' />
                    <div className='space-y-2'>
                      <Skeleton className='w-3/4 h-4 rounded bg-gray-700/50' />
                      <Skeleton className='w-1/2 h-6 rounded bg-gray-700/50' />
                      <Skeleton className='w-full h-3 rounded bg-gray-700/50' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Estadísticas principales */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {statsConfig.map((stat, index) => {
                  const Icon = stat.icon
                  const isHighPriority = stat.label.includes('Urgentes') || stat.label.includes('Pendientes')

                  return (
                    <div key={index} className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className='text-right'>
                          <div className={`text-2xl font-bold ${stat.color}`}>
                            {typeof stat.value === 'number' && stat.value > 999 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
                          </div>
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
                  {/* Quejas vencidas */}
                  <div className='text-center'>
                    <div className='text-lg font-bold text-red-400'>{defaultStats.overdueComplaints}</div>
                    <div className='text-xs text-gray-400'>Vencidas (+24h)</div>
                    <div className='text-xs text-gray-500 mt-1'>Requieren atención inmediata</div>
                  </div>

                  {/* Tiempo promedio de resolución */}
                  <div className='text-center'>
                    <div className='text-lg font-bold text-yellow-400'>{defaultStats.averageResolutionHours?.toFixed(1) || 0}h</div>
                    <div className='text-xs text-gray-400'>Tiempo Promedio</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {(defaultStats.contextMetrics?.totalContextualComplaints && (
                        <span>{defaultStats.contextMetrics.totalContextualComplaints} contextuales</span>
                      )) ||
                        'de resolución'}
                    </div>
                  </div>

                  {/* Tasa de resolución */}
                  <div className='text-center'>
                    <div className='text-lg font-bold text-green-400'>{resolutionRate}%</div>
                    <div className='text-xs text-gray-400'>Tasa de Resolución</div>
                    <Progress
                      value={parseFloat(resolutionRate)}
                      color='success'
                      className='mt-2 max-w-full'
                      size='sm'
                      aria-label={`Tasa de resolución: ${resolutionRate}%`}
                    />
                  </div>

                  {/* Estado general */}
                  <div className='text-center'>
                    <Chip
                      variant='flat'
                      color={
                        defaultStats.overdueComplaints === 0 && defaultStats.urgentComplaints === 0
                          ? 'success'
                          : defaultStats.overdueComplaints <= 2 && defaultStats.urgentComplaints <= 3
                            ? 'warning'
                            : 'danger'
                      }
                      size='sm'>
                      {defaultStats.overdueComplaints === 0 && defaultStats.urgentComplaints === 0
                        ? 'Todo al día'
                        : defaultStats.overdueComplaints <= 2 && defaultStats.urgentComplaints <= 3
                          ? 'Atención moderada'
                          : 'Requiere atención'}
                    </Chip>
                    <div className='text-xs text-gray-400 mt-1'>Estado del Soporte</div>
                    {defaultStats.typeDistribution && Object.keys(defaultStats.typeDistribution).length > 0 && (
                      <div className='text-xs text-gray-500 mt-1'>{Object.keys(defaultStats.typeDistribution).length} tipos de queja</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
})

ComplaintStatsCards.displayName = 'ComplaintStatsCards'

export { ComplaintStatsCards }
