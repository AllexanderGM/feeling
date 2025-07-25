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
    WELCOME_ONBOARDING: '/welcome-onboarding',
    SETTINGS: '/settings',
    EVENTS: '/events',
    MATCHES: '/matches',
    SEARCH: '/search',
    FAVORITES: '/favorites',
    NOTIFICATIONS: '/notifications'
  },

  GENERAL: {
    ABOUT: '/about',
    CONTACT: '/contact',
    HELP: '/help'
  },

  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    EVENTS: '/admin/events',
    MATCH_PLANS: '/admin/match-plans',
    STATS: '/admin/statistics',
    REQUESTS: '/admin/claims',
    SETTINGS: '/admin/configuration',
    PROFILE: '/admin/profile',
    SETTINGS_PROFILE: '/admin/profile/settings',
    HELP: '/admin/help'
  },

  LEGAL: {
    TERMS: '/terminos',
    PRIVACY: '/privacidad',
    SUPPORT: '/soporte'
  },

  NOT_FOUND: '*'
}
