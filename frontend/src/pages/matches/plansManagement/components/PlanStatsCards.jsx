import { Card, CardBody, Skeleton } from '@heroui/react'
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react'

const PlanStatsCards = ({ stats, loading }) => {
  const statsConfig = [
    {
      title: 'Total de Planes',
      value: stats?.totalPlans || 0,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: 'planes configurados'
    },
    {
      title: 'Planes Activos',
      value: stats?.activePlans || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'planes disponibles'
    },
    {
      title: 'Total Compras',
      value: stats?.totalPurchases || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'compras realizadas'
    },
    {
      title: 'Ingresos Totales',
      value: `$${(stats?.totalRevenue || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      description: 'ingresos generados'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon
        
        return (
          <Card 
            key={index} 
            className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/60 transition-colors"
          >
            <CardBody className="p-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="w-12 h-12 rounded-lg bg-gray-700/50" />
                  <div className="space-y-2">
                    <Skeleton className="w-3/4 h-4 rounded bg-gray-700/50" />
                    <Skeleton className="w-1/2 h-6 rounded bg-gray-700/50" />
                    <Skeleton className="w-full h-3 rounded bg-gray-700/50" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default PlanStatsCards