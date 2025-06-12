import { Slider, Switch, Avatar } from '@heroui/react'

const Step4PreferencesAndConfig = ({ formData, handleInputChange, getCurrentProfileImageUrl, getAllImages, getSelectedCountryFlag }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-6">Preferencias y configuración</h3>

      <div>
        <label className="text-white text-sm mb-4 block">Rango de edad preferido para matching</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs">Edad mínima: {formData.agePreferenceMin}</label>
            <Slider
              size="sm"
              step={1}
              color="primary"
              minValue={18}
              maxValue={100}
              value={formData.agePreferenceMin}
              onChange={value => handleInputChange('agePreferenceMin', value)}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Edad máxima: {formData.agePreferenceMax}</label>
            <Slider
              size="sm"
              step={1}
              color="primary"
              minValue={18}
              maxValue={100}
              value={formData.agePreferenceMax}
              onChange={value => handleInputChange('agePreferenceMax', value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-white text-sm mb-4 block">Radio de búsqueda: {formData.locationPreferenceRadius} km</label>
        <Slider
          size="lg"
          step={5}
          color="primary"
          minValue={5}
          maxValue={200}
          value={formData.locationPreferenceRadius}
          onChange={value => handleInputChange('locationPreferenceRadius', value)}
        />
      </div>

      {/* Resumen de ubicación */}
      {formData.selectedCountry && formData.city && (
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-3">Tu ubicación</h4>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getSelectedCountryFlag()}</span>
            <div className="text-gray-300">
              <p className="text-sm font-medium">
                {formData.city}, {formData.selectedCountry}
              </p>
              <p className="text-xs text-gray-400">Código telefónico: {formData.selectedPhoneCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Vista previa de la foto de perfil seleccionada */}
      {getCurrentProfileImageUrl() && (
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-3">Foto de perfil seleccionada</h4>
          <div className="flex items-center gap-4">
            <Avatar src={getCurrentProfileImageUrl()} size="lg" className="ring-2 ring-primary-500" />
            <div className="text-gray-300">
              <p className="text-sm">Esta será tu foto de perfil principal</p>
              <p className="text-xs text-gray-400">Puedes cambiarla volviendo al paso anterior</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-white font-medium">Configuración de privacidad</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <span className="text-gray-300">Mostrar mi edad</span>
            <Switch isSelected={formData.showAge} onValueChange={value => handleInputChange('showAge', value)} color="primary" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <span className="text-gray-300">Mostrar mi ubicación</span>
            <Switch isSelected={formData.showLocation} onValueChange={value => handleInputChange('showLocation', value)} color="primary" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <span className="text-gray-300">Aparecer en búsquedas</span>
            <Switch
              isSelected={formData.showMeInSearch}
              onValueChange={value => handleInputChange('showMeInSearch', value)}
              color="primary"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
            <span className="text-gray-300">Recibir notificaciones</span>
            <Switch
              isSelected={formData.allowNotifications}
              onValueChange={value => handleInputChange('allowNotifications', value)}
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Resumen de fotos */}
      {getAllImages().length > 0 && (
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-3">Resumen de tus fotos</h4>
          <div className="grid grid-cols-4 gap-3">
            {getAllImages().map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={`Foto ${index + 1}`}
                  className={`w-full h-16 object-cover rounded-lg ${image.index === formData.selectedProfileImageIndex ? 'ring-2 ring-primary-500' : ''}`}
                />
                {image.index === formData.selectedProfileImageIndex && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    Perfil
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Total: {getAllImages().length} foto{getAllImages().length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default Step4PreferencesAndConfig
