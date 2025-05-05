import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
// NOTA: Temporalmente usando getAllTours en lugar de toursAllRandom para evitar límite de 10 items
import { getAllTours, toursAllRandom } from '@services/tourService.js'

const SearchContext = createContext()

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [allTours, setAllTours] = useState(null)
  const [toursAvailability, setToursAvailability] = useState({})
  const [advancedSearchParams, setAdvancedSearchParams] = useState({
    dateRange: null
  })

  // Cargar todos los tours en orden normal (para ToursPage)
  const loadAllTours = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading all tours data...')
      const response = await getAllTours()
      console.log('All tours response:', response)

      setAllTours(response)
      setSearchResults(response)
    } catch (error) {
      console.error('Error loading tours:', error)
      setSearchResults({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar todos los tours en orden aleatorio (para Home)
  const loadAllRandomTours = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading random tours data...')
      const response = await toursAllRandom()
      console.log('Random tours response:', response)

      setAllTours(response)
      setSearchResults(response)
    } catch (error) {
      console.error('Error loading random tours:', error)
      setSearchResults({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Escuchar el evento de reset para DateRangePicker
    const handleResetEvent = () => {
      setAdvancedSearchParams({
        dateRange: null
      })
    }

    window.addEventListener('reset-date-range', handleResetEvent)
    return () => window.removeEventListener('reset-date-range', handleResetEvent)
  }, [])

  const updateSearchTerm = useCallback(term => {
    setSearchTerm(term)
  }, [])

  // Función para actualizar los parámetros de búsqueda avanzada
  const updateAdvancedSearchParams = useCallback(params => {
    console.log('SearchContext - Actualizando parámetros avanzados:', params)
    setAdvancedSearchParams(prev => {
      const newParams = {
        ...prev,
        ...params
      }
      console.log('SearchContext - Nuevos parámetros:', newParams)
      return newParams
    })
  }, [])

  const searchTours = useCallback(async () => {
    setLoading(true)
    console.log('Searching tours with term:', searchTerm)
    console.log('Advanced search params:', advancedSearchParams)

    try {
      if (!allTours) {
        await loadAllTours()
        return
      }

      if (!searchTerm.trim() && !(advancedSearchParams.dateRange?.startDate || advancedSearchParams.dateRange?.start)) {
        setSearchResults(allTours)
        setLoading(false)
        return
      }

      if (!allTours.data || !Array.isArray(allTours.data)) {
        console.error('Unexpected data structure:', allTours)
        setSearchResults({ success: false, error: 'Formato de datos inesperado' })
        setLoading(false)
        return
      }

      let filteredResults = [...allTours.data]

      // Filtrar por término de búsqueda
      if (searchTerm.trim()) {
        const lowercaseSearchTerm = searchTerm.toLowerCase().trim()
        filteredResults = filteredResults.filter(tour => {
          return (
            (tour.name && tour.name.toLowerCase().includes(lowercaseSearchTerm)) ||
            (tour.description && tour.description.toLowerCase().includes(lowercaseSearchTerm)) ||
            (tour.destination?.country && tour.destination.country.toLowerCase().includes(lowercaseSearchTerm)) ||
            (tour.destination?.region && tour.destination.region.toLowerCase().includes(lowercaseSearchTerm)) ||
            (tour.destination?.city?.name && tour.destination.city.name.toLowerCase().includes(lowercaseSearchTerm)) ||
            (Array.isArray(tour.tags) && tour.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lowercaseSearchTerm)))
          )
        })
      }

      // Filtrar por rango de fechas
      if (advancedSearchParams.dateRange?.startDate || advancedSearchParams.dateRange?.start) {
        console.log('Filtering by date range:', advancedSearchParams.dateRange)

        let startDate = null
        let endDate = null

        try {
          // Verificar si la fecha está como string ISO o como objeto {day, month, year}
          if (typeof advancedSearchParams.dateRange?.startDate === 'string') {
            startDate = new Date(advancedSearchParams.dateRange.startDate)
          } else if (advancedSearchParams.dateRange?.start) {
            const { day, month, year } = advancedSearchParams.dateRange.start
            startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
          }

          if (typeof advancedSearchParams.dateRange?.endDate === 'string') {
            endDate = new Date(advancedSearchParams.dateRange.endDate)
          } else if (advancedSearchParams.dateRange?.end) {
            const { day, month, year } = advancedSearchParams.dateRange.end
            // Crear la fecha de fin a las 23:59:59 para incluir todo el día
            endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
          }

          if (startDate && !endDate) {
            endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 1)
            endDate.setHours(23, 59, 59, 999)
          }

          console.log('Fechas para filtrado - Inicio:', startDate.toISOString(), 'Fin:', endDate.toISOString())

          // Filtrar los resultados basados en la disponibilidad de los tours
          filteredResults = filteredResults.filter(tour => {
            // Si el tour no tiene disponibilidad, lo mantenemos (no filtramos)
            if (!tour.availability || !Array.isArray(tour.availability) || tour.availability.length === 0) {
              return true
            }

            // Verificar si alguna fecha de salida del tour está dentro del rango seleccionado
            return tour.availability.some(avail => {
              if (!avail.departureTime) return false

              try {
                const departureDate = new Date(avail.departureTime)

                const departureDateNormalized = new Date(departureDate)
                departureDateNormalized.setHours(0, 0, 0, 0)

                const startDateNormalized = new Date(startDate)
                startDateNormalized.setHours(0, 0, 0, 0)

                const endDateNormalized = new Date(endDate)
                endDateNormalized.setHours(23, 59, 59, 999)

                console.log(
                  `Tour ${tour.name} - fecha salida:`,
                  departureDate.toISOString(),
                  'Normalizada:',
                  departureDateNormalized.toISOString(),
                  'Dentro del rango:',
                  departureDateNormalized >= startDateNormalized && departureDateNormalized <= endDateNormalized
                )

                // Una fecha está en el rango si: departureDate >= startDate Y departureDate <= endDate
                return departureDateNormalized >= startDateNormalized && departureDateNormalized <= endDateNormalized
              } catch (e) {
                console.error('Error procesando fecha del tour:', e, avail)
                return false
              }
            })
          })

          console.log('Resultados después de filtrar por fechas:', filteredResults.length)
        } catch (error) {
          console.error('Error en el filtrado por fechas:', error)
        }
      }

      setSearchResults({
        ...allTours,
        data: filteredResults
      })
    } catch (error) {
      console.error('Error searching tours:', error)
      setSearchResults({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, advancedSearchParams, allTours, loadAllTours])

  // Efecto para manejar búsquedas
  useEffect(() => {
    // Ejecutar búsqueda siempre que cambie el término o los parámetros avanzados
    const delay = setTimeout(() => {
      console.log('Iniciando búsqueda con término:', searchTerm)
      console.log('Parámetros avanzados:', advancedSearchParams)
      searchTours()
    }, 300) // Debounce search por 300ms

    return () => clearTimeout(delay)
  }, [searchTerm, advancedSearchParams, searchTours])

  // Función para generar sugerencias basadas en el término de búsqueda
  const generateSuggestions = useCallback(
    searchTerm => {
      if (!allTours?.data || !searchTerm.trim()) {
        setSuggestions([])
        return
      }

      const lowercaseSearchTerm = searchTerm.toLowerCase().trim()
      const suggestionsSet = new Set()

      allTours.data.forEach(tour => {
        // Buscar en nombre
        if (tour.name?.toLowerCase().includes(lowercaseSearchTerm)) {
          suggestionsSet.add(
            JSON.stringify({
              text: tour.name,
              type: 'title',
              icon: 'travel_explore'
            })
          )
        }
        // Buscar en país
        if (tour.destination?.country?.toLowerCase().includes(lowercaseSearchTerm)) {
          suggestionsSet.add(
            JSON.stringify({
              text: tour.destination.country,
              type: 'country',
              icon: 'pin_drop '
            })
          )
        }
        // Buscar en ciudad
        if (tour.destination?.city?.name?.toLowerCase().includes(lowercaseSearchTerm)) {
          suggestionsSet.add(
            JSON.stringify({
              text: tour.destination.city.name,
              type: 'city',
              icon: 'globe_location_pin'
            })
          )
        }
        // Buscar en región
        if (tour.destination?.region?.toLowerCase().includes(lowercaseSearchTerm)) {
          suggestionsSet.add(
            JSON.stringify({
              text: tour.destination.region,
              type: 'region',
              icon: 'globe_location_pin'
            })
          )
        }
        // Buscar en tags
        if (Array.isArray(tour.tags)) {
          tour.tags.forEach(tag => {
            if (typeof tag === 'string' && tag.toLowerCase().includes(lowercaseSearchTerm)) {
              suggestionsSet.add(
                JSON.stringify({
                  text: tag,
                  type: 'tag',
                  icon: 'bookmarks'
                })
              )
            }
          })
        }
      })

      // Convertir el Set a Array, parsear los JSON strings y limitar a 5 sugerencias
      setSuggestions(
        Array.from(suggestionsSet)
          .map(item => JSON.parse(item))
          .slice(0, 5)
      )
    },
    [allTours]
  )

  // Actualizar sugerencias cuando cambia el término de búsqueda
  useEffect(() => {
    generateSuggestions(searchTerm)
  }, [searchTerm, generateSuggestions])

  const value = {
    searchTerm,
    searchResults,
    loading,
    suggestions,
    advancedSearchParams,
    toursAvailability,
    updateSearchTerm,
    updateAdvancedSearchParams,
    searchTours,
    loadAllTours,
    loadAllRandomTours
  }

  // Función para escuchar el evento de creación de tour y añadirlo a los resultados actuales
  useEffect(() => {
    const handleTourCreated = event => {
      console.log('SearchContext: Tour creado evento recibido:', event.detail)

      // Si tenemos los resultados actuales
      if (allTours && allTours.data && Array.isArray(allTours.data)) {
        // Añadir el nuevo tour a la lista existente
        const newTour = event.detail

        if (newTour && newTour.id) {
          // Verificar si el tour ya existe en la lista para evitar duplicados
          const tourExists = allTours.data.some(tour => tour.id === newTour.id)

          if (!tourExists) {
            const updatedTours = {
              ...allTours,
              // Añadir al principio para visibilidad inmediata
              data: [newTour, ...allTours.data]
            }

            console.log('SearchContext: Añadiendo tour a la lista localmente.')

            // Actualizar el estado de tours y resultados de búsqueda localmente
            setAllTours(updatedTours)
            setSearchResults(updatedTours)
          }
        }
      }
    }

    window.addEventListener('tour-created', handleTourCreated)
    return () => window.removeEventListener('tour-created', handleTourCreated)
  }, [allTours]) // Ya no depende de loadAllTours

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default SearchContext
