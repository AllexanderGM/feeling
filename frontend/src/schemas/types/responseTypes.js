/**
 * TIPOS DE RESPUESTA DEL BACKEND
 *
 * Define la estructura esperada de las respuestas del backend
 * para mantener consistencia en el frontend.
 *
 * Este archivo contiene ÚNICAMENTE tipos/estructuras para DOCUMENTACIÓN.
 * NO contiene lógica, validaciones ni utilidades.
 *
 * RESPONSABILIDAD:
 * - Documentar estructura de respuestas del backend
 * - Servir como referencia para desarrolladores
 *
 * NO INCLUYE:
 * - Utilidades de validación (ver utils/responseHelpers.js)
 * - Utilidades de formateo (ver utils/eventHelpers.js)
 * - Lógica de negocio
 *
 * ACTUALIZADO (2025-10-18):
 * - Los tipos reflejan la estructura real de UserResponseDTO del backend
 * - tokens, status, user, privacy, notifications, metrics, matches, auth
 * - El ID del usuario está en user.id (no en la raíz)
 */

// ========================================
// TIPOS DE RESPUESTA DE AUTENTICACIÓN
// ========================================

/**
 * Tipo esperado para respuestas de login del backend
 *
 * El login usa un mapping específico:
 * - @Mapping(target = "tokens", source = "tokenPair")
 * - @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
 * - @Mapping(target = "user", source = "user")
 */
export const LOGIN_RESPONSE_TYPE = {
  tokens: {
    accessToken: 'string',
    refreshToken: 'string'
  },
  status: {
    verified: 'boolean',
    profileComplete: 'boolean',
    lastActive: 'array|string',
    approved: 'boolean',
    approvalStatus: 'string',
    role: 'string',
    availableAttempts: 'number',
    createdAt: 'array|string',
    accountDeactivated: 'boolean',
    deactivationDate: 'array|string|null',
    deactivationReason: 'string|null',
    dismissed: 'boolean',
    favorite: 'boolean',
    hasAcceptedMatch: 'boolean',
    hasPendingMatch: 'boolean'
  },
  user: {
    id: 'number',
    name: 'string',
    lastName: 'string',
    email: 'string',
    dateOfBirth: 'array|string|null',
    age: 'number|null',
    profession: 'string|null',
    document: 'string|null',
    phone: 'string|null',
    phoneCode: 'string|null',
    country: 'string|null',
    city: 'string|null',
    department: 'string|null',
    locality: 'string|null',
    description: 'string|null',
    images: 'array',
    mainImage: 'string|null',
    categoryInterest: 'string|null',
    gender: 'string|null',
    tags: 'array',
    agePreferenceMin: 'number|null',
    agePreferenceMax: 'number|null',
    locationPreferenceRadius: 'number|null',
    maritalStatus: 'string|null',
    height: 'number|null',
    eyeColor: 'string|null',
    hairColor: 'string|null',
    bodyType: 'string|null',
    education: 'string|null',
    church: 'string|null',
    religion: 'string|null',
    spiritualMoments: 'string|null',
    spiritualPractices: 'string|null',
    sexualRole: 'string|null',
    relationshipType: 'string|null'
  },
  // Secciones opcionales según el contexto de autenticación
  privacy: 'object|null',
  notifications: 'object|null',
  metrics: 'object|null',
  matches: 'object|null',
  auth: 'object|null'
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
  tokens: {
    accessToken: 'string',
    refreshToken: 'string'
  }
}

// ========================================
// TIPOS DE RESPUESTA DE USUARIO
// ========================================

/**
 * Tipo para respuesta de perfil de usuario completo
 * Refleja UserResponseDTO completo del backend (fullView)
 *
 * Este tipo se usa para endpoints que devuelven el usuario completo:
 * - GET /api/users/current (perfil propio)
 * - GET /api/users/{id} con vista full
 */
export const USER_PROFILE_RESPONSE_TYPE = {
  tokens: {
    accessToken: 'string',
    refreshToken: 'string'
  },
  status: {
    verified: 'boolean',
    profileComplete: 'boolean',
    lastActive: 'array|string',
    approved: 'boolean',
    approvalStatus: 'string',
    role: 'string',
    availableAttempts: 'number',
    createdAt: 'array|string',
    accountDeactivated: 'boolean',
    deactivationDate: 'array|string|null',
    deactivationReason: 'string|null',
    dismissed: 'boolean',
    favorite: 'boolean',
    hasAcceptedMatch: 'boolean',
    hasPendingMatch: 'boolean'
  },
  user: {
    id: 'number',
    name: 'string',
    lastName: 'string',
    email: 'string',
    dateOfBirth: 'array|string|null',
    age: 'number|null',
    profession: 'string|null',
    document: 'string|null',
    phone: 'string|null',
    phoneCode: 'string|null',
    country: 'string|null',
    city: 'string|null',
    department: 'string|null',
    locality: 'string|null',
    description: 'string|null',
    images: 'array',
    mainImage: 'string|null',
    categoryInterest: 'string|null',
    gender: 'string|null',
    tags: 'array',
    agePreferenceMin: 'number|null',
    agePreferenceMax: 'number|null',
    locationPreferenceRadius: 'number|null',
    maritalStatus: 'string|null',
    height: 'number|null',
    eyeColor: 'string|null',
    hairColor: 'string|null',
    bodyType: 'string|null',
    education: 'string|null',
    church: 'string|null',
    religion: 'string|null',
    spiritualMoments: 'string|null',
    spiritualPractices: 'string|null',
    sexualRole: 'string|null',
    relationshipType: 'string|null'
  },
  privacy: {
    publicAccount: 'boolean',
    searchVisibility: 'boolean',
    locationPublic: 'boolean',
    showAge: 'boolean',
    showLocation: 'boolean',
    showPhone: 'boolean',
    showMeInSearch: 'boolean'
  },
  notifications: {
    notificationsEmailEnabled: 'boolean',
    notificationsPhoneEnabled: 'boolean',
    notificationsMatchesEnabled: 'boolean',
    notificationsEventsEnabled: 'boolean',
    notificationsLoginEnabled: 'boolean',
    notificationsPaymentsEnabled: 'boolean'
  },
  metrics: {
    profileViews: 'number',
    likesReceived: 'number',
    matchesCount: 'number',
    popularityScore: 'number',
    profileCompleteness: 'number'
  },
  matches: {
    availableAttempts: 'number',
    todayMatches: 'number',
    totalMatches: 'number',
    maxDailyAttempts: 'number',
    pendingSent: 'number',
    pendingReceived: 'number',
    accepted: 'number',
    favorites: 'number'
  },
  auth: {
    userAuthProvider: 'string',
    externalId: 'string|null',
    externalAvatarUrl: 'string|null',
    lastExternalSync: 'array|string|null'
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
