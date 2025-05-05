import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SearchProvider } from '@context/SearchContext'
import { Spinner, Button } from '@heroui/react'
import CardTour from '@components/ui/CardTour'
import { getToursByCategory } from '@services/tourService'
import { normalizeWords } from '@utils/normalizeWords'

import './categoryPage.scss'

// Mapeo de categorías en inglés (backend) a español (frontend)
const TAG_MAPPING = {
  BEACH: 'Playa',
  VACATION: 'Vacaciones',
  ADVENTURE: 'Aventura',
  ECOTOURISM: 'Ecoturismo',
  LUXURY: 'Lujo',
  CITY: 'Ciudad',
  MOUNTAIN: 'Montaña',
  CRUISE: 'Crucero',
  ADRENALIN: 'Adrenalina'
}

// Mapeo inverso (español a inglés)
const REVERSE_TAG_MAPPING = Object.entries(TAG_MAPPING).reduce((acc, [key, value]) => ({ ...acc, [value.toLowerCase()]: key }), {})

// Mapeo de colores para las categorías
const CATEGORY_COLORS = {
  playa: 'bg-blue-50 text-blue-600',
  vacaciones: 'bg-emerald-50 text-emerald-600',
  aventura: 'bg-amber-50 text-amber-600',
  ecoturismo: 'bg-lime-50 text-lime-600',
  lujo: 'bg-purple-50 text-purple-600',
  ciudad: 'bg-rose-50 text-rose-600',
  montaña: 'bg-teal-50 text-teal-600',
  crucero: 'bg-indigo-50 text-indigo-600',
  adrenalina: 'bg-orange-50 text-orange-600'
}

