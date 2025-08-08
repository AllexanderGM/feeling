import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner, Progress, Badge } from '@heroui/react'
import { Heart, TrendingUp, DollarSign, Users, Calendar, RefreshCw, Package, Star, Activity } from 'lucide-react'
import { useError, useMatches, useMatchPlans } from '@hooks'

const MatchAnalytics = () => {
  const { handleSuccess, handleError } = useError()
  const { matches, matchStats, loading: matchesLoading, fetchMatchStats } = useMatches()
  const { plans, loading: plansLoading, fetchPlans } = useMatchPlans()

  const [refreshing, setRefreshing] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchMatchStats && fetchMatchStats(), fetchPlans && fetchPlans()])
      } catch (error) {
        handleError('Error al cargar estadísticas de matches')
      }
    }

    loadInitialData()
  }, [fetchMatchStats, fetchPlans, handleError])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchMatchStats && fetchMatchStats(), fetchPlans && fetchPlans()])
      handleSuccess('Estadísticas de matches actualizadas')
    } catch (error) {
      handleError('Error al actualizar estadísticas')
    } finally {
      setRefreshing(false)
    }
  }

  // Crear datos adaptados de los hooks para compatibilidad con el UI existente
  const adaptedMatchStats = {
    totals: {
      matches: matchStats?.totalMatches || 0,
      successfulMatches: matchStats?.acceptedMatches || 0,
      activeConnections: matches.accepted?.length || 0,
      totalRevenue: plans.reduce((total, plan) => total + (plan.totalRevenue || 0), 0)
    },
    plans: {
      basic: plans.find(p => p.name?.toLowerCase().includes('básico')) || { sold: 0, revenue: 0, active: 0 },
      premium: plans.find(p => p.name?.toLowerCase().includes('premium')) || { sold: 0, revenue: 0, active: 0 },
      gold: plans.find(p => p.name?.toLowerCase().includes('gold')) || { sold: 0, revenue: 0, active: 0 }
    },
    activity: {
      today: matchStats?.todayMatches || 0,
      thisWeek: matchStats?.weekMatches || 0,
      thisMonth: matchStats?.monthMatches || 0,
      successRate: matchStats?.successRate || 0
    },
    demographics: {
      ageMatches: {
        '18-25': 25,
        '26-35': 40,
        '36-45': 25,
        '46+': 10
      },
      planPopularity: {
        Básico: 60,
        Premium: 30,
        Gold: 10
      }
    }
  }

  if ((matchesLoading || plansLoading) && !matchStats && plans.length === 0) {
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
          <h2 className='text-xl font-semibold text-foreground mb-1'>Estadísticas de Matches</h2>
          <p className='text-sm text-default-500'>Análisis de conexiones y paquetes vendidos</p>
        </div>
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          onPress={handleRefresh}
          isLoading={refreshing}
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          aria-label='Actualizar estadísticas de matches'>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Métricas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
                <Heart className='w-4 h-4 text-pink-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{adaptedMatchStats.totals.matches.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Total Matches</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-green-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{adaptedMatchStats.totals.successfulMatches}</p>
                <p className='text-xs text-default-500'>Matches Exitosos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Activity className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{adaptedMatchStats.totals.activeConnections}</p>
                <p className='text-xs text-default-500'>Conexiones Activas</p>
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
                <p className='text-lg font-bold text-foreground'>${(adaptedMatchStats.totals.totalRevenue || 0).toLocaleString()}</p>
                <p className='text-xs text-default-500'>Ingresos Totales</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Paquetes de matches */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-purple-400' />
            <h3 className='text-lg font-semibold text-foreground'>Paquetes de Matches</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Plan Básico */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 mb-3'>
                <Chip variant='flat' color='default' size='sm'>
                  Básico
                </Chip>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Vendidos:</span>
                  <span className='text-sm font-medium text-foreground'>{adaptedMatchStats.plans.basic.sold}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Activos:</span>
                  <span className='text-sm font-medium text-green-400'>{adaptedMatchStats.plans.basic.active}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Ingresos:</span>
                  <span className='text-sm font-medium text-yellow-400'>
                    ${(adaptedMatchStats.plans.basic.revenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Premium */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 mb-3'>
                <Chip variant='flat' color='primary' size='sm'>
                  Premium
                </Chip>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Vendidos:</span>
                  <span className='text-sm font-medium text-foreground'>{adaptedMatchStats.plans.premium.sold}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Activos:</span>
                  <span className='text-sm font-medium text-green-400'>{adaptedMatchStats.plans.premium.active}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Ingresos:</span>
                  <span className='text-sm font-medium text-yellow-400'>
                    ${(adaptedMatchStats.plans.premium.revenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Gold */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 mb-3'>
                <Chip variant='flat' color='warning' size='sm'>
                  Gold
                </Chip>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Vendidos:</span>
                  <span className='text-sm font-medium text-foreground'>{adaptedMatchStats.plans.gold.sold}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Activos:</span>
                  <span className='text-sm font-medium text-green-400'>{adaptedMatchStats.plans.gold.active}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-default-500'>Ingresos:</span>
                  <span className='text-sm font-medium text-yellow-400'>
                    ${(adaptedMatchStats.plans.gold.revenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Actividad reciente */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-5 h-5 text-green-400' />
            <h3 className='text-lg font-semibold text-foreground'>Actividad Reciente</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-400'>{adaptedMatchStats.activity.today}</p>
              <p className='text-sm text-default-500'>Hoy</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-blue-400'>{adaptedMatchStats.activity.thisWeek}</p>
              <p className='text-sm text-default-500'>Esta Semana</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-purple-400'>{adaptedMatchStats.activity.thisMonth}</p>
              <p className='text-sm text-default-500'>Este Mes</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-pink-400'>{adaptedMatchStats.activity.successRate}%</p>
              <p className='text-sm text-default-500'>Tasa de Éxito</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Análisis demográfico */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Matches por Edad</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(adaptedMatchStats.demographics.ageMatches).map(([age, percentage]) => (
                <div key={age} className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-foreground'>{age} años</span>
                    <span className='text-sm text-default-500'>{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    color='primary'
                    className='max-w-full'
                    aria-label={`Distribución de matches por edad ${age} años: ${percentage}%`}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Popularidad de Planes</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(adaptedMatchStats.demographics.planPopularity).map(([plan, percentage]) => (
                <div key={plan} className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-foreground'>{plan}</span>
                    <span className='text-sm text-default-500'>{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    color={plan === 'Básico' ? 'default' : plan === 'Premium' ? 'primary' : 'warning'}
                    className='max-w-full'
                    aria-label={`Popularidad del plan ${plan}: ${percentage}%`}
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

export default MatchAnalytics
