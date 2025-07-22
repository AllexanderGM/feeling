/**
 * TIPOS DE RESPUESTA DEL BACKEND
 * 
 * Define la estructura esperada de las respuestas del backend
 * para mantener consistencia en el frontend.
 */

// ========================================
// TIPOS DE RESPUESTA DE AUTENTICACIÓN
// ========================================

/**
 * Tipo esperado para respuestas de login del backend
 */
export const LOGIN_RESPONSE_TYPE = {
  accessToken: 'string',
  refreshToken: 'string',
  status: {
    verified: 'boolean',
    profileComplete: 'boolean',
    approved: 'boolean',
    role: 'string',
    availableAttempts: 'number',
    createdAt: 'array|string',
    lastActive: 'array|string'
  },
  profile: {
    name: 'string',
    lastName: 'string',
    email: 'string',
    dateOfBirth: 'array|string|null',
    age: 'number|null',
    document: 'string|null',
    phone: 'string|null',
    city: 'string|null',
    department: 'string|null',
    country: 'string|null',
    description: 'string|null',
    images: 'array',
    mainImage: 'string|null',
    categoryInterest: 'string|null',
    tags: 'array'
  },
  metrics: {
    profileViews: 'number',
    likesReceived: 'number',
    matchesCount: 'number',
    popularityScore: 'number'
  }
}

/**
 * Tipo para respuesta de registro
 */
export const REGISTER_RESPONSE_TYPE = {
  message: 'string',
  user: {
    id: 'string|number',
    email: 'string',
    verified: 'boolean',
    createdAt: 'string'
  },
  verificationRequired: 'boolean'
}

/**
 * Tipo para respuesta de refresh token
 */
export const REFRESH_TOKEN_RESPONSE_TYPE = {
  accessToken: 'string',
  refreshToken: 'string',
  expiresIn: 'number'
}

// ========================================
// TIPOS DE RESPUESTA DE USUARIO
// ========================================

/**
 * Tipo para respuesta de perfil de usuario
 */
export const USER_PROFILE_RESPONSE_TYPE = {
  id: 'string|number',
  status: {
    verified: 'boolean',
    profileComplete: 'boolean',
    approved: 'boolean',
    role: 'string',
    availableAttempts: 'number',
    createdAt: 'string',
    lastActive: 'string'
  },
  profile: {
    name: 'string',
    lastName: 'string',
    email: 'string',
    dateOfBirth: 'string|null',
    age: 'number|null',
    document: 'string|null',
    phone: 'string|null',
    phoneCode: 'string|null',
    city: 'string|null',
    department: 'string|null',
    country: 'string|null',
    locality: 'string|null',
    description: 'string|null',
    images: 'array',
    mainImage: 'string|null',
    categoryInterest: 'string|null',
    tags: 'array',
    genderId: 'string|null',
    height: 'number|null',
    bodyTypeId: 'string|null',
    eyeColorId: 'string|null',
    hairColorId: 'string|null',
    maritalStatusId: 'string|null',
    educationLevelId: 'string|null',
    profession: 'string|null',
    religionId: 'string|null',
    sexualRoleId: 'string|null',
    relationshipTypeId: 'string|null'
  },
  metrics: {
    profileViews: 'number',
    likesReceived: 'number',
    matchesCount: 'number',
    popularityScore: 'number'
  },
  preferences: {
    agePreferenceMin: 'number',
    agePreferenceMax: 'number',
    locationPreferenceRadius: 'number'
  },
  settings: {
    showAge: 'boolean',
    showLocation: 'boolean',
    allowNotifications: 'boolean',
    showMeInSearch: 'boolean'
  }
}

/**
 * Tipo para lista de usuarios
 */
export const USER_LIST_RESPONSE_TYPE = {
  users: 'array',
  pagination: {
    currentPage: 'number',
    totalPages: 'number',
    totalItems: 'number',
    itemsPerPage: 'number'
  },
  filters: {
    role: 'string|null',
    status: 'string|null',
    category: 'string|null'
  }
}

// ========================================
// TIPOS DE RESPUESTA DE EVENTOS
// ========================================

/**
 * Tipo para respuesta de evento individual
 */
export const EVENT_RESPONSE_TYPE = {
  id: 'number',
  title: 'string',
  description: 'string',
  eventDate: 'string',
  price: 'number',
  maxCapacity: 'number',
  currentAttendees: 'number',
  availableSpots: 'number',
  category: 'string',
  categoryDisplayName: 'string',
  mainImage: 'string|null',
  createdAt: 'string',
  updatedAt: 'string',
  isActive: 'boolean',
  isFull: 'boolean',
  hasAvailableSpots: 'boolean',
  createdByName: 'string',
  createdById: 'number'
}

