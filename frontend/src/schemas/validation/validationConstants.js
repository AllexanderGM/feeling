/**
 * CONSTANTES DE VALIDACIÓN
 *
 * Centraliza todos los límites, patrones regex y mensajes de error
 * utilizados en las validaciones de formularios.
 *
 * RESPONSABILIDAD:
 * - Definir límites de validación (min/max)
 * - Definir patrones regex para validación
 * - Definir mensajes de error consistentes
 */

// ========================================
// LÍMITES DE VALIDACIÓN - USUARIO
// ========================================

export const USER_VALIDATION_LIMITS = {
  // Contraseña
  PASSWORD_MIN_LENGTH: 8,

  // Nombre y apellido
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,

  // Descripción y biografía
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,

  // Tags e intereses
  TAGS_MIN: 1,
  TAGS_MAX: 10,

  // Imágenes
  IMAGES_MIN: 1,
  IMAGES_MAX: 6,

  // Características físicas
  HEIGHT_MIN: 140,
  HEIGHT_MAX: 220,

  // Edad
  AGE_MIN: 18,
  AGE_MAX: 80,

  // Preferencias de ubicación
  RADIUS_MIN: 5,
  RADIUS_MAX: 200,

  // Código de verificación
  VERIFICATION_CODE_LENGTH: 6,

  // Archivos
  FILE_SIZE_MAX: 5 * 1024 * 1024, // 5MB

  // Teléfono y documento
  PHONE_MIN_LENGTH: 10,
  DOCUMENT_MIN_LENGTH: 7
}

// ========================================
// LÍMITES DE VALIDACIÓN - EVENTOS
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
// PATRONES REGEX
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
// TIPOS DE ARCHIVO SOPORTADOS
// ========================================

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// ========================================
// MENSAJES DE ERROR COMUNES
// ========================================

export const ERROR_MESSAGES = {
  // Errores generales
  REQUIRED: 'Este campo es requerido',
  INVALID_FORMAT: 'Formato inválido',

  // Email
  INVALID_EMAIL: 'Ingresa un email válido',

  // Contraseña
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
  PASSWORD_WEAK: 'La contraseña debe contener mayúsculas, minúsculas y números',

  // Teléfono
  INVALID_PHONE: 'El teléfono solo debe contener números',
  PHONE_TOO_SHORT: 'El teléfono debe tener al menos 10 dígitos',

  // Fecha
  INVALID_DATE: 'Ingresa una fecha válida',
  AGE_RESTRICTION: 'Debes ser mayor de 18 años',
  FUTURE_DATE_ONLY: 'La fecha debe ser futura',
  DATE_TOO_FAR: 'La fecha no puede ser tan lejana',

  // Archivos
  FILE_TOO_LARGE: 'El archivo es demasiado grande (máximo 5MB)',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  IMAGES_REQUIRED: 'Debes subir al menos una imagen',

  // Texto
  TEXT_TOO_SHORT: 'El texto es muy corto',
  TEXT_TOO_LONG: 'El texto es muy largo',
  ONLY_LETTERS_ALLOWED: 'Solo se permiten letras',
  ONLY_NUMBERS_ALLOWED: 'Solo se permiten números',

  // Tags
  TAGS_MIN_REQUIRED: 'Selecciona al menos un tag',
  TAGS_MAX_EXCEEDED: 'No puedes seleccionar más de 10 tags',

  // Errores de red/servidor
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión de nuevo.',

  // Eventos
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

// ========================================
// MENSAJES DE VALIDACIÓN PERSONALIZADOS
// ========================================

/**
 * Genera mensaje de longitud mínima
 */
export const minLengthMessage = (field, min) => `${field} debe tener al menos ${min} caracteres`

/**
 * Genera mensaje de longitud máxima
 */
export const maxLengthMessage = (field, max) => `${field} no puede exceder ${max} caracteres`

/**
 * Genera mensaje de rango
 */
export const rangeMessage = (field, min, max) => `${field} debe estar entre ${min} y ${max}`

/**
 * Genera mensaje de valor mínimo
 */
export const minValueMessage = (field, min) => `${field} debe ser al menos ${min}`

/**
 * Genera mensaje de valor máximo
 */
export const maxValueMessage = (field, max) => `${field} no puede ser mayor a ${max}`
