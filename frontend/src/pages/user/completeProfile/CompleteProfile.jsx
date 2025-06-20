import { useState, useCallback, useMemo } from 'react'
import { Button } from '@heroui/react'
import useGeographicData from '@hooks/useGeographicData'
import { validateStep } from '@utils/validateInputs'
import useAuth from '@hooks/useAuth'

import Step1BasicInfo from './components/Step1BasicInfo.jsx'
import Step2LocationAndCharacteristics from './components/Step2LocationAndCharacteristics.jsx'
import Step3AboutYou from './components/Step3AboutYou.jsx'
import Step4PreferencesAndConfig from './components/Step4PreferencesAndConfig.jsx'

// Configuración inicial del formulario
const INITIAL_FORM_DATA = {
  // Step 1 - Información básica
  images: [],
  name: '',
  lastName: '',
  document: '',
  phoneCode: '+57',
  phone: '',
  birthDate: '',

  // Step 2 - Ubicación y características
  country: 'Colombia',
  city: 'Bogotá D.C.',
  locality: '',
  categoryInterest: '',
  genderId: '',
  height: 170,
  eyeColorId: '',
  hairColorId: '',
  bodyTypeId: '',

  // Step 3 - Sobre ti
  description: '',
  religionId: '',
  maritalStatusId: '',
  profession: '',
  education: '',
  tags: [],

  // Step 4 - Preferencias
  agePreferenceMin: 18,
  agePreferenceMax: 50,
  locationPreferenceRadius: 50,
  showAge: true,
  showLocation: true,
  allowNotifications: true,
  showMeInSearch: true
}

const TOTAL_STEPS = 4

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth() // Renombrar loading a authLoading

  console.log('Usuario actual:', user)
  console.log('Auth loading:', authLoading)

  // Esperar a que termine de cargar la autenticación
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  // Verificar que hay usuario
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: No se encontró información del usuario</p>
          <Button variant="bordered" onClick={() => (window.location.href = '/login')}>
            Volver al login
          </Button>
        </div>
      </div>
    )
  }

  return <CompleteProfileForm user={user} />
}