const CategoryPage = () => {
  const { categoryName } = useParams()
  const [loading, setLoading] = useState(true)
  const [tours, setTours] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchToursByCategory = async () => {
      // Hacer scroll al principio de la página cuando cambia la categoría
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setLoading(true)
      setError(null)

      try {
        // Obtener el tag en inglés desde el nombre de categoría en español
        const categoryTag = REVERSE_TAG_MAPPING[categoryName.toLowerCase()]

        if (!categoryTag) {
          throw new Error(`Categoría no válida: ${categoryName}`)
        }

        // Obtener tours filtrados por categoría
        const response = await getToursByCategory(categoryTag)

        if (!response.success) {
          throw new Error('Error al cargar los tours de esta categoría')
        }

        setTours(response.data)
      } catch (err) {
        console.error('Error al cargar tours por categoría:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchToursByCategory()
  }, [categoryName])

  // Obtener el nombre y la información de la categoría
  const displayCategoryName = normalizeWords(categoryName)

  // Obtener información del ícono según la categoría
  const getCategoryInfo = categoryName => {
    // Buscar en las categorías definidas
    const category = Object.entries(TAG_MAPPING).find(([_, value]) => value.toLowerCase() === categoryName.toLowerCase())

    // Mapeo de íconos
    const iconMap = {
      BEACH: 'pool',
      VACATION: 'beach_access',
      ADVENTURE: 'hiking',
      ECOTOURISM: 'eco',
      LUXURY: 'hotel_class',
      CITY: 'location_city',
      MOUNTAIN: 'landscape',
      CRUISE: 'directions_boat',
      ADRENALIN: 'paragliding'
    }

    // Mapeo de descripciones por categoría
    const descriptionMap = {
      BEACH: 'Descubre las mejores playas con aguas cristalinas, arenas blancas y paisajes impresionantes para tus vacaciones perfectas.',
      VACATION: 'Experiencias de vacaciones todo incluido para relajarte y disfrutar sin preocupaciones.',
      ADVENTURE: 'Tours de aventura para los amantes de la adrenalina y experiencias únicas en entornos naturales.',
      ECOTOURISM: 'Vive experiencias sostenibles y respetuosas con el medio ambiente mientras descubres la naturaleza.',
      LUXURY: 'Experiencias exclusivas con los más altos estándares de calidad y confort para viajeros exigentes.',
      CITY: 'Explora las ciudades más fascinantes del mundo, su cultura, arquitectura e historia con tours urbanos.',
      MOUNTAIN: 'Aventuras en las montañas más impresionantes con paisajes de ensueño y actividades al aire libre.',
      CRUISE: 'Navega por los mares y descubre varios destinos en un solo viaje con nuestra selección de cruceros.',
      ADRENALIN: 'Experiencias extremas para quienes buscan emociones fuertes y desafíos.'
    }

    if (category) {
      return {
        icon: iconMap[category[0]] || 'category',
        description: descriptionMap[category[0]] || `Tours seleccionados de ${displayCategoryName}.`
      }
    }

    return {
      icon: 'category',
      description: `Tours seleccionados de ${displayCategoryName}.`
    }
  }

  // Obtener el color para la categoría actual
  const getCategoryColor = category => {
    return CATEGORY_COLORS[category.toLowerCase()] || 'bg-gray-50 text-gray-600'
  }

  // Información de la categoría actual
  const categoryInfo = getCategoryInfo(categoryName)

  return (
    <SearchProvider>
      <div className="category-page">
        <div className="category-page-header">
          <div className={`category-page-icon ${getCategoryColor(categoryName)}`}>
            <span className="material-symbols-outlined">{categoryInfo.icon}</span>
          </div>

          <h1 className="category-page-title">Tours de {displayCategoryName}</h1>

          <p className="category-page-description">{categoryInfo.description}</p>

          {!loading && tours.length > 0 && (
            <p className="category-page-count">
              <span className="material-symbols-outlined mr-1" style={{ fontSize: '16px' }}>
                tour
              </span>
              {tours.length} {tours.length === 1 ? 'tour encontrado' : 'tours encontrados'}
            </p>
          )}
        </div>

        {error && <div className="p-4 mt-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="tours_body-content">
          {loading ? (
            <div className="grid content-center gap-8 py-12">
              <Spinner classNames={{ label: 'text-foreground mt-4' }} label="Cargando" variant="wave" />
            </div>
          ) : tours.length > 0 ? (
            <div className="tours_body-grid">
              {tours.map(tour => (
                <CardTour key={tour.id} data={tour} />
              ))}
            </div>
          ) : (
            <div className="grid content-center gap-8 py-12">
              <p className="text-center text-gray-500">
                No se encontraron tours de {displayCategoryName}. Por favor, intenta con otra categoría.
              </p>
              <div className="flex justify-center">
                <Link to="/">
                  <Button color="primary" variant="flat">
                    <span className="material-symbols-outlined mr-2">home</span>
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Categorías relacionadas */}
          {!loading && (
            <div className="category-page-related">
              <h2 className="category-page-related-title">Explora otras categorías</h2>
              <div className="category-page-related-grid">
                {Object.entries(TAG_MAPPING)
                  .filter(([key, value]) => value.toLowerCase() !== categoryName.toLowerCase())
                  .slice(0, 4) // Solo mostrar 4 categorías relacionadas
                  .map(([key, value]) => {
                    // Obtener ícono para cada categoría
                    const iconMap = {
                      BEACH: 'pool',
                      VACATION: 'beach_access',
                      ADVENTURE: 'hiking',
                      ECOTOURISM: 'eco',
                      LUXURY: 'hotel_class',
                      CITY: 'location_city',
                      MOUNTAIN: 'landscape',
                      CRUISE: 'directions_boat',
                      ADRENALIN: 'paragliding'
                    }

                    return (
                      <Link
                        key={key}
                        to={`/categoria/${value.toLowerCase()}`}
                        className={`category-page-related-item ${CATEGORY_COLORS[value.toLowerCase()] || 'bg-gray-50'}`}>
                        <span className="material-symbols-outlined category-page-related-item-icon">{iconMap[key]}</span>
                        <span className="category-page-related-item-label">{value}</span>
                      </Link>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </SearchProvider>
  )
}

export default CategoryPage
