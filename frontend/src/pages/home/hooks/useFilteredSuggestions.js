import { useMemo } from 'react'

/**
 * Custom hook para filtrar y ordenar sugerencias de usuarios
 * @param {Array} suggestions - Array de sugerencias de usuarios
 * @param {Object} filters - Objeto con los filtros aplicados
 * @param {Set} removedCards - Set con emails de cards removidas
 * @returns {Array} Array de sugerencias filtradas y ordenadas
 */
export const useFilteredSuggestions = (suggestions, filters, removedCards) => {
  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return []

    // Usar email como identificador único en lugar de id
    let filtered = suggestions.filter(user => !removedCards.has(user.profile?.email))

    // Aplicar filtros por categoría
    if (filters.categoryInterest !== 'all') {
      filtered = filtered.filter(user => {
        const userCategory = user.status?.categoryInterest || user.profile?.categoryInterest

        return userCategory?.toLowerCase() === filters.categoryInterest.toLowerCase()
      })
    }

    // Filtro por edad
    if (filters.ageMin || filters.ageMax) {
      filtered = filtered.filter(user => {
        const age = user.profile?.age || 0

        return age >= filters.ageMin && age <= filters.ageMax
      })
    }

    // Filtro por verificados
    if (filters.showVerifiedOnly) {
      filtered = filtered.filter(user => user.status?.verified)
    }

    // Filtro por fotos
    if (filters.showWithPhotosOnly) {
      filtered = filtered.filter(user => user.profile?.images && user.profile.images.length > 0)
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const ageA = a.profile?.age || 0
          const ageB = b.profile?.age || 0

          return ageA - ageB // Más jóvenes primero
        })
        break
      default:
        filtered.sort(() => Math.random() - 0.5)
        break
    }

    return filtered
  }, [suggestions, filters, removedCards])

  return filteredSuggestions
}
