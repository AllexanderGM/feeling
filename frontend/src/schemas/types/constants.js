/**
 * CONSTANTES Y ENUMS DE LA APLICACIÓN
 *
 * Define todos los valores constantes utilizados en la aplicación,
 * organizados por categorías para fácil mantenimiento.
 */

// ========================================
// ENUMS DE USUARIO
// ========================================

export const USER_ROLES = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN'
}

export const CATEGORY_INTERESTS = {
  SPIRIT: 'SPIRIT',
  ROUSE: 'ROUSE',
  ESSENCE: 'ESSENCE'
}

export const AUTH_PROVIDERS = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE'
}

// ========================================
// CONSTANTES DE ESTADO
// ========================================

export const USER_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  PROFILE_INCOMPLETE: 'profile_incomplete',
  PROFILE_COMPLETE: 'profile_complete',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
}

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  FAILED: 'failed'
}

// ========================================
// CONSTANTES DE VALIDACIÓN
// ========================================

export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
  TAGS_MIN: 1,
  TAGS_MAX: 10,
  IMAGES_MIN: 1,
  IMAGES_MAX: 6,
  HEIGHT_MIN: 140,
  HEIGHT_MAX: 220,
  AGE_MIN: 18,
  AGE_MAX: 80,
  RADIUS_MIN: 5,
  RADIUS_MAX: 200,
  VERIFICATION_CODE_LENGTH: 6,
  FILE_SIZE_MAX: 5 * 1024 * 1024, // 5MB
  PHONE_MIN_LENGTH: 10,
  DOCUMENT_MIN_LENGTH: 7
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// ========================================
// CONSTANTES DE CONFIGURACIÓN
// ========================================

export const DEFAULT_LOCATION = {
  COUNTRY: 'Colombia',
  CITY: 'Bogotá'
}

export const PROFILE_COMPLETION_STEPS = {
  BASIC_INFO: 1,
  CHARACTERISTICS: 2,
  PREFERENCES: 3,
  CONFIGURATION: 4
}

export const STEP_NAMES = {
  1: 'Información Básica',
  2: 'Características',
  3: 'Preferencias',
  4: 'Configuración'
}

// ========================================
// CONSTANTES DE API
// ========================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    UPLOAD_IMAGE: '/user/upload-image',
    DELETE_IMAGE: '/user/delete-image'
  }
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
}

// ========================================
// CONSTANTES DE UI
// ========================================

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// ========================================
// CONSTANTES DE FORMULARIO
// ========================================

export const FORM_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
}

export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file'
}

// ========================================
// REGEX PATTERNS
// ========================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]+$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  ONLY_LETTERS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  ONLY_NUMBERS: /^[0-9]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/
}

// ========================================
// ENUMS Y CONSTANTES DE EVENTOS
// ========================================

export const EVENT_CATEGORIES = {
  CULTURAL: 'CULTURAL',
  DEPORTIVO: 'DEPORTIVO',
  MUSICAL: 'MUSICAL',
  SOCIAL: 'SOCIAL'
}

export const EVENT_CATEGORY_LABELS = {
  CULTURAL: 'Cultural',
  DEPORTIVO: 'Deportivo',
  MUSICAL: 'Musical',
  SOCIAL: 'Social'
}

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
}

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado'
}

export const SUPPORTED_CURRENCIES = {
  COP: 'COP',
  USD: 'USD'
}

// ========================================
// CONSTANTES DE VALIDACIÓN PARA EVENTOS
// ========================================

export const EVENT_VALIDATION_LIMITS = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_CAPACITY_MIN: 1,
  MAX_CAPACITY_MAX: 10000,
  PRICE_MIN: 0,
  PRICE_MAX: 10000000,
  SEARCH_QUERY_MIN: 2,
  SEARCH_QUERY_MAX: 100,
  CANCELLATION_REASON_MIN: 10,
  CANCELLATION_REASON_MAX: 500,
  FUTURE_YEARS_LIMIT: 2,
  CANCELLATION_HOURS_BEFORE: 1
}

// ========================================
// CONSTANTES DE ESTADO DE EVENTOS
// ========================================

export const EVENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
}

export const EVENT_AVAILABILITY = {
  AVAILABLE: 'available',
  FULL: 'full',
  ALL: 'all'
}

// ========================================
// CONFIGURACIÓN DE EVENTOS
// ========================================

export const EVENT_PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 12,
  MAX_SIZE: 100
}

export const EVENT_SORT_OPTIONS = {
  DATE_ASC: 'eventDate,asc',
  DATE_DESC: 'eventDate,desc',
  PRICE_ASC: 'price,asc',
  PRICE_DESC: 'price,desc',
  CREATED_ASC: 'createdAt,asc',
  CREATED_DESC: 'createdAt,desc',
  CAPACITY_ASC: 'maxCapacity,asc',
  CAPACITY_DESC: 'maxCapacity,desc'
}

export const EVENT_FILTER_DEFAULTS = {
  CATEGORIES: [],
  PRICE_RANGE: { min: 0, max: 1000000 },
  DATE_RANGE: { start: null, end: null },
  AVAILABILITY: 'all'
}

// ========================================
// MENSAJES DE ERROR COMUNES
// ========================================

export const ERROR_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Ingresa un email válido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
  INVALID_PHONE: 'El teléfono solo debe contener números',
  INVALID_DATE: 'Ingresa una fecha válida',
  AGE_RESTRICTION: 'Debes ser mayor de 18 años',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión de nuevo.',

  // Mensajes específicos de eventos
  EVENT_NOT_FOUND: 'Evento no encontrado',
  EVENT_FULL: 'El evento está lleno',
  EVENT_INACTIVE: 'El evento no está activo',
  EVENT_PAST: 'El evento ya pasó',
  ALREADY_REGISTERED: 'Ya estás registrado en este evento',
  REGISTRATION_CLOSED: 'Las inscripciones están cerradas',
  PAYMENT_FAILED: 'Error en el procesamiento del pago',
  CANCELLATION_NOT_ALLOWED: 'No se puede cancelar el registro',
  INVALID_CAPACITY: 'La capacidad no puede ser menor a los asistentes actuales'
}
