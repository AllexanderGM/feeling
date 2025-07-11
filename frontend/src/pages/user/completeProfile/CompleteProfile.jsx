import { useState, useCallback, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
// Hooks
import useAuth from '@hooks/useAuth.js'
import useLocation from '@hooks/useLocation.js'
import useUserAttributes from '@hooks/useUserAttributes.js'
import useUserTags from '@hooks/useUserTags.js'
import useUser from '@hooks/useUser.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests'
//Components
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LoadData from '@components/layout/LoadData.jsx'
// Utils
import { completeProfileSchema, getFieldsForStep } from '@utils/formSchemas.js'
import { getDefaultValuesForStep } from '@constants/userSchema.js'
import { APP_PATHS } from '@constants/paths.js'
import { ArrowLeft, Check, ArrowRight } from 'lucide-react'

import StepBasicInfo from './components/StepBasicInfo.jsx'
import StepPreferences from './components/StepPreferences.jsx'
import StepCharacteristics from './components/StepCharacteristics.jsx'
import StepConfiguration from './components/StepConfiguration.jsx'

const TOTAL_STEPS = 4

const CompleteProfile = () => {
  const navigate = useNavigate()

  // Hooks básicos
  const { user, loading: authLoading } = useAuth()
  const { submitting, completeUser } = useUser()

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(1)

  // Configuración de ubicación memoizada
  const locationConfig = useMemo(
    () => ({
      defaultCountry: user?.country || 'Colombia',
      defaultCity: user?.city || 'Bogotá'
    }),
    [user?.country, user?.city]
  )

  // Hooks de datos
  const location = useLocation(locationConfig)
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()
  const categoryInterests = useCategoryInterests()

  // Valores por defecto del formulario usando esquema centralizado
  const defaultValues = useMemo(() => getDefaultValuesForStep(currentStep, user), [currentStep, user])

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(completeProfileSchema),
    defaultValues,
    mode: 'onChange'
  })

  // Datos de hooks estables - SIMPLIFICADO
  const hookData = useMemo(
    () => ({
      location,
      userAttributes,
      userTags,
      categoryInterests
    }),
    [location, userAttributes, userTags, categoryInterests]
  )

  // Funciones del formulario estables
  const formMethods = useMemo(
    () => ({
      control,
      watch,
      getValues,
      setValue,
      setError,
      clearErrors,
      trigger,
      reset
    }),
    [control, watch, getValues, setValue, setError, clearErrors, trigger, reset]
  )

  // Información del paso actual
  const stepInfo = useMemo(() => {
    const progress = Math.round((currentStep / TOTAL_STEPS) * 100)
    return {
      current: currentStep,
      total: TOTAL_STEPS,
      progress,
      isFirst: currentStep === 1,
      isLast: currentStep === TOTAL_STEPS
    }
  }, [currentStep])

  // Funciones de navegación
  const stepActions = useMemo(
    () => ({
      validateCurrentStep: async () => {
        const fieldsToValidate = getFieldsForStep(currentStep)
        if (fieldsToValidate.length === 0) return true
        return await formMethods.trigger(fieldsToValidate)
      },

      nextStep: async () => {
        const fieldsToValidate = getFieldsForStep(currentStep)
        const isValid = fieldsToValidate.length === 0 || (await formMethods.trigger(fieldsToValidate))
        if (isValid && currentStep < TOTAL_STEPS) {
          setCurrentStep(prev => prev + 1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      prevStep: () => {
        if (currentStep > 1) {
          setCurrentStep(prev => prev - 1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      onSubmit: async data => {
        const result = await completeUser(data)
        if (result.success) navigate(APP_PATHS.USER.WELCOME_ONBOARDING, { replace: true })
      }
    }),
    [currentStep, formMethods, completeUser, navigate]
  )

  // Renderizado del contenido del paso con props unificados
  const renderStepContent = useMemo(() => {
    const baseProps = {
      user,
      errors,
      ...formMethods
    }

    switch (currentStep) {
      case 1:
        return <StepBasicInfo {...baseProps} locationData={hookData.location} />
      case 2:
        return <StepCharacteristics {...baseProps} userAttributes={hookData.userAttributes} userTags={hookData.userTags} />
      case 3:
        return (
          <StepPreferences
            {...baseProps}
            categoryOptions={hookData.categoryInterests.categoryOptions}
            categoriesLoading={hookData.categoryInterests.loading}
            categoriesError={hookData.categoryInterests.error}
            religionOptions={hookData.userAttributes.religionOptions}
            sexualRoleOptions={hookData.userAttributes.sexualRoleOptions}
            relationshipTypeOptions={hookData.userAttributes.relationshipTypeOptions}
            attributesLoading={hookData.userAttributes.loading}
          />
        )
      case 4:
        return <StepConfiguration {...baseProps} categoryOptions={hookData.categoryInterests.categoryOptions} />
      default:
        return null
    }
  }, [currentStep, hookData, errors, formMethods, user])

  // Handler para submit final
  const handleFinalSubmit = useCallback(() => {
    handleSubmit(stepActions.onSubmit)()
  }, [handleSubmit, stepActions.onSubmit])

  // Estados de carga y error
  const isLoading =
    authLoading ||
    hookData.location.loading ||
    hookData.userAttributes.loading ||
    hookData.userTags.loading ||
    hookData.categoryInterests.loading

  if (isLoading) return <LoadData>Cargando datos...</LoadData>

  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (hookData.location.error) return <LoadDataError>Error al cargar datos geográficos</LoadDataError>
  if (hookData.userAttributes.error) return <LoadDataError>Error al cargar atributos del usuario</LoadDataError>
  if (hookData.userTags.error) return <LoadDataError>Error al cargar tags populares</LoadDataError>
  if (hookData.categoryInterests.error) return <LoadDataError>Error al cargar categorías de interés</LoadDataError>

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-3xl mx-auto w-full">
      <div className="w-full space-y-6">
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Paso {stepInfo.current} de {stepInfo.total}
            </span>
            <span className="text-sm text-gray-400">{stepInfo.progress}%</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stepInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="min-h-[400px]">{renderStepContent}</div>

        {/* Navegación */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
          <Button
            variant="bordered"
            onPress={stepActions.prevStep}
            isDisabled={stepInfo.isFirst}
            radius="full"
            startContent={<ArrowLeft />}>
            Anterior
          </Button>

          {/* Indicador de pasos */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 === stepInfo.current ? 'bg-primary-500 scale-125' : i + 1 < stepInfo.current ? 'bg-primary-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {stepInfo.isLast ? (
            <Button
              color="primary"
              onPress={handleFinalSubmit}
              isLoading={submitting}
              isDisabled={!isValid && import.meta.env.MODE === 'production'}
              radius="full"
              endContent={!submitting && <Check />}>
              {submitting ? 'Completando...' : 'Completar'}
            </Button>
          ) : (
            <Button color="default" onPress={stepActions.nextStep} radius="full" endContent={<ArrowRight />}>
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

export default memo(CompleteProfile)
