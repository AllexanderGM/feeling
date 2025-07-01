import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import useLocation from '@hooks/useLocation.js'
import useForm from '@hooks/useForm.js'
import useAuth from '@hooks/useAuth.js'
import useUserAttributes from '@hooks/useUserAttributes.js'
import useUserTags from '@hooks/useUserTags.js'
import useUser from '@hooks/useUser.js'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LoadData from '@components/layout/LoadData.jsx'
import { APP_PATHS } from '@constants/paths.js'

import StepBasicInfo from './components/StepBasicInfo.jsx'
import Step2Characteristics from './components/StepPreferences.jsx'
import StepCharacteristics from './components/StepCharacteristics.jsx'
import Step4PreferencesAndConfig from './components/StepConfiguration.jsx'

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
  country: 'Colombia',
  city: 'Bogotá',
  locality: '',

  // Step 2 - Características
  description: '',
  tags: [],
  genderId: '',
  maritalStatusId: '',
  educationLevelId: '',
  profession: '',
  bodyTypeId: '',
  height: 170,
  eyeColorId: '',
  hairColorId: '',

  // Step 3 - Preferencias
  categoryInterest: '',
  agePreferenceMin: 18,
  agePreferenceMax: 50,
  locationPreferenceRadius: 50,
  // SPIRIT
  religionId: '',
  church: '',
  spiritualMoments: '',
  spiritualPractices: '',
  //  ROUSE
  sexualRoleId: '',
  relationshipTypeId: '',

  // Step 4 - Configuración
  showAge: true,
  showLocation: true,
  allowNotifications: true,
  showMeInSearch: true
}

const TOTAL_STEPS = 4
const CompleteProfile = () => {
  // ========================================
  // Hooks y estados
  // ========================================

  const navigate = useNavigate()
  // ========================================

  const { user, loading: authLoading } = useAuth()
  const location = useLocation({ defaultCountry: INITIAL_FORM_DATA.country, defaultCity: INITIAL_FORM_DATA.city })
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()
  const { submitting, completeProfile } = useUser()
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    name: user.name || '',
    lastName: user.lastName || ''
  })

  const {
    errors,
    currentStep,
    stepInfo,
    isFormValid,
    setErrors,
    clearFieldError,
    clearFieldErrors,
    validateCurrentStep,
    goToNextStep,
    goToPrevStep
  } = useForm(TOTAL_STEPS, formData)

  // ========================================
  // FUNCIONES DE ACTUALIZACIÓN DE DATOS
  // ========================================

  // Actualizar campo del formulario
  const updateFormData = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      clearFieldError(field) // Limpiar error del campo automáticamente
    },
    [clearFieldError]
  )

  // Actualizar múltiples campos
  const updateMultipleFields = useCallback(
    updates => {
      setFormData(prev => ({ ...prev, ...updates }))
      clearFieldErrors(Object.keys(updates)) // Limpiar errores de los campos actualizados
    },
    [clearFieldErrors]
  )

  // Actualizar errores manualmente
  const updateErrors = useCallback(
    newErrors => {
      setErrors(newErrors)
    },
    [setErrors]
  )

  // ========================================
  // VALIDACIÓN Y NAVEGACIÓN
  // ========================================

  const nextStep = useCallback(() => {
    goToNextStep(true)
  }, [goToNextStep])

  const prevStep = useCallback(() => {
    goToPrevStep()
  }, [goToPrevStep])

  // ========================================
  // ENVÍO DEL FORMULARIO
  // ========================================

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return

    try {
      const result = await completeProfile(formData)

      if (result.success) {
        navigate(APP_PATHS.ROOT, { replace: true })
      } else if (!result.cancelled) {
        // Solo mostrar error si no fue cancelado
        console.error('❌ Error al completar perfil:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      alert('Error inesperado al completar el perfil. Por favor intenta de nuevo.')
    }
  }, [formData, validateCurrentStep, completeProfile, navigate])

  // ========================================
  // PROPS PARA COMPONENTES
  // ========================================

  // Props comunes para los pasos
  const commonStepProps = useMemo(
    () => ({
      user,
      formData,
      errors,
      updateFormData,
      updateErrors,
      updateMultipleFields,
      location
    }),
    [user, formData, errors, updateFormData, updateErrors, updateMultipleFields, location]
  )

  // Renderizar contenido del paso
  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo {...commonStepProps} />

      case 2:
        return <StepCharacteristics {...commonStepProps} userAttributes={userAttributes} userTags={userTags} />

      case 3:
        return <Step2Characteristics {...commonStepProps} />

      case 4:
        return <Step4PreferencesAndConfig {...commonStepProps} />

      default:
        return null
    }
  }, [currentStep, commonStepProps, userAttributes, userTags])

  // Calcular progreso usando el hook
  const progress = useMemo(
    () => ({
      percentage: stepInfo.progress,
      isLastStep: stepInfo.isLast
    }),
    [stepInfo]
  )

  // ========================================
  // LOADING Y ERROR STATES
  // ========================================

  if (authLoading && location.loading && userAttributes.loading && userTags.loading) return <LoadData>Cargando datos...</LoadData>

  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (location.error) return <LoadDataError>Error al cargar datos geográficos</LoadDataError>
  if (userAttributes.error) return <LoadDataError>Error al cargar atributos del usuario</LoadDataError>
  if (userTags.error) return <LoadDataError>Error al cargar tags populares</LoadDataError>

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

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
            isDisabled={stepInfo.isFirst}
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

          {stepInfo.isLast ? (
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={submitting}
              isDisabled={!isFormValid && import.meta.env.MODE === 'production'}
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
      </div>
    </main>
  )
}

export default CompleteProfile
