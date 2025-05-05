import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@heroui/react'
import ShareButtons from '@components/ShareButtons'
import DetalleGallery from '@components/DetalleGallery'
import BodyDetalle from '@components/BodyDetalle'
import { Helmet } from 'react-helmet-async'
import { normalizeAvailability } from '@utils/dateUtils.js'
import WhatsAppBtn from '@components/WhatsAppBtn'
import { useFavorites } from '@context/FavoritesContext'

import './detalleTour.scss'

const DetalleTour = () => {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const URL = import.meta.env.VITE_URL_BACK
  const { toggleFavorite, isFavorite, isAuthenticated } = useFavorites()

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log(`Obteniendo datos del tour ID: ${id}`)
        const response = await fetch(`${URL}/tours/${id}`)

        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status}`)
        }

        const data = await response.json()
        console.log('Tour completo obtenido:', data)

        // Verificar específicamente los datos de disponibilidad
        console.log('Datos de disponibilidad en respuesta:', data.availability)

        const normalizedAvailability = normalizeAvailability(data.availability)
        console.log('Disponibilidad normalizada:', normalizedAvailability)

        // Crear un objeto de tour normalizado con los datos
        const tourNormalizado = {
          ...data,
          availability: normalizedAvailability
        }

        console.log('Tour normalizado para pasar a componentes hijos:', tourNormalizado)
        setTour(tourNormalizado)
      } catch (error) {
        console.error('Error obteniendo tour:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [URL, id])

  // Manejador para el botón de favoritos
  const handleFavoriteClick = () => {
    if (tour) {
      toggleFavorite(tour)
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>
  }

  // Construir la URL completa para compartir
  const currentUrl = window.location.href

  // Obtener primera imagen para metadatos
  const imageUrl = tour && tour.images && tour.images[0] ? tour.images[0] : 'https://via.placeholder.com/1200x630?text=Glocal+Tours'

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-100 mb-28 mt-8">
      {tour ? (
        <>
          {/* Metadatos para Open Graph y Twitter Cards */}
          <Helmet>
            <title>{tour.name} | Glocal Tours</title>
            <meta name="description" content={tour.description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={`${tour.name} | Glocal Tours`} />
            <meta property="og:description" content={tour.description} />
            <meta property="og:image" content={imageUrl} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={`${tour.name} | Glocal Tours`} />
            <meta property="twitter:description" content={tour.description} />
            <meta property="twitter:image" content={imageUrl} />
          </Helmet>

          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b rounded-tl-xl rounded-tr-xl">
            <div className="max-w-6xl mx-auto flex items-center px-4 py-3">
              {/* Contenedor izquierdo con ancho fijo */}
              <div className="w-12 flex justify-start">
                <Link to="/" className="flex items-center text-gray-600 hover:text-primary-500 transition-colors">
                  <span className="material-symbols-outlined">arrow_back_ios</span>
                </Link>
              </div>

              <h1 className="flex-grow text-gray-800 text-center text-xl sm:text-1xl font-bold truncate">{tour.name}</h1>

              {/* Contenedor derecho con ancho fijo igual al izquierdo */}
              <div className="w-12 flex justify-end">
                <div className="flex items-center space-x-1">
                  <WhatsAppBtn phoneNumber="573053328285" message="Buenas! Quisiera mas información sobre el tour!" />

                  <Button
                    color="primary"
                    variant="light"
                    isIconOnly
                    aria-label={
                      isAuthenticated
                        ? isFavorite(tour.id)
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                        : 'Iniciar sesión para guardar'
                    }
                    className="min-w-0 w-10 h-10 p-0 flex items-center justify-center"
                    onPress={handleFavoriteClick}>
                    <span className={`material-symbols-outlined ${isFavorite(tour.id) ? 'favorite-active' : ''}`}>
                      {isFavorite(tour.id) ? 'favorite' : 'favorite_border'}
                    </span>
                  </Button>

                  <ShareButtons tour={tour} />
                </div>
              </div>
            </div>
          </div>

          <DetalleGallery tour={tour} />
          <BodyDetalle tour={tour} />
        </>
      ) : (
        <p className="text-center mt-10">No se encontraron datos del tour</p>
      )}
    </div>
  )
}

export default DetalleTour
