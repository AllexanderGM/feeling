/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, useCallback, useMemo, memo, useEffect } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Accordion, AccordionItem, Button } from '@heroui/react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { useForm, Controller, useController } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Camera } from 'lucide-react'

import ImageManager from '@components/ui/imageManager/ImageManager'
import { getUserEmail, getDefaultValuesForStep, stepBasicInfoSchema } from '@schemas'
import { convertTimestamp, isTimestampArray } from '@utils/convertTimestamp.js'

import { useStepSave } from '../hooks/useStepSave'
import { usePersistentImages } from '../hooks/usePersistentImages'

const MAX_IMAGES = 5
const PHOTO_TIPS = [
  { label: 'Foto principal', tip: 'Rostro visible, sonriendo - aumenta 40% más interacciones' },
  { label: 'Variedad', tip: 'Incluye fotos de cuerpo completo y haciendo actividades' },
  { label: 'Calidad', tip: 'Fotos nítidas con buena iluminación natural' },
  { label: 'Autenticidad', tip: 'Evita fotos grupales o con lentes de sol en todas' }
]

const normalizeValue = value => (typeof value === 'string' ? value.trim() : value)

const StepBasicInfo = ({ user, locationData, onStepComplete, onStepBack, isFirstStep = true, isLastStep = false }) => {
  const defaultValues = useMemo(() => {
    const stepValues = getDefaultValuesForStep(1, user)

    if (stepValues.dateOfBirth && isTimestampArray(stepValues.dateOfBirth)) {
      stepValues.dateOfBirth = convertTimestamp(stepValues.dateOfBirth)
    }

    const localityValue = stepValues.locality
    if (Array.isArray(localityValue) && localityValue.length > 0) {
      stepValues.locality = localityValue[0]
    } else if (localityValue && typeof localityValue === 'object') {
      stepValues.locality = localityValue.name ?? localityValue.label ?? ''
    }

    return stepValues
  }, [user])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepBasicInfoSchema),
    mode: 'onChange',
    defaultValues
  })

  const { saveStepData, submitting } = useStepSave(user)
  const imageManagerRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const stepValues = getDefaultValuesForStep(1, user)

    if (stepValues.dateOfBirth && isTimestampArray(stepValues.dateOfBirth)) {
      stepValues.dateOfBirth = convertTimestamp(stepValues.dateOfBirth)
    }
    const localityValue = stepValues.locality
    if (Array.isArray(localityValue) && localityValue.length > 0) {
      stepValues.locality = localityValue[0]
    } else if (localityValue && typeof localityValue === 'object') {
      stepValues.locality = localityValue.name ?? localityValue.label ?? ''
    }
    reset(stepValues, { keepDefaultValues: false })
  }, [user, reset])

  const { field: imagesField } = useController({
    name: 'images',
    control
  })

  const formValues = watch()
  const { images, country, city, phoneCode, locality } = formValues
  const {
    formattedCountries = [],
    formattedCities = [],
    formattedLocalities = [],
    loadLocalitiesByCity,
    loadCitiesByCountry
  } = locationData

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
    if (import.meta.env.DEV) {
      console.debug('🔍 [StepBasicInfo] Localidad debug', {
        city,
        locality,
        formattedLocalities
      })
    }
  }, [city, locality, formattedLocalities])

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
      const partial = formattedLocalities.find(loc => normalize(loc.name).includes(normalizedLocality))
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
      email: getUserEmail(user) || ''
    }),
    [city, formattedLocalities, countryLookup, phoneCode, country, user]
  )

  const locationHandlers = useMemo(
    () => ({
      handleCountryChange: key => {
        if (!key) return
        setValue('country', key)
        setValue('city', '')
        setValue('locality', '')
        loadCitiesByCountry(key)
      },

      handleCityChange: key => {
        if (!key) return
        setValue('city', key)
        setValue('locality', '')
        loadLocalitiesByCity(key)
      }
    }),
    [setValue, loadCitiesByCountry, loadLocalitiesByCity]
  )

  const userImages = useMemo(() => {
    if (!user) return []
    const imgs = user.user?.images ?? user.images ?? []

    return imgs
  }, [user])

  const {
    fileObjects: persistentFileObjects,
    handleImagesChange: handlePersistentImagesChange,
    hasInitialized
  } = usePersistentImages(userImages, newImages => {
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

  const renderPhoneSection = () => (
    <div className='space-y-2'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Controller
          control={control}
          name='phoneCode'
          render={({ field }) => (
            <Autocomplete
              isRequired
              defaultItems={formattedCountries}
              errorMessage={errors.phoneCode?.message}
              inputProps={{
                id: 'phone-code-select',
                name: 'phoneCode',
                'aria-label': 'Seleccionar código de país para teléfono',
                autoComplete: 'tel-country-code'
              }}
              isInvalid={!!errors.phoneCode}
              label='Código de teléfono'
              selectedKey={field.value}
              startContent={
                field.value && (
                  <span className='text-base' aria-hidden='true'>
                    {derivedData.phoneCountryData.image || '🌍'}
                  </span>
                )
              }
              variant='underlined'
              onSelectionChange={field.onChange}>
              {countryItem => (
                <AutocompleteItem
                  key={countryItem.phone}
                  className={countryItem.priority && 'bg-blue-500/10'}
                  textValue={`${countryItem.phone} ${countryItem.name}`}>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{countryItem.phone}</span>
                    <span className='text-gray-400 ml-1'>{countryItem.name}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          )}
        />

        <Controller
          control={control}
          name='phone'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              aria-label='Número de teléfono'
              autoComplete='tel-national'
              errorMessage={errors.phone?.message}
              id='phone-number'
              isInvalid={!!errors.phone}
              label='Número de teléfono'
              placeholder='123 456 789'
              type='tel'
              variant='underlined'
              onChange={e => {
                const cleanedPhone = e.target.value.replace(/\D/g, '')
                field.onChange(cleanedPhone)
              }}
            />
          )}
        />
      </div>

      {phoneCode && formValues.phone && (
        <div className='bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2' role='status'>
          <span className='text-xs text-gray-400'>Número completo:</span>
          <span className='text-xs text-gray-300 font-mono'>
            {phoneCode} {formValues.phone}
          </span>
        </div>
      )}
    </div>
  )

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
    [onStepComplete, saveStepData]
  )

  const isSaving = submitting || isSubmitting

  return (
    <form className='space-y-4 md:space-y-6 px-2 md:px-0' onSubmit={handleSubmit(onSubmit)}>
      {/* Sección de imágenes */}
      <section aria-labelledby='images-section' className='space-y-4 md:space-y-6'>
        {!hasInitialized ? (
          <div className='text-center py-8'>
            <p className='text-blue-400 text-sm'>Cargando imágenes...</p>
          </div>
        ) : (
          <ImageManager
            ref={imageManagerRef}
            enableCrop
            enableReorder
            required
            showEmptySlots
            className=''
            cropAspectRatio={3 / 4}
            enablePreview={false}
            gridCols={3}
            images={persistentFileObjects}
            layout='dynamic'
            maxImages={MAX_IMAGES}
            size='default'
            onImagesChange={handleImagesChange}
            onValidationChange={handleImageValidationChange}
          />
        )}

        {(errors.images || errors.profileImage) && (
          <div className='text-center'>
            <p className='text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 inline-block'>
              {errors.images?.message || errors.profileImage?.message}
            </p>
          </div>
        )}

        <Accordion className='mt-6 px-0' variant='splitted'>
          <AccordionItem
            key='photo-tips'
            aria-label='Tips para mejores resultados'
            classNames={{
              trigger: 'p-1',
              base: 'bg-blue-500/10 border border-blue-500/20',
              title: 'text-blue-400 text-sm',
              content: 'text-sm'
            }}
            startContent={<Camera aria-hidden='true' className='text-blue-400 text-xl pt-1' />}
            title='Tips para mejores resultados'>
            <ul className='text-blue-300/80 space-y-1 list-disc pl-5'>
              {PHOTO_TIPS.map((tip, index) => (
                <li key={index}>
                  <strong>{tip.label}:</strong> {tip.tip}
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Información personal */}
      <section aria-labelledby='personal-info-section' className='space-y-4'>
        <h2 className='sr-only' id='personal-info-section'>
          Información personal
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
