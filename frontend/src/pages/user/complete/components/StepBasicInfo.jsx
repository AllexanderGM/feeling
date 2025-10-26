import { forwardRef, useImperativeHandle } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Accordion, AccordionItem } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Controller } from 'react-hook-form'
import { Camera } from 'lucide-react'
import ImageManager from '@components/ui/imageManager/ImageManager'

import { useStepBasicInfo } from '../hooks/useStepBasicInfo'

const PHOTO_TIPS = [
  { label: 'Foto principal', tip: 'Rostro visible, sonriendo - aumenta 40% más interacciones' },
  { label: 'Variedad', tip: 'Incluye fotos de cuerpo completo y haciendo actividades' },
  { label: 'Calidad', tip: 'Fotos nítidas con buena iluminación natural' },
  { label: 'Autenticidad', tip: 'Evita fotos grupales o con lentes de sol en todas' }
]

const StepBasicInfo = forwardRef(({ onStepComplete }, ref) => {
  const {
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
    formValuesPhone,
    country,
    city
  } = useStepBasicInfo({ onStepComplete })

  // Exponer método submit al componente padre
  useImperativeHandle(ref, () => ({
    submit: handleFormSubmit
  }))

  return (
    <div className='space-y-4 md:space-y-6 px-2 md:px-0'>
      {/* Sección de Imágenes */}
      <section className='space-y-4 md:space-y-6'>
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
            cropAspectRatio={3 / 4}
            enablePreview={false}
            gridCols={3}
            images={persistentFileObjects}
            layout='dynamic'
            maxImages={5}
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
            classNames={{
              trigger: 'p-1',
              base: 'bg-blue-500/10 border border-blue-500/20',
              title: 'text-blue-400 text-sm',
              content: 'text-sm'
            }}
            startContent={<Camera className='text-blue-400 text-xl pt-1' />}
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

      {/* Información Personal */}
      <section className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                autoComplete='given-name'
                errorMessage={formErrors.name?.message}
                isInvalid={!!formErrors.name}
                label='Nombre(s)'
                placeholder='Tus nombre(s)'
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
                autoComplete='family-name'
                errorMessage={formErrors.lastName?.message}
                isInvalid={!!formErrors.lastName}
                label='Apellidos'
                placeholder='Tus apellidos'
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
              autoComplete='off'
              errorMessage={formErrors.document?.message}
              isInvalid={!!formErrors.document}
              label='Documento de identidad'
              placeholder='Número de documento'
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
              description='Debes ser mayor de 18 años'
              errorMessage={formErrors.dateOfBirth?.message}
              granularity='day'
              isInvalid={!!formErrors.dateOfBirth}
              label='Fecha de nacimiento'
              maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
              placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
              value={field.value ? getParsedDate(field.value) : null}
              variant='bordered'
              onChange={field.onChange}
            />
          )}
        />
      </section>

      {/* Información de Contacto */}
      <section className='space-y-4'>
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
                  autoComplete='tel-national'
                  errorMessage={formErrors.phone?.message}
                  isInvalid={!!formErrors.phone}
                  label='Número de teléfono'
                  placeholder='123 456 789'
                  type='tel'
                  variant='underlined'
                  onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              )}
            />
          </div>

          {phoneCode && formValuesPhone && (
            <div className='bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2'>
              <span className='text-xs text-gray-400'>Número completo:</span>
              <span className='text-xs text-gray-300 font-mono'>
                {phoneCode} {formValuesPhone}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Información de Ubicación */}
      <section className='space-y-4'>
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
                  if (key) locationHandlers.handleCountryChange(key)
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
                    autoComplete: 'address-level2'
                  }}
                  isInvalid={!!formErrors.city}
                  label='Ciudad'
                  placeholder='Buscar tu ciudad...'
                  selectedKey={field.value}
                  variant='underlined'
                  onSelectionChange={key => {
                    field.onChange(key)
                    if (key) locationHandlers.handleCityChange(key)
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
            <div className='bg-gray-700/20 px-3 py-2 rounded-lg'>
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
    </div>
  )
})

StepBasicInfo.displayName = 'StepBasicInfo'

export default StepBasicInfo
