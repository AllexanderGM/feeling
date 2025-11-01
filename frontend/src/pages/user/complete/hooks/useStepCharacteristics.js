import { useMemo, useEffect, useCallback, useState } from 'react'
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

const useStepCharacteristics = ({ onStepComplete, overrideUser = null, saveOptions = {} } = {}) => {
  const { user: contextUser } = useUser()
  const activeUser = overrideUser || contextUser
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()
  const [isSaving, setIsSaving] = useState(false)

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(2, activeUser) || {}

    return {
      ...values,
      tags: normalizeTags(values.tags),
      height: values.height ?? 170
    }
  }, [activeUser])

  const form = useForm({
    resolver: yupResolver(stepCharacteristicsSchema),
    mode: 'onChange',
    defaultValues
  })

  const { control, formState, watch, setValue, clearErrors, reset, handleSubmit } = form
  const errors = formState.errors

  useEffect(() => {
    if (!activeUser || !userAttributes) return

    // Only run this effect once when attributes are loaded
    const hasAttributes =
      userAttributes.genderOptions?.length > 0 ||
      userAttributes.maritalStatusOptions?.length > 0 ||
      userAttributes.educationLevelOptions?.length > 0

    if (!hasAttributes) return

    const values = getDefaultValuesForStep(2, activeUser) || {}

    // Map attribute names to IDs by finding them in the options arrays
    const findIdByName = (options, name) => {
      if (!name || !Array.isArray(options)) return undefined
      const normalizedName = String(name).toLowerCase()
      const found = options.find(opt => {
        const candidates = [opt.label, opt.name, opt.value, opt.code]

        return candidates.some(candidate => String(candidate || '').toLowerCase() === normalizedName)
      })

      if (!found) return undefined
      const rawId = found.id ?? (found.key !== undefined ? found.key : undefined)
      const numericId = rawId !== undefined ? parseInt(rawId, 10) : undefined

      return Number.isNaN(numericId) ? undefined : numericId
    }

    const mappedValues = {
      ...values,
      tags: normalizeTags(values.tags),
      height: values.height ?? 170
    }

    // Map gender name to ID
    if (activeUser?.gender && !values.genderId) {
      const genderOptions = userAttributes?.genderOptions || []

      mappedValues.genderId = findIdByName(genderOptions, activeUser.gender)
    }

    // Map maritalStatus name to ID
    if (activeUser?.maritalStatus && !values.maritalStatusId) {
      const maritalStatusOptions = userAttributes?.maritalStatusOptions || []

      mappedValues.maritalStatusId = findIdByName(maritalStatusOptions, activeUser.maritalStatus)
    }

    // Map education name to ID
    if (activeUser?.education && !values.educationLevelId) {
      const educationLevelOptions = userAttributes?.educationLevelOptions || []

      mappedValues.educationLevelId = findIdByName(educationLevelOptions, activeUser.education)
    }

    // Map eyeColor name to ID
    if (activeUser?.eyeColor && !values.eyeColorId) {
      const eyeColorOptions = userAttributes?.eyeColorOptions || []

      mappedValues.eyeColorId = findIdByName(eyeColorOptions, activeUser.eyeColor)
    }

    // Map hairColor name to ID
    if (activeUser?.hairColor && !values.hairColorId) {
      const hairColorOptions = userAttributes?.hairColorOptions || []

      mappedValues.hairColorId = findIdByName(hairColorOptions, activeUser.hairColor)
    }

    // Map bodyType name to ID
    if (activeUser?.bodyType && !values.bodyTypeId) {
      const bodyTypeOptions = userAttributes?.bodyTypeOptions || []

      mappedValues.bodyTypeId = findIdByName(bodyTypeOptions, activeUser.bodyType)
    }

    reset(mappedValues, { keepDefaultValues: false })
  }, [
    activeUser,
    reset,
    userAttributes?.genderOptions?.length,
    userAttributes?.maritalStatusOptions?.length,
    userAttributes?.educationLevelOptions?.length,
    userAttributes?.eyeColorOptions?.length,
    userAttributes?.hairColorOptions?.length,
    userAttributes?.bodyTypeOptions?.length
  ])

  const { saveStepData } = useStepSave(activeUser, {
    overrideUser,
    overrideSaveFn: saveOptions?.overrideSaveFn
  })

  const onSubmit = useCallback(
    async data => {
      setIsSaving(true)

      try {
        const result = await saveStepData({
          stepNumber: 2,
          formData: {
            ...data,
            tags: normalizeTags(data.tags)
          }
        })

        onStepComplete?.(result)

        return result
      } finally {
        setIsSaving(false)
      }
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
    userTags,
    isSaving
  }
}

export default useStepCharacteristics
