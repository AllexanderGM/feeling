import { useState, useEffect, useCallback, useMemo } from 'react'
import userTagsService from '@services/userTagsService'
import useAsyncOperation from '@hooks/useAsyncOperation'

/**
 * Hook para manejar tags/intereses de usuario
 * @returns {Object} Estado y funciones para tags
 */
const useUserTags = () => {
  const [popularTags, setPopularTags] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hook centralizado para operaciones asíncronas - con configuración estable
  const asyncOptions = useMemo(
    () => ({
      showNotifications: false,
      autoHandleAuth: true
    }),
    []
  )

  const { loading, executeOperation, withLoading } = useAsyncOperation(asyncOptions)

  // ========================================
  // FUNCIONES PRINCIPALES
  // ========================================

  // Función para cargar tags populares
  const loadPopularTags = useCallback(
    async (limit = 20) => {
      const result = await withLoading(() => userTagsService.getPopularTags(limit), 'cargar tags populares')
      setPopularTags(result.success ? result.data : [])
    },
    [withLoading]
  )

  // Función para buscar tags - simplificada para evitar recreaciones
  const searchTags = useCallback(
    async (query, limit = 15) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([])
        return []
      }

      try {
        setSearchLoading(true)
        const results = await userTagsService.searchTags(query.trim(), limit)
        setSearchResults(results || [])
        return results || []
      } catch (error) {
        console.error('Error buscando tags:', error)
        setSearchResults([])
        return []
      } finally {
        setSearchLoading(false)
      }
    },
    [] // Sin dependencias para evitar recreaciones
  )

  // Función para obtener tags por categoría
  const getTagsByCategory = useCallback(
    async (categoryInterest, limit = 15) => {
      if (!categoryInterest) return []

      const result = await withLoading(
        () => userTagsService.getPopularTagsByCategory(categoryInterest, limit),
        `obtener tags para categoría ${categoryInterest}`
      )

      return result.success ? result.data || [] : []
    },
    [withLoading]
  )

  // Función para crear un nuevo tag
  const createTag = useCallback(
    tagName => {
      const trimmedName = tagName?.trim()
      if (!trimmedName) return Promise.reject(new Error('El nombre del tag es requerido'))
      return executeOperation(() => userTagsService.addTagToMyProfile(trimmedName), 'crear tag')
    },
    [executeOperation]
  )

  // Función para obtener mis tags
  const getMyTags = useCallback(async () => {
    const result = await withLoading(() => userTagsService.getMyTags(), 'obtener mis tags')
    return result.success ? result.data || [] : []
  }, [withLoading])

  // Función para actualizar mis tags
  const updateMyTags = useCallback(
    tags => executeOperation(() => userTagsService.updateMyTags(tags), 'actualizar mis tags'),
    [executeOperation]
  )

  // Función para remover un tag
  const removeTag = useCallback(
    tagName => executeOperation(() => userTagsService.removeTagFromMyProfile(tagName), 'remover tag'),
    [executeOperation]
  )

  // Función para obtener sugerencias de tags
  const getTagSuggestions = useCallback(
    async (limit = 10) => {
      const result = await withLoading(() => userTagsService.getTagSuggestions(limit), 'obtener sugerencias de tags')
      return result.success ? result.data || [] : []
    },
    [withLoading]
  )

  // Función para obtener tags en tendencia
  const getTrendingTags = useCallback(
    async (limit = 15) => {
      const result = await withLoading(() => userTagsService.getTrendingTags(limit), 'obtener tags en tendencia')
      return result.success ? result.data || [] : []
    },
    [withLoading]
  )

  // ========================================
  // DATOS FORMATEADOS
  // ========================================

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

  // ========================================
  // CARGA INICIAL DE TAGS POPULARES
  // ========================================
  useEffect(() => {
    const loadInitialTags = async () => {
      try {
        setError(null)
        const data = await userTagsService.getPopularTags(20)
        setPopularTags(data || [])
      } catch (err) {
        console.error('Error loading popular tags:', err)
        setError(err)
        setPopularTags([])
      }
    }

    loadInitialTags()
  }, []) // Solo ejecutar una vez al montar

  // ========================================
  // UTILIDADES
  // ========================================

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

    // Funciones principales
    searchTags,
    loadPopularTags,
    getTagsByCategory,
    createTag,
    getMyTags,
    updateMyTags,
    removeTag,
    getTagSuggestions,
    getTrendingTags,

    // Utilidades
    clearSearchResults,

    // Getters de conveniencia
    hasPopularTags: formattedPopularTags.length > 0,
    hasSearchResults: formattedSearchResults.length > 0,
    totalPopularTags: formattedPopularTags.length,
    totalSearchResults: formattedSearchResults.length
  }
}

export default useUserTags
