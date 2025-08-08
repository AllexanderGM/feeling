/**
 * SCHEMAS CENTRALIZADOS - NUEVA ESTRUCTURA ORGANIZADA
 *
 * Este archivo centraliza todos los esquemas de la aplicación organizados por categorías:
 *
 * 📁 auth/           - Esquemas de autenticación (login, registro, contraseñas)
 * 📁 user/           - Esquemas del usuario (estructura, perfil, validaciones)
 * 📁 validation/     - Validaciones base reutilizables
 * 📁 types/          - Tipos, constantes y respuestas del backend
 *
 * IMPORTACIÓN RECOMENDADA:
 * import { loginSchema, registerSchema } from '@/schemas'
 * import { USER_ROLES, CATEGORY_INTERESTS } from '@/schemas'
 * import { stepBasicInfoSchema } from '@/schemas'
 */

// ========================================
// AUTENTICACIÓN
// ========================================
export {
  // Esquemas principales
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  fullRegistrationSchema,

  // Utilidades de auth
  extractLoginData,
  extractRegisterData,
  extractResetPasswordData,
  extractForgotPasswordData,
  extractVerifyEmailData,
  validateTokenFormat,
  isValidEmailFormat,
  getPasswordStrength
} from './auth/authSchemas'

// ========================================
// USUARIO - ESTRUCTURA Y DATOS
// ========================================
export {
  // Estructura organizada del usuario
  USER_STATUS_FIELDS,
  USER_PROFILE_REQUIRED_FIELDS,
  USER_PROFILE_OPTIONAL_FIELDS,
  USER_METRICS_FIELDS,
  USER_CATEGORY_REQUIRED_FIELDS,
  USER_CATEGORY_OPTIONAL_FIELDS,

  // Agrupación de campos
  USER_PREFERENCE_FIELDS,
  USER_SETTINGS_FIELDS,
  USER_CONTACT_FIELDS,
  USER_LOCATION_FIELDS,
  USER_PHYSICAL_FIELDS,
  USER_PERSONAL_FIELDS,

  // Valores por defecto y utilidades
  USER_DEFAULT_VALUES,
  isSpecialField,
  isProfileComplete,
  formatFormDataToApi,
  formatProfileCompletionData,
  getDefaultValuesForUser
} from './user/userStructure'

// ========================================
// USUARIO - ESQUEMAS DE VALIDACIÓN
// ========================================
export {
  // Esquemas por pasos
  stepBasicInfoSchema,
  stepCharacteristicsSchema,
  stepPreferencesSchema,
  stepConfigurationSchema,

  // Esquema completo
  completeProfileSchema,

  // Esquemas de edición
  basicProfileEditSchema,
  characteristicsEditSchema,
  preferencesEditSchema,

  // Utilidades
  getFieldsForStep,
  getSchemaForStep,
  getDefaultValuesForStep,
  validateCategoryRequiredFields,
  createCategorySpecificSchema
} from './user/profileSchemas'

// ========================================
// VALIDACIONES BASE REUTILIZABLES
// ========================================
export {
  // Validaciones principales
  baseValidations,
  conditionalValidations,
  fileValidations,
  optionalValidations,

  // Utilidades para crear esquemas
  createCustomSchema,
  combineSchemas
} from './validation/baseValidations'

// ========================================
// EVENTOS - ESQUEMAS DE VALIDACIÓN
// ========================================
export {
  // Esquemas principales de eventos
  createEventSchema,
  editEventSchema,
  quickEventCreateSchema,

  // Esquemas de búsqueda y filtrado
  eventSearchSchema,
  eventFilterSchema,

  // Utilidades de eventos
  validateEventDateForEdit,
  getTimeUntilEvent,
  hasAvailableSpots,
  getAvailableSpots,
  isFreeEvent,
  formatEventPrice,
  validateCapacityForEdit,
  createEditEventSchema
} from './event/eventSchemas'

