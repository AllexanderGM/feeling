import * as yup from 'yup'

import { baseValidations, conditionalValidations } from '../validation/baseValidations'

/**
 * ESQUEMAS DE VALIDACIÓN DE AUTENTICACIÓN (con Yup)
 *
 * Este archivo contiene ÚNICAMENTE esquemas de validación para formularios de autenticación.
 * Usa Yup para validar datos antes de enviarlos al backend.
 *
 * RESPONSABILIDAD:
 * - Definir esquemas de validación con Yup
 * - Validar formularios de login, registro, recuperación de contraseña, etc.
 *
 * NO INCLUYE:
 * - Lógica de negocio (ej: validar formato de tokens)
 * - Utilidades de UI (ej: feedback de fuerza de contraseña)
 * - Transformación de datos (usar authService para eso)
 */

// ========================================
// ESQUEMAS PRINCIPALES DE AUTENTICACIÓN
// ========================================

/**
 * Esquema de validación para login
 */
export const loginSchema = yup.object().shape({
  email: baseValidations.email,
  password: baseValidations.password
})

/**
 * Esquema de validación para registro
 */
export const registerSchema = yup.object().shape({
  name: baseValidations.name,
  lastName: baseValidations.lastName,
  email: baseValidations.email,
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

/**
 * Esquema de validación para solicitar recuperación de contraseña
 */
export const forgotPasswordSchema = yup.object().shape({
  email: baseValidations.email
})

/**
 * Esquema de validación para resetear contraseña
 */
export const resetPasswordSchema = yup.object().shape({
  password: baseValidations.strongPassword,
  confirmPassword: conditionalValidations.confirmPassword
})

/**
 * Esquema de validación para verificar email con código
 */
export const verifyEmailSchema = yup.object().shape({
  email: baseValidations.email,
  code: baseValidations.verificationCode
})

/**
 * Esquema de validación para cambiar contraseña
 */
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

/**
 * Esquema de validación para registro completo (registro + info adicional)
 * Usado en flujos donde se pide más información durante el registro
 */
export const fullRegistrationSchema = yup.object().shape({
  ...registerSchema.fields,
  phone: baseValidations.phone,
  dateOfBirth: baseValidations.dateOfBirth
})
