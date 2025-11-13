/**
 * SCHEMAS CENTRALIZADOS - ÍNDICE PRINCIPAL
 *
 * Este archivo centraliza todas las exportaciones de schemas y utilidades relacionadas.
 *
 * ESTRUCTURA ORGANIZADA:
 * 📁 auth/           - Esquemas de autenticación y validaciones
 * 📁 user/           - Estructura de usuario, accessors, esquemas de formularios
 * 📁 validation/     - Constantes de validación, validaciones base reutilizables
 * 📁 types/          - Constantes, enums, tipos de respuesta (documentación)
 * 📁 event/          - Esquemas de eventos
 *
 * IMPORTACIÓN RECOMENDADA:
 * import { loginSchema, USER_ROLES, getUserName } from '@schemas'
 *
 * ACTUALIZADO: 2025-10-19
 * - Separación clara de responsabilidades
 * - Constantes de validación movidas a validation/validationConstants.js
 * - Utilidades movidas a utils/ (authHelpers, responseHelpers, eventHelpers)
 */

// ========================================
// AUTENTICACIÓN - ESQUEMAS DE VALIDACIÓN
// ========================================
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  fullRegistrationSchema
} from './auth/authSchemas'

// ========================================
// UTILIDADES RE-EXPORTADAS (desde utils/)
// ========================================
// Re-exportar por compatibilidad desde utils/

// Utilidades de autenticación
export { validateTokenFormat, isValidEmailFormat, getPasswordStrength } from '@utils/authHelpers'

// Utilidades de respuestas
export {
  isValidUserStructure,
  isValidLoginResponse,
  isErrorResponse,
  isSuccessResponse,
  extractErrorMessage,
  extractResponseData,
  extractTokens,
  extractUser,
  isUserAuthenticated,
  isUserProfileComplete,
  isUserApproved,
  isUserAdmin
} from '@utils/responseHelpers'

// Utilidades de eventos
export {
  isValidEventResponse,
  isValidRegistrationResponse,
  isValidPaymentResponse,
  isEventAvailableForRegistration,
  getEventAvailabilityStatus,
  formatEventForDisplay,
  formatEventDateShort,
  formatEventPrice,
  extractEventErrorMessage,
  calculateOccupancyPercentage,
  isEventNearlyFull,
  getDaysUntilEvent,
  isEventUpcoming
} from '@utils/eventHelpers'

// ========================================
// USUARIO - ESTRUCTURA Y CONSTANTES
// ========================================
export {
  // Definición de campos por sección
  USER_STATUS_FIELDS,
  USER_METRICS_FIELDS,
  USER_PRIVACY_FIELDS,
  USER_NOTIFICATIONS_FIELDS,
  USER_AUTH_FIELDS,
  USER_MATCHES_FIELDS,

  // Campos requeridos y opcionales
  USER_USER_REQUIRED_FIELDS,
  USER_USER_OPTIONAL_FIELDS,
  USER_CATEGORY_REQUIRED_FIELDS,
  USER_CATEGORY_OPTIONAL_FIELDS,

  // Alias para compatibilidad (DEPRECATED)
  USER_USER_REQUIRED_FIELDS as USER_PROFILE_REQUIRED_FIELDS,
  USER_USER_OPTIONAL_FIELDS as USER_PROFILE_OPTIONAL_FIELDS,

  // Agrupación de campos por funcionalidad
  USER_PREFERENCE_FIELDS,
  USER_SETTINGS_FIELDS,
  USER_CONTACT_FIELDS,
  USER_LOCATION_FIELDS,
  USER_PHYSICAL_FIELDS,
  USER_PERSONAL_FIELDS,

  // Valores por defecto
  USER_DEFAULT_VALUES
} from './user/userStructure'

// ========================================
// USUARIO - ACCESSORS (ÚNICA FUENTE DE VERDAD)
// ========================================
export {
  // Accessors de secciones completas
  getUserStatus,
  getUserMetrics,
  getUserPrivacy,
  getUserNotifications,
  getUserAuth,
  getUserMatches,

  // Accessors de información básica
  getUserId,
  getUserName,
  getUserLastName,
  getUserFullName,
  getUserEmail,
  getUserPhone,
  getUserPhoneCode,
  getUserDateOfBirth,
  getUserAge,
  getUserDocument,

  // Accessors de ubicación
  getUserCountry,
  getUserCity,
  getUserDepartment,
  getUserLocality,

  // Accessors de perfil e imágenes
  getUserDescription,
  getUserImages,
  getUserMainImage,
  getUserAvatar,

  // Accessors de categoría e intereses
  getUserCategoryInterest,
  getUserTags,

  // Accessors de características físicas
  getUserGender,
  getUserGenderId,
  getUserMaritalStatus,
  getUserMaritalStatusId,
  getUserHeight,
  getUserEyeColor,
  getUserEyeColorId,
  getUserHairColor,
  getUserHairColorId,
  getUserBodyType,
  getUserBodyTypeId,
  getUserEducation,
  getUserEducationLevelId,
  getUserProfession,

  // Accessors de campos específicos por categoría
  getUserReligion,
  getUserReligionId,
  getUserChurch,
  getUserChurchId,
  getUserSpiritualMoments,
  getUserSpiritualPractices,
  getUserSexualRole,
  getUserSexualRoleId,
  getUserRelationshipType,
  getUserRelationshipId,

  // Accessors de preferencias de matching
  getUserAgePreferenceMin,
  getUserAgePreferenceMax,
  getUserLocationPreferenceRadius,

  // Accessors de status
  getUserVerified,
  getUserProfileComplete,
  getUserLastActive,
  getUserApproved,
  getUserApprovalStatus,
  getUserRole,
  getUserAvailableAttempts,
  getUserCreatedAt,
  getUserAccountDeactivated,
  getUserDeactivationDate,
  getUserDeactivationReason,
  getUserDismissed,
  getUserFavorite,
  getUserHasAcceptedMatch,
  getUserHasPendingMatch
} from './user/userStructure'

