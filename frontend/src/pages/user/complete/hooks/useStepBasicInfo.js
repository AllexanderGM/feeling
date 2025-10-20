import { useRef, useCallback, useMemo, useEffect } from 'react'
import { useForm, useController } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CalendarDate } from '@internationalized/date'
import { useAuth, useLocation } from '@hooks'
import { getDefaultValuesForStep, getUserEmail, getUserCountry, getUserCity, stepBasicInfoSchema } from '@schemas'
import { convertTimestamp, isTimestampArray } from '@utils/convertTimestamp.js'

import { useStepSave } from './useStepSave'
import { usePersistentImages } from './usePersistentImages'

const normalizeValue = value => (typeof value === 'string' ? value.trim() : value)

export const useStepBasicInfo = ({
  user,
  locationData,
  locationOptions,
  onStepComplete,
  control: externalControl,
  errors: externalErrors,
  watch: externalWatch,
  setValue: externalSetValue,
  setError: externalSetError,
  clearErrors: externalClearErrors
} = {}) => {
  const imageManagerRef = useRef(null)
  const { user: authUser } = useAuth()

  const resolvedUser = user ?? authUser

  const defaultValues = useMemo(() => {
    const stepValues = getDefaultValuesForStep(1, resolvedUser)

    if (stepValues.dateOfBirth && isTimestampArray(stepValues.dateOfBirth)) {
      stepValues.dateOfBirth = convertTimestamp(stepValues.dateOfBirth)
    }

    const localityValue = stepValues.locality

    if (Array.isArray(localityValue) && localityValue.length > 0) {
      stepValues.locality = localityValue[0]
    } else if (localityValue && typeof localityValue === 'object') {
      stepValues.locality = localityValue.name ?? localityValue.label ?? ''
    }

    return {
      ...stepValues,
      locality: stepValues.locality ?? ''
    }
  }, [resolvedUser])

  const locationConfig = useMemo(
    () => ({
      defaultCountry: getUserCountry(resolvedUser) || 'Colombia',
      defaultCity: getUserCity(resolvedUser) || 'Bogotá',
      loadAll: true,
      ...(locationOptions || {})
    }),
    [resolvedUser, locationOptions]
  )

  const locationHook = useLocation(locationConfig)
  const locationSource = locationData || locationHook

  const internalForm = useForm({
    resolver: yupResolver(stepBasicInfoSchema),
    mode: 'onChange',
    defaultValues
  })

  const isStandalone = !externalControl
  const control = isStandalone ? internalForm.control : externalControl
  const watch = isStandalone ? internalForm.watch : externalWatch
  const setValue = isStandalone ? internalForm.setValue : (externalSetValue ?? (() => {}))
  const setError = isStandalone ? internalForm.setError : (externalSetError ?? (() => {}))
  const clearErrors = isStandalone ? internalForm.clearErrors : (externalClearErrors ?? (() => {}))
  const formErrors = isStandalone ? internalForm.formState.errors : (externalErrors ?? {})
  const isSubmitting = isStandalone ? internalForm.formState.isSubmitting : false

  const { saveStepData, submitting } = useStepSave(resolvedUser)

  useEffect(() => {
    if (!isStandalone) return
    if (!resolvedUser) return

    const stepValues = getDefaultValuesForStep(1, resolvedUser)

    if (stepValues.dateOfBirth && isTimestampArray(stepValues.dateOfBirth)) {
      stepValues.dateOfBirth = convertTimestamp(stepValues.dateOfBirth)
    }

    const localityValue = stepValues.locality

    if (Array.isArray(localityValue) && localityValue.length > 0) {
      stepValues.locality = localityValue[0]
    } else if (localityValue && typeof localityValue === 'object') {
      stepValues.locality = localityValue.name ?? localityValue.label ?? ''
    }

    internalForm.reset(
      {
        ...stepValues,
        locality: stepValues.locality ?? ''
      },
      { keepDefaultValues: false }
    )
  }, [isStandalone, resolvedUser, internalForm])

  const { field: imagesField } = useController({
    name: 'images',
    control
  })

  const formValues = watch ? watch() : defaultValues
  const { images = [], country, city, phoneCode, locality } = formValues || {}

  const userImages = useMemo(() => {
    if (!resolvedUser) return []

    const directUserImages = resolvedUser.user?.images ?? resolvedUser.images ?? []

    if (Array.isArray(directUserImages) && directUserImages.length > 0) {
      return directUserImages
    }

    return Array.isArray(images) ? images : []
  }, [resolvedUser, images])

  const {
    formattedCountries = [],
    formattedCities = [],
    formattedLocalities = [],
    loadCitiesByCountry,
    loadLocalitiesByCity
  } = locationSource || {}

  const countryLookup = useMemo(() => {
    const byPhone = new Map()
    const byName = new Map()

    formattedCountries.forEach(countryItem => {
      byPhone.set(countryItem.phone, countryItem)
      byName.set(countryItem.name, countryItem)
    })

    return { byPhone, byName }
  }, [formattedCountries])

  useEffect(() => {
    if (!country || formattedCountries.length === 0) return
    if (typeof loadCitiesByCountry !== 'function') return
    if (!formattedCities || formattedCities.length === 0) {
      loadCitiesByCountry(country)
    }
  }, [country, formattedCountries, formattedCities, loadCitiesByCountry])

  useEffect(() => {
    if (!city) return
    if (typeof loadLocalitiesByCity !== 'function') return
    if (!formattedLocalities || formattedLocalities.length === 0) {
      loadLocalitiesByCity(city)
    }
  }, [city, formattedLocalities, loadLocalitiesByCity])

  useEffect(() => {
    if (!locality) return
    if (!formattedLocalities || formattedLocalities.length === 0) return

    const normalize = value =>
      value
        ? value
            .toString()
            .trim()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
        : ''

    const normalizedLocality = normalize(locality)
    const matched = formattedLocalities.find(loc => normalize(loc.name) === normalizedLocality)

    if (!matched) {
      const exactStringMatch = formattedLocalities.find(loc => loc.name === locality)
      const partial = exactStringMatch || formattedLocalities.find(loc => normalize(loc.name).includes(normalizedLocality))

      if (partial) {
        setValue('locality', partial.name, { shouldValidate: true, shouldDirty: false })
      } else {
        setValue('locality', '', { shouldValidate: false, shouldDirty: false })
      }
    }
  }, [locality, formattedLocalities, setValue])

  const derivedData = useMemo(
    () => ({
      shouldShowLocalities: city && formattedLocalities.length > 0,
      phoneCountryData: countryLookup.byPhone.get(phoneCode) || { image: '🌍', name: 'Sin país', phone: '' },
      locationCountryData: countryLookup.byName.get(country) || { image: '🌍', name: 'Sin país' },
      email: getUserEmail(resolvedUser) || ''
    }),
    [city, formattedLocalities, countryLookup, phoneCode, country, resolvedUser]
  )

  const locationHandlers = useMemo(
    () => ({
      handleCountryChange: key => {
        if (!key) return
        setValue('country', key)
        setValue('city', '')
        setValue('locality', '')
        loadCitiesByCountry?.(key)
      },

      handleCityChange: key => {
        if (!key) return
        setValue('city', key)
        setValue('locality', '')
        loadLocalitiesByCity?.(key)
      }
    }),
    [setValue, loadCitiesByCountry, loadLocalitiesByCity]
  )

  const {
    fileObjects: persistentFileObjects,
    handleImagesChange: handlePersistentImagesChange,
    hasInitialized
  } = usePersistentImages(Array.isArray(images) && images.length > 0 ? images : userImages, newImages => {
    imagesField.onChange(newImages)

    if (newImages.length > 0) {
      clearErrors('images')
      clearErrors('profileImage')
    }
  })

  const handleImagesChange = useCallback(
    newImages => {
      handlePersistentImagesChange(newImages)
    },
    [handlePersistentImagesChange]
  )

  const handleImageValidationChange = useCallback(
    ({ hasErrors, imageCount, errors: imageErrors }) => {
      if (hasErrors && Object.keys(imageErrors).length > 0) {
        return
      }

      if (imageCount === 0) {
        setError('images', {
          type: 'required',
          message: 'Debes subir al menos una imagen de perfil'
        })
      } else {
        clearErrors('images')
        clearErrors('profileImage')
      }
    },
    [setError, clearErrors]
  )

  const getParsedDate = useCallback(value => {
    try {
      if (!value) return null
      if (value instanceof CalendarDate) return value

      const date = new Date(value)

      if (Number.isNaN(date.getTime())) return null

      return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    } catch {
      return null
    }
  }, [])

  const onSubmit = useCallback(
    async data => {
      const prepared = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = normalizeValue(value)

        return acc
      }, {})

      const result = await saveStepData({
        stepNumber: 1,
        formData: prepared,
        images: prepared.images
      })

      if (result.success) {
        onStepComplete?.()
      }
    },
    [saveStepData, onStepComplete]
  )

  const handleFormSubmit = isStandalone ? internalForm.handleSubmit(onSubmit) : undefined
  const isSaving = isStandalone ? submitting || isSubmitting : false

  return {
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formErrors,
    isSubmitting,
    saveStepData,
    submitting,
    formValues,
    formattedCountries,
    formattedCities,
    formattedLocalities,
    locationHandlers,
    derivedData,
    persistentFileObjects,
    hasInitialized,
    handleImagesChange,
    handleImageValidationChange,
    getParsedDate,
    onSubmit,
    handleFormSubmit,
    isSaving,
    isStandalone,
    imageManagerRef,
    phoneCode,
    formValuesPhone: formValues?.phone ?? '',
    country: formValues?.country ?? '',
    city: formValues?.city ?? '',
    localityValue: formValues?.locality ?? '',
    defaultValues
  }
}
