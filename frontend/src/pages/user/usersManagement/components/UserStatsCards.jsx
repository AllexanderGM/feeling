import { memo } from 'react'
import { Card, CardBody, Progress } from '@heroui/react'
import { Users, UserCheck, Shield, Heart, TrendingUp, Calendar, MapPin, BarChart3 } from 'lucide-react'

const UserStatsCards = memo(({ userStats }) => {
  if (!userStats) return null

  // Calcular estadísticas adicionales
  const completenessAverage = userStats.profileCompleteness?.average || 0
  const activeUsersLast30Days = userStats.activeUsers?.last30Days || 0
  const newUsersThisMonth = userStats.newUsers?.thisMonth || 0
  const averageAge = userStats.demographics?.averageAge || 0
  const totalMatches = userStats.matches?.total || 0
  const averageMatchesPerUser = userStats.matches?.averagePerUser || 0

  const statsConfig = [
    {
      value: userStats.admins,
      label: 'Administradores',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Shield
    },
    {
      value: userStats.verified,
      label: 'Verificados',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: UserCheck
    },
    {
      value: newUsersThisMonth,
      label: 'Nuevos este mes',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      icon: Calendar
    },
    {
      value: averageAge ? `${averageAge} años` : 'N/A',
      label: 'Edad Promedio',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      icon: BarChart3
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-none shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>


      {/* Gráfico de crecimiento de usuarios */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Crecimiento de Usuarios</h3>
              <p className="text-sm text-gray-400">Últimos 6 meses</p>
            </div>
          </div>
          
          {/* Gráfico simple con barras */}
          <div className="flex items-end gap-2 h-32">
            {userStats.monthlyGrowth && userStats.monthlyGrowth.map((monthData, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${(monthData.users / Math.max(...userStats.monthlyGrowth.map(m => m.users))) * 100}%` }}
                />
                <span className="text-xs text-gray-400 mt-1">{monthData.month}</span>
                <span className="text-xs font-medium text-gray-200">{monthData.users}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

UserStatsCards.displayName = 'UserStatsCards'

export default UserStatsCards