/**
 * Tipo para lista de eventos
 */
export const EVENT_LIST_RESPONSE_TYPE = {
  events: 'array',
  pagination: {
    currentPage: 'number',
    totalPages: 'number',
    totalItems: 'number',
    itemsPerPage: 'number'
  },
  filters: {
    category: 'string|null',
    priceRange: 'object|null',
    dateRange: 'object|null',
    availability: 'string|null'
  }
}

/**
 * Tipo para respuesta de estadísticas de eventos
 */
export const EVENT_STATS_RESPONSE_TYPE = {
  totalEvents: 'number',
  activeEvents: 'number',
  upcomingEvents: 'number',
  totalAttendees: 'number',
  eventsByCategory: 'object',
  totalRevenue: 'number'
}

// ========================================
// TIPOS DE RESPUESTA DE REGISTRO DE EVENTOS
// ========================================

/**
 * Tipo para respuesta de registro de evento
 */
export const EVENT_REGISTRATION_RESPONSE_TYPE = {
  id: 'number',
  userId: 'number',
  userName: 'string',
  eventId: 'number',
  eventTitle: 'string',
  eventDate: 'string',
  registrationDate: 'string',
  paymentStatus: 'string',
  paymentStatusDisplayName: 'string',
  amountPaid: 'number',
  stripePaymentIntentId: 'string|null',
  paymentDate: 'string|null',
  cancellationDate: 'string|null',
  isConfirmed: 'boolean',
  isPaid: 'boolean',
  isPending: 'boolean',
  isCancelled: 'boolean'
}

/**
 * Tipo para lista de registros
 */
export const REGISTRATION_LIST_RESPONSE_TYPE = {
  registrations: 'array',
  pagination: {
    currentPage: 'number',
    totalPages: 'number',
    totalItems: 'number',
    itemsPerPage: 'number'
  },
  stats: {
    total: 'number',
    completed: 'number',
    pending: 'number',
    cancelled: 'number',
    totalAmount: 'number'
  }
}

// ========================================
// TIPOS DE RESPUESTA DE PAGOS
// ========================================

/**
 * Tipo para respuesta de intención de pago
 */
export const PAYMENT_INTENT_RESPONSE_TYPE = {
  paymentIntentId: 'string',
  clientSecret: 'string',
  amount: 'number',
  currency: 'string',
  status: 'string',
  description: 'string'
}

/**
 * Tipo para respuesta de confirmación de pago
 */
export const PAYMENT_CONFIRMATION_RESPONSE_TYPE = {
  success: 'boolean',
  paymentIntentId: 'string',
  registrationId: 'number',
  status: 'string',
  amountPaid: 'number',
  paymentDate: 'string',
  message: 'string'
}

// ========================================
// TIPOS DE RESPUESTA GENÉRICOS
// ========================================

/**
 * Tipo para respuestas de éxito simples
 */
export const SUCCESS_RESPONSE_TYPE = {
  success: 'boolean',
  message: 'string',
  data: 'any|null'
}

/**
 * Tipo para respuestas de error
 */
export const ERROR_RESPONSE_TYPE = {
  success: 'boolean',
  error: {
    code: 'string',
    message: 'string',
    details: 'array|object|null'
  },
  timestamp: 'string'
}

/**
 * Tipo para respuestas de validación
 */
export const VALIDATION_ERROR_RESPONSE_TYPE = {
  success: 'boolean',
  error: {
    code: 'string',
    message: 'string',
    validationErrors: {
      field: 'string',
      message: 'string'
    }
  }
}

// ========================================
// TIPOS DE RESPUESTA DE ARCHIVOS
// ========================================

/**
 * Tipo para respuesta de subida de archivos
 */
export const FILE_UPLOAD_RESPONSE_TYPE = {
  success: 'boolean',
  file: {
    id: 'string',
    originalName: 'string',
    fileName: 'string',
    path: 'string',
    url: 'string',
    size: 'number',
    mimeType: 'string'
  },
  message: 'string'
}

/**
 * Tipo para respuesta de subida múltiple
 */
export const MULTIPLE_FILE_UPLOAD_RESPONSE_TYPE = {
  success: 'boolean',
  files: 'array',
  failedFiles: 'array',
  message: 'string'
}

