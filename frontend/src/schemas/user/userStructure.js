/**
 * ESTRUCTURA ORGANIZADA DEL USUARIO
 *
 * Define la estructura de datos del usuario que refleja
 * la organización del backend: { status, profile, metrics }
 */

// ========================================
// ESTRUCTURA ORGANIZADA DEL USUARIO
// ========================================

/**
 * Campos de STATUS (estado del usuario)
 */
export const USER_STATUS_FIELDS = {
  verified: 'boolean',
  profileComplete: 'boolean',
  approved: 'boolean',
  role: 'string',
  availableAttempts: 'number',
  createdAt: 'array|string',
  lastActive: 'array|string'
}

/**
 * Campos requeridos del PROFILE para completar el perfil
 */
export const USER_PROFILE_REQUIRED_FIELDS = [
  // STEP 1: Información básica
  'name',
  'lastName',
  'email',
  'dateOfBirth',
  'phone',
  'city',
  'country',
  'images',

  // STEP 2: Características
  'description',
  'tags',

  // STEP 3: Preferencias
  'categoryInterest'
]

/**
 * Campos opcionales del PROFILE
 */
export const USER_PROFILE_OPTIONAL_FIELDS = ['age', 'document', 'department', 'locality', 'mainImage']

/**
 * Campos de METRICS (métricas sociales)
 */
export const USER_METRICS_FIELDS = {
  profileViews: 'number',
  likesReceived: 'number',
  matchesCount: 'number',
  popularityScore: 'number'
}

/**
 * Campos adicionales OBLIGATORIOS específicos por categoría
 * Basado en las validaciones condicionales del backend
 */
export const USER_CATEGORY_REQUIRED_FIELDS = {
  SPIRIT: ['religionId'], // Para SPIRIT: religión es obligatoria
  ROUSE: ['sexualRoleId', 'relationshipTypeId'], // Para ROUSE: rol sexual y tipo de relación son obligatorios
  ESSENCE: [] // Para ESSENCE: no hay campos adicionales obligatorios
}

/**
 * Campos adicionales OPCIONALES específicos por categoría
 */
export const USER_CATEGORY_OPTIONAL_FIELDS = {
  SPIRIT: ['spiritualMoments', 'spiritualPractices'],
  ROUSE: [],
  ESSENCE: []
}

// ========================================
// AGRUPACIÓN DE CAMPOS POR FUNCIONALIDAD
// ========================================

/**
 * Campos de preferencias del usuario
 */
export const USER_PREFERENCE_FIELDS = ['agePreferenceMin', 'agePreferenceMax', 'locationPreferenceRadius']

/**
 * Campos de configuración y privacidad
 */
export const USER_SETTINGS_FIELDS = ['showAge', 'showLocation', 'allowNotifications', 'showMeInSearch']

/**
 * Campos de contacto e identificación
 */
export const USER_CONTACT_FIELDS = ['email', 'phone', 'phoneCode', 'document']

/**
 * Campos de ubicación geográfica
 */
export const USER_LOCATION_FIELDS = ['country', 'city', 'department', 'locality']

/**
 * Campos físicos y características
 */
export const USER_PHYSICAL_FIELDS = ['height', 'bodyTypeId', 'eyeColorId', 'hairColorId']

/**
 * Campos de información personal
 */
export const USER_PERSONAL_FIELDS = ['genderId', 'maritalStatusId', 'educationLevelId', 'profession']

// ========================================
// VALORES POR DEFECTO
// ========================================

/**
 * Valores por defecto usando la nueva estructura organizada
 */
