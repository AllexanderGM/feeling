import * as yup from 'yup'
import { baseValidations, conditionalValidations } from '../validation/baseValidations'
import { USER_DEFAULT_VALUES } from './userStructure'

/**
 * ESQUEMAS DE VALIDACIÓN PARA PERFIL DE USUARIO
 * 
 * Contiene validaciones específicas para:
 * - Completar perfil por pasos
 * - Editar perfil básico  
 * - Validaciones específicas por categoría
 */

// ========================================
// ESQUEMAS PARA COMPLETAR PERFIL (STEP BY STEP)
// ========================================

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

export const stepCharacteristicsSchema = yup.object().shape({
  description: baseValidations.description,
  genderId: baseValidations.genderId,
  height: baseValidations.height,
  tags: baseValidations.tags
})

export const stepPreferencesSchema = yup.object().shape({
  categoryInterest: baseValidations.categoryInterest,
  agePreferenceMin: baseValidations.agePreferenceMin,
  agePreferenceMax: baseValidations.agePreferenceMax,
  locationPreferenceRadius: baseValidations.locationPreferenceRadius,
  // Validaciones condicionales
  religionId: conditionalValidations.religionId,
  sexualRoleId: conditionalValidations.sexualRoleId,
  relationshipTypeId: conditionalValidations.relationshipTypeId
})

export const stepConfigurationSchema = yup.object().shape({
  // Configuración de privacidad (sin validaciones obligatorias por ahora)
  showAge: yup.boolean(),
  showLocation: yup.boolean(),
  allowNotifications: yup.boolean(),
  showMeInSearch: yup.boolean()
})

// ========================================
// ESQUEMA COMPLETO PARA TODO EL PERFIL
// ========================================

export const completeProfileSchema = yup.object().shape({
  // Step 1 - Información básica
  ...stepBasicInfoSchema.fields,

  // Step 2 - Características
  ...stepCharacteristicsSchema.fields,

  // Step 3 - Preferencias
  ...stepPreferencesSchema.fields,

  // Step 4 - Configuración
  ...stepConfigurationSchema.fields
})

// ========================================
// ESQUEMAS PARA EDICIÓN DE PERFIL
// ========================================

export const basicProfileEditSchema = yup.object().shape({
  name: baseValidations.name,
  lastName: baseValidations.lastName,
  description: baseValidations.description,
  phone: baseValidations.phone
})

export const characteristicsEditSchema = yup.object().shape({
  description: baseValidations.description,
  height: baseValidations.height,
  tags: baseValidations.tags,
  // Campos opcionales para edición
  bodyTypeId: yup.string(),
  eyeColorId: yup.string(),
  hairColorId: yup.string(),
  maritalStatusId: yup.string(),
  educationLevelId: yup.string(),
  profession: yup.string().max(100, 'La profesión no puede exceder 100 caracteres')
})

export const preferencesEditSchema = yup.object().shape({
  agePreferenceMin: baseValidations.agePreferenceMin,
  agePreferenceMax: baseValidations.agePreferenceMax,
  locationPreferenceRadius: baseValidations.locationPreferenceRadius,
  categoryInterest: baseValidations.categoryInterest,
  // Validaciones condicionales para edición
  religionId: conditionalValidations.religionId,
  sexualRoleId: conditionalValidations.sexualRoleId,
  relationshipTypeId: conditionalValidations.relationshipTypeId
})

// ========================================
// UTILIDADES PARA VALIDACIÓN POR PASOS
// ========================================

/**
 * Función para obtener los campos a validar según el paso
 */
export const getFieldsForStep = (step) => {
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

/**
 * Obtener esquema de validación según el paso
 */
export const getSchemaForStep = (step) => {
  const schemas = {
    1: stepBasicInfoSchema,
    2: stepCharacteristicsSchema,
    3: stepPreferencesSchema,
    4: stepConfigurationSchema
  }
  return schemas[step] || yup.object()
}

/**
 * Validar si los campos requeridos para una categoría están completos
 */
export const validateCategoryRequiredFields = (categoryInterest, userData) => {
  const requiredFields = {
    SPIRIT: ['religionId'],
    ROUSE: ['sexualRoleId', 'relationshipTypeId'],
    ESSENCE: []
  }

  const fieldsToCheck = requiredFields[categoryInterest] || []
  
  return fieldsToCheck.every(field => {
    const value = userData[field]
    return value && value.toString().trim() !== ''
  })
}

/**
 * Crear esquema dinámico basado en la categoría de interés
 */
export const createCategorySpecificSchema = (categoryInterest) => {
  const baseSchema = stepPreferencesSchema.fields
  
  // Crear un esquema que incluya solo las validaciones relevantes para la categoría
  const relevantFields = { ...baseSchema }
  
  // Remover validaciones condicionales que no aplican
  if (categoryInterest !== 'SPIRIT') {
    delete relevantFields.religionId
  }
  
  if (categoryInterest !== 'ROUSE') {
    delete relevantFields.sexualRoleId
    delete relevantFields.relationshipTypeId
  }
  
  return yup.object().shape(relevantFields)
}

/**
 * Obtener valores por defecto para un paso específico del ProfileComplete
 * @param {number} step - Número del paso (1-4)
 * @param {object} user - Datos del usuario existente (opcional)
 * @returns {object} Valores por defecto para el paso
 */
export const getDefaultValuesForStep = (step, user = null) => {
  const stepFields = getFieldsForStep(step)
  const defaultValues = {}
  
  stepFields.forEach(field => {
    let value
    
    // Intentar obtener valor del usuario existente
    if (user) {
      // Priorizar estructura organizada (user.profile.field)
      value = user.profile?.[field] 
      
      // Fallback a estructura plana (user.field) para compatibilidad
      if (value === undefined || value === null) {
        value = user[field]
      }
    }
    
    // Si no hay valor en el usuario, usar valores por defecto
    if (value === undefined || value === null) {
      value = USER_DEFAULT_VALUES.profile[field]
    }
    
    defaultValues[field] = value
  })
  
  return defaultValues
}