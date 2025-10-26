import { useMemo, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useCategoryInterests } from '@hooks'
import { getDefaultValuesForStep, stepPreferencesSchema } from '@schemas'
import { Logger } from '@utils/logger.js'

import { useStepSave } from './useStepSave'

const useStepPreferences = ({ onStepComplete } = {}) => {
  const { user } = useUser()
  const userAttributes = useUserAttributes()
  const categoryInterests = useCategoryInterests()

  const categoryOptions = categoryInterests.categoryOptions ?? []
  const religionOptions = userAttributes.religionOptions ?? []
  const churchOptions = userAttributes.churchOptions ?? []
  const sexualRoleOptions = userAttributes.sexualRoleOptions ?? []
  const relationshipTypeOptions = userAttributes.relationshipTypeOptions ?? []

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(3, user) || {}

    return values
  }, [user])

  const form = useForm({
    resolver: yupResolver(stepPreferencesSchema),
    mode: 'onChange',
    defaultValues
  })

  const { control, formState, watch, setValue, clearErrors, reset, handleSubmit } = form
  const errors = formState.errors

  useEffect(() => {
    if (!user) return

    // Wait for options to load before mapping
    const hasReligionOptions = religionOptions && religionOptions.length > 0
    const hasChurchOptions = churchOptions && churchOptions.length > 0
    const hasSexualRoleOptions = sexualRoleOptions && sexualRoleOptions.length > 0
    const hasRelationshipOptions = relationshipTypeOptions && relationshipTypeOptions.length > 0
    const hasCategoryOptions = categoryOptions && categoryOptions.length > 0

    // If user has preferences but options aren't loaded yet, wait
    if (user.categoryInterest && !hasCategoryOptions) return
    if ((user.religion || user.church) && !hasReligionOptions && !hasChurchOptions) return
    if ((user.sexualRole || user.relationshipType) && !hasSexualRoleOptions && !hasRelationshipOptions) return

    const values = getDefaultValuesForStep(3, user) || {}

    // Map attribute names to IDs by finding them in the options arrays
    const findIdByName = (options, name) => {
      if (!name || !Array.isArray(options)) return undefined
      const found = options.find(opt => opt.label === name || opt.name === name)

      if (!found) return undefined
      const id = found.id ?? found.value

      return id ? parseInt(id, 10) : undefined
    }

    const mappedValues = {
      ...values
    }

    // Map categoryInterest name/enum to key
    if (user.categoryInterest && !values.categoryInterest) {
      // CategoryInterest can come as enum or name
      const categoryKey = typeof user.categoryInterest === 'string' ? user.categoryInterest.toUpperCase() : user.categoryInterest

      mappedValues.categoryInterest = categoryKey
    }

    // Map religion name to ID
    if (user.religion && !values.religionId && hasReligionOptions) {
      mappedValues.religionId = findIdByName(religionOptions, user.religion)
    }

    // Map church name to ID
    if (user.church && !values.churchId && hasChurchOptions) {
      mappedValues.churchId = findIdByName(churchOptions, user.church)
    }

    // Map sexualRole name to ID
    if (user.sexualRole && !values.sexualRoleId && hasSexualRoleOptions) {
      mappedValues.sexualRoleId = findIdByName(sexualRoleOptions, user.sexualRole)
    }

    // Map relationshipType name to ID
    if (user.relationshipType && !values.relationshipId && hasRelationshipOptions) {
      mappedValues.relationshipId = findIdByName(relationshipTypeOptions, user.relationshipType)
    }

    reset(mappedValues, { keepDefaultValues: false })
  }, [
    user?.id,
    religionOptions?.length,
    churchOptions?.length,
    sexualRoleOptions?.length,
    relationshipTypeOptions?.length,
    categoryOptions?.length,
    reset
  ])

  const { saveStepData } = useStepSave(user)

  const onSubmit = useCallback(
    async data => {
      // Debug: verificar qué datos se están enviando
      Logger.debug(Logger.CATEGORIES.UI, 'StepPreferences Submit', 'Datos del formulario antes de enviar', {
        context: {
          categoryInterest: data.categoryInterest,
          sexualRoleId: data.sexualRoleId,
          relationshipId: data.relationshipId,
          religionId: data.religionId,
          churchId: data.churchId,
          allData: data
        }
      })

      const result = await saveStepData({
        stepNumber: 3,
        formData: data
      })

      // Siempre llamar onStepComplete con el resultado
      onStepComplete?.(result)

      return result
    },
    [saveStepData, onStepComplete]
  )

  const handleFormSubmit = handleSubmit(onSubmit)

  return {
    categoryOptions,
    religionOptions,
    churchOptions,
    sexualRoleOptions,
    relationshipTypeOptions,
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    handleFormSubmit
  }
}

export default useStepPreferences
