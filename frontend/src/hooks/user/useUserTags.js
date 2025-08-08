import { useState, useEffect, useCallback, useMemo } from 'react'
import { userTagsService } from '@services'
import { Logger } from '@utils/logger.js'

import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'

/**
 * Hook para manejar tags/intereses de usuario
 * Actualizado para usar el nuevo userTagsService con paginación
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

  // Función para cargar tags populares (usando el nuevo servicio con paginación)
  const loadPopularTags = useCallback(async (limit = 20) => {
    try {
      setError(null)
      // Usar el nuevo método paginado pero tomando solo los primeros resultados
      const result = await userTagsService.getPopularTagsLegacy(limit)
      const tagsArray = Array.isArray(result) ? result : result?.content || []
      setPopularTags(tagsArray)
      return tagsArray
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error loading popular tags', err)
      setError(err)
      setPopularTags([])
      return []
    }
  }, [])

  // Función para buscar tags - simplificada para evitar recreaciones
  const searchTags = useCallback(async (query, limit = 15) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return []
    }

    try {
      setSearchLoading(true)
      setError(null)

      // Usar el nuevo método de búsqueda con paginación
      const results = await userTagsService.searchTagsLegacy(query.trim(), limit)
      const resultsArray = Array.isArray(results) ? results : results?.content || []

      setSearchResults(resultsArray)
      return resultsArray
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error searching tags', error)
      setSearchResults([])
      setError(error)
      return []
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Función para obtener tags por categoría (método legacy mantenido)
  const getTagsByCategory = useCallback(async (categoryInterest, limit = 15) => {
    if (!categoryInterest) return []

    try {
      // Usar popular tags como fallback ya que no tenemos endpoint específico por categoría
      const result = await userTagsService.getPopularTagsLegacy(limit)
      const tagsArray = Array.isArray(result) ? result : result?.content || []
      return tagsArray
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting tags by category', error)
      return []
    }
  }, [])

  // Función para crear un nuevo tag
  const createTag = useCallback(async tagName => {
    const trimmedName = tagName?.trim()
    if (!trimmedName) return Promise.reject(new Error('El nombre del tag es requerido'))

    try {
      const result = await userTagsService.addTagToMyProfile(trimmedName)
      return result
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error creating tag', error)
      throw error
    }
  }, [])

  // Función para obtener mis tags
  const getMyTags = useCallback(async () => {
    try {
      const result = await userTagsService.getMyTags()
      return Array.isArray(result) ? result : result?.content || []
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting my tags', error)
      return []
    }
  }, [])

  // Función para actualizar mis tags
  const updateMyTags = useCallback(async tags => {
    try {
      const result = await userTagsService.addTagsToUser(tags)
      return result
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error updating tags', error)
      throw error
    }
  }, [])

  // Función para remover un tag
  const removeTag = useCallback(async tagId => {
    try {
      const result = await userTagsService.removeTagFromUser(tagId)
      return result
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error removing tag', error)
      throw error
    }
  }, [])

  // Función para obtener sugerencias de tags
  const getTagSuggestions = useCallback(async (limit = 10) => {
    try {
      const result = await userTagsService.getTagSuggestionsLegacy(limit)
      return Array.isArray(result) ? result : result?.content || []
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting tag suggestions', error)
      return []
    }
  }, [])

  // Función para obtener tags en tendencia
  const getTrendingTags = useCallback(async (limit = 15) => {
    try {
      const result = await userTagsService.getTrendingTagsLegacy(limit)
      return Array.isArray(result) ? result : result?.content || []
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting trending tags', error)
      return []
    }
  }, [])

  // ========================================
  // DATOS FORMATEADOS
  // ========================================

  // Tags formateados para uso en componentes
  const formattedPopularTags = useMemo(() => {
    // Verificar que popularTags sea un array antes de usar map
    if (!Array.isArray(popularTags)) {
      return []
    }

    return popularTags.map(tag => ({
      key: tag.id || tag.name || tag.tagName || Math.random().toString(),
      name: tag.name || tag.tagName || tag.label || '',
      label: tag.name || tag.tagName || tag.label || '',
      count: tag.usageCount || tag.count || 0,
      isPopular: true
    }))
  }, [popularTags])

  const formattedSearchResults = useMemo(() => {
    // Verificar que searchResults sea un array antes de usar map
    if (!Array.isArray(searchResults)) {
      return []
    }

    return searchResults.map(tag => ({
      key: tag.id || tag.name || tag.tagName || Math.random().toString(),
      name: tag.name || tag.tagName || tag.label || '',
      label: tag.name || tag.tagName || tag.label || '',
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
        await loadPopularTags(20)
      } catch (err) {
        Logger.error(Logger.CATEGORIES.USER, 'Error loading initial tags', err)
        setError(err)
        setPopularTags([])
      }
    }

    loadInitialTags()
  }, [loadPopularTags])

  // ========================================
  // UTILIDADES
  // ========================================

  // Limpiar resultados de búsqueda
  const clearSearchResults = useCallback(() => {
    setSearchResults([])
  }, [])

  // Recargar tags populares
  const refreshPopularTags = useCallback(() => {
    return loadPopularTags(20)
  }, [loadPopularTags])

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
    refreshPopularTags,

    // Getters de conveniencia
    hasPopularTags: formattedPopularTags.length > 0,
    hasSearchResults: formattedSearchResults.length > 0,
    totalPopularTags: formattedPopularTags.length,
    totalSearchResults: formattedSearchResults.length
  }
}

export default useUserTags
