import { useRef } from 'react'
import { Input, DatePicker, Avatar } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import clsx from 'clsx'

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
  getSelectedCountryFlag
}) => {
  const fileInputRef = useRef(null)
  const additionalFileInputRefs = useRef([useRef(null), useRef(null), useRef(null)])

  const profileImageClasses = clsx('relative w-32 h-32 rounded-full border-4 transition-all duration-300', {
    'border-blue-400 border-dashed bg-blue-400/20': isDragging,
    'border-white/20': formData.profileImageUrl && !isDragging,
    'border-gray-600 border-dashed hover:border-gray-500': !formData.profileImageUrl && !isDragging,
    'bg-gray-700/50 hover:bg-gray-600/50': !formData.profileImageUrl,
    'ring-4 ring-primary-500': formData.selectedProfileImageIndex === 0
  })

  const getAdditionalImageClasses = index =>
    clsx('relative w-24 h-24 rounded-lg border-2 transition-all duration-300', {
      'border-blue-400 border-dashed bg-blue-400/20': isDraggingAdditional[index],
      'border-white/20': formData.additionalImageUrls[index] && !isDraggingAdditional[index],
      'border-gray-600 border-dashed hover:border-gray-500': !formData.additionalImageUrls[index] && !isDraggingAdditional[index],
      'bg-gray-700/50 hover:bg-gray-600/50': !formData.additionalImageUrls[index],
      'ring-2 ring-primary-500': formData.selectedProfileImageIndex === index + 1
    })

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-6">Información básica</h3>

      {/* Foto de perfil principal */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={clsx('relative group cursor-pointer transition-all duration-300', isDragging ? 'scale-110' : 'hover:scale-105')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}>
          <div className={profileImageClasses}>
            {formData.profileImageUrl ? (
              <>
                <Avatar src={formData.profileImageUrl} className="w-full h-full" isBordered={false} />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-center">
                    <div className="text-2xl mb-1">📷</div>
                    <div className="text-xs">Cambiar</div>
                  </div>
                </div>
                {formData.selectedProfileImageIndex === 0 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    Perfil
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-3xl mb-2">{isDragging ? '📤' : '📷'}</div>
                <div className="text-xs text-center px-2">{isDragging ? 'Suelta aquí' : 'Foto principal'}</div>
              </div>
            )}
          </div>

          {formData.profileImageUrl && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                removeImage()
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors">
              ✕
            </button>
          )}

          {formData.profileImageUrl && formData.selectedProfileImageIndex !== 0 && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                selectProfileImage(0)
              }}
              className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-600 transition-colors">
              ⭐
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <div className="text-center">
          <p className="text-gray-400 text-sm">Foto principal (obligatoria)</p>
          <p className="text-gray-500 text-xs mt-1">Arrastra una imagen o haz clic para seleccionar</p>
        </div>

        {errors.profileImage && <p className="text-red-500 text-sm text-center">{errors.profileImage}</p>}
      </div>

      {/* Fotos adicionales */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-white font-medium mb-2">Fotos adicionales (opcionales)</h4>
          <p className="text-gray-400 text-sm">Puedes agregar hasta 3 fotos más</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(index => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className={clsx(
                  'relative group cursor-pointer transition-all duration-300',
                  isDraggingAdditional[index] ? 'scale-110' : 'hover:scale-105'
                )}
                onDragOver={e => handleAdditionalDragOver(index, e)}
                onDragLeave={e => handleAdditionalDragLeave(index, e)}
                onDrop={e => handleAdditionalDrop(index, e)}
                onClick={() => additionalFileInputRefs.current[index]?.current?.click()}>
                <div className={getAdditionalImageClasses(index)}>
                  {formData.additionalImageUrls[index] ? (
                    <>
                      <img
                        src={formData.additionalImageUrls[index]}
                        alt={`Foto adicional ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white text-center">
                          <div className="text-lg mb-1">📷</div>
                          <div className="text-xs">Cambiar</div>
                        </div>
                      </div>
                      {formData.selectedProfileImageIndex === index + 1 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          Perfil
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <div className="text-lg mb-1">{isDraggingAdditional[index] ? '📤' : '📷'}</div>
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
              </div>

              <input
                ref={additionalFileInputRefs.current[index]}
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

      {/* Teléfono con código de país */}
      <div className="space-y-2">
        <label className="text-white text-sm">Teléfono *</label>
        <div className="flex gap-2">
          {/* Selector de código de país */}
          <div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 min-w-[120px]">
            <span className="text-lg mr-2">{getSelectedCountryFlag()}</span>
            <span className="text-white text-sm">{formData.selectedPhoneCode}</span>
          </div>

          {/* Campo del número */}
          <Input
            variant="bordered"
            placeholder="Número de teléfono"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
            isInvalid={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber}
            className="flex-1"
          />
        </div>
        <p className="text-gray-500 text-xs">
          Teléfono completo: {formData.selectedPhoneCode}
          {formData.phoneNumber}
        </p>
      </div>

      {/* Fecha de nacimiento */}
      <DatePicker
        variant="underlined"
        isRequired
        label="Fecha de nacimiento"
        value={formData.dateOfBirth}
        onChange={handleDateChange}
        isInvalid={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth}
        maxValue={today(getLocalTimeZone()).subtract({ years: 18 })}
        showMonthAndYearPickers
        granularity="day"
      />
    </div>
  )
}

export default Step1BasicInfo
