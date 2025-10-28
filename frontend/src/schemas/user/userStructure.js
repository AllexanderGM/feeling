/**
 * ESTRUCTURA ORGANIZADA DEL USUARIO
 *
 * Define la estructura de datos del usuario que refleja
 * la organización del backend: { status, user, metrics, privacy, notifications, auth, matches }
 *
 * Este archivo es la ÚNICA FUENTE DE VERDAD para:
 * - Definición de campos y sus tipos
 * - Valores por defecto
 * - Accessors para acceder a los datos
 * - Utilidades de transformación y validación
 */

import { convertTimestamp } from '@utils/convertTimestamp'

// ========================================
// DEFINICIÓN DE CAMPOS POR SECCIÓN
// ========================================

/**
 * Campos de STATUS (estado del usuario)
 * Refleja UserStatusDTO del backend
 */
export const USER_STATUS_FIELDS = {
  verified: 'boolean',
  profileComplete: 'boolean',
  configurationCompleted: 'boolean',
  lastActive: 'array|string',
  approved: 'boolean',
  approvalStatus: 'string',
  role: 'string',
  availableAttempts: 'number',
  createdAt: 'array|string',
  accountDeactivated: 'boolean',
  deactivationDate: 'array|string',
  deactivationReason: 'string',
  dismissed: 'boolean',
  favorite: 'boolean',
  hasAcceptedMatch: 'boolean',
  hasPendingMatch: 'boolean'
}

/**
 * Campos de METRICS (métricas sociales)
 * Refleja UserPerformanceMetricsDTO del backend
 */
export const USER_METRICS_FIELDS = {
  profileViews: 'number',
  likesReceived: 'number',
  matchesCount: 'number',
  popularityScore: 'number',
  profileCompleteness: 'number'
}

/**
 * Campos de PRIVACY (privacidad)
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
 * Campos de NOTIFICATIONS (notificaciones)
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
 * Campos de AUTH (autenticación OAuth)
 * Refleja AuthProviderInfoDTO del backend
 */
export const USER_AUTH_FIELDS = {
  userAuthProvider: 'string',
  externalId: 'string',
  externalAvatarUrl: 'string',
  lastExternalSync: 'array|string'
}

/**
 * Campos de MATCHES (matches del usuario)
 * Refleja UserMatchesDTO del backend
 */
export const USER_MATCHES_FIELDS = {
  availableAttempts: 'number',
  reservedAttempts: 'number',
  totalRemainingAttempts: 'number',
  todayMatches: 'number',
  sentMatches: 'number',
  receivedMatches: 'number',
  pendingSent: 'number',
  pendingReceived: 'number',
  accepted: 'number',
  favorites: 'number'
}

// ========================================
// CAMPOS REQUERIDOS Y OPCIONALES DEL PERFIL
// ========================================

/**
 * Campos requeridos del USER para completar el perfil
 */
