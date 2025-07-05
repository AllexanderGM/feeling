import * as yup from 'yup'

// ========================================
// VALIDACIONES BASE REUTILIZABLES
// ========================================

// Validaciones de campos comunes
export const baseValidations = {
  email: yup.string().email('Ingresa un email válido').required('El email es requerido'),

  password: yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es requerida'),

  strongPassword: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    .required('La contraseña es requerida'),

  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required('El nombre es requerido'),

  lastName: yup
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .required('El apellido es requerido'),

  document: yup.string().min(7, 'El documento debe tener al menos 7 caracteres').required('El documento es requerido'),

  phone: yup
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números')
    .required('El teléfono es requerido'),

  birthDate: yup
    .string()
    .required('La fecha de nacimiento es requerida')
    .test('valid-date', 'Ingresa una fecha válida', function (value) {
      if (!value) return false
      const date = new Date(value)
      return !isNaN(date.getTime())
    })
    .test('not-future', 'La fecha no puede ser futura', function (value) {
      if (!value) return false
      const date = new Date(value)
      return date <= new Date()
    })
    .test('age', 'Debes ser mayor de 18 años', function (value) {
      if (!value) return false
      const today = new Date()
      const birthDate = new Date(value)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18
      }
      return age >= 18
    }),

  country: yup.string().required('Selecciona un país'),

  city: yup.string().required('Selecciona una ciudad'),

  description: yup
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .required('La descripción es requerida'),

  genderId: yup.string().required('Selecciona tu género'),

  height: yup
    .number()
    .min(140, 'La estatura mínima es 140 cm')
    .max(220, 'La estatura máxima es 220 cm')
    .required('La estatura es requerida'),

  tags: yup.array().min(1, 'Agrega al menos un interés').max(10, 'Máximo 10 intereses'),

  categoryInterest: yup.string().required('Selecciona una categoría'),

  agePreferenceMin: yup.number().min(18, 'La edad mínima debe ser 18 años').required('Define la edad mínima'),

  agePreferenceMax: yup
    .number()
    .max(80, 'La edad máxima no puede ser mayor a 80 años')
    .test('min-max', 'La edad máxima debe ser mayor a la mínima', function (value) {
      const { agePreferenceMin } = this.parent
      return !agePreferenceMin || !value || value > agePreferenceMin
    })
    .required('Define la edad máxima'),

  locationPreferenceRadius: yup
    .number()
    .min(5, 'El radio mínimo es 5 km')
    .max(200, 'El radio máximo es 200 km')
    .required('Define el radio de búsqueda'),

  verificationCode: yup
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .matches(/^[0-9]+$/, 'El código solo debe contener números')
    .required('El código es requerido')
}

// Validaciones condicionales reutilizables
export const conditionalValidations = {
  religionId: yup.string().when('categoryInterest', {
    is: 'SPIRIT',
    then: schema => schema.required('Selecciona tu religión'),
    otherwise: schema => schema.notRequired()
  }),

  sexualRoleId: yup.string().when('categoryInterest', {
    is: 'ROUSE',
    then: schema => schema.required('Selecciona tu rol sexual'),
    otherwise: schema => schema.notRequired()
  }),

  relationshipTypeId: yup.string().when('categoryInterest', {
    is: 'ROUSE',
    then: schema => schema.required('Selecciona el tipo de relación que buscas'),
    otherwise: schema => schema.notRequired()
  }),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña')
}

// ========================================
// ESQUEMAS DE FORMULARIOS UTILIZANDO VALIDACIONES BASE
// ========================================

// Esquema para login
export const loginSchema = yup.object().shape({
  email: baseValidations.email,
  password: baseValidations.password
})

