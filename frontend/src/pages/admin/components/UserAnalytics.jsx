import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner, Progress, Badge } from '@heroui/react'
import { Users, UserPlus, UserCheck, UserX, TrendingUp, Activity, Calendar, RefreshCw, Eye, Shield } from 'lucide-react'
import { useError, useUserAnalytics } from '@hooks'

const UserAnalytics = () => {
  const { handleSuccess, handleError } = useError()
  const {
    analyticsData,
    loading,
    isLoading,
    error,
    hasError,
    getOverview,
    getGeographicDistribution,
    getEngagementStats,
    getGrowthStats,
    refreshAll
  } = useUserAnalytics()

  const [refreshing, setRefreshing] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([getOverview(), getGeographicDistribution(), getEngagementStats(), getGrowthStats()])
      } catch (error) {
        handleError('Error al cargar estadísticas de usuarios')
      }
    }

    loadInitialData()
  }, [getOverview, getGeographicDistribution, getEngagementStats, getGrowthStats, handleError])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshAll()
      handleSuccess('Estadísticas de usuarios actualizadas')
    } catch (error) {
      handleError('Error al actualizar estadísticas')
    } finally {
      setRefreshing(false)
    }
  }

  // Crear datos adaptados del hook para compatibilidad con el UI existente
  const userStats = {
    totals: {
      registered: analyticsData.overview?.totalUsers || 0,
      active: analyticsData.engagement?.activeUsers || 0,
      verified: analyticsData.overview?.verifiedUsers || 0,
      pending: analyticsData.overview?.pendingUsers || 0,
      blocked: analyticsData.overview?.blockedUsers || 0,
      incomplete: analyticsData.overview?.incompleteProfiles || 0
    },
    registrations: {
      today: analyticsData.growth?.today || 0,
      thisWeek: analyticsData.growth?.thisWeek || 0,
      thisMonth: analyticsData.growth?.thisMonth || 0,
      growth: analyticsData.growth?.growthRate || 0
    },
    demographics: {
      ageGroups: analyticsData.overview?.ageDistribution || {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46+': 0
      },
      locations: analyticsData.geographic?.locations || {
        Bogotá: 0,
        Medellín: 0,
        Cali: 0,
        Otros: 0
      }
    },
    activity: {
      dailyActive: analyticsData.engagement?.dailyActive || 0,
      weeklyActive: analyticsData.engagement?.weeklyActive || 0,
      monthlyActive: analyticsData.engagement?.monthlyActive || 0,
      avgSessionTime: analyticsData.engagement?.avgSessionTime || '0 min'
    }
  }

  if (isLoading && !analyticsData.overview) {
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
          <h2 className='text-xl font-semibold text-foreground mb-1'>Estadísticas de Usuarios</h2>
          <p className='text-sm text-default-500'>Análisis demográfico y de actividad</p>
        </div>
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          onPress={handleRefresh}
          isLoading={refreshing}
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          aria-label='Actualizar estadísticas de usuarios'>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Resumen de usuarios */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{userStats.totals.registered.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Total Registrados</p>
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
                <p className='text-lg font-bold text-foreground'>{userStats.totals.active.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Usuarios Activos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <UserCheck className='w-4 h-4 text-purple-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{userStats.totals.verified.toLocaleString()}</p>
                <p className='text-xs text-default-500'>Verificados</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <UserPlus className='w-4 h-4 text-orange-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{userStats.registrations.today}</p>
                <p className='text-xs text-default-500'>Registros Hoy</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Estadísticas de registro */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-5 h-5 text-green-400' />
            <h3 className='text-lg font-semibold text-foreground'>Crecimiento de Usuarios</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-400'>{userStats.registrations.today}</p>
              <p className='text-sm text-default-500'>Hoy</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-blue-400'>{userStats.registrations.thisWeek}</p>
              <p className='text-sm text-default-500'>Esta Semana</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-purple-400'>{userStats.registrations.thisMonth}</p>
              <p className='text-sm text-default-500'>Este Mes</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1'>
                <TrendingUp className='w-4 h-4 text-green-400' />
                <p className='text-2xl font-bold text-green-400'>+{userStats.registrations.growth}%</p>
              </div>
              <p className='text-sm text-default-500'>Crecimiento</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estado de usuarios */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Estado de Usuarios</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-foreground'>Verificados</span>
                </div>
                <span className='text-sm font-medium text-foreground'>{userStats.totals.verified}</span>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                  <span className='text-sm text-foreground'>Pendientes</span>
                </div>
                <span className='text-sm font-medium text-foreground'>{userStats.totals.pending}</span>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                  <span className='text-sm text-foreground'>Incompletos</span>
                </div>
                <span className='text-sm font-medium text-foreground'>{userStats.totals.incomplete}</span>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                  <span className='text-sm text-foreground'>Bloqueados</span>
                </div>
                <span className='text-sm font-medium text-foreground'>{userStats.totals.blocked}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Actividad</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Activos diarios</span>
                <span className='text-sm font-medium text-green-400'>{userStats.activity.dailyActive}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Activos semanales</span>
                <span className='text-sm font-medium text-blue-400'>{userStats.activity.weeklyActive}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Activos mensuales</span>
                <span className='text-sm font-medium text-purple-400'>{userStats.activity.monthlyActive}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Tiempo promedio</span>
                <span className='text-sm font-medium text-foreground'>{userStats.activity.avgSessionTime}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Demografía */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Grupos de Edad</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(userStats.demographics.ageGroups).map(([age, percentage]) => (
                <div key={age} className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-foreground'>{age} años</span>
                    <span className='text-sm text-default-500'>{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    color='primary'
                    className='max-w-full'
                    aria-label={`Distribución de usuarios por edad ${age} años: ${percentage}%`}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Ubicaciones</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(userStats.demographics.locations).map(([location, percentage]) => (
                <div key={location} className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-foreground'>{location}</span>
                    <span className='text-sm text-default-500'>{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    color='secondary'
                    className='max-w-full'
                    aria-label={`Distribución de usuarios por ubicación ${location}: ${percentage}%`}
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

export default UserAnalytics
