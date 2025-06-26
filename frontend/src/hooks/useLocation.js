import { useState, useEffect, useCallback, useMemo } from 'react'
import { geographicService } from '@services/geographicService.js'

const useLocation = (options = {}) => {
  const { loadAll = true, defaultCountry = 'Colombia', defaultCity = 'Bogotá D.C.' } = options

  // Estados principales
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [localities, setLocalities] = useState([])

  // Estados de carga
  const [loading, setLoading] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingLocalities, setLoadingLocalities] = useState(false)

  // Estados de error
  const [error, setError] = useState(null)
  const [citiesError, setCitiesError] = useState(null)
  const [localitiesError, setLocalitiesError] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (loadAll) {
          // Cargar todos los datos de una vez
          const data = await geographicService.getAllGeographicData()

          if (data.countries) {
            setCountries(data.countries)

            // Si hay un país por defecto, cargar sus ciudades
            if (defaultCountry) {
              const defaultCountryData = data.countries.find(country => country.name === defaultCountry || country.code === defaultCountry)

              if (defaultCountryData && defaultCountryData.cities) {
                setCities(defaultCountryData.cities)

                // Si hay una ciudad por defecto, cargar sus localidades
                if (defaultCity) {
                  const defaultCityData = defaultCountryData.cities.find(city => city.name === defaultCity)

                  if (defaultCityData && defaultCityData.localities) {
                    setLocalities(defaultCityData.localities)
                  }
                }
              }
            }
          }
        } else {
          // Solo cargar países inicialmente
          const countriesData = await geographicService.getAllCountries()
          setCountries(countriesData)

          // Si hay país por defecto, cargar sus ciudades
          if (defaultCountry) {
            await loadCitiesByCountry(defaultCountry)
          }
        }
      } catch (err) {
        console.error('Error al cargar datos geográficos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, []) // Removemos las dependencias para evitar loops

  // Cargar ciudades de un país específico
  const loadCitiesByCountry = useCallback(async countryName => {
    if (!countryName) {
      setCities([])
      setLocalities([])
      return
    }

    try {
      setLoadingCities(true)
      setCitiesError(null)
      setLocalities([]) // Limpiar localidades al cambiar país

      const citiesData = await geographicService.getCitiesByCountry(countryName)
      setCities(citiesData || [])
    } catch (err) {
      console.error(`Error al cargar ciudades para ${countryName}:`, err)
      setCitiesError(err.message)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }, [])

  // Cargar localidades de una ciudad específica
  const loadLocalitiesByCity = useCallback(async cityName => {
    if (!cityName) {
      setLocalities([])
      return
    }

    try {
      setLoadingLocalities(true)
      setLocalitiesError(null)

      const localitiesData = await geographicService.getLocalitiesByCity(cityName)
      setLocalities(localitiesData || [])
    } catch (err) {
      console.error(`Error al cargar localidades para ${cityName}:`, err)
      setLocalitiesError(err.message)
      setLocalities([])
    } finally {
      setLoadingLocalities(false)
    }
  }, [])

  // Formatear datos para uso en componentes
  const formattedCountries = useMemo(() => geographicService.formatCountriesForSelect(countries), [countries])

  const formattedCities = useMemo(() => geographicService.formatCitiesForSelect(cities), [cities])

  const formattedLocalities = useMemo(() => geographicService.formatLocalitiesForSelect(localities), [localities])

  // Obtener país por código
  const getCountryByCode = useCallback(
    countryCode => {
      if (!countryCode) return null
      return countries.find(country => country.code === countryCode)
    },
    [countries]
  )

  // Obtener país por nombre
  const getCountryByName = useCallback(
    countryName => {
      if (!countryName) return null
      return countries.find(country => country.name === countryName)
    },
    [countries]
  )

  // Obtener ciudad por nombre
  const getCityByName = useCallback(
    cityName => {
      if (!cityName) return null
      return cities.find(city => city.name === cityName)
    },
    [cities]
  )

  // Verificar si una ciudad tiene localidades
  const cityHasLocalities = useCallback(
    cityName => {
      const city = getCityByName(cityName)
      return city && city.localities && city.localities.length > 0
    },
    [getCityByName]
  )

  // Limpiar cache del servicio
  const clearCache = useCallback(() => {
    geographicService.clearCache()
  }, [])

  return {
    // Datos
    countries,
    cities,
    localities,

    // Datos formateados para selectores
    formattedCountries,
    formattedCities,
    formattedLocalities,

    // Estados de carga
    loading,
    loadingCities,
    loadingLocalities,

    // Estados de error
    error,
    citiesError,
    localitiesError,

    // Funciones
    loadCitiesByCountry,
    loadLocalitiesByCity,
    getCountryByCode,
    getCountryByName,
    getCityByName,
    cityHasLocalities,
    clearCache,

    // Banderas de estado
    hasCountries: countries.length > 0,
    hasCities: cities.length > 0,
    hasLocalities: localities.length > 0,
    isReady: !loading && countries.length > 0
  }
}

export default useLocation
