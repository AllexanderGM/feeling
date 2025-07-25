import { useRef, useCallback, useMemo, memo } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Accordion, AccordionItem } from '@heroui/react'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { Controller, useController } from 'react-hook-form'
import { Camera } from 'lucide-react'

import ImageManager from '@components/ui/imageManager/ImageManager'
import { usePersistentImages } from '../hooks/usePersistentImages'

const MAX_IMAGES = 5
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
  const imageManagerRef = useRef(null)

  const { field: imagesField } = useController({
    name: 'images',
    control
  })

  // ========================================
  // Datos del formulario y ubicación
  // ========================================
  const formValues = watch()
  const { images, country, city, phoneCode } = formValues
  const { formattedCountries, formattedCities, formattedLocalities, loadLocalitiesByCity, loadCitiesByCountry } = locationData

  // ========================================
  // Datos optimizados y memoizados
  // ========================================

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
      phoneCountryData: countryLookup.byPhone.get(phoneCode) || { image: '🌍', name: 'Sin país', phone: '' },
      locationCountryData: countryLookup.byName.get(country) || { image: '🌍', name: 'Sin país' },
      email: user?.profile?.email || ''
    }),
    [city, formattedLocalities, countryLookup, phoneCode, country, user]
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
  // Manejadores de imágenes con persistencia
  // ========================================
  const {
    fileObjects: persistentFileObjects,
    handleImagesChange: handlePersistentImagesChange,
    hasInitialized
  } = usePersistentImages(images || [], newImages => {
    // Actualizar el formulario cuando cambian las imágenes persistentes
    imagesField.onChange(newImages)

    // Limpiar errores de imágenes cuando se agregan válidas
    if (newImages.length > 0) {
      clearErrors('images')
      clearErrors('profileImage')
    }
  })

  const handleImagesChange = useCallback(
    newImages => {
      // Manejar cambios en las imágenes a través del sistema persistente
      handlePersistentImagesChange(newImages)
    },
    [handlePersistentImagesChange]
  )

  const handleImageValidationChange = useCallback(
    ({ hasErrors, imageCount, errors }) => {
      // Si hay errores específicos del ImageManager, manejarlos
      if (hasErrors && Object.keys(errors).length > 0) {
        // El nuevo ImageManager maneja sus propios errores
        return
      }

      // Validar requisito de imagen principal
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
  // Render principal
  // ========================================
  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Sección de imágenes */}
      <section className="space-y-4 md:space-y-6" aria-labelledby="images-section">
        {!hasInitialized ? (
          <div className="text-center py-8">
            <p className="text-blue-400 text-sm">Cargando imágenes...</p>
          </div>
        ) : (
          <ImageManager
            ref={imageManagerRef}
            images={persistentFileObjects}
            onImagesChange={handleImagesChange}
            onValidationChange={handleImageValidationChange}
            maxImages={MAX_IMAGES}
            required={true}
            enableCrop={true}
            enableReorder={true}
            enablePreview={false}
            cropAspectRatio={3 / 4}
            layout="dynamic"
            size="default"
            gridCols={3}
            showEmptySlots={true}
            className=""
          />
        )}


        {/* Error global de imágenes del formulario */}
        {(errors.images || errors.profileImage) && (
          <div className="text-center">
            <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 inline-block">
              {errors.images?.message || errors.profileImage?.message}
            </p>
          </div>
        )}

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
