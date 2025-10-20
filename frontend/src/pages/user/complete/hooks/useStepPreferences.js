import { useMemo, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useCategoryInterests } from '@hooks'
import { getDefaultValuesForStep, stepPreferencesSchema } from '@schemas'

import { useStepSave } from './useStepSave'

const noop = () => {}

const useStepPreferences = ({
  user: userOverride,
  categoryOptions: categoryOptionsOverride,
  religionOptions: religionOptionsOverride,
  churchOptions: churchOptionsOverride,
  sexualRoleOptions: sexualRoleOptionsOverride,
  relationshipTypeOptions: relationshipTypeOptionsOverride,
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
  const categoryInterestsHook = useCategoryInterests()

  const user = userOverride ?? contextUser
  const categoryOptions = categoryOptionsOverride ?? categoryInterestsHook.categoryOptions ?? []
  const religionOptions = religionOptionsOverride ?? userAttributesHook.religionOptions ?? []
  const churchOptions = churchOptionsOverride ?? userAttributesHook.churchOptions ?? []
  const sexualRoleOptions = sexualRoleOptionsOverride ?? userAttributesHook.sexualRoleOptions ?? []
  const relationshipTypeOptions = relationshipTypeOptionsOverride ?? userAttributesHook.relationshipTypeOptions ?? []

  const defaultValues = useMemo(() => {
    const values = getDefaultValuesForStep(3, user) || {}

    return values
  }, [user])

  const internalForm = useForm({
    resolver: yupResolver(stepPreferencesSchema),
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
    if (!isStandalone || !user) return

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
      const categoryKey =
        typeof user.categoryInterest === 'string' ? user.categoryInterest.toUpperCase() : user.categoryInterest

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

    resetForm(mappedValues, { keepDefaultValues: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isStandalone,
    user?.id,
    religionOptions?.length,
    churchOptions?.length,
    sexualRoleOptions?.length,
    relationshipTypeOptions?.length,
    categoryOptions?.length
  ])

  const { saveStepData, submitting } = useStepSave(user)
  const isSaving = isStandalone ? submitting || isSubmitting : false

  const onSubmit = useCallback(
    async data => {
      if (!isStandalone) return undefined

      const result = await saveStepData({
        stepNumber: 3,
        formData: data
      })

      if (result.success) {
        onStepComplete?.()
      }

      return result
    },
    [isStandalone, saveStepData, onStepComplete]
  )

  const handleFormSubmit = isStandalone ? handleSubmitFn(onSubmit) : undefined
  const isLoading = Boolean(userAttributesHook?.loading) || Boolean(categoryInterestsHook?.loading)

  return {
    user,
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
    isStandalone,
    isSaving,
    isSubmitting,
    isLoading
  }
}

export default useStepPreferences
