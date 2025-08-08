// ========================================
// ÍNDICE CENTRAL DE SERVICIOS
// ========================================
// Este archivo centraliza todos los servicios de la aplicación
// Estructura organizada por módulos con patrón unificado

// Servicios base
export { ServiceREST } from '@services/utils/serviceREST.js'
export { ServiceNoREST } from '@services/utils/serviceNoREST.js'
export { default as api, registerAuthCallbacks } from '@services/utils/api.js'

// Módulo de autenticación
export { default as authService } from '@services/auth/authService.js'

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
export { default as tagService } from '@services/user/tagService.js'

// Módulo de eventos y tours
export { default as eventService } from '@services/event/eventService.js'
export { default as bookingService } from '@services/event/bookingService.js'
export * from '@services/event/tourService.js'

// Módulo de matches
export { default as matchService } from '@services/match/matchService.js'

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
  authService: () => import('./auth/authService.js')
}

export const userServices = {
  userService: () => import('./user/userService.js'),
  userAttributesService: () => import('./user/userAttributesService.js'),
  userTagsService: () => import('./user/userTagsService.js'),
  userInterestsService: () => import('./user/userInterestsService.js'),
  userAnalyticsService: () => import('./user/userAnalyticsService.js'),
  tagService: () => import('./user/tagService.js')
}

export const eventServices = {
  eventService: () => import('./event/eventService.js'),
  bookingService: () => import('./event/bookingService.js')
}

export const matchServices = {
  matchService: () => import('./match/matchService.js')
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

  // Usuario
  userService: () => import('./user/userService.js'),
  userAttributesService: () => import('./user/userAttributesService.js'),
  userTagsService: () => import('./user/userTagsService.js'),
  userInterestsService: () => import('./user/userInterestsService.js'),
  userAnalyticsService: () => import('./user/userAnalyticsService.js'),
  tagService: () => import('./user/tagService.js'),

  // Eventos
  eventService: () => import('./event/eventService.js'),
  bookingService: () => import('./event/bookingService.js'),
  tourService: () => import('./event/tourService.js'),

  // Matches
  matchService: () => import('./match/matchService.js'),

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