// ========================================
// EVENTOS - REGISTRO Y PAGOS
// ========================================
export {
  // Esquemas de registro
  eventRegistrationSchema,
  confirmPaymentSchema,
  cancelRegistrationSchema,

  // Esquemas de pago
  createPaymentIntentSchema,
  processPaymentSchema,

  // Esquemas de búsqueda de registros
  registrationSearchSchema,
  registrationFilterSchema,

  // Utilidades de registro y pagos
  canRegisterForEvent,
  canCancelRegistration,
  getCancellationDeadline,
  canProcessPayment,
  generatePaymentDescription,
  isPaymentCompleted,
  isPaymentPending,
  isPaymentFailed,
  isPaymentCancelled,
  getPaymentStatusColor,
  getPaymentStatusText,
  calculateRegistrationStats
} from './event/eventRegistrationSchemas'

// ========================================
// TIPOS Y CONSTANTES
// ========================================
export {
  // Enums de usuario
  USER_ROLES,
  CATEGORY_INTERESTS,
  AUTH_PROVIDERS,

  // Constantes de estado
  USER_STATUS,
  VERIFICATION_STATUS,

  // Límites de validación
  VALIDATION_LIMITS,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_IMAGE_EXTENSIONS,

  // Configuración
  DEFAULT_LOCATION,
  PROFILE_COMPLETION_STEPS,
  STEP_NAMES,

  // API y UI
  API_ENDPOINTS,
  HTTP_STATUS,
  THEME_MODES,
  NOTIFICATION_TYPES,
  LOADING_STATES,
  FORM_MODES,
  INPUT_TYPES,

  // Patrones y mensajes
  REGEX_PATTERNS,
  ERROR_MESSAGES,

  // Constantes de eventos
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  SUPPORTED_CURRENCIES,
  EVENT_VALIDATION_LIMITS,
  EVENT_STATUS,
  EVENT_AVAILABILITY,
  EVENT_PAGINATION,
  EVENT_SORT_OPTIONS,
  EVENT_FILTER_DEFAULTS
} from './types/constants'

export {
  // Tipos de respuesta de usuarios
  LOGIN_RESPONSE_TYPE,
  REGISTER_RESPONSE_TYPE,
  REFRESH_TOKEN_RESPONSE_TYPE,
  USER_PROFILE_RESPONSE_TYPE,
  USER_LIST_RESPONSE_TYPE,

  // Tipos de respuesta de eventos
  EVENT_RESPONSE_TYPE,
  EVENT_LIST_RESPONSE_TYPE,
  EVENT_STATS_RESPONSE_TYPE,
  EVENT_REGISTRATION_RESPONSE_TYPE,
  REGISTRATION_LIST_RESPONSE_TYPE,
  PAYMENT_INTENT_RESPONSE_TYPE,
  PAYMENT_CONFIRMATION_RESPONSE_TYPE,

  // Tipos de respuesta genéricos
  SUCCESS_RESPONSE_TYPE,
  ERROR_RESPONSE_TYPE,
  VALIDATION_ERROR_RESPONSE_TYPE,
  FILE_UPLOAD_RESPONSE_TYPE,
  MULTIPLE_FILE_UPLOAD_RESPONSE_TYPE,

  // Utilidades de validación de tipos generales
  isValidUserStructure,
  isValidLoginResponse,
  isErrorResponse,
  isSuccessResponse,
  extractErrorMessage,
  extractResponseData,

  // Utilidades específicas para eventos
  isValidEventResponse,
  isValidRegistrationResponse,
  isValidPaymentResponse,
  extractEventErrorMessage,
  isEventAvailableForRegistration,
  getEventAvailabilityStatus,
  formatEventForDisplay
} from './types/responseTypes'

// ========================================
// ESQUEMAS LEGACY (COMPATIBILIDAD)
// ========================================
// Exportaciones para mantener compatibilidad con código existente
// DEPRECADO: Usar las nuevas importaciones organizadas

// Alias para compatibilidad hacia atrás
export { stepCharacteristicsSchema as step2Schema } from './user/profileSchemas'
export { stepPreferencesSchema as step3Schema } from './user/profileSchemas'
export { completeProfileSchema as ProfileCompleteSchema } from './user/profileSchemas'
