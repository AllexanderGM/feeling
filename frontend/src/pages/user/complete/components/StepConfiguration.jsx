import { useMemo, useEffect, useCallback, memo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Switch, Card, CardBody, Chip, Divider, Button, Avatar } from '@heroui/react'
import {
  Shield,
  Eye,
  Users,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Zap,
  Settings,
  Bell,
  Mail,
  Smartphone,
  Lock,
  CreditCard,
  Heart,
  Info,
  User as UserIcon,
  Sparkles
} from 'lucide-react'
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

const PRIVACY_SWITCH_CONFIG = [
  {
    name: 'showAge',
    label: 'Mostrar mi edad',
    description: 'Otros usuarios podrán ver tu edad en tu perfil.',
    icon: Calendar,
    iconColor: 'text-blue-400',
    defaultValue: true
  },
  {
    name: 'showLocation',
    label: 'Mostrar mi ubicación',
    description: 'Compartiremos tu ciudad y país aproximados.',
    icon: MapPin,
    iconColor: 'text-blue-400',
    defaultValue: true
  },
  {
    name: 'searchVisibility',
    label: 'Visible en búsquedas',
    description: 'Permite que otros usuarios te encuentren en listados.',
    icon: Eye,
    iconColor: 'text-purple-400',
    requiresPublicAccount: true,
    defaultValue: true
  },
  {
    name: 'showMeInSearch',
    label: 'Sugerencias inteligentes',
    description: 'Aparecerás en recomendaciones personalizadas.',
    icon: Users,
    iconColor: 'text-purple-400',
    requiresPublicAccount: true,
    defaultValue: true
  },
  {
    name: 'showPhone',
    label: 'Compartir mi teléfono',
    description: 'Tu número será visible cuando aceptes un match.',
    icon: Phone,
    iconColor: 'text-amber-400',
    defaultValue: false
  },
  {
    name: 'locationPublic',
    label: 'Ubicación detallada',
    description: 'Permite que otros vean tu localidad específica.',
    icon: Globe,
    iconColor: 'text-emerald-400',
    defaultValue: false
  }
]

const NOTIFICATION_SWITCH_CONFIG = [
  {
    name: 'notificationsEmailEnabled',
    label: 'Notificaciones por email',
    icon: Mail,
    iconColor: 'text-sky-400',
    chipColor: 'primary',
    defaultValue: true
  },
  {
    name: 'notificationsPhoneEnabled',
    label: 'Notificaciones por SMS',
    icon: Smartphone,
    iconColor: 'text-amber-400',
    chipColor: 'warning',
    defaultValue: false
  },
  {
    name: 'notificationsMatchesEnabled',
    label: 'Notificar nuevos matches',
    icon: Heart,
    iconColor: 'text-pink-400',
    chipColor: 'danger',
    defaultValue: true
  },
  {
    name: 'notificationsEventsEnabled',
    label: 'Eventos y actividades',
    icon: Calendar,
    iconColor: 'text-green-400',
    chipColor: 'success',
    defaultValue: true
  },
  {
    name: 'notificationsLoginEnabled',
    label: 'Alertas de inicio de sesión',
    icon: Lock,
    iconColor: 'text-purple-400',
    chipColor: 'secondary',
    defaultValue: true
  },
  {
    name: 'notificationsPaymentsEnabled',
    label: 'Pagos y facturación',
    icon: CreditCard,
    iconColor: 'text-teal-400',
    chipColor: 'secondary',
    defaultValue: true
  }
]

