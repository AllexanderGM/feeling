import { useState, useRef, useEffect } from 'react'
import { Input, DatePicker, Avatar, Select, SelectItem } from '@heroui/react'

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
  removeImage,
  removeAdditionalImage,
  selectProfileImage,
  getSelectedCountryFlag,
  availableCountries = []
}) => {
  const fileInputRef = useRef(null)
  const additionalFileInputRefs = useRef([])

  // Efecto para animar el cambio de imagen principal
  const [imageKey, setImageKey] = useState(0)

  // Fix para aria-hidden y scroll bug de HeroUI
  useEffect(() => {
    return () => {
      // Limpiar aria-hidden y overflow al desmontar
      const root = document.getElementById('root')
      if (root) {
        root.removeAttribute('aria-hidden')
      }
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    setImageKey(prev => prev + 1)
  }, [formData.selectedProfileImageIndex])

  // Función para obtener la URL de la imagen principal actual
  const getCurrentProfileImageUrl = () => {
    if (formData.selectedProfileImageIndex === 0) {
      return formData.profileImageUrl
    }
    return formData.additionalImageUrls[formData.selectedProfileImageIndex - 1]
  }

  // Función para manejar el cambio de país
  const handleCountryChange = countryCode => {
    const country = availableCountries.find(c => c.code === countryCode)
    if (country) {
      handleInputChange('selectedCountryCode', countryCode)
      handleInputChange('selectedPhoneCode', country.phone_code)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-medium">Información básica</h3>

      {/* Foto principal con animación */}
      <div className="flex flex-col items-center space-y-4">
        <div key={imageKey} className="relative transform transition-all duration-500 ease-out animate-in fade-in-0 zoom-in-95">
          <div
            className={`relative cursor-pointer w-36 h-36 rounded-full border-4 ${
              formData.selectedProfileImageIndex === 0 ? 'border-primary-500' : 'border-gray-600'
            } transition-all duration-300 ${isDragging ? 'border-primary-400 scale-105' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}>
            {getCurrentProfileImageUrl() ? (
              <Avatar src={getCurrentProfileImageUrl()} className="w-full h-full object-cover" showFallback />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-700/50 flex flex-col items-center justify-center text-gray-400">
                <div className="text-3xl mb-2">{isDragging ? '📤' : '📷'}</div>
                <div className="text-xs text-center px-2">{isDragging ? 'Soltar aquí' : 'Foto principal'}</div>
              </div>
            )}

            {getCurrentProfileImageUrl() && formData.selectedProfileImageIndex === 0 && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors">
                ✕
              </button>
            )}

            {formData.selectedProfileImageIndex === 0 && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                ⭐
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Foto principal (obligatoria)
          <br />
          Arrastra una imagen o haz clic para seleccionar
        </p>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Fotos adicionales */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Fotos adicionales (opcionales)</h4>
        <p className="text-sm text-gray-400">Puedes agregar hasta 3 fotos más</p>

        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="relative">
              <div
                className={`relative cursor-pointer w-full aspect-square rounded-lg border-2 border-dashed ${
                  formData.selectedProfileImageIndex === index + 1 ? 'border-primary-500' : 'border-gray-600'
                } transition-all duration-300 ${isDraggingAdditional[index] ? 'border-primary-400 scale-105' : ''}`}
                onDragOver={e => handleAdditionalDragOver(index, e)}
                onDragLeave={e => handleAdditionalDragLeave(index, e)}
                onDrop={e => handleAdditionalDrop(index, e)}
                onClick={() => additionalFileInputRefs.current[index]?.click()}>
                {formData.additionalImageUrls[index] ? (
                  <Avatar src={formData.additionalImageUrls[index]} className="w-full h-full object-cover rounded-lg" showFallback />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gray-700/50 flex flex-col items-center justify-center text-gray-400">
                    <div className="text-2xl mb-1">{isDraggingAdditional[index] ? '📤' : '📷'}</div>
                    <div className="text-xs text-center px-1">{isDraggingAdditional[index] ? 'Soltar' : `Foto ${index + 2}`}</div>
                  </div>
                )}
              </div>

              {formData.additionalImageUrls[index] && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    removeAdditionalImage(index)
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
                  ✕
                </button>
              )}

              {formData.additionalImageUrls[index] && formData.selectedProfileImageIndex !== index + 1 && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    selectProfileImage(index + 1)
                  }}
                  className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-600 transition-colors">
                  ⭐
                </button>
              )}

              <input
                ref={el => (additionalFileInputRefs.current[index] = el)}
                type="file"
                accept="image/*"
                onChange={e => handleAdditionalFileChange(index, e)}
                className="hidden"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Documento */}
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

      {/* Teléfono con selector de país mejorado */}
      <div className="space-y-2">
        <div className="flex gap-3">
          {/* Selector de país con bandera */}
          <Select
            isRequired
            label="Código de país"
            aria-label="Código de país"
            variant="underlined"
            items={availableCountries}
            startContent={<span className="text-lg">{getSelectedCountryFlag(formData.selectedCountryCode) || '🌍'}</span>}
            defaultSelectedKeys={formData.selectedCountryCode ? [formData.selectedCountryCode] : []}>
            {country => (
              <SelectItem value={country.key} textValue={`${country.name} ${country.phone}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.emoji || '🌍'}</span>
                  <div className="flex gap-1">
                    <span className="text-gray-400">{country.phone}</span>
                    <span className="text-white">{country.name}</span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          {/* Campo del número */}
          <Input
            label="Número de teléfono"
            variant="underlined"
            placeholder="Ej: 123 456 789"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
            isInvalid={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber}
          />
        </div>

        {formData.selectedPhoneCode && formData.phoneNumber && (
          <p className="text-xs text-gray-400">
            Teléfono completo: {formData.selectedPhoneCode}
            {formData.phoneNumber}
          </p>
        )}
      </div>

      {/* Fecha de nacimiento */}
      <DatePicker
        variant="underlined"
        isRequired
        label="Fecha de nacimiento"
        value={formData.birthDate}
        onChange={handleDateChange}
        isInvalid={!!errors.birthDate}
        errorMessage={errors.birthDate}
        maxValue={new Date(new Date().getFullYear() - 18, 11, 31)}
        showMonthAndYearPickers
      />
    </div>
  )
}

export default Step1BasicInfo
