import { Spinner, Button } from '@heroui/react'
import { useSearch } from '@context/SearchContext'
import { useState, useEffect } from 'react'
import { Plus, ArrowUp } from 'lucide-react'

import CardMain from '../../../components/ui/CardTour.jsx'

import './body.scss'

const Body = () => {
  const { searchResults, loading, searchTerm, loadAllRandomTours } = useSearch()
  const { success, data = [] } = searchResults || {}
  const ITEMS_PER_PAGE = 9 // constante para la cantidad de elementos por página
  const [currentPage, setCurrentPage] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const emptyPlaces = success && data.length === 0
  const isSearching = searchTerm.trim() !== ''
  const visibleItems = currentPage * ITEMS_PER_PAGE
  const hasMoreItems = data.length > visibleItems

  // Cargar tours aleatorios al montar el componente
  useEffect(() => {
    loadAllRandomTours()
  }, [loadAllRandomTours])

  useEffect(() => {
    // Función para controlar la visibilidad del botón de scroll
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Mostrar el botón cuando el scroll supere los 400px
      setShowScrollTop(scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    // Llamar handleScroll inicialmente para establecer el estado correcto
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Escuchar evento de creación de tour
  useEffect(() => {
    const handleTourCreated = () => {
      console.log('Tour creado detectado, recargando tours aleatorios...')
      loadAllRandomTours() // Recargar los tours cuando se crea uno nuevo
    }

    window.addEventListener('tour-created', handleTourCreated)
    return () => window.removeEventListener('tour-created', handleTourCreated)
  }, [loadAllRandomTours])

  // Determinar el título basado en el estado de búsqueda
  let title = 'Recomendaciones'
  if (isSearching) {
    if (emptyPlaces) {
      title = `No se encontraron resultados para "${searchTerm}"`
    } else {
      const resultCount = data.length
      title =
        resultCount === 1
          ? `Se encontró ${resultCount} tour para "${searchTerm}"`
          : `Se encontraron ${resultCount} tours para "${searchTerm}"`
    }
  } else if (emptyPlaces) {
    title = 'No hay tours disponibles...'
  }

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="home_body-container">
      <h1 className="title">{title}</h1>

      <div className="home_body-content">
        {loading ? (
          <div className="grid content-center gap-8">
            <Spinner classNames={{ label: 'text-foreground mt-4' }} label="Cargando" variant="wave" />
          </div>
        ) : success ? (
          <>
            <div className="home_body-grid">
              {data.slice(0, visibleItems).map(place => (
                <CardMain key={place.id} data={place} />
              ))}
            </div>
            {hasMoreItems && (
              <div className="flex justify-center mt-8">
                <Button color="primary" variant="flat" onPress={handleLoadMore} className="px-8">
                  <Plus className="mr-2" />
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

      {/* Botón flotante para volver arriba */}
      <Button
        isIconOnly
        color="primary"
        variant="flat"
        onPress={scrollToTop}
        className={`fixed right-[4vw] bottom-24 z-50 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
        aria-label="Volver arriba">
        <ArrowUp className="text-2xl" />
      </Button>
    </div>
  )
}

export default Body