export const USER_DEFAULT_VALUES = {
  status: {
    verified: false,
    profileComplete: false,
    approved: false,
    role: 'CLIENT',
    availableAttempts: 0,
    totalAttemptsPurchased: 0,
    attemptsExpiryDate: null,
    createdAt: null,
    lastActive: null
  },
  profile: {
    // Información básica
    name: '',
    lastName: '',
    email: '',
    dateOfBirth: null,
    age: null,
    document: '',
    phone: '',
    phoneCode: '+57',

    // Ubicación geográfica
    country: 'Colombia',
    city: 'Bogotá',
    department: '',
    locality: '',

    // Información personal y descripción
    description: '',
    images: [],
    mainImage: null,

    // Categoría de interés
    categoryInterest: null,

    // Características físicas y personales
    gender: null,
    genderId: null,
    maritalStatus: null,
    maritalStatusId: null,
    height: null,
    eyeColor: null,
    eyeColorId: null,
    hairColor: null,
    hairColorId: null,
    bodyType: null,
    bodyTypeId: null,
    education: null,
    educationLevelId: null,
    profession: '',

    // Sistema de tags
    tags: [],

    // Campos específicos para SPIRIT
    church: '',
    religion: null,
    religionId: null,
    spiritualMoments: '',
    spiritualPractices: '',

    // Campos específicos para ROUSE
    sexualRole: null,
    sexualRoleId: null,
    relationshipType: null,
    relationshipTypeId: null,

    // Preferencias de matching
    agePreferenceMin: 18,
    agePreferenceMax: 40,
    locationPreferenceRadius: 50
  },
  metrics: {
    profileViews: 0,
    likesReceived: 0,
    matchesCount: 0,
    popularityScore: 0.0
  },
  privacy: {
    showAge: true,
    showLocation: true,
    showPhone: false,
    publicAccount: true,
    searchVisibility: true,
    locationPublic: true,
    showMeInSearch: true,
    allowNotifications: true
  },
  notifications: {
    notificationsEmailEnabled: true,
    notificationsPhoneEnabled: false,
    notificationsMatchesEnabled: true,
    notificationsEventsEnabled: true,
    notificationsLoginEnabled: true,
    notificationsPaymentsEnabled: true
  },
  auth: {
    userAuthProvider: 'LOCAL',
    externalId: null,
    externalAvatarUrl: null,
    lastExternalSync: null
  },
  account: {
    accountDeactivated: false,
    deactivationDate: null,
    deactivationReason: null
  },
  _metadata: {
    lastLogin: null,
    loginCount: 0,
    lastSyncWithServer: null
  }
}

// ========================================
// UTILIDADES PARA VALIDACIÓN
// ========================================

/**
 * Función para validar si un campo es especial (arrays u objetos)
 */
export const isSpecialField = (field, value) => {
  if (field === 'images') return value && value.length > 0
  if (field === 'tags') return value && value.length > 0
  return value && value.toString().trim() !== ''
}

/**
 * Validar si un usuario tiene perfil completo usando la nueva estructura
 */
export const isProfileComplete = user => {
  if (!user?.profile) return false

  return USER_PROFILE_REQUIRED_FIELDS.every(field => {
    const value = user.profile[field]
    return isSpecialField(field, value)
  })
}

/**
 * Campos de privacidad
 */
export const USER_PRIVACY_FIELDS = {
  showAge: 'boolean',
  showLocation: 'boolean',
  showPhone: 'boolean',
  publicAccount: 'boolean',
  searchVisibility: 'boolean',
  locationPublic: 'boolean',
  showMeInSearch: 'boolean',
  allowNotifications: 'boolean'
}

/**
 * Campos de notificaciones
 */
export const USER_NOTIFICATIONS_FIELDS = {
  notificationsEmailEnabled: 'boolean',
  notificationsPhoneEnabled: 'boolean',
  notificationsMatchesEnabled: 'boolean',
  notificationsEventsEnabled: 'boolean',
  notificationsLoginEnabled: 'boolean',
  notificationsPaymentsEnabled: 'boolean'
}

/**
 * Campos de autenticación OAuth
 */
export const USER_AUTH_FIELDS = {
  userAuthProvider: 'string',
  externalId: 'string',
  externalAvatarUrl: 'string',
  lastExternalSync: 'array|string'
}