// ========================================
// UTILIDADES DE VALIDACIÓN DE TIPOS
// ========================================

/**
 * Verificar si un objeto tiene la estructura de usuario esperada
 */
export const isValidUserStructure = (user) => {
  return user && 
         typeof user === 'object' &&
         user.status &&
         user.profile &&
         user.metrics &&
         typeof user.status === 'object' &&
         typeof user.profile === 'object' &&
         typeof user.metrics === 'object'
}

/**
 * Verificar si un objeto tiene la estructura de respuesta de login esperada
 */
export const isValidLoginResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         typeof response.accessToken === 'string' &&
         typeof response.refreshToken === 'string' &&
         response.status &&
         response.profile &&
         typeof response.status === 'object' &&
         typeof response.profile === 'object'
}

/**
 * Verificar si una respuesta es de error
 */
export const isErrorResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         response.success === false &&
         response.error &&
         typeof response.error === 'object'
}

/**
 * Verificar si una respuesta es de éxito
 */
export const isSuccessResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         response.success === true
}

/**
 * Extraer mensaje de error de una respuesta
 */
export const extractErrorMessage = (response) => {
  if (!isErrorResponse(response)) return 'Error desconocido'
  
  if (response.error.validationErrors) {
    // Si hay errores de validación, tomar el primero
    const firstError = Object.values(response.error.validationErrors)[0]
    return Array.isArray(firstError) ? firstError[0] : firstError
  }
  
  return response.error.message || 'Error del servidor'
}

/**
 * Extraer datos de una respuesta exitosa
 */
export const extractResponseData = (response) => {
  if (!isSuccessResponse(response)) return null
  return response.data || response
}

// ========================================
// UTILIDADES ESPECÍFICAS PARA EVENTOS
// ========================================

/**
 * Verificar si una respuesta es de evento válida
 */
export const isValidEventResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         typeof response.id === 'number' &&
         typeof response.title === 'string' &&
         typeof response.eventDate === 'string' &&
         typeof response.price === 'number' &&
         typeof response.category === 'string'
}

/**
 * Verificar si una respuesta es de registro válida
 */
export const isValidRegistrationResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         typeof response.id === 'number' &&
         typeof response.eventId === 'number' &&
         typeof response.paymentStatus === 'string'
}

/**
 * Verificar si una respuesta de pago es válida
 */
export const isValidPaymentResponse = (response) => {
  return response &&
         typeof response === 'object' &&
         typeof response.paymentIntentId === 'string' &&
         typeof response.clientSecret === 'string'
}

/**
 * Extraer información de error específica de eventos
 */
export const extractEventErrorMessage = (response) => {
  if (!isErrorResponse(response)) return 'Error desconocido'
  
  const errorCode = response.error.code
  const eventErrorMessages = {
    'EVENT_NOT_FOUND': 'Evento no encontrado',
    'EVENT_FULL': 'El evento está lleno',
    'EVENT_INACTIVE': 'El evento no está activo',
    'ALREADY_REGISTERED': 'Ya estás registrado en este evento',
    'PAYMENT_FAILED': 'Error en el procesamiento del pago',
    'REGISTRATION_CLOSED': 'Las inscripciones están cerradas'
  }
  
  return eventErrorMessages[errorCode] || response.error.message || 'Error del servidor'
}

/**
 * Verificar si un evento está disponible para registro
 */
export const isEventAvailableForRegistration = (event) => {
  if (!isValidEventResponse(event)) return false
  
  const eventDate = new Date(event.eventDate)
  const now = new Date()
  
  return event.isActive && 
         !event.isFull && 
         event.hasAvailableSpots && 
         eventDate > now
}

/**
 * Obtener estado de disponibilidad de evento
 */
export const getEventAvailabilityStatus = (event) => {
  if (!isValidEventResponse(event)) return 'unknown'
  
  if (!event.isActive) return 'inactive'
  
  const eventDate = new Date(event.eventDate)
  const now = new Date()
  
  if (eventDate <= now) return 'past'
  if (event.isFull) return 'full'
  if (event.availableSpots <= 5) return 'limited'
  
  return 'available'
}

/**
 * Formatear evento para mostrar en UI
 */
export const formatEventForDisplay = (event) => {
  if (!isValidEventResponse(event)) return null
  
  return {
    ...event,
    formattedDate: new Date(event.eventDate).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedPrice: event.price === 0 ? 'Gratis' : new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(event.price),
    availabilityStatus: getEventAvailabilityStatus(event)
  }
}