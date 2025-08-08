// ========================================
// HOOKS - EXPORTACIONES CENTRALIZADAS
// ========================================

// Auth Hooks
export { default as useAuth } from './auth/useAuth.js'

// Event Hooks
export { default as useEvents } from './event/useEvents.js'
export { default as useTour } from './event/useTour.js'

// Location Hooks
export { default as useLocation } from './location/useLocation.js'

// Match Hooks
export { default as useMatches } from './match/useMatches.js'
export { default as useMatchPlans } from './match/useMatchPlans.js'

// Support Hooks
export { default as useComplaints } from './support/useComplaints.js'

// System Hooks
export { default as useConfiguration } from './system/useConfiguration.js'
export { default as useApiStatus } from './system/useApiStatus.js'

// User Hooks
export { default as useUser } from './user/useUser.js'
export { default as useUserAnalytics } from './user/useUserAnalytics.js'
export { default as useUserAttributes } from './user/useUserAttributes.js'
export { default as useUserInterests } from './user/useUserInterests.js'
export { default as useUserTags } from './user/useUserTags.js'
export { default as useUserSearch } from './user/useUserSearch.js'
export { default as useUserFiltering } from './user/useUserFiltering.js'
export { default as useUserStats } from './user/useUserStats.js'
export { default as useCategoryInterests } from './user/useCategoryInterests.js'
export { default as useProfileData } from '../pages/user/profile/hooks/useProfileData.js'

// Utils Hooks
export { default as useApi } from './utils/useApi.js'
export { default as useAsyncOperation } from './utils/useAsyncOperation.js'
export { default as useCookies } from './utils/useCookies.js'
export { default as useError } from './utils/useError.js'
export { default as useForm } from './utils/useForm.js'
export { default as useMultiStepForm } from './utils/useMultiStepForm.js'
export { default as useNotification } from './utils/useNotification.js'

// ========================================
// EXPORTACIONES POR CATEGORÍA
// ========================================

// Auth
export * as AuthHooks from './auth/useAuth.js'

// Events
export * as EventHooks from './event/useEvents.js'
export * as TourHooks from './event/useTour.js'

// Location
export * as LocationHooks from './location/useLocation.js'

// Matches
export * as MatchHooks from './match/useMatches.js'
export * as MatchPlanHooks from './match/useMatchPlans.js'

// Support
export * as SupportHooks from './support/useComplaints.js'

// System
export * as SystemHooks from './system/useConfiguration.js'
export * as ApiStatusHooks from './system/useApiStatus.js'

// User Management
export * as UserHooks from './user/useUser.js'
export * as UserAnalyticsHooks from './user/useUserAnalytics.js'
export * as UserAttributeHooks from './user/useUserAttributes.js'
export * as UserInterestHooks from './user/useUserInterests.js'
export * as UserTagHooks from './user/useUserTags.js'
export * as UserSearchHooks from './user/useUserSearch.js'
export * as UserFilteringHooks from './user/useUserFiltering.js'
export * as UserStatsHooks from './user/useUserStats.js'
export * as CategoryInterestHooks from './user/useCategoryInterests.js'
export * as ProfileDataHooks from '../pages/user/profile/hooks/useProfileData.js'

// Utils
export * as ApiHooks from './utils/useApi.js'
export * as AsyncHooks from './utils/useAsyncOperation.js'
export * as CookieHooks from './utils/useCookies.js'
export * as ErrorHooks from './utils/useError.js'
export * as FormHooks from './utils/useForm.js'
export * as MultiStepFormHooks from './utils/useMultiStepForm.js'
export * as NotificationHooks from './utils/useNotification.js'
