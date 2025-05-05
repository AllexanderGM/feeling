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
