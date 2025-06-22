import { API_URL } from '@config/config'

class GeographicService {
  constructor() {
    this.baseURL = `${API_URL}/geographic`
    this.cache = new Map()
    this.cacheExpiration = 5 * 60 * 1000 // 5 minutos
  }

  // Método auxiliar para cache
  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data
    }
    return null
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Obtener todos los países
  async getAllCountries() {
    const cacheKey = 'countries'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseURL}/countries`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const countries = await response.json()
      this.setCachedData(cacheKey, countries)
      return countries
    } catch (error) {
      console.error('Error al obtener países:', error)
      throw new Error('No se pudieron cargar los países')
    }
  }

  // Obtener ciudades por país
  async getCitiesByCountry(countryName) {
    const cacheKey = `cities-${countryName}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseURL}/countries/${encodeURIComponent(countryName)}/cities`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const cities = await response.json()
      this.setCachedData(cacheKey, cities)
      return cities
    } catch (error) {
      console.error(`Error al obtener ciudades para ${countryName}:`, error)
      return []
    }
  }

  // Obtener localidades por ciudad
  async getLocalitiesByCity(cityName) {
    const cacheKey = `localities-${cityName}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseURL}/cities/${encodeURIComponent(cityName)}/localities`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const localities = await response.json()
      this.setCachedData(cacheKey, localities)
      return localities
    } catch (error) {
      console.error(`Error al obtener localidades para ${cityName}:`, error)
      return []
    }
  }

  // Obtener todos los datos de una vez (más eficiente para carga inicial)
  async getAllGeographicData() {
    const cacheKey = 'all-geographic-data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseURL}/all`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      this.setCachedData(cacheKey, data)

      // También cachear los datos individuales para consultas futuras
      if (data.countries) {
        this.setCachedData('countries', data.countries)

        // Cachear ciudades por país
        data.countries.forEach(country => {
          if (country.cities) {
            this.setCachedData(`cities-${country.name}`, country.cities)

            // Cachear localidades por ciudad
            country.cities.forEach(city => {
              if (city.localities) {
                this.setCachedData(`localities-${city.name}`, city.localities)
              }
            })
          }
        })
      }

      return data
    } catch (error) {
      console.error('Error al obtener datos geográficos:', error)
      throw new Error('No se pudieron cargar los datos geográficos')
    }
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear()
  }

  // Formatear países para uso en componentes
  formatCountriesForSelect(countries) {
    return countries.map(country => ({
      key: country.code,
      name: country.name,
      phone: country.phoneCode,
      image: country.flag || country.image,
      emoji: country.emoji || '🌍',
      priority: country.priority || false
    }))
  }

  // Formatear ciudades para uso en componentes
  formatCitiesForSelect(cities) {
    return cities.map(city => ({
      key: city.name,
      name: city.name,
      priority: city.priority || false
    }))
  }

  // Formatear localidades para uso en componentes
  formatLocalitiesForSelect(localities) {
    return localities.map(locality => ({
      key: locality.name,
      name: locality.name
    }))
  }
}

// Exportar instancia singleton
export const geographicService = new GeographicService()
export default geographicService