// ========================================
// USUARIO - UTILIDADES
// ========================================
export {
  // Validación
  isSpecialField,
  isProfileComplete,

  // Transformación de datos
  formatFormDataToApi,
  formatProfileCompletionData,
  getDefaultValuesForUser
} from './user/userStructure'

// ========================================
// USUARIO - ESQUEMAS DE FORMULARIOS
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

  // Utilidades de validación por pasos
  getFieldsForStep,
  getSchemaForStep,
  getCombinedProfileSchemaForStep,
  validateCategoryRequiredFields,
  createCategorySpecificSchema,
  getDefaultValuesForStep
} from './user/userSchemas'

// ========================================
// VALIDACIÓN - CONSTANTES
// ========================================
export {
  // Límites de validación
  USER_VALIDATION_LIMITS,
  EVENT_VALIDATION_LIMITS,

  // Patrones regex
  REGEX_PATTERNS,

  // Tipos de archivo soportados
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_IMAGE_EXTENSIONS,

  // Mensajes de error
  ERROR_MESSAGES,

  // Funciones generadoras de mensajes
  minLengthMessage,
  maxLengthMessage,
  rangeMessage,
  minValueMessage,
  maxValueMessage
} from './validation/validationConstants'

// ========================================
// VALIDACIÓN - VALIDACIONES BASE
// ========================================
export { baseValidations, conditionalValidations } from './validation/baseValidations'

// ========================================
// TIPOS Y CONSTANTES
// ========================================
export {
  // Enums de usuario
  USER_ROLES,
  CATEGORY_INTERESTS,
  AUTH_PROVIDERS,

  // Enums de estado
  USER_STATUS,
  VERIFICATION_STATUS,

  // Configuración
  DEFAULT_LOCATION,
  PROFILE_COMPLETION_STEPS,
  STEP_NAMES,

  // HTTP
  HTTP_STATUS,

  // UI
  THEME_MODES,
  NOTIFICATION_TYPES,
  LOADING_STATES,

  // Formularios
  FORM_MODES,
  INPUT_TYPES,

  // Eventos
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  EVENT_STATUS,
  EVENT_AVAILABILITY,

  // Pagos
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  SUPPORTED_CURRENCIES,

  // Configuración de eventos
  EVENT_PAGINATION,
  EVENT_SORT_OPTIONS,
  EVENT_FILTER_DEFAULTS
} from './types/constants'

// ========================================
// TIPOS DE RESPUESTA (DOCUMENTACIÓN)
// ========================================
export {
  // Autenticación
  LOGIN_RESPONSE_TYPE,
  REGISTER_RESPONSE_TYPE,
  REFRESH_TOKEN_RESPONSE_TYPE,

  // Usuario
  USER_PROFILE_RESPONSE_TYPE,
  USER_LIST_RESPONSE_TYPE,

  // Eventos
  EVENT_RESPONSE_TYPE,
  EVENT_LIST_RESPONSE_TYPE,
  EVENT_STATS_RESPONSE_TYPE,

  // Registro de eventos
  EVENT_REGISTRATION_RESPONSE_TYPE,
  REGISTRATION_LIST_RESPONSE_TYPE,

  // Pagos
  PAYMENT_INTENT_RESPONSE_TYPE,
  PAYMENT_CONFIRMATION_RESPONSE_TYPE,

  // Genéricos
  SUCCESS_RESPONSE_TYPE,
  ERROR_RESPONSE_TYPE,
  VALIDATION_ERROR_RESPONSE_TYPE,

  // Archivos
  FILE_UPLOAD_RESPONSE_TYPE,
  MULTIPLE_FILE_UPLOAD_RESPONSE_TYPE
} from './types/responseTypes'

// ========================================
// EVENTOS - ESQUEMAS
// ========================================
export {
  // Esquemas de creación y edición
  createEventSchema,
  editEventSchema,
  quickEventCreateSchema,
  createEditEventSchema,

  // Esquemas de búsqueda y filtrado
  eventSearchSchema,
  eventFilterSchema,

  // Utilidades de validación
  validateEventDateForEdit,
  validateCapacityForEdit,
  getTimeUntilEvent,
  hasAvailableSpots,
  getAvailableSpots,
  isFreeEvent
  // Nota: formatEventPrice está en eventHelpers.js, no aquí
} from './event/eventSchemas'

// Esquema de formulario para modales
export { eventFormSchema } from './eventFormSchema'

export {
  // Esquemas de registro y pago
  eventRegistrationSchema,
  confirmPaymentSchema,
  cancelRegistrationSchema,
  createPaymentIntentSchema,
  processPaymentSchema,

  // Esquemas de búsqueda de registros
  registrationSearchSchema,
  registrationFilterSchema,

  // Utilidades de validación de registros
  canRegisterForEvent,
  canCancelRegistration,
  getCancellationDeadline,
  canProcessPayment,

  // Utilidades de pago
  generatePaymentDescription,
  isPaymentCompleted,
  isPaymentPending,
  isPaymentFailed,
  isPaymentCancelled,
  getPaymentStatusColor,
  getPaymentStatusText,

  // Utilidades de estadísticas
  calculateRegistrationStats
} from './event/eventRegistrationSchemas'
