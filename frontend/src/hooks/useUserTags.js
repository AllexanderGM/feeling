import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '@config/config'

const useUserTags = () => {
  const [popularTags, setPopularTags] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener tags populares
  const fetchPopularTags = useCallback(async (limit = 20) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tags/popular?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Error al obtener tags populares')
      }

      const data = await response.json()
      setPopularTags(data.data || data) // Manejar formato con/sin wrapper
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching popular tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar tags
  const searchTags = useCallback(async (query = '', limit = 20) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: limit.toString() })
      if (query.trim()) {
        params.append('query', query.trim())
      }

      const response = await fetch(`${API_URL}/tags/search?${params}`)

      if (!response.ok) {
        throw new Error('Error al buscar tags')
      }

      const data = await response.json()
      setSearchResults(data.data || data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error searching tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener sugerencias por categoría (requiere autenticación)
  const getSuggestedTagsByCategory = useCallback(async categoryInterest => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')

      if (!token) {
        // Sin token, usar tags populares por categoría
        return await fetchTagsByCategory(categoryInterest)
      }

      const response = await fetch(`${API_URL}/tags/suggestions/category`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Fallback a tags populares si falla
        return await fetchTagsByCategory(categoryInterest)
      }

      const data = await response.json()
      return data.data || data
    } catch (err) {
      setError(err.message)
      // Fallback en caso de error
      return await fetchTagsByCategory(categoryInterest)
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener tags populares por categoría específica
  const fetchTagsByCategory = useCallback(async (categoryInterest, limit = 15) => {
    try {
      const response = await fetch(`${API_URL}/tags/popular/category/${categoryInterest}?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Error al obtener tags por categoría')
      }

      const data = await response.json()
      return data.data || data
    } catch (err) {
      setError(err.message)
      return []
    }
  }, [])

  // Cargar tags populares al montar
  useEffect(() => {
    fetchPopularTags()
  }, [fetchPopularTags])

  return {
    popularTags,
    searchResults,
    loading,
    error,
    fetchPopularTags,
    searchTags,
    getSuggestedTagsByCategory,
    fetchTagsByCategory
  }
}

export default useUserTags
