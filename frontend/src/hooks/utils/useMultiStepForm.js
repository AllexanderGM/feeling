import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

export const useMultiStepForm = (steps, schemas, defaultValues = {}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(defaultValues)

  const currentSchema = schemas[currentStep]

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm({
    resolver: currentSchema ? yupResolver(currentSchema) : undefined,
    defaultValues: formData,
    mode: 'onChange'
  })

  const nextStep = useCallback(async () => {
    const isStepValid = await trigger()

    if (isStepValid) {
      const stepData = getValues()
      setFormData(prev => ({ ...prev, ...stepData }))
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
      return true
    }
    return false
  }, [trigger, getValues, steps.length])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const goToStep = useCallback(
    stepIndex => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex)
      }
    },
    [steps.length]
  )

  const submitStep = useCallback(
    async onSubmit => {
      const isValid = await trigger()
      if (isValid) {
        const stepData = getValues()
        const completeData = { ...formData, ...stepData }
        setFormData(completeData)
        return onSubmit(completeData)
      }
    },
    [trigger, getValues, formData]
  )

  return {
    // Form state
    control,
    watch,
    setValue,
    errors,
    isValid,
    isSubmitting,

    // Step state
    currentStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: Math.round(((currentStep + 1) / steps.length) * 100),

    // Data
    formData,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    submitStep,
    handleSubmit
  }
}

export default useMultiStepForm
