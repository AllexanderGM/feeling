import { useState, useMemo, useCallback } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Spinner,
  Progress,
  Badge,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { useApiStatus, useError } from '@hooks'
import { API_URL } from '@config/config'
import { Logger } from '@utils/logger.js'

const ApiStatus = () => {
  // Estados para funcionalidades adicionales
  const [pingResult, setPingResult] = useState(null)
  const [pingLoading, setPingLoading] = useState(false)
  const [cacheStats, setCacheStats] = useState(null)

  // Modal para detalles técnicos
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const { handleSuccess, handleInfo, handleWarning } = useError()

  // Memoizar opciones del hook para evitar re-renders
  const apiStatusOptions = useMemo(
    () => ({
      autoRefresh: false,
      refreshInterval: 30000,
      timeout: 5000,
      showErrors: true,
      useCache: true
    }),
    []
  )

  // Usar el hook con opciones memoizadas
  const {
    data: statusData,
    loading,
    error,
    lastUpdate,
    isAutoRefreshing,
    refresh,
    toggleAutoRefresh,
    ping,
    clearCache,
    overallHealth,
    serviceHealth,
    stats,
    isHealthy,
    hasData,
    hasError
  } = useApiStatus(apiStatusOptions)

  // Función para hacer ping con UI visual
  const handlePing = useCallback(async () => {
    setPingLoading(true)
    setPingResult(null)

    try {
      const result = await ping(2000)
      setPingResult(result)

      if (result.success) {
        handleSuccess(`Ping exitoso: ${result.responseTime}ms`)
      } else {
        handleWarning(`Ping falló: ${result.error}`)
      }
    } catch (error) {
      setPingResult({
        success: false,
        error: error.message,
        responseTime: null,
        timestamp: new Date().toISOString()
      })
      handleWarning(`Error en ping: ${error.message}`)
    } finally {
      setPingLoading(false)
    }
  }, [ping, handleSuccess, handleWarning])

  // Función para limpiar cache con notificación
  const handleClearCacheAndRefresh = useCallback(async () => {
    try {
      clearCache()
      handleInfo('Cache limpiado')
      const result = await refresh()
      if (result.success) {
        handleSuccess('Estado actualizado después de limpiar cache')
      }
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'clear_cache', 'Error al limpiar cache', { error })
    }
  }, [clearCache, refresh, handleInfo, handleSuccess])

  // Función para obtener estadísticas del cache
  const handleGetCacheStats = useCallback(() => {
    // Esta funcionalidad requeriría exponerla desde el servicio
    const mockStats = {
      total: 5,
      active: 3,
      expired: 2,
      hitRate: 0.85,
      memoryUsageKB: 12
    }
    setCacheStats(mockStats)
    onOpen()
  }, [onOpen])

  // Función para formatear tiempo de respuesta
  const formatResponseTime = useCallback(responseTime => {
    if (!responseTime) return 'N/A'
    if (responseTime < 100) return { text: `${responseTime}ms`, color: 'success' }
    if (responseTime < 500) return { text: `${responseTime}ms`, color: 'warning' }
    return { text: `${responseTime}ms`, color: 'danger' }
  }, [])

  // Memoizar datos del servidor
  const serverInfo = useMemo(() => {
    if (!hasData || !statusData) return null

    return {
      server: statusData.server || 'N/A',
      uptime: statusData.uptime || 'No disponible',
      health: statusData.health,
      responseTime: statusData.metadata?.responseTime,
      requestId: statusData.metadata?.requestId,
      cached: statusData.metadata?.cached
    }
  }, [hasData, statusData])

  // Memoizar métricas
  const metricsInfo = useMemo(() => {
    if (!hasData || !statusData) return null

    const responseTimeFormatted = formatResponseTime(statusData.metadata?.responseTime)

    return {
      responseTime: responseTimeFormatted,
      lastCheck: lastUpdate?.toLocaleTimeString() || 'N/A',
      autoRefreshStatus: isAutoRefreshing ? 'Activa' : 'Inactiva',
      healthPercentage: stats?.healthPercentage,
      requestId: statusData.metadata?.requestId,
      cached: statusData.metadata?.cached
    }
  }, [hasData, statusData, lastUpdate, isAutoRefreshing, stats, formatResponseTime])

  return (
    <>
      {/* Header con información adicional */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div className='flex items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
              Estado del Sistema
              {isHealthy && (
                <Badge color='success' size='sm'>
                  ONLINE
                </Badge>
              )}
              {hasError && (
                <Badge color='danger' size='sm'>
                  OFFLINE
                </Badge>
              )}
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-2'>Monitoreo en tiempo real de la API de Feeling</p>
          </div>

          {/* Indicador de ping en tiempo real */}
          {pingResult && (
            <div className='hidden md:block'>
              <Chip color={pingResult.success ? 'success' : 'danger'} variant='flat' size='sm'>
                Ping: {pingResult.success ? `${pingResult.responseTime}ms` : 'Error'}
              </Chip>
            </div>
          )}
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Button
            color='primary'
            variant='flat'
            onPress={refresh}
            isLoading={loading}
            aria-label='Actualizar estado del sistema'
            startContent={!loading && <span className='material-symbols-outlined'>refresh</span>}>
            Actualizar
          </Button>

          <Button
            color='secondary'
            variant='flat'
            onPress={handlePing}
            isLoading={pingLoading}
            aria-label='Realizar ping al servidor'
            startContent={!pingLoading && <span className='material-symbols-outlined'>network_ping</span>}>
            {pingLoading ? 'Ping...' : 'Ping'}
          </Button>

          <Button
            color='warning'
            variant='flat'
            onPress={handleClearCacheAndRefresh}
            aria-label='Limpiar cache del sistema'
            startContent={<span className='material-symbols-outlined'>cleaning_services</span>}>
            Limpiar Cache
          </Button>

          <Button
            color={isAutoRefreshing ? 'success' : 'default'}
            variant={isAutoRefreshing ? 'solid' : 'flat'}
            onPress={toggleAutoRefresh}
            aria-label={`${isAutoRefreshing ? 'Pausar' : 'Activar'} auto-actualización`}
            startContent={<span className='material-symbols-outlined'>{isAutoRefreshing ? 'pause' : 'play_arrow'}</span>}>
            {isAutoRefreshing ? 'Pausar' : 'Auto-actualizar'}
          </Button>

          <Tooltip content='Ver detalles técnicos'>
            <Button color='default' variant='flat' isIconOnly onPress={handleGetCacheStats} aria-label='Ver detalles técnicos del sistema'>
              <span className='material-symbols-outlined'>info</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Ping Result Card - Solo cuando hay resultado */}
      {pingResult && (
        <Card className='mb-6'>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className={`material-symbols-outlined text-2xl ${pingResult.success ? 'text-success' : 'text-danger'}`}>
                  {pingResult.success ? 'network_check' : 'network_offline'}
                </span>
                <div>
                  <p className='text-lg font-semibold'>Resultado del Ping</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{new Date(pingResult.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className='text-right'>
                <Chip color={pingResult.success ? 'success' : 'danger'} variant='flat' size='lg'>
                  {pingResult.success ? `${pingResult.responseTime}ms` : 'Error'}
                </Chip>
                {!pingResult.success && <p className='text-xs text-danger mt-1'>{pingResult.error}</p>}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Estado General Mejorado */}
      <Card className='mb-6'>
        <CardHeader className='flex gap-3'>
          <div className='flex items-center gap-3'>
            <span className='material-symbols-outlined text-2xl'>
              {overallHealth.status === 'healthy' ? 'health_and_safety' : overallHealth.status === 'error' ? 'warning' : 'help'}
            </span>
            <div>
              <p className='text-lg font-semibold'>Estado General del Sistema</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {lastUpdate ? `Última actualización: ${lastUpdate.toLocaleString()}` : 'Sin datos'}
              </p>
            </div>
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <Chip color={overallHealth.color} variant='flat' size='lg'>
              {overallHealth.text}
            </Chip>
            {isAutoRefreshing && (
              <Chip color='primary' variant='flat' size='sm'>
                Auto-refresh: 30s
              </Chip>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className='flex justify-center items-center py-8'>
              <Spinner size='lg' label='Cargando estado del sistema...' aria-label='Cargando estado del sistema' />
            </div>
          ) : hasError ? (
            <div className='text-center py-8'>
              <span className='material-symbols-outlined text-6xl text-danger mb-4'>error_outline</span>
              <h3 className='text-xl font-semibold text-danger mb-2'>Error de Conexión</h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
              <div className='flex gap-2 justify-center'>
                <Button color='danger' variant='flat' onPress={refresh}>
                  Reintentar
                </Button>
                <Button color='warning' variant='flat' onPress={handleClearCacheAndRefresh}>
                  Limpiar Cache y Reintentar
                </Button>
              </div>
            </div>
          ) : serverInfo ? (
            <div className='space-y-6'>
              {/* Barra de salud general */}
              {stats && (
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium'>Salud del Sistema</span>
                    <span className='text-sm text-gray-600'>{stats.healthPercentage}%</span>
                  </div>
                  <Progress
                    value={stats.healthPercentage}
                    color={stats.healthPercentage >= 80 ? 'success' : stats.healthPercentage >= 60 ? 'warning' : 'danger'}
                    className='mb-4'
                    aria-label={`Salud del sistema: ${stats.healthPercentage}%`}
                    label={`Salud del sistema: ${stats.healthPercentage}%`}
                  />
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Información del Servidor */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                    <span className='material-symbols-outlined text-sm'>computer</span>
                    Información del Servidor
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Servidor:</span>
                      <span className='text-sm font-medium'>{serverInfo.server}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Tiempo activo:</span>
                      <span className='text-sm font-medium'>{serverInfo.uptime}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Estado:</span>
                      <Chip color={serverInfo.health === 'OK' ? 'success' : 'danger'} size='sm' variant='flat'>
                        {serverInfo.health}
                      </Chip>
                    </div>
                    {serverInfo.requestId && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Request ID:</span>
                        <span className='text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
                          {serverInfo.requestId.slice(-8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conectividad */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                    <span className='material-symbols-outlined text-sm'>wifi</span>
                    Conectividad
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>API:</span>
                      <Chip
                        color={isHealthy ? 'success' : 'danger'}
                        size='sm'
                        variant='flat'
                        startContent={<span className='material-symbols-outlined text-xs'>{isHealthy ? 'wifi' : 'wifi_off'}</span>}>
                        {isHealthy ? 'Disponible' : 'No Disponible'}
                      </Chip>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Endpoint:</span>
                      <Chip color={hasData ? 'success' : 'warning'} size='sm' variant='flat'>
                        {hasData ? 'Activo' : 'Inactivo'}
                      </Chip>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Cache:</span>
                      <Chip color={serverInfo.cached ? 'primary' : 'default'} size='sm' variant='flat'>
                        {serverInfo.cached ? 'Cacheado' : 'Directo'}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                {metricsInfo && (
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                      <span className='material-symbols-outlined text-sm'>analytics</span>
                      Métricas
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Respuesta:</span>
                        <Chip color={metricsInfo.responseTime.color} size='sm' variant='flat'>
                          {metricsInfo.responseTime.text}
                        </Chip>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Última verificación:</span>
                        <span className='text-sm font-medium'>{metricsInfo.lastCheck}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Auto-actualización:</span>
                        <Chip color={isAutoRefreshing ? 'success' : 'default'} size='sm' variant='flat'>
                          {metricsInfo.autoRefreshStatus}
                        </Chip>
                      </div>
                      {stats && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>Servicios activos:</span>
                          <span className='text-sm font-medium'>
                            {stats.healthyServices}/{stats.totalServices}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Servicios */}
      {hasData && statusData?.services && Object.keys(statusData.services).length > 0 && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined'>electrical_services</span>
                <div>
                  <p className='text-lg font-semibold'>Estado de Servicios</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Componentes del sistema y sus estados
                    {stats && ` (${stats.healthyServices}/${stats.totalServices} operativos)`}
                  </p>
                </div>
              </div>
              {stats && stats.healthPercentage < 100 && (
                <Badge color='warning' variant='flat'>
                  {stats.totalServices - stats.healthyServices} con problemas
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {Object.entries(statusData.services).map(([serviceName, serviceStatus]) => {
                const status = serviceHealth[serviceName] || {
                  status: 'unknown',
                  color: 'warning',
                  icon: 'help',
                  message: serviceStatus
                }

                return (
                  <div key={serviceName} className='p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <span className={`material-symbols-outlined text-${status.color}`}>{status.icon}</span>
                        <div>
                          <h5 className='font-medium'>{serviceName}</h5>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>{status.message || serviceStatus}</p>
                        </div>
                      </div>
                      <Chip color={status.color} variant='flat' size='sm'>
                        {status.status === 'healthy' ? 'Operativo' : status.status === 'error' ? 'Error' : 'Advertencia'}
                      </Chip>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de detalles técnicos */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Detalles Técnicos del Sistema</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  {/* Información de la API */}
                  <div>
                    <h4 className='font-semibold mb-2'>Configuración de la API</h4>
                    <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm'>
                      <p>
                        <strong>URL:</strong> {API_URL}
                      </p>
                      <p>
                        <strong>Timeout:</strong> 5000ms
                      </p>
                      <p>
                        <strong>Cache habilitado:</strong> Sí
                      </p>
                      <p>
                        <strong>Auto-refresh:</strong> {isAutoRefreshing ? '30 segundos' : 'Desactivado'}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas del cache (mock) */}
                  {cacheStats && (
                    <div>
                      <h4 className='font-semibold mb-2'>Estadísticas del Cache</h4>
                      <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm'>
                        <p>
                          <strong>Entradas totales:</strong> {cacheStats.total}
                        </p>
                        <p>
                          <strong>Entradas activas:</strong> {cacheStats.active}
                        </p>
                        <p>
                          <strong>Entradas expiradas:</strong> {cacheStats.expired}
                        </p>
                        <p>
                          <strong>Tasa de aciertos:</strong> {(cacheStats.hitRate * 100).toFixed(1)}%
                        </p>
                        <p>
                          <strong>Uso de memoria:</strong> {cacheStats.memoryUsageKB} KB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadatos de la última respuesta */}
                  {statusData?.metadata && (
                    <div>
                      <h4 className='font-semibold mb-2'>Última Respuesta</h4>
                      <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono'>
                        <pre>{JSON.stringify(statusData.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Información adicional */}
      <div className='mt-8 text-center text-sm text-gray-500 dark:text-gray-400'>
        <p>
          Esta página muestra el estado en tiempo real de la API de Feeling.
          {isAutoRefreshing && ' Se actualiza automáticamente cada 30 segundos.'}
        </p>
        {statusData?.metadata && (
          <p className='mt-1'>
            Request ID: {statusData.metadata.requestId} | Respuesta: {statusData.metadata.responseTime}ms
            {statusData.metadata.cached && ' | (En caché)'}
          </p>
        )}
      </div>
    </>
  )
}

export default ApiStatus