// Componente separado para el formulario
const CompleteProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    name: user.name || '',
    lastName: user.lastName || ''
  })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false) // Renombrar loading a submitting

  // Hook de datos geográficos
  const geographic = useGeographicData({
    loadAll: true,
    defaultCountry: formData.country,
    defaultCity: formData.city
  })

  // Actualizar campo del formulario
  const updateFormData = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }))

      // Limpiar error del campo si existe
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  // Actualizar múltiples campos
  const updateMultipleFields = useCallback(
    updates => {
      setFormData(prev => ({ ...prev, ...updates }))

      // Limpiar errores de los campos actualizados
      const fieldsToClean = Object.keys(updates).filter(field => errors[field])
      if (fieldsToClean.length > 0) {
        setErrors(prev => {
          const newErrors = { ...prev }
          fieldsToClean.forEach(field => delete newErrors[field])
          return newErrors
        })
      }
    },
    [errors]
  )

  // Actualizar errores
  const updateErrors = useCallback(newErrors => {
    setErrors(newErrors)
  }, [])

  // Manejadores de ubicación
  const handleCountryChange = useCallback(
    async countryCode => {
      const country = geographic.getCountryByCode(countryCode)

      if (country) {
        updateMultipleFields({
          country: country.name,
          phoneCode: country.phone,
          city: '',
          locality: ''
        })

        await geographic.loadCitiesByCountry(country.name)
      }
    },
    [geographic, updateMultipleFields]
  )

  const handleCityChange = useCallback(
    async cityName => {
      updateMultipleFields({
        city: cityName,
        locality: ''
      })

      if (cityName && geographic.cityHasLocalities(cityName)) {
        await geographic.loadLocalitiesByCity(cityName)
      }
    },
    [geographic, updateMultipleFields]
  )

  // Manejo de tags
  const addTag = useCallback(
    tag => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
        updateFormData('tags', [...formData.tags, trimmedTag])
      }
    },
    [formData.tags, updateFormData]
  )

  const removeTag = useCallback(
    tagToRemove => {
      updateFormData(
        'tags',
        formData.tags.filter(tag => tag !== tagToRemove)
      )
    },
    [formData.tags, updateFormData]
  )

  // Validación del paso actual
  const validateCurrentStep = useCallback(() => {
    const validation = validateStep(currentStep, formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      // Scroll al primer error
      setTimeout(() => {
        const firstError = document.querySelector('[data-invalid="true"]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }

    return validation.isValid
  }, [currentStep, formData])

  // Navegación
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [validateCurrentStep])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Envío del formulario
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return

    setSubmitting(true)

    try {
      // Preparar datos para envío
      const profileData = {
        ...formData,
        fullPhoneNumber: `${formData.phoneCode}${formData.phone}`,
        images: formData.images
          .map((img, index) => ({
            file: img,
            position: index,
            isMain: index === 0
          }))
          .filter(img => img.file)
      }

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Perfil completado:', profileData)
      alert('¡Perfil completado exitosamente!')

      // Aquí iría la navegación a la siguiente pantalla
    } catch (error) {
      console.error('Error al enviar:', error)
      alert('Error al completar el perfil. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }, [formData, validateCurrentStep])

  // Props comunes para los pasos
  const commonStepProps = useMemo(
    () => ({
      user,
      formData,
      errors,
      updateFormData,
      updateErrors
    }),
    [user, formData, errors, updateFormData, updateErrors]
  )

  // Renderizar contenido del paso
  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...commonStepProps} availableCountries={geographic.formattedCountries} />

      case 2:
        return (
          <Step2LocationAndCharacteristics
            {...commonStepProps}
            availableCountries={geographic.formattedCountries}
            availableCities={geographic.formattedCities}
            availableLocalities={geographic.formattedLocalities}
            loadingCities={geographic.loadingCities}
            loadingLocalities={geographic.loadingLocalities}
            handleCountryChange={handleCountryChange}
            handleCityChange={handleCityChange}
            getCountryByCode={geographic.getCountryByCode}
            shouldShowLocalities={geographic.formattedLocalities.length > 0}
          />
        )

      case 3:
        return <Step3AboutYou {...commonStepProps} addTag={addTag} removeTag={removeTag} />

      case 4:
        return <Step4PreferencesAndConfig {...commonStepProps} getCountryByCode={geographic.getCountryByCode} />

      default:
        return null
    }
  }, [currentStep, commonStepProps, geographic, handleCountryChange, handleCityChange, addTag, removeTag])

  // Calcular progreso
  const progress = useMemo(
    () => ({
      percentage: Math.round((currentStep / TOTAL_STEPS) * 100),
      isLastStep: currentStep === TOTAL_STEPS
    }),
    [currentStep]
  )

  // Loading inicial de datos geográficos
  if (geographic.loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Error de carga
  if (geographic.error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error al cargar datos</p>
          <Button variant="bordered" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-3xl mx-auto w-full">
      <div className="w-full space-y-6">
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Paso {currentStep} de {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-400">{progress.percentage}%</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="min-h-[400px]">{renderStepContent}</div>

        {/* Navegación */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
          <Button
            variant="bordered"
            onPress={prevStep}
            isDisabled={currentStep === 1}
            radius="full"
            startContent={<span className="material-symbols-outlined">arrow_back</span>}>
            Anterior
          </Button>

          {/* Indicador de pasos */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep ? 'bg-primary-500 scale-125' : i + 1 < currentStep ? 'bg-primary-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {progress.isLastStep ? (
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={submitting}
              radius="full"
              endContent={!submitting && <span className="material-symbols-outlined">check</span>}>
              {submitting ? 'Completando...' : 'Completar'}
            </Button>
          ) : (
            <Button
              color="default"
              onPress={nextStep}
              radius="full"
              endContent={<span className="material-symbols-outlined">arrow_forward</span>}>
              Siguiente
            </Button>
          )}
        </div>

        {/* Mensaje final */}
        {progress.isLastStep && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-green-400">info</span>
              <div className="text-sm">
                <p className="text-green-400 font-medium">¡Casi listo!</p>
                <p className="text-green-300/80 mt-1">Tu perfil será revisado antes de publicarse.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default CompleteProfile
