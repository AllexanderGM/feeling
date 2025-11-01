import { useMemo, useEffect, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useCategoryInterests } from '@hooks'
import { getDefaultValuesForStep, stepPreferencesSchema } from '@schemas'
import { Logger } from '@utils/logger.js'

import { useStepSave } from './useStepSave'

const useStepPreferences = ({ onStepComplete, overrideUser = null, saveOptions = {} } = {}) => {
  const { user: contextUser } = useUser()
  const activeUser = overrideUser || contextUser
  const userAttributes = useUserAttributes()
  const categoryInterests = useCategoryInterests()
  const [isSaving, setIsSaving] = useState(false)

  const categoryOptions = categoryInterests.categoryOptions ?? []
  const religionOptions = userAttributes.religionOptions ?? []
  const churchOptions = userAttributes.churchOptions ?? []
  const sexualRoleOptions = userAttributes.sexualRoleOptions ?? []
  const relationshipTypeOptions = userAttributes.relationshipTypeOptions ?? []

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(3, activeUser) || {}
    const normalizeCategory = category => {
      if (!category) return category
      if (typeof category === 'string') return category.toUpperCase()
      if (typeof category === 'object') {
        return category.code || category.value || category.label?.toUpperCase() || category.name?.toUpperCase() || undefined
      }

      return category
    }

    return {
      ...values,
      categoryInterest: normalizeCategory(values.categoryInterest)
    }
  }, [activeUser])

  const form = useForm({
    resolver: yupResolver(stepPreferencesSchema),
    mode: 'onChange',
    defaultValues
  })

  const { control, formState, watch, setValue, clearErrors, reset, handleSubmit } = form
  const errors = formState.errors

  useEffect(() => {
    if (!activeUser) return

    // Wait for options to load before mapping
    const hasReligionOptions = religionOptions && religionOptions.length > 0
    const hasChurchOptions = churchOptions && churchOptions.length > 0
    const hasSexualRoleOptions = sexualRoleOptions && sexualRoleOptions.length > 0
    const hasRelationshipOptions = relationshipTypeOptions && relationshipTypeOptions.length > 0
    const hasCategoryOptions = categoryOptions && categoryOptions.length > 0

    // If user has preferences but options aren't loaded yet, wait
    if (activeUser?.categoryInterest && !hasCategoryOptions) return
    if ((activeUser?.religion || activeUser?.church) && !hasReligionOptions && !hasChurchOptions) return
    if ((activeUser?.sexualRole || activeUser?.relationshipType) && !hasSexualRoleOptions && !hasRelationshipOptions) return

    const values = getDefaultValuesForStep(3, activeUser) || {}

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
      ...values
    }

    // Map categoryInterest name/enum to key
    if (activeUser?.categoryInterest && !values.categoryInterest) {
      // CategoryInterest can come as enum or name
      const categoryKey =
        typeof activeUser.categoryInterest === 'string' ? activeUser.categoryInterest.toUpperCase() : activeUser.categoryInterest

      mappedValues.categoryInterest = categoryKey
    }

    // Map religion name to ID
    if (activeUser?.religion && !values.religionId && hasReligionOptions) {
      mappedValues.religionId = findIdByName(religionOptions, activeUser.religion)
    }

    // Map church name to ID
    if (activeUser?.church && !values.churchId && hasChurchOptions) {
      mappedValues.churchId = findIdByName(churchOptions, activeUser.church)
    }

    // Map sexualRole name to ID
    if (activeUser?.sexualRole && !values.sexualRoleId && hasSexualRoleOptions) {
      mappedValues.sexualRoleId = findIdByName(sexualRoleOptions, activeUser.sexualRole)
    }

    // Map relationshipType name to ID
    if (activeUser?.relationshipType && !values.relationshipId && hasRelationshipOptions) {
      mappedValues.relationshipId = findIdByName(relationshipTypeOptions, activeUser.relationshipType)
    }

    reset(mappedValues, { keepDefaultValues: false })
  }, [
    activeUser,
    religionOptions?.length,
    churchOptions?.length,
    sexualRoleOptions?.length,
    relationshipTypeOptions?.length,
    categoryOptions?.length,
    reset
  ])

  const { saveStepData } = useStepSave(activeUser, {
    overrideUser,
    overrideSaveFn: saveOptions?.overrideSaveFn
  })

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

      setIsSaving(true)

      try {
        const result = await saveStepData({
          stepNumber: 3,
          formData: data
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
    handleFormSubmit,
    isSaving
  }
}

export default useStepPreferences
