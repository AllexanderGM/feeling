/**
 * Configuración centralizada de rutas de la API
 */

// Rutas públicas que no necesitan Authorization header
export const PUBLIC_ROUTES = [
  // Datos geográficos
  '/geographic',

  // Atributos de usuario
  '/user-attributes',

  // Intereses de categorías
  '/user-interests',

  // Tags
  '/user-tags/popular',
  '/user-tags/search',
  '/user-tags/trending',

  // Autenticación
  '/auth/register',
  '/auth/login',
  '/auth/google',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh-token',
  '/auth/check-email',
  '/auth/check-method',
  '/auth/status',

  // Sistema
  '/health',
  '/system',

  // Eventos (solo GET es público)
  '/events'
]

// Función para verificar si una URL es una ruta pública
export const isPublicRoute = url => {
  if (!url) return false
  return PUBLIC_ROUTES.some(route => url.includes(route))
}

// URLs base para diferentes tipos de endpoints
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google/login',
    GOOGLE_REGISTER: '/auth/google/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE_RESET_TOKEN: '/auth/validate-reset-token',
    LOGOUT: '/auth/logout',
    CHECK_EMAIL: '/auth/check-email',
    CHECK_METHOD: '/auth/check-method',
    STATUS: '/auth/status'
  },

  // Datos públicos
  PUBLIC_DATA: {
    GEOGRAPHIC: '/geographic',
    USER_ATTRIBUTES: '/user-attributes',
    CATEGORY_INTERESTS: '/user-interests',
    TAGS_POPULAR: '/user-tags/popular',
    TAGS_SEARCH: '/user-tags/search',
    TAGS_TRENDING: '/user-tags/trending'
  },

  // Usuario - UserController (/user)
  USER: {
    // Cliente endpoints
    CURRENT: '/user',
    PUBLIC_PROFILE: '/user/{email}/public',
    COMPLETE_PROFILE: '/user/{email}/complete',
    COMPATIBILITY: '/user/compatibility/{otherUserEmail}',
    SUGGESTIONS: '/user/suggestions',
    UPDATE_PROFILE: '/user',
    DEACTIVATE: '/user/deactivate',

    // Admin endpoints
    ALL: '/user/all',
    BY_EMAIL: '/user/{email}',
    BY_STATUS: '/user/status/{status}',
    UPDATE_BY_ADMIN: '/user/{userId}',
    APPROVE: '/user/{userId}/approve',
    APPROVE_BATCH: '/user/approve-batch',
    REJECT: '/user/{userId}/reject',
    REJECT_BATCH: '/user/reject-batch',
    RESET_PENDING: '/user/{userId}/pending',
    ASSIGN_ADMIN: '/user/{userId}/assign-admin',
    ASSIGN_ADMIN_BATCH: '/user/assign-admin-batch',
    REVOKE_ADMIN: '/user/{userId}/revoke-admin',
    REVOKE_ADMIN_BATCH: '/user/revoke-admin-batch',
    ADMIN_DEACTIVATE: '/user/{userId}/deactivate',
    REACTIVATE: '/user/{userId}/reactivate',
    DEACTIVATE_BATCH: '/user/deactivate-batch',
    REACTIVATE_BATCH: '/user/reactivate-batch',
    SEND_EMAIL: '/user/{userId}/send-email',
    SEND_EMAIL_BATCH: '/user/send-email-batch',
    DELETE: '/user/{userId}',
    DELETE_BATCH: '/user/delete-batch'
  },

  // Analíticas de Usuario - UserAnalyticsController (/user-analytics)
  USER_ANALYTICS: {
    OVERVIEW: '/user-analytics/overview',
    USER_METRICS: '/user-analytics/user-metrics',
    USER_DETAILED_METRICS: '/user-analytics/metrics/{userId}',
    TOP_USERS: '/user-analytics/top-users',
    ATTRIBUTE_STATISTICS: '/user-analytics/attribute-statistics',
    INTERESTS_STATISTICS: '/user-analytics/interests-statistics',
    TAGS_STATISTICS: '/user-analytics/tags-statistics'
  },

  // Atributos de Usuario - UserAttributeController (/user-attributes)
  USER_ATTRIBUTES: {
    // Cliente endpoints
    ALL_GROUPED: '/user-attributes',
    TYPES: '/user-attributes/types',
    BY_TYPE: '/user-attributes/{attributeType}',
    USERS_BY_ATTRIBUTE: '/user-attributes/{attributeId}/users',

    // Admin endpoints
    CREATE: '/user-attributes/{attributeType}',
    UPDATE: '/user-attributes/{attributeId}',
    DELETE: '/user-attributes/{attributeId}'
  },

  // Intereses de Usuario - UserInterestController (/user-interests)
  USER_INTERESTS: {
    // Cliente endpoints
    ALL: '/user-interests',
    BY_ID: '/user-interests/{id}',

    // Admin endpoints
    CREATE: '/user-interests',
    UPDATE: '/user-interests/{interestId}',
    DELETE: '/user-interests/{interestId}'
  },

  // Tags de Usuario - UserTagController (/user-tags)
  USER_TAGS: {
    // Cliente endpoints - Personal tag management
    MY_TAGS: '/user-tags/me',
    ADD_TAGS: '/user-tags/me',
    REPLACE_TAGS: '/user-tags/me/{tagId}',
    REMOVE_TAG: '/user-tags/me/{tagId}',

    // Cliente endpoints - Search and discovery
    SEARCH: '/user-tags/search',
    POPULAR: '/user-tags/popular',
    TRENDING: '/user-tags/trending',
    SUGGESTIONS: '/user-tags/suggestions',
    USERS_BY_TAGS: '/user-tags/users',

    // Admin endpoints
    PENDING_APPROVAL: '/user-tags/pending-approval',
    CREATE: '/user-tags',
    UPDATE: '/user-tags/{tagId}',
    CLEANUP: '/user-tags/cleanup',
    APPROVE: '/user-tags/{tagId}/approve',
    REJECT: '/user-tags/{tagId}/reject',
    APPROVE_BATCH: '/user-tags/approve-batch'
  },

  // Eventos
  EVENTS: {
    BASE: '/events',
    ALL_ADMIN: '/events/all-admin',
    UPCOMING: '/events/upcoming',
    BY_CATEGORY: '/events/category',
    BY_STATUS: '/events/status',
    MY_EVENTS: '/events/my-events',
    BY_USER: '/events/user',
    CATEGORIES: '/events/categories',
    STATS: '/events/dashboard/stats',
    COUNT: '/events/stats/count',
    REVENUE: '/events/stats/revenue',
    TOGGLE_STATUS: '/events/{id}/admin-toggle-status',
    FORCE_DELETE: '/events/{id}/force-delete',
    REGISTRATION: '/events/registration',
    PAYMENT: '/events/payment'
  },

  // Matches
  MATCHES: {
    BASE: '/matches',
    PLANS: '/matches/plans',
    PURCHASE_PLAN: '/matches/plans/purchase',
    SEND: '/matches/send',
    ACCEPT: '/matches/{id}/accept',
    REJECT: '/matches/{id}/reject',
    CONTACT: '/matches/{id}/contact',
    SENT: '/matches/sent',
    RECEIVED: '/matches/received',
    ACCEPTED: '/matches/accepted',
    FAVORITES: '/matches/favorites',
    STATS: '/matches/stats',
    NOTIFICATIONS: '/matches/notifications',
    ATTEMPTS: '/matches/attempts',
    // Admin endpoints
    ADMIN_ALL_PLANS: '/matches/plans/admin/all',
    ADMIN_PLAN_STATS: '/matches/plans/admin/stats',
    ADMIN_CREATE_PLAN: '/matches/plans/admin/create',
    ADMIN_UPDATE_PLAN: '/matches/plans/admin/{planId}',
    ADMIN_DELETE_PLAN: '/matches/plans/admin/{planId}'
  },

  // Soporte
  SUPPORT: {
    COMPLAINTS: '/support/complaints',
    MY_COMPLAINTS: '/support/my-complaints',
    COMPLAINT_BY_ID: '/support/my-complaints/{complaintId}',
    PENDING_COMPLAINTS: '/support/complaints/pending',
    URGENT_COMPLAINTS: '/support/complaints/urgent',
    OVERDUE_COMPLAINTS: '/support/complaints/overdue',
    RESOLVED_COMPLAINTS: '/support/complaints/resolved',
    UPDATE_COMPLAINT: '/support/complaints/{complaintId}',
    DELETE_COMPLAINT: '/support/complaints/{complaintId}',
    COMPLAINT_STATS: '/support/complaints/stats'
  },

  // Tours
  TOURS: {
    BASE: '/tours',
    RANDOM: '/tours/random',
    BY_ID: '/tours/{id}',
    BY_CATEGORY: '/tours/category/{category}',
    SEARCH: '/tours/search'
  },

  // Reservas
  BOOKINGS: {
    BASE: '/bookings',
    HISTORIC: '/bookings/historic',
    BY_ID: '/bookings/{id}',
    CANCEL: '/bookings/{id}'
  },

  // Disponibilidades
  AVAILABILITIES: {
    BY_TOUR: '/api/availabilities/tour/{tourId}'
  },

  // Geografía (completar)
  GEOGRAPHIC: {
    BASE: '/geographic',
    ALL: '/geographic/all',
    COUNTRIES: '/geographic/countries',
    CITIES_BY_COUNTRY: '/geographic/countries/{countryName}/cities',
    LOCALITIES_BY_CITY: '/geographic/cities/{cityName}/localities'
  },

  // Admin
  ADMIN: {
    BASE: '/api/admin',
    USERS: '/api/admin/users',
    EVENTS: '/api/admin/events',
    MATCH_PLANS: '/api/admin/match-plans',
    CONFIGURATION: {
      BASE: '/api/admin/configuration',
      BASIC: '/api/admin/configuration/basic',
      SOCIAL_MEDIA: '/api/admin/configuration/social-media',
      EMAIL: '/api/admin/configuration/email',
      MASS_EMAIL: '/api/admin/configuration/mass-email',
      MATCHING: '/api/admin/configuration/matching',
      EVENTS: '/api/admin/configuration/events',
      NOTIFICATIONS: '/api/admin/configuration/notifications',
      SYSTEM: '/api/admin/configuration/system',
      BACKUP: '/api/admin/configuration/backup',
      MAINTENANCE: '/api/admin/configuration/maintenance'
    }
  }
}
