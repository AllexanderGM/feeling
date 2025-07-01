import { useState, useEffect, useCallback, useRef } from 'react'
import apiStatusService from '@services/apiStatusService.js'
import { useError } from '@hooks/useError.js'

/**
 * Hook personalizado para obtener y manejar el estado completo de la API
 * Optimizado para evitar loops infinitos de re-render
 */
const useApiStatus = (options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000, timeout = 5000, showErrors = false, useCache = false } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh)

  const intervalRef = useRef(null)
  const { handleError } = useError()

  // Memoizar valores estables para evitar cambios en dependencias
  const timeoutRef = useRef(timeout)
  const showErrorsRef = useRef(showErrors)
  const useCacheRef = useRef(useCache)

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    timeoutRef.current = timeout
    showErrorsRef.current = showErrors
    useCacheRef.current = useCache
  }, [timeout, showErrors, useCache])

  /**
   * Realiza la petición al endpoint de estado
   * Memoizada para evitar recreación en cada render
   */
  const fetchStatus = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      try {
        const result = await apiStatusService.getApiStatus({
          timeout: timeoutRef.current,
          useCache: silent ? true : useCacheRef.current
        })

        setData(result)
        setError(null)
        setLastUpdate(new Date())

        return { success: true, data: result }
      } catch (err) {
        const errorMessage = err.message || 'Error desconocido'

        if (!silent) {
          setError(errorMessage)
          setData(null)

          if (showErrorsRef.current) {
            handleError(err, { showToast: true })
          }
        }

        return { success: false, error: errorMessage }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [handleError] // Solo handleError como dependencia
  )

  /**
   * Alterna el estado del refresco automático
   */
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshing(prev => !prev)
  }, [])

  /**
   * Fuerza una actualización manual
   */
  const refresh = useCallback(() => {
    return fetchStatus(false)
  }, [fetchStatus])

  /**
   * Realiza una verificación silenciosa
   */
  const checkSilent = useCallback(() => {
    return fetchStatus(true)
  }, [fetchStatus])

  /**
   * Realiza un ping rápido a la API
   */
  const ping = useCallback(async (pingTimeout = 2000) => {
    try {
      return await apiStatusService.ping(pingTimeout)
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: null,
        timestamp: new Date().toISOString()
      }
    }
  }, [])

  /**
   * Limpia el cache del servicio
   */
  const clearCache = useCallback(() => {
    apiStatusService.clearCache()
  }, [])

  // Efecto para manejar la actualización automática
  // Usar refs para evitar dependencias que cambian
  const refreshIntervalRef = useRef(refreshInterval)
  refreshIntervalRef.current = refreshInterval

  useEffect(() => {
    if (isAutoRefreshing) {
      // Ejecutar inmediatamente
      fetchStatus(false)

      // Configurar intervalo con valor fijo
      intervalRef.current = setInterval(() => {
        fetchStatus(true) // Silencioso para evitar parpadeo
      }, refreshIntervalRef.current)
    } else {
      // Limpiar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAutoRefreshing]) // REMOVIDO: fetchStatus y refreshInterval

  // Efecto para carga inicial - SEPARADO para evitar conflictos
  useEffect(() => {
    // Solo cargar al montar si NO está en auto-refresh
    if (!isAutoRefreshing) {
      fetchStatus(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío - solo al montar

  // Efecto de cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  /**
   * Analiza y devuelve el estado general de salud
   * Memoizado para evitar recreación
   */
  const getOverallHealth = useCallback(() => {
    if (loading) return { status: 'checking', color: 'default', text: 'Verificando...' }
    if (error) return { status: 'error', color: 'danger', text: 'Error' }
    if (data?.health === 'OK') return { status: 'healthy', color: 'success', text: 'Operativo' }
    return { status: 'unknown', color: 'warning', text: 'Desconocido' }
  }, [loading, error, data?.health])

  /**
   * Analiza y devuelve el estado de cada servicio
   * Memoizado para evitar recreación
   */
  const getServiceHealth = useCallback(() => {
    if (!data?.services) return {}
    return apiStatusService.analyzeServiceHealth(data.services)
  }, [data?.services])

  /**
   * Obtiene estadísticas generales de la API
   * Memoizado para evitar recreación
   */
  const getStats = useCallback(() => {
    if (!data) return null

    const services = data.services ? Object.keys(data.services) : []
    const healthyServices = services.filter(
      service => data.services[service].toLowerCase().includes('disponible') || data.services[service].toLowerCase().includes('available')
    ).length

    return {
      totalServices: services.length,
      healthyServices,
      unhealthyServices: services.length - healthyServices,
      uptime: data.uptime,
      serverName: data.server,
      overallHealth: data.health,
      responseTime: data.metadata?.responseTime,
      lastCheck: lastUpdate,
      healthPercentage: services.length > 0 ? Math.round((healthyServices / services.length) * 100) : 0
    }
  }, [data, lastUpdate])

  return {
    // Estado de los datos
    data,
    loading,
    error,
    lastUpdate,

    // Estado de configuración
    isAutoRefreshing,
    refreshInterval,

    // Funciones principales
    refresh,
    checkSilent,
    toggleAutoRefresh,
    ping,
    clearCache,

    // Análisis del estado - valores memoizados
    overallHealth: getOverallHealth(),
    serviceHealth: getServiceHealth(),
    stats: getStats(),

    // Utilidades
    isHealthy: !error && data?.health === 'OK',
    hasData: !!data,
    hasError: !!error
  }
}

export default useApiStatus
