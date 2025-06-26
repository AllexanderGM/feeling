import { useState, useCallback, useMemo } from 'react'
import { validateStep, debugValidation } from '@utils/validateInputs'

/**
 * Hook personalizado para manejar validaciones de formulario por pasos
 * @param {number} totalSteps - Número total de pasos
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Funciones y estado de validación
 */
const useForm = (totalSteps, formData) => {
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)

  // Limpiar errores específicos
  const clearFieldError = useCallback(
    field => {
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  // Limpiar múltiples errores
  const clearFieldErrors = useCallback(
    fields => {
      const fieldsToClean = fields.filter(field => errors[field])
      if (fieldsToClean.length > 0) {
        setErrors(prev => {
          const newErrors = { ...prev }
          fieldsToClean.forEach(field => delete newErrors[field])
          return newErrors
        })
      }
    },
    [errors]
  )

  // Limpiar todos los errores
  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Validar paso actual
  const validateCurrentStep = useCallback(
    (showDebug = false) => {
      if (showDebug) {
        console.log(`🔍 Validando paso ${currentStep} con datos:`, formData)
      }

      const validation = validateStep(currentStep, formData)

      if (showDebug) {
        debugValidation(currentStep, formData)
      }

      if (!validation.isValid) {
        setErrors(validation.errors)

        // Scroll al primer error después de un pequeño delay
        setTimeout(() => {
          const firstError = document.querySelector('[data-invalid="true"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

        console.log('❌ Errores de validación:', validation.errors)
      } else {
        console.log('✅ Validación exitosa para paso', currentStep)
      }

      return validation.isValid
    },
    [currentStep, formData]
  )

  // Validar paso específico sin cambiar errores actuales
  const validateSpecificStep = useCallback(
    (step, data = formData) => {
      return validateStep(step, data)
    },
    [formData]
  )

  // Obtener estado de validación sin ejecutar
  const getStepValidationStatus = useCallback(
    (step, data = formData) => {
      const validation = validateStep(step, data)
      return {
        isValid: validation.isValid,
        errorCount: validation.errorCount,
        hasErrors: validation.errorCount > 0
      }
    },
    [formData]
  )

  // Navegación entre pasos
  const goToNextStep = useCallback(
    (validateFirst = true) => {
      if (validateFirst && !validateCurrentStep()) {
        return false
      }

      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return true
      }

      return false
    },
    [currentStep, totalSteps, validateCurrentStep]
  )

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    }

    return false
  }, [currentStep])

  const goToStep = useCallback(
    (step, validateCurrent = true) => {
      if (step < 1 || step > totalSteps) return false

      if (validateCurrent && step > currentStep && !validateCurrentStep()) {
        return false
      }

      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    },
    [currentStep, totalSteps, validateCurrentStep]
  )

  // Estado calculado
  const stepInfo = useMemo(() => {
    const progress = Math.round((currentStep / totalSteps) * 100)

    return {
      current: currentStep,
      total: totalSteps,
      progress,
      isFirst: currentStep === 1,
      isLast: currentStep === totalSteps,
      hasNext: currentStep < totalSteps,
      hasPrev: currentStep > 1
    }
  }, [currentStep, totalSteps])

  // Validación general del formulario
  const isFormValid = useMemo(() => {
    for (let step = 1; step <= totalSteps; step++) {
      const validation = validateStep(step, formData)
      if (!validation.isValid) {
        return false
      }
    }
    return true
  }, [formData, totalSteps])

  // Obtener errores por paso
  const getErrorsByStep = useCallback(() => {
    const errorsByStep = {}

    for (let step = 1; step <= totalSteps; step++) {
      const validation = validateStep(step, formData)
      if (!validation.isValid) {
        errorsByStep[step] = validation.errors
      }
    }

    return errorsByStep
  }, [formData, totalSteps])

  return {
    // Estado
    errors,
    currentStep,
    stepInfo,
    isFormValid,

    // Acciones de errores
    setErrors,
    clearFieldError,
    clearFieldErrors,
    clearAllErrors,

    // Validaciones
    validateCurrentStep,
    validateSpecificStep,
    getStepValidationStatus,
    getErrorsByStep,

    // Navegación
    goToNextStep,
    goToPrevStep,
    goToStep,

    // Utilidades
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length
  }
}

export default useForm
