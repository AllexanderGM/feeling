/**
 * UTILIDADES PARA MANEJO DE FORMULARIOS
 *
 * Funciones helper para preparar y comparar datos de formularios
 * antes de enviarlos al backend
 */
import { CalendarDate } from '@internationalized/date'
import { getFieldsForStep } from '@schemas'

import { fromCalendarDate } from './convertTimestamp.js'

/**
 * Prepara los datos del formulario para enviar al backend
 * Convierte tipos especiales (CalendarDate) a formatos que el backend entiende
 *
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Datos preparados para el backend
 *
 * @example
 * const formData = {
 *   name: "Juan",
 *   dateOfBirth: CalendarDate(2000, 10, 1)
 * }
 * prepareDataForBackend(formData)
 * // { name: "Juan", dateOfBirth: [2000, 10, 1] }
 */
export const prepareDataForBackend = formData => {
  const data = { ...formData }

  Object.keys(data).forEach(key => {
    const value = data[key]

    if (typeof value === 'string') {
      const trimmed = value.trim()

      data[key] = trimmed === '' ? null : trimmed
    }
  })

  // Convertir dateOfBirth de CalendarDate a array [year, month, day]
  if (data.dateOfBirth && data.dateOfBirth instanceof CalendarDate) {
    data.dateOfBirth = fromCalendarDate(data.dateOfBirth)
  }

  // Transformar campos del frontend al formato esperado por el backend
  // relationshipId -> relationshipTypeId (el backend espera relationshipTypeId)
  if ('relationshipId' in data) {
    data.relationshipTypeId = data.relationshipId
    delete data.relationshipId
  }

  return data
}

/**
 * Compara los datos del formulario con los datos actuales del usuario
 * para determinar si hay cambios que requieran actualización
 *
 * @param {Object} formData - Datos preparados del formulario
 * @param {Object} user - Datos actuales del usuario
 * @param {number} currentStep - Paso actual del formulario (opcional, compara todos los campos si no se especifica)
 * @returns {boolean} - true si hay cambios, false si no hay cambios
 *
 * @example
 * const formData = { name: "Juan Carlos", lastName: "Pérez" }
 * const user = { user: { name: "Juan", lastName: "Pérez" } }
 * hasFormChanges(formData, user, 1)  // true (name cambió)
 */
export const hasFormChanges = (formData, user, currentStep = null) => {
  if (!user) return true // Si no hay usuario, considerar como cambio

  // Campos de privacidad (paso 4)
  const privacyFields = [
    'showAge',
    'showLocation',
    'showPhone',
    'publicAccount',
    'searchVisibility',
    'locationPublic',
    'showMeInSearch',
    'allowNotifications'
  ]

  // Campos de notificaciones (paso 4)
  const notificationFields = [
    'notificationsEmailEnabled',
    'notificationsPhoneEnabled',
    'notificationsMatchesEnabled',
    'notificationsEventsEnabled',
    'notificationsLoginEnabled',
    'notificationsPaymentsEnabled'
  ]
  const statusFields = ['configurationCompleted']

  // Determinar qué campos comparar
  const fieldsToCompare = currentStep ? getFieldsForStep(currentStep) : Object.keys(formData)

  // Comparar cada campo
  for (const field of fieldsToCompare) {
    const formValue = formData[field]
    let userValue

    // Obtener el valor del usuario según la estructura
    if (privacyFields.includes(field)) {
      userValue = user.privacy?.[field]
    } else if (notificationFields.includes(field)) {
      userValue = user.notifications?.[field]
    } else if (statusFields.includes(field)) {
      userValue = user.status?.[field]
    } else {
      userValue = user.user?.[field] ?? user[field]
    }

    // IGNORAR images - se comparan por separado en useStepSave
    if (field === 'images') continue

    // Comparación especial para otros arrays (dateOfBirth, tags, etc.)
    if (Array.isArray(formValue) && Array.isArray(userValue)) {
      // Comparar longitud
      if (formValue.length !== userValue.length) return true

      // Comparar elementos
      for (let i = 0; i < formValue.length; i++) {
        if (JSON.stringify(formValue[i]) !== JSON.stringify(userValue[i])) return true
      }

      continue
    }

    // Comparación especial para null/undefined/empty string
    const isFormEmpty = formValue === null || formValue === undefined || formValue === ''
    const isUserEmpty = userValue === null || userValue === undefined || userValue === ''

    if (isFormEmpty && isUserEmpty) continue // Ambos vacíos, sin cambio

    // Si uno está vacío y el otro no, hay cambio
    if (isFormEmpty !== isUserEmpty) return true

    // Comparación normal de valores
    if (formValue !== userValue) return true
  }

  return false // No hay cambios
}

/**
 * Filtra valores null/undefined de un array
 *
 * @param {Array} array - Array a filtrar
 * @returns {Array} - Array sin null/undefined
 *
 * @example
 * filterNullValues([1, null, 2, undefined, 3])  // [1, 2, 3]
 */
export const filterNullValues = array => {
  if (!array || !Array.isArray(array)) return []

  return array.filter(item => item !== null && item !== undefined)
}
