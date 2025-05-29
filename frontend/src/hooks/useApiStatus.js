// src/hooks/useApiStatus.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { API_URL } from '@config/config'

/**
 * Hook personalizado para obtener y manejar el estado completo de la API
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Estado y funciones para manejar el estado de la API
 */
const useApiStatus = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 segundos
    timeout = 5000
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh)

  const intervalRef = useRef(null)
  const abortControllerRef = useRef(null)

  /**
   * Realiza la petición al endpoint de estado
   */
  const fetchStatus = useCallback(
    async (silent = false) => {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Medir tiempo de inicio de la petición
      const startTime = Date.now()

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController()
      const timeoutId = setTimeout(() => abortControllerRef.current.abort(), timeout)

      if (!silent) {
        setLoading(true)
        setError(null)
      }

      try {
        const response = await fetch(`${API_URL}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          signal: abortControllerRef.current.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const responseData = await response.json()

        // Enriquecer los datos con información adicional
        const enrichedData = {
          ...responseData,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          apiUrl: API_URL
        }

        setData(enrichedData)
        setError(null)
        setLastUpdate(new Date())

        return { success: true, data: enrichedData }
      } catch (err) {
        clearTimeout(timeoutId)

        let errorMessage = 'Error desconocido'

        if (err.name === 'AbortError') {
          errorMessage = `Tiempo de espera agotado (${timeout}ms)`
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Error de conexión - El servidor no está disponible'
        } else if (err.message.includes('ECONNREFUSED')) {
          errorMessage = 'Conexión rechazada - El servidor está desconectado'
        } else {
          errorMessage = err.message
        }

        if (!silent) {
          setError(errorMessage)
          setData(null)
        }

        return { success: false, error: errorMessage }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [timeout]
  )

  /**
   * Inicia o detiene la actualización automática
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
   * Realiza una verificación silenciosa (sin cambiar estado de loading)
   */
  const checkSilent = useCallback(() => {
    return fetchStatus(true)
  }, [fetchStatus])

  // Efecto para manejar la actualización automática
  useEffect(() => {
    if (isAutoRefreshing) {
      // Ejecutar inmediatamente
      fetchStatus(false)

      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        fetchStatus(true) // Silencioso para evitar parpadeo de loading
      }, refreshInterval)
    } else {
      // Limpiar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefreshing, refreshInterval, fetchStatus])

  // Cargar estado inicial
  useEffect(() => {
    if (!isAutoRefreshing) {
      fetchStatus(false)
    }
  }, [fetchStatus, isAutoRefreshing])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Funciones de utilidad para analizar el estado
  const getOverallHealth = useCallback(() => {
    if (loading) return { status: 'checking', color: 'default', text: 'Verificando...' }
    if (error) return { status: 'error', color: 'danger', text: 'Error' }
    if (data?.health === 'OK') return { status: 'healthy', color: 'success', text: 'Operativo' }
    return { status: 'unknown', color: 'warning', text: 'Desconocido' }
  }, [loading, error, data])

  const getServiceHealth = useCallback(() => {
    if (!data?.services) return {}

    const serviceStatus = {}
    Object.entries(data.services).forEach(([serviceName, status]) => {
      const statusLower = status.toLowerCase()

      if (statusLower.includes('disponible') || statusLower.includes('available')) {
        serviceStatus[serviceName] = { status: 'healthy', color: 'success', icon: 'check_circle' }
      } else if (statusLower.includes('error') || statusLower.includes('failed')) {
        serviceStatus[serviceName] = { status: 'error', color: 'danger', icon: 'error' }
      } else {
        serviceStatus[serviceName] = { status: 'warning', color: 'warning', icon: 'warning' }
      }
    })

    return serviceStatus
  }, [data])

  const getStats = useCallback(() => {
    if (!data) return null

    const services = data.services ? Object.keys(data.services) : []
    const healthyServices = services.filter(service => data.services[service].toLowerCase().includes('disponible')).length

    return {
      totalServices: services.length,
      healthyServices,
      uptime: data.uptime,
      serverName: data.server,
      overallHealth: data.health,
      lastCheck: lastUpdate
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

    // Funciones
    refresh,
    checkSilent,
    toggleAutoRefresh,

    // Análisis del estado
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
