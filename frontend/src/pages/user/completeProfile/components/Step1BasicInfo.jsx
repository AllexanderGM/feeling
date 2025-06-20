import { useState, useRef, useEffect, useCallback } from 'react'
import { Input, DatePicker, Select, SelectItem, Chip } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'

import useImageManager from '../hooks/useImageManager.js'

const Step1BasicInfo = ({ user, formData, errors, updateFormData, updateErrors, availableCountries = [] }) => {
  const imageManager = useImageManager()
  const fileInputRefs = useRef({})
  const [animatingPositions, setAnimatingPositions] = useState(new Set())

  // Estados del formulario
  const { name, lastName, document, phone, phoneCode } = formData

  // Configuración de validación de imágenes
  const IMAGE_VALIDATION_OPTIONS = {
    main: {
      minWidth: 150,
      minHeight: 150,
      maxSizeMB: 2
    },
    additional: {
      minWidth: 300,
      minHeight: 300,
      maxSizeMB: 5
    }
  }

  const normalizeImages = useCallback(() => {
    const images = [...(formData.images || [])]
    while (images.length < 5) images.push(null)
    return images.slice(0, 5)
  }, [formData.images])

  // Manejador de fecha simplificado
  const handleDateChange = date => {
    updateFormData('birthDate', date ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : null)
  }

  // Manejador de país
  const handleCountryChange = selection => {
    const code = Array.from(selection)[0]
    if (code) updateFormData('phoneCode', code)
  }

  // Obtener datos del país seleccionado
  const getCountryData = (code = phoneCode) => {
    const country = availableCountries.find(c => c.phone === code)
    return {
      flag: country?.image || '🌍',
      name: country?.name || 'Sin país'
    }
  }

  // Manejador de archivo mejorado
  const handleFileChange = async (position, event) => {
    const file = event.target.files[0]
    if (!file) return

    const options = position === 0 ? IMAGE_VALIDATION_OPTIONS.main : IMAGE_VALIDATION_OPTIONS.additional

    const result = await imageManager.processImageFile(file, position, options)

    if (result.success) {
      const images = normalizeImages()
      images[position] = result.file
      updateFormData('images', images)

      // Limpiar error
      const errorKey = position === 0 ? 'profileImage' : `image${position}`
      if (errors[errorKey]) {
        updateErrors({ ...errors, [errorKey]: null })
      }
    } else {
      // Mostrar error
      const errorKey = position === 0 ? 'profileImage' : `image${position}`
      updateErrors({ ...errors, [errorKey]: result.error })

      // Limpiar input
      if (fileInputRefs.current[position]) {
        fileInputRefs.current[position].value = ''
      }
    }
  }

  // Manejador de drop mejorado
  const handleImageDrop = async (position, e) => {
    const options = position === 0 ? IMAGE_VALIDATION_OPTIONS.main : IMAGE_VALIDATION_OPTIONS.additional

    const result = await imageManager.handleDrop(position, e, options)

    if (result.success) {
      const images = normalizeImages()
      images[position] = result.file
      updateFormData('images', images)

      // Limpiar error si existe
      const errorKey = position === 0 ? 'profileImage' : `image${position}`
      if (errors[errorKey]) {
        updateErrors({ ...errors, [errorKey]: null })
      }
    } else {
      const errorKey = position === 0 ? 'profileImage' : `image${position}`
      updateErrors({ ...errors, [errorKey]: result.error })
    }
  }

  // Intercambiar con animación
  const handleSwapToMain = async position => {
    if (position === 0 || animatingPositions.size > 0) return

    setAnimatingPositions(new Set([0, position]))

    await new Promise(resolve => setTimeout(resolve, 200))

    const images = normalizeImages()
    const newImages = imageManager.swapImages(images, 0, position)
    updateFormData('images', newImages)

    setTimeout(() => setAnimatingPositions(new Set()), 500)
  }

  // Eliminar imagen
  const handleRemoveImage = (position, e) => {
    e.stopPropagation()

    const images = normalizeImages()
    const newImages = imageManager.removeImage(images, position)
    updateFormData('images', newImages)

    // Limpiar error e input
    const errorKey = position === 0 ? 'profileImage' : `image${position}`
    if (errors[errorKey]) {
      updateErrors({ ...errors, [errorKey]: null })
    }

    if (fileInputRefs.current[position]) {
      fileInputRefs.current[position].value = ''
    }
  }

  // Cleanup de URLs al desmontar
  useEffect(() => {
    return () => {
      const images = normalizeImages()
      imageManager.cleanupImageUrls(images)
    }
  }, [imageManager, normalizeImages])

  // Renderizar slot de imagen CORREGIDO
  const renderImageSlot = position => {
    const images = normalizeImages()
    const image = images[position]
    const imageUrl = imageManager.getImageUrl(image)
    const hasImage = !!imageUrl
    const errorKey = position === 0 ? 'profileImage' : `image${position}`
    const error = errors[errorKey]
    const isAnimating = animatingPositions.has(position)

    return (
      <div key={position} className={position === 0 ? 'flex flex-col items-center' : 'flex flex-col items-center'}>
        <div className="relative group">
          <div
            className={`
              relative cursor-pointer transition-all duration-300
              ${position === 0 ? 'w-36 h-36 rounded-full border-4' : 'w-32 h-32 rounded-lg border-2 border-dashed'}
              ${hasImage ? 'border-primary-500' : 'border-gray-600'}
              ${imageManager.isDragging[position] ? 'border-primary-400 scale-105' : ''}
              ${isAnimating ? 'animate-pulse' : ''}
            `}
            onDragOver={e => imageManager.handleDragOver(position, e)}
            onDragLeave={e => imageManager.handleDragLeave(position, e)}
            onDrop={e => handleImageDrop(position, e)}
            onClick={() => fileInputRefs.current[position]?.click()}>
            {hasImage ? (
              // Imagen con estilos directos para evitar conflictos con Avatar
              <img
                src={imageUrl}
                alt={`Imagen ${position === 0 ? 'principal' : position}`}
                className={`
                  w-full h-full object-cover
                  ${position === 0 ? 'rounded-full' : 'rounded-lg'}
                `}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            ) : (
              <div
                className={`
                w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-700/30
                ${position === 0 ? 'rounded-full' : 'rounded-lg'}
              `}>
                <div className="text-3xl mb-2">{imageManager.isDragging[position] ? '📤' : '📷'}</div>
                <div className="text-xs text-center px-2">
                  {imageManager.isDragging[position] ? 'Soltar aquí' : position === 0 ? 'Foto principal' : `Foto ${position}`}
                </div>
              </div>
            )}

            {/* Botón eliminar */}
            {hasImage && (
              <button
                type="button"
                onClick={e => handleRemoveImage(position, e)}
                className={`
                  absolute
                  ${position === 0 ? 'w-8 h-8 -top-1 -right-1' : 'w-6 h-6 -top-2 -right-2'}
                  bg-red-500 rounded-full flex items-center justify-center text-white
                  hover:bg-red-600 transition-all hover:scale-110 shadow-lg
                  ${position === 0 ? '' : 'opacity-0 group-hover:opacity-100'}
                `}>
                ✕
              </button>
            )}

            {/* Botón hacer principal */}
            {position !== 0 && hasImage && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleSwapToMain(position)
                }}
                disabled={animatingPositions.size > 0}
                className="absolute -bottom-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Chip
                  color="secondary"
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
                  ${position === 0 ? 'rounded-full' : 'rounded-lg'}
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

  // Estadísticas de imágenes
  const imageStats = () => {
    const images = normalizeImages()
    const valid = images.filter(img => img !== null)
    return { total: valid.length, remaining: 5 - valid.length }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-200">Completa tu perfil</h2>
        <p className="text-gray-400 mt-2">{name} Ayúdanos a conocerte mejor</p>
        <p className="text-gray-500 text-xs text-center">
          Usuario asociado al correo: <span className="font-bold">{user.email}</span>{' '}
        </p>
      </div>

      {/* Foto principal */}
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-300">Foto de perfil</p>
        {renderImageSlot(0)}
      </div>

      {/* Fotos adicionales */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-gray-300">Fotos adicionales</h4>
          <p className="text-gray-400 text-xs mt-1">{imageStats().total > 0 && `${imageStats().total} de 5 fotos`}</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">{[1, 2, 3, 4].map(pos => renderImageSlot(pos))}</div>

        <p className="text-gray-500 text-xs text-center">Arrastra o haz clic para subir • JPG, PNG, WebP • Máx 5MB</p>
      </div>

      {/* Campos del formulario */}
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

      {/* Teléfono */}
      <div className="space-y-2">
        <div className="flex gap-3">
          <Select
            isRequired
            label="País"
            variant="underlined"
            selectedKeys={phoneCode ? [phoneCode] : []}
            onSelectionChange={handleCountryChange}
            startContent={
              <div className="flex items-center gap-2">
                <img className="w-5 h-5 rounded-full" src={getCountryData().flag} alt={getCountryData().name} />
                <span className="text-gray-400 pr-3">{phoneCode}</span>
              </div>
            }>
            {availableCountries.map(country => (
              <SelectItem key={country.phone} value={country.phone} textValue={`${country.name}`}>
                <div className="flex items-center gap-3">
                  <img src={country.image} alt={country.name} className="w-5 h-5 rounded-full" />
                  <span>{country.phone}</span>
                  <span className="text-gray-400">{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </Select>

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

      {/* Información sobre las imágenes */}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-blue-400">photo_camera</span>
          <div className="text-sm">
            <h4 className="text-blue-400 font-medium mb-2">Tips para mejores resultados</h4>
            <ul className="text-blue-300/80 space-y-1">
              <li>
                • <strong>Foto principal:</strong> Rostro visible, sonriendo - aumenta 40% más interacciones
              </li>
              <li>
                • <strong>Variedad:</strong> Incluye fotos de cuerpo completo y haciendo actividades
              </li>
              <li>
                • <strong>Calidad:</strong> Fotos nítidas con buena iluminación natural
              </li>
              <li>
                • <strong>Autenticidad:</strong> Evita fotos grupales o con lentes de sol en todas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1BasicInfo
