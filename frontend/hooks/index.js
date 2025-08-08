// ========================================
// ÍNDICE CENTRAL DE HOOKS
// ========================================
// Este archivo centraliza todos los hooks de la aplicación
// Estructura organizada por módulos con patrón unificado

// Hooks de autenticación
export { default as useAuth } from '../src/hooks/auth/useAuth.js'

// Hooks de eventos
export { default as useEvents } from '../src/hooks/event/useEvents.js'
export { default as useTour } from '../src/hooks/event/useTour.js'

// Hooks de ubicación
export { default as useLocation } from '../src/hooks/location/useLocation.js'

// Hooks de matches
export { default as useMatches } from '../src/hooks/match/useMatches.js'
export { default as useMatchPlans } from '../src/hooks/match/useMatchPlans.js'

// Hooks de soporte
export { default as useComplaints } from '../src/hooks/support/useComplaints.js'

// Hooks del sistema
export { default as useConfiguration } from '../src/hooks/system/useConfiguration.js'
export { default as useApiStatus } from '../src/hooks/system/useApiStatus.js'

// Hooks de usuario
export { default as useUser } from '../src/hooks/user/useUser.js'
export { default as useUserAnalytics } from '../src/hooks/user/useUserAnalytics.js'
export { default as useUserAttributes } from '../src/hooks/user/useUserAttributes.js'
export { default as useUserInterests } from '../src/hooks/user/useUserInterests.js'
export { default as useUserTags } from '../src/hooks/user/useUserTags.js'
export { default as useUserSearch } from '../src/hooks/user/useUserSearch.js'
export { default as useUserFiltering } from '../src/hooks/user/useUserFiltering.js'
export { default as useUserStats } from '../src/hooks/user/useUserStats.js'
export { default as useCategoryInterests } from '../src/hooks/user/useCategoryInterests.js'

// Hooks de utilidades
export { default as useApi } from '../src/hooks/utils/useApi.js'
export { default as useAsyncOperation } from '../src/hooks/utils/useAsyncOperation.js'
export { default as useCookies } from '../src/hooks/utils/useCookies.js'
export { default as useError } from '../src/hooks/utils/useError.js'
export { default as useForm } from '../src/hooks/utils/useForm.js'
export { default as useMultiStepForm } from '../src/hooks/utils/useMultiStepForm.js'
export { default as useNotification } from '../src/hooks/utils/useNotification.js'

// ========================================
// HOOKS AGRUPADOS POR CATEGORÍA
// ========================================
// Permite importar hooks relacionados juntos

export const authHooks = {
  useAuth: () => import('../src/hooks/auth/useAuth.js')
}

export const eventHooks = {
  useEvents: () => import('../src/hooks/event/useEvents.js'),
  useTour: () => import('../src/hooks/event/useTour.js')
}

export const locationHooks = {
  useLocation: () => import('../src/hooks/location/useLocation.js')
}

export const matchHooks = {
  useMatches: () => import('../src/hooks/match/useMatches.js'),
  useMatchPlans: () => import('../src/hooks/match/useMatchPlans.js')
}

export const supportHooks = {
  useComplaints: () => import('../src/hooks/support/useComplaints.js')
}

export const systemHooks = {
  useConfiguration: () => import('../src/hooks/system/useConfiguration.js'),
  useApiStatus: () => import('../src/hooks/system/useApiStatus.js')
}

export const userHooks = {
  useUser: () => import('../src/hooks/user/useUser.js'),
  useUserAnalytics: () => import('../src/hooks/user/useUserAnalytics.js'),
  useUserAttributes: () => import('../src/hooks/user/useUserAttributes.js'),
  useUserInterests: () => import('../src/hooks/user/useUserInterests.js'),
  useUserTags: () => import('../src/hooks/user/useUserTags.js'),
  useUserSearch: () => import('../src/hooks/user/useUserSearch.js'),
  useUserFiltering: () => import('../src/hooks/user/useUserFiltering.js'),
  useUserStats: () => import('../src/hooks/user/useUserStats.js'),
  useCategoryInterests: () => import('../src/hooks/user/useCategoryInterests.js')
}

export const utilityHooks = {
  useApi: () => import('../src/hooks/utils/useApi.js'),
  useAsyncOperation: () => import('../src/hooks/utils/useAsyncOperation.js'),
  useCookies: () => import('../src/hooks/utils/useCookies.js'),
  useError: () => import('../src/hooks/utils/useError.js'),
  useForm: () => import('../src/hooks/utils/useForm.js'),
  useMultiStepForm: () => import('../src/hooks/utils/useMultiStepForm.js'),
  useNotification: () => import('../src/hooks/utils/useNotification.js')
}

// ========================================
// REGISTRO COMPLETO DE HOOKS
// ========================================
// Export por defecto con todos los hooks disponibles

const hooks = {
  // Autenticación
  useAuth: () => import('../src/hooks/auth/useAuth.js'),

  // Eventos
  useEvents: () => import('../src/hooks/event/useEvents.js'),
  useTour: () => import('../src/hooks/event/useTour.js'),

  // Ubicación
  useLocation: () => import('../src/hooks/location/useLocation.js'),

  // Matches
  useMatches: () => import('../src/hooks/match/useMatches.js'),
  useMatchPlans: () => import('../src/hooks/match/useMatchPlans.js'),

  // Soporte
  useComplaints: () => import('../src/hooks/support/useComplaints.js'),

  // Sistema
  useConfiguration: () => import('../src/hooks/system/useConfiguration.js'),
  useApiStatus: () => import('../src/hooks/system/useApiStatus.js'),

  // Usuario
  useUser: () => import('../src/hooks/user/useUser.js'),
  useUserAnalytics: () => import('../src/hooks/user/useUserAnalytics.js'),
  useUserAttributes: () => import('../src/hooks/user/useUserAttributes.js'),
  useUserInterests: () => import('../src/hooks/user/useUserInterests.js'),
  useUserTags: () => import('../src/hooks/user/useUserTags.js'),
  useUserSearch: () => import('../src/hooks/user/useUserSearch.js'),
  useUserFiltering: () => import('../src/hooks/user/useUserFiltering.js'),
  useUserStats: () => import('../src/hooks/user/useUserStats.js'),
  useCategoryInterests: () => import('../src/hooks/user/useCategoryInterests.js'),

  // Utilidades
  useApi: () => import('../src/hooks/utils/useApi.js'),
  useAsyncOperation: () => import('../src/hooks/utils/useAsyncOperation.js'),
  useCookies: () => import('../src/hooks/utils/useCookies.js'),
  useError: () => import('../src/hooks/utils/useError.js'),
  useForm: () => import('../src/hooks/utils/useForm.js'),
  useMultiStepForm: () => import('../src/hooks/utils/useMultiStepForm.js'),
  useNotification: () => import('../src/hooks/utils/useNotification.js')
}

export default hooks
