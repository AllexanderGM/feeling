import { Spinner, Button } from '@heroui/react'
import { useSearch } from '@context/SearchContext'
import { useState, useEffect, useMemo, useCallback } from 'react'
import CardMain from '@components/ui/CardTour.jsx'
import TourPageControls from '@components/TourPageControls.jsx'
import { normalizeWords } from '@utils/normalizeWords.js'
import './allTours.scss'

const ToursPage = () => {
  const { searchResults, loading, searchTerm, loadAllTours, updateSearchTerm } = useSearch()
  const { success, data = [] } = searchResults || {}
  const ITEMS_PER_PAGE = 9
  const [currentPage, setCurrentPage] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [filterValue, setFilterValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const emptyPlaces = success && data.length === 0
  const isSearching = searchTerm.trim() !== '' || filterValue.trim() !== ''

  // Cargar tours ordenados al montar el componente
  useEffect(() => {
    loadAllTours()
  }, [loadAllTours])

  // Extraer categorías únicas de los tours para el filtro
  const statusOptions = useMemo(() => {
    const categoriesSet = new Set()

    data.forEach(tour => {
      if (Array.isArray(tour.tags)) {
        tour.tags.forEach(tag => {
          categoriesSet.add(tag)
        })
      }
    })

    return Array.from(categoriesSet).map(category => ({
      name: normalizeWords(category),
      uid: category
    }))
  }, [data])

  // Filtrar los tours según el término de búsqueda local y filtros de categoría
  const filteredTours = useMemo(() => {
    let filtered = [...data]

    // Filtrar por término de búsqueda local
    if (filterValue.trim()) {
      const searchTermLower = filterValue.toLowerCase().trim()
      filtered = filtered.filter(
        tour =>
          tour.name.toLowerCase().includes(searchTermLower) ||
          tour.description.toLowerCase().includes(searchTermLower) ||
          (tour.destination?.country && tour.destination.country.toLowerCase().includes(searchTermLower)) ||
          (tour.destination?.city?.name && tour.destination.city.name.toLowerCase().includes(searchTermLower)) ||
          (Array.isArray(tour.tags) && tour.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      )
    }

    // Filtrar por categoría
    if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
      filtered = filtered.filter(tour => {
        if (Array.isArray(tour.tags)) {
          return tour.tags.some(tag => Array.from(statusFilter).includes(tag))
        }
        return false
      })
    }

    return filtered
  }, [data, filterValue, statusFilter, statusOptions.length])

  // Calcular elementos visibles
  const visibleItems = currentPage * ITEMS_PER_PAGE
  const hasMoreItems = filteredTours.length > visibleItems

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowScrollTop(scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Escuchar evento de creación de tour
  useEffect(() => {
    const handleTourCreated = () => {
      console.log('Tour creado detectado en ToursPage, recargando tours ordenados...')
      loadAllTours() // Recargar los tours cuando se crea uno nuevo
    }

    window.addEventListener('tour-created', handleTourCreated)
    return () => window.removeEventListener('tour-created', handleTourCreated)
  }, [loadAllTours])

  // Reiniciar paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filterValue, statusFilter])

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleClear = useCallback(() => {
    setFilterValue('')
    updateSearchTerm('')
  }, [updateSearchTerm])

  const handleSearchChange = useCallback(
    value => {
      setFilterValue(value)
      // Actualizar el contexto después de un breve retraso para evitar múltiples búsquedas
      const timer = setTimeout(() => {
        updateSearchTerm(value)
      }, 300)

      return () => clearTimeout(timer)
    },
    [updateSearchTerm]
  )

  // Mensaje de resultados discreto
  const resultMessage = useMemo(() => {
    if (loading) return null
    if (!success) return 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.'

    if (isSearching) {
      return filteredTours.length === 0
        ? `No se encontraron tours que coincidan con tu búsqueda "${filterValue || searchTerm}".`
        : `Se encontraron ${filteredTours.length} tours para "${filterValue || searchTerm}"`
    }

    return emptyPlaces ? 'No hay tours disponibles en este momento.' : null
  }, [loading, success, isSearching, filterValue, searchTerm, filteredTours.length, emptyPlaces])

  return (
    <div className="tours_body-container">
      {/* Hero Section con título principal */}
      <div className="hero-section">
        <h1 className="title">Explora Nuestros Tours</h1>
        <p className="subtitle">Descubre destinos increíbles y experiencias únicas en cada rincón del mundo.</p>

        {/* Controles de búsqueda y filtrado justo debajo del título/subtítulo */}
        <TourPageControls
          filterValue={filterValue}
          onClear={handleClear}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          loading={loading}
          error={null}
          totalItems={data.length}
        />
      </div>

      {/* Mensaje de resultados (discreto) */}
      {resultMessage && (
        <div className="result-message text-sm text-gray-500 mb-4 max-w-6xl w-full px-4 sm:px-6 lg:px-8 text-left">{resultMessage}</div>
      )}

      <div className="tours_body-content">
        {loading ? (
          <div className="grid content-center gap-8">
            <Spinner classNames={{ label: 'text-foreground mt-4' }} label="Cargando" variant="wave" />
          </div>
        ) : success ? (
          <>
            {filteredTours.length > 0 ? (
              <div className="tours_body-grid">
                {filteredTours.slice(0, visibleItems).map(place => (
                  <CardMain key={place.id} data={place} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
                <p className="text-lg text-gray-500 mt-4">No se encontraron tours que coincidan con tu búsqueda.</p>
                <Button color="primary" variant="light" className="mt-4" onPress={handleClear}>
                  Ver todos los tours
                </Button>
              </div>
            )}

            {hasMoreItems && (
              <div className="flex justify-center mt-8">
                <Button color="primary" variant="flat" onPress={handleLoadMore} className="px-8">
                  <span className="material-symbols-outlined mr-2">add</span>
                  Cargar más tours
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="grid content-center gap-8">
            <p className="text-center text-gray-500">Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.</p>
          </div>
        )}
      </div>

      <Button
        isIconOnly
        color="primary"
        variant="flat"
        onPress={scrollToTop}
        className={`fixed right-[4vw] bottom-24 z-50 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
        aria-label="Volver arriba">
        <span className="material-symbols-outlined text-2xl">arrow_upward</span>
      </Button>
    </div>
  )
}

export default ToursPage
