import { useState } from 'react'
import { Button } from '@heroui/react'
import useGeographicData from '@hooks/useGeographicData'

import useImageManager from './hooks/useImageManager.js'
import Step1BasicInfo from './components/Step1BasicInfo.jsx'
import Step2LocationAndCharacteristics from './components/Step2LocationAndCharacteristics.jsx'
import Step3AboutYou from './components/Step3AboutYou.jsx'
import Step4PreferencesAndConfig from './components/Step4PreferencesAndConfig.jsx'

const CompleteProfile = () => {
  // Hook para datos geográficos
  const {
    formattedCountries,
    formattedCities,
    formattedLocalities,
    loading: geographicLoading,
    loadingCities,
    loadingLocalities,
    error: geographicError,
    loadCitiesByCountry,
    loadLocalitiesByCity,
    getCountryByCode,
    cityHasLocalities
  } = useGeographicData({
    loadAll: true,
    defaultCountry: 'Colombia',
    defaultCity: 'Bogotá D.C.'
  })

  // Hook para manejo de imágenes
  const imageManager = useImageManager({
    selectedCountryCode: 'CO',
    selectedCountry: 'Colombia',
    selectedPhoneCode: '+57'
  })

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Datos básicos
    profileImage: null,
    profileImageUrl: '',
    additionalImages: [null, null, null, null],
    additionalImageUrls: ['', '', '', ''],
    selectedProfileImageIndex: 0,
    document: '',
    phoneCode: '+57',
    phoneNumber: '',
    birthDate: null,

    // Ubicación
    country: 'Colombia',
    city: 'Bogotá D.C.',
    locality: '',

    // Categoría de interés
    categoryInterest: '',
    // Características físicas
    genderId: '',
    height: 170,
    eyeColorId: '',
    hairColorId: '',
    bodyTypeId: '',

    // Información personal
    description: '',
    religionId: '',
    maritalStatusId: '',
    profession: '',
    education: '',

    // Tags/Intereses
    tags: [],
    newTag: '',

    // Preferencias de matching
    agePreferenceMin: 18,
    agePreferenceMax: 50,
    locationPreferenceRadius: 50,

    // Configuración de privacidad
    showAge: true,
    showLocation: true,
    allowNotifications: true,
    showMeInSearch: true
  })

  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const totalSteps = 4

  // Función para scroll suave hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Manejador genérico para cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Manejador para cambio de país
  const handleCountryChange = async countryCode => {
    const selectedCountryData = getCountryByCode(countryCode)

    if (selectedCountryData) {
      setFormData(prev => ({
        ...prev,
        selectedCountryCode: countryCode,
        selectedCountry: selectedCountryData.name,
        selectedPhoneCode: selectedCountryData.phone,
        city: '',
        locality: ''
      }))

      await loadCitiesByCountry(selectedCountryData.name)

      if (errors.selectedCountry) {
        setErrors(prev => ({ ...prev, selectedCountry: null }))
      }
    }
  }

  // Manejador para cambio de ciudad
  const handleCityChange = async cityName => {
    setFormData(prev => ({
      ...prev,
      city: cityName,
      locality: ''
    }))

    if (cityName && cityHasLocalities(cityName)) {
      await loadLocalitiesByCity(cityName)
    }

    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }))
    }
  }

  // Manejador para fecha de nacimiento
  const handleDateChange = date => {
    if (date) {
      const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
      setFormData(prev => ({
        ...prev,
        birthDate: dateString
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        birthDate: null
      }))
    }

    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: null }))
    }
  }

  // Funciones de tags
  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }))
    }
  }

  const removeTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Validación
  const validateStep = step => {
    const newErrors = {}
    const imageErrors = {}

    switch (step) {
      case 1:
        // Validación de imagen principal
        if (!imageManager.formData.profileImageUrl) {
          imageErrors.profileImage = 'La foto de perfil es requerida'
        }

        if (!formData.document.trim()) newErrors.document = 'El documento es requerido'

        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'El teléfono es requerido'
        } else if (!/^\d{7,15}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'El teléfono debe tener entre 7 y 15 dígitos'
        }

        if (!formData.birthDate) {
          newErrors.birthDate = 'La fecha de nacimiento es requerida'
        }
        break

      case 2:
        if (!formData.selectedCountry) newErrors.selectedCountry = 'Debes seleccionar un país'
        if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida'
        if (!formData.genderId) newErrors.genderId = 'Debes seleccionar tu género'
        if (!formData.categoryInterest) newErrors.categoryInterest = 'Debes seleccionar una categoría'
        break

      case 3:
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
        if (formData.description.length > 500) newErrors.description = 'La descripción no puede tener más de 500 caracteres'
        if (formData.tags.length === 0) newErrors.tags = 'Debes agregar al menos un interés'
        break

      case 4:
        break

      default:
        break
    }

    setErrors(newErrors)
    imageManager.setErrors(imageErrors)

    return Object.keys(newErrors).length === 0 && Object.keys(imageErrors).length === 0
  }

  // Navegación entre pasos
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
      scrollToTop()
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    scrollToTop()
  }

  // Envío del formulario
  const handleSubmit = async () => {
    setLoading(true)

    if (!validateStep(currentStep)) {
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const fullPhoneNumber = `${formData.selectedPhoneCode}${formData.phoneNumber}`

      const profileData = {
        // Datos del formulario principal
        ...formData,
        fullPhoneNumber,

        // Datos de las imágenes del hook
        ...imageManager.formData,
        images: imageManager.getAllImagesArray(),
        selectedProfileImage: imageManager.getCurrentProfileImageUrl()
      }

      console.log('Datos del perfil:', profileData)
      alert('¡Perfil completado exitosamente!')
    } catch (error) {
      console.error('Error al completar perfil:', error)
      alert('Error al completar el perfil')
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener la imagen de bandera del país seleccionado
  const getSelectedCountryFlag = (countryCode = formData.selectedCountryCode) => {
    const countryData = getCountryByCode(countryCode)
    return countryData ? countryData.emoji : '🌍'
  }

  // Función para verificar si debe mostrar localidades
  const shouldShowLocalities = () => {
    return formData.city && formattedLocalities.length > 0
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={{ ...formData, ...imageManager.formData }}
            errors={{ ...errors, ...imageManager.errors }}
            availableCountries={formattedCountries}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            getSelectedCountryFlag={getSelectedCountryFlag}
            // Props del hook de imágenes
            {...imageManager}
          />
        )
      case 2:
        return (
          <Step2LocationAndCharacteristics
            formData={formData}
            errors={errors}
            availableCountries={formattedCountries}
            availableCities={formattedCities}
            availableLocalities={formattedLocalities}
            loadingCities={loadingCities}
            loadingLocalities={loadingLocalities}
            handleInputChange={handleInputChange}
            handleCountryChange={handleCountryChange}
            handleCityChange={handleCityChange}
            getSelectedCountryFlag={getSelectedCountryFlag}
            shouldShowLocalities={shouldShowLocalities}
          />
        )
      case 3:
        return (
          <Step3AboutYou formData={formData} errors={errors} handleInputChange={handleInputChange} addTag={addTag} removeTag={removeTag} />
        )
      case 4:
        return (
          <Step4PreferencesAndConfig
            formData={formData}
            handleInputChange={handleInputChange}
            getCurrentProfileImageUrl={imageManager.getCurrentProfileImageUrl}
            getAllImages={imageManager.getAllImagesArray}
            getSelectedCountryFlag={getSelectedCountryFlag}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-10">
      {geographicLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-400">Cargando datos geográficos...</p>
        </div>
      ) : geographicError ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-red-400 text-center">
            <p className="text-lg font-medium">Error al cargar datos</p>
            <p className="text-sm">{geographicError}</p>
            <Button className="mt-4" onClick={() => window.location.reload()} variant="bordered">
              Intentar de nuevo
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          {/* Indicador de progreso */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col w-full space-y-6">
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6">
              <Button
                type="button"
                variant="bordered"
                onPress={prevStep}
                isDisabled={currentStep === 1}
                radius="full"
                className="text-gray-300 border-gray-600 transition-colors">
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" color="default" onPress={nextStep} radius="full" className="w-auto px-8 py-3 transition-colors">
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  color="default"
                  isLoading={loading}
                  onPress={handleSubmit}
                  radius="full"
                  className="w-auto px-8 py-3 transition-colors">
                  {loading ? 'Completando...' : 'Completar perfil'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default CompleteProfile
