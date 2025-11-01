import { useRef, useCallback, useMemo, useEffect, useState } from 'react'
import { useForm, useController } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CalendarDate } from '@internationalized/date'
import { useAuth, useLocation } from '@hooks'
import { getDefaultValuesForStep, getUserEmail, getUserCountry, getUserCity, stepBasicInfoSchema } from '@schemas'
import { convertTimestamp, isTimestampArray } from '@utils/convertTimestamp.js'

import { useStepSave } from './useStepSave'
import { usePersistentImages } from './usePersistentImages'

const normalizeValue = value => (typeof value === 'string' ? value.trim() : value)

export const useStepBasicInfo = ({ onStepComplete, overrideUser = null, saveOptions = {} } = {}) => {
  const imageManagerRef = useRef(null)
  const { user: authUser } = useAuth()
  const activeUser = overrideUser || authUser
  const [isSaving, setIsSaving] = useState(false)

  const defaultValues = useMemo(() => {
    const stepValues = getDefaultValuesForStep(1, activeUser)

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
  }, [activeUser])

  const locationConfig = useMemo(
    () => ({
      defaultCountry: getUserCountry(activeUser) || 'Colombia',
      defaultCity: getUserCity(activeUser) || 'Bogotá',
      loadAll: true
    }),
    [activeUser]
  )

  const location = useLocation(locationConfig)

  const form = useForm({
    resolver: yupResolver(stepBasicInfoSchema),
    mode: 'onChange',
    defaultValues
  })

  const { control, watch, setValue, setError, clearErrors, formState } = form
  const formErrors = formState.errors

  const { saveStepData } = useStepSave(activeUser, {
    overrideUser,
    overrideSaveFn: saveOptions?.overrideSaveFn
  })

  useEffect(() => {
    if (!activeUser) return

    const stepValues = getDefaultValuesForStep(1, activeUser)

    if (stepValues.dateOfBirth && isTimestampArray(stepValues.dateOfBirth)) {
      stepValues.dateOfBirth = convertTimestamp(stepValues.dateOfBirth)
    }

    const localityValue = stepValues.locality

    if (Array.isArray(localityValue) && localityValue.length > 0) {
      stepValues.locality = localityValue[0]
    } else if (localityValue && typeof localityValue === 'object') {
      stepValues.locality = localityValue.name ?? localityValue.label ?? ''
    }

    form.reset(
      {
        ...stepValues,
        locality: stepValues.locality ?? ''
      },
      { keepDefaultValues: false }
    )
  }, [activeUser, form])

  const { field: imagesField } = useController({
    name: 'images',
    control
  })

  const formValues = watch()
  const { images = [], country, city, phoneCode, locality } = formValues

  // Obtener imágenes iniciales del usuario
  const initialImages = useMemo(() => {
    if (!activeUser) return []
    const directUserImages = activeUser.user?.images ?? activeUser.images ?? []

    return Array.isArray(directUserImages) && directUserImages.length > 0 ? directUserImages : []
  }, [activeUser])

  const { formattedCountries = [], formattedCities = [], formattedLocalities = [], loadCitiesByCountry, loadLocalitiesByCity } = location

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
      email: getUserEmail(activeUser) || ''
    }),
    [city, formattedLocalities, countryLookup, phoneCode, country, activeUser]
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

  // Callback para manejar cambios de imágenes y actualizar el formulario
  const handleImagesFormChange = useCallback(
    newImages => {
      imagesField.onChange(newImages)
      if (newImages.length > 0) {
        clearErrors('images')
        clearErrors('profileImage')
      }
    },
    [imagesField, clearErrors]
  )

  // Callback para validación de imágenes
  const handleImageValidationChange = useCallback(
    ({ hasErrors, imageCount, errors: imageErrors }) => {
      if (hasErrors && Object.keys(imageErrors).length > 0) return

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

  // Hook de imágenes persistentes
  const {
    fileObjects: persistentFileObjects,
    handleImagesChange,
    hasInitialized
  } = usePersistentImages(Array.isArray(images) && images.length > 0 ? images : initialImages, handleImagesFormChange, {
    onValidationChange: handleImageValidationChange
  })

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
      setIsSaving(true)

      try {
        const prepared = Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = normalizeValue(value)

          return acc
        }, {})

        const result = await saveStepData({
          stepNumber: 1,
          formData: prepared,
          images: prepared.images
        })

        onStepComplete?.(result)

        return result
      } finally {
        setIsSaving(false)
      }
    },
    [saveStepData, onStepComplete]
  )

  const handleFormSubmit = form.handleSubmit(onSubmit)

  return {
    control,
    formErrors,
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
    handleFormSubmit,
    imageManagerRef,
    phoneCode,
    formValuesPhone: formValues?.phone ?? '',
    country: formValues?.country ?? '',
    city: formValues?.city ?? '',
    isSaving
  }
}
