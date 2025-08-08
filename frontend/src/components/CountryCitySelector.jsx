import { useState, useEffect, useMemo } from 'react'
import { Logger } from '@utils/logger.js'

const CountryCitySelector = ({ initialCountry = '', initialCity = '', onCountryChange, onCityChange, selectedRegion = '' }) => {
  // Estado para almacenar los datos cargados de países y ciudades
  const [countriesData, setCountriesData] = useState({})
  const [citiesData, setCitiesData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para selección
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('') // Inicializado vacío, se establecerá después de procesar ciudades
  const [availableCities, setAvailableCities] = useState([])

  // Flag para controlar si ya se realizó la inicialización
  const [isInitialized, setIsInitialized] = useState(false)

  // Cargar los datos JSON al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Cargar países
        const countriesResponse = await fetch('/data/countries.json')
        if (!countriesResponse.ok) {
          throw new Error('Error al cargar datos de países')
        }
        const countriesRawData = await countriesResponse.json()
        setCountriesData(countriesRawData)

        // Cargar ciudades
        const citiesResponse = await fetch('/data/cities.json')
        if (!citiesResponse.ok) {
          throw new Error('Error al cargar datos de ciudades')
        }
        const citiesRawData = await citiesResponse.json()
        setCitiesData(citiesRawData)

        setIsLoading(false)
      } catch (err) {
        Logger.error('Error cargando datos geográficos', Logger.CATEGORIES.SERVICE, { error: err.message })
        setError(err.message)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar países por región si se proporciona una región
  const filteredCountries = useMemo(() => {
    if (!isLoading && selectedRegion && countriesData) {
      return Object.entries(countriesData)
        .filter(([, countryData]) => countryData.region === selectedRegion)
        .reduce((acc, [code, data]) => {
          acc[code] = data
          return acc
        }, {})
    }
    return countriesData
  }, [countriesData, selectedRegion, isLoading])

  // Inicializar el país cuando los datos están cargados
  useEffect(() => {
    if (!isLoading && !isInitialized && initialCountry && Object.keys(countriesData).length > 0) {
      // Comprobar si initialCountry es un código ISO o un nombre completo
      let countryCode = initialCountry

      // Si initialCountry parece un nombre completo y no un código ISO
      if (initialCountry.length > 2) {
        // Buscar el código ISO correspondiente al nombre del país
        const countryEntry = Object.entries(countriesData).find(([, data]) => data.name.toLowerCase() === initialCountry.toLowerCase())

        if (countryEntry) {
          countryCode = countryEntry[0] // Usar el código ISO encontrado
        }
      }

      // Verificar si el código existe en los países filtrados si hay región seleccionada
      if (selectedRegion) {
        if (filteredCountries[countryCode]) {
          setSelectedCountry(countryCode)
        }
      } else {
        // Si no hay región seleccionada, usar el código directamente
        setSelectedCountry(countryCode)
      }

      setIsInitialized(true)
    }
  }, [countriesData, filteredCountries, initialCountry, isLoading, selectedRegion, isInitialized])

  // Procesar las ciudades disponibles con IDs únicos para evitar duplicados
  const processedCities = useMemo(() => {
    if (!isLoading && selectedCountry) {
      const countryName = countriesData[selectedCountry]?.name

      if (countryName && citiesData[countryName]) {
        // Generar IDs para cada ciudad basados en su posición y nombre
        return citiesData[countryName].map((cityName, index) => ({
          id: `${selectedCountry}-${index}`,
          name: cityName,
          value: cityName // Mantenemos el valor original para compatibilidad
        }))
      }
    }
    return []
  }, [selectedCountry, countriesData, citiesData, isLoading])

  // Inicializar la ciudad cuando hay ciudades disponibles
  useEffect(() => {
    if (initialCity && processedCities.length > 0 && !isLoading) {
      const cityEntry = processedCities.find(city => city.name === initialCity)
      if (cityEntry) {
        setSelectedCity(cityEntry.id)
      }
    }
  }, [processedCities, initialCity, isLoading])

  // Cuando cambia el país seleccionado, actualizar ciudades disponibles
  useEffect(() => {
    if (selectedCountry && !isLoading) {
      const countryName = countriesData[selectedCountry]?.name

      if (countryName && citiesData[countryName]) {
        setAvailableCities(processedCities)
      } else {
        setAvailableCities([])
        setSelectedCity('')
      }
    } else {
      setAvailableCities([])
      setSelectedCity('')
    }
  }, [selectedCountry, countriesData, citiesData, processedCities, isLoading])

  // Manejar cambio de país
  const handleCountryChange = e => {
    const countryCode = e.target.value
    setSelectedCity('') // Resetear ciudad al cambiar país
    setSelectedCountry(countryCode)
    onCountryChange && onCountryChange(countryCode)
  }

  // Manejar cambio de ciudad
  const handleCityChange = e => {
    const cityValue = e.target.value
    setSelectedCity(cityValue)

    // Si tenemos el valor seleccionado, buscar la ciudad completa en las disponibles
    if (cityValue && availableCities.length > 0) {
      const selectedCityObj = availableCities.find(city => city.id === cityValue)
      if (selectedCityObj) {
        // Pasar el nombre de la ciudad completo al callback
        onCityChange && onCityChange(selectedCityObj.name)
        return
      }
    }

    // Si no se encuentra o está vacío, pasar el valor directamente
    onCityChange && onCityChange(cityValue)
  }

  // Renderizar componente con selectores nativos
  return (
    <div className='space-y-4'>
      {isLoading ? (
        <div className='text-center py-2'>Cargando datos...</div>
      ) : error ? (
        <div className='text-red-500 text-center py-2'>Error: {error}</div>
      ) : (
        <>
          {/* Selector de País - Usando select nativo */}
          <div>
            <label htmlFor='country-select' className='block text-sm font-medium text-gray-700 mb-1'>
              País *
            </label>
            <select
              id='country-select'
              value={selectedCountry}
              onChange={handleCountryChange}
              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E86C6E] focus:border-[#E86C6E]'
              required>
              <option value=''>Selecciona un país</option>
              {Object.entries(filteredCountries).map(([code, countryData]) => (
                <option key={code} value={code}>
                  {countryData.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Ciudad - Usando select nativo */}
          <div>
            <label htmlFor='city-select' className='block text-sm font-medium text-gray-700 mb-1'>
              Ciudad *
            </label>
            <select
              id='city-select'
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedCountry || availableCities.length === 0}
              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E86C6E] focus:border-[#E86C6E]'
              required>
              <option value=''>
                {!selectedCountry
                  ? 'Primero selecciona un país'
                  : availableCities.length === 0
                    ? 'No hay ciudades disponibles'
                    : 'Selecciona una ciudad'}
              </option>
              {availableCities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}

export default CountryCitySelector
