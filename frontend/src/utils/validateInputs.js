/**
 * Utilidades de validación simplificadas y optimizadas
 */

// Expresiones regulares reutilizables
const REGEX = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  name: /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žÑñ\s]+$/,
  phone: /^\+?\d{9,15}$/,
  verificationCode: /^\d{6}$/
}

// Mensajes de error comunes
const ERROR_MESSAGES = {
  required: field => `${field} es requerido`,
  minLength: (field, min) => `${field} debe tener al menos ${min} caracteres`,
  maxLength: (field, max) => `${field} no puede tener más de ${max} caracteres`,
  invalid: field => `${field} no es válido`,
  minAge: age => `Debes ser mayor de ${age} años`
}

// ========================================
// VALIDADORES BASE
// ========================================

/**
 * Validador genérico con opciones comunes
 */
const createValidator = (options = {}) => {
  const { required = true, minLength, maxLength, pattern, fieldName = 'Campo', customValidator } = options

  return value => {
    const trimmedValue = value?.toString().trim() || ''

    if (required && !trimmedValue) {
      return ERROR_MESSAGES.required(fieldName)
    }

    if (!required && !trimmedValue) {
      return null
    }

    if (minLength && trimmedValue.length < minLength) {
      return ERROR_MESSAGES.minLength(fieldName, minLength)
    }

    if (maxLength && trimmedValue.length > maxLength) {
      return ERROR_MESSAGES.maxLength(fieldName, maxLength)
    }

    if (pattern && !pattern.test(trimmedValue)) {
      return ERROR_MESSAGES.invalid(fieldName)
    }

    if (customValidator) {
      return customValidator(trimmedValue)
    }

    return null
  }
}

// ========================================
// VALIDADORES ESPECÍFICOS
// ========================================

export const validateEmail = createValidator({
  fieldName: 'El correo',
  pattern: REGEX.email
})

export const validatePassword = createValidator({
  fieldName: 'La contraseña',
  minLength: 6
})

export const validateName = createValidator({
  fieldName: 'El nombre',
  minLength: 2,
  maxLength: 50,
  pattern: REGEX.name
})

export const validateLastName = createValidator({
  fieldName: 'El apellido',
  minLength: 2,
  maxLength: 50,
  pattern: REGEX.name
})

export const validateDocument = createValidator({
  fieldName: 'El documento',
  minLength: 6,
  maxLength: 20
})

export const validatePhone = value => {
  const cleaned = value?.replace(/[\s()-]/g, '') || ''

  if (!cleaned) return 'El teléfono es requerido'
  if (!REGEX.phone.test(cleaned)) return 'Número de teléfono inválido'

  return null
}

export const validateVerificationCode = value => {
  const cleaned = value?.replace(/\D/g, '') || ''

  if (!cleaned) return 'El código es requerido'
  if (!REGEX.verificationCode.test(cleaned)) return 'Código de 6 dígitos'

  return null
}

export const validateBirthDate = value => {
  if (!value) return 'La fecha de nacimiento es requerida'

  const birthDate = new Date(value)
  const today = new Date()

  if (isNaN(birthDate.getTime())) return 'Fecha inválida'
  if (birthDate > today) return 'La fecha no puede ser futura'

  // Calcular edad
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  if (age < 18) return ERROR_MESSAGES.minAge(18)

  return null
}

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Confirma tu contraseña'
  if (password !== confirmPassword) return 'Las contraseñas no coinciden'
  return null
}

export const validateTerms = value => {
  if (!value) return 'Acepta los términos y condiciones'
  return null
}

// ========================================
// VALIDADORES DE IMAGEN SIMPLIFICADOS
// ========================================

export const validateImageFile = async (file, options = {}) => {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] } = options

  if (!file) return null // No es error si no hay archivo

  if (!(file instanceof File)) return 'Archivo inválido'

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    return 'Formato no permitido'
  }

  // Validar tamaño
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return `Máximo ${maxSizeMB}MB`
  }

  // Las dimensiones se validan en el hook useImageManager
  return null
}

// ========================================
// UTILIDADES DE FORMATO
// ========================================

export const formatters = {
  phone: value => value?.replace(/\D/g, '') || '',
  verificationCode: value => {
    const digits = value?.replace(/\D/g, '').slice(0, 6) || ''
    return digits.replace(/(\d{3})(\d{3})/, '$1 $2').trim()
  },
  name: value => value?.trim().replace(/\s+/g, ' ') || ''
}

// ========================================
// VALIDADOR DE FORMULARIOS
// ========================================

export const validateForm = (data, validators) => {
  const errors = {}

  Object.entries(validators).forEach(([field, validator]) => {
    if (typeof validator === 'function') {
      const error = validator(data[field])
      if (error) errors[field] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    errorCount: Object.keys(errors).length
  }
}

// ========================================
// VALIDADORES PRE-CONFIGURADOS
// ========================================

export const validators = {
  // Step 1 - Información básica
  basicInfo: {
    name: validateName,
    lastName: validateLastName,
    document: validateDocument,
    phone: validatePhone,
    birthDate: validateBirthDate,
    profileImage: images => {
      if (!images || !images[0]) return 'La foto de perfil es requerida'
      return null
    }
  },

  // Step 2 - Ubicación y características
  location: {
    country: value => (!value ? 'Selecciona un país' : null),
    city: value => (!value?.trim() ? 'Selecciona una ciudad' : null),
    genderId: value => (!value ? 'Selecciona tu género' : null),
    categoryInterest: value => (!value ? 'Selecciona una categoría' : null)
  },

  // Step 3 - Sobre ti
  about: {
    description: createValidator({
      fieldName: 'La descripción',
      minLength: 10,
      maxLength: 500
    }),
    tags: tags => {
      if (!tags || tags.length === 0) return 'Agrega al menos un interés'
      if (tags.length > 10) return 'Máximo 10 intereses'
      return null
    }
  },

  // Login/Registro
  auth: {
    email: validateEmail,
    password: validatePassword,
    confirmPassword: (value, data) => validatePasswordMatch(data.password, value),
    terms: validateTerms
  }
}

// ========================================
// HELPERS DE VALIDACIÓN
// ========================================

/**
 * Valida un paso específico del formulario
 */
export const validateStep = (step, formData) => {
  const stepValidators = {
    1: validators.basicInfo,
    2: validators.location,
    3: validators.about,
    4: {} // Step 4 no requiere validaciones
  }

  const currentValidators = stepValidators[step] || {}
  return validateForm(formData, currentValidators)
}

/**
 * Obtiene mensaje de error para campo específico
 */
export const getFieldError = (errors, field) => {
  return errors[field] || null
}

/**
 * Limpia y valida múltiples campos a la vez
 */
export const validateFields = (fields, validatorMap) => {
  const results = {}

  Object.entries(fields).forEach(([key, value]) => {
    if (validatorMap[key]) {
      const error = validatorMap[key](value, fields)
      if (error) results[key] = error
    }
  })

  return results
}
