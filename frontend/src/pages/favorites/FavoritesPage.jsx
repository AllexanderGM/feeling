import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import CardTour from '@components/ui/CardTour'
import { useFavorites } from '@context/FavoritesContext'
import { useAuth } from '@context/AuthContext'

import './favoritesPage.scss'

const FavoritesPage = () => {
  const { favorites, clearFavorites } = useFavorites()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirigir a iniciar sesión si no está autenticado
  if (!user) {
    return (
      <div className="favorites-container not-authenticated">
        <div className="favorites-empty">
          <span className="material-symbols-outlined favorites-empty-icon">lock</span>
          <h2>Acceso restringido</h2>
          <p>Debes iniciar sesión para guardar y ver tus tours favoritos.</p>
          <Button color="primary" onPress={() => navigate('/login')}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <h1 className="favorites-title">Mis tours guardados</h1>
        <div className="favorites-empty">
          <span className="material-symbols-outlined favorites-empty-icon">favorite_border</span>
          <h2>No hay tours guardados todavía</h2>
          <p>¡Explora nuestros tours y guarda tus favoritos!</p>
          <Button color="primary" onPress={() => navigate('/')}>
            Explorar tours
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1 className="favorites-title">Mis tours guardados</h1>
        <Button
          color="danger"
          variant="light"
          onPress={clearFavorites}
          startContent={<span className="material-symbols-outlined">delete</span>}>
          Limpiar lista
        </Button>
      </div>

      <div className="favorites-counter">
        <span className="material-symbols-outlined">favorite</span>
        <p>
          {favorites.length} {favorites.length === 1 ? 'tour guardado' : 'tours guardados'}
        </p>
      </div>

      <div className="favorites-grid">
        {favorites.map(tour => (
          <CardTour key={tour.id} data={tour} />
        ))}
      </div>
    </div>
  )
}

export default FavoritesPage
