import { useMemo, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useUserTags } from '@hooks'
import { getDefaultValuesForStep, stepCharacteristicsSchema } from '@schemas'

import { useStepSave } from './useStepSave'

const noop = () => {}

export const normalizeTags = value => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
  if (typeof value === 'string') {
    const trimmed = value.trim()

    return trimmed ? [trimmed] : []
  }

  return []
}

const useStepCharacteristics = ({
  user: userOverride,
  userAttributes: userAttributesOverride,
  userTags: userTagsOverride,
  control: controlOverride,
  errors: errorsOverride,
  watch: watchOverride,
  setValue: setValueOverride,
  clearErrors: clearErrorsOverride,
  handleSubmit: handleSubmitOverride,
  reset: resetOverride,
  onStepComplete
} = {}) => {
  const { user: contextUser } = useUser()
  const userAttributesHook = useUserAttributes()
  const userTagsHook = useUserTags()

  const user = userOverride ?? contextUser
  const userAttributes = userAttributesOverride ?? userAttributesHook
  const userTags = userTagsOverride ?? userTagsHook

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(2, user) || {}

    return {
      ...values,
      tags: normalizeTags(values.tags),
      height: values.height ?? 170
    }
  }, [user])

  const internalForm = useForm({
    resolver: yupResolver(stepCharacteristicsSchema),
    mode: 'onChange',
    defaultValues
  })

  const isStandalone = !controlOverride

  const control = isStandalone ? internalForm.control : controlOverride
  const errors = isStandalone ? internalForm.formState.errors : (errorsOverride ?? {})
  const watch = isStandalone ? internalForm.watch : (watchOverride ?? (() => defaultValues))
  const setValue = isStandalone ? internalForm.setValue : (setValueOverride ?? noop)
  const clearErrors = isStandalone ? internalForm.clearErrors : (clearErrorsOverride ?? noop)
  const handleSubmitFn = isStandalone
    ? internalForm.handleSubmit
    : (handleSubmitOverride ?? (submitHandler => () => (typeof submitHandler === 'function' ? submitHandler() : undefined)))
  const resetForm = isStandalone ? internalForm.reset : (resetOverride ?? noop)
  const isSubmitting = isStandalone ? internalForm.formState.isSubmitting : false

  useEffect(() => {
    if (!isStandalone || !user || !userAttributes) return

    // Only run this effect once when attributes are loaded
    const hasAttributes =
      userAttributes.genderOptions?.length > 0 ||
      userAttributes.maritalStatusOptions?.length > 0 ||
      userAttributes.educationLevelOptions?.length > 0

    if (!hasAttributes) return

    const values = getDefaultValuesForStep(2, user) || {}

    // Map attribute names to IDs by finding them in the options arrays
    const findIdByName = (options, name) => {
      if (!name || !Array.isArray(options)) return undefined
      const found = options.find(opt => opt.label === name || opt.name === name)

      if (!found) return undefined
      const id = found.id ?? found.value

      return id ? parseInt(id, 10) : undefined
    }

    const mappedValues = {
      ...values,
      tags: normalizeTags(values.tags),
      height: values.height ?? 170
    }

    // Map gender name to ID
    if (user.gender && !values.genderId) {
      const genderOptions = userAttributes?.genderOptions || []

      mappedValues.genderId = findIdByName(genderOptions, user.gender)
    }

    // Map maritalStatus name to ID
    if (user.maritalStatus && !values.maritalStatusId) {
      const maritalStatusOptions = userAttributes?.maritalStatusOptions || []

      mappedValues.maritalStatusId = findIdByName(maritalStatusOptions, user.maritalStatus)
    }

    // Map education name to ID
    if (user.education && !values.educationLevelId) {
      const educationLevelOptions = userAttributes?.educationLevelOptions || []

      mappedValues.educationLevelId = findIdByName(educationLevelOptions, user.education)
    }

    // Map eyeColor name to ID
    if (user.eyeColor && !values.eyeColorId) {
      const eyeColorOptions = userAttributes?.eyeColorOptions || []

      mappedValues.eyeColorId = findIdByName(eyeColorOptions, user.eyeColor)
    }

    // Map hairColor name to ID
    if (user.hairColor && !values.hairColorId) {
      const hairColorOptions = userAttributes?.hairColorOptions || []

      mappedValues.hairColorId = findIdByName(hairColorOptions, user.hairColor)
    }

    // Map bodyType name to ID
    if (user.bodyType && !values.bodyTypeId) {
      const bodyTypeOptions = userAttributes?.bodyTypeOptions || []

      mappedValues.bodyTypeId = findIdByName(bodyTypeOptions, user.bodyType)
    }

    resetForm(mappedValues, { keepDefaultValues: false })
  }, [isStandalone, user?.id, userAttributes?.genderOptions?.length])

  const { saveStepData, submitting } = useStepSave(user)
  const isSaving = isStandalone ? submitting || isSubmitting : false

  const onSubmit = useCallback(
    async data => {
      if (!isStandalone) return undefined

      const result = await saveStepData({
        stepNumber: 2,
        formData: {
          ...data,
          tags: normalizeTags(data.tags)
        }
      })

      if (result.success) {
        onStepComplete?.()
      }

      return result
    },
    [isStandalone, saveStepData, onStepComplete]
  )

  const handleFormSubmit = isStandalone ? handleSubmitFn(onSubmit) : undefined
  const isLoading = Boolean(userAttributes?.loading) || Boolean(userTags?.loading)

  return {
    user,
    userAttributes,
    userTags,
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    handleFormSubmit,
    isStandalone,
    isSaving,
    isSubmitting,
    isLoading
  }
}

export default useStepCharacteristics
