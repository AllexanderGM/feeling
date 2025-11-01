import { Card, CardBody, Skeleton } from '@heroui/react'
import { Users, Clock, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react'
import { memo } from 'react'

const MatchStatsCards = memo(({ stats = {}, loading = false }) => {
  const statsConfig = [
    {
      title: 'Total de Matches',
      value: stats?.totalMatches || 0,
      icon: Users,
      color: 'primary',
      bgColor: 'bg-primary-500/10',
      iconColor: 'text-primary-500',
      borderColor: 'border-primary-500/20'
    },
    {
      title: 'Pendientes',
      value: stats?.pendingMatches || 0,
      icon: Clock,
      color: 'warning',
      bgColor: 'bg-warning-500/10',
      iconColor: 'text-warning-500',
      borderColor: 'border-warning-500/20'
    },
    {
      title: 'Aceptados',
      value: stats?.acceptedMatches || 0,
      icon: CheckCircle,
      color: 'success',
      bgColor: 'bg-success-500/10',
      iconColor: 'text-success-500',
      borderColor: 'border-success-500/20'
    },
    {
      title: 'Rechazados',
      value: stats?.rejectedMatches || 0,
      icon: XCircle,
      color: 'danger',
      bgColor: 'bg-danger-500/10',
      iconColor: 'text-danger-500',
      borderColor: 'border-danger-500/20'
    },
    {
      title: 'Tasa de Aceptación',
      value: stats?.acceptanceRate ? `${Math.round(stats.acceptanceRate)}%` : '0%',
      icon: TrendingUp,
      color: 'success',
      bgColor: 'bg-success-500/10',
      iconColor: 'text-success-500',
      borderColor: 'border-success-500/20'
    },
    {
      title: 'Actividad Hoy',
      value: stats?.todayMatches || 0,
      icon: Activity,
      color: 'secondary',
      bgColor: 'bg-secondary-500/10',
      iconColor: 'text-secondary-500',
      borderColor: 'border-secondary-500/20'
    }
  ]

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className='bg-gray-800/40 border-gray-700/50'>
            <CardBody className='p-4'>
              <Skeleton className='h-12 w-full rounded-lg' />
              <Skeleton className='h-6 w-20 mt-2 rounded-lg' />
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon

        return (
          <Card
            key={index}
            className={`${stat.bgColor} border ${stat.borderColor} backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
            <CardBody className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-2xl font-bold text-gray-100'>{stat.value}</span>
                <span className='text-xs text-gray-400 mt-1'>{stat.title}</span>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
})

MatchStatsCards.displayName = 'MatchStatsCards'

export default MatchStatsCards
