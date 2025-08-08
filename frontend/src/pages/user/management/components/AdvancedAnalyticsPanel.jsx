import { memo, useEffect, useState } from 'react'
import { Card, CardBody, Progress, Chip, Button, Spinner, Tabs, Tab } from '@heroui/react'
import { TrendingUp, BarChart3, Globe, Crown, RefreshCw, Calendar, MapPin, Users, Activity, Award } from 'lucide-react'
import { useUserAnalytics } from '@hooks'

const AdvancedAnalyticsPanel = memo(() => {
  const { analyticsData, loading, error, getOverview, getGeographicDistribution, getEngagementStats, getGrowthStats, refreshAll } =
    useUserAnalytics()

  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    // Cargar datos iniciales
    getOverview()
    getGeographicDistribution()
    getEngagementStats()
    getGrowthStats('monthly')
  }, [])

  const handleRefresh = async () => {
    await refreshAll()
  }

  if (loading.overview && !analyticsData.overview) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-6 flex items-center justify-center'>
          <div className='flex items-center gap-3'>
            <Spinner size='lg' color='primary' />
            <span className='text-gray-300'>Cargando analytics...</span>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error.overview && !analyticsData.overview) {
    return (
      <Card className='w-full bg-red-900/20 border border-red-700/50'>
        <CardBody className='p-6'>
          <div className='text-center'>
            <p className='text-red-400 mb-4'>Error cargando analytics: {error.overview}</p>
            <Button color='danger' variant='flat' onPress={handleRefresh}>
              Reintentar
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header con botón de refresh */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold text-gray-200'>Analytics del Sistema</h2>
          <p className='text-sm text-gray-400'>Métricas detalladas y estadísticas completas</p>
        </div>
        <Button
          color='primary'
          variant='flat'
          startContent={<RefreshCw className='w-4 h-4' />}
          onPress={handleRefresh}
          isLoading={loading.overview}>
          Actualizar
        </Button>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        color='primary'
        variant='underlined'
        classNames={{
          tabList: 'bg-gray-800/40 backdrop-blur-sm rounded-lg p-1',
          cursor: 'bg-primary-500/20',
          tab: 'text-gray-300 data-[selected=true]:text-white'
        }}>
        <Tab key='overview' title='Overview'>
          <OverviewPanel data={analyticsData.overview} loading={loading.overview} />
        </Tab>
        <Tab key='geographic' title='Geográfico'>
          <GeographicPanel data={analyticsData.geographic} loading={loading.geographic} />
        </Tab>
        <Tab key='engagement' title='Engagement'>
          <EngagementPanel data={analyticsData.engagement} loading={loading.engagement} />
        </Tab>
        <Tab key='growth' title='Crecimiento'>
          <GrowthPanel data={analyticsData.growth} loading={loading.growth} />
        </Tab>
      </Tabs>
    </div>
  )
})

