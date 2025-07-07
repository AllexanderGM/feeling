/**
 * Esquemas y constantes centralizadas para la estructura del usuario
 * Este archivo define todos los campos del usuario y sus categorías
 * para evitar duplicación en el código
 */

// ========================================
// CAMPOS DEL USUARIO POR CATEGORÍAS
// ========================================

/**
 * Campos básicos requeridos para completar el perfil
 * Basado en la lógica del backend: User.isProfileComplete()
 */
export const USER_REQUIRED_FIELDS = [
  'name',
  'lastName',
  'birthDate',
  'genderId',
  'categoryInterest',
  'images',
  'description',
  'phone',
  'phoneCode'
]

/**
 * Campos opcionales que mejoran la completitud del perfil
 */
export const USER_OPTIONAL_FIELDS = [
  'country',
  'city',
  'profession',
  'tags',
  'height',
  'maritalStatusId',
  'educationLevelId',
  'religionId',
  'document'
]

/**
 * Campos adicionales específicos por categoría
 */
export const USER_CATEGORY_SPECIFIC_FIELDS = {
  SPIRIT: ['religionId', 'spiritualMoments', 'spiritualPractices'],
  ROUSE: ['sexualRoleId', 'relationshipTypeId']
}

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
 * Valores por defecto para formularios del usuario
 */
export const USER_DEFAULT_VALUES = {
  // Información básica
  images: [],
  selectedProfileImageIndex: 0,
  name: '',
  lastName: '',
  document: '',
  phone: '',
  phoneCode: '+57',
  birthDate: '',

  // Ubicación
  country: 'Colombia',
  city: 'Bogotá',
  department: '',
  locality: '',

  // Características
  description: '',
  tags: [],
  genderId: '',
  maritalStatusId: '',
  educationLevelId: '',
  profession: '',
  bodyTypeId: '',
  height: 170,
  eyeColorId: '',
  hairColorId: '',

  // Preferencias
  categoryInterest: '',
  agePreferenceMin: 18,
  agePreferenceMax: 50,
  locationPreferenceRadius: 50,

  // Campos específicos por categoría
  religionId: '',
  spiritualMoments: '',
  spiritualPractices: '',
  sexualRoleId: '',
  relationshipTypeId: '',

  // Configuración
  showAge: true,
  showLocation: true,
  allowNotifications: true,
  showMeInSearch: true
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
 * Obtener todos los campos del usuario
 */
export const getAllUserFields = () => [
  ...USER_REQUIRED_FIELDS,
  ...USER_OPTIONAL_FIELDS,
  ...USER_PREFERENCE_FIELDS,
  ...USER_SETTINGS_FIELDS,
  ...USER_CONTACT_FIELDS,
  ...USER_LOCATION_FIELDS,
  ...USER_PHYSICAL_FIELDS,
  ...USER_PERSONAL_FIELDS,
  ...USER_CATEGORY_SPECIFIC_FIELDS.SPIRIT,
  ...USER_CATEGORY_SPECIFIC_FIELDS.ROUSE
]

/**
 * Obtener campos específicos para una categoría
 */
export const getCategoryFields = category => {
  return USER_CATEGORY_SPECIFIC_FIELDS[category] || []
}

/**
 * Mapeo de campos del frontend al backend
 */
export const FIELD_MAPPING = {
  // Frontend -> Backend
  birthDate: 'dateOfBirth',
  educationLevelId: 'educationId',
  relationshipTypeId: 'relationshipId'
}

/**
 * Obtener el nombre del campo en el backend
 */
export const getBackendFieldName = frontendField => {
  return FIELD_MAPPING[frontendField] || frontendField
}

/**
 * Función centralizada para mapear datos del frontend al backend
 */
export const formatFormDataToApi = formData => {
  if (!formData) return {}

  const apiData = {}

  // Obtener todos los campos posibles del usuario
  const allFields = [
    ...USER_REQUIRED_FIELDS,
    ...USER_OPTIONAL_FIELDS,
    ...USER_PREFERENCE_FIELDS,
    ...USER_SETTINGS_FIELDS,
    ...USER_CONTACT_FIELDS,
    ...USER_LOCATION_FIELDS,
    ...USER_PHYSICAL_FIELDS,
    ...USER_PERSONAL_FIELDS,
    ...USER_CATEGORY_SPECIFIC_FIELDS.SPIRIT,
    ...USER_CATEGORY_SPECIFIC_FIELDS.ROUSE
  ]

  // Remover duplicados
  const uniqueFields = [...new Set(allFields)]

  uniqueFields.forEach(field => {
    if (formData[field] !== undefined) {
      // Excluir campos que no van en el DTO pero se manejan por separado
      if (field === 'images' || field === 'selectedProfileImageIndex') {
        return
      }

      const backendField = getBackendFieldName(field)
      let value = formData[field]

      // Conversiones específicas de tipo
      if (shouldConvertToInt(field) && value) {
        value = parseInt(value) || null
      }

      // Valores por defecto para campos específicos
      if (
        field === 'department' ||
        field === 'locality' ||
        field === 'profession' ||
        field === 'spiritualMoments' ||
        field === 'spiritualPractices'
      ) {
        value = value || ''
      }

      // Valores por defecto para preferencias numéricas
      if (field === 'agePreferenceMin') value = value ? parseInt(value) : 18
      if (field === 'agePreferenceMax') value = value ? parseInt(value) : 50
      if (field === 'locationPreferenceRadius') value = value ? parseInt(value) : 50

      // Valores por defecto para configuración booleana
      if (['allowNotifications', 'showAge', 'showLocation', 'showMeInSearch'].includes(field)) {
        value = value !== false
      }

      apiData[backendField] = value
    }
  })

  return apiData
}

/**
 * Determinar si un campo debe convertirse a entero
 */
const shouldConvertToInt = field => {
  const integerFields = [
    'genderId',
    'maritalStatusId',
    'educationLevelId',
    'bodyTypeId',
    'eyeColorId',
    'hairColorId',
    'religionId',
    'sexualRoleId',
    'relationshipTypeId',
    'height'
  ]
  return integerFields.includes(field)
}

/**
 * Obtener valores por defecto específicos para un paso del formulario
 */
export const getDefaultValuesForStep = (step, user = null) => {
  const baseDefaults = { ...USER_DEFAULT_VALUES }

  if (!user) return baseDefaults

  // Sobrescribir con datos del usuario si existen (evitar null values)
  const userDefaults = {}
  Object.keys(baseDefaults).forEach(key => {
    userDefaults[key] = user[key] !== undefined && user[key] !== null ? user[key] : baseDefaults[key]
  })

  return userDefaults
}
