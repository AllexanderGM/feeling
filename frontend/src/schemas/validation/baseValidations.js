import * as yup from 'yup'

/**
 * VALIDACIONES BASE REUTILIZABLES
 *
 * Este archivo contiene todas las validaciones básicas que pueden
 * ser reutilizadas en diferentes esquemas de la aplicación.
 *
 * Organización:
 * - Validaciones de campos básicos
 * - Validaciones condicionales
 * - Utilidades para crear esquemas personalizados
 */

// ========================================
// VALIDACIONES BASE REUTILIZABLES
// ========================================

export const baseValidations = {
  // Autenticación y seguridad
  email: yup.string().trim().lowercase().email('Ingresa un email válido').required('El email es requerido'),

  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),

  strongPassword: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    .required('La contraseña es requerida'),

  // Información personal
  name: yup
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .required('El nombre es requerido'),

  lastName: yup
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
    .required('El apellido es requerido'),

  document: yup
    .string()
    .min(7, 'El documento debe tener al menos 7 caracteres')
    .max(20, 'El documento no puede tener más de 20 caracteres')
    .required('El documento es requerido'),

  phone: yup
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(15, 'El teléfono no puede tener más de 15 dígitos')
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números')
    .required('El teléfono es requerido'),

  // Fecha y edad
  dateOfBirth: yup
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
      const dateOfBirth = new Date(value)
      const age = today.getFullYear() - dateOfBirth.getFullYear()
      const monthDiff = today.getMonth() - dateOfBirth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        return age - 1 >= 18
      }

      return age >= 18
    }),

  // Ubicación
  country: yup.string().required('Selecciona un país'),
  city: yup.string().required('Selecciona una ciudad'),

  // Perfil y características
  description: yup
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .required('La descripción es requerida'),

  genderId: yup.string().required('Selecciona tu género'),

  height: yup
    .number()
    .typeError('La estatura debe ser un número')
    .min(140, 'La estatura mínima es 140 cm')
    .max(220, 'La estatura máxima es 220 cm')
    .integer('La estatura debe ser un número entero')
    .required('La estatura es requerida'),

  tags: yup
    .array()
    .of(yup.string())
    .min(3, 'Agrega al menos 3 intereses')
    .max(10, 'Máximo 10 intereses')
    .required('Los intereses son requeridos'),

  categoryInterest: yup.string().required('Selecciona una categoría'),

  // Preferencias
  agePreferenceMin: yup
    .number()
    .typeError('La edad mínima debe ser un número')
    .min(18, 'La edad mínima debe ser 18 años')
    .max(80, 'La edad mínima no puede ser mayor a 80 años')
    .integer('La edad debe ser un número entero')
    .required('Define la edad mínima'),

  agePreferenceMax: yup
    .number()
    .typeError('La edad máxima debe ser un número')
    .min(18, 'La edad máxima debe ser al menos 18 años')
    .max(80, 'La edad máxima no puede ser mayor a 80 años')
    .integer('La edad debe ser un número entero')
    .test('min-max', 'La edad máxima debe ser mayor a la mínima', function (value) {
      const { agePreferenceMin } = this.parent

      return !agePreferenceMin || !value || value > agePreferenceMin
    })
    .required('Define la edad máxima'),

  locationPreferenceRadius: yup
    .number()
    .typeError('El radio de búsqueda debe ser un número')
    .min(5, 'El radio mínimo es 5 km')
    .max(200, 'El radio máximo es 200 km')
    .integer('El radio debe ser un número entero')
    .required('Define el radio de búsqueda'),

  // Códigos y verificación
  verificationCode: yup
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .matches(/^[0-9]+$/, 'El código solo debe contener números')
    .required('El código es requerido')
}

// ========================================
// VALIDACIONES CONDICIONALES REUTILIZABLES
// ========================================

export const conditionalValidations = {
  // Validaciones específicas por categoría
  religionId: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Si es null, undefined o string vacío, retornar null
      if (originalValue === null || originalValue === undefined || originalValue === '') return null
      // Si es un número o string numérico válido, convertir a número
      const parsed = Number(originalValue)

      return isNaN(parsed) ? null : parsed
    })
    .when('categoryInterest', {
      is: 'SPIRIT',
      then: schema => schema.required('Selecciona tu religión'),
      otherwise: schema => schema.notRequired()
    }),

  sexualRoleId: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Si es null, undefined o string vacío, retornar null
      if (originalValue === null || originalValue === undefined || originalValue === '') return null
      // Si es un número o string numérico válido, convertir a número
      const parsed = Number(originalValue)

      return isNaN(parsed) ? null : parsed
    })
    .when('categoryInterest', {
      is: 'ROUSE',
      then: schema => schema.required('Selecciona tu rol sexual'),
      otherwise: schema => schema.notRequired()
    }),

  relationshipId: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Si es null, undefined o string vacío, retornar null
      if (originalValue === null || originalValue === undefined || originalValue === '') return null
      // Si es un número o string numérico válido, convertir a número
      const parsed = Number(originalValue)

      return isNaN(parsed) ? null : parsed
    })
    .when('categoryInterest', {
      is: 'ROUSE',
      then: schema => schema.required('Selecciona el tipo de relación que buscas'),
      otherwise: schema => schema.notRequired()
    }),

  // Confirmación de contraseña
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña')
}

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
// VALIDACIONES ESPECIALIZADAS
// ========================================

/**
 * Validaciones para archivos e imágenes
 */
export const fileValidations = {
  image: yup
    .mixed()
    .test('fileSize', 'La imagen no puede exceder 5MB', value => {
      if (!value) return true
      // Si es una URL (string), no validar tamaño
      if (typeof value === 'string') return true

      return value.size <= 5 * 1024 * 1024 // 5MB
    })
    .test('fileType', 'Solo se permiten imágenes JPG, PNG o WEBP', value => {
      if (!value) return true
      // Si es una URL (string), no validar tipo
      if (typeof value === 'string') return true

      return ['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
    }),

  multipleImages: yup
    .array()
    .of(yup.mixed())
    .min(1, 'Debes subir al menos una imagen')
    .max(6, 'Máximo 6 imágenes permitidas')
    .test('images-valid', 'Todas las imágenes deben ser válidas', function (value) {
      if (!value || value.length === 0) return false
      // Verificar que al menos hay una imagen válida (no null/undefined)
      const validImages = value.filter(img => img != null && img !== '')

      return validImages.length >= 1 && validImages.length <= 6
    })
}

/**
 * Validaciones para campos opcionales con formato específico
 */
export const optionalValidations = {
  profession: yup.string().max(100, 'La profesión no puede exceder 100 caracteres').trim(),

  socialMedia: yup.string().url('Ingresa una URL válida'),

  website: yup.string().url('Ingresa una URL válida'),

  phoneCode: yup
    .string()
    .matches(/^\+\d{1,4}$/, 'El código de país debe tener formato +XX')
    .required('Selecciona el código de país'),

  department: yup.string().max(50, 'El departamento no puede exceder 50 caracteres').trim(),

  locality: yup.string().max(50, 'La localidad no puede exceder 50 caracteres').trim(),

  churchName: yup.string().max(100, 'El nombre de la iglesia no puede exceder 100 caracteres').trim(),

  spiritualMoments: yup.string().max(500, 'Los momentos espirituales no pueden superar los 500 caracteres').trim(),

  spiritualPractices: yup.string().max(500, 'Las prácticas espirituales no pueden superar los 500 caracteres').trim()
}
