// ========================================
// VALIDACIONES PARA REGISTRO SIMPLIFICADO
// ========================================

// Validación manual para el email
export const validateEmail = value => {
  if (!value) {
    return 'El correo electrónico es requerido'
  }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return 'El correo electrónico no es válido'
  }
  return null
}

// Validación manual para la contraseña
export const validatePassword = value => {
  if (!value) {
    return 'La contraseña es requerida'
  }
  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  return null
}

// Validación manual para nombres
export const validateName = value => {
  if (!value) {
    return 'El nombre es requerido'
  }
  if (value.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres'
  }
  if (value.length > 50) {
    return 'El nombre no puede tener más de 50 caracteres'
  }
  // Verificar que solo contiene letras y espacios
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
    return 'El nombre solo debe contener letras'
  }
  return null
}

// ========================================
// VALIDACIONES PARA CÓDIGO DE VERIFICACIÓN
// ========================================

// Validación para código de verificación de 6 dígitos
export const validateVerificationCode = value => {
  if (!value) {
    return 'El código de verificación es requerido'
  }
  if (!/^\d{6}$/.test(value)) {
    return 'El código debe ser de exactamente 6 dígitos'
  }
  return null
}

// ========================================
// VALIDACIONES ADICIONALES (para completar perfil)
// ========================================

// Validación manual para apellidos
export const validateLastName = value => {
  if (!value) {
    return 'El apellido es requerido'
  }
  if (value.length < 2) {
    return 'El apellido debe tener al menos 2 caracteres'
  }
  if (value.length > 50) {
    return 'El apellido no puede tener más de 50 caracteres'
  }
  // Verificar que solo contiene letras y espacios
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
    return 'El apellido solo debe contener letras'
  }
  return null
}

// Validación manual para número de teléfono
export const validatePhone = value => {
  if (!value) {
    return 'El número de teléfono es requerido'
  }
  // Eliminar espacios, guiones y paréntesis para validar
  const cleanedValue = value.replace(/\s+|-|\(|\)/g, '')
  // Verificar que tenga entre 9 y 15 dígitos
  if (!/^\d{9,15}$/.test(cleanedValue)) {
    return 'Ingresa un número de teléfono válido (9-15 dígitos)'
  }
  return null
}

// Validación manual para fecha de nacimiento
export const validateBirthDate = value => {
  if (!value) {
    return 'La fecha de nacimiento es requerida'
  }

  const birthDate = new Date(value)
  const today = new Date()

  // Verificar que la fecha es válida
  if (isNaN(birthDate.getTime())) {
    return 'Fecha inválida'
  }

  // Verificar que no es una fecha futura
  if (birthDate > today) {
    return 'La fecha no puede ser en el futuro'
  }

  // Calcular edad
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // Verificar mayoría de edad (18 años)
  if (age < 18) {
    return 'Debes ser mayor de 18 años para registrarte'
  }

  return null
}

// Validación manual para campos de selección (ciudad, orientación, etc.)
export const validateSelect = (value, fieldName = 'selección') => {
  if (!value) {
    return `Debes realizar una ${fieldName}`
  }
  return null
}

// Validación de términos y condiciones
export const validateTerms = value => {
  if (!value) {
    return 'Debes aceptar los términos y condiciones'
  }
  return null
}

// Validación de coincidencia de contraseñas
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden'
  }
  return null
}

// Validación de intereses (debe seleccionar al menos uno)
export const validateInterests = interests => {
  if (!interests || interests.length === 0) {
    return 'Debes seleccionar al menos un interés'
  }
  return null
}

// ========================================
// VALIDACIONES PARA PERFIL COMPLETO
// ========================================

// Validación para documento de identidad
export const validateDocument = value => {
  if (!value) {
    return 'El documento es requerido'
  }
  if (value.length < 6) {
    return 'El documento debe tener al menos 6 caracteres'
  }
  if (value.length > 20) {
    return 'El documento no puede tener más de 20 caracteres'
  }
  return null
}

// Validación para ciudad
export const validateCity = value => {
  if (!value) {
    return 'La ciudad es requerida'
  }
  if (value.length < 2) {
    return 'La ciudad debe tener al menos 2 caracteres'
  }
  if (value.length > 50) {
    return 'La ciudad no puede tener más de 50 caracteres'
  }
  return null
}

// Validación para descripción de perfil
export const validateDescription = value => {
  if (value && value.length > 500) {
    return 'La descripción no puede tener más de 500 caracteres'
  }
  return null
}

// Validación para URL de imagen
export const validateImageUrl = value => {
  if (!value) return null // Opcional

  try {
    new URL(value)
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
      return 'La URL debe ser una imagen válida (jpg, jpeg, png, gif, webp)'
    }
    return null
  } catch {
    return 'La URL de la imagen no es válida'
  }
}

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

// Función para validar múltiples campos a la vez
export const validateFields = (fields, validators) => {
  const errors = {}

  Object.keys(validators).forEach(fieldName => {
    const value = fields[fieldName]
    const validator = validators[fieldName]

    if (typeof validator === 'function') {
      const error = validator(value)
      if (error) {
        errors[fieldName] = error
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Función para validar el registro completo
export const validateRegistration = formData => {
  return validateFields(formData, {
    name: validateName,
    email: validateEmail,
    password: validatePassword,
    confirmPassword: value => validatePasswordMatch(formData.password, value)
  })
}

// Función para validar la verificación de código
export const validateVerification = formData => {
  return validateFields(formData, {
    email: validateEmail,
    code: validateVerificationCode
  })
}
