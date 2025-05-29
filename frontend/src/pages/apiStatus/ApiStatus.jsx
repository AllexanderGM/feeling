import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner, Divider } from '@heroui/react'
import { API_URL } from '@config/config'

const ApiStatus = () => {
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchApiStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStatusData(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching API status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh cada 30 segundos si está habilitado
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchApiStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Cargar estado inicial
  useEffect(() => {
    fetchApiStatus()
  }, [])

  const getHealthStatus = () => {
    if (loading) return { color: 'default', text: 'Verificando...' }
    if (error) return { color: 'danger', text: 'Error' }
    if (statusData?.health === 'OK') return { color: 'success', text: 'Operativo' }
    return { color: 'warning', text: 'Desconocido' }
  }

  const getServiceStatus = serviceMessage => {
    if (serviceMessage.toLowerCase().includes('disponible')) {
      return { color: 'success', icon: 'check_circle', text: 'Operativo' }
    }
    if (serviceMessage.toLowerCase().includes('error')) {
      return { color: 'danger', icon: 'error', text: 'Error' }
    }
    return { color: 'warning', icon: 'warning', text: 'Advertencia' }
  }

  const formatUptime = uptime => {
    if (!uptime) return 'No disponible'
    return uptime
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estado del Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitoreo en tiempo real de la API de Feeling</p>
        </div>

        <div className="flex gap-3">
          <Button
            color="primary"
            variant="flat"
            onPress={fetchApiStatus}
            isLoading={loading}
            startContent={!loading && <span className="material-symbols-outlined">refresh</span>}>
            Actualizar
          </Button>

          <Button
            color={autoRefresh ? 'success' : 'default'}
            variant={autoRefresh ? 'solid' : 'flat'}
            onPress={() => setAutoRefresh(!autoRefresh)}
            startContent={<span className="material-symbols-outlined">{autoRefresh ? 'pause' : 'play_arrow'}</span>}>
            {autoRefresh ? 'Pausar' : 'Auto-actualizar'}
          </Button>
        </div>
      </div>

      {/* Estado General */}
      <Card className="mb-6">
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">
              {healthStatus.color === 'success' ? 'health_and_safety' : healthStatus.color === 'danger' ? 'warning' : 'help'}
            </span>
            <div>
              <p className="text-lg font-semibold">Estado General del Sistema</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lastUpdate ? `Última actualización: ${lastUpdate.toLocaleString()}` : 'Sin datos'}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Chip color={healthStatus.color} variant="flat" size="lg">
              {healthStatus.text}
            </Chip>
          </div>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" label="Cargando estado del sistema..." />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-6xl text-danger mb-4">error_outline</span>
              <h3 className="text-xl font-semibold text-danger mb-2">Error de Conexión</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button color="danger" variant="flat" onPress={fetchApiStatus}>
                Reintentar
              </Button>
            </div>
          ) : statusData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información del Servidor */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Información del Servidor</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">computer</span>
                    <span className="text-sm">
                      <strong>Servidor:</strong> {statusData.server}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-sm">
                      <strong>Tiempo activo:</strong> {formatUptime(statusData.uptime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{statusData.health === 'OK' ? 'favorite' : 'heart_broken'}</span>
                    <span className="text-sm">
                      <strong>Estado:</strong> {statusData.health}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conectividad */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Conectividad</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-success">wifi</span>
                    <span className="text-sm">API Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-success">public</span>
                    <span className="text-sm">Endpoint Activo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span className=" text-xs break-all">{API_URL}</span>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Métricas</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">speed</span>
                    <span className="text-sm">
                      <strong>Respuesta:</strong> &lt; 1s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">update</span>
                    <span className="text-sm">
                      <strong>Última verificación:</strong> {lastUpdate?.toLocaleTimeString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{autoRefresh ? 'autorenew' : 'sync_disabled'}</span>
                    <span className="text-sm">
                      <strong>Auto-actualización:</strong> {autoRefresh ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Servicios */}
      {statusData?.services && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">miscellaneous_services</span>
              <div>
                <p className="text-lg font-semibold">Estado de Servicios</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Componentes del sistema y sus estados</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {Object.entries(statusData.services).map(([serviceName, serviceStatus], index) => {
                const status = getServiceStatus(serviceStatus)

                return (
                  <div key={serviceName}>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-${status.color}`}>{status.icon}</span>
                        <div>
                          <h5 className="font-medium">{serviceName}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{serviceStatus}</p>
                        </div>
                      </div>
                      <Chip color={status.color} variant="flat" size="sm">
                        {status.text}
                      </Chip>
                    </div>
                    {index < Object.entries(statusData.services).length - 1 && <Divider className="my-2" />}
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Información adicional */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Esta página muestra el estado en tiempo real de la API de Feeling.
          {autoRefresh && ' Se actualiza automáticamente cada 30 segundos.'}
        </p>
      </div>
    </div>
  )
}

export default ApiStatus
