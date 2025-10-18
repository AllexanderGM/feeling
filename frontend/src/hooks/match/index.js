/**
 * Hooks de Matches - Estructura modular alineada con el backend
 *
 * Esta arquitectura refleja los controladores del backend:
 * - useMatchInteractions → MatchInteractionController
 * - useMatchQuery → MatchQueryController
 * - useMatchFavorites → MatchFavoriteController
 * - useMatchPlans → MatchPlanClientController
 * - useMatchStatistics → MatchStatisticsController
 */

// Hooks especializados
export { default as useMatchInteractions } from './useMatchInteractions.js'
export { default as useMatchQuery } from './useMatchQuery.js'
export { default as useMatchFavorites } from './useMatchFavorites.js'
export { default as useMatchPlans } from './useMatchPlans.js'
export { default as useMatchStatistics } from './useMatchStatistics.js'
export { default as useDiscoveryCards } from '../../components/ui/userSuggestionCards/hooks/useDiscoveryCards.js'

// Hook legacy (mantener por retrocompatibilidad temporal)
export { default as useMatches } from './useMatches.js'

// Export por defecto del hook principal (legacy)
export { default } from './useMatches.js'