// Esquema para registro con confirmación de contraseña
export const registerSchema = yup.object().shape({
  name: baseValidations.name,
  lastName: baseValidations.lastName,
  email: baseValidations.email,
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

// Esquemas para CompleteProfile por pasos
export const stepBasicInfoSchema = yup.object().shape({
  name: baseValidations.name,
  lastName: baseValidations.lastName,
  document: baseValidations.document,
  phone: baseValidations.phone,
  phoneCode: yup.string().required('Selecciona el código de país'),
  birthDate: baseValidations.birthDate,
  country: baseValidations.country,
  city: baseValidations.city,
  images: yup
    .array()
    .test('images-required', 'Debes subir al menos una foto de perfil', function (value) {
      if (!value || value.length === 0) return false
      // Verificar que al menos hay una imagen válida (no null/undefined)
      const validImages = value.filter(img => img != null && img !== '')
      return validImages.length >= 1
    })
    .required('Las imágenes son requeridas')
})

export const step2Schema = yup.object().shape({
  description: baseValidations.description,
  genderId: baseValidations.genderId,
  height: baseValidations.height,
  tags: baseValidations.tags
})

export const step3Schema = yup.object().shape({
  categoryInterest: baseValidations.categoryInterest,
  agePreferenceMin: baseValidations.agePreferenceMin,
  agePreferenceMax: baseValidations.agePreferenceMax,
  locationPreferenceRadius: baseValidations.locationPreferenceRadius,
  // Validaciones condicionales
  religionId: conditionalValidations.religionId,
  sexualRoleId: conditionalValidations.sexualRoleId,
  relationshipTypeId: conditionalValidations.relationshipTypeId
})

// Esquema para forgot password
export const forgotPasswordSchema = yup.object().shape({
  email: baseValidations.email
})

// Esquema para reset password
export const resetPasswordSchema = yup.object().shape({
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

// Esquema para verificación de email
export const verifyEmailSchema = yup.object().shape({
  email: baseValidations.email,
  code: baseValidations.verificationCode
})

// ========================================
// UTILIDADES PARA CREAR VALIDACIONES PERSONALIZADAS
// ========================================

/**
 * Crea un esquema personalizado combinando validaciones base
 * @param {Object} validationMap - Mapa de campos con sus validaciones
 * @returns {yup.ObjectSchema} Esquema de validación
 */
export const createCustomSchema = validationMap => {
  const schemaFields = {}

  Object.entries(validationMap).forEach(([fieldName, validationType]) => {
    if (typeof validationType === 'string') {
      // Si es un string, buscar en validaciones base
      schemaFields[fieldName] = baseValidations[validationType] || conditionalValidations[validationType]
    } else {
      // Si es un objeto de validación personalizada
      schemaFields[fieldName] = validationType
    }
  })

  return yup.object().shape(schemaFields)
}

/**
 * Combina múltiples esquemas en uno solo
 * @param {...yup.ObjectSchema} schemas - Esquemas a combinar
 * @returns {yup.ObjectSchema} Esquema combinado
 */
export const combineSchemas = (...schemas) => {
  const combinedFields = {}

  schemas.forEach(schema => {
    const fields = schema.fields
    Object.assign(combinedFields, fields)
  })

  return yup.object().shape(combinedFields)
}

// ========================================
// ESQUEMAS COMBINADOS PARA CASOS ESPECÍFICOS
// ========================================

// Para registro completo (registro + primer paso del perfil)
export const fullRegistrationSchema = combineSchemas(registerSchema, stepBasicInfoSchema)

// Esquema completo para todo el flujo de CompleteProfile
export const completeProfileSchema = yup.object().shape({
  // Step 1 - Información básica
  ...stepBasicInfoSchema.fields,

  // Step 2 - Características
  ...step2Schema.fields,

  // Step 3 - Preferencias
  ...step3Schema.fields,

  // Step 4 - Configuración (sin validaciones obligatorias por ahora)
  showAge: yup.boolean(),
  showLocation: yup.boolean(),
  allowNotifications: yup.boolean(),
  showMeInSearch: yup.boolean()
})

// Función para obtener los campos a validar según el paso
export const getFieldsForStep = step => {
  const stepFields = {
    1: ['name', 'lastName', 'document', 'phone', 'phoneCode', 'birthDate', 'country', 'city', 'images'],
    2: ['description', 'genderId', 'height', 'tags'],
    3: [
      'categoryInterest',
      'agePreferenceMin',
      'agePreferenceMax',
      'locationPreferenceRadius',
      'religionId',
      'sexualRoleId',
      'relationshipTypeId'
    ],
    4: [] // No hay validaciones obligatorias en el paso 4
  }
  return stepFields[step] || []
}

// Para edición de perfil básico
export const basicProfileEditSchema = createCustomSchema({
  name: 'name',
  lastName: 'lastName',
  description: 'description',
  phone: 'phone'
})

// Para cambio de contraseña
export const changePasswordSchema = yup.object().shape({
  currentPassword: baseValidations.password,
  newPassword: baseValidations.strongPassword,
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirma tu nueva contraseña')
})