// Panel de Overview
const OverviewPanel = memo(({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-6 flex items-center justify-center'>
          <Spinner size='md' color='primary' />
        </CardBody>
      </Card>
    )
  }

  const { systemCounts, qualityMetrics } = data

  return (
    <div className='space-y-6'>
      {/* Estadísticas de Contenido - Grid 2x2 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Atributos */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <Award className='w-5 h-5 text-orange-400' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-100'>Atributos de Usuario</h3>
                <p className='text-xs text-gray-400'>Distribución y análisis</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-4'>
              <div className='bg-gray-800/60 border border-orange-700/30 rounded-lg p-3 text-center'>
                <div className='text-2xl font-bold text-orange-400'>{systemCounts?.totalUsers || 0}</div>
                <div className='text-xs text-gray-400'>Total Usuarios</div>
              </div>
              <div className='bg-gray-800/60 border border-green-700/30 rounded-lg p-3 text-center'>
                <div className='text-2xl font-bold text-green-400'>{systemCounts?.completeProfiles || 0}</div>
                <div className='text-xs text-gray-400'>Perfiles Completos</div>
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-gray-300'>Tasa de Completitud</span>
                <Chip size='sm' color='warning' variant='flat'>
                  {qualityMetrics?.completionRate || 0}%
                </Chip>
              </div>
              <Progress value={qualityMetrics?.completionRate || 0} color='warning' size='sm' />
            </div>
          </CardBody>
        </Card>

        {/* Intereses */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Activity className='w-5 h-5 text-purple-400' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-100'>Intereses de Usuario</h3>
                <p className='text-xs text-gray-400'>Próximas versiones</p>
              </div>
            </div>

            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Activity className='w-8 h-8 text-purple-400' />
              </div>
              <h4 className='text-base font-semibold text-gray-200 mb-2'>Sistema de Intereses</h4>
              <p className='text-sm text-gray-400 mb-4'>Categorización avanzada de preferencias</p>
              <Chip color='secondary' variant='flat' size='sm'>
                Próxima versión
              </Chip>
            </div>
          </CardBody>
        </Card>

        {/* Tags */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center'>
                <BarChart3 className='w-5 h-5 text-cyan-400' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-100'>Sistema de Tags</h3>
                <p className='text-xs text-gray-400'>Próximas versiones</p>
              </div>
            </div>

            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <BarChart3 className='w-8 h-8 text-cyan-400' />
              </div>
              <h4 className='text-base font-semibold text-gray-200 mb-2'>Tags Personalizados</h4>
              <p className='text-sm text-gray-400 mb-4'>Etiquetado dinámico de usuarios</p>
              <Chip color='secondary' variant='flat' size='sm'>
                Próxima versión
              </Chip>
            </div>
          </CardBody>
        </Card>

        {/* Top Usuarios */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center'>
                <Crown className='w-5 h-5 text-yellow-400' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-100'>Top Usuarios</h3>
                <p className='text-xs text-gray-400'>Rankings y destacados</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-4'>
              <div className='bg-gray-800/60 border border-green-700/30 rounded-lg p-3 text-center'>
                <div className='text-2xl font-bold text-green-400'>{systemCounts?.verifiedUsers || 0}</div>
                <div className='text-xs text-gray-400'>Verificados</div>
              </div>
              <div className='bg-gray-800/60 border border-blue-700/30 rounded-lg p-3 text-center'>
                <div className='text-2xl font-bold text-blue-400'>{systemCounts?.activeUsersLast7Days || 0}</div>
                <div className='text-xs text-gray-400'>Activos (7d)</div>
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-gray-300'>Tasa de Verificación</span>
                <Chip size='sm' color='success' variant='flat'>
                  {qualityMetrics?.verificationRate || 0}%
                </Chip>
              </div>
              <Progress value={qualityMetrics?.verificationRate || 0} color='success' size='sm' />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Métricas de Crecimiento y Retención */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center'>
              <TrendingUp className='w-5 h-5 text-indigo-400' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-100'>Métricas de Crecimiento</h3>
              <p className='text-xs text-gray-400'>Análisis de tendencias y retención</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Tasa Verificación</span>
                <Chip size='sm' color={qualityMetrics?.verificationRate >= 70 ? 'success' : 'warning'} variant='flat'>
                  {qualityMetrics?.verificationRate || 0}%
                </Chip>
              </div>
              <Progress value={qualityMetrics?.verificationRate || 0} color='success' size='sm' />
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Tasa Aprobación</span>
                <Chip size='sm' color={qualityMetrics?.approvalRate >= 70 ? 'success' : 'warning'} variant='flat'>
                  {qualityMetrics?.approvalRate || 0}%
                </Chip>
              </div>
              <Progress value={qualityMetrics?.approvalRate || 0} color='primary' size='sm' />
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Tasa Completitud</span>
                <Chip size='sm' color={qualityMetrics?.completionRate >= 70 ? 'success' : 'warning'} variant='flat'>
                  {qualityMetrics?.completionRate || 0}%
                </Chip>
              </div>
              <Progress value={qualityMetrics?.completionRate || 0} color='warning' size='sm' />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

// Panel Geográfico
const GeographicPanel = memo(({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-6 flex items-center justify-center'>
          <Spinner size='md' color='primary' />
        </CardBody>
      </Card>
    )
  }

  const { topLocations } = data

  return (
    <div className='space-y-4'>
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <Globe className='w-4 h-4 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Distribución Geográfica</h3>
              <p className='text-xs text-gray-400'>Usuarios por ubicación</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Top Países */}
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <h4 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                <MapPin className='w-4 h-4' />
                Top Países
              </h4>
              <div className='space-y-2'>
                {Object.entries(topLocations?.topCountries || {})
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>{country}</span>
                      <Chip size='sm' color='primary' variant='flat'>
                        {count}
                      </Chip>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Ciudades */}
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <h4 className='text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2'>
                <MapPin className='w-4 h-4' />
                Top Ciudades
              </h4>
              <div className='space-y-2'>
                {Object.entries(topLocations?.topCities || {})
                  .slice(0, 5)
                  .map(([city, count]) => (
                    <div key={city} className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>{city}</span>
                      <Chip size='sm' color='success' variant='flat'>
                        {count}
                      </Chip>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

// Panel de Engagement
const EngagementPanel = memo(({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-6 flex items-center justify-center'>
          <Spinner size='md' color='primary' />
        </CardBody>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
              <Activity className='w-4 h-4 text-green-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas de Engagement</h3>
              <p className='text-xs text-gray-400'>Métricas básicas de actividad</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-center'>
              <div className='text-xl font-bold text-blue-400'>{data.totalUsers || 0}</div>
              <div className='text-xs text-gray-400'>Total Usuarios</div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-center'>
              <div className='text-xl font-bold text-green-400'>{data.verifiedUsers || 0}</div>
              <div className='text-xs text-gray-400'>Usuarios Verificados</div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-center'>
              <div className='text-xl font-bold text-purple-400'>{data.completeProfiles || 0}</div>
              <div className='text-xs text-gray-400'>Perfiles Completos</div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Tasa de Verificación</span>
                <Chip size='sm' color={data.averageVerificationRate >= 70 ? 'success' : 'warning'} variant='flat'>
                  {data.averageVerificationRate || 0}%
                </Chip>
              </div>
              <Progress value={data.averageVerificationRate || 0} color='success' size='sm' />
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Tasa de Completitud</span>
                <Chip size='sm' color={data.averageCompletionRate >= 70 ? 'success' : 'warning'} variant='flat'>
                  {data.averageCompletionRate || 0}%
                </Chip>
              </div>
              <Progress value={data.averageCompletionRate || 0} color='warning' size='sm' />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

// Panel de Crecimiento
const GrowthPanel = memo(({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-6 flex items-center justify-center'>
          <Spinner size='md' color='primary' />
        </CardBody>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center'>
              <TrendingUp className='w-4 h-4 text-indigo-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas de Crecimiento</h3>
              <p className='text-xs text-gray-400'>Métricas de crecimiento y retención</p>
            </div>
          </div>

          {/* Gráfico de crecimiento mejorado */}
          <div className='bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-600/40 rounded-xl p-5 mb-4 backdrop-blur-sm'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center'>
                <TrendingUp className='w-5 h-5 text-emerald-400' />
              </div>
              <div>
                <h4 className='text-base font-semibold text-gray-100'>Tendencia de Crecimiento</h4>
                <p className='text-xs text-gray-400'>Nuevos usuarios registrados</p>
              </div>
            </div>

            <div className='h-40 bg-gradient-to-b from-slate-900/40 to-slate-950/60 rounded-xl p-4 border border-slate-700/30 relative overflow-hidden'>
              {/* Gráfica de área mejorada */}
              <div className='relative h-full'>
                <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
                  <defs>
                    <linearGradient id='modernGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                      <stop offset='0%' stopColor='rgb(52 211 153)' stopOpacity='0.8' />
                      <stop offset='30%' stopColor='rgb(34 197 94)' stopOpacity='0.6' />
                      <stop offset='70%' stopColor='rgb(16 185 129)' stopOpacity='0.4' />
                      <stop offset='100%' stopColor='rgb(5 150 105)' stopOpacity='0.2' />
                    </linearGradient>

                    <filter id='glow'>
                      <feGaussianBlur stdDeviation='1' result='coloredBlur' />
                      <feMerge>
                        <feMergeNode in='coloredBlur' />
                        <feMergeNode in='SourceGraphic' />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Área de la montaña */}
                  <path
                    d={`M 0 100
                        L 0 ${100 - Math.max(15, Math.min(85, (data.usersLast24Hours || 0) * 8))}
                        Q 25 ${100 - Math.max(20, Math.min(80, (data.usersLast7Days || 0) * 4))} 50 ${100 - Math.max(20, Math.min(80, (data.usersLast7Days || 0) * 4))}
                        Q 75 ${100 - Math.max(25, Math.min(75, (data.usersLast30Days || 0) * 1.5))} 100 ${100 - Math.max(25, Math.min(75, (data.usersLast30Days || 0) * 1.5))}
                        L 100 100 Z`}
                    fill='url(#modernGradient)'
                    filter='url(#glow)'
                  />

                  {/* Línea superior brillante */}
                  <path
                    d={`M 0 ${100 - Math.max(15, Math.min(85, (data.usersLast24Hours || 0) * 8))}
                        Q 25 ${100 - Math.max(20, Math.min(80, (data.usersLast7Days || 0) * 4))} 50 ${100 - Math.max(20, Math.min(80, (data.usersLast7Days || 0) * 4))}
                        Q 75 ${100 - Math.max(25, Math.min(75, (data.usersLast30Days || 0) * 1.5))} 100 ${100 - Math.max(25, Math.min(75, (data.usersLast30Days || 0) * 1.5))}`}
                    stroke='rgb(52 211 153)'
                    strokeWidth='1.5'
                    fill='none'
                    filter='url(#glow)'
                  />
                </svg>

                {/* Puntos de datos mejorados */}
                <div className='absolute inset-0 flex items-end'>
                  <div className='flex justify-between w-full px-2'>
                    <div
                      className='flex flex-col items-center'
                      style={{ marginBottom: `${Math.max(15, Math.min(85, (data.usersLast24Hours || 0) * 8))}%` }}>
                      <div className='relative'>
                        <div className='w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50'></div>
                        <div className='absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30'></div>
                      </div>
                      <div className='mt-2 bg-slate-800/80 backdrop-blur-sm rounded-md px-2 py-1 border border-slate-600/40'>
                        <span className='text-xs text-emerald-300 font-semibold'>{data.usersLast24Hours || 0}</span>
                      </div>
                    </div>
                    <div
                      className='flex flex-col items-center'
                      style={{ marginBottom: `${Math.max(20, Math.min(80, (data.usersLast7Days || 0) * 4))}%` }}>
                      <div className='relative'>
                        <div className='w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50'></div>
                        <div className='absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30'></div>
                      </div>
                      <div className='mt-2 bg-slate-800/80 backdrop-blur-sm rounded-md px-2 py-1 border border-slate-600/40'>
                        <span className='text-xs text-green-300 font-semibold'>{data.usersLast7Days || 0}</span>
                      </div>
                    </div>
                    <div
                      className='flex flex-col items-center'
                      style={{ marginBottom: `${Math.max(25, Math.min(75, (data.usersLast30Days || 0) * 1.5))}%` }}>
                      <div className='relative'>
                        <div className='w-3 h-3 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50'></div>
                        <div className='absolute inset-0 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-30'></div>
                      </div>
                      <div className='mt-2 bg-slate-800/80 backdrop-blur-sm rounded-md px-2 py-1 border border-slate-600/40'>
                        <span className='text-xs text-teal-300 font-semibold'>{data.usersLast30Days || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etiquetas del eje X mejoradas */}
              <div className='absolute bottom-2 left-0 right-0 flex justify-between px-4'>
                <div className='flex flex-col items-center'>
                  <span className='text-xs text-emerald-400 font-medium'>24h</span>
                  <span className='text-xs text-gray-500'>Últimas</span>
                </div>
                <div className='flex flex-col items-center'>
                  <span className='text-xs text-green-400 font-medium'>7d</span>
                  <span className='text-xs text-gray-500'>Últimos</span>
                </div>
                <div className='flex flex-col items-center'>
                  <span className='text-xs text-teal-400 font-medium'>30d</span>
                  <span className='text-xs text-gray-500'>Últimos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Usuarios activos mejorados */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div className='bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-600/30 rounded-xl p-4 backdrop-blur-sm'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center'>
                  <Activity className='w-4 h-4 text-indigo-400' />
                </div>
                <div>
                  <div className='text-xl font-bold text-indigo-300'>{data.activeUsersLast7Days || 0}</div>
                  <div className='text-xs text-indigo-400/80'>Activos últimos 7 días</div>
                </div>
              </div>
              <div className='w-full bg-indigo-900/30 rounded-full h-1.5'>
                <div
                  className='bg-gradient-to-r from-indigo-500 to-indigo-400 h-1.5 rounded-full transition-all duration-500'
                  style={{ width: `${Math.min(100, (data.activeUsersLast7Days || 0) * 10)}%` }}></div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-amber-900/40 to-orange-800/40 border border-amber-600/30 rounded-xl p-4 backdrop-blur-sm'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center'>
                  <Activity className='w-4 h-4 text-amber-400' />
                </div>
                <div>
                  <div className='text-xl font-bold text-amber-300'>{data.activeUsersLast30Days || 0}</div>
                  <div className='text-xs text-amber-400/80'>Activos últimos 30 días</div>
                </div>
              </div>
              <div className='w-full bg-amber-900/30 rounded-full h-1.5'>
                <div
                  className='bg-gradient-to-r from-amber-500 to-orange-400 h-1.5 rounded-full transition-all duration-500'
                  style={{ width: `${Math.min(100, (data.activeUsersLast30Days || 0) * 5)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Tasas de retención */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Retención 7 días</span>
                <Chip size='sm' color={data.retentionRate7Days >= 50 ? 'success' : 'warning'} variant='flat'>
                  {data.retentionRate7Days || 0}%
                </Chip>
              </div>
              <Progress value={data.retentionRate7Days || 0} color='success' size='sm' />
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-300'>Retención 30 días</span>
                <Chip size='sm' color={data.retentionRate30Days >= 30 ? 'success' : 'warning'} variant='flat'>
                  {data.retentionRate30Days || 0}%
                </Chip>
              </div>
              <Progress value={data.retentionRate30Days || 0} color='warning' size='sm' />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

AdvancedAnalyticsPanel.displayName = 'AdvancedAnalyticsPanel'
OverviewPanel.displayName = 'OverviewPanel'
GeographicPanel.displayName = 'GeographicPanel'
EngagementPanel.displayName = 'EngagementPanel'
GrowthPanel.displayName = 'GrowthPanel'

export default AdvancedAnalyticsPanel
