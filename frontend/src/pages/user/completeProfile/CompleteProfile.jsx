import { useState } from 'react'
import { Button } from '@heroui/react'
import useGeographicData from '@hooks/useGeographicData'

import Step1BasicInfo from './components/Step1BasicInfo.jsx'
import Step2LocationAndCharacteristics from './components/Step2LocationAndCharacteristics.jsx'
import Step3AboutYou from './components/Step3AboutYou.jsx'
import Step4PreferencesAndConfig from './components/Step4PreferencesAndConfig.jsx'

const CompleteProfile = () => {
  // Hook personalizado para datos geográficos
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
    cityHasLocalities,
    isReady: geographicDataReady
  } = useGeographicData({
    loadAll: true, // Cargar todos los datos inicialmente
    defaultCountry: 'Colombia',
    defaultCity: 'Bogotá D.C.'
  })

  // Estados del formulario
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Datos básicos
    profileImage: null,
    profileImageUrl: '',
    additionalImages: [null, null, null],
    additionalImageUrls: ['', '', ''],
    selectedProfileImageIndex: 0,
    document: '',
    phone: '',
    phoneNumber: '',
    birthDate: null,
    description: '',

    // Ubicación - SIMPLIFICADO
    selectedCountryCode: 'CO',
    selectedCountry: 'Colombia',
    selectedPhoneCode: '+57',
    city: 'Bogotá D.C.',
    locality: '',

    // Características físicas
    height: 170,
    genderId: '',
    eyeColorId: '',
    hairColorId: '',
    bodyTypeId: '',

    // Información personal
    religionId: '',
    maritalStatusId: '',
    profession: '',
    education: '',

    // Categoría de interés
    categoryInterest: '',

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
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingAdditional, setIsDraggingAdditional] = useState([false, false, false])
  const totalSteps = 4

  // Función para scroll suave hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Manejadores de eventos simplificados
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
        city: '', // Limpiar ciudad al cambiar país
        locality: '' // Limpiar localidad al cambiar país
      }))

      // Cargar ciudades del nuevo país
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
      locality: '' // Limpiar localidad al cambiar ciudad
    }))

    // Cargar localidades de la nueva ciudad
    if (cityName && cityHasLocalities(cityName)) {
      await loadLocalitiesByCity(cityName)
    }

    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }))
    }
  }

  const handleDateChange = value => {
    setFormData(prev => ({ ...prev, dateOfBirth: value }))
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: null }))
    }
  }

  // Funciones para manejo de archivos (igual que antes)
  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      processImageFile(file, 'main')
    }
  }

  const handleAdditionalFileChange = (index, event) => {
    const file = event.target.files[0]
    if (file) {
      processImageFile(file, 'additional', index)
    }
  }

  const processImageFile = (file, type = 'main', additionalIndex = null) => {
    if (!file.type.startsWith('image/')) {
      const errorKey = type === 'main' ? 'profileImage' : `additionalImage${additionalIndex}`
      setErrors(prev => ({ ...prev, [errorKey]: 'Por favor selecciona una imagen válida' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorKey = type === 'main' ? 'profileImage' : `additionalImage${additionalIndex}`
      setErrors(prev => ({ ...prev, [errorKey]: 'La imagen no puede superar los 5MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      if (type === 'main') {
        setFormData(prev => ({
          ...prev,
          profileImage: file,
          profileImageUrl: e.target.result
        }))

        if (errors.profileImage) {
          setErrors(prev => ({ ...prev, profileImage: null }))
        }
      } else {
        const newAdditionalImages = [...formData.additionalImages]
        const newAdditionalUrls = [...formData.additionalImageUrls]

        newAdditionalImages[additionalIndex] = file
        newAdditionalUrls[additionalIndex] = e.target.result

        setFormData(prev => ({
          ...prev,
          additionalImages: newAdditionalImages,
          additionalImageUrls: newAdditionalUrls
        }))

        const errorKey = `additionalImage${additionalIndex}`
        if (errors[errorKey]) {
          setErrors(prev => ({ ...prev, [errorKey]: null }))
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Funciones de drag & drop (igual que antes)
  const handleDragOver = e => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0], 'main')
    }
  }

  const handleAdditionalDragOver = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = true
    setIsDraggingAdditional(newDragging)
  }

  const handleAdditionalDragLeave = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = false
    setIsDraggingAdditional(newDragging)
  }

  const handleAdditionalDrop = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = false
    setIsDraggingAdditional(newDragging)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0], 'additional', index)
    }
  }

  // Funciones de gestión de imágenes (igual que antes)
  const getAllImages = () => {
    const images = []
    if (formData.profileImageUrl) {
      images.push({ url: formData.profileImageUrl, index: 0, type: 'main' })
    }
    formData.additionalImageUrls.forEach((url, index) => {
      if (url) {
        images.push({ url, index: index + 1, type: 'additional' })
      }
    })
    return images
  }

  const getCurrentProfileImageUrl = () => {
    const allImages = getAllImages()
    const selectedImage = allImages.find(img => img.index === formData.selectedProfileImageIndex)
    return selectedImage ? selectedImage.url : formData.profileImageUrl || ''
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null,
      profileImageUrl: '',
      selectedProfileImageIndex: 0
    }))
  }

  const removeAdditionalImage = index => {
    const newAdditionalImages = [...formData.additionalImages]
    const newAdditionalUrls = [...formData.additionalImageUrls]

    newAdditionalImages[index] = null
    newAdditionalUrls[index] = ''

    setFormData(prev => ({
      ...prev,
      additionalImages: newAdditionalImages,
      additionalImageUrls: newAdditionalUrls,
      selectedProfileImageIndex: prev.selectedProfileImageIndex === index + 1 ? 0 : prev.selectedProfileImageIndex
    }))
  }

  const selectProfileImage = imageIndex => {
    setFormData(prev => ({
      ...prev,
      selectedProfileImageIndex: imageIndex
    }))
  }

  // Funciones de tags (igual que antes)
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

  // Validación (igual que antes)
  const validateStep = step => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.profileImageUrl) newErrors.profileImage = 'La foto de perfil es requerida'
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
    return Object.keys(newErrors).length === 0
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

  const handleSubmit = async () => {
    setLoading(true)

    if (!validateStep(currentStep)) {
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Combinar código de país con número
      const fullPhoneNumber = `${formData.selectedPhoneCode}${formData.phoneNumber}`

      const profileData = {
        ...formData,
        fullPhoneNumber,
        images: getAllImages(),
        selectedProfileImage: getCurrentProfileImageUrl()
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
  const getSelectedCountryFlag = () => {
    const countryData = getCountryByCode(formData.selectedCountryCode)
    return countryData ? countryData.emoji : '🌍'
  }

  // Función para verificar si debe mostrar localidades
  const shouldShowLocalities = () => {
    return formData.city && formattedLocalities.length > 0
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        console.log('🔍 Renderizando Step1 con countries:', formattedCountries?.length || 0)
        return (
          <Step1BasicInfo
            formData={formData}
            errors={errors}
            isDragging={isDragging}
            isDraggingAdditional={isDraggingAdditional}
            availableCountries={formattedCountries}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleFileChange={handleFileChange}
            handleAdditionalFileChange={handleAdditionalFileChange}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleAdditionalDragOver={handleAdditionalDragOver}
            handleAdditionalDragLeave={handleAdditionalDragLeave}
            handleAdditionalDrop={handleAdditionalDrop}
            removeImage={removeImage}
            removeAdditionalImage={removeAdditionalImage}
            selectProfileImage={selectProfileImage}
            getSelectedCountryFlag={getSelectedCountryFlag}
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
            getCurrentProfileImageUrl={getCurrentProfileImageUrl}
            getAllImages={getAllImages}
            getSelectedCountryFlag={getSelectedCountryFlag}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-10">
      {/* Mostrar loading mientras se cargan los datos geográficos */}
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

          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">¡Hola! 👋</h2>
              <p className="text-gray-300">Ayúdanos a conocerte mejor para encontrar las mejores conexiones</p>
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
        </div>
      )}
    </main>
  )
}

export default CompleteProfile
