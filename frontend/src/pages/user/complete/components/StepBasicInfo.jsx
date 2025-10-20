import { useMemo, memo } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Accordion, AccordionItem, Button } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Controller } from 'react-hook-form'
import { Camera } from 'lucide-react'
import ImageManager from '@components/ui/imageManager/ImageManager'

import { useStepBasicInfo } from '../hooks/useStepBasicInfo'

const MAX_IMAGES = 5
const PHOTO_TIPS = [
  { label: 'Foto principal', tip: 'Rostro visible, sonriendo - aumenta 40% más interacciones' },
  { label: 'Variedad', tip: 'Incluye fotos de cuerpo completo y haciendo actividades' },
  { label: 'Calidad', tip: 'Fotos nítidas con buena iluminación natural' },
  { label: 'Autenticidad', tip: 'Evita fotos grupales o con lentes de sol en todas' }
]

const StepBasicInfo = ({ onStepComplete, onStepBack, isFirstStep = true, isLastStep = false, ...hookOptions }) => {
  const {
    control,
    formErrors,
    formattedCountries = [],
    formattedCities = [],
    formattedLocalities = [],
    locationHandlers,
    derivedData,
    persistentFileObjects,
    hasInitialized,
    handleImagesChange,
    handleImageValidationChange,
    getParsedDate,
    handleFormSubmit,
    isSaving,
    isStandalone,
    imageManagerRef,
    phoneCode,
    formValuesPhone,
    country,
    city
  } = useStepBasicInfo({ ...hookOptions, onStepComplete })

  const containerProps = {
    className: 'space-y-4 md:space-y-6 px-2 md:px-0'
  }

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
                errorMessage={formErrors.phoneCode?.message}
                inputProps={{
                  id: 'phone-code-select',
                  name: 'phoneCode',
                  'aria-label': 'Seleccionar código de país para teléfono',
                  autoComplete: 'tel-country-code'
                }}
                isInvalid={!!formErrors.phoneCode}
                label='Código de teléfono'
                selectedKey={field.value}
                startContent={
                  field.value &&
                  derivedData.phoneCountryData.image && (
                    <img
                      alt={`Bandera de ${derivedData.phoneCountryData.name}`}
                      className='w-5 h-5 rounded-full object-cover'
                      src={derivedData.phoneCountryData.image}
                    />
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
                errorMessage={formErrors.phone?.message}
                id='phone-number'
                isInvalid={!!formErrors.phone}
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

        {phoneCode && formValuesPhone && (
          <div className='bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2' role='status'>
            <span className='text-xs text-gray-400'>Número completo:</span>
            <span className='text-xs text-gray-300 font-mono'>
              {phoneCode} {formValuesPhone}
            </span>
          </div>
        )}
      </div>
    ),
    [control, formErrors, formattedCountries, derivedData.phoneCountryData, phoneCode, formValuesPhone]
  )

  const sharedContent = (
    <>
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

        {(formErrors.images || formErrors.profileImage) && (
          <div className='text-center'>
            <p className='text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 inline-block'>
              {formErrors.images?.message || formErrors.profileImage?.message}
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
                errorMessage={formErrors.name?.message}
                id='first-name'
                isInvalid={!!formErrors.name}
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
                errorMessage={formErrors.lastName?.message}
                id='last-name'
                isInvalid={!!formErrors.lastName}
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
              errorMessage={formErrors.document?.message}
              id='document-id'
              isInvalid={!!formErrors.document}
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
              errorMessage={formErrors.dateOfBirth?.message}
              granularity='day'
              id='birth-date'
              isInvalid={!!formErrors.dateOfBirth}
              maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
              placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
              value={field.value ? getParsedDate(field.value) : null}
              variant='bordered'
              onChange={field.onChange}
            />
          )}
        />
      </section>

      <section aria-labelledby='contact-section' className='space-y-4'>
        <h2 className='sr-only' id='contact-section'>
          Información de contacto
        </h2>
        {renderPhoneSection}
      </section>

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
                errorMessage={formErrors.country?.message}
                inputProps={{
                  id: 'country-select',
                  name: 'country',
                  'aria-label': 'Seleccionar país',
                  autoComplete: 'country-name'
                }}
                isInvalid={!!formErrors.country}
                label='País'
                placeholder='Buscar tu país...'
                selectedKey={field.value}
                startContent={
                  field.value &&
                  derivedData.locationCountryData.image && (
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
                {countryItem => (
                  <AutocompleteItem
                    key={countryItem.name}
                    className={countryItem.priority && 'bg-blue-500/10'}
                    textValue={countryItem.name}>
                    <div className='flex items-center gap-2'>
                      <img alt={`Bandera de ${countryItem.name}`} className='w-5 h-5 rounded-full object-cover' src={countryItem.image} />
                      <span className={countryItem.priority ? 'font-semibold' : ''}>{countryItem.name}</span>
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
                  errorMessage={formErrors.city?.message}
                  inputProps={{
                    id: 'city-select',
                    name: 'city',
                    'aria-label': 'Seleccionar ciudad',
                    autoComplete: 'address-level2'
                  }}
                  isInvalid={!!formErrors.city}
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
                  {cityItem => (
                    <AutocompleteItem key={cityItem.name} className={cityItem.priority && 'bg-blue-500/10'} textValue={cityItem.name}>
                      <span className={cityItem.priority ? 'font-semibold' : ''}>{cityItem.name}</span>
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
                  {localityItem => (
                    <AutocompleteItem key={localityItem.name} textValue={localityItem.name}>
                      {localityItem.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          </div>
        )}
      </section>
    </>
  )

  return isStandalone ? (
    <form {...containerProps} onSubmit={handleFormSubmit}>
      {sharedContent}

      <div className='flex justify-between items-center pt-6'>
        {!isFirstStep ? (
          <Button variant='bordered' onPress={onStepBack}>
            Anterior
          </Button>
        ) : (
          <span />
        )}

        <Button color='primary' isLoading={isSaving} type='submit'>
          {isLastStep ? 'Finalizar' : 'Continuar'}
        </Button>
      </div>
    </form>
  ) : (
    <div {...containerProps}>{sharedContent}</div>
  )
}

export default memo(StepBasicInfo)
