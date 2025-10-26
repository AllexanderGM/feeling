import { useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Switch, Card, CardBody, Chip, Avatar } from '@heroui/react'
import { useAuth } from '@hooks'
import {
  Shield,
  Eye,
  Users,
  Calendar,
  MapPin,
  Globe,
  Settings,
  Bell,
  Mail,
  Smartphone,
  Phone,
  Lock,
  CreditCard,
  Heart,
  Info,
  User as UserIcon,
  Sparkles,
  Camera,
  Ruler,
  Briefcase,
  GraduationCap
} from 'lucide-react'
import {
  getDefaultValuesForStep,
  stepConfigurationSchema,
  getUserName,
  getUserLastName,
  getUserEmail,
  getUserPhone,
  getUserPhoneCode,
  getUserCountry,
  getUserCity,
  getUserLocality,
  getUserAge,
  getUserImages,
  getUserCategoryInterest,
  getUserTags,
  getUserGender,
  getUserMaritalStatus,
  getUserEducation,
  getUserProfession,
  getUserHeight
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

const StepConfiguration = forwardRef(({ onStepComplete }, ref) => {
  const { user } = useAuth()
  const defaultValues = useMemo(() => getDefaultValuesForStep(4, user), [user])

  const { control, handleSubmit, watch, reset, setValue } = useForm({
    resolver: yupResolver(stepConfigurationSchema),
    mode: 'onChange',
    defaultValues
  })

  const { saveStepData } = useStepSave(user)

  useEffect(() => {
    if (!user) return
    reset(getDefaultValuesForStep(4, user), { keepDefaultValues: false })
  }, [user, reset])

  const handleToggleChange = useCallback(
    (field, value) => {
      setValue(field, value, { shouldValidate: true, shouldDirty: true })

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
    // Marcar explícitamente la configuración como completada al guardar el paso
    setValue('configurationCompleted', true, { shouldValidate: false, shouldDirty: true })

    const result = await saveStepData({
      stepNumber: 4,
      formData: {
        ...data,
        configurationCompleted: true
      }
    })

    if (result.success) {
      onStepComplete?.()
    }
  }

  // Exponer método submit al componente padre
  useImperativeHandle(ref, () => ({
    submit: handleSubmit(onSubmit)
  }))

  const formValues = watch()
  const {
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
  const publicAccountValue = publicAccount ?? true

  // Step 1: Información básica
  const userName = getUserName(user)
  const userLastName = getUserLastName(user)
  const userEmail = getUserEmail(user)
  const userPhone = getUserPhone(user)
  const userPhoneCode = getUserPhoneCode(user)
  const userCountry = getUserCountry(user)
  const userCity = getUserCity(user)
  const userLocality = getUserLocality(user)
  const userAge = getUserAge(user)
  const userImages = getUserImages(user) || []
  const userMainImage = userImages.length > 0 ? userImages[0] : null

  // Step 2: Características
  const userTags = getUserTags(user) || []
  const userGender = getUserGender(user)
  const userMaritalStatus = getUserMaritalStatus(user)
  const userEducation = getUserEducation(user)
  const userProfession = getUserProfession(user)
  const userHeight = getUserHeight(user)

  // Step 3: Preferencias
  const userInterest = getUserCategoryInterest(user)

  const renderEnhancedSwitch = useCallback(
    (fieldName, config = {}) => {
      const {
        icon: IconComponent,
        label,
        description,
        defaultValue = false,
        iconColor = 'text-gray-400',
        requiresPublicAccount = false
      } = config

      const isDisabled = requiresPublicAccount && !publicAccountValue

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
    [control, handleToggleChange, publicAccountValue]
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
    notificationsEmailEnabled,
    notificationsPhoneEnabled,
    notificationsMatchesEnabled,
    notificationsEventsEnabled,
    notificationsLoginEnabled,
    notificationsPaymentsEnabled
  ])

  return (
    <div className='space-y-6'>
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

          <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Settings className='w-4 h-4 text-gray-300' />
              <span className='text-sm font-medium text-gray-300'>Notificaciones activas</span>
            </div>
            {notificationSummaryChips.length ? (
              <div className='flex flex-wrap gap-1.5 justify-center sm:justify-start'>
                {notificationSummaryChips.map(({ name, label, chipColor }) => (
                  <Chip key={name} className='text-xs' color={chipColor} size='sm' variant='flat'>
                    {label}
                  </Chip>
                ))}
              </div>
            ) : (
              <span className='text-xs text-gray-500 block text-center sm:text-left'>No tienes alertas activas.</span>
            )}
          </div>

          <div className='space-y-3'>{NOTIFICATION_SWITCH_CONFIG.map(config => renderEnhancedSwitch(config.name, config))}</div>
        </CardBody>
      </Card>

      {/* Tarjeta de Identidad del Usuario */}
      <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/60'>
        <CardBody className='p-4 sm:p-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
              <Eye className='w-5 h-5 text-green-400' />
            </div>
            <div className='text-center sm:text-left'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Vista Previa del Perfil</h3>
              <p className='text-sm text-gray-400'>Resumen de tu información personal</p>
            </div>
          </div>

          {/* Profile Identity Card */}
          <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
            {/* Avatar */}
            <div className='relative shrink-0'>
              <Avatar
                alt={`${userName} ${userLastName}`}
                className='w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600'
                src={userMainImage}
              />
              {/* Categoría badge */}
              {userInterest && (
                <div className='absolute -bottom-1 -right-1 rounded-full'>
                  <Chip
                    className='bg-primary-900/90 text-primary-300 border border-primary-500/30'
                    color='primary'
                    size='sm'
                    variant='flat'>
                    {userInterest}
                  </Chip>
                </div>
              )}
            </div>

            {/* Información Principal */}
            <div className='flex-1 text-center sm:text-left'>
              <div className='space-y-2'>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>
                  {userName && userLastName ? `${userName} ${userLastName}` : userName || userLastName || 'Sin completar'}
                </h1>

                <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-300 text-sm sm:text-base'>
                  {/* Edad */}
                  {userAge && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      <span>{userAge} años</span>
                    </div>
                  )}

                  {/* Ubicación */}
                  {userCity && userCountry && (
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4' />
                      <span className='truncate'>
                        {userCity}
                        {userLocality && `, ${userLocality}`} - {userCountry}
                      </span>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm'>
                  {/* Correo */}
                  {userEmail && (
                    <div className='flex items-center gap-2'>
                      <Mail className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-200 truncate'>{userEmail}</span>
                    </div>
                  )}

                  {/* Teléfono */}
                  {userPhone && (
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-300'>
                        {userPhoneCode} {userPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Galería de fotos miniatura */}
          {userImages.length > 1 && (
            <div className='mt-6 pt-4 border-t border-gray-700/30'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-xs font-medium text-gray-300 flex items-center gap-2'>
                  <Camera className='w-4 h-4 text-gray-400' />
                  Fotos del perfil
                </span>
                <Chip className='text-xs' color='default' size='sm' variant='flat'>
                  {userImages.length} {userImages.length === 1 ? 'foto' : 'fotos'}
                </Chip>
              </div>
              <div className='grid grid-cols-5 gap-2'>
                {userImages.slice(0, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className='aspect-square rounded-lg overflow-hidden border border-gray-700/50 hover:border-primary-500/50 transition-colors'>
                    <img alt={`Foto ${idx + 1}`} className='w-full h-full object-cover' src={img} />
                  </div>
                ))}
                {userImages.length > 5 && (
                  <div className='aspect-square rounded-lg bg-gray-700/30 border border-gray-700/50 flex items-center justify-center'>
                    <span className='text-xs text-gray-400'>+{userImages.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información complementaria en chips */}
          <div className='mt-6 pt-4 border-t border-gray-700/30'>
            <div className='flex flex-wrap gap-2 justify-center sm:justify-start'>
              {userGender && (
                <Chip className='bg-blue-500/20 text-blue-300' size='sm' startContent={<UserIcon className='w-3 h-3' />} variant='flat'>
                  {userGender}
                </Chip>
              )}
              {userMaritalStatus && (
                <Chip className='bg-pink-500/20 text-pink-300' size='sm' startContent={<Heart className='w-3 h-3' />} variant='flat'>
                  {userMaritalStatus}
                </Chip>
              )}
              {userEducation && (
                <Chip
                  className='bg-purple-500/20 text-purple-300'
                  size='sm'
                  startContent={<GraduationCap className='w-3 h-3' />}
                  variant='flat'>
                  {userEducation}
                </Chip>
              )}
              {userProfession && (
                <Chip className='bg-green-500/20 text-green-300' size='sm' startContent={<Briefcase className='w-3 h-3' />} variant='flat'>
                  {userProfession}
                </Chip>
              )}
              {userHeight && (
                <Chip className='bg-orange-500/20 text-orange-300' size='sm' startContent={<Ruler className='w-3 h-3' />} variant='flat'>
                  {userHeight} cm
                </Chip>
              )}
            </div>
          </div>

          {/* Intereses/Tags */}
          {userTags.length > 0 && (
            <div className='mt-6 pt-4 border-t border-gray-700/30'>
              <div className='flex items-center gap-2 mb-3'>
                <Sparkles className='w-4 h-4 text-purple-400' />
                <span className='text-xs font-medium text-gray-300'>Intereses</span>
                <Chip className='text-xs' color='default' size='sm' variant='flat'>
                  {userTags.length}
                </Chip>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {userTags.slice(0, 6).map((tag, idx) => (
                  <Chip key={idx} className='text-xs bg-purple-500/20 text-purple-300' size='sm' variant='flat'>
                    {tag}
                  </Chip>
                ))}
                {userTags.length > 6 && (
                  <Chip className='text-xs text-gray-300' color='default' size='sm' variant='flat'>
                    +{userTags.length - 6} más
                  </Chip>
                )}
              </div>
            </div>
          )}
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
    </div>
  )
})

StepConfiguration.displayName = 'StepConfiguration'

export default StepConfiguration
