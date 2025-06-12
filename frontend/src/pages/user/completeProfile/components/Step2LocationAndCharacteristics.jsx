import { Select, SelectItem, Input, Slider } from '@heroui/react'
import { useUserAttributes } from '@hooks/useUserAttributes'

const Step2LocationAndCharacteristics = ({
  formData,
  errors,
  availableCountries,
  availableCities,
  availableLocalities,
  loadingCities,
  loadingLocalities,
  handleInputChange,
  handleCountryChange,
  handleCityChange,
  shouldShowLocalities
}) => {
  const { genderOptions, eyeColorOptions, hairColorOptions, loading } = useUserAttributes()

  if (loading) {
    return <div>Cargando opciones...</div>
  }

  const categoryInterestOptions = [
    { key: 'SINGLES', label: 'Singles', description: 'Relaciones heterosexuales' },
    { key: 'ROUSE', label: 'Rouse', description: 'Comunidad LGBTI+' },
    { key: 'SPIRIT', label: 'Spirit', description: 'Comunidad cristiana' }
  ]

  // Función helper para validar keys
  const getValidSelectedKeys = (value, collection) => {
    if (!value) return []
    const exists = collection.some(item => item.key === value)
    return exists ? [value] : []
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-6">Ubicación y características</h3>

      {/* Selector de país */}
      <Select
        variant="underlined"
        isRequired
        label="País"
        placeholder="Selecciona tu país"
        selectedKeys={getValidSelectedKeys(formData.selectedCountryCode, availableCountries)}
        onSelectionChange={keys => handleCountryChange(Array.from(keys)[0])}
        isInvalid={!!errors.selectedCountry}
        errorMessage={errors.selectedCountry}
        aria-label="Selector de país"
        renderValue={items => {
          return items.map(item => {
            const country = availableCountries.find(c => c.key === item.key)
            return country ? (
              <div key={item.key} className="flex items-center gap-2">
                <span className="text-lg">{country.emoji}</span>
                <span>{country.name}</span>
              </div>
            ) : null
          })
        }}>
        {availableCountries.map(country => (
          <SelectItem
            key={country.key}
            value={country.key}
            textValue={`${country.name}${country.priority ? ' (Recomendado)' : ''}`}
            startContent={
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.emoji}</span>
                {country.priority && <span className="text-yellow-400">⭐</span>}
              </div>
            }
            className={country.priority ? 'font-bold text-primary-400 border-b border-primary-300/30' : ''}>
            <div className="flex items-center gap-2">
              <span className={country.priority ? 'font-bold' : ''}>{country.name}</span>
              {country.priority && <span className="text-xs text-primary-400">(Recomendado)</span>}
            </div>
          </SelectItem>
        ))}
      </Select>

      {/* Selector de ciudad */}
      {availableCities.length > 0 ? (
        <Select
          variant="underlined"
          isRequired
          label="Ciudad"
          placeholder="Selecciona tu ciudad"
          aria-label="Selector de ciudad"
          selectedKeys={getValidSelectedKeys(formData.city, availableCities)}
          onSelectionChange={keys => handleCityChange(Array.from(keys)[0])}
          isInvalid={!!errors.city}
          errorMessage={errors.city}
          isLoading={loadingCities}>
          {availableCities.map(city => (
            <SelectItem
              key={city.key}
              value={city.key}
              textValue={`${city.name}${city.priority ? ' (Capital)' : ''}`}
              startContent={city.priority ? <span className="text-yellow-400">⭐</span> : null}
              className={city.priority ? 'font-bold text-primary-400 border-b border-primary-300/30' : ''}>
              <div className="flex items-center gap-2">
                <span className={city.priority ? 'font-bold' : ''}>{city.name}</span>
                {city.priority && <span className="text-xs text-primary-400">(Capital)</span>}
              </div>
            </SelectItem>
          ))}
        </Select>
      ) : (
        <>
          {/* Información sobre ciudades no disponibles */}
          {formData.selectedCountry && (
            <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-sm">
                📍 No tenemos ciudades registradas para {formData.selectedCountry}. Puedes escribir tu ciudad manualmente.
              </p>
            </div>
          )}

          {/* Input manual para ciudad */}
          <Input
            variant="underlined"
            isRequired
            label="Ciudad"
            placeholder="Escribe el nombre de tu ciudad"
            aria-label="Campo de texto para escribir ciudad"
            value={formData.city}
            onChange={e => handleCityChange(e.target.value)}
            isInvalid={!!errors.city}
            errorMessage={errors.city}
          />
        </>
      )}

      {/* Selector de localidad */}
      {shouldShowLocalities() && (
        <div className="space-y-2">
          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 mb-3">
            <p className="text-blue-300 text-sm">
              🏙️ Como seleccionaste {formData.city}, puedes especificar tu localidad para mejores conexiones.
            </p>
          </div>

          <Select
            variant="underlined"
            label="Localidad (opcional)"
            placeholder={`Selecciona tu localidad en ${formData.city}`}
            aria-label={`Selector de localidad en ${formData.city}`}
            selectedKeys={getValidSelectedKeys(formData.locality, availableLocalities)}
            onSelectionChange={keys => handleInputChange('locality', Array.from(keys)[0])}
            isLoading={loadingLocalities}>
            {availableLocalities.map(locality => (
              <SelectItem key={locality.key} value={locality.key} textValue={locality.name}>
                {locality.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Género */}
      <Select
        variant="underlined"
        isRequired
        label="Género"
        placeholder="Selecciona tu género"
        aria-label="Selector de género"
        selectedKeys={getValidSelectedKeys(formData.genderId, genderOptions)}
        onSelectionChange={keys => handleInputChange('genderId', Array.from(keys)[0])}
        isInvalid={!!errors.genderId}
        errorMessage={errors.genderId}>
        {genderOptions.map(option => (
          <SelectItem key={option.key} value={option.key} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {/* Estatura */}
      <div>
        <label className="text-white text-sm mb-4 block">Estatura: {formData.height} cm</label>
        <Slider
          size="lg"
          step={1}
          color="primary"
          minValue={140}
          maxValue={220}
          value={formData.height}
          onChange={value => handleInputChange('height', value)}
          aria-label={`Control deslizante de estatura, valor actual: ${formData.height} centímetros`}
          className="mb-4"
        />
      </div>

      {/* Categoría de interés */}
      <Select
        variant="underlined"
        isRequired
        label="Categoría de interés"
        placeholder="Selecciona tu categoría"
        aria-label="Selector de categoría de interés"
        selectedKeys={getValidSelectedKeys(formData.categoryInterest, categoryInterestOptions)}
        onSelectionChange={keys => handleInputChange('categoryInterest', Array.from(keys)[0])}
        isInvalid={!!errors.categoryInterest}
        errorMessage={errors.categoryInterest}>
        {categoryInterestOptions.map(option => (
          <SelectItem
            key={option.key}
            value={option.key}
            description={option.description}
            textValue={`${option.label} - ${option.description}`}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {/* Características físicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          variant="underlined"
          label="Color de ojos"
          placeholder="Selecciona"
          aria-label="Selector de color de ojos"
          selectedKeys={getValidSelectedKeys(formData.eyeColorId, eyeColorOptions)}
          onSelectionChange={keys => handleInputChange('eyeColorId', Array.from(keys)[0])}>
          {eyeColorOptions.map(option => (
            <SelectItem key={option.key} value={option.key} textValue={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          variant="underlined"
          label="Color de cabello"
          placeholder="Selecciona"
          aria-label="Selector de color de cabello"
          selectedKeys={getValidSelectedKeys(formData.hairColorId, hairColorOptions)}
          onSelectionChange={keys => handleInputChange('hairColorId', Array.from(keys)[0])}>
          {hairColorOptions.map(option => (
            <SelectItem key={option.key} value={option.key} textValue={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default Step2LocationAndCharacteristics
