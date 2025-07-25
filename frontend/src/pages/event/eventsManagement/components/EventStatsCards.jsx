import { memo } from 'react'
import { Card, CardBody, Progress } from '@heroui/react'
import { Calendar, Clock, DollarSign, MapPin, TrendingUp, Users } from 'lucide-react'

const EventStatsCards = memo(({ eventStats = {} }) => {
  const {
    totalEvents = 0,
    totalPending = 0,
    totalRevenue = 0,
    popularDestinations = []
  } = eventStats

  // Calcular métricas adicionales
  const activeEvents = totalEvents - totalPending
  const completionRate = totalEvents > 0 ? Math.round((activeEvents / totalEvents) * 100) : 0
  const averagePrice = totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0

  const statsCards = [
    {
      title: 'Total Eventos',
      value: totalEvents,
      icon: Calendar,
      color: 'primary',
      description: 'Eventos en el sistema',
      trend: '+12% vs mes anterior'
    },
    {
      title: 'Eventos Activos',
      value: activeEvents,
      icon: TrendingUp,
      color: 'success',
      description: 'Eventos disponibles',
      trend: `${completionRate}% del total`
    },
    {
      title: 'Pendientes',
      value: totalPending,
      icon: Clock,
      color: 'warning',
      description: 'Esperando aprobación',
      trend: totalPending > 0 ? 'Requiere atención' : 'Todo al día'
    },
    {
      title: 'Ingresos Potenciales',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'secondary',
      description: 'Valor total eventos',
      trend: `Promedio: $${averagePrice.toLocaleString()}`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="bg-default-50 border border-default-200">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-default-800">
                      {stat.value}
                    </h3>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-default-600 mb-1">
                    {stat.title}
                  </h4>
                  <p className="text-xs text-default-500 mb-2">
                    {stat.description}
                  </p>
                  <p className={`text-xs font-medium text-${stat.color}-600`}>
                    {stat.trend}
                  </p>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Gráficos y métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Destinos Populares */}
        <Card className="bg-default-50 border border-default-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary-100">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-default-800">
                  Destinos Populares
                </h3>
                <p className="text-sm text-default-500">
                  Ciudades con más eventos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {popularDestinations.length > 0 ? (
                popularDestinations.map((destination, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-default-800">
                          {destination.city}
                        </p>
                        <p className="text-xs text-default-500">
                          {destination.count} evento{destination.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        size="sm"
                        value={(destination.count / totalEvents) * 100}
                        color="primary"
                        className="max-w-[60px]"
                      />
                      <span className="text-xs text-default-500 min-w-[30px]">
                        {Math.round((destination.count / totalEvents) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-default-500 text-center py-4">
                  No hay datos de destinos disponibles
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Métricas de Rendimiento */}
        <Card className="bg-default-50 border border-default-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-success-100">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-default-800">
                  Métricas de Rendimiento
                </h3>
                <p className="text-sm text-default-500">
                  Indicadores clave del sistema
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tasa de Completitud */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-default-700">
                    Eventos Activos
                  </p>
                  <span className="text-sm font-semibold text-success-600">
                    {completionRate}%
                  </span>
                </div>
                <Progress
                  value={completionRate}
                  color="success"
                  size="sm"
                  className="mb-1"
                />
                <p className="text-xs text-default-500">
                  {activeEvents} de {totalEvents} eventos están activos
                </p>
              </div>

              {/* Eventos Pendientes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-default-700">
                    Eventos Pendientes
                  </p>
                  <span className="text-sm font-semibold text-warning-600">
                    {totalEvents > 0 ? Math.round((totalPending / totalEvents) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={totalEvents > 0 ? (totalPending / totalEvents) * 100 : 0}
                  color="warning"
                  size="sm"
                  className="mb-1"
                />
                <p className="text-xs text-default-500">
                  {totalPending} eventos esperando aprobación
                </p>
              </div>

              {/* Valor Promedio */}
              <div className="pt-4 border-t border-default-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-default-400" />
                    <p className="text-sm font-medium text-default-700">
                      Precio Promedio
                    </p>
                  </div>
                  <span className="text-lg font-bold text-default-800">
                    ${averagePrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-default-500 mt-1">
                  Por evento en el sistema
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
})

EventStatsCards.displayName = 'EventStatsCards'

export default EventStatsCards