export const USER_USER_REQUIRED_FIELDS = [
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
 * Campos opcionales del USER
 */
export const USER_USER_OPTIONAL_FIELDS = ['age', 'document', 'department', 'locality', 'mainImage']

/**
 * Campos adicionales OBLIGATORIOS específicos por categoría
 * Basado en las validaciones condicionales del backend
 */
export const USER_CATEGORY_REQUIRED_FIELDS = {
  SPIRIT: ['religionId'], // Para SPIRIT: religión es obligatoria
  ROUSE: ['sexualRoleId', 'relationshipId'], // Para ROUSE: rol sexual y tipo de relación son obligatorios
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
 * Valores por defecto para la estructura organizada del usuario
 * IMPORTANTE: Los tokens NO forman parte de esta estructura.
 * Se gestionan por separado en sus propias cookies (access_token, refresh_token).
 */
export const USER_DEFAULT_VALUES = {
  status: {
    verified: false,
    profileComplete: false,
    configurationCompleted: false,
    lastActive: null,
    approved: false,
    approvalStatus: 'PENDING',
    role: 'CLIENT',
    availableAttempts: 0,
    createdAt: null,
    accountDeactivated: false,
    deactivationDate: null,
    deactivationReason: null,
    dismissed: false,
    favorite: false,
    hasAcceptedMatch: false,
    hasPendingMatch: false
  },
  user: {
    // ID del usuario
    id: null,

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
    height: 170,
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
    religion: null,
    religionId: null,
    spiritualMoments: '',
    spiritualPractices: '',

    // Campos específicos para ROUSE
    sexualRole: null,
    sexualRoleId: null,
    relationshipType: null,
    relationshipId: null,

    // Preferencias de matching
    agePreferenceMin: 18,
    agePreferenceMax: 40,
    locationPreferenceRadius: 50
  },
  metrics: {
    profileViews: 0,
    likesReceived: 0,
    matchesCount: 0,
    popularityScore: 0.0,
    profileCompleteness: 0.0
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
  matches: {
    availableAttempts: 0,
    reservedAttempts: 0,
    totalRemainingAttempts: 0,
    todayMatches: 0,
    sentMatches: 0,
    receivedMatches: 0,
    pendingSent: 0,
    pendingReceived: 0,
    accepted: 0,
    favorites: 0
  }
}

// ========================================
// ACCESSORS CENTRALIZADOS - ÚNICA FUENTE DE VERDAD
// ========================================

/**
 * ACCESSORS PARA ACCEDER A LA ESTRUCTURA DEL USUARIO
 * Estos son la ÚNICA forma correcta de acceder a los datos del usuario.
 * Encapsulan la estructura interna y permiten cambios futuros sin romper código.
 */

/**
 * Acceso seguro a user.user (datos del perfil)
 * @private - Usar accessors específicos en lugar de este
 */
const getUserProfile = user => user?.user || {}

/**
 * Acceso seguro a user.status (estado del usuario)
 */
export const getUserStatus = user => user?.status || {}

/**
 * Acceso seguro a user.metrics (métricas)
 */
export const getUserMetrics = user => user?.metrics || {}

/**
 * Acceso seguro a user.privacy (privacidad)
 */
export const getUserPrivacy = user => user?.privacy || {}

/**
 * Acceso seguro a user.notifications (notificaciones)
 */
export const getUserNotifications = user => user?.notifications || {}

/**
 * Acceso seguro a user.auth (autenticación OAuth)
 */
export const getUserAuth = user => user?.auth || {}

/**
 * Acceso seguro a user.matches (matches)
 */
export const getUserMatches = user => user?.matches || {}

// ========================================
// ACCESSORS PARA CAMPOS INDIVIDUALES
// ========================================

// Información básica
export const getUserId = user => getUserProfile(user).id
export const getUserName = user => getUserProfile(user).name
export const getUserLastName = user => getUserProfile(user).lastName
export const getUserFullName = user => {
  const profile = getUserProfile(user)

  return `${profile.name || ''} ${profile.lastName || ''}`.trim()
}
export const getUserEmail = user => getUserProfile(user).email
export const getUserPhone = user => getUserProfile(user).phone
export const getUserPhoneCode = user => getUserProfile(user).phoneCode
export const getUserDateOfBirth = user => getUserProfile(user).dateOfBirth
export const getUserAge = user => getUserProfile(user).age
export const getUserDocument = user => getUserProfile(user).document

// Ubicación
export const getUserCountry = user => getUserProfile(user).country
export const getUserCity = user => getUserProfile(user).city
export const getUserDepartment = user => getUserProfile(user).department
export const getUserLocality = user => getUserProfile(user).locality

// Perfil y descripción
export const getUserDescription = user => getUserProfile(user).description
export const getUserImages = user => getUserProfile(user).images || []
export const getUserMainImage = user => {
  const images = getUserImages(user)

  return images[0] || null
}
export const getUserAvatar = (user, defaultAvatar = null) => getUserMainImage(user) || defaultAvatar

// Categoría e intereses
export const getUserCategoryInterest = user => getUserProfile(user).categoryInterest
export const getUserTags = user => getUserProfile(user).tags || []

// Características físicas
export const getUserGender = user => getUserProfile(user).gender
export const getUserGenderId = user => getUserProfile(user).genderId
export const getUserMaritalStatus = user => getUserProfile(user).maritalStatus
export const getUserMaritalStatusId = user => getUserProfile(user).maritalStatusId
export const getUserHeight = user => getUserProfile(user).height
export const getUserEyeColor = user => getUserProfile(user).eyeColor
export const getUserEyeColorId = user => getUserProfile(user).eyeColorId
export const getUserHairColor = user => getUserProfile(user).hairColor
export const getUserHairColorId = user => getUserProfile(user).hairColorId
export const getUserBodyType = user => getUserProfile(user).bodyType
export const getUserBodyTypeId = user => getUserProfile(user).bodyTypeId
export const getUserEducation = user => getUserProfile(user).education
export const getUserEducationLevelId = user => getUserProfile(user).educationLevelId
export const getUserProfession = user => getUserProfile(user).profession

// Campos específicos de categorías
export const getUserReligion = user => getUserProfile(user).religion
export const getUserReligionId = user => getUserProfile(user).religionId
export const getUserChurch = user => getUserProfile(user).church
export const getUserChurchId = user => getUserProfile(user).churchId
export const getUserSpiritualMoments = user => getUserProfile(user).spiritualMoments
export const getUserSpiritualPractices = user => getUserProfile(user).spiritualPractices
export const getUserSexualRole = user => getUserProfile(user).sexualRole
export const getUserSexualRoleId = user => getUserProfile(user).sexualRoleId
export const getUserRelationshipType = user => getUserProfile(user).relationshipType
export const getUserRelationshipId = user => getUserProfile(user).relationshipId

// Preferencias de matching
export const getUserAgePreferenceMin = user => getUserProfile(user).agePreferenceMin
export const getUserAgePreferenceMax = user => getUserProfile(user).agePreferenceMax
export const getUserLocationPreferenceRadius = user => getUserProfile(user).locationPreferenceRadius

// Status
export const getUserVerified = user => getUserStatus(user).verified
export const getUserProfileComplete = user => getUserStatus(user).profileComplete
export const getUserConfigurationCompleted = user => getUserStatus(user).configurationCompleted
export const getUserLastActive = user => getUserStatus(user).lastActive
export const getUserApproved = user => getUserStatus(user).approved
export const getUserApprovalStatus = user => getUserStatus(user).approvalStatus
export const getUserRole = user => getUserStatus(user).role
export const getUserAvailableAttempts = user => getUserStatus(user).availableAttempts
export const getUserCreatedAt = user => getUserStatus(user).createdAt
export const getUserAccountDeactivated = user => getUserStatus(user).accountDeactivated
export const getUserDeactivationDate = user => getUserStatus(user).deactivationDate
export const getUserDeactivationReason = user => getUserStatus(user).deactivationReason
export const getUserDismissed = user => getUserStatus(user).dismissed
export const getUserFavorite = user => getUserStatus(user).favorite
export const getUserHasAcceptedMatch = user => getUserStatus(user).hasAcceptedMatch
export const getUserHasPendingMatch = user => getUserStatus(user).hasPendingMatch

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Validar si un campo tiene valor válido
 * Maneja casos especiales como arrays
 */
export const isSpecialField = (field, value) => {
  if (field === 'images' || field === 'tags') {
    return value && value.length > 0
  }

  return value && value.toString().trim() !== ''
}

/**
 * Validar si un usuario tiene perfil completo
 */
export const isProfileComplete = user => {
  if (!user?.user) return false

  return USER_USER_REQUIRED_FIELDS.every(field => {
    const value = user.user[field]

    return isSpecialField(field, value)
  })
}

// ========================================
// UTILIDADES DE TRANSFORMACIÓN
// ========================================

/**
 * Formatear datos del formulario para enviar al backend
 * Convierte estructura plana a estructura organizada por secciones
 */
export const formatFormDataToApi = formData => {
  if (!formData) return {}

  // Si los datos ya vienen organizados por secciones, retornarlos tal cual
  if (
    formData.user ||
    formData.status ||
    formData.metrics ||
    formData.privacy ||
    formData.notifications ||
    formData.auth ||
    formData.matches
  ) {
    return formData
  }

  // Si vienen datos planos, organizarlos en la estructura correcta
  const organizedData = {
    status: {},
    user: {},
    metrics: {},
    privacy: {},
    notifications: {},
    auth: {},
    matches: {}
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
    } else if (USER_MATCHES_FIELDS[key] !== undefined) {
      organizedData.matches[key] = formData[key]
    } else {
      // Por defecto, va a user
      organizedData.user[key] = formData[key]
    }
  })

  return organizedData
}

/**
 * Campos esperados por UserProfileRequestDTO del backend
 * Usados para completar/actualizar perfil
 */
const PROFILE_COMPLETION_FIELDS = [
  'name',
  'lastName',
  'document',
  'phone',
  'phoneCode',
  'dateOfBirth',
  'description',
  'country',
  'city',
  'department',
  'locality',
  'categoryInterest',
  'genderId',
  'maritalStatusId',
  'height',
  'eyeColorId',
  'hairColorId',
  'bodyTypeId',
  'educationId',
  'profession',
  'tags',
  'religionId',
  'spiritualMoments',
  'spiritualPractices',
  'sexualRoleId',
  'relationshipId',
  'agePreferenceMin',
  'agePreferenceMax',
  'locationPreferenceRadius',
  'allowNotifications',
  'showAge',
  'showLocation',
  'showMeInSearch'
]

/**
 * Formatear datos para completar perfil
 * Extrae solo los campos que espera UserProfileRequestDTO
 */
export const formatProfileCompletionData = formData => {
  if (!formData) return {}

  const profileData = {}

  // Si los datos vienen organizados por secciones, aplanarlos primero
  if (formData.user || formData.privacy || formData.notifications) {
    const allData = {
      ...formData.user,
      ...formData.privacy,
      ...formData.notifications
    }

    PROFILE_COMPLETION_FIELDS.forEach(field => {
      if (allData[field] !== undefined) {
        profileData[field] = allData[field]
      }
    })
  } else {
    // Si los datos vienen planos, extraer directamente
    PROFILE_COMPLETION_FIELDS.forEach(field => {
      if (formData[field] !== undefined) {
        profileData[field] = formData[field]
      }
    })
  }

  return profileData
}

/**
 * Obtener valores por defecto para un usuario específico
 * Preserva estructura y convierte timestamps del backend
 */
export const getDefaultValuesForUser = (existingUser = null) => {
  // Si no hay usuario existente, retornar estructura por defecto
  if (!existingUser) {
    return { ...USER_DEFAULT_VALUES }
  }

  // Copiar usuario existente
  const processedUser = { ...existingUser }

  // Convertir timestamps en status
  if (processedUser.status) {
    processedUser.status = {
      ...processedUser.status,
      createdAt: convertTimestamp(processedUser.status.createdAt),
      lastActive: convertTimestamp(processedUser.status.lastActive),
      deactivationDate: convertTimestamp(processedUser.status.deactivationDate)
    }
  }

  // Convertir timestamps en auth
  if (processedUser.auth) {
    processedUser.auth = {
      ...processedUser.auth,
      lastExternalSync: convertTimestamp(processedUser.auth.lastExternalSync)
    }
  }

  // Merge con valores por defecto
  return {
    status: {
      ...USER_DEFAULT_VALUES.status,
      ...processedUser.status
    },
    user: {
      ...USER_DEFAULT_VALUES.user,
      ...processedUser.user
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
    matches: {
      ...USER_DEFAULT_VALUES.matches,
      ...processedUser.matches
    }
  }
}