const StepConfiguration = ({ user, onStepComplete, onStepBack, isFirstStep = false, isLastStep = true }) => {
  const defaultValues = useMemo(() => getDefaultValuesForStep(4, user), [user])

  const {
    control,
    handleSubmit,
    watch,
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

  const handleToggleChange = useCallback(
    (field, value) => {
      setValue(field, value, { shouldValidate: true, shouldDirty: true })

      if (field === 'allowNotifications' && !value) {
        NOTIFICATION_SWITCH_CONFIG.forEach(({ name }) => {
          setValue(name, false, { shouldValidate: true, shouldDirty: true })
        })
      }

      if (field === 'publicAccount') {
        if (!value) {
          setValue('searchVisibility', false, { shouldValidate: true, shouldDirty: true })
          setValue('showMeInSearch', false, { shouldValidate: true, shouldDirty: true })
        } else {
          setValue('searchVisibility', true, { shouldValidate: true, shouldDirty: true })
          setValue('showMeInSearch', true, { shouldValidate: true, shouldDirty: true })
        }
      }
    },
    [setValue]
  )

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

  const formValues = watch()
  const {
    allowNotifications = true,
    publicAccount = true,
    searchVisibility = true,
    showMeInSearch = true,
    showAge = true,
    showLocation = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showPhone: _showPhone = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    locationPublic: _locationPublic = false,
    notificationsEmailEnabled = true,
    notificationsPhoneEnabled = false,
    notificationsMatchesEnabled = true,
    notificationsEventsEnabled = true,
    notificationsLoginEnabled = true,
    notificationsPaymentsEnabled = true
  } = formValues

  const allowNotificationsValue = allowNotifications ?? true
  const publicAccountValue = publicAccount ?? true

  const userName = getUserName(user)
  const userEmail = getUserEmail(user)
  const userCountry = getUserCountry(user)
  const userCity = getUserCity(user)
  const userInterest = getUserCategoryInterest(user)
  const userTags = getUserTags(user) || []

  const renderEnhancedSwitch = useCallback(
    (fieldName, config = {}) => {
      const {
        icon: IconComponent,
        label,
        description,
        defaultValue = false,
        iconColor = 'text-gray-400',
        isNotification = false,
        requiresPublicAccount = false
      } = config

      const isNotificationDisabled = isNotification && !allowNotificationsValue
      const isPrivacyDisabled = requiresPublicAccount && !publicAccountValue
      const isDisabled = isNotificationDisabled || isPrivacyDisabled

      return (
        <div
          key={fieldName}
          className={`flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
            isDisabled ? 'bg-gray-800/20 border-gray-700/20 opacity-60' : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50'
          }`}>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            {IconComponent && <IconComponent className={`w-4 h-4 shrink-0 ${isDisabled ? 'text-gray-500' : iconColor}`} />}
            <div className='min-w-0 flex-1'>
              <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-500' : 'text-gray-200'}`}>{label}</span>
              {description && <p className={`text-xs mt-0.5 ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>}
            </div>
          </div>
          <div className='shrink-0 ml-2'>
            <Controller
              control={control}
              name={fieldName}
              render={({ field }) => (
                <Switch
                  color='primary'
                  isDisabled={isDisabled}
                  isSelected={field.value ?? defaultValue}
                  size='sm'
                  onValueChange={value => {
                    field.onChange(value)
                    handleToggleChange(fieldName, value)
                  }}
                />
              )}
            />
          </div>
        </div>
      )
    },
    [control, handleToggleChange, allowNotificationsValue, publicAccountValue]
  )

  const privacySummaryChips = useMemo(
    () =>
      [
        { visible: publicAccountValue, label: 'Perfil público', color: 'success' },
        { visible: searchVisibility ?? true, label: 'En búsquedas', color: 'secondary' },
        { visible: showMeInSearch ?? true, label: 'Recomendaciones', color: 'secondary' },
        { visible: showAge ?? true, label: 'Edad visible', color: 'primary' },
        { visible: showLocation ?? true, label: 'Ubicación visible', color: 'primary' },
        { visible: !publicAccountValue, label: 'Perfil privado', color: 'default' }
      ].filter(chip => chip.visible),
    [publicAccountValue, searchVisibility, showMeInSearch, showAge, showLocation]
  )

  const notificationSummaryChips = useMemo(() => {
    if (!allowNotificationsValue) return []

    const activeValues = {
      notificationsEmailEnabled,
      notificationsPhoneEnabled,
      notificationsMatchesEnabled,
      notificationsEventsEnabled,
      notificationsLoginEnabled,
      notificationsPaymentsEnabled
    }

    return NOTIFICATION_SWITCH_CONFIG.filter(({ name }) => activeValues[name])
  }, [
    allowNotificationsValue,
    notificationsEmailEnabled,
    notificationsPhoneEnabled,
    notificationsMatchesEnabled,
    notificationsEventsEnabled,
    notificationsLoginEnabled,
    notificationsPaymentsEnabled
  ])

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4 sm:p-6 space-y-6'>
          <div className='flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left'>
            <div className='p-2 bg-green-500/20 rounded-lg shrink-0'>
              <Shield className='w-5 h-5 text-green-400' />
            </div>
            <div className='min-w-0'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-200'>Configuración de privacidad</h3>
              <p className='text-xs sm:text-sm text-gray-400 mt-1'>Controla qué información es visible para otros usuarios.</p>
            </div>
          </div>

          <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Eye className='w-4 h-4 text-gray-300' />
              <span className='text-sm font-medium text-gray-300'>Resumen de privacidad</span>
            </div>
            <div className='flex flex-wrap gap-1.5 justify-center sm:justify-start'>
              {privacySummaryChips.map(({ label, color }) => (
                <Chip key={label} className='text-xs' color={color} size='sm' variant='flat'>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <Shield className='w-4 h-4 text-blue-400 shrink-0' />
                <div className='min-w-0 flex-1'>
                  <span className='text-sm font-medium text-blue-400 block'>Perfil público</span>
                  <p className='text-xs text-gray-400 mt-0.5'>Control principal de visibilidad del perfil.</p>
                </div>
              </div>
              <div className='shrink-0 ml-2'>
                <Controller
                  control={control}
                  name='publicAccount'
                  render={({ field }) => (
                    <Switch
                      color='primary'
                      isSelected={field.value ?? true}
                      size='sm'
                      onValueChange={value => {
                        field.onChange(value)
                        handleToggleChange('publicAccount', value)
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className='space-y-3'>{PRIVACY_SWITCH_CONFIG.map(config => renderEnhancedSwitch(config.name, config))}</div>
        </CardBody>
      </Card>

      <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4 sm:p-6 space-y-6'>
          <div className='flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left'>
            <div className='p-2 bg-yellow-500/20 rounded-lg shrink-0'>
              <Bell className='w-5 h-5 text-yellow-400' />
            </div>
            <div className='min-w-0'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-200'>Configuración de notificaciones</h3>
              <p className='text-xs sm:text-sm text-gray-400 mt-1'>Personaliza qué alertas quieres recibir.</p>
            </div>
          </div>

          <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <Zap className='w-4 h-4 text-blue-400 shrink-0' />
                <div className='min-w-0 flex-1'>
                  <span className='text-sm font-medium text-blue-400 block'>Control general</span>
                  <p className='text-xs text-gray-400 mt-0.5'>Activa o desactiva todas las notificaciones.</p>
                </div>
              </div>
              <div className='shrink-0 ml-2'>
                <Controller
                  control={control}
                  name='allowNotifications'
                  render={({ field }) => (
                    <Switch
                      color='primary'
                      isSelected={field.value ?? true}
                      size='sm'
                      onValueChange={value => {
                        field.onChange(value)
                        handleToggleChange('allowNotifications', value)
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Settings className='w-4 h-4 text-gray-300' />
              <span className='text-sm font-medium text-gray-300'>Notificaciones activas</span>
            </div>
            {allowNotificationsValue ? (
              <div className='flex flex-wrap gap-1.5 justify-center sm:justify-start'>
                {notificationSummaryChips.length ? (
                  notificationSummaryChips.map(({ name, label, chipColor }) => (
                    <Chip key={name} className='text-xs' color={chipColor} size='sm' variant='flat'>
                      {label}
                    </Chip>
                  ))
                ) : (
                  <Chip className='text-xs text-gray-300' color='default' size='sm' variant='flat'>
                    Sin alertas activas
                  </Chip>
                )}
              </div>
            ) : (
              <span className='text-xs text-gray-500 block text-center sm:text-left'>Las notificaciones están desactivadas.</span>
            )}
          </div>

          <div className='space-y-3'>
            {NOTIFICATION_SWITCH_CONFIG.map(config => renderEnhancedSwitch(config.name, { ...config, isNotification: true }))}
          </div>
        </CardBody>
      </Card>

      <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/60'>
        <CardBody className='p-4 sm:p-6 space-y-5'>
          <div className='flex items-center gap-3'>
            <Avatar className='bg-primary-500/20 text-primary-200' name={userName || 'Usuario'} size='sm' />
            <div className='min-w-0'>
              <h4 className='text-base font-semibold text-gray-200 truncate'>{userName || 'Nombre pendiente'}</h4>
              <p className='text-xs text-gray-400'>{userEmail || 'Correo pendiente'}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300'>
            <div className='flex items-center gap-2'>
              <UserIcon className='w-4 h-4 text-blue-400' />
              <span className='text-gray-400'>Categoría:</span>
              <span className='font-medium text-gray-200'>{userInterest || 'Sin definir'}</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-green-400' />
              <span className='text-gray-400'>Ubicación:</span>
              <span className='font-medium text-gray-200'>
                {userCity || 'Sin ciudad'} - {userCountry || 'Sin país'}
              </span>
            </div>
          </div>

          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-purple-400' />
              <span className='text-sm font-medium text-gray-200'>Intereses destacados</span>
            </div>
            {userTags.length ? (
              <div className='flex flex-wrap gap-1.5'>
                {userTags.slice(0, 6).map(tag => (
                  <Chip key={tag} className='text-xs' color='secondary' size='sm' variant='flat'>
                    {tag}
                  </Chip>
                ))}
                {userTags.length > 6 && (
                  <Chip className='text-xs text-gray-300' color='default' size='sm' variant='flat'>
                    +{userTags.length - 6} más
                  </Chip>
                )}
              </div>
            ) : (
              <span className='text-xs text-gray-500'>Aún no agregas intereses.</span>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className='bg-green-500/10 border border-green-500/20 rounded-xl'>
        <CardBody className='p-4 sm:p-5'>
          <div className='flex gap-3'>
            <Info className='w-5 h-5 text-green-400 shrink-0' />
            <div className='text-sm text-green-300/80'>
              <h4 className='text-green-400 font-medium mb-2'>¡Ya casi terminamos!</h4>
              <p>
                Revisa que toda tu información esté correcta. Podrás modificar estas preferencias desde tu perfil después de registrarte.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

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
