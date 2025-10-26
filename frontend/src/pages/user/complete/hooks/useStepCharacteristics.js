import { useMemo, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useUserTags } from '@hooks'
import { getDefaultValuesForStep, stepCharacteristicsSchema } from '@schemas'

import { useStepSave } from './useStepSave'

export const normalizeTags = value => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
  if (typeof value === 'string') {
    const trimmed = value.trim()

    return trimmed ? [trimmed] : []
  }

  return []
}

const useStepCharacteristics = ({ onStepComplete } = {}) => {
  const { user } = useUser()
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(2, user) || {}

    return {
      ...values,
      tags: normalizeTags(values.tags),
      height: values.height ?? 170
    }
  }, [user])

  const form = useForm({
    resolver: yupResolver(stepCharacteristicsSchema),
    mode: 'onChange',
    defaultValues
  })

  const { control, formState, watch, setValue, clearErrors, reset, handleSubmit } = form
  const errors = formState.errors

  useEffect(() => {
    if (!user || !userAttributes) return

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

    reset(mappedValues, { keepDefaultValues: false })
  }, [user?.id, userAttributes?.genderOptions?.length, reset])

  const { saveStepData } = useStepSave(user)

  const onSubmit = useCallback(
    async data => {
      const result = await saveStepData({
        stepNumber: 2,
        formData: {
          ...data,
          tags: normalizeTags(data.tags)
        }
      })

      // Siempre llamar onStepComplete con el resultado
      onStepComplete?.(result)

      return result
    },
    [saveStepData, onStepComplete]
  )

  const handleFormSubmit = handleSubmit(onSubmit)

  return {
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    handleFormSubmit,
    userAttributes,
    userTags
  }
}

export default useStepCharacteristics