/**
 * Campos de gestión de cuenta
 */
export const USER_ACCOUNT_FIELDS = {
  accountDeactivated: 'boolean',
  deactivationDate: 'array|string',
  deactivationReason: 'string'
}

/**
 * Formatear datos del formulario para enviar al backend usando la nueva estructura
 */
export const formatFormDataToApi = (formData, section = 'profile') => {
  if (!formData) return {}

  // Si los datos ya vienen organizados por secciones
  if (
    formData.profile ||
    formData.status ||
    formData.metrics ||
    formData.privacy ||
    formData.notifications ||
    formData.auth ||
    formData.account
  ) {
    return formData
  }

  // Si vienen datos planos, organizarlos en la estructura correcta
  const organizedData = {
    status: {},
    profile: {},
    metrics: {},
    privacy: {},
    notifications: {},
    auth: {},
    account: {}
  }

  Object.keys(formData).forEach(key => {
    if (USER_STATUS_FIELDS[key] !== undefined) {
      organizedData.status[key] = formData[key]
    } else if (USER_METRICS_FIELDS[key] !== undefined) {
      organizedData.metrics[key] = formData[key]
    } else if (USER_PRIVACY_FIELDS[key] !== undefined) {
      organizedData.privacy[key] = formData[key]
    } else if (USER_NOTIFICATIONS_FIELDS[key] !== undefined) {
      organizedData.notifications[key] = formData[key]
    } else if (USER_AUTH_FIELDS[key] !== undefined) {
      organizedData.auth[key] = formData[key]
    } else if (USER_ACCOUNT_FIELDS[key] !== undefined) {
      organizedData.account[key] = formData[key]
    } else {
      organizedData.profile[key] = formData[key]
    }
  })

  return organizedData
}

// ========================================
// UTILIDADES PARA CREACIÓN DE USUARIO
// ========================================

import { convertTimestamp } from '@utils/convertTimestamp'

/**
 * Obtener valores por defecto para un usuario específico preservando su estructura
 * Incluye conversión automática de timestamps del backend
 */
export const getDefaultValuesForUser = (existingUser = null) => {
  if (!existingUser) return { ...USER_DEFAULT_VALUES }

  // Convertir timestamps en existingUser antes de procesar
  const processedUser = { ...existingUser }

  // Convertir timestamps en status
  if (processedUser.status) {
    processedUser.status = {
      ...processedUser.status,
      createdAt: convertTimestamp(processedUser.status.createdAt),
      lastActive: convertTimestamp(processedUser.status.lastActive),
      attemptsExpiryDate: convertTimestamp(processedUser.status.attemptsExpiryDate)
    }
  }

  // Convertir timestamps en auth
  if (processedUser.auth) {
    processedUser.auth = {
      ...processedUser.auth,
      lastExternalSync: convertTimestamp(processedUser.auth.lastExternalSync)
    }
  }

  // Convertir timestamps en account
  if (processedUser.account) {
    processedUser.account = {
      ...processedUser.account,
      deactivationDate: convertTimestamp(processedUser.account.deactivationDate)
    }
  }

  return {
    status: {
      ...USER_DEFAULT_VALUES.status,
      ...processedUser.status
    },
    profile: {
      ...USER_DEFAULT_VALUES.profile,
      ...processedUser.profile
    },
    metrics: {
      ...USER_DEFAULT_VALUES.metrics,
      ...processedUser.metrics
    },
    privacy: {
      ...USER_DEFAULT_VALUES.privacy,
      ...processedUser.privacy
    },
    notifications: {
      ...USER_DEFAULT_VALUES.notifications,
      ...processedUser.notifications
    },
    auth: {
      ...USER_DEFAULT_VALUES.auth,
      ...processedUser.auth
    },
    account: {
      ...USER_DEFAULT_VALUES.account,
      ...processedUser.account
    },
    _metadata: {
      ...USER_DEFAULT_VALUES._metadata,
      ...processedUser._metadata
    }
  }
}
