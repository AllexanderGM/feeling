import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_URL } from '@config/config'

/**
 * Hook para manejar tags/intereses de usuario
 * @returns {Object} Estado y funciones para tags
 */
const useUserTags = () => {
  const [popularTags, setPopularTags] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener token de autenticación
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  }, [])

  // Cargar tags populares al montar el componente
  useEffect(() => {
    loadPopularTags()
  }, [])

  // Función para cargar tags populares
  const loadPopularTags = useCallback(
    async (limit = 20) => {
      try {
        setLoading(true)
        setError(null)

        const token = getAuthToken()
        const headers = {
          'Content-Type': 'application/json'
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(`${API_URL}/tags/popular?limit=${limit}`, {
          headers
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setPopularTags(data || [])
      } catch (err) {
        console.error('Error cargando tags populares:', err)
        setError(err.message || 'Error al cargar tags populares')

        // Fallback a tags hardcodeados
        setPopularTags([
          { name: 'Música', tagName: 'Música' },
          { name: 'Deportes', tagName: 'Deportes' },
          { name: 'Lectura', tagName: 'Lectura' },
          { name: 'Cine', tagName: 'Cine' },
          { name: 'Viajes', tagName: 'Viajes' },
          { name: 'Cocina', tagName: 'Cocina' },
          { name: 'Arte', tagName: 'Arte' },
          { name: 'Tecnología', tagName: 'Tecnología' },
          { name: 'Naturaleza', tagName: 'Naturaleza' },
          { name: 'Fotografía', tagName: 'Fotografía' }
        ])
      } finally {
        setLoading(false)
      }
    },
    [getAuthToken]
  )

  // Función para buscar tags
  const searchTags = useCallback(
    async (query, limit = 15) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([])
        return []
      }

      try {
        setSearchLoading(true)
        setError(null)

        const token = getAuthToken()
        const headers = {
          'Content-Type': 'application/json'
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(`${API_URL}/tags/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`, { headers })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const results = data || []

        setSearchResults(results)
        return results
      } catch (err) {
        console.error('Error buscando tags:', err)
        setError(err.message || 'Error al buscar tags')

        // Fallback a filtro local de tags populares
        const localResults = popularTags.filter(tag => (tag.name || tag.tagName || '').toLowerCase().includes(query.toLowerCase()))

        setSearchResults(localResults)
        return localResults
      } finally {
        setSearchLoading(false)
      }
    },
    [getAuthToken, popularTags]
  )

  // Función para obtener tags por categoría
  const getTagsByCategory = useCallback(
    async (categoryInterest, limit = 15) => {
      try {
        const token = getAuthToken()

        if (!token || !categoryInterest) {
          return []
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }

        const response = await fetch(`${API_URL}/tags/popular/category/${categoryInterest}?limit=${limit}`, { headers })

        if (!response.ok) {
          console.warn(`No se pudieron cargar tags para categoría ${categoryInterest}`)
          return []
        }

        const data = await response.json()
        return data || []
      } catch (err) {
        console.error(`Error obteniendo tags para categoría ${categoryInterest}:`, err)
        return []
      }
    },
    [getAuthToken]
  )

  // Tags formateados para uso en componentes
  const formattedPopularTags = useMemo(() => {
    return popularTags.map(tag => ({
      key: tag.id || tag.name || tag.tagName,
      name: tag.name || tag.tagName || tag.label,
      label: tag.name || tag.tagName || tag.label,
      count: tag.usageCount || tag.count || 0,
      isPopular: true
    }))
  }, [popularTags])

  const formattedSearchResults = useMemo(() => {
    return searchResults.map(tag => ({
      key: tag.id || tag.name || tag.tagName,
      name: tag.name || tag.tagName || tag.label,
      label: tag.name || tag.tagName || tag.label,
      count: tag.usageCount || tag.count || 0,
      isSearchResult: true
    }))
  }, [searchResults])

  // Función para crear un nuevo tag
  const createTag = useCallback(
    async tagName => {
      try {
        const token = getAuthToken()

        if (!token) {
          throw new Error('Token de autenticación requerido')
        }

        const response = await fetch(`${API_URL}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: tagName.trim() })
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const newTag = await response.json()
        console.log('✅ Tag creado:', newTag)

        return newTag
      } catch (err) {
        console.error('Error creando tag:', err)
        throw err
      }
    },
    [getAuthToken]
  )

  // Limpiar resultados de búsqueda
  const clearSearchResults = useCallback(() => {
    setSearchResults([])
  }, [])

  return {
    // Estado
    popularTags: formattedPopularTags,
    searchResults: formattedSearchResults,
    loading,
    searchLoading,
    error,

    // Funciones
    searchTags,
    loadPopularTags,
    getTagsByCategory,
    createTag,
    clearSearchResults,

    // Utilidades
    hasPopularTags: formattedPopularTags.length > 0,
    hasSearchResults: formattedSearchResults.length > 0,
    totalPopularTags: formattedPopularTags.length,
    totalSearchResults: formattedSearchResults.length
  }
}

export default useUserTags
