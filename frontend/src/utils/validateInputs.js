/**
 * Utilidades de validación corregidas y optimizadas
 */
import { Logger } from './logger.js'

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

  if (age < 18) return 'Debes ser mayor de 18 años'

  return null
}

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Confirma tu contraseña'
  if (password !== confirmPassword) return 'Las contraseñas no coinciden'
  return null
}

export const validateTerms = value => {
  return value ? null : 'Debes aceptar los términos y condiciones'
}

export const validatePhoneCode = value => {
  if (!value) return 'Selecciona el código de país'
  return null
}

// Validación específica para imágenes
export const validateProfileImage = (images, options = {}) => {
  const { requireMain = true, minImages = 1, maxImages = 5 } = options

  // Si images no es un array, convertirlo
  const imageArray = Array.isArray(images) ? images : []

  // Filtrar imágenes válidas (no null, undefined o string vacío)
  const validImages = imageArray.filter(img => {
    if (!img) return false
    if (typeof img === 'string' && !img.trim()) return false
    return true
  })

  // Validar imagen principal (posición 0) - ESTO ES LO MÁS IMPORTANTE
  if (requireMain) {
    const mainImage = imageArray[0]
    if (!mainImage) {
      return 'La foto de perfil es requerida'
    }
    if (typeof mainImage === 'string' && !mainImage.trim()) {
      return 'La foto de perfil es requerida'
    }
  }

  // Validar cantidad mínima
  if (validImages.length < minImages) {
    return `Mínimo ${minImages} imagen${minImages > 1 ? 'es' : ''}`
  }

  // Validar cantidad máxima
  if (validImages.length > maxImages) {
    return `Máximo ${maxImages} imágenes`
  }

  return null
}

// Validación para tags/intereses
export const validateTags = tags => {
  if (!tags || tags.length === 0) return 'Agrega al menos un interés'
  if (tags.length > 10) return 'Máximo 10 intereses'
  return null
}

// Validación para descripción
export const validateDescription = createValidator({
  fieldName: 'La descripción',
  minLength: 10,
  maxLength: 500
})

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
      const error = validator(data[field], data)
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
// VALIDADORES PRE-CONFIGURADOS POR PASO
// ========================================

export const validators = {
  // StepBasicInfo - Información básica
  stepBasicInfo: {
    images: validateProfileImage,
    name: validateName,
    lastName: validateLastName,
    document: validateDocument,
    phoneCode: validatePhoneCode,
    phone: validatePhone,
    birthDate: validateBirthDate,
    country: value => (!value ? 'Selecciona un país' : null),
    city: value => (!value?.trim() ? 'Selecciona una ciudad' : null)
  },
  // Para mantener compatibilidad con el número de paso
  step1: {
    images: validateProfileImage,
    name: validateName,
    lastName: validateLastName,
    document: validateDocument,
    phoneCode: validatePhoneCode,
    phone: validatePhone,
    birthDate: validateBirthDate,
    country: value => (!value ? 'Selecciona un país' : null),
    city: value => (!value?.trim() ? 'Selecciona una ciudad' : null)
  },

  // Step 3 - Sobre ti
  step2: {
    description: validateDescription,
    tags: validateTags,
    genderId: value => (!value ? 'Selecciona tu género' : null),
    height: value => {
      if (!value || value < 140 || value > 220) {
        return 'La estatura debe estar entre 140 y 220 cm'
      }
      return null
    }
  },

  // Step 2 - Características y categoría
  step3: {
    categoryInterest: value => (!value ? 'Selecciona una categoría' : null),
    agePreferenceMin: value => {
      if (!value || value < 18) return 'Edad mínima debe ser 18 años'
      return null
    },
    agePreferenceMax: value => {
      if (!value || value > 80) return 'Edad máxima no puede ser mayor a 80 años'
      return null
    },
    locationPreferenceRadius: value => {
      if (!value || value < 5) return 'Radio mínimo debe ser 5 km'
      if (value > 200) return 'Radio máximo es 200 km'
      return null
    },
    // Validaciones específicas para SPIRIT
    religionId: (value, data) => {
      if (data.categoryInterest === 'SPIRIT' && !value) {
        return 'Selecciona tu religión'
      }
      return null
    },
    // Validaciones específicas para ROUSE
    sexualRoleId: (value, data) => {
      if (data.categoryInterest === 'ROUSE' && !value) {
        return 'Selecciona tu rol sexual'
      }
      return null
    },
    relationshipTypeId: (value, data) => {
      if (data.categoryInterest === 'ROUSE' && !value) {
        return 'Selecciona el tipo de relación que buscas'
      }
      return null
    }
  },

  // Step 4 - No tiene validaciones obligatorias
  step4: {}
}

// ========================================
// FUNCIÓN PRINCIPAL DE VALIDACIÓN POR PASO
// ========================================

/**
 * Valida un paso específico del formulario
 */
export const validateStep = (step, formData) => {
  const stepValidators = {
    1: validators.step1,
    2: validators.step2,
    3: validators.step3,
    4: validators.step4
  }

  const currentValidators = stepValidators[step] || {}

  // Log para debugging
  Logger.debug(Logger.CATEGORIES.VALIDATION, 'validar paso', `Validando Step ${step}`, {
    context: {
      formData: formData,
      validators: Object.keys(currentValidators)
    }
  })

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

/**
 * Utilidad para debugging de validaciones
 */
export const debugValidation = (step, formData) => {
  const validation = validateStep(step, formData)

  if (!validation.isValid) {
    Logger.debug(Logger.CATEGORIES.VALIDATION, 'debug validación', `Step ${step} - Errores encontrados`, {
      context: {
        formData,
        validation: validation.errors
      }
    })
  } else {
    Logger.debug(Logger.CATEGORIES.VALIDATION, 'debug validación', `Step ${step} - Validación exitosa`)
  }

  return validation
}
