import { useState, useRef, useEffect } from 'react'
import { Input, DatePicker, Avatar, Select, SelectItem, Chip } from '@heroui/react'
import { today, getLocalTimeZone, parseDate } from '@internationalized/date'

const Step1BasicInfo = ({
  formData,
  errors,
  isDragging,
  isDraggingAdditional,
  handleInputChange,
  handleDateChange,
  handleFileChange,
  handleAdditionalFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleAdditionalDragOver,
  handleAdditionalDragLeave,
  handleAdditionalDrop,
  removeImageAtPosition,
  swapImages,
  getImageStatus,
  getImageUrlByPosition,
  getSelectedCountryFlag,
  availableCountries = []
}) => {
  const fileInputRef = useRef(null)
  const additionalFileInputRefs = useRef([])

  // Estados para animaciones
  const [swappingImages, setSwappingImages] = useState(false)
  const [imageAnimations, setImageAnimations] = useState({})

  // Función para convertir string de fecha a CalendarDate
  const getDateValue = () => {
    if (!formData.birthDate) return null

    if (formData.birthDate && typeof formData.birthDate === 'object' && 'year' in formData.birthDate) {
      return formData.birthDate
    }

    if (typeof formData.birthDate === 'string') {
      try {
        return parseDate(formData.birthDate)
      } catch (error) {
        console.warn('Error parsing date:', error)
        return null
      }
    }

    return null
  }

  // Función para manejar el cambio de país en el select
  const handleCountryChange = selection => {
    const countryCode = Array.from(selection)[0]
    const country = availableCountries.find(c => c.code === countryCode)
    if (country) {
      handleInputChange('selectedCountryCode', countryCode)
      handleInputChange('selectedPhoneCode', country.phone_code)
    }
  }

  // Función para manejar el intercambio con animación
  const handleSwapWithAnimation = async selectedIndex => {
    setSwappingImages(true)

    // Agregar animación de salida
    setImageAnimations({
      main: 'animate-pulse',
      [selectedIndex]: 'animate-pulse'
    })

    // Esperar un poco para la animación
    await new Promise(resolve => setTimeout(resolve, 200))

    // Hacer el intercambio
    swapImages(selectedIndex)

    // Agregar animación de entrada
    setImageAnimations({
      main: 'animate-in fade-in zoom-in-95',
      [selectedIndex]: 'animate-in fade-in zoom-in-95'
    })

    // Limpiar animaciones
    setTimeout(() => {
      setImageAnimations({})
      setSwappingImages(false)
    }, 500)
  }

  // Función para obtener clases CSS de una imagen
  const getImageClasses = position => {
    const status = getImageStatus(position)
    const animation = imageAnimations[position === 0 ? 'main' : position] || ''

    let classes = `relative cursor-pointer transition-all duration-300 ${animation}`

    if (position === 0) {
      // Imagen principal
      classes += ` w-36 h-36 rounded-full border-4 ${status.isSelected ? 'border-primary-500' : 'border-gray-600'}`
      if (isDragging) classes += ' border-primary-400 scale-105'
    } else {
      // Imágenes adicionales
      classes += ` w-full aspect-square rounded-lg border-2 border-dashed ${status.isSelected ? 'border-primary-500' : 'border-gray-600'}`
      if (isDraggingAdditional[position - 1]) classes += ' border-primary-400 scale-105'
    }

    return classes
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-200">Completa tu perfil</h2>
        <p className="text-gray-400 mt-2">Ayúdanos a conocerte mejor para mejorar tu experiencia</p>
      </div>

      {/* Foto principal con animación mejorada */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-gray-400 ">Foto de perfil (obligatoria)</p>
          <p className="text-gray-500 text-xs mt-1">Arrastra una imagen o haz clic para seleccionar</p>
        </div>

        <div className="relative">
          <div
            className={getImageClasses(0)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}>
            {formData.profileImageUrl ? (
              <Avatar src={formData.profileImageUrl} className="w-full h-full object-cover" showFallback />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-700/50 flex flex-col items-center justify-center text-gray-400">
                <div className="text-3xl mb-2">{isDragging ? '📤' : '📷'}</div>
                <div className="text-xs text-center px-2">{isDragging ? 'Soltar aquí' : 'Foto principal'}</div>
              </div>
            )}

            {/* Botón de eliminar mejorado */}
            {formData.profileImageUrl && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  removeImageAtPosition(0)
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-lg">
                ✕
              </button>
            )}
          </div>
        </div>

        {errors.profileImage && <p className="text-red-500 text-sm text-center">{errors.profileImage}</p>}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Fotos adicionales mejoradas */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-gray-400 mb-2">Fotos adicionales (opcionales)</h4>
          <p className="text-gray-400 text-xs">Puedes agregar hasta 4 fotos más</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-evenly">
          {[1, 2, 3, 4].map(position => {
            const additionalIndex = position - 1
            const status = getImageStatus(position)
            const imageUrl = getImageUrlByPosition(position)

            return (
              <div key={position} className=" w-32 flex flex-col items-center space-y-2">
                <div className="relative group w-full">
                  <div
                    className={getImageClasses(position)}
                    onDragOver={e => handleAdditionalDragOver(additionalIndex, e)}
                    onDragLeave={e => handleAdditionalDragLeave(additionalIndex, e)}
                    onDrop={e => handleAdditionalDrop(additionalIndex, e)}
                    onClick={() => additionalFileInputRefs.current[additionalIndex]?.click()}>
                    {imageUrl ? (
                      <Avatar src={imageUrl} className="w-full h-full object-cover rounded-lg" showFallback />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gray-700/50 flex flex-col items-center justify-center text-gray-400">
                        <div className="text-2xl mb-1">{isDraggingAdditional[additionalIndex] ? '📤' : '📷'}</div>
                        <div className="text-xs text-center px-1">
                          {isDraggingAdditional[additionalIndex] ? 'Soltar' : `Foto ${position + 1}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón de eliminar */}
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        removeImageAtPosition(position)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100">
                      ✕
                    </button>
                  )}

                  {/* Botón para convertir en principal */}
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        handleSwapWithAnimation(position)
                      }}
                      disabled={swappingImages}
                      className="absolute -bottom-2 -left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-600 transition-all duration-200 hover:scale-110 shadow-lg disabled:opacity-50">
                      <Chip
                        color="secondary"
                        startContent={<span className="material-symbols-outlined text-xs">kid_star</span>}
                        variant="faded">
                        Volver principal
                      </Chip>
                    </button>
                  )}

                  {/* Indicador de carga */}
                  {swappingImages && (imageUrl || position === 0) && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <input
                  ref={el => (additionalFileInputRefs.current[additionalIndex] = el)}
                  type="file"
                  accept="image/*"
                  onChange={e => handleAdditionalFileChange(additionalIndex, e)}
                  className="hidden"
                />
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs mt-1">
            Toca la estrella <span className="material-symbols-outlined text-xs text-secondary">kid_star</span> para convertir cualquier
            foto en tu imagen principal
          </p>
        </div>
      </div>

      {/* Documento de identidad */}
      <Input
        variant="underlined"
        isRequired
        label="Documento de identidad"
        placeholder="Número de documento"
        value={formData.document}
        onChange={e => handleInputChange('document', e.target.value)}
        isInvalid={!!errors.document}
        errorMessage={errors.document}
      />

      {/* Teléfono con selector de país */}
      <div className="space-y-2">
        <div className="flex gap-3">
          {/* Selector de país con bandera */}
          <Select
            isRequired
            label="Código de país"
            aria-label="Código de país"
            variant="underlined"
            items={availableCountries}
            startContent={<span className="text-lg">{getSelectedCountryFlag(formData.selectedCountryCode)}</span>}
            selectedKeys={formData.selectedCountryCode ? [formData.selectedCountryCode] : []}
            onSelectionChange={handleCountryChange}>
            {country => (
              <SelectItem key={country.code} value={country.code} textValue={`${country.name} ${country.phone_code}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.emoji}</span>
                  <div className="flex gap-2">
                    <span className="text-gray-400">{country.phone_code}</span>
                    <span className="text-white">{country.name}</span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          {/* Campo del número */}
          <Input
            isRequired
            label="Número de teléfono"
            variant="underlined"
            placeholder="Ej: 123 456 789"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
            isInvalid={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber}
          />
        </div>

        {/* Vista previa del teléfono completo */}
        {formData.selectedPhoneCode && formData.phoneNumber && (
          <div className="bg-gray-700/30 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Teléfono completo:</p>
            <p className="text-white font-medium">
              {formData.selectedPhoneCode} {formData.phoneNumber}
            </p>
          </div>
        )}
      </div>

      {/* Fecha de nacimiento */}
      <DatePicker
        variant="underlined"
        isRequired
        label="Fecha de nacimiento"
        value={getDateValue()}
        onChange={handleDateChange}
        isInvalid={!!errors.birthDate}
        errorMessage={errors.birthDate}
        maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
        showMonthAndYearPickers
        granularity="day"
        className="text-white"
        placeholderValue={today(getLocalTimeZone()).subtract({ years: 25 })}
        description="Debes ser mayor de 18 años"
      />

      {/* Información adicional */}
      <div className="bg-gray-700/20 p-4 rounded-lg border border-gray-600/50">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined">info</span>
          Información importante
        </h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Tu foto principal será la primera imagen que vean otros usuarios</li>
          <li>• Puedes cambiar tu imagen principal en cualquier momento</li>
          <li>• Todas las imágenes deben ser menores a 5MB</li>
          <li>• Tu información será verificada antes de activar tu perfil</li>
        </ul>
      </div>
    </div>
  )
}

export default Step1BasicInfo
