import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from './AuthContext.jsx'

const FavoritesContext = createContext()

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  // Cargar favoritos desde localStorage en la carga inicial
  useEffect(() => {
    if (user) {
      // Usa el ID de usuario para almacenar favoritos por separado para cada usuario
      const storedFavorites = localStorage.getItem(`favorites_${user.id}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } else {
      // Resetea favoritos cuando el usuario cierra sesión
      setFavorites([])
    }
  }, [user])

  // Guarda favoritos en localStorage cuando cambian
  useEffect(() => {
    if (user && favorites.length > 0) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
    } else if (user) {
      // If favorites are empty but user exists, remove the item
      localStorage.removeItem(`favorites_${user.id}`)
    }
  }, [favorites, user])

  // Add or remove a tour from favorites
  const toggleFavorite = tour => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login')
      return
    }

    setFavorites(prevFavorites => {
      // Check if tour is already in favorites
      const isFavorite = prevFavorites.some(fav => fav.id === tour.id)

      if (isFavorite) {
        // Remove from favorites
        return prevFavorites.filter(fav => fav.id !== tour.id)
      } else {
        // Add to favorites
        return [...prevFavorites, tour]
      }
    })
  }

  // Clear all favorites
  const clearFavorites = () => {
    if (user) {
      setFavorites([])
      localStorage.removeItem(`favorites_${user.id}`)
    }
  }

  // Check if a tour is in favorites
  const isFavorite = tourId => {
    return favorites.some(fav => fav.id === tourId)
  }

  const value = {
    favorites,
    toggleFavorite,
    clearFavorites,
    isFavorite,
    isAuthenticated: !!user
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export default FavoritesContext
