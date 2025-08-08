import { useState, useMemo } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Progress } from '@heroui/react'
import { Server, Database, Users, Heart, RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useApiStatus, useError } from '@hooks'

const GeneralAnalytics = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { handleSuccess, handleError } = useError()

  // Hook para estado de la API
  const apiStatusOptions = useMemo(
    () => ({
      autoRefresh: true,
      refreshInterval: 30000,
      timeout: 5000,
      showErrors: false,
      useCache: true
    }),
    []
  )

  const { data: statusData, loading, error, lastUpdated, refresh } = useApiStatus(apiStatusOptions)

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
      handleSuccess('Estadísticas actualizadas correctamente')
    } catch (err) {
      handleError('Error al actualizar las estadísticas')
    } finally {
      setRefreshing(false)
    }
  }

  // Datos mock para estadísticas generales cuando no hay datos de la API
  const mockStats = {
    system: {
      status: 'healthy',
      uptime: '15 días, 8 horas',
      version: '1.2.0',
      lastDeploy: '2024-01-15 14:30:00'
    },
    database: {
      status: 'connected',
      responseTime: '45ms',
      connections: 23,
      queries: 1247
    },
    performance: {
      memoryUsage: 68,
      cpuUsage: 32,
      diskUsage: 45,
      responseTime: 180
    },
    totals: {
      users: 1847,
      activeUsers: 245,
      matches: 3421,
      events: 89
    }
  }

  const stats = statusData || mockStats

  // Determinar el estado del sistema
  const getSystemStatus = () => {
    if (error) return { color: 'danger', label: 'Error', icon: AlertCircle }
    if (loading || refreshing) return { color: 'warning', label: 'Cargando', icon: Clock }
    return { color: 'success', label: 'Operativo', icon: CheckCircle }
  }

  const systemStatus = getSystemStatus()

  return (
    <div className='space-y-6'>
      {/* Header compacto con estado del sistema */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Chip variant='flat' color={systemStatus.color} startContent={<systemStatus.icon className='w-4 h-4' />} size='sm'>
            {systemStatus.label}
          </Chip>
          <span className='text-sm text-default-500'>Sistema operativo desde hace {stats.system?.uptime || 'N/A'}</span>
        </div>
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          onPress={handleRefresh}
          isLoading={refreshing}
          size='sm'
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Cards principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Estado del Sistema */}
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                <Server className='w-4 h-4 text-green-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>Sistema</p>
                <p className='text-xs text-default-500'>Estado general</p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Uptime:</span>
                <span className='text-xs text-foreground font-medium'>{stats.system?.uptime || 'N/A'}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Versión:</span>
                <span className='text-xs text-foreground font-medium'>{stats.system?.version || 'N/A'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Base de Datos */}
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Database className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>Base de Datos</p>
                <p className='text-xs text-default-500'>Conexiones activas</p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Tiempo resp.:</span>
                <span className='text-xs text-foreground font-medium'>{stats.database?.responseTime || 'N/A'}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Conexiones:</span>
                <span className='text-xs text-foreground font-medium'>{stats.database?.connections || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Usuarios Activos */}
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-purple-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>Usuarios</p>
                <p className='text-xs text-default-500'>Registrados / Activos</p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Total:</span>
                <span className='text-xs text-foreground font-medium'>{stats.totals?.users || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Activos:</span>
                <span className='text-xs text-purple-400 font-medium'>{stats.totals?.activeUsers || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Matches y Eventos */}
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
                <Heart className='w-4 h-4 text-pink-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-foreground'>Actividad</p>
                <p className='text-xs text-default-500'>Matches y eventos</p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Matches:</span>
                <span className='text-xs text-foreground font-medium'>{stats.totals?.matches || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-default-500'>Eventos:</span>
                <span className='text-xs text-foreground font-medium'>{stats.totals?.events || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Rendimiento del Sistema */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-5 h-5 text-blue-400' />
            <h3 className='text-lg font-semibold text-foreground'>Rendimiento del Sistema</h3>
          </div>
        </CardHeader>
        <CardBody className='pt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* Uso de Memoria */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Memoria</span>
                <span className='text-sm text-default-500'>{stats.performance?.memoryUsage || 0}%</span>
              </div>
              <Progress
                value={stats.performance?.memoryUsage || 0}
                color={stats.performance?.memoryUsage > 80 ? 'danger' : stats.performance?.memoryUsage > 60 ? 'warning' : 'success'}
                className='max-w-full'
                aria-label={`Uso de memoria: ${stats.performance?.memoryUsage || 0}%`}
              />
            </div>

            {/* Uso de CPU */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>CPU</span>
                <span className='text-sm text-default-500'>{stats.performance?.cpuUsage || 0}%</span>
              </div>
              <Progress
                value={stats.performance?.cpuUsage || 0}
                color={stats.performance?.cpuUsage > 80 ? 'danger' : stats.performance?.cpuUsage > 60 ? 'warning' : 'success'}
                className='max-w-full'
                aria-label={`Uso de CPU: ${stats.performance?.cpuUsage || 0}%`}
              />
            </div>

            {/* Uso de Disco */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Disco</span>
                <span className='text-sm text-default-500'>{stats.performance?.diskUsage || 0}%</span>
              </div>
              <Progress
                value={stats.performance?.diskUsage || 0}
                color={stats.performance?.diskUsage > 80 ? 'danger' : stats.performance?.diskUsage > 60 ? 'warning' : 'success'}
                className='max-w-full'
                aria-label={`Uso de disco: ${stats.performance?.diskUsage || 0}%`}
              />
            </div>

            {/* Tiempo de Respuesta */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Respuesta</span>
                <span className='text-sm text-default-500'>{stats.performance?.responseTime || 0}ms</span>
              </div>
              <Progress
                value={Math.min((stats.performance?.responseTime || 0) / 10, 100)}
                color={stats.performance?.responseTime > 500 ? 'danger' : stats.performance?.responseTime > 200 ? 'warning' : 'success'}
                className='max-w-full'
                aria-label={`Tiempo de respuesta: ${stats.performance?.responseTime || 0}ms`}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información adicional */}
      {lastUpdated && (
        <div className='text-center'>
          <p className='text-xs text-default-500'>Última actualización: {new Date(lastUpdated).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export default GeneralAnalytics
