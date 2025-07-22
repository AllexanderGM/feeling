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
  '/category-interests',

  // Tags
  '/tags/popular',
  '/tags/search',
  '/tags/trending',

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
  '/api/events'
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
    CATEGORY_INTERESTS: '/category-interests',
    TAGS_POPULAR: '/tags/popular',
    TAGS_SEARCH: '/tags/search',
    TAGS_TRENDING: '/tags/trending'
  },

  // Usuario
  USER: {
    PROFILE: '/users/profile',
    COMPLETE_PROFILE: '/users/complete-profile',
    TAGS: '/users/tags',
    SEARCH: '/users/search',
    SUGGESTIONS: '/users/suggestions'
  },

  // Eventos
  EVENTS: {
    BASE: '/api/events',
    REGISTRATION: '/api/events/registration',
    PAYMENT: '/api/events/payment'
  },

  // Admin
  ADMIN: {
    BASE: '/api/admin',
    USERS: '/api/admin/users',
    EVENTS: '/api/admin/events'
  }
}
