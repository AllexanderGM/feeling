import { useState, useCallback, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useUser, useUserAttributes, useUserTags, useUserInterests, useError, useLocation } from '@hooks'
import { completeProfileSchema, getFieldsForStep, getDefaultValuesForStep } from '@schemas'

import StepBasicRegistration from './StepBasicRegistration.jsx'
import StepBasicInfo from '../../complete/components/StepBasicInfo.jsx'
import StepCharacteristics from '../../complete/components/StepCharacteristics.jsx'
import StepPreferences from '../../complete/components/StepPreferences.jsx'
import StepConfiguration from '../../complete/components/StepConfiguration.jsx'

const TOTAL_STEPS = 5

const CreateUserForm = ({ isOpen, onClose, onSuccess }) => {
  const { createUser, submitting } = useUser()
  const { handleError, handleSuccess } = useError()
  const [currentStep, setCurrentStep] = useState(0)

  // Configuración de ubicación
  const locationConfig = useMemo(
    () => ({
      defaultCountry: 'Colombia',
      defaultCity: 'Bogotá'
    }),
    []
  )

  // Hooks de datos
  const location = useLocation(locationConfig)
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()
  const userInterests = useUserInterests()

  // Valores por defecto del formulario
  const defaultValues = useMemo(
    () => ({
      // Step 0: Basic Registration
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CLIENT',
      // Steps 1-4: Profile completion
      ...getDefaultValuesForStep(1, null)
    }),
    []
  )

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

  // Datos de hooks
  const hookData = useMemo(
    () => ({
      location,
      userAttributes,
      userTags,
      userInterests
    }),
    [location, userAttributes, userTags, userInterests]
  )

  // Funciones del formulario
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
    const progress = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)
    return {
      current: currentStep + 1,
      total: TOTAL_STEPS,
      progress,
      isFirst: currentStep === 0,
      isLast: currentStep === TOTAL_STEPS - 1
    }
  }, [currentStep])

  // Funciones de navegación
  const stepActions = useMemo(
    () => ({
      validateCurrentStep: async () => {
        if (currentStep === 0) {
          // Validación para step básico
          const basicFields = ['email', 'password', 'confirmPassword', 'role']
          return await formMethods.trigger(basicFields)
        } else {
          // Validación para steps de ProfileComplete
          const fieldsToValidate = getFieldsForStep(currentStep)
          if (fieldsToValidate.length === 0) return true
          return await formMethods.trigger(fieldsToValidate)
        }
      },

      nextStep: async () => {
        const isValid = await stepActions.validateCurrentStep()
        if (isValid && currentStep < TOTAL_STEPS - 1) {
          setCurrentStep(prev => prev + 1)
        }
      },

      prevStep: () => {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1)
        }
      },

      onSubmit: async data => {
        try {
          // Preparar datos para crear usuario
          const userData = { ...data }
          delete userData.confirmPassword

          const result = await createUser(userData)
          if (result.success) {
            handleSuccess('Usuario creado exitosamente')
            onSuccess?.()
            onClose()
          } else {
            handleError(result.error || 'Error al crear usuario')
          }
        } catch (error) {
          handleError(error)
        }
      }
    }),
    [currentStep, formMethods, createUser, handleSuccess, handleError, onSuccess, onClose]
  )

  // Renderizado del contenido del paso
  const renderStepContent = useMemo(() => {
    const baseProps = {
      errors,
      ...formMethods
    }

    switch (currentStep) {
      case 0:
        return <StepBasicRegistration {...baseProps} />
      case 1:
        return <StepBasicInfo {...baseProps} locationData={hookData.location} user={null} />
      case 2:
        return <StepCharacteristics {...baseProps} userAttributes={hookData.userAttributes} userTags={hookData.userTags} />
      case 3:
        return (
          <StepPreferences
            {...baseProps}
            categoryOptions={hookData.userInterests.interestOptions}
            categoriesLoading={hookData.userInterests.loading}
            categoriesError={hookData.userInterests.error}
            religionOptions={hookData.userAttributes.religionOptions}
            sexualRoleOptions={hookData.userAttributes.sexualRoleOptions}
            relationshipTypeOptions={hookData.userAttributes.relationshipTypeOptions}
            attributesLoading={hookData.userAttributes.loading}
          />
        )
      case 4:
        return <StepConfiguration {...baseProps} categoryOptions={hookData.userInterests.interestOptions} />
      default:
        return null
    }
  }, [currentStep, hookData, errors, formMethods])

  // Handler para submit final
  const handleFinalSubmit = useCallback(() => {
    handleSubmit(stepActions.onSubmit)()
  }, [handleSubmit, stepActions.onSubmit])

  const handleClose = () => {
    setCurrentStep(0)
    reset()
    onClose()
  }

  // Estados de carga
  const isLoading =
    hookData.location.loading || hookData.userAttributes.loading || hookData.userTags.loading || hookData.userInterests.loading

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size='2xl'
        classNames={{
          backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
          base: 'border-[#292f46] bg-white dark:bg-gray-800'
        }}>
        <ModalContent>
          <ModalBody>
            <div className='flex items-center justify-center p-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4'></div>
                <p className='text-gray-400'>Cargando datos necesarios...</p>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='4xl'
      scrollBehavior='inside'
      classNames={{
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-800'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center justify-between w-full'>
            <div>
              <h3 className='text-lg font-semibold'>Crear Nuevo Usuario</h3>
              <p className='text-sm text-gray-400'>
                Paso {stepInfo.current} de {stepInfo.total}
              </p>
            </div>
            <div className='text-sm text-gray-400'>{stepInfo.progress}%</div>
          </div>

          {/* Barra de progreso */}
          <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-2'>
            <div
              className='bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500'
              style={{ width: `${stepInfo.progress}%` }}
            />
          </div>
        </ModalHeader>

        <ModalBody>
          <div className='min-h-[400px] py-4'>{renderStepContent}</div>
        </ModalBody>

        <ModalFooter>
          <div className='flex justify-between items-center w-full'>
            <Button
              variant='bordered'
              onPress={stepActions.prevStep}
              isDisabled={stepInfo.isFirst || submitting}
              startContent={<ArrowLeft size={16} />}>
              Anterior
            </Button>

            {/* Indicador de pasos */}
            <div className='flex gap-2'>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-primary-500 scale-125' : i < currentStep ? 'bg-primary-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className='flex gap-2'>
              <Button color='danger' variant='light' onPress={handleClose} isDisabled={submitting}>
                Cancelar
              </Button>

              {stepInfo.isLast ? (
                <Button
                  color='primary'
                  onPress={handleFinalSubmit}
                  isLoading={submitting}
                  isDisabled={submitting}
                  endContent={!submitting && <Check size={16} />}>
                  {submitting ? 'Creando...' : 'Crear Usuario'}
                </Button>
              ) : (
                <Button color='primary' onPress={stepActions.nextStep} isDisabled={submitting} endContent={<ArrowRight size={16} />}>
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

CreateUserForm.displayName = 'CreateUserForm'

export default CreateUserForm
