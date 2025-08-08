/**
 * Cache simple para prevenir peticiones duplicadas
 */
import { Logger } from './logger.js'

class RequestCache {
  constructor() {
    this.cache = new Map()
    this.ongoingRequests = new Map()
  }

  /**
   * Genera una clave única para la petición
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return `${url}${sortedParams ? `?${sortedParams}` : ''}`
  }

  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   * CACHE DESHABILITADO - siempre usa datos reales
   */
  get(url, params = {}, ttl = 30000) {
    // TTL por defecto: 30 segundos
    // Cache deshabilitado - siempre devolver null para usar datos reales
    return null
  }

  /**
   * Guarda datos en el cache
   */
  set(url, params = {}, data) {
    const key = this.generateKey(url, params)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Ejecuta una petición evitando duplicados
   */
  async request(url, params = {}, fetcher, ttl = 30000) {
    const key = this.generateKey(url, params)

    // Verificar cache primero
    const cached = this.get(url, params, ttl)
    if (cached) {
      Logger.debug(Logger.CATEGORIES.SYSTEM, 'usar cache', `Cache hit para ${key}`)
      return cached
    }

    // Verificar si ya hay una petición en curso
    if (this.ongoingRequests.has(key)) {
      Logger.debug(Logger.CATEGORIES.SYSTEM, 'esperar petición', `Petición en curso para ${key}`)
      return await this.ongoingRequests.get(key)
    }

    // Crear nueva petición
    const requestPromise = (async () => {
      try {
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'nueva petición', `Ejecutando petición para ${key}`)
        const data = await fetcher()
        this.set(url, params, data)
        return data
      } catch (error) {
        throw error
      } finally {
        this.ongoingRequests.delete(key)
      }
    })()

    this.ongoingRequests.set(key, requestPromise)
    return requestPromise
  }

  /**
   * Limpia el cache
   */
  clear() {
    this.cache.clear()
    this.ongoingRequests.clear()
  }

  /**
   * Limpia entradas expiradas del cache
   */
  cleanup(ttl = 30000) {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Instancia global
export const requestCache = new RequestCache()

// Limpiar cache cada 5 minutos
setInterval(
  () => {
    requestCache.cleanup()
  },
  5 * 60 * 1000
)

export default RequestCache
