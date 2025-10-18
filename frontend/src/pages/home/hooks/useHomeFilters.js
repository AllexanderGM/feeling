import { useState, useMemo, useCallback } from 'react'

import { DEFAULT_FILTERS } from '../constants/filterDefaults.js'

/**
 * Custom hook para manejar el estado y lógica de filtros
 * @returns {Object} Estado y funciones de filtros
 */
export const useHomeFilters = () => {
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0

    if (appliedFilters.categoryInterest !== 'all') count++
    if (appliedFilters.ageMin !== 18 || appliedFilters.ageMax !== 65) count++
    if (appliedFilters.distance !== 50) count++
    if (appliedFilters.relationshipType !== 'all') count++
    if (appliedFilters.showOnlineOnly) count++
    if (appliedFilters.showRecentActivity) count++
    if (appliedFilters.showVerifiedOnly) count++
    if (!appliedFilters.showWithPhotosOnly) count++
    if (appliedFilters.minCompatibility > 0) count++
    if (appliedFilters.educationLevel !== 'all') count++
    if (appliedFilters.hasJob !== 'all') count++
    if (appliedFilters.smokingPreference !== 'all') count++
    if (appliedFilters.drinkingPreference !== 'all') count++
    if (appliedFilters.sortBy !== 'compatibility') count++

    return count
  }, [appliedFilters])

  // Aplicar filtros
  const applyFilters = useCallback(newFilters => {
    setAppliedFilters(newFilters)
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setAppliedFilters(DEFAULT_FILTERS)
  }, [])

  return {
    appliedFilters,
    activeFiltersCount,
    applyFilters,
    resetFilters
  }
}
