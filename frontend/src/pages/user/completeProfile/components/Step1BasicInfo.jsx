import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Input, DatePicker, Autocomplete, AutocompleteItem, Chip, Accordion, AccordionItem } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import useGeographicData from '@hooks/useGeographicData'

import useImageManager from '../hooks/useImageManager.js'

const MAX_IMAGES = 5
const MAIN_IMAGE_POSITION = 0
const PHOTO_TIPS = [
  { label: 'Foto principal', tip: 'Rostro visible, sonriendo - aumenta 40% más interacciones' },
  { label: 'Variedad', tip: 'Incluye fotos de cuerpo completo y haciendo actividades' },
  { label: 'Calidad', tip: 'Fotos nítidas con buena iluminación natural' },
  { label: 'Autenticidad', tip: 'Evita fotos grupales o con lentes de sol en todas' }
]

const Step1BasicInfo = ({ user, formData, errors, updateFormData, updateErrors, updateMultipleFields }) => {
  const fileInputRefs = useRef({})
  const [animatingPositions, setAnimatingPositions] = useState(new Set())
  const { images, name, lastName, document, phone, phoneCode, country, city } = formData

  // Hooks personalizados
  const imageManager = useImageManager()
  const geographic = useGeographicData({
    loadAll: true,
    defaultCountry: country,
    defaultCity: city
  })

  const {
    formattedCountries,
    formattedCities,
    formattedLocalities,
    loadingCities,
    loadingLocalities,
    loadLocalitiesByCity,
    loadCitiesByCountry
  } = geographic

  // ============= HELPERS =============

  // Normalizar array de imágenes
  const normalizeImages = useCallback(() => {
    const normalizedImages = [...(images || [])]
    while (normalizedImages.length < MAX_IMAGES) normalizedImages.push(null)
    return normalizedImages.slice(0, MAX_IMAGES)
  }, [images])

  // Determinar si mostrar localidades
  const shouldShowLocalities = useCallback(() => {
    return formData.city && formattedLocalities.length > 0
  }, [formData.city, formattedLocalities])

  // Estadísticas de imágenes
  const imageStats = useMemo(() => {
    const images = normalizeImages()
    const valid = images.filter(img => img !== null)
    return {
      total: valid.length,
      remaining: MAX_IMAGES - valid.length
    }
  }, [normalizeImages])

  // Obtener clave de error para posición de imagen
  const getImageErrorKey = position => {
    return position === MAIN_IMAGE_POSITION ? 'profileImage' : `image${position}`
  }

  // ============= DATOS DE PAÍS/TELÉFONO =============

  // Datos del país para selector de teléfono
  const getPhoneCountryData = useCallback(
    (phone = phoneCode) => {
      const country = formattedCountries.find(c => c.phone === phone)
      return {
        flag: country?.image || '🌍',
        name: country?.name || 'Sin país',
        phone: country?.phone || ''
      }
    },
    [formattedCountries, phoneCode]
  )

  // Datos del país para selector de ubicación
  const getCountryData = useCallback(
    (countryName = country) => {
      const countryData = formattedCountries.find(c => c.name === countryName)
      return {
        flag: countryData?.image || '🌍',
        name: countryData?.name || 'Sin país'
      }
    },
    [formattedCountries, country]
  )

  // ============= MANEJADORES DE EVENTOS =============

  // Manejador de fecha
  const handleDateChange = useCallback(
    date => {
      const formattedDate = date ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : null
      updateFormData('birthDate', formattedDate)
    },
    [updateFormData]
  )

  // Manejador de país para teléfono
  const handlePhoneCountryChange = useCallback(
    key => {
      if (key) updateFormData('phoneCode', key)
    },
    [updateFormData]
  )

  // Manejador de país para ubicación
  const handleCountryChange = useCallback(
    key => {
      if (!key) return

      updateMultipleFields({
        country: key,
        city: '',
        locality: ''
      })
      loadCitiesByCountry(key)
    },
    [updateMultipleFields, loadCitiesByCountry]
  )

  // Manejador de ciudad
  const handleCityChangeSelect = useCallback(
    key => {
      if (!key) return

      updateMultipleFields({
        city: key,
        locality: ''
      })
      loadLocalitiesByCity(key)
    },
    [updateMultipleFields, loadLocalitiesByCity]
  )

  // ============= MANEJADORES DE IMÁGENES =============

  // Manejador de archivo
  const handleFileChange = useCallback(
    async (position, event) => {
      const file = event.target.files[0]
      if (!file) return

      const result = await imageManager.processImageFile(file, position)
      const errorKey = getImageErrorKey(position)

      if (result.success) {
        const images = normalizeImages()
        images[position] = result.file
        updateFormData('images', images)

        // Limpiar error si existe
        if (errors[errorKey]) {
          updateErrors({ ...errors, [errorKey]: null })
        }
      } else {
        // Mostrar error
        updateErrors({ ...errors, [errorKey]: result.error })

        // Limpiar input
        if (fileInputRefs.current[position]) {
          fileInputRefs.current[position].value = ''
        }
      }
    },
    [imageManager, normalizeImages, updateFormData, errors, updateErrors]
  )

  // Manejador de drop
  const handleImageDrop = useCallback(
    async (position, e) => {
      const result = await imageManager.handleDrop(position, e)
      const errorKey = getImageErrorKey(position)

      if (result.success) {
        const images = normalizeImages()
        images[position] = result.file
        updateFormData('images', images)

        if (errors[errorKey]) {
          updateErrors({ ...errors, [errorKey]: null })
        }
      } else {
        updateErrors({ ...errors, [errorKey]: result.error })
      }
    },
    [imageManager, normalizeImages, updateFormData, errors, updateErrors]
  )

  // Intercambiar imagen con principal
  const handleSwapToMain = useCallback(
    async position => {
      if (position === MAIN_IMAGE_POSITION || animatingPositions.size > 0) return

      setAnimatingPositions(new Set([MAIN_IMAGE_POSITION, position]))

      await new Promise(resolve => setTimeout(resolve, 200))

      const images = normalizeImages()
      const newImages = imageManager.swapImages(images, MAIN_IMAGE_POSITION, position)
      updateFormData('images', newImages)

      setTimeout(() => setAnimatingPositions(new Set()), 500)
    },
    [animatingPositions, normalizeImages, imageManager, updateFormData]
  )

  // Eliminar imagen
  const handleRemoveImage = useCallback(
    (position, e) => {
      e.stopPropagation()

      const images = normalizeImages()
      const newImages = imageManager.removeImage(images, position)
      updateFormData('images', newImages)

      // Limpiar error e input
      const errorKey = getImageErrorKey(position)
      if (errors[errorKey]) {
        updateErrors({ ...errors, [errorKey]: null })
      }

      if (fileInputRefs.current[position]) {
        fileInputRefs.current[position].value = ''
      }
    },
    [normalizeImages, imageManager, updateFormData, errors, updateErrors]
  )

  // ============= EFECTOS =============

  // Cleanup de URLs al desmontar
  useEffect(() => {
    return () => {
      const images = normalizeImages()
      imageManager.cleanupImageUrls(images)
    }
  }, [imageManager, normalizeImages])

  // ============= COMPONENTES DE RENDERIZADO =============

  // Renderizar slot de imagen
  const renderImageSlot = position => {
    const images = normalizeImages()
    const image = images[position]
    const imageUrl = imageManager.getImageUrl(image)
    const hasImage = !!imageUrl
    const errorKey = getImageErrorKey(position)
    const error = errors[errorKey]
    const isAnimating = animatingPositions.has(position)
    const isMainImage = position === MAIN_IMAGE_POSITION

    // Clases CSS
    const containerClasses = `
      relative cursor-pointer transition-all duration-300
      ${isMainImage ? 'w-36 h-36 rounded-full border-4' : 'w-32 h-32 rounded-lg border-2 border-dashed'}
      ${hasImage ? 'border-primary-500' : 'border-gray-600'}
      ${imageManager.isDragging[position] ? 'border-primary-400 scale-105' : ''}
      ${isAnimating ? 'animate-pulse' : ''}
    `

    const imageClasses = `
      w-full h-full object-cover
      ${isMainImage ? 'rounded-full' : 'rounded-lg'}
    `

    const placeholderClasses = `
      w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-700/30
      ${isMainImage ? 'rounded-full' : 'rounded-lg'}
    `

    return (
      <div key={position} className="flex flex-col items-center">
        <div className="relative group">
          <div
            className={containerClasses}
            onDragOver={e => imageManager.handleDragOver(position, e)}
            onDragLeave={e => imageManager.handleDragLeave(position, e)}
            onDrop={e => handleImageDrop(position, e)}
            onClick={() => fileInputRefs.current[position]?.click()}>
            {hasImage ? (
              <img
                src={imageUrl}
                alt={`Imagen ${isMainImage ? 'principal' : position}`}
                className={imageClasses}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            ) : (
              <div className={placeholderClasses}>
                <div className="text-3xl mb-2">{imageManager.isDragging[position] ? '📤' : '📷'}</div>
                <div className="text-xs text-center px-2">
                  {imageManager.isDragging[position] ? 'Soltar aquí' : isMainImage ? 'Foto principal' : `Foto ${position}`}
                </div>
              </div>
            )}

            {/* Botón eliminar */}
            {hasImage && (
              <button
                type="button"
                onClick={e => handleRemoveImage(position, e)}
                className={`
                  absolute bg-red-500 rounded-full flex items-center justify-center text-white
                  hover:bg-red-600 transition-all hover:scale-110 shadow-lg
                  ${isMainImage ? 'w-8 h-8 -top-1 -right-1' : 'w-6 h-6 -top-2 -right-2 opacity-0 group-hover:opacity-100'}
                `}>
                ✕
              </button>
            )}

            {/* Botón hacer principal */}
            {!isMainImage && hasImage && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleSwapToMain(position)
                }}
                disabled={animatingPositions.size > 0}
                className="absolute -bottom-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Chip
                  color="primary"
                  size="sm"
                  startContent={<span className="text-xs">⭐</span>}
                  variant="shadow"
                  className="cursor-pointer hover:scale-105 transition-transform">
                  Principal
                </Chip>
              </button>
            )}

            {/* Overlay de carga */}
            {isAnimating && (
              <div
                className={`
                absolute inset-0 bg-black/50 flex items-center justify-center
                ${isMainImage ? 'rounded-full' : 'rounded-lg'}
              `}>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Input oculto */}
          <input
            ref={el => (fileInputRefs.current[position] = el)}
            type="file"
            accept="image/*"
            onChange={e => handleFileChange(position, e)}
            className="hidden"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-xs mt-2 text-center max-w-[8rem]">{error}</p>}
      </div>
    )
  }

  // ============= RENDER PRINCIPAL =============

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200">Completa tu perfil</h2>
        <p className="text-gray-400 mt-2">{name} Ayúdanos a conocerte mejor</p>
        <p className="text-gray-500 text-xs text-center">
          Usuario asociado al correo: <span className="font-bold">{user.email}</span>
        </p>
      </div>

      {/* Sección de imágenes */}
      <section className="space-y-4">
        {/* Foto principal */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-300">Foto de perfil</p>
          {renderImageSlot(MAIN_IMAGE_POSITION)}
        </div>

        {/* Fotos adicionales */}
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-gray-300">Fotos adicionales</h4>
            <p className="text-gray-400 text-xs mt-1">{imageStats.total > 0 && `${imageStats.total} de ${MAX_IMAGES} fotos`}</p>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">{[1, 2, 3, 4].map(pos => renderImageSlot(pos))}</div>

          <p className="text-gray-500 text-xs text-center">Arrastra o haz clic para subir • JPG, PNG, WebP • Máx 5MB</p>
        </div>

        {/* Tips para fotos */}
        <Accordion variant="splitted" className="mt-6">
          <AccordionItem
            key="photo-tips"
            aria-label="Tips para mejores resultados"
            startContent={<span className="material-symbols-outlined text-blue-400 text-xl pt-1">photo_camera</span>}
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

      {/* Sección de información personal */}
      <section className="space-y-4">
        {/* Nombre y apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            variant="underlined"
            isRequired
            label="Nombre(s)"
            placeholder="Tus nombre(s)"
            value={name || ''}
            onChange={e => updateFormData('name', e.target.value)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            data-invalid={!!errors.name}
          />

          <Input
            variant="underlined"
            isRequired
            label="Apellidos"
            placeholder="Tus apellidos"
            value={lastName || ''}
            onChange={e => updateFormData('lastName', e.target.value)}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName}
            data-invalid={!!errors.lastName}
          />
        </div>

        {/* Documento */}
        <Input
          variant="underlined"
          isRequired
          label="Documento de identidad"
          placeholder="Número de documento"
          value={document || ''}
          onChange={e => updateFormData('document', e.target.value)}
          isInvalid={!!errors.document}
          errorMessage={errors.document}
          data-invalid={!!errors.document}
        />

        {/* Fecha de nacimiento */}
        <DatePicker
          variant="underlined"
          isRequired
          label="Fecha de nacimiento"
          onChange={handleDateChange}
          isInvalid={!!errors.birthDate}
          errorMessage={errors.birthDate}
          data-invalid={!!errors.birthDate}
          maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
          showMonthAndYearPickers
          granularity="day"
          placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
          description="Debes ser mayor de 18 años"
        />
      </section>

      {/* Sección de contacto */}
      <section className="space-y-4">
        {/* Teléfono */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              isRequired
              label="Código de teléfono"
              variant="underlined"
              selectedKey={phoneCode}
              defaultItems={formattedCountries}
              onSelectionChange={handlePhoneCountryChange}
              isInvalid={!!errors.phoneCode}
              errorMessage={errors.phoneCode}
              classNames={{
                base: 'max-w-full',
                listboxWrapper: 'max-h-96',
                popoverContent: 'w-96'
              }}
              startContent={
                phoneCode && (
                  <div className="flex items-center mr-3">
                    <img
                      className="w-5 h-5 rounded-full object-cover"
                      src={getPhoneCountryData(phoneCode).flag}
                      alt={getPhoneCountryData().name}
                    />
                    <span className="text-gray-400 text-sm">{phoneCode}</span>
                  </div>
                )
              }>
              {country => (
                <AutocompleteItem key={country.phone} className={country.priority && 'bg-blue-500/10'} textValue={`${country.name}`}>
                  <div className="flex items-center gap-2">
                    <img src={country.image} alt={country.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                    <span className="font-medium">{country.phone}</span>
                    <span className="text-gray-400 ml-1">{country.name}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Input
              isRequired
              label="Teléfono"
              variant="underlined"
              placeholder="123 456 789"
              value={phone || ''}
              onChange={e => updateFormData('phone', e.target.value.replace(/\D/g, ''))}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
              data-invalid={!!errors.phone}
            />
          </div>

          {phoneCode && phone && (
            <div className="bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2">
              <span className="text-xs text-gray-400">Número completo:</span>
              <span className="text-xs text-gray-300 font-mono">
                {phoneCode} {phone}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Sección de ubicación */}
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* País */}
            <Autocomplete
              variant="underlined"
              isRequired
              label="País"
              placeholder="Buscar tu país..."
              defaultItems={formattedCountries}
              selectedKey={country}
              onSelectionChange={handleCountryChange}
              isInvalid={!!errors.country}
              errorMessage={errors.country}
              startContent={
                country && (
                  <div className="flex items-center">
                    <img className="w-5 h-5 rounded-full object-cover" src={getCountryData().flag} alt={getCountryData().name} />
                  </div>
                )
              }>
              {country => (
                <AutocompleteItem
                  key={country.name}
                  value={country.name}
                  textValue={country.name}
                  className={country.priority && 'bg-blue-500/10'}
                  startContent={<img className="w-5 h-5 rounded-full object-cover flex-shrink-0" src={country.image} alt={country.name} />}>
                  <div className="flex items-center gap-2">
                    <span className={country.priority ? 'font-semibold' : ''}>{country.name}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Ciudad */}
            {country && (
              <Autocomplete
                variant="underlined"
                isRequired
                label="Ciudad"
                placeholder="Buscar tu ciudad..."
                defaultItems={formattedCities}
                selectedKey={city}
                onSelectionChange={handleCityChangeSelect}
                isInvalid={!!errors.city}
                errorMessage={errors.city}
                isLoading={loadingCities}>
                {city => (
                  <AutocompleteItem key={city.name} value={city.name} textValue={city.name} className={city.priority && 'bg-blue-500/10'}>
                    <div className="flex items-center gap-2">
                      <span className={city.priority ? 'font-semibold' : ''}>{city.name}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          </div>

          {/* Localidad */}
          {shouldShowLocalities() && (
            <div className="space-y-4">
              <div className="bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400">
                  Como seleccionaste {formData.city}, puedes especificar tu localidad para mejorar tus conexiones.
                </span>
              </div>

              <Autocomplete
                variant="underlined"
                label="Localidad (opcional)"
                placeholder="Buscar localidad..."
                defaultItems={formattedLocalities}
                selectedKey={formData.locality || ''}
                onSelectionChange={key => updateFormData('locality', key || '')}
                isLoading={loadingLocalities}>
                {locality => (
                  <AutocompleteItem key={locality.name} value={locality.name}>
                    {locality.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Step1BasicInfo
