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
                    <img
                      alt={`Bandera de ${derivedData.phoneCountryData.name}`}
                      className='w-5 h-5 rounded-full object-cover'
                      src={derivedData.phoneCountryData.image}
                    />
                  )
                }
                variant='underlined'
                onSelectionChange={field.onChange}>
                {country => (
                  <AutocompleteItem
                    key={country.phone}
                    className={country.priority && 'bg-blue-500/10'}
                    textValue={`${country.phone} ${country.name}`}>
                    <div className='flex items-center gap-2'>
                      <img alt={`Bandera de ${country.name}`} className='w-5 h-5 rounded-full object-cover' src={country.image} />
                      <span className='font-medium'>{country.phone}</span>
                      <span className='text-gray-400 ml-1'>{country.name}</span>
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
    ),
    [control, errors, formattedCountries, derivedData.phoneCountryData, phoneCode, formValues.phone]
  )

  // ========================================
  // Render principal
  // ========================================
  return (
    <div className='space-y-4 md:space-y-6 px-2 md:px-0'>
      {/* Sección de imágenes */}
      <section aria-labelledby='images-section' className='space-y-4 md:space-y-6'>
        {!hasInitialized ? (
          <div className='text-center py-8'>
            <p className='text-blue-400 text-sm'>Cargando imágenes...</p>
          </div>
        ) : (
          <ImageManager
            ref={imageManagerRef}
            className=''
            cropAspectRatio={3 / 4}
            enableCrop={true}
            enablePreview={false}
            enableReorder={true}
            gridCols={3}
            images={persistentFileObjects}
            layout='dynamic'
            maxImages={MAX_IMAGES}
            required={true}
            showEmptySlots={true}
            size='default'
            onImagesChange={handleImagesChange}
            onValidationChange={handleImageValidationChange}
          />
        )}

        {/* Error global de imágenes del formulario */}
        {(errors.images || errors.profileImage) && (
          <div className='text-center'>
            <p className='text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 inline-block'>
              {errors.images?.message || errors.profileImage?.message}
            </p>
          </div>
        )}

        {/* Tips para fotos */}
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
          <Controller
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                aria-label='Nombres'
                autoComplete='given-name'
                errorMessage={errors.name?.message}
                id='first-name'
                isInvalid={!!errors.name}
                label='Nombre(s)'
                placeholder='Tus nombre(s)'
                type='text'
                variant='underlined'
              />
            )}
          />

          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                aria-label='Apellidos'
                autoComplete='family-name'
                errorMessage={errors.lastName?.message}
                id='last-name'
                isInvalid={!!errors.lastName}
                label='Apellidos'
                placeholder='Tus apellidos'
                type='text'
                variant='underlined'
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name='document'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              aria-label='Documento de identidad'
              autoComplete='off'
              errorMessage={errors.document?.message}
              id='document-id'
              isInvalid={!!errors.document}
              label='Documento de identidad'
              placeholder='Número de documento'
              type='text'
              variant='underlined'
            />
          )}
        />

        <Controller
          control={control}
          name='dateOfBirth'
          render={({ field }) => (
            <DatePicker
              showMonthAndYearPickers
              aria-label='Fecha de nacimiento'
              description='Debes ser mayor de 18 años'
              errorMessage={errors.dateOfBirth?.message}
              granularity='day'
              id='birth-date'
              isInvalid={!!errors.dateOfBirth}
              maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
              placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
              value={field.value ? getParsedDate(field.value) : null}
              onChange={date => {
                const formattedDate = date ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : ''

                field.onChange(formattedDate)
              }}
            />
          )}
        />
      </section>

      {/* Contacto */}
      <section aria-labelledby='contact-section' className='space-y-4'>
        <h2 className='sr-only' id='contact-section'>
          Información de contacto
        </h2>
        {renderPhoneSection}
      </section>

      {/* Ubicación */}
      <section aria-labelledby='location-section' className='space-y-4'>
        <h2 className='sr-only' id='location-section'>
          Información de ubicación
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='country'
            render={({ field }) => (
              <Autocomplete
                isRequired
                defaultItems={formattedCountries}
                errorMessage={errors.country?.message}
                inputProps={{
                  id: 'country-select',
                  name: 'country',
                  'aria-label': 'Seleccionar país',
                  autoComplete: 'country-name'
                }}
                isInvalid={!!errors.country}
                label='País'
                placeholder='Buscar tu país...'
                selectedKey={field.value}
                startContent={
                  field.value && (
                    <img
                      alt={`Bandera de ${derivedData.locationCountryData.name}`}
                      className='w-5 h-5 rounded-full object-cover'
                      src={derivedData.locationCountryData.image}
                    />
                  )
                }
                variant='underlined'
                onSelectionChange={key => {
                  field.onChange(key)
                  if (key) {
                    locationHandlers.handleCountryChange(key)
                  }
                }}>
                {country => (
                  <AutocompleteItem key={country.name} className={country.priority && 'bg-blue-500/10'} textValue={country.name}>
                    <div className='flex items-center gap-2'>
                      <img alt={`Bandera de ${country.name}`} className='w-5 h-5 rounded-full object-cover' src={country.image} />
                      <span className={country.priority ? 'font-semibold' : ''}>{country.name}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />

          {country && (
            <Controller
              control={control}
              name='city'
              render={({ field }) => (
                <Autocomplete
                  isRequired
                  defaultItems={formattedCities}
                  errorMessage={errors.city?.message}
                  inputProps={{
                    id: 'city-select',
                    name: 'city',
                    'aria-label': 'Seleccionar ciudad',
                    autoComplete: 'address-level2'
                  }}
                  isInvalid={!!errors.city}
                  label='Ciudad'
                  placeholder='Buscar tu ciudad...'
                  selectedKey={field.value}
                  variant='underlined'
                  onSelectionChange={key => {
                    field.onChange(key)
                    if (key) {
                      locationHandlers.handleCityChange(key)
                    }
                  }}>
                  {city => (
                    <AutocompleteItem key={city.name} className={city.priority && 'bg-blue-500/10'} textValue={city.name}>
                      <span className={city.priority ? 'font-semibold' : ''}>{city.name}</span>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          )}
        </div>

        {derivedData.shouldShowLocalities && (
          <div className='space-y-4'>
            <div className='bg-gray-700/20 px-3 py-2 rounded-lg' role='status'>
              <span className='text-xs text-gray-400'>
                Como seleccionaste {city}, puedes especificar tu localidad para mejorar tus conexiones.
              </span>
            </div>

            <Controller
              control={control}
              name='locality'
              render={({ field }) => (
                <Autocomplete
                  defaultItems={formattedLocalities}
                  inputProps={{
                    id: 'locality-select',
                    name: 'locality',
                    'aria-label': 'Seleccionar localidad (opcional)',
                    autoComplete: 'address-level3'
                  }}
                  label='Localidad (opcional)'
                  placeholder='Buscar localidad...'
                  selectedKey={field.value || ''}
                  variant='underlined'
                  onSelectionChange={key => field.onChange(key || '')}>
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
