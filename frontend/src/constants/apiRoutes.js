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

  // AuthController - Rutas principales
  '/auth/register',
  '/auth/login',
  '/auth/refresh-token',
  '/auth/check-email',
  '/auth/check-auth-method',
  '/auth/status',

  // PasswordController - Gestión de contraseñas
  '/auth/password/forgot',
  '/auth/password/reset',
  '/auth/password/validate-reset-token',
  '/auth/password/validate',
  '/auth/password/suggestions',
  '/auth/password/policy',
  '/auth/password/check-compromised',

  // VerificationController - Verificación de emails
  '/auth/verification/verify-email',
  '/auth/verification/resend-code',
  '/auth/verification/check-email',
  '/auth/verification/status',
  '/auth/verification/validate-code',

  // OAuthController - OAuth providers
  '/auth/oauth/google/register',
  '/auth/oauth/google/login',
  '/auth/oauth/facebook/register',
  '/auth/oauth/facebook/login',
  '/auth/oauth/apple/register',
  '/auth/oauth/apple/login',
  '/auth/oauth/methods',
  '/auth/oauth/providers',

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
  // ========================================
  // AUTENTICACIÓN
  // ========================================

  // AuthController - Autenticación principal (/auth)
  // Nota: Contiene rutas cortas para verificación y password que son aliases.
  // Los servicios especializados usan las rutas completas para mayor claridad.
  AUTH: {
    // Registro y Login
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',

    // Gestión de tokens
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',

    // Verificaciones y estado
    CHECK_EMAIL: '/auth/check-email',
    CHECK_METHOD: '/auth/check-auth-method',
    STATUS: '/auth/status'
  },

  // PasswordController - Gestión de contraseñas (/auth/password)
  PASSWORD: {
    // Recuperación de contraseña
    FORGOT: '/auth/password/forgot',
    RESET: '/auth/password/reset',
    VALIDATE_RESET_TOKEN: '/auth/password/validate-reset-token',

    // Cambio de contraseña (requiere autenticación)
    CHANGE: '/auth/password/change',

    // Validación de contraseñas
    VALIDATE: '/auth/password/validate',
    SUGGESTIONS: '/auth/password/suggestions',
    POLICY: '/auth/password/policy',
    CHECK_COMPROMISED: '/auth/password/check-compromised'
  },

  // VerificationController - Verificación de emails (/auth/verification)
  VERIFICATION: {
    // Verificación de email
    VERIFY_EMAIL: '/auth/verification/verify-email',
    RESEND_CODE: '/auth/verification/resend-code',

    // Validaciones
    CHECK_EMAIL: '/auth/verification/check-email',
    STATUS: '/auth/verification/status',
    VALIDATE_CODE: '/auth/verification/validate-code',

    // Limpieza (admin)
    CLEANUP_EXPIRED: '/auth/verification/cleanup-expired'
  },

  // OAuthController - Autenticación OAuth (/auth/oauth)
  OAUTH: {
    // Google OAuth
    GOOGLE_REGISTER: '/auth/oauth/google/register',
    GOOGLE_LOGIN: '/auth/oauth/google/login',

    // Facebook OAuth (preparado para futuro - backend devuelve 501 NOT_IMPLEMENTED)
    FACEBOOK_REGISTER: '/auth/oauth/facebook/register',
    FACEBOOK_LOGIN: '/auth/oauth/facebook/login',

    // Apple OAuth (preparado para futuro - backend devuelve 501 NOT_IMPLEMENTED)
    APPLE_REGISTER: '/auth/oauth/apple/register',
    APPLE_LOGIN: '/auth/oauth/apple/login',

    // Información y gestión
    METHODS: '/auth/oauth/methods',
    PROVIDERS: '/auth/oauth/providers',
    UNLINK: '/auth/oauth/unlink'
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
    CURRENT: '/user/profile',
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
    MULTIPLE_TYPES: '/user-attributes/multiple',
    USERS_BY_ATTRIBUTE: '/user-attributes/{attributeId}/users',

    // Admin endpoints
    ALL_PAGINATED: '/user/attributes/admin',
    INACTIVE: '/user/attributes/inactive',
    INACTIVE_COUNT: '/user/attributes/inactive/count',
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
    ALL_ADMIN: '/user-interests/admin/all',
    CREATE: '/user-interests',
    UPDATE: '/user-interests/{interestId}',
    DELETE: '/user-interests/{interestId}',
    TOGGLE_STATUS: '/user-interests/{interestId}/toggle-status'
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

    // Admin endpoints
    PENDING_APPROVAL: '/user-tags/pending-approval',
    CREATE: '/user-tags',
    UPDATE: '/user-tags/{tagId}',
    CLEANUP: '/user-tags/cleanup',
    APPROVE: '/user-tags/{tagId}/approve',
    REJECT: '/user-tags/{tagId}/reject',
    APPROVE_BATCH: '/user-tags/approve-batch'
  },

  // Roles de Usuario - UserRoleController (/user-roles)
  USER_ROLES: {
    // Consultas
    ADMINS: '/user-roles/admins',
    CLIENTS: '/user-roles/clients',
    COUNT: '/user-roles/count',

    // Gestión de roles admin
    GRANT_ADMIN: '/user-roles/{userId}/grant-admin',
    GRANT_ADMIN_BATCH: '/user-roles/grant-admin-batch',
    REVOKE_ADMIN: '/user-roles/{userId}/revoke-admin',
    REVOKE_ADMIN_BATCH: '/user-roles/revoke-admin-batch'
  },

  // Aprobación de Usuarios - UserApprovalController (/user-approval)
  USER_APPROVAL: {
    // Consultas
    PENDING: '/user-approval/pending',
    REJECTED: '/user-approval/rejected',

    // Gestión individual
    APPROVE: '/user-approval/{userId}/approve',
    REJECT: '/user-approval/{userId}/reject',
    RESET_PENDING: '/user-approval/{userId}/pending',

    // Operaciones en lote
    APPROVE_BATCH: '/user-approval/approve-batch',
    REJECT_BATCH: '/user-approval/reject-batch'
  },

  // Notificaciones de Usuario - UserNotificationController (/user-notifications)
  USER_NOTIFICATIONS: {
    // Onboarding & Profile
    WELCOME: '/user-notifications/{userId}/welcome',
    PROFILE_REMINDER: '/user-notifications/{userId}/profile-reminder',

    // Approval & Moderation
    APPROVAL: '/user-notifications/{userId}/approval',
    REJECTION: '/user-notifications/{userId}/rejection',

    // Account Management
    DEACTIVATION: '/user-notifications/{userId}/deactivation',
    REACTIVATION: '/user-notifications/{userId}/reactivation',

    // Bulk Operations
    PROFILE_REMINDERS_BATCH: '/user-notifications/profile-reminders-batch',
    BULK_EMAIL: '/user-notifications/bulk-email'
  },

  // Media de Usuario - UserMediaController (/user-media)
  USER_MEDIA: {
    // Cliente - Personal media
    MY_MEDIA: '/user-media/me',
    UPLOAD: '/user-media/me',
    SET_MAIN: '/user-media/me/main',
    DELETE_MY_IMAGE: '/user-media/me',

    // Admin - Media moderation
    USER_MEDIA: '/user-media/{userId}',
    DELETE_USER_IMAGE: '/user-media/{userId}'
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
    COUNT_BY_CATEGORY: '/events/stats/count-by-category',
    REVENUE: '/events/stats/revenue',
    CATEGORY_STATS: '/events/stats/category',
    TOGGLE_STATUS: '/events/{id}/admin-toggle-status',
    FORCE_DELETE: '/events/{id}/force-delete',
    REGISTRATION: '/events/registration'
  },

  PAYMENTS: {
    CREATE_INTENT: '/payments/create-payment-intent',
    CONFIRM: '/payments/confirm',
    WEBHOOK: '/payments/webhook'
  },

  EVENT_REGISTRATIONS: {
    BASE: '/event-registrations',
    REGISTER: '/event-registrations/register',
    MY: '/event-registrations/my-registrations',
    BY_EVENT: '/event-registrations/event',
    STATS: '/event-registrations/stats'
  },

  // Matches
  MATCHES: {
    BASE: '/matches',
    PLANS: '/matches/plans',
    PAYMENT_INTENT: '/matches/plans/payment-intent',
    PURCHASE_PLAN: '/matches/plans/purchase',
    DISMISS_SUGGESTION: '/matches/suggestions/{userId}/dismiss',
    SEND: '/matches/send',
    ACCEPT: '/matches/{id}/accept',
    REJECT: '/matches/{id}/reject',
    WITHDRAW: '/matches/{id}/withdraw',
    CONTACT: '/matches/{id}/contact',
    SENT: '/matches/sent',
    RECEIVED: '/matches/received',
    RECEIVED_PENDING: '/matches/received/pending',
    ACCEPTED: '/matches/accepted',
    HISTORY: '/matches/history',
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

  // ComplaintController - Gestión de quejas y reclamos (/complaints)
  COMPLAINTS: {
    // Cliente endpoints
    CREATE: '/complaints',
    MY_COMPLAINTS: '/complaints/me',
    MY_COMPLAINT_BY_ID: '/complaints/me/{complaintId}',

    // Admin endpoints - Listado y filtrado
    ALL: '/complaints',
    PENDING: '/complaints/pending',
    URGENT: '/complaints/urgent',
    OVERDUE: '/complaints/overdue',
    RESOLVED: '/complaints/resolved',
    BY_TYPE: '/complaints/type/{complaintType}',
    BY_PRIORITY: '/complaints/priority/{complaintPriority}',

    // Admin endpoints - Gestión
    UPDATE: '/complaints/{complaintId}',
    DELETE: '/complaints/{complaintId}',
    STATS: '/complaints/stats'
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
