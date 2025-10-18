// ========================================
// ÍNDICE CENTRAL DE SERVICIOS
// ========================================
// Este archivo centraliza todos los servicios de la aplicación
// Estructura organizada por módulos con patrón unificado

// Servicios base
export { ServiceREST } from '@services/utils/serviceREST.js'
export { ServiceNoREST } from '@services/utils/serviceNoREST.js'
export { default as api, registerAuthCallbacks, registerRateLimitCallback } from '@services/utils/api.js'

// Módulo de autenticación
export { default as authService } from '@services/auth/authService.js'
export { default as passwordService } from '@services/auth/passwordService.js'
export { default as verificationService } from '@services/auth/verificationService.js'
export { default as oauthService } from '@services/auth/oauthService.js'

// Módulo de usuario
export { default as userService } from '@services/user/userService.js'
export {
  default as userAttributesService,
  getUserAttributes,
  getUserAttributesByType,
  createUserAttribute
} from '@services/user/userAttributesService.js'
export { default as userTagsService } from '@services/user/userTagsService.js'
export {
  default as userInterestsService,
  getUserInterests,
  getUserInterestById,
  createUserInterest,
  updateUserInterest,
  deleteUserInterest
} from '@services/user/userInterestsService.js'
export { default as userAnalyticsService } from '@services/user/userAnalyticsService.js'
export { default as userRoleService } from '@services/user/userRoleService.js'
export { default as userApprovalService } from '@services/user/userApprovalService.js'
export { default as userNotificationService } from '@services/user/userNotificationService.js'
export { default as userMediaService } from '@services/user/userMediaService.js'

// Módulo de eventos
export { default as eventService } from '@services/event/eventService.js'
export { default as bookingService } from '@services/event/bookingService.js'

// Módulo de matches
export { default as matchService } from '@services/match/matchService.js'
export { default as matchInteractionService } from '@services/match/matchInteractionService.js'
export { default as matchQueryService } from '@services/match/matchQueryService.js'
export { default as matchFavoriteService } from '@services/match/matchFavoriteService.js'
export { default as matchPlanService } from '@services/match/matchPlanService.js'
export { default as matchStatisticsService } from '@services/match/matchStatisticsService.js'
export { default as matchSuggestionService } from '@services/match/matchSuggestionService.js'

// Módulo de ubicación
export { default as geographicService } from '@services/location/geographicService.js'

// Módulo de soporte
export { default as complaintService } from '@services/support/complaintService.js'

// Módulo del sistema
export { default as configurationService } from '@services/system/configurationService.js'
export { default as apiStatusService } from '@services/system/apiStatusService.js'
export { default as cookieService } from '@services/system/cookieService.js'

// ========================================
// SERVICIOS AGRUPADOS POR CATEGORÍA
// ========================================
// Permite importar servicios relacionados juntos

export const authServices = {
  authService: () => import('./auth/authService.js'),
  passwordService: () => import('./auth/passwordService.js'),
  verificationService: () => import('./auth/verificationService.js'),
  oauthService: () => import('./auth/oauthService.js')
}

export const userServices = {
  userService: () => import('./user/userService.js'),
  userAttributesService: () => import('./user/userAttributesService.js'),
  userTagsService: () => import('./user/userTagsService.js'),
  userInterestsService: () => import('./user/userInterestsService.js'),
  userAnalyticsService: () => import('./user/userAnalyticsService.js'),
  userRoleService: () => import('./user/userRoleService.js'),
  userApprovalService: () => import('./user/userApprovalService.js'),
  userNotificationService: () => import('./user/userNotificationService.js'),
  userMediaService: () => import('./user/userMediaService.js')
}

export const eventServices = {
  eventService: () => import('./event/eventService.js'),
  bookingService: () => import('./event/bookingService.js')
}

export const matchServices = {
  matchService: () => import('./match/matchService.js'),
  matchInteractionService: () => import('./match/matchInteractionService.js'),
  matchQueryService: () => import('./match/matchQueryService.js'),
  matchFavoriteService: () => import('./match/matchFavoriteService.js'),
  matchPlanService: () => import('./match/matchPlanService.js'),
  matchStatisticsService: () => import('./match/matchStatisticsService.js'),
  matchSuggestionService: () => import('./match/matchSuggestionService.js')
}

export const locationServices = {
  geographicService: () => import('./location/geographicService.js')
}

export const supportServices = {
  complaintService: () => import('./support/complaintService.js')
}

export const systemServices = {
  configurationService: () => import('./system/configurationService.js'),
  apiStatusService: () => import('./system/apiStatusService.js'),
  cookieService: () => import('./system/cookieService.js')
}

// ========================================
// REGISTRO COMPLETO DE SERVICIOS
// ========================================
// Export por defecto con todos los servicios disponibles

const services = {
  // Servicios base
  ServiceREST: () => import('./utils/serviceREST.js'),
  ServiceNoREST: () => import('./utils/serviceNoREST.js'),
  api: () => import('./utils/api.js'),

  // Autenticación
  authService: () => import('./auth/authService.js'),
  passwordService: () => import('./auth/passwordService.js'),
  verificationService: () => import('./auth/verificationService.js'),
  oauthService: () => import('./auth/oauthService.js'),

  // Usuario
  userService: () => import('./user/userService.js'),
  userAttributesService: () => import('./user/userAttributesService.js'),
  userTagsService: () => import('./user/userTagsService.js'),
  userInterestsService: () => import('./user/userInterestsService.js'),
  userAnalyticsService: () => import('./user/userAnalyticsService.js'),
  userRoleService: () => import('./user/userRoleService.js'),
  userApprovalService: () => import('./user/userApprovalService.js'),
  userNotificationService: () => import('./user/userNotificationService.js'),
  userMediaService: () => import('./user/userMediaService.js'),

  // Eventos
  eventService: () => import('./event/eventService.js'),
  bookingService: () => import('./event/bookingService.js'),

  // Matches
  matchService: () => import('./match/matchService.js'),
  matchInteractionService: () => import('./match/matchInteractionService.js'),
  matchQueryService: () => import('./match/matchQueryService.js'),
  matchFavoriteService: () => import('./match/matchFavoriteService.js'),
  matchPlanService: () => import('./match/matchPlanService.js'),
  matchStatisticsService: () => import('./match/matchStatisticsService.js'),
  matchSuggestionService: () => import('./match/matchSuggestionService.js'),

  // Ubicación
  geographicService: () => import('./location/geographicService.js'),

  // Soporte
  complaintService: () => import('./support/complaintService.js'),

  // Sistema
  configurationService: () => import('./system/configurationService.js'),
  cookieService: () => import('./system/cookieService.js'),
  apiStatusService: () => import('./system/apiStatusService.js')
}

export default services
