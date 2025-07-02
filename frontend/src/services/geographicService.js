import { ServiceREST } from '@services/serviceREST.js'

/**
 * Servicio para manejo de datos geográficos con cache optimizado
 */
class GeographicService extends ServiceREST {
  constructor() {
    super()
    this.cache = new Map()
    this.cacheExpiration = 5 * 60 * 1000 // 5 minutos
    this.isLoadingAll = false // Flag para evitar cargas múltiples
    this.verboseLogging = false // Control de logging detallado
  }

  // ========================================
  // MÉTODOS DE CACHE OPTIMIZADOS
  // ========================================

  /**
   * Obtiene datos del cache si están vigentes
   * @param {string} key - Clave del cache
   * @returns {*|null} Datos cacheados o null si no existen/expiraron
   */
  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      if (this.verboseLogging) {
        console.log(`📦 Cache hit: ${key}`)
      }
      return cached.data
    }
    return null
  }

  /**
   * Guarda datos en cache con timestamp (sin logging individual)
   * @param {string} key - Clave del cache
   * @param {*} data - Datos a cachear
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Cachea datos anidados de forma eficiente y silenciosa
   * @param {Object} data - Datos geográficos completos
   */
  cacheNestedDataBatch(data) {
    if (!data?.countries) return

    // Cachear países
    this.setCachedData('countries', data.countries)
    // Batch cache para ciudades y localidades
    data.countries.forEach(country => {
      if (country.cities) {
        this.setCachedData(`cities-${country.name}`, country.cities)

        // Cache localidades en batch
        country.cities.forEach(city => {
          if (city.localities) {
            this.setCachedData(`localities-${city.name}`, city.localities)
          }
        })
      }
    })
  }

  /**
   * Limpia cache inteligentemente (solo elementos expirados)
   */
  cleanupExpiredCache() {
    const now = Date.now()

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheExpiration) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Limpia todo el cache
   */
  clearCache() {
    this.cache.clear()
  }

  // ========================================
  // MÉTODOS DE DATOS GEOGRÁFICOS OPTIMIZADOS
  // ========================================

  /**
   * Obtiene todos los datos geográficos de una vez (optimizado para primera carga)
   * @param {boolean} forceRefresh - Forzar recarga desde servidor
   * @returns {Promise<Object>} Datos geográficos completos
   */
  async getAllGeographicData(forceRefresh = false) {
    // Verificar cache primero
    if (!forceRefresh) {
      const cached = this.getCachedData('all-geographic-data')
      if (cached) return cached
    }

    // Evitar cargas múltiples simultáneas
    if (this.isLoadingAll) {
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          const cached = this.getCachedData('all-geographic-data')
          if (cached || !this.isLoadingAll) {
            clearInterval(checkInterval)
            resolve(cached || this.getAllGeographicData(forceRefresh))
          }
        }, 100)
      })
    }

    try {
      this.isLoadingAll = true
      const result = await ServiceREST.get('/geographic/all')
      const data = ServiceREST.handleServiceResponse(result, 'obtener datos geográficos completos')

      // Cache principal
      this.setCachedData('all-geographic-data', data)
      // Cache anidado en batch (silencioso)
      this.cacheNestedDataBatch(data)

      return data
    } catch (error) {
      console.error('❌ Error cargando datos geográficos:', error.message)
      error.message = 'No se pudieron cargar los datos geográficos'
      throw error
    } finally {
      this.isLoadingAll = false
    }
  }

  /**
   * Obtiene todos los países (optimizado)
   * @returns {Promise<Array>} Lista de países
   */
  async getAllCountries() {
    // Intentar desde cache directo
    let countries = this.getCachedData('countries')
    if (countries) return countries

    // Si no está en cache, cargar datos completos
    const allData = await this.getAllGeographicData()
    return allData.countries || []
  }

  /**
   * Obtiene ciudades por país (optimizado)
   * @param {string} countryName - Nombre del país
   * @returns {Promise<Array>} Lista de ciudades
   */
  async getCitiesByCountry(countryName) {
    if (!countryName) return []

    const cacheKey = `cities-${countryName}`

    // Verificar cache directo
    let cities = this.getCachedData(cacheKey)
    if (cities) return cities

    try {
      const result = await ServiceREST.get(`/geographic/countries/${encodeURIComponent(countryName)}/cities`)

      if (result.success) {
        cities = result.data || []
        this.setCachedData(cacheKey, cities)
        return cities
      } else {
        console.warn(`⚠️ No se encontraron ciudades para ${countryName}`)
        return []
      }
    } catch (error) {
      console.warn(`⚠️ Error cargando ciudades para ${countryName}:`, error.message)
      return []
    }
  }

  /**
   * Obtiene localidades por ciudad (optimizado)
   * @param {string} cityName - Nombre de la ciudad
   * @returns {Promise<Array>} Lista de localidades
   */
  async getLocalitiesByCity(cityName) {
    if (!cityName) return []

    const cacheKey = `localities-${cityName}`

    // Verificar cache directo
    let localities = this.getCachedData(cacheKey)
    if (localities) return localities

    try {
      // Cargar desde servidor solo si es necesario
      const result = await ServiceREST.get(`/geographic/cities/${encodeURIComponent(cityName)}/localities`)

      if (result.success) {
        localities = result.data || []
        this.setCachedData(cacheKey, localities)
        return localities
      } else {
        return []
      }
    } catch (error) {
      console.warn(`⚠️ Error cargando localidades para ${cityName}:`, error.message)
      return []
    }
  }

  // ========================================
  // MÉTODOS DE PRECARGA INTELIGENTE
  // ========================================

  /**
   * Precarga datos para países populares
   * @param {Array} popularCountries - Lista de países populares
   */
  async preloadPopularCountries(popularCountries = ['Colombia', 'México', 'España', 'Argentina']) {
    const promises = popularCountries.map(async country => {
      try {
        await this.getCitiesByCountry(country)
      } catch (error) {
        console.warn(`⚠️ Error precargando ${country}:`, error.message)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Estrategia de carga lazy para UI
   * @param {string} countryName - País seleccionado
   * @returns {Promise<Array>} Ciudades del país
   */
  async loadCountryCitiesForUI(countryName) {
    if (!countryName) return []

    // Limpiar cache expirado antes de cargar
    this.cleanupExpiredCache()

    return await this.getCitiesByCountry(countryName)
  }

  // ========================================
  // MÉTODOS DE UTILIDAD OPTIMIZADOS
  // ========================================

  /**
   * Obtiene estadísticas del cache (optimizado)
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

    const stats = {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      memoryUsageKB: Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)
    }

    return stats
  }

  /**
   * Habilita/deshabilita logging detallado
   * @param {boolean} enabled - Estado del logging
   */
  setVerboseLogging(enabled) {
    this.verboseLogging = enabled
  }

  // ========================================
  // MÉTODOS DE FORMATEO (sin cambios)
  // ========================================

  formatCountriesForSelect(countries) {
    if (!Array.isArray(countries)) return []
    return countries.map(country => ({
      key: country.code || country.name,
      name: country.name,
      phone: country.phoneCode,
      image: country.flag || country.image,
      emoji: country.emoji || '🌍',
      priority: country.priority || false
    }))
  }

  formatCitiesForSelect(cities) {
    if (!Array.isArray(cities)) return []
    return cities.map(city => ({
      key: city.name,
      name: city.name,
      priority: city.priority || false
    }))
  }

  formatLocalitiesForSelect(localities) {
    if (!Array.isArray(localities)) return []
    return localities.map(locality => ({
      key: locality.name,
      name: locality.name
    }))
  }

  // ========================================
  // MÉTODOS DE BÚSQUEDA OPTIMIZADOS
  // ========================================

  async searchCountries(searchTerm) {
    try {
      const countries = await this.getAllCountries()
      if (!searchTerm) return countries

      const lowercaseSearch = searchTerm.toLowerCase()
      return countries.filter(
        country => country.name.toLowerCase().includes(lowercaseSearch) || country.code?.toLowerCase().includes(lowercaseSearch)
      )
    } catch (error) {
      console.error('❌ Error buscando países:', error.message)
      return []
    }
  }

  async searchCities(countryName, searchTerm) {
    try {
      const cities = await this.getCitiesByCountry(countryName)
      if (!searchTerm) return cities

      const lowercaseSearch = searchTerm.toLowerCase()
      return cities.filter(city => city.name.toLowerCase().includes(lowercaseSearch))
    } catch (error) {
      console.error(`❌ Error buscando ciudades en ${countryName}:`, error.message)
      return []
    }
  }
}

// Crear instancia singleton
const geographicService = new GeographicService()

// Exports individuales para mantener compatibilidad
export const getAllCountries = () => geographicService.getAllCountries()
export const getCitiesByCountry = countryName => geographicService.loadCountryCitiesForUI(countryName)
export const getLocalitiesByCity = cityName => geographicService.getLocalitiesByCity(cityName)
export const getAllGeographicData = forceRefresh => geographicService.getAllGeographicData(forceRefresh)

// Métodos de formateo
export const formatCountriesForSelect = countries => geographicService.formatCountriesForSelect(countries)
export const formatCitiesForSelect = cities => geographicService.formatCitiesForSelect(cities)
export const formatLocalitiesForSelect = localities => geographicService.formatLocalitiesForSelect(localities)

// Métodos de utilidad optimizados
export const searchCountries = searchTerm => geographicService.searchCountries(searchTerm)
export const searchCities = (countryName, searchTerm) => geographicService.searchCities(countryName, searchTerm)
export const clearGeographicCache = () => geographicService.clearCache()
export const preloadPopularCountries = countries => geographicService.preloadPopularCountries(countries)
export const setVerboseLogging = enabled => geographicService.setVerboseLogging(enabled)

// Export default de la instancia
export { geographicService }
export default geographicService
