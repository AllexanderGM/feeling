/**
 * Servicios de Matches - Estructura modular alineada con el backend
 *
 * Esta arquitectura refleja los controladores del backend:
 * - matchInteractionService → MatchInteractionController
 * - matchQueryService → MatchQueryController
 * - matchFavoriteService → MatchFavoriteController
 * - matchPlanService → MatchPlanClientController
 * - matchStatisticsService → MatchStatisticsController
 * - matchSuggestionService → MatchSuggestionController
 * - matchAdminService → MatchAdminMatchController
 */

// Servicios especializados
export { default as matchInteractionService } from './matchInteractionService.js'
export { default as matchQueryService } from './matchQueryService.js'
export { default as matchFavoriteService } from './matchFavoriteService.js'
export { default as matchPlanService } from './matchPlanService.js'
export { default as matchStatisticsService } from './matchStatisticsService.js'
export { default as matchSuggestionService } from './matchSuggestionService.js'
export { default as matchAdminService } from './matchAdminService.js'

// Servicio legacy (mantener por retrocompatibilidad temporal)
export { default as matchService } from './matchService.js'

// Export por defecto del servicio principal (legacy)
export { default } from './matchService.js'
