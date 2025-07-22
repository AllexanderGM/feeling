import { useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Chip, Accordion, AccordionItem } from '@heroui/react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { Controller, useController } from 'react-hook-form'
import { Camera } from 'lucide-react'

import useImageManager from '../hooks/useImageManager.js'

const MAX_IMAGES = 5
const MAIN_IMAGE_POSITION = 0
const PHOTO_TIPS = [
  { label: 'Foto principal', tip: 'Rostro visible, sonriendo - aumenta 40% más interacciones' },
  { label: 'Variedad', tip: 'Incluye fotos de cuerpo completo y haciendo actividades' },
  { label: 'Calidad', tip: 'Fotos nítidas con buena iluminación natural' },
  { label: 'Autenticidad', tip: 'Evita fotos grupales o con lentes de sol en todas' }
]

const StepBasicInfo = ({ user, control, errors, locationData, watch, setValue, setError, clearErrors }) => {
  // ========================================
  // Hooks y referencias básicas
  // ========================================
  const fileInputRefs = useRef({})

  const { field: imagesField } = useController({
    name: 'images',
    control
  })

  const {
    getImageStats,
    processImageFile,
    handleDrop,
    swapImages,
    removeImage,
    getImageUrl,
    isDragging,
    handleDragOver,
    handleDragLeave,
    cleanupImageUrls
  } = useImageManager(MAX_IMAGES)

  // ========================================
  // Datos del formulario y ubicación
  // ========================================
  const formValues = watch()
  const { images, country, city, phoneCode } = formValues
  const { formattedCountries, formattedCities, formattedLocalities, loadLocalitiesByCity, loadCitiesByCountry } = locationData

  // ========================================
  // Datos optimizados y memoizados
  // ========================================

  // Imágenes normalizadas
  const normalizedImages = useMemo(() => {
    const normalized = [...(images || [])]
    while (normalized.length < MAX_IMAGES) normalized.push(null)
    return normalized.slice(0, MAX_IMAGES)
  }, [images])

  // Lookup de países optimizado
  const countryLookup = useMemo(() => {
    const byPhone = new Map()
    const byName = new Map()
    formattedCountries.forEach(country => {
      byPhone.set(country.phone, country)
      byName.set(country.name, country)
    })
    return { byPhone, byName }
  }, [formattedCountries])

  // Datos derivados
  const derivedData = useMemo(
    () => ({
      shouldShowLocalities: city && formattedLocalities.length > 0,
      imageStats: getImageStats(normalizedImages),
      phoneCountryData: countryLookup.byPhone.get(phoneCode) || { image: '🌍', name: 'Sin país', phone: '' },
      locationCountryData: countryLookup.byName.get(country) || { image: '🌍', name: 'Sin país' },
      email: user?.email || ''
    }),
    [city, formattedLocalities, normalizedImages, countryLookup, phoneCode, country, user, getImageStats]
  )

  // ========================================
  // Manejadores de ubicación
  // ========================================
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

  // ========================================
  // Manejadores de imágenes optimizados
  // ========================================
  const getImageErrorKey = useCallback(position => {
    return position === MAIN_IMAGE_POSITION ? 'profileImage' : `image${position}`
  }, [])

  const imageHandlers = useMemo(
    () => ({
      handleFileChange: async (position, event) => {
        const file = event.target.files[0]
        if (!file) return

        const result = await processImageFile(file, position)
        const errorKey = getImageErrorKey(position)

        if (result.success) {
          const newImages = [...normalizedImages]
          newImages[position] = result.file
          imagesField.onChange(newImages)
          clearErrors(errorKey)
        } else {
          setError(errorKey, {
            type: 'manual',
            message: result.error
          })
          if (fileInputRefs.current[position]) {
            fileInputRefs.current[position].value = ''
          }
        }
      },

      handleImageDrop: async (position, e) => {
        const result = await handleDrop(position, e)
        const errorKey = getImageErrorKey(position)

        if (result.success) {
          const newImages = [...normalizedImages]
          newImages[position] = result.file
          imagesField.onChange(newImages)
          clearErrors(errorKey)
        } else {
          setError(errorKey, {
            type: 'manual',
            message: result.error
          })
        }
      },

      handleSwapToMain: async position => {
        if (position === MAIN_IMAGE_POSITION) return
        const newImages = swapImages(normalizedImages, MAIN_IMAGE_POSITION, position)
        imagesField.onChange(newImages)
      },

      handleRemoveImage: (position, e) => {
        e.stopPropagation()
        const newImages = removeImage(normalizedImages, position)
        imagesField.onChange(newImages)
        if (fileInputRefs.current[position]) {
          fileInputRefs.current[position].value = ''
        }
      }
    }),
    [normalizedImages, imagesField, processImageFile, handleDrop, swapImages, removeImage, getImageErrorKey, setError, clearErrors]
  )

  // ========================================
  // Utilidades de fecha
  // ========================================
  const getParsedDate = useCallback(value => {
    try {
      if (!value) return null
      const date = new Date(value)
      if (isNaN(date.getTime())) return null
      return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    } catch {
      return null
    }
  }, [])

  // ========================================
  // Componente de imagen optimizado
  // ========================================
  const renderImageSlot = useCallback(
    position => {
      const image = normalizedImages[position]
      const imageUrl = getImageUrl(image)
      const hasImage = !!imageUrl
      const errorKey = getImageErrorKey(position)
      const error = errors[errorKey]?.message
      const isMainImage = position === MAIN_IMAGE_POSITION
      const isDraggingImage = isDragging[position]

      const hasMainImageError = isMainImage && (errors.images?.message || errors.profileImage?.message)
      const displayError = error || hasMainImageError

      const containerClasses = `
      relative cursor-pointer transition-all duration-300 group
      ${isMainImage ? 'w-36 h-36 rounded-full border-4' : 'w-32 h-32 rounded-lg border-2 border-dashed'}
      ${hasImage ? 'border-primary-500' : displayError ? 'border-red-500' : 'border-gray-600'}
      ${isDraggingImage ? 'border-primary-400 scale-105' : ''}
      ${displayError ? 'ring-2 ring-red-500/30' : ''}
    `

      const imageId = `image-slot-${position}`
      const errorId = displayError ? `${imageId}-error` : undefined

      return (
        <div key={position} className="flex flex-col items-center">
          <div className="relative group">
            <div
              className={containerClasses}
              onDragOver={e => handleDragOver(position, e)}
              onDragLeave={e => handleDragLeave(position, e)}
              onDrop={e => imageHandlers.handleImageDrop(position, e)}
              onClick={() => fileInputRefs.current[position]?.click()}
              role="button"
              tabIndex="0"
              aria-label={
                hasImage
                  ? `Cambiar ${isMainImage ? 'imagen principal' : `imagen ${position}`}`
                  : `Seleccionar ${isMainImage ? 'imagen principal' : `imagen ${position}`}`
              }
              aria-describedby={errorId}>
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={`${isMainImage ? 'Imagen principal' : `Imagen ${position}`} del perfil`}
                  className={`w-full h-full object-cover ${isMainImage ? 'rounded-full' : 'rounded-lg'}`}
                />
              ) : (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-700/30 ${isMainImage ? 'rounded-full' : 'rounded-lg'} ${displayError ? 'bg-red-900/20 text-red-400' : ''}`}>
                  <div className="text-3xl mb-2" aria-hidden="true">
                    {isDraggingImage ? '📤' : displayError ? '⚠️' : '📷'}
                  </div>
                  <div className="text-xs text-center px-2">
                    {isDraggingImage
                      ? 'Soltar aquí'
                      : displayError
                        ? isMainImage
                          ? 'Imagen requerida'
                          : `Foto ${position}`
                        : isMainImage
                          ? 'Foto principal'
                          : `Foto ${position}`}
                  </div>
                </div>
              )}

              {/* Botón eliminar */}
              {hasImage && (
                <button
                  type="button"
                  onClick={e => imageHandlers.handleRemoveImage(position, e)}
                  className={`absolute bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg ${isMainImage ? 'w-8 h-8 -top-1 -right-1' : 'w-6 h-6 -top-2 -right-2 opacity-0 group-hover:opacity-100'}`}
                  aria-label={`Eliminar ${isMainImage ? 'imagen principal' : `imagen ${position}`}`}>
                  <span aria-hidden="true">✕</span>
                </button>
              )}

              {/* Botón hacer principal */}
              {!isMainImage && hasImage && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    imageHandlers.handleSwapToMain(position)
                  }}
                  className="absolute -bottom-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Hacer imagen ${position} la imagen principal`}>
                  <Chip
                    color="primary"
                    size="sm"
                    startContent={
                      <span className="text-xs" aria-hidden="true">
                        ⭐
                      </span>
                    }
                    variant="shadow"
                    className="cursor-pointer hover:scale-105 transition-transform">
                    Principal
                  </Chip>
                </button>
              )}
            </div>

            <input
              ref={el => (fileInputRefs.current[position] = el)}
              type="file"
              accept="image/*"
              onChange={e => imageHandlers.handleFileChange(position, e)}
              className="sr-only"
              id={`image-input-${position}`}
              name={`image-${position}`}
              aria-label={`Seleccionar imagen ${position === MAIN_IMAGE_POSITION ? 'principal' : `número ${position}`}`}
            />
          </div>

          {!isMainImage && error && (
            <p
              id={errorId}
              className="text-red-400 text-xs mt-2 text-center max-w-[8rem] bg-red-500/10 border border-red-500/20 rounded px-2 py-1"
              role="alert">
              {error}
            </p>
          )}
        </div>
      )
    },
    [normalizedImages, errors, getImageErrorKey, imageHandlers, getImageUrl, handleDragLeave, handleDragOver, isDragging]
  )

  // ========================================
  // Componente de teléfono optimizado
  // ========================================
  const renderPhoneSection = useMemo(
    () => (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="phoneCode"
            control={control}
            render={({ field }) => (
              <Autocomplete
                isRequired
                label="Código de teléfono"
                variant="underlined"
                selectedKey={field.value}
                defaultItems={formattedCountries}
                onSelectionChange={field.onChange}
                isInvalid={!!errors.phoneCode}
                errorMessage={errors.phoneCode?.message}
                inputProps={{
                  id: 'phone-code-select',
                  name: 'phoneCode',
                  'aria-label': 'Seleccionar código de país para teléfono',
                  autoComplete: 'tel-country-code'
                }}
                startContent={
                  field.value && (
                    <img
                      className="w-5 h-5 rounded-full object-cover"
                      src={derivedData.phoneCountryData.image}
                      alt={`Bandera de ${derivedData.phoneCountryData.name}`}
                    />
                  )
                }>
                {country => (
                  <AutocompleteItem
                    key={country.phone}
                    textValue={`${country.phone} ${country.name}`}
                    className={country.priority && 'bg-blue-500/10'}>
                    <div className="flex items-center gap-2">
                      <img src={country.image} alt={`Bandera de ${country.name}`} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-medium">{country.phone}</span>
                      <span className="text-gray-400 ml-1">{country.name}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="Número de teléfono"
                variant="underlined"
                placeholder="123 456 789"
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
                id="phone-number"
                type="tel"
                aria-label="Número de teléfono"
                autoComplete="tel-national"
                onChange={e => {
                  const cleanedPhone = e.target.value.replace(/\D/g, '')
                  field.onChange(cleanedPhone)
                }}
              />
            )}
          />
        </div>

        {phoneCode && formValues.phone && (
          <div className="bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2" role="status">
            <span className="text-xs text-gray-400">Número completo:</span>
            <span className="text-xs text-gray-300 font-mono">
              {phoneCode} {formValues.phone}
            </span>
          </div>
        )}
      </div>
    ),
    [control, errors, formattedCountries, derivedData.phoneCountryData, phoneCode, formValues.phone]
  )

  // ========================================
  // Efectos para carga inicial
  // ========================================

  useEffect(() => () => cleanupImageUrls(normalizedImages), [cleanupImageUrls, normalizedImages])

  // ========================================
  // Render principal
  // ========================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-xl font-bold text-gray-200">Completa tu perfil</h1>
        <p className="text-gray-400 mt-2">Ayúdanos a conocerte mejor</p>
        <p className="text-gray-500 text-xs">
          Usuario asociado al correo: <span className="font-bold">{derivedData.email}</span>
        </p>
      </header>

      {/* Sección de imágenes */}
      <section className="space-y-4" aria-labelledby="images-section">
        <h2 id="images-section" className="sr-only">
          Gestión de imágenes del perfil
        </h2>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-300">Foto de perfil</p>
          {renderImageSlot(MAIN_IMAGE_POSITION)}

          {(errors.images || errors.profileImage) && (
            <p
              className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              role="alert"
              id="main-image-error">
              {errors.images?.message || errors.profileImage?.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-gray-300">Fotos adicionales</h3>
            {derivedData.imageStats.total > 0 && (
              <p className="text-gray-400 text-xs mt-1">
                {derivedData.imageStats.total} de {MAX_IMAGES} fotos
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap justify-center">{[1, 2, 3, 4].map(renderImageSlot)}</div>

          <p className="text-gray-500 text-xs text-center">Arrastra o haz clic para subir • JPG, PNG, WebP • Máx 5MB</p>
        </div>

        {/* Tips para fotos */}
        <Accordion variant="splitted" className="mt-6 px-0">
          <AccordionItem
            key="photo-tips"
            aria-label="Tips para mejores resultados"
            startContent={<Camera className="text-blue-400 text-xl pt-1" aria-hidden="true" />}
            title="Tips para mejores resultados"
            classNames={{
              trigger: 'p-1',
              base: 'bg-blue-500/10 border border-blue-500/20',
              title: 'text-blue-400 text-sm',
              content: 'text-sm'
            }}>
            <ul className="text-blue-300/80 space-y-1 list-disc pl-5">
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
      <section className="space-y-4" aria-labelledby="personal-info-section">
        <h2 id="personal-info-section" className="sr-only">
          Información personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Nombre(s)"
                placeholder="Tus nombre(s)"
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                id="first-name"
                type="text"
                aria-label="Nombres"
                autoComplete="given-name"
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Apellidos"
                placeholder="Tus apellidos"
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName?.message}
                id="last-name"
                type="text"
                aria-label="Apellidos"
                autoComplete="family-name"
              />
            )}
          />
        </div>

        <Controller
          name="document"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              isRequired
              label="Documento de identidad"
              placeholder="Número de documento"
              isInvalid={!!errors.document}
              errorMessage={errors.document?.message}
              id="document-id"
              type="text"
              aria-label="Documento de identidad"
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value ? getParsedDate(field.value) : null}
              onChange={date => {
                const formattedDate = date ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : ''
                field.onChange(formattedDate)
              }}
              isInvalid={!!errors.birthDate}
              errorMessage={errors.birthDate?.message}
              maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
              showMonthAndYearPickers
              granularity="day"
              placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
              description="Debes ser mayor de 18 años"
              id="birth-date"
              aria-label="Fecha de nacimiento"
            />
          )}
        />
      </section>

      {/* Contacto */}
      <section className="space-y-4" aria-labelledby="contact-section">
        <h2 id="contact-section" className="sr-only">
          Información de contacto
        </h2>
        {renderPhoneSection}
      </section>

      {/* Ubicación */}
      <section className="space-y-4" aria-labelledby="location-section">
        <h2 id="location-section" className="sr-only">
          Información de ubicación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Autocomplete
                variant="underlined"
                isRequired
                label="País"
                placeholder="Buscar tu país..."
                defaultItems={formattedCountries}
                selectedKey={field.value}
                onSelectionChange={key => {
                  field.onChange(key)
                  if (key) {
                    locationHandlers.handleCountryChange(key)
                  }
                }}
                isInvalid={!!errors.country}
                errorMessage={errors.country?.message}
                inputProps={{
                  id: 'country-select',
                  name: 'country',
                  'aria-label': 'Seleccionar país',
                  autoComplete: 'country-name'
                }}
                startContent={
                  field.value && (
                    <img
                      className="w-5 h-5 rounded-full object-cover"
                      src={derivedData.locationCountryData.image}
                      alt={`Bandera de ${derivedData.locationCountryData.name}`}
                    />
                  )
                }>
                {country => (
                  <AutocompleteItem key={country.name} textValue={country.name} className={country.priority && 'bg-blue-500/10'}>
                    <div className="flex items-center gap-2">
                      <img className="w-5 h-5 rounded-full object-cover" src={country.image} alt={`Bandera de ${country.name}`} />
                      <span className={country.priority ? 'font-semibold' : ''}>{country.name}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />

          {country && (
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  variant="underlined"
                  isRequired
                  label="Ciudad"
                  placeholder="Buscar tu ciudad..."
                  defaultItems={formattedCities}
                  selectedKey={field.value}
                  onSelectionChange={key => {
                    field.onChange(key)
                    if (key) {
                      locationHandlers.handleCityChange(key)
                    }
                  }}
                  isInvalid={!!errors.city}
                  errorMessage={errors.city?.message}
                  inputProps={{
                    id: 'city-select',
                    name: 'city',
                    'aria-label': 'Seleccionar ciudad',
                    autoComplete: 'address-level2'
                  }}>
                  {city => (
                    <AutocompleteItem key={city.name} textValue={city.name} className={city.priority && 'bg-blue-500/10'}>
                      <span className={city.priority ? 'font-semibold' : ''}>{city.name}</span>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          )}
        </div>

        {derivedData.shouldShowLocalities && (
          <div className="space-y-4">
            <div className="bg-gray-700/20 px-3 py-2 rounded-lg" role="status">
              <span className="text-xs text-gray-400">
                Como seleccionaste {city}, puedes especificar tu localidad para mejorar tus conexiones.
              </span>
            </div>

            <Controller
              name="locality"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  variant="underlined"
                  label="Localidad (opcional)"
                  placeholder="Buscar localidad..."
                  defaultItems={formattedLocalities}
                  selectedKey={field.value || ''}
                  onSelectionChange={key => field.onChange(key || '')}
                  inputProps={{
                    id: 'locality-select',
                    name: 'locality',
                    'aria-label': 'Seleccionar localidad (opcional)',
                    autoComplete: 'address-level3'
                  }}>
                  {locality => (
                    <AutocompleteItem key={locality.name} textValue={locality.name}>
                      {locality.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(StepBasicInfo)
