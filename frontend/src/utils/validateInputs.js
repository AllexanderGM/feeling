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

// Validación manual para nombres y apellidos
export const validateName = value => {
  if (!value) {
    return 'Este campo es requerido'
  }
  if (value.length < 2) {
    return 'Este campo debe tener al menos 2 caracteres'
  }
  // Verificar que solo contiene letras y espacios
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
    return 'Este campo solo debe contener letras'
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
  // Verificar que tenga 10 dígitos para Colombia (código de país opcional)
  if (!/^(\+?57)?[3][0-9]{9}$/.test(cleanedValue)) {
    return 'Ingresa un número de celular válido (ej: 300 123 4567)'
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
