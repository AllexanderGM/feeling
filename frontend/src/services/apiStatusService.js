import { BaseService } from './baseService.js'

/**
 * Servicio para monitoreo del estado de la API con manejo de errores optimizado
 */
class ApiStatusService extends BaseService {
  constructor() {
    super()
    this.cache = new Map()
    this.cacheExpiration = 10000 // 10 segundos para estado de API
  }

  /**
   * Obtiene datos del cache si están vigentes
   * @param {string} key - Clave del cache
   * @returns {*|null} Datos cacheados o null si no existen/expiraron
   * @private
   */
  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data
    }
    return null
  }

  /**
   * Guarda datos en cache con timestamp
   * @param {string} key - Clave del cache
   * @param {*} data - Datos a cachear
   * @private
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Obtiene el estado general de la API
   * @param {Object} options - Opciones de la petición
   * @param {number} [options.timeout=5000] - Tiempo máximo de espera en milisegundos
   * @param {boolean} [options.useCache=false] - Si usar cache para respuestas rápidas
   * @returns {Promise<Object>} Estado de la API enriquecido con metadatos
   */
  async getApiStatus(options = {}) {
    const { timeout = 5000, useCache = false } = options
    const startTime = Date.now()
    const cacheKey = 'api-status'

    // Verificar cache si está habilitado
    if (useCache) {
      const cached = this.getCachedData(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Usar BaseService - manejo de errores automático
    const result = await BaseService.get('/', {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    // BaseService ya maneja errores, solo procesamos éxito
    const data = BaseService.handleServiceResponse(result, 'obtener estado de la API')

    // Enriquecer datos con metadatos
    const enrichedData = {
      ...data,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        requestId: Date.now().toString(),
        cached: false
      }
    }

    // Cachear resultado si está habilitado
    if (useCache) {
      this.setCachedData(cacheKey, enrichedData)
    }

    return enrichedData
  }

  /**
   * Verifica la salud general de la API (sin errores manuales)
   * @param {Object} options - Opciones de verificación
   * @param {number} [options.timeout=3000] - Tiempo máximo de espera en milisegundos
   * @returns {Promise<Object>} Resultado de la verificación de salud
   */
  async checkHealth(options = {}) {
    const { timeout = 3000 } = options

    // Intentar obtener estado - si falla, BaseService maneja el error
    const result = await BaseService.get('/', { timeout })

    if (result.success) {
      const status = result.data

      return {
        isHealthy: status.health === 'OK',
        status: status.health,
        timestamp: new Date().toISOString(),
        services: this.analyzeServiceHealth(status.services),
        responseTime: Date.now() - Date.now(), // Se calcularía en el BaseService
        uptime: status.uptime
      }
    } else {
      // BaseService ya formateó el error
      return {
        isHealthy: false,
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: result.error?.message || 'Error desconocido',
        responseTime: null,
        services: {}
      }
    }
  }

  /**
   * Obtiene estadísticas detalladas de la API
   * @returns {Promise<Object>} Estadísticas de la API
   */
  async getApiStats() {
    const status = await this.getApiStatus({ useCache: true })

    const services = status.services ? Object.keys(status.services) : []
    const healthyServices = services.filter(
      service =>
        status.services[service].toLowerCase().includes('disponible') || status.services[service].toLowerCase().includes('available')
    ).length

    return {
      totalServices: services.length,
      healthyServices,
      unhealthyServices: services.length - healthyServices,
      uptime: status.uptime,
      serverName: status.server,
      overallHealth: status.health,
      responseTime: status.metadata?.responseTime,
      lastCheck: status.metadata?.timestamp,
      healthPercentage: services.length > 0 ? Math.round((healthyServices / services.length) * 100) : 0
    }
  }

  /**
   * Realiza un ping simple a la API (optimizado con BaseService)
   * @param {number} [timeout=2000] - Tiempo máximo de espera en milisegundos
   * @returns {Promise<Object>} Resultado del ping
   */
  async ping(timeout = 2000) {
    const startTime = Date.now()

    const result = await BaseService.get('/', { timeout })

    return {
      success: result.success,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: result.success ? null : result.error?.message
    }
  }

  /**
   * Analiza el estado de salud de los servicios individuales
   * @param {Object} services - Objeto con los servicios y sus estados
   * @returns {Object} Análisis de salud por servicio
   * @private
   */
  analyzeServiceHealth(services) {
    if (!services || typeof services !== 'object') return {}

    const serviceStatus = {}

    Object.entries(services).forEach(([serviceName, status]) => {
      const statusLower = status.toLowerCase()

      if (statusLower.includes('disponible') || statusLower.includes('available')) {
        serviceStatus[serviceName] = {
          status: 'healthy',
          color: 'success',
          icon: 'check_circle',
          message: status
        }
      } else if (statusLower.includes('error') || statusLower.includes('failed')) {
        serviceStatus[serviceName] = {
          status: 'error',
          color: 'danger',
          icon: 'error',
          message: status
        }
      } else {
        serviceStatus[serviceName] = {
          status: 'warning',
          color: 'warning',
          icon: 'warning',
          message: status
        }
      }
    })

    return serviceStatus
  }

  /**
   * Limpia el cache del servicio
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object} Estadísticas del cache
   */
  getCacheStats() {
    const now = Date.now()
    let activeEntries = 0
    let expiredEntries = 0

    for (const [, value] of this.cache.entries()) {
      if (now - value.timestamp < this.cacheExpiration) {
        activeEntries++
      } else {
        expiredEntries++
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
      expirationTime: this.cacheExpiration
    }
  }
}

// Crear instancia singleton
const apiStatusService = new ApiStatusService()

// Exports individuales para compatibilidad
export const getApiStatus = options => apiStatusService.getApiStatus(options)
export const checkHealth = options => apiStatusService.checkHealth(options)
export const getApiStats = () => apiStatusService.getApiStats()
export const ping = timeout => apiStatusService.ping(timeout)
export const clearApiStatusCache = () => apiStatusService.clearCache()

export { apiStatusService }
export default apiStatusService
