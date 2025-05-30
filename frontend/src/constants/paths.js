export const APP_PATHS = {
  ROOT: '/',
  APP: '/app',

  PUBLIC: {
    WELCOME: '/welcome',
    API_STATUS: '/api-status'
  },

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    VERIFY_EMAIL_TOKEN: '/verify-email/:token',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token'
  },

  USER: {
    PROFILE: '/profile',
    PROFILE_BY_ID: '/profile/:userId',
    COMPLETE_PROFILE: '/complete-profile',
    SETTINGS: '/settings',
    EVENTS: '/events',
    MATCHES: '/matches',
    SEARCH: '/search',
    FAVORITES: '/favorites'
  },

  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    EVENTS: '/admin/events',
    STATS: '/admin/statistics'
  },

  LEGAL: {
    TERMS: '/terminos',
    PRIVACY: '/privacidad',
    SUPPORT: '/soporte'
  },

  NOT_FOUND: '*'
}
