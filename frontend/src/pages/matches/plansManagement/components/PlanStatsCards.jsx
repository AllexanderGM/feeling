import { memo } from 'react'
import { Card, CardBody, Progress, Chip, Skeleton } from '@heroui/react'
import { Package, DollarSign, TrendingUp, Users, BarChart3, Activity } from 'lucide-react'

const PlanStatsCards = memo(({ stats, loading }) => {
  if (!stats && !loading) return null

  const totalPlans = stats?.totalPlans || 0
  const totalPurchases = stats?.totalPurchases || 0
  const totalRevenue = stats?.totalRevenue || 0
  const mostPopularPlan = stats?.mostPopularPlan || 'N/A'

  const statsConfig = [
    {
      value: totalPlans,
      label: 'Total de Planes',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: Package,
      description: 'Planes configurados'
    },
    {
      value: totalPurchases,
      label: 'Total Compras',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: Activity,
      description: 'Compras realizadas'
    },
    {
      value: totalRevenue.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      label: 'Ingresos Totales',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      icon: DollarSign,
      description: 'Dinero generado'
    },
    {
      value: mostPopularPlan,
      label: 'Plan Más Popular',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: TrendingUp,
      description: 'Más vendido'
    }
  ]

  return (
    <div className='space-y-4'>
      {/* Estadísticas básicas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
              <Package className='w-4 h-4 text-purple-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas de Planes</h3>
              <p className='text-xs text-gray-400'>Resumen de planes de match</p>
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
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Plan más popular con detalle */}
                  <div className='text-center'>
                    <div className='text-lg font-bold text-purple-400'>{mostPopularPlan}</div>
                    <div className='text-xs text-gray-400'>Plan Más Popular</div>
                    <div className='text-xs text-gray-500 mt-1'>{stats?.mostPopularPlanSales || 0} compras</div>
                  </div>

                  {/* Promedio de ingresos por compra */}
                  <div className='text-center'>
                    <div className='text-lg font-bold text-yellow-400'>
                      {totalPurchases > 0
                        ? (totalRevenue / totalPurchases).toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })
                        : (0).toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                    </div>
                    <div className='text-xs text-gray-400'>Ingreso Promedio</div>
                    <div className='text-xs text-gray-500 mt-1'>por compra</div>
                  </div>

                  {/* Estado general */}
                  <div className='text-center'>
                    <Chip variant='flat' color={totalPurchases > 50 ? 'success' : totalPurchases > 10 ? 'warning' : 'danger'} size='sm'>
                      {totalPurchases > 50 ? 'Excelente' : totalPurchases > 10 ? 'Bueno' : 'Bajo'}
                    </Chip>
                    <div className='text-xs text-gray-400 mt-1'>Rendimiento</div>
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

export default PlanStatsCards
