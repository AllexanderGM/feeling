import { useMemo, useEffect, memo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Switch, Card, CardBody, Chip, Divider, Button } from '@heroui/react'
import {
  getDefaultValuesForStep,
  stepConfigurationSchema,
  getUserName,
  getUserEmail,
  getUserCountry,
  getUserCity,
  getUserCategoryInterest,
  getUserTags
} from '@schemas'

import { useStepSave } from '../hooks/useStepSave'

const toggleFields = [
  {
    name: 'allowNotifications',
    label: 'Aceptar notificaciones',
    description: 'Control general para habilitar o deshabilitar todas las notificaciones.'
  },
  { name: 'publicAccount', label: 'Perfil público', description: 'Permite que otros usuarios encuentren tu perfil.' },
  { name: 'searchVisibility', label: 'Mostrarme en búsquedas', description: 'Permite aparecer en listados y recomendaciones.' },
  {
    name: 'showMeInSearch',
    label: 'Permitir coincidencias sugeridas',
    description: 'Habilita que te sugiramos a otras personas compatibles.'
  },
  { name: 'showAge', label: 'Mostrar mi edad', description: 'Tus matches verán tu edad actual.' },
  { name: 'showLocation', label: 'Compartir ubicación aproximada', description: 'Muestra ciudad y país.' },
  { name: 'showPhone', label: 'Compartir mi número de teléfono', description: 'Proporciona tu número cuando aceptes un match.' },
  { name: 'locationPublic', label: 'Hacer pública mi ubicación', description: 'Permite que otros vean tu localidad específica.' }
]

const notificationFields = [
  { name: 'notificationsEmailEnabled', label: 'Notificaciones por email' },
  { name: 'notificationsPhoneEnabled', label: 'Notificaciones por SMS' },
  { name: 'notificationsMatchesEnabled', label: 'Notificar nuevos matches' },
  { name: 'notificationsEventsEnabled', label: 'Nuevos eventos y actividades' },
  { name: 'notificationsLoginEnabled', label: 'Alertas de inicio de sesión' },
  { name: 'notificationsPaymentsEnabled', label: 'Alertas de pagos y facturación' }
]

const StepConfiguration = ({ user, onStepComplete, onStepBack, isFirstStep = false, isLastStep = true }) => {
  const defaultValues = useMemo(() => getDefaultValuesForStep(4, user), [user])

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(stepConfigurationSchema),
    mode: 'onChange',
    defaultValues
  })

  const { saveStepData, submitting } = useStepSave(user)

  useEffect(() => {
    if (!user) return
    reset(getDefaultValuesForStep(4, user), { keepDefaultValues: false })
  }, [user, reset])

  const handleToggleChange = (field, value) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true })

    if (field === 'allowNotifications' && !value) {
      notificationFields.forEach(({ name }) => {
        setValue(name, false, { shouldValidate: true, shouldDirty: true })
      })
    }
  }

  const onSubmit = async data => {
    const result = await saveStepData({
      stepNumber: 4,
      formData: data
    })

    if (result.success) {
      onStepComplete?.()
    }
  }

  const isSaving = submitting || isSubmitting

  const userName = getUserName(user)
  const userEmail = getUserEmail(user)
  const userCountry = getUserCountry(user)
  const userCity = getUserCity(user)
  const userInterest = getUserCategoryInterest(user)
  const userTags = getUserTags(user) || []

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <section className='space-y-4'>
        <h3 className='text-sm text-gray-200 font-semibold'>Privacidad y visibilidad</h3>
        <Card className='bg-gray-800/40 border border-gray-700'>
          <CardBody className='space-y-3'>
            {toggleFields.map(field => (
              <div key={field.name} className='flex items-start justify-between gap-4 py-1'>
                <div>
                  <p className='text-sm text-gray-200 font-medium'>{field.label}</p>
                  <p className='text-xs text-gray-400'>{field.description}</p>
                </div>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: controllerField }) => (
                    <Switch
                      isSelected={controllerField.value ?? false}
                      onValueChange={value => {
                        controllerField.onChange(value)
                        handleToggleChange(field.name, value)
                      }}
                    />
                  )}
                />
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section className='space-y-4'>
        <h3 className='text-sm text-gray-200 font-semibold'>Notificaciones</h3>
        <Card className='bg-gray-800/40 border border-gray-700'>
          <CardBody className='space-y-3'>
            {notificationFields.map(field => (
              <div key={field.name} className='flex items-center justify-between py-1'>
                <p className='text-sm text-gray-200'>{field.label}</p>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: controllerField }) => (
                    <Switch
                      isSelected={controllerField.value ?? false}
                      onValueChange={value => {
                        controllerField.onChange(value)
                        handleToggleChange(field.name, value)
                      }}
                    />
                  )}
                />
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section className='space-y-3'>
        <h3 className='text-sm text-gray-200 font-semibold'>Resumen rápido</h3>
        <Card className='bg-gray-800/60 border border-gray-700'>
          <CardBody className='space-y-2 text-sm text-gray-300'>
            <p>
              <span className='font-medium text-gray-200'>Nombre:</span> {userName}
            </p>
            <p>
              <span className='font-medium text-gray-200'>Correo:</span> {userEmail}
            </p>
            <p>
              <span className='font-medium text-gray-200'>Ubicación:</span> {userCity || 'Sin ciudad'} - {userCountry || 'Sin país'}
            </p>
            <p>
              <span className='font-medium text-gray-200'>Categoría de interés:</span> {userInterest || 'Sin definir'}
            </p>
            <div className='flex flex-wrap gap-2 pt-2'>
              {userTags.slice(0, 6).map(tag => (
                <Chip key={tag} color='primary' size='sm' variant='flat'>
                  {tag}
                </Chip>
              ))}
              {!userTags.length && <span className='text-xs text-gray-500'>Aún no agregas intereses.</span>}
            </div>
          </CardBody>
        </Card>
      </section>

      <Divider />

      <div className='flex justify-between items-center pt-2'>
        {!isFirstStep ? (
          <Button variant='bordered' onPress={onStepBack}>
            Anterior
          </Button>
        ) : (
          <span />
        )}

        <Button color='primary' isLoading={isSaving} type='submit'>
          {isLastStep ? 'Guardar y finalizar' : 'Guardar y continuar'}
        </Button>
      </div>
    </form>
  )
}

export default memo(StepConfiguration)
