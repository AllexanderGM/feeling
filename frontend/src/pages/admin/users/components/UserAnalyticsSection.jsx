import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader, Divider, Button, Chip, Progress, Spinner } from '@heroui/react'
import {
  BarChart3,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Heart,
  Tag,
  Settings2,
  RefreshCw,
  Activity,
  Globe,
  UserCheck,
  Star,
  Clock,
  Zap
} from 'lucide-react'
import { userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'

/**
 * Sección de analíticas y métricas de usuarios
 */
const UserAnalyticsSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState({
    overview: {},
    userMetrics: {},
    topUsers: [],
    attributeStats: {},
    interestsStats: {},
    tagsStats: {}
  })

  // Cargar todas las analíticas completas
  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userAnalyticsService.getCompleteAnalytics()
      setAnalytics(data)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'load_user_analytics', 'Error loading analytics admin', { error })
      onError?.('Error al cargar analíticas')
    } finally {
      setLoading(false)
    }
  }, [onError])

  // Refrescar datos
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadAnalytics()
      onSuccess?.('Analíticas actualizadas')
    } catch (error) {
      onError?.('Error al actualizar analíticas')
    } finally {
      setRefreshing(false)
    }
  }, [loadAnalytics, onSuccess, onError])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header con estilo similar al Profile */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-4'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-3'>
              <div className='w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center'>
                <BarChart3 className='w-5 h-5 text-primary-400' />
              </div>
              <div className='text-center sm:text-left'>
                <h2 className='text-lg font-semibold text-gray-200'>Analíticas Completas</h2>
                <p className='text-sm text-gray-400'>Métricas y estadísticas detalladas del sistema</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='bordered'
                className='border-gray-600 text-gray-300'
                startContent={<RefreshCw className='h-4 w-4' />}
                onPress={handleRefresh}
                isLoading={refreshing}>
                Actualizar
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Métricas Principales - Grid de 4 columnas */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-gray-800/30 border-gray-700/50'>
          <CardBody className='flex flex-row items-center gap-4 p-4'>
            <div className='w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center'>
              <Users className='h-6 w-6 text-primary-400' />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-400'>Total usuarios</p>
              <p className='text-2xl font-bold text-gray-200'>{analytics.userMetrics?.userTabsCount?.total || 0}</p>
              <p className='text-xs text-success-400'>+{analytics.userMetrics?.growthStats?.usersLast30Days || 0} últimos 30 días</p>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/30 border-gray-700/50'>
          <CardBody className='flex flex-row items-center gap-4 p-4'>
            <div className='w-12 h-12 bg-success-500/20 rounded-full flex items-center justify-center'>
              <UserCheck className='h-6 w-6 text-success-400' />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-400'>Usuarios activos</p>
              <p className='text-2xl font-bold text-gray-200'>{analytics.userMetrics?.userTabsCount?.active || 0}</p>
              <p className='text-xs text-gray-400'>
                {analytics.userMetrics?.userTabsCount?.total > 0
                  ? (
                      ((analytics.userMetrics?.userTabsCount?.active || 0) / (analytics.userMetrics?.userTabsCount?.total || 1)) *
                      100
                    ).toFixed(1)
                  : 0}
                % del total
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/30 border-gray-700/50'>
          <CardBody className='flex flex-row items-center gap-4 p-4'>
            <div className='w-12 h-12 bg-warning-500/20 rounded-full flex items-center justify-center'>
              <Calendar className='h-6 w-6 text-warning-400' />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-400'>Nuevos hoy</p>
              <p className='text-2xl font-bold text-gray-200'>{analytics.userMetrics?.growthStats?.usersLast24Hours || 0}</p>
              <p className='text-xs text-gray-400'>{analytics.userMetrics?.growthStats?.usersLast7Days || 0} últimos 7 días</p>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/30 border-gray-700/50'>
          <CardBody className='flex flex-row items-center gap-4 p-4'>
            <div className='w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center'>
              <Activity className='h-6 w-6 text-secondary-400' />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-400'>Engagement</p>
              <p className='text-2xl font-bold text-gray-200'>{analytics.userMetrics?.engagementStats?.averageCompletionRate || 0}%</p>
              <p className='text-xs text-gray-400'>
                {analytics.userMetrics?.engagementStats?.completeProfiles || 0}/{analytics.userMetrics?.engagementStats?.totalUsers || 0}{' '}
                completos
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Distribución por Estado */}
      <Card className='w-full bg-gray-800/30 border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <TrendingUp className='w-5 h-5 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Distribución por Estado</h3>
              <p className='text-sm text-gray-400'>Análisis detallado de usuarios por categoría</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[
              { key: 'active', label: 'Activos', color: 'success', icon: UserCheck },
              { key: 'pending', label: 'Pendientes', color: 'warning', icon: Clock },
              { key: 'incomplete', label: 'Incompletos', color: 'primary', icon: Users },
              { key: 'unverified', label: 'No verificados', color: 'secondary', icon: Settings2 },
              { key: 'nonApproved', label: 'No aprobados', color: 'danger', icon: Users },
              { key: 'deactivated', label: 'Desactivados', color: 'default', icon: Users }
            ].map(status => {
              const value = analytics.userMetrics?.userTabsCount?.[status.key] || 0
              const totalUsers = analytics.userMetrics?.userTabsCount?.total || 1
              const percentage = totalUsers > 0 ? (value / totalUsers) * 100 : 0
              const IconComponent = status.icon

              return (
                <div key={status.key} className='flex flex-col gap-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <IconComponent className='w-4 h-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-300'>{status.label}</span>
                    </div>
                    <Chip size='sm' color={status.color} variant='flat' className='text-xs'>
                      {value}
                    </Chip>
                  </div>
                  <Progress
                    value={percentage}
                    color={status.color}
                    size='sm'
                    showValueLabel={true}
                    formatOptions={{ style: 'percent', maximumFractionDigits: 1 }}
                    aria-label={`${status.label}: ${percentage.toFixed(1)}%`}
                    className='w-full'
                  />
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Distribución Geográfica */}
      <Card className='w-full bg-gray-800/30 border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center'>
              <Globe className='w-5 h-5 text-emerald-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Distribución Geográfica</h3>
              <p className='text-sm text-gray-400'>Análisis de ubicación de usuarios</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-3'>
                <MapPin className='w-4 h-4 text-gray-400' />
                <h4 className='font-medium text-gray-300'>Top Países</h4>
              </div>
              <div className='space-y-3'>
                {analytics.userMetrics?.geographicDistribution?.topLocations?.topCountries ? (
                  Object.entries(analytics.userMetrics.geographicDistribution.topLocations.topCountries)
                    .slice(0, 5)
                    .map(([countryName, count], index) => {
                      const totalUsers = analytics.userMetrics?.userTabsCount?.total || 1
                      const percentage = (count / totalUsers) * 100
                      return (
                        <div key={countryName} className='flex items-center justify-between p-3 bg-gray-700/30 rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <div className='w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center'>
                              <span className='text-xs font-bold text-primary-400'>#{index + 1}</span>
                            </div>
                            <span className='text-sm text-gray-300'>{countryName}</span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span className='text-sm font-bold text-gray-200'>{count}</span>
                            <Progress
                              value={percentage}
                              size='sm'
                              className='w-20'
                              color='primary'
                              aria-label={`${countryName}: ${count} usuarios`}
                            />
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <Globe className='w-8 h-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No hay datos geográficos disponibles</p>
                  </div>
                )}
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-3'>
                <MapPin className='w-4 h-4 text-gray-400' />
                <h4 className='font-medium text-gray-300'>Top Ciudades</h4>
              </div>
              <div className='space-y-3'>
                {analytics.userMetrics?.geographicDistribution?.topLocations?.topCities ? (
                  Object.entries(analytics.userMetrics.geographicDistribution.topLocations.topCities)
                    .slice(0, 5)
                    .map(([cityName, count], index) => {
                      const totalUsers = analytics.userMetrics?.userTabsCount?.total || 1
                      const percentage = (count / totalUsers) * 100
                      return (
                        <div key={cityName} className='flex items-center justify-between p-3 bg-gray-700/30 rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <div className='w-6 h-6 bg-secondary-500/20 rounded-full flex items-center justify-center'>
                              <span className='text-xs font-bold text-secondary-400'>#{index + 1}</span>
                            </div>
                            <span className='text-sm text-gray-300'>{cityName}</span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span className='text-sm font-bold text-gray-200'>{count}</span>
                            <Progress
                              value={percentage}
                              size='sm'
                              className='w-20'
                              color='secondary'
                              aria-label={`${cityName}: ${count} usuarios`}
                            />
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <MapPin className='w-8 h-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No hay datos de ciudades disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas de Contenido - Grid 2x2 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Atributos */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <Settings2 className='w-5 h-5 text-orange-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Atributos</h3>
                <p className='text-sm text-gray-400'>Características de usuarios</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Total atributos</span>
                <span className='font-bold text-gray-200'>{analytics.attributeStatistics?.totalAttributes || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Activos</span>
                <span className='font-bold text-success-400'>{analytics.attributeStatistics?.activeAttributes || 0}</span>
              </div>
              {(analytics.attributeStatistics?.inactiveAttributes || 0) > 0 && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-400'>Inactivos</span>
                  <span className='font-bold text-gray-400'>{analytics.attributeStatistics?.inactiveAttributes}</span>
                </div>
              )}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Tipos disponibles</span>
                <Chip size='sm' color='primary' variant='flat' className='text-xs'>
                  {analytics.attributeStatistics?.availableTypes?.length || 0}
                </Chip>
              </div>
              <Divider className='bg-gray-700/50' />

              {/* Tipos más utilizados - versión compacta */}
              <div className='bg-gray-700/30 rounded-lg p-3'>
                <p className='text-xs text-gray-500 mb-2'>Tipos principales:</p>
                <div className='flex flex-wrap gap-1'>
                  {analytics.attributeStatistics?.distributionByType
                    ? Object.entries(analytics.attributeStatistics.distributionByType)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([type, count]) => {
                          const typeLabel = type
                            .replace(/_/g, ' ')
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')

                          return (
                            <Chip key={type} size='sm' color='warning' variant='flat' className='text-xs'>
                              {typeLabel} ({count})
                            </Chip>
                          )
                        })
                    : null}
                </div>
              </div>

              {/* Próximas versiones - versión compacta */}
              <div className='bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg p-3'>
                <div className='flex items-start gap-2 mb-2'>
                  <Clock className='w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-orange-300'>Próximas versiones</p>
                    <p className='text-xs text-gray-400'>Análisis detallado próximamente</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Intereses */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center'>
                <Heart className='w-5 h-5 text-pink-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Intereses</h3>
                <p className='text-sm text-gray-400'>Categorías de preferencias</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Total categorías</span>
                <span className='font-bold text-gray-200'>{analytics.interestsStatistics?.totalCategories || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Activas</span>
                <span className='font-bold text-success-400'>{analytics.interestsStatistics?.activeCategories || 0}</span>
              </div>
              {(analytics.interestsStatistics?.inactiveCategories || 0) > 0 && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-400'>Inactivas</span>
                  <span className='font-bold text-gray-400'>{analytics.interestsStatistics?.inactiveCategories}</span>
                </div>
              )}

              <Divider className='bg-gray-700/50' />

              {/* Categorías actuales */}
              <div className='space-y-3'>
                <p className='text-xs text-gray-500 font-medium'>Categorías principales:</p>
                <div className='flex flex-wrap gap-1'>
                  {analytics.interestsStatistics?.topCategories?.slice(0, 3).map((category, index) => (
                    <Chip key={index} size='sm' color='danger' variant='flat' className='text-xs'>
                      {category}
                    </Chip>
                  )) || (
                    <div className='flex flex-wrap gap-1'>
                      <Chip size='sm' color='danger' variant='flat' className='text-xs'>
                        Essence
                      </Chip>
                      <Chip size='sm' color='danger' variant='flat' className='text-xs'>
                        Rouse
                      </Chip>
                      <Chip size='sm' color='danger' variant='flat' className='text-xs'>
                        Spirit
                      </Chip>
                    </div>
                  )}
                </div>
              </div>

              {/* Próximas versiones */}
              <div className='bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-3 mt-4'>
                <div className='flex items-start gap-2 mb-2'>
                  <Clock className='w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-pink-300'>Próximas versiones</p>
                    <p className='text-xs text-gray-400'>Análisis avanzado próximamente:</p>
                  </div>
                </div>
                <div className='space-y-1 text-xs text-gray-500 ml-6'>
                  <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 bg-pink-400 rounded-full'></div>
                    <span>Distribución detallada por categoría</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 bg-pink-400 rounded-full'></div>
                    <span>Tendencias de crecimiento</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 bg-pink-400 rounded-full'></div>
                    <span>Métricas de engagement</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 bg-pink-400 rounded-full'></div>
                    <span>Análisis de compatibilidad</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tags */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Tag className='w-5 h-5 text-purple-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Tags</h3>
                <p className='text-sm text-gray-400'>Etiquetas de usuarios</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Total tags</span>
                <span className='font-bold text-gray-200'>{analytics.tagsStatistics?.totalTags || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Tags activos</span>
                <span className='font-bold text-success-400'>{analytics.tagsStatistics?.activeTags || 0}</span>
              </div>
              {(analytics.tagsStatistics?.unusedTags || 0) > 0 && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-400'>Tags sin uso</span>
                  <span className='font-bold text-warning-400'>{analytics.tagsStatistics?.unusedTags}</span>
                </div>
              )}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Usuarios con tags</span>
                <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                  {analytics.tagsStatistics?.uniqueUsersWithTags || 0}
                </Chip>
              </div>

              <Divider className='bg-gray-700/50' />

              {/* Métricas actuales */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-gray-500'>Promedio por usuario</span>
                  <span className='text-gray-400'>{analytics.tagsStatistics?.averageTagsPerUser?.toFixed(1) || '0.0'}</span>
                </div>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-gray-500'>Uso promedio</span>
                  <span className='text-gray-400'>{analytics.tagsStatistics?.averageUsageCount || 0}</span>
                </div>
              </div>

              {/* Tags destacados actuales */}
              <div className='bg-gray-700/30 rounded-lg p-3'>
                <p className='text-xs text-gray-500 mb-2'>Tags populares:</p>
                <div className='flex flex-wrap gap-1'>
                  <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                    viajes
                  </Chip>
                  <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                    música
                  </Chip>
                  <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                    deportes
                  </Chip>
                  <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                    cocina
                  </Chip>
                </div>
              </div>

              {/* Próximas versiones - versión compacta */}
              <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3'>
                <div className='flex items-start gap-2 mb-2'>
                  <Clock className='w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-purple-300'>Próximas versiones</p>
                    <p className='text-xs text-gray-400'>Análisis avanzado próximamente</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Top Usuarios */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center'>
                <Star className='w-5 h-5 text-yellow-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Top Usuarios</h3>
                <p className='text-sm text-gray-400'>Rankings del sistema</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='text-center py-4'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center'>
                    <Clock className='w-6 h-6 text-blue-400' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-gray-200'>En Desarrollo</p>
                    <p className='text-xs text-gray-400'>Rankings disponibles próximamente</p>
                  </div>
                </div>
              </div>

              {/* Próximos rankings */}
              <div className='bg-gray-700/30 rounded-lg p-3'>
                <p className='text-xs text-gray-500 mb-2'>Próximos rankings:</p>
                <div className='flex flex-wrap gap-1'>
                  <Chip size='sm' color='primary' variant='flat' className='text-xs'>
                    Más activos
                  </Chip>
                  <Chip size='sm' color='secondary' variant='flat' className='text-xs'>
                    Más visitados
                  </Chip>
                  <Chip size='sm' color='success' variant='flat' className='text-xs'>
                    Más matches
                  </Chip>
                </div>
              </div>

              {/* Próximas versiones */}
              <div className='bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3'>
                <div className='flex items-start gap-2'>
                  <Clock className='w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-yellow-300'>Próximas versiones</p>
                    <p className='text-xs text-gray-400'>Sistema de rankings próximamente</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sección adicional con métricas de crecimiento y retención */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Estadísticas de Crecimiento */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
                <TrendingUp className='w-5 h-5 text-green-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Crecimiento</h3>
                <p className='text-sm text-gray-400'>Tendencias de registro</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Últimas 24 horas</span>
                <span className='font-bold text-gray-200'>{analytics.userMetrics?.growthStats?.usersLast24Hours || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Últimos 7 días</span>
                <span className='font-bold text-gray-200'>{analytics.userMetrics?.growthStats?.usersLast7Days || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Últimos 30 días</span>
                <Chip size='sm' color='success' variant='flat' className='text-xs'>
                  {analytics.userMetrics?.growthStats?.usersLast30Days || 0}
                </Chip>
              </div>
              <Divider className='bg-gray-700/50' />
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-500'>Activos (7 días)</span>
                <span className='text-gray-400'>{analytics.userMetrics?.growthStats?.activeUsersLast7Days || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Estadísticas de Retención y Calidad */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30'>
              <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Activity className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-200'>Retención y Calidad</h3>
                <p className='text-sm text-gray-400'>Fidelidad y completitud</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Retención 7 días</span>
                <span className='font-bold text-blue-400'>{analytics.userMetrics?.growthStats?.retentionRate7Days || 0}%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Retención 30 días</span>
                <span className='font-bold text-blue-400'>{analytics.userMetrics?.growthStats?.retentionRate30Days || 0}%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Perfiles completos</span>
                <span className='font-bold text-success-400'>{analytics.userMetrics?.engagementStats?.completeProfiles || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Usuarios verificados</span>
                <span className='font-bold text-success-400'>{analytics.userMetrics?.engagementStats?.verifiedUsers || 0}</span>
              </div>
              <Divider className='bg-gray-700/50' />
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-500'>Tasa completitud</span>
                <span className='text-gray-400'>{analytics.userMetrics?.engagementStats?.averageCompletionRate || 0}%</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-500'>Tasa verificación</span>
                <span className='text-gray-400'>{analytics.userMetrics?.engagementStats?.averageVerificationRate || 0}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default UserAnalyticsSection
