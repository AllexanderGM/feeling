/**
 * CONSTANTES Y ENUMS DE LA APLICACIÓN
 *
 * Define todos los valores constantes y enumeraciones utilizados en la aplicación.
 * Este archivo contiene ÚNICAMENTE enums y constantes globales, NO lógica.
 *
 * RESPONSABILIDAD:
 * - Definir enums (roles, estados, categorías, etc.)
 * - Definir constantes de configuración
 * - Definir constantes de UI
 *
 * NO INCLUYE:
 * - Límites de validación (ver validation/validationConstants.js)
 * - Mensajes de error (ver validation/validationConstants.js)
 * - Regex patterns (ver validation/validationConstants.js)
 * - Endpoints de API (deben estar en servicios)
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
// ENUMS DE ESTADO
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
// ENUMS DE HTTP
// ========================================

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
// ENUMS DE EVENTOS
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
// ENUMS DE PAGOS
// ========================================

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
