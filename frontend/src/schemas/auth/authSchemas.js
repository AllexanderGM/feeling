import * as yup from 'yup'
import { baseValidations, conditionalValidations } from '../validation/baseValidations'

/**
 * ESQUEMAS DE AUTENTICACIÓN
 *
 * Contiene todas las validaciones relacionadas con:
 * - Login
 * - Registro
 * - Recuperación de contraseña
 * - Verificación de email
 * - Cambio de contraseña
 */

// ========================================
// ESQUEMAS PRINCIPALES DE AUTENTICACIÓN
// ========================================

export const loginSchema = yup.object().shape({
  email: baseValidations.email,
  password: baseValidations.password
})

export const registerSchema = yup.object().shape({
  name: baseValidations.name,
  lastName: baseValidations.lastName,
  email: baseValidations.email,
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

export const forgotPasswordSchema = yup.object().shape({
  email: baseValidations.email
})

export const resetPasswordSchema = yup.object().shape({
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

export const verifyEmailSchema = yup.object().shape({
  email: baseValidations.email,
  code: baseValidations.verificationCode
})

export const changePasswordSchema = yup.object().shape({
  currentPassword: baseValidations.password,
  newPassword: baseValidations.strongPassword,
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirma tu nueva contraseña')
})

// ========================================
// ESQUEMAS COMBINADOS
// ========================================

// Para casos donde se necesite registro + información básica
export const fullRegistrationSchema = yup.object().shape({
  ...registerSchema.fields,
  // Campos adicionales que podrían requerirse en el registro completo
  phone: baseValidations.phone,
  birthDate: baseValidations.birthDate
})

// ========================================
// UTILIDADES DE EXTRACCIÓN DE DATOS
// ========================================

/**
 * Extrae solo los campos necesarios para login del formulario validado
 */
export const extractLoginData = formData => ({
  email: formData.email,
  password: formData.password
})

/**
 * Extrae solo los campos necesarios para registro del formulario validado
 */
export const extractRegisterData = formData => ({
  name: formData.name,
  lastName: formData.lastName,
  email: formData.email,
  password: formData.password
})

/**
 * Extrae solo los campos necesarios para reset password del formulario validado
 */
export const extractResetPasswordData = formData => ({
  password: formData.password
})

/**
 * Extrae solo los campos necesarios para verify email del formulario validado
 */
export const extractVerifyEmailData = formData => ({
  email: formData.email,
  code: formData.code
  // Los campos ya vienen procesados del esquema
})

/**
 * Extrae solo los campos necesarios para forgot password del formulario validado
 */
export const extractForgotPasswordData = formData => ({
  email: formData.email
})

// ========================================
// UTILIDADES DE VALIDACIÓN DE AUTH
// ========================================

/**
 * Valida si un token tiene el formato correcto
 */
export const validateTokenFormat = token => {
  if (!token || typeof token !== 'string') return false
  // JWT básico tiene 3 partes separadas por puntos
  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Valida si un email tiene formato válido (sin usar yup)
 */
export const isValidEmailFormat = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida fuerza de contraseña
 */
export const getPasswordStrength = password => {
  if (!password) return { score: 0, feedback: 'Ingresa una contraseña' }

  let score = 0
  const feedback = []

  if (password.length >= 8) score += 1
  else feedback.push('Mínimo 8 caracteres')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Al menos una minúscula')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Al menos una mayúscula')

  if (/\d/.test(password)) score += 1
  else feedback.push('Al menos un número')

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push('Considera agregar símbolos')

  return {
    score,
    strength: score < 2 ? 'débil' : score < 4 ? 'media' : 'fuerte',
    feedback: feedback.length > 0 ? feedback : ['¡Contraseña segura!']
  }
}
